import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.fullName || !body.phone || !body.addressLine || !body.city || !body.region) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  if (body.isDefault) {
    await prisma.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
  }

  const address = await prisma.address.create({
    data: {
      userId: session.user.id,
      label: body.label || 'Home',
      fullName: body.fullName,
      phone: body.phone,
      addressLine: body.addressLine,
      city: body.city,
      region: body.region,
      isDefault: !!body.isDefault,
    },
  });

  return NextResponse.json(address, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  await prisma.address.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
