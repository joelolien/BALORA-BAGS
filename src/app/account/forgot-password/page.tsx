'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-padding py-20 max-w-sm mx-auto">
      <p className="eyebrow mb-2">Account</p>
      <h1 className="text-3xl mb-8">Reset your password</h1>
      {sent ? (
        <p className="text-ink/70">If an account exists for that email, we've sent a reset link.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required placeholder="Email address" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send Reset Link'}</button>
        </form>
      )}
    </div>
  );
}
