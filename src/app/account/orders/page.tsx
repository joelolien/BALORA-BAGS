import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatGHS } from '@/lib/utils';
import { AccountNav } from '@/components/account/account-nav';

export default async function OrdersPage() {
  const session = await getAuthSession();
  if (!session) redirect('/account/login');

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  return (
    <div className="section-padding py-12 grid md:grid-cols-[220px_1fr] gap-12">
      <AccountNav />
      <div>
        <p className="eyebrow mb-2">Account</p>
        <h1 className="text-3xl mb-8">Your Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-ink/50 mb-4">You haven't placed any orders yet.</p>
            <Link href="/shop" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <ul className="divide-y divide-ink/10">
            {orders.map((o) => (
              <li key={o.id} className="py-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{o.orderNumber}</p>
                  <p className="text-xs text-ink/50">
                    {new Date(o.createdAt).toLocaleDateString()} · {o.items.length} item(s) · {o.paymentStatus}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p>{formatGHS(o.total)}</p>
                    <p className="text-xs text-ink/50">{o.status.replace(/_/g, ' ')}</p>
                  </div>
                  <Link href={`/account/orders/${o.id}`} className="text-sm underline">
                    View
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
