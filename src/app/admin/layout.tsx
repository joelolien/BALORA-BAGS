import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  if (!session) redirect('/account/login?callbackUrl=/admin');

  return (
    <div className="min-h-screen bg-paper grid md:grid-cols-[240px_1fr]">
      <AdminSidebar />
      <div className="p-6 md:p-10">{children}</div>
    </div>
  );
}
