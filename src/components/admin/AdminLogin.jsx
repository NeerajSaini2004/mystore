import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, Store, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/authService';
import { useStore } from '../../context/StoreContext';

export function AdminLogin() {
  const { store, setUser, navigateTo, isSupabaseConfigured } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const loggedUser = await authService.signIn(email, password);
      setUser(loggedUser);
    } catch (err) {
      console.error('Sign in error:', err);
      setErrorMsg(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsSubmitting(true);
    try {
      const loggedUser = await authService.signIn('owner@sainistore.com', 'demo12345');
      setUser(loggedUser);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center items-center p-4">
      {/* Back to store website */}
      <div className="w-full max-w-md mb-4 text-left">
        <button
          onClick={() => navigateTo('/')}
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition"
        >
          ← Back to Customer Catalogue
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-stone-200/90 p-6 sm:p-8">
        
        {/* Branding */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-amber-300 flex items-center justify-center mx-auto mb-3 text-xl font-bold shadow-md">
            <Lock className="w-6 h-6 text-amber-300" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Store Owner Portal
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage <strong className="text-slate-700">{store?.name || 'Your Store'}</strong> catalogue, prices & inventory
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="storeowner@example.com"
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40 focus:border-emerald-700 transition"
              />
              <Mail className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40 focus:border-emerald-700 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Logging in...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Tap Quick Demo Login - Only shown in local offline mode without Supabase */}
        {!isSupabaseConfigured && (
          <div className="mt-5 pt-5 border-t border-stone-100">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <Store className="w-4 h-4 text-amber-700" />
              <span>1-Tap Demo Shopkeeper Access (Local Mode)</span>
            </button>

            <p className="text-[11px] text-center text-slate-400 mt-2.5">
              ⚡ Local offline storage mode active. Connect Supabase to enable secure login.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
