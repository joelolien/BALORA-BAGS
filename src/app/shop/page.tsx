import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/product/product-card';
import { ShopFilters } from '@/components/product/shop-filters';
import type { Prisma } from '@prisma/client';

const PAGE_SIZE = 12;

interface ShopPageProps {
  searchParams: {
    q?: string;
    category?: string;
    sort?: string;
    filter?: string;
    minPrice?: string;
    maxPrice?: string;
    availability?: string;
    page?: string;
  };
}

export const metadata = {
  title: 'Shop All Bags',
  description: 'Browse handmade crochet bags, totes, clutches and accessories by Balora Bags.',
};

export const dynamic = 'force-dynamic';

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10));

  const where: Prisma.ProductWhereInput = { isActive: true };

  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q, mode: 'insensitive' } },
      { description: { contains: searchParams.q, mode: 'insensitive' } },
    ];
  }
  if (searchParams.category) {
    where.category = { slug: searchParams.category };
  }
  if (searchParams.filter === 'new') where.isNewArrival = true;
  if (searchParams.filter === 'bestsellers') where.isBestSeller = true;
  if (searchParams.availability === 'in-stock') where.stock = { gt: 0 };
  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {
      ...(searchParams.minPrice ? { gte: parseFloat(searchParams.minPrice) } : {}),
      ...(searchParams.maxPrice ? { lte: parseFloat(searchParams.maxPrice) } : {}),
    };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    searchParams.sort === 'price-asc'
      ? { price: 'asc' }
      : searchParams.sort === 'price-desc'
      ? { price: 'desc' }
      : searchParams.sort === 'name'
      ? { name: 'asc' }
      : { createdAt: 'desc' };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="section-padding py-12">
      <div className="mb-10">
        <p className="eyebrow mb-2">Shop</p>
        <h1 className="text-4xl md:text-5xl">
          {searchParams.q ? `Results for "${searchParams.q}"` : 'All Bags'}
        </h1>
        <p className="text-ink/50 mt-2 text-sm">{total} product{total === 1 ? '' : 's'}</p>
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-10">
        <ShopFilters categories={categories} searchParams={searchParams} />

        <div>
          {products.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-ink/60">No products match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    price: Number(p.price),
                    salePrice: p.salePrice ? Number(p.salePrice) : null,
                    stock: p.stock,
                    image: p.images[0]?.url || '/placeholder-bag.svg',
                    isNewArrival: p.isNewArrival,
                    isBestSeller: p.isBestSeller,
                  }}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-14">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`?${new URLSearchParams({ ...searchParams, page: String(p) } as any).toString()}`}
                  className={`w-9 h-9 flex items-center justify-center text-sm border ${
                    p === page ? 'bg-forest text-cream border-forest' : 'border-ink/20'
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
