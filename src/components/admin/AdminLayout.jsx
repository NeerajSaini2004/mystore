import React, { useState } from 'react';
import { LayoutDashboard, Package, FolderTree, Settings, ExternalLink, LogOut, Plus, Store, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { authService } from '../../services/authService';
import { AdminStats } from './AdminStats';
import { ProductManager } from './ProductManager';
import { CategoryManager } from './CategoryManager';
import { ShopSettings } from './ShopSettings';
import { ProductFormModal } from './ProductFormModal';

export function AdminLayout() {
  const { store, user, setUser, navigateTo, refreshData } = useStore();
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, categories, settings
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleLogout = async () => {
    await authService.signOut();
    setUser(null);
    navigateTo('/');
  };

  return (
    <div className="min-h-screen bg-stone-100/90 text-slate-800 flex flex-col pb-20 sm:pb-8">
      
      {/* Admin Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200/90 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          
          {/* Store Info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-900 text-amber-300 font-bold flex items-center justify-center text-base shadow-xs">
              <Store className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                  {store?.name || 'Store Admin'}
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  Shop Owner
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Catalogue Administration Portal
              </div>
            </div>
          </div>

          {/* Desktop Tab Links */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'products'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'categories'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>Categories</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Shop Settings</span>
            </button>
          </nav>

          {/* Actions: View Store Website & Logout */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">View Customer Store</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="max-w-6xl w-full mx-auto px-4 py-5 flex-1">
        {activeTab === 'overview' && (
          <AdminStats onAddProduct={() => setIsAddModalOpen(true)} />
        )}

        {activeTab === 'products' && (
          <ProductManager />
        )}

        {activeTab === 'categories' && (
          <CategoryManager />
        )}

        {activeTab === 'settings' && (
          <ShopSettings />
        )}
      </main>

      {/* Mobile Bottom Navigation Dock for Admin (< md) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 md:hidden py-1.5 px-4 shadow-2xl">
        <div className="grid grid-cols-4 gap-1 text-center">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center py-1.5 px-1 rounded-xl transition ${
              activeTab === 'overview' ? 'text-emerald-800 font-bold bg-emerald-50' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex flex-col items-center py-1.5 px-1 rounded-xl transition ${
              activeTab === 'products' ? 'text-emerald-800 font-bold bg-emerald-50' : 'text-slate-500'
            }`}
          >
            <Package className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Products</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex flex-col items-center py-1.5 px-1 rounded-xl transition ${
              activeTab === 'categories' ? 'text-emerald-800 font-bold bg-emerald-50' : 'text-slate-500'
            }`}
          >
            <FolderTree className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Categories</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center py-1.5 px-1 rounded-xl transition ${
              activeTab === 'settings' ? 'text-emerald-800 font-bold bg-emerald-50' : 'text-slate-500'
            }`}
          >
            <Settings className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Settings</span>
          </button>
        </div>
      </div>

      {/* Quick Add Product Modal */}
      <ProductFormModal
        isOpen={isAddModalOpen}
        product={null}
        onClose={() => setIsAddModalOpen(false)}
        onSaved={refreshData}
      />
    </div>
  );
}
