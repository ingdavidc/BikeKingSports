export default function AdminDashboard() {
  return (
    <div>
      <h1>Panel de Administración</h1>
      <p>Bienvenido al sistema de gestión de Bike King.</p>
      
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#e2e8f0', borderRadius: '8px' }}>
        <h3>⚠️ Conexión a Base de Datos Requerida</h3>
        <p>Para que este panel funcione y pueda guardar productos reales, necesitamos conectar el proyecto a Firebase.</p>
      </div>
    </div>
  );
}
