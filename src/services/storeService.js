import { supabase, isSupabaseConfigured } from '../config/supabase';
import { DEFAULT_STORE, DEFAULT_CATEGORIES, DEFAULT_PRODUCTS } from '../data/sampleStoreData';

const STORE_KEY = 'local_store_data_v1';
const CATEGORIES_KEY = 'local_categories_data_v1';
const PRODUCTS_KEY = 'local_products_data_v1';

// In-flight request deduplication map to prevent duplicate concurrent network calls
const inFlightRequests = new Map();

// In-memory cache to avoid duplicate network fetches during component transitions
const memoryCache = {
  store: null,
  categories: null,
  publicProducts: null,
  adminProducts: null,
};

function dedupeRequest(key, fetcher) {
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key);
  }
  const promise = (async () => {
    try {
      return await fetcher();
    } finally {
      inFlightRequests.delete(key);
    }
  })();
  inFlightRequests.set(key, promise);
  return promise;
}

export function clearStoreCache(keys = ['store', 'categories', 'publicProducts', 'adminProducts']) {
  keys.forEach((k) => {
    memoryCache[k] = null;
  });
}

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
   * Fetch Store Configuration / Settings (Deduplicated & Cached)
   */
  async getStore(storeId = 'store_saini_001', force = false) {
    if (!force && memoryCache.store && memoryCache.store.id === storeId) {
      return memoryCache.store;
    }

    return dedupeRequest(`store_${storeId}`, async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('stores')
            .select('*')
            .eq('id', storeId)
            .maybeSingle();

          if (!error && data) {
            memoryCache.store = data;
            return data;
          }
          if (error) {
            console.warn('Error fetching store from Supabase, using local fallback:', error.message);
          }
        } catch (err) {
          console.warn('Supabase store fetch exception:', err);
        }
      }

      initializeLocalStorage();
      try {
        const raw = localStorage.getItem(STORE_KEY);
        const res = raw ? JSON.parse(raw) : DEFAULT_STORE;
        memoryCache.store = res;
        return res;
      } catch {
        memoryCache.store = DEFAULT_STORE;
        return DEFAULT_STORE;
      }
    });
  },

  /**
   * Update Store Configuration / Settings
   */
  async updateStore(storeId, updates) {
    memoryCache.store = null;
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('stores')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', storeId)
        .select()
        .single();

      if (error) throw error;
      memoryCache.store = data;
      return data;
    }

    initializeLocalStorage();
    const current = await this.getStore(storeId, true);
    const updated = { ...current, ...updates };
    localStorage.setItem(STORE_KEY, JSON.stringify(updated));
    memoryCache.store = updated;
    return updated;
  },

  /**
   * Get Categories for a Store (Deduplicated & Cached)
   */
  async getCategories(storeId = 'store_saini_001', force = false) {
    if (!force && memoryCache.categories) {
      return memoryCache.categories;
    }

    return dedupeRequest(`categories_${storeId}`, async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('store_id', storeId)
            .order('display_order', { ascending: true });

          if (!error && data && data.length > 0) {
            memoryCache.categories = data;
            return data;
          }
          if (error) {
            console.warn('Supabase categories error:', error.message);
          }
        } catch (err) {
          console.warn('Supabase categories fetch exception:', err);
        }
      }

      initializeLocalStorage();
      try {
        const raw = localStorage.getItem(CATEGORIES_KEY);
        const list = raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
        const sorted = list.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        memoryCache.categories = sorted;
        return sorted;
      } catch {
        memoryCache.categories = DEFAULT_CATEGORIES;
        return DEFAULT_CATEGORIES;
      }
    });
  },

  /**
   * Add a Category
   */
  async addCategory(categoryData) {
    memoryCache.categories = null;
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
    const categories = await this.getCategories(newCat.store_id, true);
    const updated = [...categories, newCat];
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated));
    return newCat;
  },

  /**
   * Update a Category
   */
  async updateCategory(categoryId, updates) {
    memoryCache.categories = null;
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
    const categories = await this.getCategories(undefined, true);
    const updated = categories.map((c) => (c.id === categoryId ? { ...c, ...updates } : c));
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated));
    return updated.find((c) => c.id === categoryId);
  },

  /**
   * Delete a Category
   */
  async deleteCategory(categoryId) {
    memoryCache.categories = null;
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('categories').delete().eq('id', categoryId);
      if (error) throw error;
      return true;
    }

    initializeLocalStorage();
    const categories = await this.getCategories(undefined, true);
    const updated = categories.filter((c) => c.id !== categoryId);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated));
    return true;
  },

  /**
   * Get Public Products (Sanitized: NO cost_price or profit amounts exposed) - Deduplicated & Cached
   */
  async getPublicProducts(storeId = 'store_saini_001', force = false) {
    if (!force && memoryCache.publicProducts) {
      return memoryCache.publicProducts;
    }

    return dedupeRequest(`public_products_${storeId}`, async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('public_store_products')
            .select('*')
            .eq('store_id', storeId)
            .order('name', { ascending: true });

          if (!error && data && data.length > 0) {
            memoryCache.publicProducts = data;
            return data;
          }
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
        const mapped = list.map(({ cost_price, ...publicFields }) => ({
          ...publicFields,
          discount_percent: publicFields.mrp && publicFields.selling_price
            ? Math.round(((publicFields.mrp - publicFields.selling_price) / publicFields.mrp) * 10000) / 100
            : 0,
        }));
        memoryCache.publicProducts = mapped;
        return mapped;
      } catch {
        const fallback = DEFAULT_PRODUCTS.map(({ cost_price, ...publicFields }) => publicFields);
        memoryCache.publicProducts = fallback;
        return fallback;
      }
    });
  },

  /**
   * Get Admin Products (Includes cost_price, strictly for authenticated admin) - Deduplicated & Cached
   */
  async getAdminProducts(storeId = 'store_saini_001', force = false) {
    if (!force && memoryCache.adminProducts) {
      return memoryCache.adminProducts;
    }

    return dedupeRequest(`admin_products_${storeId}`, async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('store_id', storeId)
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            memoryCache.adminProducts = data;
            return data;
          }
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
        const list = raw ? JSON.parse(raw) : DEFAULT_PRODUCTS;
        memoryCache.adminProducts = list;
        return list;
      } catch {
        memoryCache.adminProducts = DEFAULT_PRODUCTS;
        return DEFAULT_PRODUCTS;
      }
    });
  },

  /**
   * Add a Product
   */
  async addProduct(productData) {
    clearStoreCache(['publicProducts', 'adminProducts']);
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
    const products = await this.getAdminProducts(newProduct.store_id, true);
    const updated = [newProduct, ...products];
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
    return newProduct;
  },

  /**
   * Update a Product
   */
  async updateProduct(productId, updates) {
    clearStoreCache(['publicProducts', 'adminProducts']);
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
    const products = await this.getAdminProducts(undefined, true);
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
    clearStoreCache(['publicProducts', 'adminProducts']);
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      return true;
    }

    initializeLocalStorage();
    const products = await this.getAdminProducts(undefined, true);
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
    clearStoreCache();
    localStorage.setItem(STORE_KEY, JSON.stringify(DEFAULT_STORE));
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
  }
};
