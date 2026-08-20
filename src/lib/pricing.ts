import { prisma } from '@/lib/prisma';

export interface CartLine {
  productId: string;
  quantity: number;
  colour?: string;
  variantInfo?: string;
}

/**
 * Recomputes the whole cart total server-side from the database.
 * Never trust prices sent from the browser — always look them up fresh.
 */
export async function priceCart(lines: CartLine[]) {
  const productIds = lines.map((l) => l.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  const items = lines.map((line) => {
    const product = products.find((p) => p.id === line.productId);
    if (!product) {
      throw new Error(`Product ${line.productId} is no longer available.`);
    }
    if (product.stock < line.quantity) {
      throw new Error(`"${product.name}" only has ${product.stock} left in stock.`);
    }
    const unitPrice = product.salePrice ? Number(product.salePrice) : Number(product.price);
    return {
      product,
      quantity: line.quantity,
      colour: line.colour,
      variantInfo: line.variantInfo,
      unitPrice,
      lineTotal: unitPrice * line.quantity,
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  return { items, subtotal };
}

export async function validatePromoCode(code: string, subtotal: number) {
  const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase().trim() } });

  if (!promo || !promo.isActive) return { valid: false as const, message: 'Invalid promo code.' };
  if (promo.expiresAt && promo.expiresAt < new Date())
    return { valid: false as const, message: 'This promo code has expired.' };
  if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit)
    return { valid: false as const, message: 'This promo code has reached its usage limit.' };
  if (subtotal < Number(promo.minOrderValue))
    return {
      valid: false as const,
      message: `This code requires a minimum order of GHS ${Number(promo.minOrderValue).toFixed(2)}.`,
    };

  const discountAmount =
    promo.discountType === 'PERCENTAGE'
      ? subtotal * (Number(promo.discountValue) / 100)
      : Math.min(Number(promo.discountValue), subtotal);

  return { valid: true as const, promo, discountAmount };
}

export async function getDeliveryFee(region: string, city: string) {
  const zone = await prisma.deliveryZone.findFirst({
    where: { region, city, isActive: true },
  });
  // Fall back to a sensible default so checkout never breaks if a zone isn't configured yet.
  return zone ? Number(zone.fee) : 25;
}
