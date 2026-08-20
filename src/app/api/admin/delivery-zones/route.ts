import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const zones = await prisma.deliveryZone.findMany({ orderBy: [{ region: 'asc' }, { city: 'asc' }] });
  return NextResponse.json(zones);
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  if (!body.region || !body.city || body.fee == null) {
    return NextResponse.json({ error: 'Region, city and fee are required.' }, { status: 400 });
  }

  const zone = await prisma.deliveryZone.upsert({
    where: { region_city: { region: body.region, city: body.city } },
    create: {
      region: body.region,
      city: body.city,
      fee: body.fee,
      estimatedDays: body.estimatedDays || '1-3 working days',
      isPickupAvailable: !!body.isPickupAvailable,
      isActive: body.isActive ?? true,
    },
    update: {
      fee: body.fee,
      estimatedDays: body.estimatedDays,
      isPickupAvailable: body.isPickupAvailable,
      isActive: body.isActive,
    },
  });

  return NextResponse.json(zone, { status: 201 });
}
