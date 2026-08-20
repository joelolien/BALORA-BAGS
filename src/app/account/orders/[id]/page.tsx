import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatGHS } from '@/lib/utils';
import { AccountNav } from '@/components/account/account-nav';

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session) redirect('/account/login');

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, payment: true },
  });

  if (!order || order.userId !== session.user.id) notFound();

  return (
    <div className="section-padding py-12 grid md:grid-cols-[220px_1fr] gap-12">
      <AccountNav />
      <div>
        <Link href="/account/orders" className="text-sm underline mb-6 inline-block">
          ← Back to orders
        </Link>
        <p className="eyebrow mb-2">Order</p>
        <h1 className="text-3xl mb-2">{order.orderNumber}</h1>
        <p className="text-ink/50 text-sm mb-8">
          Placed {new Date(order.createdAt).toLocaleDateString()} · Status: {order.status.replace(/_/g, ' ')} · Payment: {order.paymentStatus}
        </p>

        <div className="grid sm:grid-cols-2 gap-8 mb-10">
          <div>
            <p className="eyebrow mb-2">Delivery Address</p>
            <p className="text-sm">{order.deliveryAddress}</p>
            <p className="text-sm">{order.city}, {order.region}</p>
          </div>
          <div>
            <p className="eyebrow mb-2">Order Total</p>
            <div className="text-sm space-y-1">
              <div className="flex justify-between max-w-xs"><span>Subtotal</span><span>{formatGHS(order.subtotal)}</span></div>
              <div className="flex justify-between max-w-xs"><span>Delivery</span><span>{formatGHS(order.deliveryFee)}</span></div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between max-w-xs"><span>Discount</span><span>-{formatGHS(order.discountAmount)}</span></div>
              )}
              <div className="flex justify-between max-w-xs font-medium"><span>Total</span><span>{formatGHS(order.total)}</span></div>
            </div>
          </div>
        </div>

        <p className="eyebrow mb-3">Items</p>
        <ul className="divide-y divide-ink/10 mb-8">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-3 text-sm">
              <span>{item.quantity} × {item.productName}{item.colour ? ` (${item.colour})` : ''}</span>
              <span>{formatGHS(Number(item.unitPrice) * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <Link href={`/track-order?order=${order.orderNumber}`} className="btn-secondary">
          View Order Tracking
        </Link>
      </div>
    </div>
  );
}
