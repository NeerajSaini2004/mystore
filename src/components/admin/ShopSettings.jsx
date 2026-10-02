import React, { useState, useEffect } from 'react';
import { Save, Store, MapPin, Phone, MessageCircle, Clock, Palette, Image as ImageIcon, QrCode, Printer, Database, RotateCcw, CheckCircle2 } from 'lucide-react';
import { storeService } from '../../services/storeService';
import { useStore } from '../../context/StoreContext';
import { isSupabaseConfigured } from '../../config/supabase';

export function ShopSettings() {
  const { store, setStore, refreshData } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    location: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    whatsapp: '',
    google_maps_url: '',
    opening_hours: '',
    is_open: true,
    theme_color: '#064e3b',
    accent_color: '#d97706',
    logo_url: '',
    hero_image_url: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || '',
        tagline: store.tagline || '',
        description: store.description || '',
        location: store.location || '',
        city: store.city || 'Sikar',
        state: store.state || 'Rajasthan',
        pincode: store.pincode || '',
        phone: store.phone || '',
        whatsapp: store.whatsapp || '',
        google_maps_url: store.google_maps_url || '',
        opening_hours: store.opening_hours || '8:00 AM – 9:00 PM',
        is_open: store.is_open !== undefined ? store.is_open : true,
        theme_color: store.theme_color || '#064e3b',
        accent_color: store.accent_color || '#d97706',
        logo_url: store.logo_url || '',
        hero_image_url: store.hero_image_url || '',
      });
    }
  }, [store]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const updated = await storeService.updateStore(store?.id || 'store_saini_001', formData);
      setStore(updated);
      setSuccessMsg('Shop settings updated successfully! Customer website will reflect these changes immediately.');
      refreshData();
    } catch (err) {
      console.error('Failed to update store settings:', err);
      setErrorMsg(err.message || 'Failed to update store settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSampleData = () => {
    if (window.confirm('Reset store catalogue and details back to the default Saini General Store sample data?')) {
      storeService.resetToSampleData();
      refreshData();
      alert('Reset to Saini General Store sample catalogue complete.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Store Profile & Configuration
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            {formData.name || 'Store Settings'}
          </h2>
          <p className="text-xs text-slate-500">
            Reconfigurable for your shop or any local retail client
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition active:scale-95 disabled:opacity-50 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Changes...' : 'Save Store Profile'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Shop Identity */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-700" />
            Basic Shop Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Shop Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Saini General Store"
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tagline / Slogan
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g. Your Everyday Needs, Under One Roof"
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Shop Description
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief summary of items sold at the store..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
            />
          </div>

          {/* Open / Closed Toggle */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800">Live Store Status</div>
              <div className="text-[11px] text-slate-500">
                Display "Open Now" or "Closed" badge to customers
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className={`text-xs font-bold ${formData.is_open ? 'text-emerald-700' : 'text-slate-400'}`}>
                {formData.is_open ? '🟢 Open Now' : '🔴 Closed'}
              </span>
              <input
                type="checkbox"
                checked={formData.is_open}
                onChange={(e) => setFormData({ ...formData, is_open: e.target.checked })}
                className="w-5 h-5 rounded text-emerald-800 focus:ring-emerald-700"
              />
            </label>
          </div>
        </div>

        {/* Contact & Location Details */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-700" />
            Contact & Location Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number (for Call)
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98290 12345"
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                WhatsApp Number (no spaces)
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="919829012345"
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Daily Opening Hours
              </label>
              <input
                type="text"
                value={formData.opening_hours}
                onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                placeholder="8:00 AM – 9:00 PM"
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Street Address / Landmark
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Station Road, Near Bus Stand"
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Sikar"
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Rajasthan"
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Google Maps URL (for customer directions)
            </label>
            <input
              type="url"
              value={formData.google_maps_url}
              onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
              placeholder="https://maps.google.com/?q=..."
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
            />
          </div>
        </div>

        {/* Branding & Media */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-700" />
            Branding & Images
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Shop Logo URL
              </label>
              <input
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://..."
                className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Hero Image URL
              </label>
              <input
                type="url"
                value={formData.hero_image_url}
                onChange={(e) => setFormData({ ...formData, hero_image_url: e.target.value })}
                placeholder="https://..."
                className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
              />
            </div>
          </div>
        </div>

        {/* Database Diagnostic & Sample Reset */}
        <div className="bg-stone-100 p-5 rounded-3xl border border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-700 border border-stone-200">
              <Database className="w-5 h-5 text-emerald-800" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                {isSupabaseConfigured ? 'Connected to Supabase PostgreSQL' : 'Operating in Standalone Local Mode'}
              </div>
              <div className="text-[11px] text-slate-500">
                {isSupabaseConfigured
                  ? 'All changes sync directly to remote Supabase DB with Row Level Security'
                  : 'Changes are preserved in local browser storage. Add Supabase credentials in .env to connect cloud.'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetSampleData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-stone-200 text-slate-700 border border-stone-300 text-xs font-bold transition shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Sample Data</span>
          </button>
        </div>

      </form>
    </div>
  );
}
