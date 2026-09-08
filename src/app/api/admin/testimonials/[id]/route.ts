import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const testimonial = await prisma.testimonial.update({
      where: { id: params.id },
      data: {
        customerName: body.customerName,
        location: body.location,
        quote: body.quote,
        isActive: body.isActive,
      },
    });
    return NextResponse.json(testimonial);
  } catch (err: any) {
    console.error('Update testimonial error:', err);
    return NextResponse.json({ error: err?.message || 'Could not update testimonial.' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await prisma.testimonial.delete({ where: { id: params.id } });
    return NextResponse.json({ deleted: true });
  } catch (err: any) {
    console.error('Delete testimonial error:', err);
    return NextResponse.json({ error: err?.message || 'Could not delete testimonial.' }, { status: 400 });
  }
}
