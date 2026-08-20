'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      toast.success('Account created!');
      router.push('/account');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-padding py-20 max-w-sm mx-auto">
      <p className="eyebrow mb-2">Account</p>
      <h1 className="text-3xl mb-8">Create your account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required placeholder="Full name" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input type="email" required placeholder="Email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Phone number" className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input type="password" required placeholder="Password (min. 8 characters)" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating account...' : 'Create Account'}</button>
      </form>
      <p className="text-sm text-ink/60 mt-5">
        Already have an account? <Link href="/account/login" className="underline">Sign in</Link>
      </p>
      <p className="text-xs text-ink/40 mt-8 text-center">
        Prefer not to create an account? You can also{' '}
        <Link href="/shop" className="underline">checkout as a guest</Link>.
      </p>
    </div>
  );
}
