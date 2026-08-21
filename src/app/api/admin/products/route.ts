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

  try {
    const body = await req.json();
    if (!body.name || !body.categoryId || body.price === '' || body.price == null) {
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
        price: Number(body.price),
        salePrice: body.salePrice === '' || body.salePrice == null ? null : Number(body.salePrice),
        stock: body.stock === '' || body.stock == null ? 0 : Number(body.stock),
        lowStockThreshold:
          body.lowStockThreshold === '' || body.lowStockThreshold == null ? 3 : Number(body.lowStockThreshold),
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
  } catch (err: any) {
    console.error('Create product error:', err);
    return NextResponse.json(
      { error: err?.message || 'Could not create product. Please check the form values and try again.' },
      { status: 400 }
    );
  }
}
