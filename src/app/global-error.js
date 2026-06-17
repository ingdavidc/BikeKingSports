'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div style={{ padding: '40px', backgroundColor: 'black', color: 'lime', fontFamily: 'monospace' }}>
          <h2>¡Global Error Catch!</h2>
          <p><b>Mensaje:</b> {error.message}</p>
          <p><b>Stack:</b> {error.stack}</p>
          <button onClick={() => reset()}>Reintentar</button>
        </div>
      </body>
    </html>
  );
}
