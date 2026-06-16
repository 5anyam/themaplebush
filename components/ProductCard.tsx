"use client";

import Link from "next/link";
import { productToSlug } from "../lib/slug";
import { ShoppingCart } from 'lucide-react';

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
  const discountPercent = isOnSale
    ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
    : 0;

  return (
    <Link href={productUrl} className="group block">
      {/* Book Cover — portrait 2:3 ratio */}
      <div className="relative aspect-[2/3] overflow-hidden bg-gray-100 mb-3 shadow-sm group-hover:shadow-lg transition-shadow duration-300">
        <img
          src={product.images?.[0]?.src || "/placeholder.png"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
        />

        {/* Quick shop overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 bg-white text-gray-900 text-[10px] font-bold uppercase tracking-[0.15em] px-4 py-2 shadow-md">
            <ShoppingCart className="w-3 h-3" /> Quick View
          </span>
        </div>

        {/* Badges */}
        {isOnSale && (
          <div className="absolute top-2 left-2 bg-[#ff3131] text-white text-[9px] font-bold px-2 py-0.5 tracking-[0.15em] uppercase">
            {discountPercent}% OFF
          </div>
        )}
        {!isOnSale && product.badge === 'New' && (
          <div className="absolute top-2 left-2 bg-gray-900 text-white text-[9px] font-bold px-2 py-0.5 tracking-[0.15em] uppercase">
            New
          </div>
        )}
        {!isOnSale && product.badge === 'Hot' && (
          <div className="absolute top-2 left-2 bg-[#ff3131] text-white text-[9px] font-bold px-2 py-0.5 tracking-[0.15em] uppercase">
            Hot
          </div>
        )}
      </div>

      {/* Book info */}
      <div className="space-y-1">
        {product.category && (
          <p className="text-[10px] text-[#ff3131] uppercase tracking-[0.15em] font-semibold truncate">
            {product.category}
          </p>
        )}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#ff3131] transition-colors duration-200">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-sm font-bold text-gray-900">
            ₹{salePrice.toLocaleString('en-IN')}
          </span>
          {isOnSale && (
            <span className="text-xs text-gray-400 line-through font-normal">
              ₹{originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
