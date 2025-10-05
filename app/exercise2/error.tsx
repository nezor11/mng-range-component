'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" style={{ padding: 16, maxWidth: 560 }}>
      <h3>Ha ocurrido un error cargando los datos</h3>
      <p style={{ color: '#666' }}>{error.message}</p>
      <button onClick={reset} style={{ marginTop: 8 }}>Reintentar</button>
    </div>
  );
}
