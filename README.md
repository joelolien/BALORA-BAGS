# Balora Bags — E-Commerce Platform

A full-stack, production-ready e-commerce store for **Balora Bags**, a handmade crochet bag
brand based in Accra, Ghana. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS,
Prisma + PostgreSQL, NextAuth, Paystack (Ghana Mobile Money + cards), Cloudinary, and Resend.

\---

## What's included

* Customer storefront: home, shop (search/filter/sort/pagination), product pages with
gallery/zoom/variants/reviews, cart, checkout, order tracking, account dashboard, wishlist,
about/contact/FAQ/policy pages
* Real payments via **Paystack** (Mobile Money + card), verified server-side, with webhook
support — plus Cash on Delivery / Bank Transfer as manual options matching how Balora
currently takes payment
* Admin dashboard: sales/orders overview with charts, product management (with image upload
to Cloudinary), category management, order management with status updates, customer list,
promo codes, delivery zone configuration, store settings
* Authentication (customers + admin) with hashed passwords, password reset, and **enforced
server-side admin authorization** on every admin API route
* Transactional emails via Resend (order confirmation, payment success, status updates,
welcome, password reset)
* WhatsApp floating contact button + WhatsApp help link on the order confirmation page
* SEO: sitemap.xml, robots.txt, per-product metadata, Open Graph tags, product structured data
* Seed data: realistic sample Balora products, categories, Accra delivery zones, a starter
promo code, and a bootstrap admin account

## What you'll need to supply

This code is complete and functional, but it needs **your own service credentials** to run
live — I can't create these accounts on your behalf:

1. A PostgreSQL database (free options: [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app))
2. A [Paystack](https://paystack.com) account set up for GHS (enables Mobile Money + card payments)
3. A [Cloudinary](https://cloudinary.com) account (free tier is fine to start) for product images
4. A [Resend](https://resend.com) account for transactional emails, with a verified sending domain
5. A [Vercel](https://vercel.com) account for hosting (or any Node host that supports Next.js)

\---

## 1\. Local setup

```bash
# Install dependencies
npm install

# Copy the environment template and fill in your real values
cp .env.example .env

# Push the database schema (creates all tables)
npm run db:push

# Seed sample data + create your first admin account
npm run db:seed

# Start the dev server
npm run dev
```

Visit `http://localhost:3000`.

### Environment variables

See `.env.example` for the full list. Key ones:

|Variable|Where to get it|
|-|-|
|`DATABASE\_URL`|Your Postgres provider's connection string|
|`NEXTAUTH\_SECRET`|Generate with `openssl rand -base64 32`|
|`NEXTAUTH\_URL`|Your site URL (e.g. `http://localhost:3000` locally)|
|`PAYSTACK\_SECRET\_KEY` / `NEXT\_PUBLIC\_PAYSTACK\_PUBLIC\_KEY`|Paystack dashboard → Settings → API Keys|
|`CLOUDINARY\_\*`|Cloudinary dashboard → Account Details|
|`RESEND\_API\_KEY` / `EMAIL\_FROM`|Resend dashboard → API Keys (verify your sending domain first)|
|`NEXT\_PUBLIC\_WHATSAPP\_NUMBER`|Balora's WhatsApp number, digits only with country code (already set to `233540784922`)|
|`SEED\_ADMIN\_EMAIL` / `SEED\_ADMIN\_PASSWORD`|Used once by `npm run db:seed` — **change this password after your first login**|

## 2\. Creating the first admin account

Running `npm run db:seed` creates one admin account using `SEED\_ADMIN\_EMAIL` /
`SEED\_ADMIN\_PASSWORD` from your `.env` file. Sign in at `/account/login` with those
credentials, then immediately go to **Account → Settings** to change the password.

To promote additional accounts to admin later, update their `role` to `ADMIN` directly in the
database (via `npm run db:studio`, or your Postgres provider's dashboard) — there's
intentionally no public "become an admin" button.

## 3\. Configuring Paystack

1. Create a Paystack account and switch it to **Ghana / GHS**.
2. Copy your test (or live) secret and public keys into `.env`.
3. In the Paystack dashboard, add a webhook pointing to:
`https://yourdomain.com/api/webhooks/paystack`
This is what marks orders as paid even if a customer closes their browser before the
redirect page loads — treat it as the source of truth for payment status.
4. Test with Paystack's [test Mobile Money and card numbers](https://paystack.com/docs/payments/test-payments/) before going live.

## 4\. Configuring Cloudinary

Create a free Cloudinary account, then copy your Cloud Name, API Key, and API Secret into
`.env`. Product images uploaded from **Admin → Products → Add/Edit** go straight to
Cloudinary and are optimized automatically.

## 5\. Configuring email (Resend)

Create a Resend account, verify a sending domain (or use their test domain while developing),
and add your API key. Without `RESEND\_API\_KEY` set, the app still works — emails are just
logged to the server console instead of sent, so nothing breaks in development.

## 6\. Replacing sample data with the real Balora catalogue

The seed script (`prisma/seed.ts`) creates 8 sample products with placeholder photography so
the site looks complete out of the box. To go live:

1. Sign in to `/admin`
2. Edit or delete each sample product, or add new ones from scratch
3. Upload real product photography (the form uploads directly to Cloudinary)
4. Update categories, delivery zones, and store settings to match the real business

## 7\. Deploying to production

**Recommended stack:** Vercel (app) + Neon or Supabase (Postgres) + Cloudinary (images) +
Paystack (payments) + Resend (email).

1. Push this project to a GitHub repository.
2. Import it into [Vercel](https://vercel.com/new).
3. Add every variable from `.env.example` to Vercel's Environment Variables settings, using
your real production values (set `NEXTAUTH\_URL` and `NEXT\_PUBLIC\_SITE\_URL` to your live
domain).
4. Deploy. Vercel runs `npm run build`, which also runs `prisma generate` automatically.
5. Run migrations against your production database once:

```bash
   DATABASE\_URL="your-production-url" npx prisma db push
   DATABASE\_URL="your-production-url" npm run db:seed
   ```

6. Update your Paystack webhook URL to your production domain.
7. Sign in, change the seeded admin password, and replace the sample catalogue with real
products and photos.

## Project structure

```
prisma/schema.prisma        Database schema (all models \& relationships)
prisma/seed.ts              Sample data + first admin bootstrap
src/app/                    Pages (App Router) — storefront, account, admin, API routes
src/components/             Reusable UI components, organized by feature
src/lib/                    Server-side logic: auth, Prisma client, Paystack, Cloudinary,
                             email, pricing/promo validation, utilities
```

## Notes on security

* Every `/api/admin/\*` route calls `requireAdmin()`, which checks the session **on the
server** — a customer manually hitting an admin API endpoint gets a 403, regardless of what
the UI shows.
* Cart totals, promo code discounts, and delivery fees are always recalculated **server-side**
during checkout — nothing from the browser is trusted for pricing.
* Payment status is only ever set to `PAID` after a server-to-server verification call to
Paystack (or a signature-verified webhook) — never from a client-side redirect alone.
* Passwords are hashed with bcrypt (cost factor 12); reset tokens are single-use and expire
after one hour.

## Support

This codebase was generated as a complete starting point. For ongoing development, bug fixes,
or new features, treat it like any other Next.js/Prisma project — `npm run dev` locally,
`npm run db:studio` to browse data, and standard Next.js/Vercel deployment practices apply.



Ready to deploy

