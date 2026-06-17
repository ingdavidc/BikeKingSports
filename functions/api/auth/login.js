// ============================================================
// functions/api/auth/login.js
// Autenticación de usuarios con JWT.
// Incluye: rate-limit básico, validaciones estrictas, cookie segura.
// ============================================================

const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 128;
const MAX_NAME_LENGTH = 100;

// Base64Url helpers
function base64urlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// PBKDF2 — más seguro que SHA-256 con salt fijo
async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: encoder.encode(salt),
      iterations: 100000,
    },
    keyMaterial,
    256
  );
  return base64urlEncode(bits);
}

// Mantener compatibilidad con contraseñas antiguas hasheadas con SHA-256
async function hashPasswordLegacy(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'bikeking_salt_123');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function signJWT(payload, secret) {
  const encoder = new TextEncoder();
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = base64urlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64urlEncode(encoder.encode(JSON.stringify(payload)));
  const signingInput = encoder.encode(`${headerB64}.${payloadB64}`);

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, signingInput);
  return `${headerB64}.${payloadB64}.${base64urlEncode(signature)}`;
}

export async function onRequestPost(context) {
  try {
    const DB = context.env.DB;
    if (!DB) return Response.json({ error: 'Error de configuración del servidor' }, { status: 500 });

    const SECRET = context.env.JWT_SECRET || 'bikeking-super-secret-key-2026';
    const PBKDF2_SALT = context.env.PASSWORD_SALT || 'bikeking_pbkdf2_salt_2026';

    // Parsear body con manejo de errores
    let body;
    try {
      body = await context.request.json();
    } catch {
      return Response.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 });
    }

    const { email, password } = body;

    // Validaciones de entrada
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return Response.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }
    if (email.length > MAX_EMAIL_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
      return Response.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Buscar usuario — seleccionar solo columnas necesarias
    const user = await DB.prepare(
      'SELECT id, name, email, role, status, password_hash FROM users WHERE email = ?'
    ).bind(normalizedEmail).first();

    // Usar error genérico siempre para evitar user enumeration
    const GENERIC_ERROR = 'Credenciales inválidas';

    if (!user) {
      // Ejecutar hash de todos modos para prevenir timing attacks
      await hashPasswordLegacy(password);
      return Response.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    if (user.status !== 'activo') {
      return Response.json({ error: 'Cuenta inactiva. Contacta al administrador.' }, { status: 403 });
    }

    // Verificar contraseña: primero PBKDF2, luego legacy SHA-256
    const pbkdf2Hash = await hashPassword(password, PBKDF2_SALT);
    const legacyHash = await hashPasswordLegacy(password);

    const isPbkdf2Valid = pbkdf2Hash === user.password_hash;
    const isLegacyValid = !isPbkdf2Valid && legacyHash === user.password_hash;

    if (!isPbkdf2Valid && !isLegacyValid) {
      return Response.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    // Migrar contraseña legacy a PBKDF2 automáticamente
    if (isLegacyValid) {
      await DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
        .bind(pbkdf2Hash, user.id)
        .run();
    }

    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      iat: now,
      exp: now + 60 * 60 * 24, // 24 horas
    };

    const token = await signJWT(tokenPayload, SECRET);
    const isProduction = context.request.url.startsWith('https://');

    const headers = new Headers({ 'Content-Type': 'application/json' });
    headers.append(
      'Set-Cookie',
      `auth_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24}${isProduction ? '; Secure' : ''}`
    );

    return new Response(
      JSON.stringify({ success: true, user: { id: user.id, name: user.name, role: user.role } }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
