import React, { useState } from 'react';
import { X, Phone, MessageCircle, CheckCircle2, XCircle, Tag, MapPin, Share2, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';
import { useStore } from '../../context/StoreContext';
import { OptimizedImage } from '../common/OptimizedImage';

export function ProductDetailModal() {
  const { selectedProduct, setSelectedProduct, store, categories } = useStore();
  const [copied, setCopied] = useState(false);

  if (!selectedProduct) return null;

  const category = categories.find((c) => c.id === selectedProduct.category_id);
  const discountPercent = selectedProduct.discount_percent || 
    (selectedProduct.mrp && selectedProduct.selling_price && selectedProduct.mrp > selectedProduct.selling_price
      ? Math.round(((selectedProduct.mrp - selectedProduct.selling_price) / selectedProduct.mrp) * 10000) / 100
      : 0);

  const savingsAmount = selectedProduct.mrp && selectedProduct.selling_price
    ? Math.max(0, selectedProduct.mrp - selectedProduct.selling_price)
    : 0;

  const handleClose = () => setSelectedProduct(null);

  const handleShare = async () => {
    const shareText = `Check out "${selectedProduct.name}" (${selectedProduct.pack_size || ''}) at ${store?.name || 'our store'} - ${formatCurrency(selectedProduct.selling_price)}`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedProduct.name,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing product:', err);
        }
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  const handleWhatsAppInquiry = () => {
    if (!store?.whatsapp) return;
    const cleanNumber = store.whatsapp.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hi ${store.name}, I want to check availability for: "${selectedProduct.name}" (${selectedProduct.pack_size || ''}) priced at ${formatCurrency(selectedProduct.selling_price)}.`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  const handleCall = () => {
    if (store?.phone) {
      window.location.href = `tel:${store.phone.replace(/[^0-9+]/g, '')}`;
    }
  };

  const handleDirections = () => {
    if (store?.google_maps_url) {
      window.open(store.google_maps_url, '_blank');
    } else {
      const query = encodeURIComponent(`${store?.name || 'Saini General Store'} ${store?.location || 'Sikar'}`);
      window.open(`https://maps.google.com/?q=${query}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={handleClose}></div>

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10 animate-slide-up">
        
        {/* Top Control Bar */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/80 backdrop-blur-md text-slate-700 hover:bg-white shadow-md transition relative"
            title={copied ? "Copied to clipboard!" : "Share Product"}
            aria-label="Share Product"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            {copied && (
              <span className="absolute -bottom-7 right-0 text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded shadow whitespace-nowrap">
                Copied!
              </span>
            )}
          </button>
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-white/80 backdrop-blur-md text-slate-700 hover:bg-white shadow-md transition"
            title="Close"
            aria-label="Close details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto no-scrollbar">
          
          {/* Large Image Header */}
          <div className="relative aspect-4/3 sm:aspect-16/10 w-full bg-stone-100 flex items-center justify-center overflow-hidden">
            <OptimizedImage
              src={selectedProduct.image_url}
              alt={selectedProduct.name}
              width={720}
              aspectRatio="aspect-4/3 sm:aspect-16/10"
              priority={true}
              fallbackText={selectedProduct.brand || 'Store Item'}
              sizes="(max-width: 640px) 95vw, 600px"
            />

            {/* Discount Badge */}
            {discountPercent > 0 && (
              <div className="absolute bottom-3 left-3 bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1.5 z-10">
                <Tag className="w-3.5 h-3.5" />
                <span>{discountPercent}% OFF</span>
              </div>
            )}
          </div>

          {/* Details Body */}
          <div className="p-4 sm:p-6">
            
            {/* Meta tags: Brand, Category, Pack Size */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                {selectedProduct.brand || 'Store Brand'}
              </span>
              {category && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700">
                  {category.icon} {category.name}
                </span>
              )}
              {selectedProduct.pack_size && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200/80">
                  Pack: {selectedProduct.pack_size}
                </span>
              )}
            </div>

            {/* Product Title */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {selectedProduct.name}
            </h3>

            {/* Live Availability Badge */}
            <div className="mt-3 flex items-center gap-2">
              {selectedProduct.is_available ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Available at {store?.name || 'Store'}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Currently Out of Stock</span>
                </div>
              )}
            </div>

            {/* Price Box */}
            <div className="mt-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 font-medium">Store Price</div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {formatCurrency(selectedProduct.selling_price)}
                  </span>
                  {selectedProduct.mrp && selectedProduct.mrp > selectedProduct.selling_price && (
                    <span className="text-sm text-slate-400 line-through">
                      {formatCurrency(selectedProduct.mrp)}
                    </span>
                  )}
                </div>
              </div>

              {savingsAmount > 0 && (
                <div className="text-right">
                  <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-lg">
                    Save {formatCurrency(savingsAmount)}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {selectedProduct.description && (
              <div className="mt-4">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Product Details
                </h5>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedProduct.description}
                </p>
              </div>
            )}

            {/* Store Location Guarantee */}
            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                Pick up directly from <strong className="text-slate-800">{store?.name}</strong>, {store?.location || `${store?.city}, ${store?.state}`}
              </span>
            </div>

          </div>
        </div>

        {/* Bottom Actions: Store Directions, WhatsApp Inquiry & Call */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200/80 flex flex-wrap sm:flex-nowrap items-center gap-2">
          {store?.whatsapp && (
            <button
              onClick={handleWhatsAppInquiry}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-98"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Inquire</span>
            </button>
          )}

          {store?.phone && (
            <button
              onClick={handleCall}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-98"
              title="Call Store"
            >
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </button>
          )}

          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-98"
          >
            <MapPin className="w-4 h-4 text-amber-300" />
            <span>Directions</span>
          </button>

          <button
            onClick={handleClose}
            className="px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold text-xs sm:text-sm transition active:scale-98"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
