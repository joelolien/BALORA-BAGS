import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/whatsapp-button';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Balora Bags — Handmade Crochet Bags, Accra',
    template: '%s | Balora Bags',
  },
  description:
    'Balora Bags is a modern Ghanaian handbag brand crafting handmade crochet bags inspired by balance — elegant, feminine, made with love in Accra.',
  openGraph: {
    title: 'Balora Bags',
    description: 'Handmade crochet bags, inspired by balance. Made with love in Accra, Ghana.',
    url: siteUrl,
    siteName: 'Balora Bags',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Balora Bags',
    description: 'Handmade crochet bags, inspired by balance.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
