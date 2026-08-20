import { prisma } from '@/lib/prisma';
import { formatGHS } from '@/lib/utils';
import { RevenueChart } from '@/components/admin/revenue-chart';
import Link from 'next/link';

async function getStats() {
  const [totalRevenueAgg, orderCount, pendingOrders, completedOrders, customerCount, productCount, recentOrders, paidOrders, allActive] =
    await Promise.all([
      prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { total: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING'] } } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 8, include: { items: true } }),
      prisma.order.findMany({
        where: { paymentStatus: 'PAID' },
        select: { total: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.product.findMany({ where: { isActive: true } }),
    ]);

  const lowStock = allActive.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold);
  const outOfStock = allActive.filter((p) => p.stock === 0);

  const revenueByMonth: Record<string, number> = {};
  for (const o of paidOrders) {
    const key = o.createdAt.toISOString().slice(0, 7);
    revenueByMonth[key] = (revenueByMonth[key] || 0) + Number(o.total);
  }
  const chartData = Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue }));

  return {
    totalRevenue: Number(totalRevenueAgg._sum.total || 0),
    orderCount, pendingOrders, completedOrders, customerCount, productCount,
    lowStock, outOfStock, recentOrders, chartData,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: 'Total Revenue', value: formatGHS(stats.totalRevenue) },
    { label: 'Total Orders', value: stats.orderCount },
    { label: 'Pending Orders', value: stats.pendingOrders },
    { label: 'Completed Orders', value: stats.completedOrders },
    { label: 'Customers', value: stats.customerCount },
    { label: 'Active Products', value: stats.productCount },
  ];

  return (
    <div>
      <h1 className="text-3xl font-display mb-8">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="bg-cream border border-ink/10 p-5">
            <p className="text-xs uppercase tracking-wide text-ink/50 mb-2">{c.label}</p>
            <p className="text-2xl font-display">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 mb-10">
        <div className="bg-cream border border-ink/10 p-6">
          <p className="text-sm font-medium mb-4">Revenue Over Time</p>
          <RevenueChart data={stats.chartData} />
        </div>

        <div className="bg-cream border border-ink/10 p-6">
          <p className="text-sm font-medium mb-4">Inventory Alerts</p>
          {stats.outOfStock.length === 0 && stats.lowStock.length === 0 ? (
            <p className="text-sm text-ink/50">All products are well stocked.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {stats.outOfStock.map((p) => (
                <li key={p.id} className="flex justify-between">
                  <span>{p.name}</span>
                  <span className="text-red-600">Out of stock</span>
                </li>
              ))}
              {stats.lowStock.map((p) => (
                <li key={p.id} className="flex justify-between">
                  <span>{p.name}</span>
                  <span className="text-clay-dark">{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/products" className="text-xs underline mt-4 inline-block">Manage products</Link>
        </div>
      </div>

      <div className="bg-cream border border-ink/10 p-6">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-medium">Recent Orders</p>
          <Link href="/admin/orders" className="text-xs underline">View all</Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink/50 border-b border-ink/10">
              <th className="py-2 font-normal">Order</th>
              <th className="py-2 font-normal">Status</th>
              <th className="py-2 font-normal">Payment</th>
              <th className="py-2 font-normal text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentOrders.map((o) => (
              <tr key={o.id} className="border-b border-ink/5">
                <td className="py-3">
                  <Link href={`/admin/orders/${o.id}`} className="underline">{o.orderNumber}</Link>
                </td>
                <td className="py-3">{o.status.replace(/_/g, ' ')}</td>
                <td className="py-3">{o.paymentStatus}</td>
                <td className="py-3 text-right">{formatGHS(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
