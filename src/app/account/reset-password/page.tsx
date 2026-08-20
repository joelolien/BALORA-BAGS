'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid or missing reset token.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Password updated. Please sign in.');
      router.push('/account/login');
    } catch (err: any) {
      toast.error(err.message || 'Could not reset password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-padding py-20 max-w-sm mx-auto">
      <p className="eyebrow mb-2">Account</p>
      <h1 className="text-3xl mb-8">Set a new password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="password" required minLength={8} placeholder="New password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Saving...' : 'Save New Password'}</button>
      </form>
    </div>
  );
}
