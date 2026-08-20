import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: 'Please sign in to leave a review.' }, { status: 401 });

  const { productId, rating, comment } = await req.json();
  if (!productId || !rating || !comment) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  // Verify the user actually purchased and received this product before allowing a review.
  const purchase = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { userId: session.user.id, status: 'DELIVERED' },
    },
    include: { order: true },
  });

  if (!purchase) {
    return NextResponse.json(
      { error: 'You can only review products from delivered orders.' },
      { status: 403 }
    );
  }

  const review = await prisma.review.upsert({
    where: {
      productId_userId_orderId: { productId, userId: session.user.id, orderId: purchase.orderId },
    },
    create: {
      productId,
      userId: session.user.id,
      orderId: purchase.orderId,
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment,
    },
    update: { rating: Math.min(5, Math.max(1, Number(rating))), comment },
  });

  return NextResponse.json(review, { status: 201 });
}
