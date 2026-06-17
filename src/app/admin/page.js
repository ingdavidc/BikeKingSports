export const runtime = 'edge';


export default function AdminDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Panel de Administración</h1>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>Bienvenido al sistema de gestión de Bike King.</p>
      
      <div style={{ padding: '20px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>✅ Base de Datos Conectada</h3>
        <p>Tu sistema está conectado exitosamente a Cloudflare D1 y R2. Ya puedes empezar a gestionar el contenido de tu web desde las pestañas laterales.</p>
      </div>
    </div>
  );
}

