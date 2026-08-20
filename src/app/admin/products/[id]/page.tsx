import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductForm } from '@/components/admin/product-form';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true, colours: true, variants: true },
  });
  if (!product) notFound();

  const serialised = {
    ...product,
    price: Number(product.price),
    salePrice: product.salePrice ? Number(product.salePrice) : '',
  };

  return (
    <div>
      <h1 className="text-3xl font-display mb-8">Edit Product</h1>
      <ProductForm product={serialised} />
    </div>
  );
}
