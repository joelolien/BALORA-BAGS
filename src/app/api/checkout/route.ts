import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { priceCart, validatePromoCode, type CartLine } from '@/lib/pricing';
import { generateOrderNumber } from '@/lib/utils';
import { initializePaystackTransaction } from '@/lib/paystack';
import { getAuthSession } from '@/lib/auth';
import { sendOrderConfirmationEmail } from '@/lib/email';

const checkoutSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(9, 'Enter a valid WhatsApp number'),
  paymentMethod: z.enum(['paystack', 'bank_transfer']),
  promoCode: z.string().optional(),
  lines: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
        colour: z.string().optional(),
        variantInfo: z.string().optional(),
      })
    )
    .min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }
    const data = parsed.data;
    const session = await getAuthSession();

    // 1. Re-price everything server-side. Never trust amounts from the client.
    // No delivery fee is charged here — delivery is arranged manually via
    // Yango after the order is confirmed, coordinated over WhatsApp.
    const { items, subtotal } = await priceCart(data.lines as CartLine[]);
    const deliveryFee = 0;

    let discountAmount = 0;
    let promoCodeId: string | undefined;
    if (data.promoCode) {
      const promoResult = await validatePromoCode(data.promoCode, subtotal);
      if (!promoResult.valid) {
        return NextResponse.json({ error: promoResult.message }, { status: 400 });
      }
      discountAmount = promoResult.discountAmount;
      promoCodeId = promoResult.promo.id;
    }

    const total = Math.max(0, subtotal + deliveryFee - discountAmount);
    const orderNumber = generateOrderNumber();

    // 2. Create the order + items + decrement stock atomically.
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.user?.id,
          customerName: data.customerName,
          customerEmail: data.customerEmail.toLowerCase().trim(),
          customerPhone: data.customerPhone,
          subtotal,
          deliveryFee,
          discountAmount,
          total,
          promoCodeId,
          paymentStatus: data.paymentMethod === 'paystack' ? 'PENDING' : 'PENDING',
          items: {
            create: items.map((i) => ({
              productId: i.product.id,
              productName: i.product.name,
              colour: i.colour,
              variantInfo: i.variantInfo,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
            })),
          },
        },
      });

      // Reduce stock and guard against overselling with a conditional update.
      for (const item of items) {
        const result = await tx.product.updateMany({
          where: { id: item.product.id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (result.count === 0) {
          throw new Error(`"${item.product.name}" no longer has enough stock.`);
        }
      }

      if (promoCodeId) {
        await tx.promoCode.update({ where: { id: promoCodeId }, data: { usageCount: { increment: 1 } } });
      }

      return created;
    });

    sendOrderConfirmationEmail(
      order.customerEmail,
      order.orderNumber,
      `GHS ${total.toFixed(2)}`,
      `<ul>${items.map((i) => `<li>${i.quantity} × ${i.product.name}</li>`).join('')}</ul>`
    ).catch(() => {});

    // 3. Cash on delivery / bank transfer: order is created, no online payment needed yet.
    if (data.paymentMethod !== 'paystack') {
      return NextResponse.json({ orderNumber: order.orderNumber, redirectUrl: null });
    }

    // 4. Card / Mobile Money via Paystack: initialize and return the checkout URL.
    const amountInPesewas = Math.round(total * 100);
    const init = await initializePaystackTransaction({
      email: order.customerEmail,
      amountInPesewas,
      reference: order.orderNumber,
      callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?order=${order.orderNumber}`,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        reference: order.orderNumber,
        amount: total,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ orderNumber: order.orderNumber, redirectUrl: init.data.authorization_url });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: err.message || 'Checkout failed. Please try again.' }, { status: 400 });
  }
}
