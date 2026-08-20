import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const codes = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(codes);
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  if (!body.code || !body.discountType || body.discountValue == null) {
    return NextResponse.json({ error: 'Code, type and value are required.' }, { status: 400 });
  }

  const existing = await prisma.promoCode.findUnique({ where: { code: body.code.toUpperCase() } });
  if (existing) return NextResponse.json({ error: 'This code already exists.' }, { status: 409 });

  const promo = await prisma.promoCode.create({
    data: {
      code: body.code.toUpperCase().trim(),
      discountType: body.discountType,
      discountValue: body.discountValue,
      minOrderValue: body.minOrderValue || 0,
      usageLimit: body.usageLimit || null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      isActive: body.isActive ?? true,
    },
  });

  return NextResponse.json(promo, { status: 201 });
}
