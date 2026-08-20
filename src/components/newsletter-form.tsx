'use client';

import { toast } from 'sonner';

export function NewsletterForm() {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("You're on the list — thanks for signing up!");
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md mx-auto">
      <input type="email" required placeholder="Email address" className="input-field" />
      <button type="submit" className="btn-primary shrink-0">
        Subscribe
      </button>
    </form>
  );
}
