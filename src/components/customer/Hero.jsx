import React from 'react';
import { Sparkles, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export function Hero() {
  const { store } = useStore();

  if (!store) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white pt-7 pb-10 sm:pt-10 sm:pb-14 px-4 shadow-md">
      {/* Subtle background glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-20">
        <div className="absolute top-0 right-10 w-72 h-72 bg-amber-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Location & Status Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-700/60 backdrop-blur-md text-xs font-medium text-emerald-100 mb-4 shadow-xs">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            {store.location || `${store.city}, ${store.state}`}
          </span>
          <span className="text-emerald-400">•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            {store.opening_hours}
          </span>
        </div>

        {/* Hero Headings */}
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight sm:leading-tight">
          Everything You Need, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-200">In One Place.</span>
        </h2>

        <p className="mt-2.5 sm:mt-3 text-sm sm:text-lg text-emerald-100/90 max-w-2xl mx-auto font-normal">
          {store.tagline || 'Groceries, Stationery, Household Essentials & More'}
        </p>

        {/* Trust Badges */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-emerald-200">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            Direct Store Pricing
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            Live Stock Availability
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            Instant WhatsApp Inquiry
          </span>
        </div>
      </div>
    </section>
  );
}
