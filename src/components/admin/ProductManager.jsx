import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit3, Trash2, CheckCircle2, XCircle, Tag, Eye, Filter, Sparkles } from 'lucide-react';
import { formatCurrency, calculateDiscountPercent } from '../../utils/calculations';
import { storeService } from '../../services/storeService';
import { useStore } from '../../context/StoreContext';
import { ProductFormModal } from './ProductFormModal';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';

export function ProductManager() {
  const { products, categories, refreshData } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // all, in_stock, out_of_stock
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Filtered product items
  const displayProducts = useMemo(() => {
    return products.filter((p) => {
      // Category match
      if (selectedCat !== 'all' && p.category_id !== selectedCat) return false;
      // Stock match
      if (stockFilter === 'in_stock' && !p.is_available) return false;
      if (stockFilter === 'out_of_stock' && p.is_available) return false;
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesBrand = p.brand?.toLowerCase().includes(q);
        return matchesName || matchesBrand;
      }
      return true;
    });
  }, [products, selectedCat, stockFilter, searchTerm]);

  const handleToggleAvailability = async (productId, currentStatus) => {
    try {
      await storeService.toggleProductAvailability(productId, currentStatus);
      refreshData();
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const handleDelete = async (productId) => {
    try {
      await storeService.deleteProduct(productId);
      setDeleteConfirmId(null);
      refreshData();
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      
      {/* Top Controls: Search, Filters, Add Button */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by name or brand..."
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>

        {/* Stock Filter */}
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
        >
          <option value="all">All Stock Status</option>
          <option value="in_stock">In Stock Only</option>
          <option value="out_of_stock">Out of Stock Only</option>
        </select>

        {/* Add Product Button */}
        <button
          onClick={handleAddNew}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Product List Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{displayProducts.length}</strong> of {products.length} products
        </span>
      </div>

      {/* Mobile Card View (< sm) */}
      <div className="grid grid-cols-1 gap-2.5 sm:hidden">
        {displayProducts.map((p) => {
          const cat = categories.find((c) => c.id === p.category_id);
          const discount = calculateDiscountPercent(p.mrp, p.selling_price);

          return (
            <div
              key={p.id}
              className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between gap-3"
            >
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                {p.image_url ? (
                  <img
                    src={getOptimizedImageUrl(p.image_url, { width: 112, height: 112 })}
                    alt={p.name}
                    width="56"
                    height="56"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    {p.brand || cat?.name}
                  </span>
                  {p.is_featured && (
                    <span className="text-[10px] text-amber-800 bg-amber-100 px-1 rounded font-semibold">
                      Featured
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900 truncate">{p.name}</h4>
                <div className="flex items-center gap-1.5 text-xs mt-0.5">
                  <span className="font-extrabold text-slate-900">{formatCurrency(p.selling_price)}</span>
                  {p.mrp && p.mrp > p.selling_price && (
                    <span className="text-[10px] text-slate-400 line-through">
                      {formatCurrency(p.mrp)}
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1 rounded">
                      {discount}% OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Toggle & Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleToggleAvailability(p.id, p.is_available)}
                  className={`p-1.5 rounded-lg border text-xs font-bold transition ${
                    p.is_available
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                  title="Toggle stock availability"
                >
                  {p.is_available ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => handleEdit(p)}
                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700"
                  title="Edit product"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDeleteConfirmId(p.id)}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View (>= sm) */}
      <div className="hidden sm:block bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Store Price</th>
                <th className="py-3 px-4">MRP & Discount</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {displayProducts.map((p) => {
                const cat = categories.find((c) => c.id === p.category_id);
                const discount = calculateDiscountPercent(p.mrp, p.selling_price);

                return (
                  <tr key={p.id} className="hover:bg-stone-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                          {p.image_url ? (
                            <img
                              src={getOptimizedImageUrl(p.image_url, { width: 80, height: 80 })}
                              alt={p.name}
                              width="40"
                              height="40"
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm">📦</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{p.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <span>{p.brand || 'No brand'}</span>
                            {p.pack_size && <span>• {p.pack_size}</span>}
                            {p.is_featured && (
                              <span className="text-[10px] text-amber-800 bg-amber-100 px-1 rounded font-semibold ml-1">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {cat?.icon} {cat?.name || 'General'}
                    </td>

                    <td className="py-3 px-4 font-extrabold text-slate-900 text-sm">
                      {formatCurrency(p.selling_price)}
                    </td>

                    <td className="py-3 px-4">
                      {p.mrp ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 line-through">
                            {formatCurrency(p.mrp)}
                          </span>
                          {discount > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                              {discount}% OFF
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleAvailability(p.id, p.is_available)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition border ${
                          p.is_available
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300/80 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                        }`}
                      >
                        {p.is_available ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Out of Stock</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 transition"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Delete this product?</h4>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              This action will remove the product from your store catalogue.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-2.5 rounded-xl bg-stone-100 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        product={editingProduct}
        onClose={() => setIsModalOpen(false)}
        onSaved={refreshData}
      />
    </div>
  );
}
