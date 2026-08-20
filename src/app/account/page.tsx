import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatGHS } from '@/lib/utils';
import { AccountNav } from '@/components/account/account-nav';

export default async function AccountPage() {
  const session = await getAuthSession();
  if (!session) redirect('/account/login');

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { items: true },
  });

  return (
    <div className="section-padding py-12 grid md:grid-cols-[220px_1fr] gap-12">
      <AccountNav />
      <div>
        <p className="eyebrow mb-2">Welcome back</p>
        <h1 className="text-3xl mb-8">{session.user.name}</h1>

        <div className="flex items-center justify-between mb-4">
          <p className="eyebrow">Recent Orders</p>
          <Link href="/account/orders" className="text-sm underline">View all</Link>
        </div>

        {orders.length === 0 ? (
          <p className="text-ink/50">You haven't placed any orders yet.</p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {orders.map((o) => (
              <li key={o.id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{o.orderNumber}</p>
                  <p className="text-xs text-ink/50">{new Date(o.createdAt).toLocaleDateString()} · {o.items.length} item(s)</p>
                </div>
                <div className="text-right">
                  <p>{formatGHS(o.total)}</p>
                  <p className="text-xs text-ink/50">{o.status}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
