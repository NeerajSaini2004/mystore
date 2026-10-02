import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/customer/Header';
import { Hero } from './components/customer/Hero';
import { SearchBar } from './components/customer/SearchBar';
import { CategoryScroll } from './components/customer/CategoryScroll';
import { ProductGrid } from './components/customer/ProductGrid';
import { ProductDetailModal } from './components/customer/ProductDetailModal';
import { StoreQRCodeModal } from './components/customer/StoreQRCodeModal';
import { StoreActionDock } from './components/customer/StoreActionDock';
import { Footer } from './components/customer/Footer';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { isAdminView, user, isLoading, error } = useStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-amber-300 flex items-center justify-center shadow-lg animate-bounce">
          <Loader2 className="w-6 h-6 animate-spin text-amber-300" />
        </div>
        <p className="mt-4 text-xs sm:text-sm font-bold text-slate-700 tracking-tight">
          Opening Store Digital Catalogue...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
          ⚠️
        </div>
        <h3 className="text-lg font-bold text-slate-900">Catalogue Temporarily Unavailable</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-900"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Admin Route handling
  if (isAdminView) {
    if (!user) {
      return <AdminLogin />;
    }
    return <AdminLayout />;
  }

  // Customer Facing Catalogue
  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col selection:bg-emerald-100 selection:text-emerald-950 font-sans text-slate-800">
      <Header />
      <main className="flex-1">
        <Hero />
        <SearchBar />
        <CategoryScroll />
        <ProductGrid />
      </main>
      <Footer />

      {/* Global Interactive Overlays */}
      <ProductDetailModal />
      <StoreQRCodeModal />
      <StoreActionDock />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
