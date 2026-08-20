import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="section-padding py-32 text-center">
      <p className="eyebrow mb-3">Not Found</p>
      <h1 className="text-3xl mb-6">We couldn't find that bag</h1>
      <p className="text-ink/60 mb-8">It may have sold out or the link may be incorrect.</p>
      <Link href="/shop" className="btn-primary">Browse All Bags</Link>
    </div>
  );
}
