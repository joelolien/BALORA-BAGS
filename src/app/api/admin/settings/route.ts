import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const settings =
    (await prisma.storeSettings.findUnique({ where: { id: 'singleton' } })) ??
    (await prisma.storeSettings.create({ data: { id: 'singleton' } }));
  return NextResponse.json(settings);
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const settings = await prisma.storeSettings.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', ...body },
    update: body,
  });
  return NextResponse.json(settings);
}
