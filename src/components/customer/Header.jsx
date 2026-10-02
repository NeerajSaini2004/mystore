import React from 'react';
import { MapPin, QrCode, Clock, Lock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export function Header() {
  const { store, setIsQRModalOpen, navigateTo } = useStore();

  if (!store) return null;

  return (
    <header className="sticky top-0 z-30 glass-header border-b border-stone-200/80 shadow-xs transition-all">
      <div className="max-w-5xl mx-auto px-4 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-3">
          
          {/* Shop Logo & Name Branding */}
          <div className="flex items-center gap-3 min-w-0">
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={store.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-emerald-800/10 shadow-xs shrink-0"
                loading="eager"
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-900 text-amber-300 font-bold flex items-center justify-center text-lg shadow-xs shrink-0">
                {store.name?.charAt(0) || 'S'}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight truncate leading-tight">
                  {store.name}
                </h1>
                {store.is_open ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300/60 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                    Open Now
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
                    Closed
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 truncate">
                <span className="flex items-center gap-1 text-slate-600 truncate">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="truncate">{store.city}, {store.state}</span>
                </span>
                <span className="hidden sm:flex items-center gap-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>{store.opening_hours}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions (Directions, QR, Admin) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Get Directions Button */}
            <button
              onClick={() => {
                if (store.google_maps_url) {
                  window.open(store.google_maps_url, '_blank');
                } else {
                  const query = encodeURIComponent(`${store.name} ${store.location || store.city}`);
                  window.open(`https://maps.google.com/?q=${query}`, '_blank');
                }
              }}
              aria-label="Store Directions"
              className="flex items-center justify-center py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition active:scale-95 text-xs font-semibold"
              title="Get Directions to Store"
            >
              <MapPin className="w-3.5 h-3.5 sm:mr-1.5 text-amber-300" />
              <span className="hidden sm:inline">Store Location</span>
            </button>

            {/* Shop QR Flyer Button */}
            <button
              onClick={() => setIsQRModalOpen(true)}
              aria-label="Show Store QR Code"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition active:scale-95"
              title="Show Store QR Code"
            >
              <QrCode className="w-5 h-5 text-slate-700" />
            </button>

            {/* Admin Dashboard Entry */}
            <button
              onClick={() => navigateTo('/admin')}
              aria-label="Admin Portal"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition active:scale-95"
              title="Shop Owner Login"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
