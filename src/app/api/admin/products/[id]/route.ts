import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        materials: body.materials,
        price: body.price === '' || body.price == null ? undefined : Number(body.price),
        salePrice: body.salePrice === '' || body.salePrice == null ? null : Number(body.salePrice),
        stock: body.stock === '' || body.stock == null ? undefined : Number(body.stock),
        lowStockThreshold:
          body.lowStockThreshold === '' || body.lowStockThreshold == null
            ? undefined
            : Number(body.lowStockThreshold),
        isFeatured: body.isFeatured,
        isBestSeller: body.isBestSeller,
        isNewArrival: body.isNewArrival,
        isActive: body.isActive,
        isCustomOrder: body.isCustomOrder,
        categoryId: body.categoryId || undefined,
        ...(body.images
          ? {
              images: {
                deleteMany: {},
                create: body.images.map((url: string, i: number) => ({ url, sortOrder: i })),
              },
            }
          : {}),
        ...(body.colours
          ? {
              colours: {
                deleteMany: {},
                create: body.colours,
              },
            }
          : {}),
        ...(body.variants
          ? {
              variants: {
                deleteMany: {},
                create: body.variants,
              },
            }
          : {}),
      },
      include: { images: true, colours: true, variants: true },
    });

    return NextResponse.json(product);
  } catch (err: any) {
    console.error('Update product error:', err);
    return NextResponse.json(
      { error: err?.message || 'Could not update product. Please check the form values and try again.' },
      { status: 400 }
    );
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    // Soft-disable rather than hard delete when the product has order history,
    // so past orders keep valid references.
    const hasOrders = await prisma.orderItem.findFirst({ where: { productId: params.id } });
    if (hasOrders) {
      await prisma.product.update({ where: { id: params.id }, data: { isActive: false } });
      return NextResponse.json({ deactivated: true });
    }

    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ deleted: true });
  } catch (err: any) {
    console.error('Delete product error:', err);
    return NextResponse.json({ error: err?.message || 'Could not delete product.' }, { status: 400 });
  }
}
