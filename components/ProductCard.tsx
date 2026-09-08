"use client";

import Link from "next/link";
import { productToSlug } from "../lib/slug";

interface Product {
  id: number | string;
  slug: string;
  name: string;
  price: string | number;
  regular_price: string;
  images?: { src: string }[];
  category?: string;
  average_rating?: string;
  rating_count?: number;
  badge?: "New" | "Sale" | "Hot";
}

export default function ProductCard({ product }: { product: Product }) {
  const productUrl = `/product/${productToSlug(product)}`;
  const salePrice = Number(product.price);
  const originalPrice = Number(product.regular_price);
  const isOnSale = originalPrice > salePrice && originalPrice > 0;
  const discountPct = isOnSale ? Math.round((1 - salePrice / originalPrice) * 100) : 0;
  const imgSrc = product.images?.[0]?.src;

  return (
    <Link href={productUrl} className="group block">
      {/* Specimen frame */}
      <div className="specimen-frame lift-hover" style={{ aspectRatio: '4/5', position: 'relative' }}>
        {/* Discount badge */}
        {isOnSale && (
          <span
            className="absolute top-3 left-3 z-10 text-white text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)', zIndex: 10 }}
          >
            {discountPct}% off
          </span>
        )}

        {/* Image */}
        <div className="w-full h-full relative overflow-hidden rounded-[6px]">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-600 ease-out"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FFE9DD 0%, #FFF6EF 100%)' }}
            >
              <span className="font-serif text-4xl font-bold" style={{ color: '#2A0A22', opacity: 0.2 }}>
                {product.name[0]}
              </span>
            </div>
          )}
        </div>

        {/* Glass sheen */}
        <div className="specimen-sheen" />

        {/* Catalogue plate at bottom */}
        <div className="catalogue-plate">
          {product.name.length > 24 ? product.name.slice(0, 22) + '…' : product.name}
        </div>
      </div>

      {/* Info below frame */}
      <div className="mt-5 px-1">
        <h3 className="font-serif text-[14px] font-semibold leading-snug line-clamp-2 mb-1.5 group-hover:text-[#E11D74] transition-colors" style={{ color: '#2A0A22' }}>
          {product.name}
        </h3>
        {/* Wraps as whole chunks — on a narrow card the saving used to break
            inside its own pill onto two lines. */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <span className="text-[15px] font-bold whitespace-nowrap" style={{ color: '#2A0A22' }}>
            ₹{salePrice.toLocaleString('en-IN')}
          </span>
          {isOnSale && (
            <span className="text-[12px] line-through whitespace-nowrap" style={{ color: '#2A0A22', opacity: 0.4 }}>
              ₹{originalPrice.toLocaleString('en-IN')}
            </span>
          )}
          {isOnSale && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: '#FFE9DD', color: '#E11D74' }}>
              Save ₹{(originalPrice - salePrice).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
