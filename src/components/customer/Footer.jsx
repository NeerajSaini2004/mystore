import React from 'react';
import { MapPin, Phone, MessageCircle, Clock, ShieldCheck, Lock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export function Footer() {
  const { store, navigateTo } = useStore();

  if (!store) return null;

  return (
    <footer className="mt-16 bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-24 sm:pb-12 px-4 no-print">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        
        {/* Col 1: Store Bio */}
        <div>
          <h4 className="text-white text-lg font-bold tracking-tight mb-2">
            {store.name}
          </h4>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
            {store.description || store.tagline}
          </p>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 inline-flex">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>100% Genuine Neighborhood Store Inventory</span>
          </div>
        </div>

        {/* Col 2: Store Timings & Location */}
        <div>
          <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
            Store Information
          </h5>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{store.location || `${store.city}, ${store.state} - ${store.pincode}`}</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Daily Hours: <strong className="text-slate-200">{store.opening_hours}</strong></span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{store.phone}</span>
            </li>
          </ul>
        </div>

        {/* Col 3: Owner / Admin Access */}
        <div>
          <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
            Shopkeeper Access
          </h5>
          <p className="text-xs text-slate-400 mb-4">
            Shop owners can manage catalogue items, prices, instant stock status, and store details.
          </p>
          <button
            onClick={() => navigateTo('/admin')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-emerald-950 text-slate-200 hover:text-white border border-slate-700 transition text-xs font-semibold"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Store Admin Dashboard</span>
          </button>
        </div>

      </div>

      <div className="max-w-5xl mx-auto mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          © {new Date().getFullYear()} {store.name}. All rights reserved.
        </div>
        <div>
          Powered by Local Store Digital Catalogue Platform
        </div>
      </div>
    </footer>
  );
}
