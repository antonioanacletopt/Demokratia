'use client';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html>
      <body style={{ fontFamily: 'monospace', padding: '2rem', background: '#1a1a1a', color: '#ff4444' }}>
        <h1>Runtime Error</h1>
        <pre style={{ background: '#000', padding: '1rem', borderRadius: '4px', color: '#ff8888', overflow: 'auto' }}>
          {error.name}: {error.message}
          {'\n\n'}
          {error.stack}
          {error.digest ? `\n\nDigest: ${error.digest}` : ''}
        </pre>
      </body>
    </html>
  );
}
