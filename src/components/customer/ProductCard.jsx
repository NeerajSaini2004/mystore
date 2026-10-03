import React from 'react';
import { CheckCircle2, XCircle, Tag, Eye } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';
import { useStore } from '../../context/StoreContext';
import { OptimizedImage } from '../common/OptimizedImage';

export function ProductCard({ product, priority = false }) {
  const { store, setSelectedProduct } = useStore();

  if (!product) return null;

  const isAvailable = product.is_available;
  const discountPercent = product.discount_percent || 
    (product.mrp && product.selling_price && product.mrp > product.selling_price
      ? Math.round(((product.mrp - product.selling_price) / product.mrp) * 10000) / 100
      : 0);

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      className="group bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-lg hover:border-emerald-700/30 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer active:scale-[0.99]"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
        <OptimizedImage
          src={product.image_url}
          alt={product.name}
          width={360}
          priority={priority}
          fallbackText={product.brand || 'Store Item'}
          className="group-hover:scale-105 transition-transform duration-300"
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2.5 left-2.5 bg-amber-500 text-slate-950 font-extrabold text-[11px] px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
            <Tag className="w-3 h-3" />
            <span>{discountPercent}% OFF</span>
          </div>
        )}

        {/* Availability Badge */}
        <div className="absolute top-2.5 right-2.5">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1 bg-emerald-900/90 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
              <CheckCircle2 className="w-3 h-3 text-emerald-300" />
              Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-rose-800/90 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
              <XCircle className="w-3 h-3 text-rose-200" />
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick view hover icon on desktop */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/90 text-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-emerald-800" />
            View Details
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-grow justify-between">
        <div>
          {/* Brand & Pack size */}
          <div className="flex items-center justify-between gap-1 text-[11px] text-slate-600 mb-1">
            <span className="font-semibold text-emerald-800 uppercase tracking-wider truncate">
              {product.brand || 'Quality Assured'}
            </span>
            {product.pack_size && (
              <span className="text-slate-600 bg-stone-100 px-1.5 py-0.5 rounded text-[10px] shrink-0 font-medium">
                {product.pack_size}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-emerald-900 transition-colors">
            {product.name}
          </h4>
        </div>

        {/* Price & Stock Row */}
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none">
                {formatCurrency(product.selling_price)}
              </span>
              {product.mrp && product.mrp > product.selling_price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(product.mrp)}
                </span>
              )}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
              ✓ In-Store Pickup
            </div>
          </div>

          <span className="text-[11px] font-semibold text-slate-500 bg-stone-50 group-hover:bg-emerald-50 group-hover:text-emerald-800 px-2 py-1 rounded-lg border border-stone-200/60 transition">
            View Details →
          </span>
        </div>
      </div>
    </div>
  );
}
