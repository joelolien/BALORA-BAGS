'use client';

import { useSession } from 'next-auth/react';
import { AccountNav } from '@/components/account/account-nav';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AccountSettingsPage() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, currentPassword, newPassword: newPassword || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Profile updated');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  }

  if (!session) return null;

  return (
    <div className="section-padding py-12 grid md:grid-cols-[220px_1fr] gap-12">
      <AccountNav />
      <div className="max-w-md">
        <p className="eyebrow mb-2">Account</p>
        <h1 className="text-3xl mb-8">Settings</h1>
        <form onSubmit={updateProfile} className="space-y-4">
          <div>
            <label className="eyebrow block mb-2">Full name</label>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="eyebrow block mb-2">Email</label>
            <input className="input-field bg-sand/50" value={session.user.email || ''} disabled />
          </div>
          <div className="pt-4 border-t border-ink/10">
            <p className="eyebrow mb-3">Change password</p>
            <input type="password" placeholder="Current password" className="input-field mb-3" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            <input type="password" placeholder="New password" className="input-field" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>
    </div>
  );
}
