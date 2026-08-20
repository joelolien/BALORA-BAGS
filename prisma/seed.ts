import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Placeholder imagery — swap these Cloudinary/Unsplash URLs for real product
// photography via the admin dashboard once the business has real photos.
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1554342872-034a06541bac?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1598532213919-078e54dd1f3c?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200&auto=format&fit=crop',
];

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
}

async function main() {
  console.log('Seeding Balora Bags database...');

  // ── Store settings ──────────────────────────────────────
  await prisma.storeSettings.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton' },
    update: {},
  });

  // ── Categories ───────────────────────────────────────────
  const categoryDefs = [
    { name: 'Handbags', description: 'Everyday handmade crochet handbags.' },
    { name: 'Shoulder Bags', description: 'Relaxed, versatile shoulder bags.' },
    { name: 'Tote Bags', description: 'Spacious totes for work and errands.' },
    { name: 'Crossbody Bags', description: 'Hands-free bags for everyday movement.' },
    { name: 'Mini Bags', description: 'Compact bags for evenings and outings.' },
    { name: 'Clutches', description: 'Elegant clutches for events and special occasions.' },
    { name: 'Backpacks', description: 'Crochet backpacks for casual, everyday wear.' },
    { name: 'Accessories', description: 'Bag charms, pouches and small crochet accessories.' },
  ];

  const categories = [];
  for (let i = 0; i < categoryDefs.length; i++) {
    const cat = await prisma.category.upsert({
      where: { slug: slugify(categoryDefs[i].name) },
      create: { ...categoryDefs[i], slug: slugify(categoryDefs[i].name), sortOrder: i },
      update: {},
    });
    categories.push(cat);
  }
  console.log(`✓ ${categories.length} categories`);

  // ── Products ─────────────────────────────────────────────
  const productDefs = [
    {
      name: 'Classic Black Handbag',
      category: 'Handbags',
      description: 'A timeless handmade crochet handbag in classic black, structured for everyday elegance.',
      materials: 'Premium cotton crochet yarn, cotton lining, wooden handles.',
      price: 380, salePrice: null, stock: 8,
      isFeatured: true, isBestSeller: true, isNewArrival: false,
      colours: [{ name: 'Black', hex: '#1c1a18' }],
    },
    {
      name: 'Luxury Shoulder Bag',
      category: 'Shoulder Bags',
      description: 'An elevated shoulder bag with a soft structured silhouette, handcrafted for daily luxury.',
      materials: 'Raffia-blend crochet yarn, suede trim, gold-tone hardware.',
      price: 420, salePrice: 360, stock: 5,
      isFeatured: true, isBestSeller: false, isNewArrival: true,
      colours: [{ name: 'Sand', hex: '#d8c6a3' }, { name: 'Olive', hex: '#5c6b52' }],
    },
    {
      name: 'Mini Crossbody Bag',
      category: 'Crossbody Bags',
      description: 'A compact crossbody piece, perfect for keeping essentials close on busy days.',
      materials: 'Cotton crochet yarn, adjustable strap, magnetic clasp.',
      price: 260, salePrice: null, stock: 12,
      isFeatured: false, isBestSeller: true, isNewArrival: false,
      colours: [{ name: 'Terracotta', hex: '#b9704a' }, { name: 'Cream', hex: '#f6f1e7' }],
    },
    {
      name: 'Elegant Tote',
      category: 'Tote Bags',
      description: 'A generously sized tote, handwoven for durability without compromising on style.',
      materials: 'Heavy-duty cotton crochet yarn, canvas lining, leather handles.',
      price: 450, salePrice: null, stock: 6,
      isFeatured: true, isBestSeller: false, isNewArrival: true,
      colours: [{ name: 'Ivory', hex: '#f6f1e7' }],
    },
    {
      name: 'Evening Clutch',
      category: 'Clutches',
      description: 'A refined clutch for evenings out, finished with a delicate beaded trim.',
      materials: 'Fine crochet yarn, beaded detailing, satin lining.',
      price: 220, salePrice: null, stock: 10,
      isFeatured: false, isBestSeller: false, isNewArrival: true,
      colours: [{ name: 'Gold', hex: '#ac8a50' }, { name: 'Wine', hex: '#5c2a2a' }],
    },
    {
      name: 'Casual Everyday Bag',
      category: 'Mini Bags',
      description: 'An easy, everyday companion bag with plenty of character and comfortable wear.',
      materials: 'Cotton crochet yarn, cotton lining, adjustable strap.',
      price: 240, salePrice: 200, stock: 0,
      isFeatured: false, isBestSeller: false, isNewArrival: true,
      colours: [{ name: 'Blush', hex: '#dba99a' }],
    },
    {
      name: 'Woven Weekender Backpack',
      category: 'Backpacks',
      description: 'A sturdy handmade backpack, perfect for weekend errands or casual outings.',
      materials: 'Heavy cotton crochet yarn, drawstring closure, leather straps.',
      price: 400, salePrice: null, stock: 4,
      isFeatured: false, isBestSeller: false, isNewArrival: true, isCustomOrder: true,
      colours: [{ name: 'Forest Green', hex: '#3e4a37' }],
    },
    {
      name: 'Balora Bag Charm',
      category: 'Accessories',
      description: 'A handmade crochet charm to personalise your favourite Balora bag.',
      materials: 'Cotton crochet yarn, gold-tone clip.',
      price: 60, salePrice: null, stock: 20,
      isFeatured: false, isBestSeller: false, isNewArrival: false,
      colours: [{ name: 'Multicolour', hex: '#b9704a' }],
    },
  ];

  let skuCounter = 100;
  for (const def of productDefs) {
    const category = categories.find((c) => c.name === def.category)!;
    const slug = slugify(def.name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) continue;

    await prisma.product.create({
      data: {
        name: def.name,
        slug,
        sku: `BLR-${skuCounter++}`,
        description: def.description,
        materials: def.materials,
        price: def.price,
        salePrice: def.salePrice,
        stock: def.stock,
        isFeatured: def.isFeatured,
        isBestSeller: def.isBestSeller,
        isNewArrival: def.isNewArrival,
        isCustomOrder: (def as any).isCustomOrder || false,
        categoryId: category.id,
        images: {
          create: [0, 1].map((i) => ({
            url: PLACEHOLDER_IMAGES[(skuCounter + i) % PLACEHOLDER_IMAGES.length],
            altText: def.name,
            sortOrder: i,
          })),
        },
        colours: { create: def.colours },
      },
    });
  }
  console.log(`✓ ${productDefs.length} sample products (edit or remove these from the admin dashboard anytime)`);

  // ── Delivery zones (Accra, as per current business coverage) ─
  const accraAreas = [
    { city: 'Accra Central', fee: 20 },
    { city: 'East Legon', fee: 25 },
    { city: 'Osu', fee: 20 },
    { city: 'Tema', fee: 35 },
    { city: 'Spintex', fee: 25 },
    { city: 'Adenta', fee: 30 },
  ];
  for (const area of accraAreas) {
    await prisma.deliveryZone.upsert({
      where: { region_city: { region: 'Greater Accra', city: area.city } },
      create: { region: 'Greater Accra', city: area.city, fee: area.fee, isPickupAvailable: true },
      update: {},
    });
  }
  console.log(`✓ ${accraAreas.length} delivery zones (Accra)`);

  // ── Promo code ───────────────────────────────────────────
  await prisma.promoCode.upsert({
    where: { code: 'WELCOME10' },
    create: {
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderValue: 100,
      usageLimit: 200,
    },
    update: {},
  });
  console.log('✓ Promo code WELCOME10 (10% off, min. GHS 100)');

  // ── First admin account ──────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@balorabags.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: { name: 'Balora Admin', email: adminEmail, passwordHash, role: 'ADMIN' },
    });
    console.log(`✓ Admin account created: ${adminEmail}`);
    console.log('  ⚠️  DEVELOPMENT ONLY — sign in and change this password immediately.');
  } else {
    console.log('✓ Admin account already exists, skipping.');
  }

  console.log('\nSeed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
