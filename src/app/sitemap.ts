import { prisma } from '@/lib/prisma';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // If the database isn't migrated/seeded yet at deploy time, fall back to
  // just the static routes rather than failing the whole build.
  let products: { slug: string; updatedAt: Date }[] = [];
  let categories: { slug: string }[] = [];
  try {
    [products, categories] = await Promise.all([
      prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      prisma.category.findMany({ where: { isActive: true }, select: { slug: true } }),
    ]);
  } catch (err) {
    console.warn('Sitemap: database not ready yet, generating static routes only.', err);
  }

  const staticRoutes = [
    '', '/shop', '/about', '/contact', '/faq', '/track-order',
    '/policies/returns', '/policies/privacy', '/policies/terms', '/policies/shipping',
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  const productRoutes = products.map((p) => ({
    url: `${siteUrl}/products/${p.slug}`,
    lastModified: p.updatedAt,
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${siteUrl}/shop?category=${c.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
