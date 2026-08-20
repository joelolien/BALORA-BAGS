import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPaystackTransaction } from '@/lib/paystack';
import { sendPaymentSuccessEmail } from '@/lib/email';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get('order');
  if (!orderNumber) return NextResponse.json({ error: 'Missing order reference.' }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { orderNumber }, include: { payment: true, items: true } });
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

  // Already verified (e.g. webhook beat us to it) — just return current state.
  if (order.paymentStatus === 'PAID') {
    return NextResponse.json({ status: 'PAID', order });
  }

  try {
    const verification = await verifyPaystackTransaction(orderNumber);
    const paystackStatus = verification.data.status;

    const newStatus = paystackStatus === 'success' ? 'PAID' : paystackStatus === 'abandoned' ? 'CANCELLED' : 'FAILED';

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: newStatus,
          status: newStatus === 'PAID' ? 'CONFIRMED' : order.status,
        },
      }),
      prisma.payment.update({
        where: { orderId: order.id },
        data: {
          status: newStatus,
          channel: verification.data.channel,
          verifiedAt: new Date(),
          rawResponse: verification.data as any,
        },
      }),
    ]);

    if (newStatus === 'PAID') {
      sendPaymentSuccessEmail(order.customerEmail, order.orderNumber).catch(() => {});
    }

    return NextResponse.json({ status: newStatus, order });
  } catch (err: any) {
    console.error('Payment verification error:', err);
    return NextResponse.json({ error: 'Could not verify payment right now.' }, { status: 500 });
  }
}
