import { supabase, isSupabaseConfigured } from '../config/supabase';
import { DEFAULT_STORE, DEFAULT_CATEGORIES, DEFAULT_PRODUCTS } from '../data/sampleStoreData';

const STORE_KEY = 'local_store_data_v1';
const CATEGORIES_KEY = 'local_categories_data_v1';
const PRODUCTS_KEY = 'local_products_data_v1';

// Initialize localStorage with default data if empty
function initializeLocalStorage() {
  if (!localStorage.getItem(STORE_KEY)) {
    localStorage.setItem(STORE_KEY, JSON.stringify(DEFAULT_STORE));
  }
  if (!localStorage.getItem(CATEGORIES_KEY)) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
  }
  if (!localStorage.getItem(PRODUCTS_KEY)) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
  }
}

export const storeService = {
  /**
   * Fetch Store Configuration / Settings
   */
  async getStore(storeId = 'store_saini_001') {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching store from Supabase, using local fallback:', error.message);
      } else if (data) {
        return data;
      }
    }

    initializeLocalStorage();
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_STORE;
    } catch {
      return DEFAULT_STORE;
    }
  },

  /**
   * Update Store Configuration / Settings
   */
  async updateStore(storeId, updates) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('stores')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', storeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    initializeLocalStorage();
    const current = await this.getStore(storeId);
    const updated = { ...current, ...updates };
    localStorage.setItem(STORE_KEY, JSON.stringify(updated));
    return updated;
  },

  /**
   * Get Categories for a Store
   */
  async getCategories(storeId = 'store_saini_001') {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('store_id', storeId)
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) return data;
    }

    initializeLocalStorage();
    try {
      const raw = localStorage.getItem(CATEGORIES_KEY);
      const list = raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
      return list.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  /**
   * Add a Category
   */
  async addCategory(categoryData) {
    const newCat = {
      ...categoryData,
      id: categoryData.id || `cat_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .insert([newCat])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    initializeLocalStorage();
    const categories = await this.getCategories(newCat.store_id);
    const updated = [...categories, newCat];
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated));
    return newCat;
  },

  /**
   * Update a Category
   */
  async updateCategory(categoryId, updates) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', categoryId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    initializeLocalStorage();
    const categories = await this.getCategories();
    const updated = categories.map((c) => (c.id === categoryId ? { ...c, ...updates } : c));
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated));
    return updated.find((c) => c.id === categoryId);
  },

  /**
   * Delete a Category
   */
  async deleteCategory(categoryId) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('categories').delete().eq('id', categoryId);
      if (error) throw error;
      return true;
    }

    initializeLocalStorage();
    const categories = await this.getCategories();
    const updated = categories.filter((c) => c.id !== categoryId);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated));
    return true;
  },

  /**
   * Get Public Products (Sanitized: NO cost_price or profit amounts exposed)
   */
  async getPublicProducts(storeId = 'store_saini_001') {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('public_store_products')
          .select('*')
          .eq('store_id', storeId)
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) return data;
        if (error) {
          console.warn('Supabase public_store_products error:', error.message);
        }
      } catch (err) {
        console.warn('Failed to query public_store_products from Supabase:', err);
      }
    }

    initializeLocalStorage();
    try {
      const raw = localStorage.getItem(PRODUCTS_KEY);
      const list = raw ? JSON.parse(raw) : DEFAULT_PRODUCTS;
      return list.map(({ cost_price, ...publicFields }) => ({
        ...publicFields,
        discount_percent: publicFields.mrp && publicFields.selling_price
          ? Math.round(((publicFields.mrp - publicFields.selling_price) / publicFields.mrp) * 10000) / 100
          : 0,
      }));
    } catch {
      return DEFAULT_PRODUCTS.map(({ cost_price, ...publicFields }) => publicFields);
    }
  },

  /**
   * Get Admin Products (Includes cost_price, strictly for authenticated admin)
   */
  async getAdminProducts(storeId = 'store_saini_001') {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', storeId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) return data;
        if (error) {
          console.warn('Supabase admin products error:', error.message);
        }
      } catch (err) {
        console.warn('Failed to query products from Supabase:', err);
      }
    }

    initializeLocalStorage();
    try {
      const raw = localStorage.getItem(PRODUCTS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_PRODUCTS;
    } catch {
      return DEFAULT_PRODUCTS;
    }
  },

  /**
   * Add a Product
   */
  async addProduct(productData) {
    const newProduct = {
      ...productData,
      id: productData.id || `prod_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    initializeLocalStorage();
    const products = await this.getAdminProducts(newProduct.store_id);
    const updated = [newProduct, ...products];
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
    return newProduct;
  },

  /**
   * Update a Product
   */
  async updateProduct(productId, updates) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', productId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    initializeLocalStorage();
    const products = await this.getAdminProducts();
    const updated = products.map((p) =>
      p.id === productId ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    );
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
    return updated.find((p) => p.id === productId);
  },

  /**
   * Toggle Product Availability
   */
  async toggleProductAvailability(productId, currentStatus) {
    return this.updateProduct(productId, { is_available: !currentStatus });
  },

  /**
   * Delete a Product
   */
  async deleteProduct(productId) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      return true;
    }

    initializeLocalStorage();
    const products = await this.getAdminProducts();
    const updated = products.filter((p) => p.id !== productId);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
    return true;
  },

  /**
   * Upload Image (Uses Supabase Storage if configured, or client-side compressed base64)
   */
  async uploadImage(file, folder = 'products') {
    if (isSupabaseConfigured && supabase) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('store-media')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('store-media')
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    }

    // Client-side compressed data URL for instant mobile preview and local testing
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/webp', 0.82));
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Reset local storage to initial sample Saini Store data
   */
  resetToSampleData() {
    localStorage.setItem(STORE_KEY, JSON.stringify(DEFAULT_STORE));
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
  }
};
