import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const category = await prisma.category.update({
    where: { id: params.id },
    data: {
      name: body.name,
      description: body.description,
      imageUrl: body.imageUrl,
      sortOrder: body.sortOrder,
      isActive: body.isActive,
    },
  });
  return NextResponse.json(category);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const inUse = await prisma.product.findFirst({ where: { categoryId: params.id } });
  if (inUse) {
    await prisma.category.update({ where: { id: params.id }, data: { isActive: false } });
    return NextResponse.json({ deactivated: true });
  }
  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ deleted: true });
}
