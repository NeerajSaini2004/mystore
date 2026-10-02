import React, { useRef } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const POPULAR_SEARCH_TAGS = [
  'Notebook',
  'Tata Tea',
  'Coca-Cola',
  'Pencil',
  'Atta',
  'Oil',
  'Soap',
  'Snacks'
];

export function SearchBar() {
  const { searchQuery, setSearchQuery, filteredProducts, setSelectedCategory } = useStore();
  const inputRef = useRef(null);

  const handleClear = () => {
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleTagClick = (tag) => {
    setSearchQuery(tag);
    // Reset category filter to 'all' so customer gets full results across the store
    setSelectedCategory('all');
  };

  return (
    <div className="w-full max-w-3xl mx-auto -mt-6 sm:-mt-7 px-4 relative z-20">
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-emerald-900/15 p-2 sm:p-2.5 transition-all focus-within:ring-2 focus-within:ring-emerald-700/50 focus-within:border-emerald-700">
        <div className="relative flex items-center">
          <div className="absolute left-3.5 flex items-center pointer-events-none text-emerald-800">
            <Search className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a product... (e.g. tea, notebook, cola)"
            className="w-full pl-11 sm:pl-12 pr-10 py-3 sm:py-3.5 text-sm sm:text-base font-medium text-slate-800 placeholder-slate-400 bg-transparent rounded-xl focus:outline-none"
            aria-label="Search store products"
          />

          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Popular quick-tap tags */}
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 pl-1">
            Quick:
          </span>
          {POPULAR_SEARCH_TAGS.map((tag) => {
            const isActive = searchQuery.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition font-medium ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live search feedback counter */}
      {searchQuery && (
        <div className="mt-2 px-2 flex items-center justify-between text-xs text-slate-600">
          <span>
            Found <strong className="text-emerald-800">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'item' : 'items'} matching "<span className="italic">{searchQuery}</span>"
          </span>
          <button
            onClick={() => setSearchQuery('')}
            className="text-emerald-700 hover:underline font-medium"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
}
