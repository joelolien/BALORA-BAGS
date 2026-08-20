import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { generateSku, slugify } from '@/lib/utils';

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  const products = await prisma.product.findMany({
    where: q ? { name: { contains: q, mode: 'insensitive' } } : undefined,
    include: { images: true, category: true, colours: true, variants: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  if (!body.name || !body.categoryId || body.price == null) {
    return NextResponse.json({ error: 'Name, category and price are required.' }, { status: 400 });
  }

  let slug = slugify(body.name);
  const existingSlug = await prisma.product.findUnique({ where: { slug } });
  if (existingSlug) slug = `${slug}-${Math.floor(Math.random() * 1000)}`;

  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug,
      sku: body.sku || generateSku(),
      description: body.description || '',
      materials: body.materials,
      price: body.price,
      salePrice: body.salePrice || null,
      stock: body.stock ?? 0,
      lowStockThreshold: body.lowStockThreshold ?? 3,
      isFeatured: !!body.isFeatured,
      isBestSeller: !!body.isBestSeller,
      isNewArrival: body.isNewArrival ?? true,
      isActive: body.isActive ?? true,
      isCustomOrder: !!body.isCustomOrder,
      categoryId: body.categoryId,
      images: {
        create: (body.images || []).map((url: string, i: number) => ({ url, sortOrder: i })),
      },
      colours: {
        create: (body.colours || []).map((c: { name: string; hex: string }) => c),
      },
      variants: {
        create: (body.variants || []).map((v: { name: string; value: string; stock: number }) => v),
      },
    },
    include: { images: true, colours: true, variants: true },
  });

  return NextResponse.json(product, { status: 201 });
}
