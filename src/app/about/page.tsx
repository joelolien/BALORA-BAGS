import Image from 'next/image';
import Link from 'next/link';

export const metadata = { title: 'About Us', description: "Balora Bags' brand story — handmade crochet bags, inspired by balance." };

export default function AboutPage() {
  return (
    <div>
      <section className="relative h-[60vh] flex items-end section-padding pb-16">
        <Image
          src="https://images.unsplash.com/photo-1598532213919-078e54dd1f3c?q=80&w=2000&auto=format&fit=crop"
          alt="Balora bags being handmade"
          fill
          className="object-cover -z-10"
        />
        <div className="absolute inset-0 bg-ink/40 -z-10" />
        <div className="text-cream">
          <p className="eyebrow text-sand mb-3">Our Story</p>
          <h1 className="font-display text-4xl md:text-6xl max-w-xl">About Balora</h1>
        </div>
      </section>

      <section className="section-padding py-20 max-w-3xl mx-auto text-center">
        <p className="text-xl md:text-2xl font-display leading-relaxed mb-6">
          Balora is inspired by the word <em className="italic text-clay">balance</em> — a perfect blend of
          effortless style and unmistakable craft in every piece.
        </p>
        <p className="text-ink/70 leading-relaxed">
          Made for those who love to stand out without trying too hard. Welcome to the world of Balora.
        </p>
      </section>

      <section className="section-padding py-20 grid md:grid-cols-2 gap-14 items-center">
        <div>
          <h2 className="text-3xl mb-5">Our Mission</h2>
          <p className="text-ink/70 leading-relaxed mb-6">
            We believe fashion should feel personal. Every Balora bag is crocheted to order in Accra,
            with intention behind every colour, knot, and detail — never mass produced, never rushed.
          </p>
          <h2 className="text-3xl mb-5">Our Values</h2>
          <ul className="space-y-3 text-ink/70">
            <li>— Handmade with care, never compromised for speed</li>
            <li>— Elegant, wearable design rooted in everyday life</li>
            <li>— Honest, considered pricing for genuine craftsmanship</li>
            <li>— A personal relationship with every customer we serve</li>
          </ul>
        </div>
        <div className="relative aspect-[4/5] bg-sand">
          <Image
            src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop"
            alt="Handmade Balora bag"
            fill
            className="object-cover"
          />
        </div>
      </section>

      <section className="section-padding py-20 bg-forest text-cream text-center">
        <h2 className="text-3xl md:text-4xl mb-6 max-w-lg mx-auto">
          Why customers choose Balora
        </h2>
        <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto text-left mt-10">
          <div>
            <p className="font-display text-lg mb-2">Handmade</p>
            <p className="text-sm text-cream/75">Every piece crocheted by hand with care and intention.</p>
          </div>
          <div>
            <p className="font-display text-lg mb-2">Custom Orders</p>
            <p className="text-sm text-cream/75">Pre-order a bag made just for you, in your colours.</p>
          </div>
          <div>
            <p className="font-display text-lg mb-2">Accra Delivery</p>
            <p className="text-sm text-cream/75">We deliver anywhere in Accra, right to your door.</p>
          </div>
        </div>
      </section>

      <section className="section-padding py-20 text-center">
        <h2 className="text-2xl md:text-3xl mb-6">Ready to find your piece?</h2>
        <Link href="/shop" className="btn-primary">Shop the Collection</Link>
      </section>
    </div>
  );
}
