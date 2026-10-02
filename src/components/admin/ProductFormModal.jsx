import React, { useState, useEffect } from 'react';
import { X, Camera, Upload, Trash2, Lock, Tag, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { calculateDiscountPercent, calculateProfitAmount, calculateProfitPercent, formatCurrency } from '../../utils/calculations';
import { storeService } from '../../services/storeService';
import { useStore } from '../../context/StoreContext';

export function ProductFormModal({ product, isOpen, onClose, onSaved }) {
  const { categories, store } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category_id: '',
    pack_size: '',
    mrp: '',
    cost_price: '',
    selling_price: '',
    is_available: true,
    is_featured: false,
    image_url: '',
    description: '',
    keywords: '',
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Populate data when editing
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        category_id: product.category_id || categories[0]?.id || '',
        pack_size: product.pack_size || '',
        mrp: product.mrp || '',
        cost_price: product.cost_price || '',
        selling_price: product.selling_price || '',
        is_available: product.is_available !== undefined ? product.is_available : true,
        is_featured: product.is_featured || false,
        image_url: product.image_url || '',
        description: product.description || '',
        keywords: product.keywords || '',
      });
    } else {
      setFormData({
        name: '',
        brand: '',
        category_id: categories[0]?.id || '',
        pack_size: '',
        mrp: '',
        cost_price: '',
        selling_price: '',
        is_available: true,
        is_featured: false,
        image_url: '',
        description: '',
        keywords: '',
      });
    }
    setErrorMsg('');
  }, [product, categories, isOpen]);

  if (!isOpen) return null;

  // Real-time calculations
  const discountPercent = calculateDiscountPercent(formData.mrp, formData.selling_price);
  const profitAmount = calculateProfitAmount(formData.selling_price, formData.cost_price);
  const profitPercent = calculateProfitPercent(formData.selling_price, formData.cost_price);

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg('');
    try {
      const uploadedUrl = await storeService.uploadImage(file, 'products');
      setFormData((prev) => ({ ...prev, image_url: uploadedUrl }));
    } catch (err) {
      console.error('Image upload failed:', err);
      setErrorMsg('Failed to process image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Product name is required');
      return;
    }
    if (!formData.selling_price) {
      setErrorMsg('Selling price is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        ...formData,
        store_id: store?.id || 'store_saini_001',
        mrp: parseFloat(formData.mrp) || parseFloat(formData.selling_price),
        selling_price: parseFloat(formData.selling_price),
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
      };

      if (product?.id) {
        await storeService.updateProduct(product.id, payload);
      } else {
        await storeService.addProduct(payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error('Save product error:', err);
      setErrorMsg(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10 animate-slide-up border border-stone-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {product ? 'Edit Catalogue Product' : 'Add New Store Product'}
            </h3>
            <p className="text-xs text-slate-500">
              Live updates will reflect immediately on the customer catalogue
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Product Image Upload (Camera / Gallery) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Product Image
            </label>
            <div className="flex items-center gap-3">
              {formData.image_url ? (
                <div className="relative w-24 h-24 rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 group">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute inset-0 bg-rose-950/70 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs font-bold"
                  >
                    <Trash2 className="w-4 h-4 mb-1" />
                    <span>Remove</span>
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-stone-100 border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 shrink-0">
                  <Camera className="w-6 h-6 mb-1 text-stone-400" />
                  <span className="text-[10px] font-semibold">No Image</span>
                </div>
              )}

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>{isUploading ? 'Uploading...' : 'Take Photo / Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="Or paste external image URL"
                  className="w-full text-xs px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Product Name & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Classmate Notebook"
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. ITC Classmate"
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
              />
            </div>
          </div>

          {/* Category & Pack Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pack Size / Variant
              </label>
              <input
                type="text"
                value={formData.pack_size}
                onChange={(e) => setFormData({ ...formData, pack_size: e.target.value })}
                placeholder="e.g. 172 Pages / 250g / 500ml"
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
              />
            </div>
          </div>

          {/* PRICING & AUTOMATIC CALCULATIONS SECTION */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-700" />
                Price & Margin Settings
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-full">
                <Lock className="w-3 h-3" />
                Cost & Profit are Private
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  MRP (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                  placeholder="130"
                  className="w-full px-2.5 py-1.5 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                  placeholder="110"
                  className="w-full px-2.5 py-1.5 text-sm bg-white border border-emerald-400 font-bold text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-0.5">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Cost Price (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                  placeholder="90"
                  className="w-full px-2.5 py-1.5 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
            </div>

            {/* LIVE AUTOMATIC CALCULATIONS DISPLAY */}
            <div className="p-3 bg-white rounded-xl border border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Customer Discount:</span>
                <span className="font-extrabold text-amber-700 text-sm">
                  {discountPercent > 0 ? `${discountPercent}% OFF` : '0%'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Profit Amount (₹):</span>
                <span className={`font-extrabold text-sm ${profitAmount >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {formatCurrency(profitAmount)}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Profit Margin (%):</span>
                <span className={`font-extrabold text-sm ${profitPercent >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {profitPercent > 0 ? `${profitPercent}%` : '0%'}
                </span>
              </div>
            </div>
          </div>

          {/* Availability & Featured Toggles */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700"
              />
              <div>
                <div className="text-xs font-bold text-slate-800">In Stock</div>
                <div className="text-[10px] text-slate-500">Visible as available to customers</div>
              </div>
            </label>

            <label className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-800">Featured</div>
                <div className="text-[10px] text-slate-500">Highlighted on homepage</div>
              </div>
            </label>
          </div>

          {/* Description & Search Keywords */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Short Description (Optional)
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. 172-page ruled single line notebook from Classmate ITC..."
              className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Search Keywords (for instant matching)
            </label>
            <input
              type="text"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder="e.g. copy register diary stationary classmate"
              className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-bold transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Save & Publish Product'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
