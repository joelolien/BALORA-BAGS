import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    include: { orders: { where: { paymentStatus: 'PAID' } } },
    orderBy: { createdAt: 'desc' },
  });

  const shaped = customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    createdAt: c.createdAt,
    orderCount: c.orders.length,
    totalSpent: c.orders.reduce((sum, o) => sum + Number(o.total), 0),
  }));

  return NextResponse.json(shaped);
}
