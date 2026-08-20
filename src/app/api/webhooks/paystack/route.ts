import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPaystackWebhookSignature } from '@/lib/paystack';
import { sendPaymentSuccessEmail } from '@/lib/email';

// Paystack webhooks are the source of truth for payment status — more
// reliable than the client-side redirect, since it fires even if the
// customer closes their browser before the callback page loads.
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-paystack-signature');

  if (!verifyPaystackWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === 'charge.success') {
    const reference = event.data.reference as string;

    const order = await prisma.order.findUnique({ where: { orderNumber: reference } });
    if (!order) return NextResponse.json({ received: true });

    // Idempotency guard — webhooks can be delivered more than once.
    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({ received: true });
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
      }),
      prisma.payment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          reference,
          amount: order.total,
          status: 'PAID',
          channel: event.data.channel,
          verifiedAt: new Date(),
          rawResponse: event.data,
        },
        update: {
          status: 'PAID',
          channel: event.data.channel,
          verifiedAt: new Date(),
          rawResponse: event.data,
        },
      }),
    ]);

    sendPaymentSuccessEmail(order.customerEmail, order.orderNumber).catch(() => {});
  }

  return NextResponse.json({ received: true });
}
