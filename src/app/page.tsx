import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/product/product-card';
import { NewsletterForm } from '@/components/newsletter-form';
import { HeroVideo } from '@/components/hero-video';

// Render this page fresh on each request instead of at build time, since
// product data changes constantly and the database may not be migrated yet
// at the moment of a given deployment.
export const dynamic = 'force-dynamic';

async function getHomeData() {
  const [featured, newArrivals, bestSellers, categories, settings] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
      take: 4,
    }),
    prisma.product.findMany({
      where: { isActive: true, isNewArrival: true },
      include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
      take: 4,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({
      where: { isActive: true, isBestSeller: true },
      include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
      take: 4,
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, take: 4 }),
    prisma.storeSettings.findUnique({ where: { id: 'singleton' } }),
  ]);
  return { featured, newArrivals, bestSellers, categories, settings };
}

function toCardData(p: any) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
    stock: p.stock,
    image: p.images[0]?.url || '/placeholder-bag.svg',
    isNewArrival: p.isNewArrival,
    isBestSeller: p.isBestSeller,
  };
}

export default async function HomePage() {
  const { featured, newArrivals, bestSellers, categories, settings } = await getHomeData();
  const instagramImages = settings?.instagramImages || [];
  const spotlight = featured.length ? featured : newArrivals;

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <HeroVideo />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-ink/60" />

        <div className="relative section-padding w-full">
          <div className="max-w-xl text-cream animate-fadeUp">
            <p className="eyebrow text-sand mb-4">Handmade in Accra, Ghana</p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] mb-6">
              Bags made with <em className="italic text-clay-light">balance</em>, worn with intention.
            </h1>
            <p className="text-cream/85 text-base md:text-lg max-w-md mb-8 leading-relaxed">
              Every Balora bag is crocheted by hand — a considered blend of everyday elegance and
              unmistakable craft, made for women who stand out without trying too hard.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop" className="btn-clay">
                Shop the Collection
              </Link>
              <Link href="/about" className="border border-cream/50 text-cream px-7 py-3.5 text-sm tracking-wide uppercase hover:bg-cream/10 transition-colors">
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="thread-divider mx-6 md:mx-10 lg:mx-16" />

      {/* CATEGORIES */}
      <section className="section-padding py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="eyebrow mb-3">Shop by Category</p>
            <h2 className="text-3xl md:text-4xl">Find your everyday piece</h2>
          </div>
          <Link href="/shop" className="hidden md:block text-sm uppercase tracking-wide underline underline-offset-4">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(categories.length ? categories : PLACEHOLDER_CATEGORIES).map((cat: any) => (
            <Link key={cat.slug} href={`/shop?category=${cat.slug}`} className="group relative aspect-[3/4] overflow-hidden bg-forest">
              {cat.imageUrl ? (
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle, #FBF0F2 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              )}
              <div className="absolute inset-0 bg-ink/20 flex items-end p-4">
                <p className="text-cream font-display text-lg">{cat.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      {spotlight.length > 0 && (
        <section className="section-padding py-20 bg-paper">
          <div className="text-center mb-12">
            <p className="eyebrow mb-3">Featured</p>
            <h2 className="text-3xl md:text-4xl">This season's edit</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {spotlight.map((p) => (
              <ProductCard key={p.id} product={toCardData(p)} />
            ))}
          </div>
        </section>
      )}

      {/* PROMO BANNER */}
      <section className="relative py-24 section-padding text-center overflow-hidden">
        <Image
          src="/images/promo-clutch.jpg"
          alt="Balora handmade crochet clutch"
          fill
          className="object-cover -z-10"
        />
        <div className="absolute inset-0 bg-ink/50 -z-10" />
        <p className="eyebrow text-sand mb-3">Limited Drop</p>
        <h2 className="text-cream font-display text-3xl md:text-5xl max-w-xl mx-auto mb-6">
          New colourways release every month — get early access.
        </h2>
        <Link href="/shop?filter=new" className="btn-clay inline-flex">
          Shop New Arrivals
        </Link>
      </section>

      {/* BEST SELLERS */}
      {bestSellers.length > 0 && (
        <section className="section-padding py-20">
          <div className="text-center mb-12">
            <p className="eyebrow mb-3">Loved by Customers</p>
            <h2 className="text-3xl md:text-4xl">Best sellers</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={toCardData(p)} />
            ))}
          </div>
        </section>
      )}

      {/* ABOUT BRAND */}
      <section className="section-padding py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-[4/5] bg-forest overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle, #FBF0F2 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <p className="relative font-display italic text-cream/90 text-4xl md:text-5xl text-center px-10 leading-tight">
            crocheted with care, in Accra
          </p>
        </div>
        <div>
          <p className="eyebrow mb-3">Our Craft</p>
          <h2 className="text-3xl md:text-4xl mb-6 leading-tight">
            More than a bag — a whole vibe, made by hand.
          </h2>
          <p className="text-ink/70 leading-relaxed mb-4">
            Balora is inspired by the word <em>balance</em> — a considered blend of effortless style
            and unmistakable craft. Every piece is crocheted to order in Accra, with intention in
            every colour, knot, and detail.
          </p>
          <p className="text-ink/70 leading-relaxed mb-8">
            We believe fashion should feel personal. That's why custom colourways and made-to-order
            pieces sit at the heart of what we do.
          </p>
          <Link href="/about" className="btn-secondary">
            Read Our Story
          </Link>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section-padding py-20 bg-forest text-cream">
        <div className="text-center mb-12">
          <p className="eyebrow text-sand mb-3">Testimonials</p>
          <h2 className="text-3xl md:text-4xl">What our customers say</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="border border-cream/20 p-6">
              <p className="text-cream/90 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
              <p className="text-sm text-sand">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* INSTAGRAM */}
      {instagramImages.length > 0 && (
        <section className="section-padding py-20">
          <div className="text-center mb-10">
            <p className="eyebrow mb-3">@{settings?.instagramHandle || 'balora_bags'}</p>
            <h2 className="text-3xl md:text-4xl">Follow along</h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {instagramImages.map((src) => (
              <a
                key={src}
                href={`https://instagram.com/${settings?.instagramHandle || 'balora_bags'}`}
                target="_blank"
                rel="noreferrer"
                className="relative aspect-square bg-sand overflow-hidden"
              >
                <Image src={src} alt="Balora Instagram post" fill className="object-cover hover:scale-105 transition-transform duration-500" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* NEWSLETTER */}
      <section className="section-padding py-20 bg-sand text-center">
        <p className="eyebrow mb-3">Stay Updated</p>
        <h2 className="text-3xl md:text-4xl mb-6">Be first to hear about our next drop</h2>
        <NewsletterForm />
      </section>
    </div>
  );
}

const PLACEHOLDER_CATEGORIES = [
  { slug: 'handbags', name: 'Handbags', imageUrl: null },
  { slug: 'clutch-bags', name: 'Clutch Bags', imageUrl: null },
  { slug: 'tote-bags', name: 'Tote Bags', imageUrl: null },
  { slug: 'crossbody-bags', name: 'Crossbody Bags', imageUrl: null },
];

const TESTIMONIALS = [
  { name: 'Abena K., Accra', quote: 'The quality is stunning and mine was made in my exact colours. Feels so much more special than a shop-bought bag.' },
  { name: 'Efua T., Kumasi', quote: 'Delivery was quick and the packaging alone felt premium. This is my third Balora bag!' },
  { name: 'Naana O., Accra', quote: 'I get compliments every time I carry it. Handmade really does make a difference.' },
];
