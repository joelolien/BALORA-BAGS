'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      toast.error('Incorrect email or password.');
      return;
    }
    toast.success('Welcome back!');
    router.push('/account');
    router.refresh();
  }

  return (
    <div className="section-padding py-20 max-w-sm mx-auto">
      <p className="eyebrow mb-2">Account</p>
      <h1 className="text-3xl mb-8">Sign in</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" required placeholder="Email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" required placeholder="Password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Signing in...' : 'Sign In'}</button>
      </form>
      <div className="flex justify-between text-sm mt-5 text-ink/60">
        <Link href="/account/forgot-password" className="underline">Forgot password?</Link>
        <Link href="/account/register" className="underline">Create account</Link>
      </div>
    </div>
  );
}
