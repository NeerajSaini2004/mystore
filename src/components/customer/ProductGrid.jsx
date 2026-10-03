import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { PackageOpen, Sparkles, Filter, CheckCircle2, RotateCcw } from 'lucide-react';

export function ProductGrid() {
  const {
    filteredProducts,
    featuredProducts,
    selectedCategory,
    setSelectedCategory,
    categories,
    availabilityFilter,
    setAvailabilityFilter,
    searchQuery,
    setSearchQuery,
    isProductsLoading,
  } = useStore();

  const currentCategoryObj = categories.find((c) => c.id === selectedCategory);

  // Clear all active filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setAvailabilityFilter('all');
  };

  return (
    <section className="max-w-5xl mx-auto px-4 mt-6 sm:mt-8 pb-20">
      
      {/* Category Banner (if specific category is chosen) */}
      {selectedCategory !== 'all' && currentCategoryObj && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-950 text-white shadow-md flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentCategoryObj.icon || '📦'}</span>
              <h3 className="text-lg sm:text-2xl font-extrabold uppercase tracking-tight text-white">
                {currentCategoryObj.name}
              </h3>
            </div>
            {currentCategoryObj.description && (
              <p className="text-xs sm:text-sm text-emerald-200 mt-1 max-w-xl">
                {currentCategoryObj.description}
              </p>
            )}
          </div>
          <button
            onClick={() => setSelectedCategory('all')}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-emerald-100 transition shrink-0"
          >
            Show All
          </button>
        </div>
      )}

      {/* Grid Controls: Availability Filter Tabs & Total Count */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4">
        <div className="flex items-center gap-1.5 bg-stone-200/70 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setAvailabilityFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              availabilityFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setAvailabilityFilter('in_stock')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${
              availabilityFilter === 'in_stock'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            In Stock Only
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {isProductsLoading ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-800 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
              Checking catalogue availability...
            </span>
          ) : (
            <>
              Showing <span className="font-bold text-slate-800">{filteredProducts.length}</span> products
            </>
          )}
        </div>
      </div>

      {/* Featured Products Spotlight (Only displayed on default All view when not actively searching) */}
      {!isProductsLoading && selectedCategory === 'all' && !searchQuery && availabilityFilter === 'all' && featuredProducts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Popular & Essentials
            </h3>
            <span className="text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
              Verified Stock
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={`feat-${product.id}`} product={product} priority={true} />
            ))}
          </div>

          <div className="my-8 border-t border-stone-200/80"></div>
          
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-3">
            All Catalogue Items
          </h3>
        </div>
      )}

      {/* Products Grid or Progressive Skeleton Loading State */}
      {isProductsLoading ? (
        /* Non-blocking Progressive Skeleton Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
            <div
              key={`skeleton-${index}`}
              className="bg-white rounded-2xl border border-stone-200/80 p-3 sm:p-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="aspect-square w-full bg-stone-200/80 rounded-xl mb-3"></div>
                <div className="h-3 bg-stone-200/80 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-stone-200/80 rounded w-4/5 mb-1.5"></div>
                <div className="h-3 bg-stone-100 rounded w-1/2"></div>
              </div>
              <div className="mt-4 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                <div className="h-5 bg-stone-200/80 rounded w-16"></div>
                <div className="h-4 bg-stone-100 rounded w-10"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {filteredProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} priority={idx < 4} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-14 px-4 text-center bg-white rounded-3xl border border-dashed border-stone-300 max-w-lg mx-auto my-6 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 text-3xl">
            <PackageOpen className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-800 mb-1">
            No products found
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-5">
            {searchQuery
              ? `We couldn't find any products matching "${searchQuery}". Try checking for spelling or searching for a general term.`
              : 'There are no products listed under this category with the current filter.'}
          </p>

          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Filters
          </button>
        </div>
      )}
    </section>
  );
}
