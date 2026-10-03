import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { storeService } from '../services/storeService';
import { authService } from '../services/authService';
import { isSupabaseConfigured } from '../config/supabase';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  // Store metadata & Progressive loading states
  const [store, setStore] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Decoupled loading states for instant UI rendering
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
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

  // Guard refs to prevent duplicate fetches from React StrictMode & re-renders
  const initialLoadTriggeredRef = useRef(false);
  const prevUserRef = useRef(null);

  // Check URL path or hash to toggle admin view
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

  // Optimized Single Initial Data Loading Flow
  const loadInitialData = useCallback(async (isAuthUser = false) => {
    setError(null);
    setIsProductsLoading(true);

    try {
      // 1. Parallel fetch: Launch store, categories, and products simultaneously from t=0
      const storePromise = storeService.getStore();
      const categoriesPromise = storeService.getCategories();
      const productsPromise = isAuthUser
        ? storeService.getAdminProducts()
        : storeService.getPublicProducts();

      // 2. Early resolution: As soon as store shell and categories arrive (~400ms),
      // dismiss full-page loading and show header/categories/hero immediately!
      Promise.all([storePromise, categoriesPromise])
        .then(([storeData, categoriesData]) => {
          setStore(storeData);
          setCategories(categoriesData || []);
          setIsInitialLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load store shell:', err);
          setIsInitialLoading(false);
        });

      // 3. Resolve products concurrently without blocking the store header
      const productsData = await productsPromise;
      setProducts(productsData || []);
    } catch (err) {
      console.error('Failed to load initial catalogue data:', err);
      setError('Unable to load store catalogue. Please check your connection.');
    } finally {
      setIsInitialLoading(false);
      setIsProductsLoading(false);
    }
  }, []);

  // Initial mount trigger (Runs ONCE, safe from StrictMode double-call)
  useEffect(() => {
    if (initialLoadTriggeredRef.current) return;
    initialLoadTriggeredRef.current = true;

    // Check auth session once on boot, then start parallel fetch
    authService.getCurrentUser().then((initialUser) => {
      setUser(initialUser);
      prevUserRef.current = initialUser;
      loadInitialData(Boolean(initialUser));
    });

    // Listen for future auth changes (login/logout events)
    const unsubscribe = authService.onAuthStateChange((nextUser) => {
      const prevWasAuth = Boolean(prevUserRef.current);
      const nextIsAuth = Boolean(nextUser);
      setUser(nextUser);
      prevUserRef.current = nextUser;

      // Only re-fetch products if the user transitioned between guest and authenticated admin
      if (prevWasAuth !== nextIsAuth) {
        setIsProductsLoading(true);
        const fetcher = nextIsAuth
          ? storeService.getAdminProducts(undefined, true)
          : storeService.getPublicProducts(undefined, true);

        fetcher
          .then((data) => setProducts(data || []))
          .finally(() => setIsProductsLoading(false));
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [loadInitialData]);

  // Explicit Refresh for Admin mutations (e.g. after adding/editing products or settings)
  const refreshData = useCallback(async (force = true) => {
    setError(null);
    setIsProductsLoading(true);
    try {
      const isAuth = Boolean(user);
      const [storeData, categoriesData, productsData] = await Promise.all([
        storeService.getStore(undefined, force),
        storeService.getCategories(undefined, force),
        isAuth ? storeService.getAdminProducts(undefined, force) : storeService.getPublicProducts(undefined, force),
      ]);

      setStore(storeData);
      setCategories(categoriesData || []);
      setProducts(productsData || []);
    } catch (err) {
      console.error('Failed to refresh data:', err);
    } finally {
      setIsInitialLoading(false);
      setIsProductsLoading(false);
    }
  }, [user]);

  // Dynamic document title based on store data
  useEffect(() => {
    if (store?.name) {
      document.title = `${store.name} | Live Digital Catalogue & Availability`;
    }
  }, [store]);

  // Fast Client-Side Product Filter & Search
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
    // Loading states
    isLoading: isInitialLoading, // Backwards compatible
    isInitialLoading,
    isProductsLoading,
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
