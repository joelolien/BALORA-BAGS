import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductGallery } from '@/components/product/product-gallery';
import { ProductActions } from '@/components/product/product-actions';
import { ProductCard } from '@/components/product/product-card';
import { ReviewsSection } from '@/components/product/reviews-section';
import type { Metadata } from 'next';

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      colours: true,
      variants: true,
      category: true,
      reviews: { where: { isApproved: true }, orderBy: { createdAt: 'desc' }, include: { user: true } },
    },
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description.slice(0, 155),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 155),
      images: product.images[0] ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, isActive: true, id: { not: product.id } },
    include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } },
    take: 4,
  });

  const avgRating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.url),
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'GHS',
      price: Number(product.salePrice ?? product.price),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    ...(product.reviews.length && {
      aggregateRating: { '@type': 'AggregateRating', ratingValue: avgRating.toFixed(1), reviewCount: product.reviews.length },
    }),
  };

  return (
    <div className="section-padding py-12">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="grid md:grid-cols-2 gap-12">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          <p className="eyebrow mb-2">{product.category.name}</p>
          <h1 className="text-3xl md:text-4xl mb-3">{product.name}</h1>

          {product.reviews.length > 0 && (
            <p className="text-sm text-ink/60 mb-4">
              ★ {avgRating.toFixed(1)} · {product.reviews.length} review{product.reviews.length === 1 ? '' : 's'}
            </p>
          )}

          <ProductActions product={product} />

          <div className="mt-10 space-y-6 text-sm text-ink/75 leading-relaxed">
            <div>
              <p className="font-medium text-ink mb-1">Description</p>
              <p>{product.description}</p>
            </div>
            {product.materials && (
              <div>
                <p className="font-medium text-ink mb-1">Materials</p>
                <p>{product.materials}</p>
              </div>
            )}
            <div>
              <p className="font-medium text-ink mb-1">SKU</p>
              <p>{product.sku}</p>
            </div>
          </div>
        </div>
      </div>

      <ReviewsSection productId={product.id} reviews={product.reviews as any} />

      {related.length > 0 && (
        <section className="mt-24">
          <p className="eyebrow mb-3">You may also like</p>
          <h2 className="text-3xl mb-8">Related pieces</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {related.map((p) => (
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
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
