import { supabase, isSupabaseConfigured } from '../config/supabase';

const DEMO_USER_KEY = 'local_store_admin_session';

export const authService = {
  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    if (isSupabaseConfigured && supabase) {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Supabase session error:', error);
        return null;
      }
      return session?.user || null;
    }

    // Local / Demo mode session
    const localSession = localStorage.getItem(DEMO_USER_KEY);
    if (localSession) {
      try {
        return JSON.parse(localSession);
      } catch (e) {
        localStorage.removeItem(DEMO_USER_KEY);
      }
    }
    return null;
  },

  /**
   * Sign in with Email & Password
   */
  async signIn(email, password) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data.user;
    }

    // Local development / fallback admin authentication
    // Default demo credentials: any password for admin@sainistore.com or quick test
    if (email && password) {
      const mockUser = {
        id: 'usr_owner_saini',
        email: email,
        store_id: 'store_saini_001',
        role: 'owner',
        user_metadata: {
          full_name: 'Shop Owner (Saini)',
        },
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockUser));
      return mockUser;
    }

    throw new Error('Please enter valid email and password');
  },

  /**
   * Sign out
   */
  async signOut() {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    localStorage.removeItem(DEMO_USER_KEY);
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback) {
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        callback(session?.user || null);
      });
      return () => subscription.unsubscribe();
    }

    // Local listener for demo session
    const handleStorageChange = () => {
      const user = authService.getCurrentUser();
      callback(user);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }
};
