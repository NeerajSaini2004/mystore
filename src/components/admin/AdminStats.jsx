import React, { useState } from 'react';
import { Package, CheckCircle2, XCircle, FolderTree, IndianRupee, TrendingUp, Eye, EyeOff, Plus } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';
import { useStore } from '../../context/StoreContext';

export function AdminStats({ onAddProduct }) {
  const { products, categories } = useStore();
  const [showFinancials, setShowFinancials] = useState(false);

  // Compute metrics
  const totalProducts = products.length;
  const availableProducts = products.filter((p) => p.is_available).length;
  const outOfStockProducts = totalProducts - availableProducts;
  const totalCategories = categories.length;

  // Inventory value calculations (Cost vs Retail Selling Value)
  const totalRetailValue = products.reduce((acc, p) => acc + (parseFloat(p.selling_price) || 0), 0);
  const totalCostValue = products.reduce((acc, p) => acc + (parseFloat(p.cost_price) || parseFloat(p.selling_price) * 0.8 || 0), 0);
  const totalPotentialProfit = totalRetailValue - totalCostValue;
  const averageMargin = totalCostValue > 0 ? (totalPotentialProfit / totalCostValue) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Top Banner with '+ Add Product' CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-900 text-white p-5 rounded-3xl shadow-md">
        <div>
          <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            Catalogue Overview
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
            Store Performance & Stock
          </h2>
        </div>

        <button
          onClick={onAddProduct}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-md transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Add New Product</span>
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Products */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
            <Package className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {totalProducts}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Listed in digital catalogue</div>
        </div>

        {/* Available Products */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">In Stock</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800">
            {availableProducts}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            {totalProducts > 0 ? Math.round((availableProducts / totalProducts) * 100) : 0}% available to buy
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Out of Stock</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-800">
            {outOfStockProducts}
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">Needs replenishment</div>
        </div>

        {/* Categories */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Categories</span>
            <FolderTree className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {totalCategories}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Organized store sections</div>
        </div>

      </div>

      {/* Private Financial Information (Optional Toggle) */}
      <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-emerald-800" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Private Financials & Estimated Margins
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
              Admin Only
            </span>
          </div>

          <button
            onClick={() => setShowFinancials(!showFinancials)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg bg-white border border-stone-200 shadow-xs transition"
          >
            {showFinancials ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showFinancials ? 'Hide Numbers' : 'View Financials'}</span>
          </button>
        </div>

        {showFinancials ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-stone-200">
            <div>
              <div className="text-xs text-slate-500">Retail Catalogue Value</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {formatCurrency(totalRetailValue)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Estimated Cost Value</div>
              <div className="text-lg font-bold text-slate-600 mt-0.5">
                {formatCurrency(totalCostValue)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Estimated Potential Profit</div>
              <div className="text-lg font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>{formatCurrency(totalPotentialProfit)}</span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded ml-1">
                  ~{averageMargin.toFixed(1)}% margin
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 mt-2">
            Inventory value and profit margins are masked to protect confidential financial information at the counter. Click "View Financials" to show.
          </p>
        )}
      </div>

    </div>
  );
}
