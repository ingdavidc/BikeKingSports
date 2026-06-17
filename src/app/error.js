'use client';

export default function Error({ error, reset }) {
  return (
    <div style={{ padding: '40px', backgroundColor: 'white', color: 'red', fontFamily: 'monospace' }}>
      <h2>¡Error de App Router (Client Boundary)!</h2>
      <p><b>Mensaje:</b> {error.message}</p>
      <p><b>Stack:</b> {error.stack}</p>
      <button onClick={() => reset()}>Reintentar</button>
    </div>
  );
}
