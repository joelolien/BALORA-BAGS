import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });

  const category = await prisma.category.create({
    data: {
      name: body.name,
      slug: slugify(body.name),
      description: body.description,
      imageUrl: body.imageUrl,
      sortOrder: body.sortOrder || 0,
      isActive: body.isActive ?? true,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
