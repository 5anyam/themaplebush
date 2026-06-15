"use client";

import Link from "next/link";
import { productToSlug } from "../lib/slug";
import { ShoppingCart, Star } from 'lucide-react';

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
  const rating = Number(product.average_rating);
  const salePrice = Number(product.price);
  const originalPrice = Number(product.regular_price);
  const isOnSale = originalPrice > salePrice;
  const discountPercent = isOnSale
    ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
    : 0;

  return (
    <Link href={productUrl} className="group block h-full bg-white border border-gray-200 hover:border-[#ff3131] hover:shadow-md transition-all duration-300">
      <div className="relative flex flex-col h-full overflow-hidden">

        {/* ── IMAGE SECTION ── */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={product.images?.[0]?.src || "/placeholder.png"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ease-out"
          />

          {/* Badges */}
          <div className="absolute top-0 left-0 flex flex-col items-start">
            {product.badge === 'New' && (
              <span className="bg-gray-900 text-white text-[9px] font-bold px-3 py-1.5 tracking-[0.2em] uppercase">
                New
              </span>
            )}
            {product.badge === 'Hot' && (
              <span className="bg-[#ff3131] text-white text-[9px] font-bold px-3 py-1.5 tracking-[0.2em] uppercase">
                Trending
              </span>
            )}
            {isOnSale && (
              <span className="bg-[#ff3131] text-white text-[9px] font-bold px-3 py-1.5 tracking-[0.2em] uppercase">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        </div>

        {/* ── CONTENT SECTION ── */}
        <div className="flex flex-col flex-1 p-4 md:p-5 gap-2">

          {/* Category */}
          {product.category && (
            <span className="text-[10px] text-[#ff3131] uppercase tracking-[0.2em] font-semibold">
              {product.category}
            </span>
          )}

          {/* Product Name */}
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-relaxed min-h-[2.5rem] group-hover:text-[#ff3131] transition-colors duration-200">
            {product.name}
          </h3>

          {/* Rating */}
          {Number.isFinite(rating) && rating > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-2.5 h-2.5 ${
                      i < Math.round(rating)
                        ? "text-[#ff3131] fill-[#ff3131]"
                        : "text-gray-200 fill-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-gray-400 tracking-wider ml-1">
                ({product.rating_count || 0})
              </span>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* ── PRICE & ACTION ── */}
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-gray-900">
                ₹{salePrice.toLocaleString('en-IN')}
              </span>
              {isOnSale && (
                <span className="text-xs text-gray-400 line-through font-light">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <button className="w-full py-2.5 bg-[#ff3131] text-white text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#cc0000] transition-all duration-200 active:scale-[0.98]">
              <ShoppingCart className="w-3.5 h-3.5" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
