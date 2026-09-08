import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const testimonials = await prisma.testimonial.findMany({ orderBy: { sortOrder: 'asc' } });
  return NextResponse.json(testimonials);
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    if (!body.customerName || !body.quote) {
      return NextResponse.json({ error: 'Customer name and quote are required.' }, { status: 400 });
    }

    const count = await prisma.testimonial.count();
    const testimonial = await prisma.testimonial.create({
      data: {
        customerName: body.customerName,
        location: body.location || null,
        quote: body.quote,
        isActive: body.isActive ?? true,
        sortOrder: count,
      },
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch (err: any) {
    console.error('Create testimonial error:', err);
    return NextResponse.json({ error: err?.message || 'Could not add testimonial.' }, { status: 400 });
  }
}
