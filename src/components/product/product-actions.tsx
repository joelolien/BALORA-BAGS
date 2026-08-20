'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Minus, Plus } from 'lucide-react';
import { useCart } from '@/components/cart/cart-context';
import { formatGHS } from '@/lib/utils';
import { toast } from 'sonner';

interface Colour {
  id: string;
  name: string;
  hex: string;
}
interface Variant {
  id: string;
  name: string;
  value: string;
  stock: number;
}
interface Product {
  id: string;
  name: string;
  slug: string;
  price: any;
  salePrice: any;
  stock: number;
  colours: Colour[];
  variants: Variant[];
  images: { url: string }[];
  isCustomOrder: boolean;
}

export function ProductActions({ product }: { product: Product }) {
  const { addItem, setIsOpen } = useCart();
  const router = useRouter();
  const [colour, setColour] = useState<string | undefined>(product.colours[0]?.name);
  const [variant, setVariant] = useState<string | undefined>(
    product.variants[0] ? `${product.variants[0].name}: ${product.variants[0].value}` : undefined
  );
  const [quantity, setQuantity] = useState(1);

  const price = Number(product.price);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const outOfStock = product.stock <= 0;

  function buildCartItem() {
    return {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0]?.url || '/placeholder-bag.svg',
      price,
      salePrice,
      stock: product.stock,
      colour,
      variantInfo: variant,
    };
  }

  function handleAddToCart() {
    addItem(buildCartItem(), quantity);
  }

  function handleBuyNow() {
    addItem(buildCartItem(), quantity);
    router.push('/checkout');
  }

  function handleWishlist() {
    toast.success('Saved to wishlist');
  }

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-6">
        {salePrice ? (
          <>
            <span className="text-2xl text-clay-dark">{formatGHS(salePrice)}</span>
            <span className="text-base text-ink/40 line-through">{formatGHS(price)}</span>
          </>
        ) : (
          <span className="text-2xl">{formatGHS(price)}</span>
        )}
      </div>

      {product.colours.length > 0 && (
        <div className="mb-6">
          <p className="eyebrow mb-2">Colour {colour && `— ${colour}`}</p>
          <div className="flex gap-2">
            {product.colours.map((c) => (
              <button
                key={c.id}
                onClick={() => setColour(c.name)}
                aria-label={c.name}
                className={`w-8 h-8 rounded-full border-2 ${colour === c.name ? 'border-forest' : 'border-transparent'}`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
      )}

      {product.variants.length > 0 && (
        <div className="mb-6">
          <p className="eyebrow mb-2">Options</p>
          <select className="input-field" value={variant} onChange={(e) => setVariant(e.target.value)}>
            {product.variants.map((v) => (
              <option key={v.id} value={`${v.name}: ${v.value}`} disabled={v.stock <= 0}>
                {v.name}: {v.value} {v.stock <= 0 ? '(Out of stock)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-6">
        <p className="eyebrow mb-2">Quantity</p>
        <div className="flex items-center gap-4 border border-ink/20 w-fit px-3 py-2">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
            <Minus size={16} />
          </button>
          <span className="w-6 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            aria-label="Increase quantity"
            disabled={quantity >= product.stock}
          >
            <Plus size={16} />
          </button>
        </div>
        <p className="text-xs text-ink/50 mt-2">
          {outOfStock ? 'Currently out of stock' : `${product.stock} in stock`}
        </p>
      </div>

      <div className="flex gap-3">
        <button onClick={handleAddToCart} disabled={outOfStock} className="btn-primary flex-1">
          Add to Bag
        </button>
        <button onClick={handleBuyNow} disabled={outOfStock} className="btn-clay flex-1">
          Buy Now
        </button>
        <button onClick={handleWishlist} aria-label="Add to wishlist" className="btn-secondary px-4">
          <Heart size={18} />
        </button>
      </div>

      {product.isCustomOrder && (
        <p className="text-xs text-ink/50 mt-4">
          This is a made-to-order piece. Please allow 1–2 weeks for crafting before delivery.
        </p>
      )}
    </div>
  );
}
