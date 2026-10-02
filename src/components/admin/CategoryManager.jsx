import React, { useState } from 'react';
import { Plus, Edit3, Trash2, FolderPlus, Layers, Save, X, GripVertical } from 'lucide-react';
import { storeService } from '../../services/storeService';
import { useStore } from '../../context/StoreContext';

const DEFAULT_EMOJI_SUGGESTIONS = ['📚', '🛒', '🥤', '🍪', '🧴', '🧹', '🛢️', '🍫', '🍞', '🥛', '✏️', '💊', '🎁'];

export function CategoryManager() {
  const { categories, store, refreshData, categoryCounts } = useStore();
  const [editingCategory, setEditingCategory] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '📦',
    description: '',
    display_order: 1,
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const startEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
      icon: cat.icon || '📦',
      description: cat.description || '',
      display_order: cat.display_order || 1,
    });
    setIsAdding(false);
  };

  const startAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      icon: '📦',
      description: '',
      display_order: categories.length + 1,
    });
    setIsAdding(true);
  };

  const cancelForm = () => {
    setEditingCategory(null);
    setIsAdding(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const slug = formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, '-');
      const payload = {
        ...formData,
        slug,
        store_id: store?.id || 'store_saini_001',
        display_order: parseInt(formData.display_order, 10) || 1,
      };

      if (editingCategory) {
        await storeService.updateCategory(editingCategory.id, payload);
      } else {
        await storeService.addCategory(payload);
      }

      cancelForm();
      refreshData();
    } catch (err) {
      console.error('Failed to save category:', err);
      alert('Error saving category: ' + err.message);
    }
  };

  const handleDelete = async (catId) => {
    try {
      await storeService.deleteCategory(catId);
      setDeleteConfirmId(null);
      refreshData();
    } catch (err) {
      console.error('Failed to delete category:', err);
      alert('Error deleting category: ' + err.message);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Manage Store Categories</h3>
          <p className="text-xs text-slate-500">
            Create and organize sections in your digital store catalogue
          </p>
        </div>

        {!isAdding && !editingCategory && (
          <button
            onClick={startAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form Card */}
      {(isAdding || editingCategory) && (
        <form onSubmit={handleSave} className="bg-emerald-50/50 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </span>
            <button type="button" onClick={cancelForm} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Cold Drinks"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Icon Emoji
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🥤"
                  className="w-14 text-center px-2 py-2 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
                />
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {DEFAULT_EMOJI_SUGGESTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: emoji })}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-emerald-100 flex items-center justify-center text-xs border border-stone-200 shrink-0"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Short Description (displayed to customer when browsing this category)
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Chilled soft drinks, juices, and packaged water"
              className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={cancelForm}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-bold shadow-xs hover:bg-emerald-900"
            >
              {editingCategory ? 'Update Category' : 'Save Category'}
            </button>
          </div>
        </form>
      )}

      {/* Category Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const count = categoryCounts[cat.id] || 0;

          return (
            <div
              key={cat.id}
              className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between gap-3 hover:border-emerald-700/30 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-100 flex items-center justify-center text-xl shrink-0 shadow-xs">
                  {cat.icon || '📦'}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{cat.name}</h4>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {count} {count === 1 ? 'product' : 'products'} • Order: #{cat.display_order || 1}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => startEdit(cat)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 transition"
                  title="Edit category"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(cat.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Delete Category?</h4>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Deleting this category will unassign products categorized under it.
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

    </div>
  );
}
