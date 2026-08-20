import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { sendOrderStatusUpdateEmail } from '@/lib/email';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } }, payment: true, user: true },
  });
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true } });
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const data: any = {};
  if (body.status) data.status = body.status;
  if (body.deliveryAddress) data.deliveryAddress = body.deliveryAddress;
  if (body.city) data.city = body.city;
  if (body.region) data.region = body.region;
  if (body.deliveryNotes !== undefined) data.deliveryNotes = body.deliveryNotes;

  // Cancelling an order restocks inventory, since the units are no longer reserved.
  if (body.status === 'CANCELLED' && order.status !== 'CANCELLED') {
    await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data }),
      ...order.items.map((item) =>
        prisma.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } })
      ),
    ]);
  } else {
    await prisma.order.update({ where: { id: order.id }, data });
  }

  if (body.status && body.status !== order.status) {
    sendOrderStatusUpdateEmail(order.customerEmail, order.orderNumber, body.status).catch(() => {});
  }

  const updated = await prisma.order.findUnique({ where: { id: order.id }, include: { items: true, payment: true } });
  return NextResponse.json(updated);
}
