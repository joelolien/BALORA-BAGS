'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <div style={{ padding: '6rem 1.5rem', textAlign: 'center', fontFamily: 'system-ui' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B9704A' }}>
            Something went wrong
          </p>
          <h1 style={{ fontSize: '2rem', margin: '1rem 0' }}>We hit a snag</h1>
          <p style={{ color: '#6b6459', marginBottom: '2rem' }}>
            Please try again, or contact us on WhatsApp if the problem continues.
          </p>
          <button
            onClick={reset}
            style={{ background: '#3E4A37', color: '#F6F1E7', padding: '0.9rem 1.75rem', border: 'none', cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
