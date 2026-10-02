import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Layers } from 'lucide-react';

export function CategoryScroll() {
  const { categories, selectedCategory, setSelectedCategory, categoryCounts } = useStore();

  const handleSelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  return (
    <section className="max-w-5xl mx-auto px-4 mt-6 sm:mt-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Shop by Category</span>
        </h3>
        <span className="text-xs text-slate-500 font-medium">
          {categories.length} Categories
        </span>
      </div>

      {/* Horizontal pill / card scroll */}
      <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
        {/* All Products button */}
        <button
          onClick={() => handleSelect('all')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border transition-all shrink-0 select-none ${
            selectedCategory === 'all'
              ? 'bg-emerald-900 text-white border-emerald-900 shadow-md shadow-emerald-950/20 scale-[1.02]'
              : 'bg-white hover:bg-emerald-50/50 text-slate-700 border-stone-200/90 shadow-xs'
          }`}
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${
            selectedCategory === 'all' ? 'bg-emerald-800 text-amber-300' : 'bg-slate-100 text-slate-600'
          }`}>
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-xs sm:text-sm font-bold leading-tight">All Items</div>
            <div className={`text-[10px] ${selectedCategory === 'all' ? 'text-emerald-200' : 'text-slate-400'}`}>
              {categoryCounts.all || 0} products
            </div>
          </div>
        </button>

        {/* Dynamic Categories */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = categoryCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border transition-all shrink-0 select-none ${
                isSelected
                  ? 'bg-emerald-900 text-white border-emerald-900 shadow-md shadow-emerald-950/20 scale-[1.02]'
                  : 'bg-white hover:bg-emerald-50/50 text-slate-700 border-stone-200/90 shadow-xs'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base ${
                isSelected ? 'bg-emerald-800' : 'bg-emerald-50/80'
              }`}>
                <span>{cat.icon || '📦'}</span>
              </div>
              <div className="text-left">
                <div className="text-xs sm:text-sm font-bold leading-tight whitespace-nowrap">
                  {cat.name}
                </div>
                <div className={`text-[10px] ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                  {count} {count === 1 ? 'item' : 'items'}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
