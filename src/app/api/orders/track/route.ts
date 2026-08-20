import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { orderNumber, contact } = await req.json();
  if (!orderNumber || !contact) {
    return NextResponse.json({ error: 'Order number and email or phone are required.' }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber: orderNumber.trim() },
    include: { items: true, payment: true },
  });

  const contactLower = contact.trim().toLowerCase();
  const matches =
    order &&
    (order.customerEmail.toLowerCase() === contactLower || order.customerPhone.replace(/\s/g, '') === contact.replace(/\s/g, ''));

  if (!matches) {
    return NextResponse.json({ error: 'We could not find an order matching those details.' }, { status: 404 });
  }

  return NextResponse.json({ order });
}
