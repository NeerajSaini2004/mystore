import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { storeService } from '../services/storeService';
import { authService } from '../services/authService';
import { isSupabaseConfigured } from '../config/supabase';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  // Store metadata
  const [store, setStore] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Authentication & Admin state
  const [user, setUser] = useState(null);
  const [isAdminView, setIsAdminView] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all' | 'in_stock' | 'out_of_stock'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Check URL path or hash to toggle admin view on initial load
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.startsWith('/admin') || hash.startsWith('#/admin')) {
        setIsAdminView(true);
      } else {
        setIsAdminView(false);
      }
    };
    checkRoute();
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  // Sync route changes
  const navigateTo = useCallback((path) => {
    if (path.startsWith('/admin') || path.startsWith('#/admin')) {
      window.history.pushState(null, '', path);
      setIsAdminView(true);
    } else {
      window.history.pushState(null, '', path);
      setIsAdminView(false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Load Auth State
  useEffect(() => {
    authService.getCurrentUser().then(setUser);
    const unsubscribe = authService.onAuthStateChange(setUser);
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Fetch Store Data (Store details, Categories, and Products)
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const storeData = await storeService.getStore();
      const categoriesData = await storeService.getCategories();
      
      // If user is authenticated admin, load admin products (with cost_price); else safe public products
      const isAuthAdmin = Boolean(user);
      const productsData = isAuthAdmin 
        ? await storeService.getAdminProducts()
        : await storeService.getPublicProducts();

      setStore(storeData);
      setCategories(categoriesData);
      setProducts(productsData);
    } catch (err) {
      console.error('Failed to load store catalog data:', err);
      setError('Unable to load store catalogue. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Dynamic document title & meta tags based on store data
  useEffect(() => {
    if (store?.name) {
      document.title = `${store.name} | Live Digital Catalogue & Availability`;
    }
  }, [store]);

  // Fast Client-Side Product Filter & Fuzzy Search
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let list = [...products];

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      list = list.filter((p) => p.category_id === selectedCategory);
    }

    // Availability filter
    if (availabilityFilter === 'in_stock') {
      list = list.filter((p) => p.is_available);
    } else if (availabilityFilter === 'out_of_stock') {
      list = list.filter((p) => !p.is_available);
    }

    // Search query: matching product name, category name, brand, keywords, description
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const catMap = new Map(categories.map((c) => [c.id, c.name.toLowerCase()]));

      list = list.filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(q);
        const brandMatch = p.brand?.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        const keywordsMatch = p.keywords?.toLowerCase().includes(q);
        const catName = catMap.get(p.category_id) || '';
        const catMatch = catName.includes(q);

        return nameMatch || brandMatch || descMatch || keywordsMatch || catMatch;
      });
    }

    return list;
  }, [products, categories, selectedCategory, availabilityFilter, searchQuery]);

  // Featured products subset
  const featuredProducts = useMemo(() => {
    return products.filter((p) => p.is_featured && p.is_available);
  }, [products]);

  // Category counts map
  const categoryCounts = useMemo(() => {
    const counts = { all: products.length };
    products.forEach((p) => {
      counts[p.category_id] = (counts[p.category_id] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Context value
  const value = {
    store,
    setStore,
    categories,
    products,
    filteredProducts,
    featuredProducts,
    categoryCounts,
    isLoading,
    error,
    refreshData,
    // Filters & Search
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    availabilityFilter,
    setAvailabilityFilter,
    // Modals
    selectedProduct,
    setSelectedProduct,
    isQRModalOpen,
    setIsQRModalOpen,
    // Navigation & Auth
    isAdminView,
    setIsAdminView,
    navigateTo,
    user,
    setUser,
    isSupabaseConfigured,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
