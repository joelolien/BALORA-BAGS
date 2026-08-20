import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="section-padding py-32 text-center">
      <p className="eyebrow mb-3">404</p>
      <h1 className="text-4xl mb-6">Page not found</h1>
      <p className="text-ink/60 mb-8">The page you're looking for doesn't exist or has moved.</p>
      <Link href="/" className="btn-primary">Back to Home</Link>
    </div>
  );
}
