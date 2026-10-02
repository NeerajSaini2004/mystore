import React from 'react';
import { Phone, MessageCircle, Navigation, QrCode } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export function StoreActionDock() {
  const { store, setIsQRModalOpen } = useStore();

  if (!store) return null;

  const handleCall = () => {
    if (store.phone) {
      window.location.href = `tel:${store.phone.replace(/[^0-9+]/g, '')}`;
    }
  };

  const handleWhatsApp = () => {
    if (store.whatsapp) {
      const cleanNumber = store.whatsapp.replace(/[^0-9]/g, '');
      const text = encodeURIComponent(`Hi ${store.name}, I am visiting your digital catalogue and would like to ask about item availability.`);
      window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
    }
  };

  const handleDirections = () => {
    if (store.google_maps_url) {
      window.open(store.google_maps_url, '_blank');
    } else {
      const query = encodeURIComponent(`${store.name} ${store.location || store.city}`);
      window.open(`https://maps.google.com/?q=${query}`, '_blank');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 p-2 sm:p-3 glass-header border-t border-stone-200/80 shadow-2xl sm:hidden">
      <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
        {/* Get Directions */}
        <button
          onClick={handleDirections}
          className="flex flex-col items-center justify-center py-2 px-2 rounded-xl bg-emerald-800 text-white shadow-xs active:scale-95 transition"
        >
          <Navigation className="w-4 h-4 text-amber-300 mb-0.5" />
          <span className="text-[10px] font-bold">Store Directions</span>
        </button>

        {/* Store Timings & Status */}
        <div className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white text-slate-800 border border-stone-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Open Now
          </span>
          <span className="text-[9px] text-slate-500 font-medium">{store.opening_hours}</span>
        </div>

        {/* QR Share */}
        <button
          onClick={() => setIsQRModalOpen(true)}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-stone-100 text-slate-700 active:scale-95 transition border border-stone-200"
        >
          <QrCode className="w-4 h-4 mb-0.5 text-emerald-800" />
          <span className="text-[10px] font-bold">Counter QR</span>
        </button>
      </div>
    </div>
  );
}
