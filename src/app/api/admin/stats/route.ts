import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [totalRevenueAgg, orderCount, pendingOrders, completedOrders, customerCount, productCount, recentOrders, paidOrders] =
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
    ]);

  // Low-stock via raw filter fallback (Prisma can't compare two columns directly in all versions).
  const allActive = await prisma.product.findMany({ where: { isActive: true } });
  const lowStock = allActive.filter((p) => p.stock <= p.lowStockThreshold && p.stock > 0);
  const outOfStock = allActive.filter((p) => p.stock === 0);

  // Group revenue by month for the chart.
  const revenueByMonth: Record<string, number> = {};
  for (const o of paidOrders) {
    const key = o.createdAt.toISOString().slice(0, 7);
    revenueByMonth[key] = (revenueByMonth[key] || 0) + Number(o.total);
  }
  const chartData = Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue }));

  return NextResponse.json({
    totalRevenue: Number(totalRevenueAgg._sum.total || 0),
    orderCount,
    pendingOrders,
    completedOrders,
    customerCount,
    productCount,
    lowStock,
    outOfStock,
    recentOrders,
    chartData,
  });
}
