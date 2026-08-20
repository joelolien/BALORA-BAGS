'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string };
}

export function ReviewsSection({ productId, reviews }: { productId: string; reviews: Review[] }) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Review submitted — thank you!');
      setComment('');
    } catch (err: any) {
      toast.error(err.message || 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-24 max-w-2xl">
      <p className="eyebrow mb-3">Reviews</p>
      <h2 className="text-3xl mb-8">What customers are saying</h2>

      {reviews.length === 0 ? (
        <p className="text-ink/50 mb-10">No reviews yet — be the first to share your thoughts.</p>
      ) : (
        <ul className="space-y-6 mb-10">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-ink/10 pb-6">
              <div className="flex items-center gap-1 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < r.rating ? 'fill-clay text-clay' : 'text-ink/20'} />
                ))}
              </div>
              <p className="text-sm text-ink/80 mb-1">{r.comment}</p>
              <p className="text-xs text-ink/40">
                {r.user.name} · {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      {session ? (
        <form onSubmit={submitReview} className="space-y-4">
          <div>
            <p className="eyebrow mb-2">Your rating</p>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button type="button" key={i} onClick={() => setRating(i + 1)}>
                  <Star size={22} className={i < rating ? 'fill-clay text-clay' : 'text-ink/20'} />
                </button>
              ))}
            </div>
          </div>
          <textarea
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product"
            className="input-field min-h-[100px]"
          />
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
          <p className="text-xs text-ink/40">Only verified purchasers of this product can leave a review.</p>
        </form>
      ) : (
        <p className="text-sm text-ink/50">
          Please <a href="/account/login" className="underline">sign in</a> to leave a review.
        </p>
      )}
    </section>
  );
}
