'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" style={{ padding: 16 }}>
      <p>Ha ocurrido un error cargando los datos.</p>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{error.message}</pre>
      <button onClick={reset}>Reintentar</button>
    </div>
  );
}
