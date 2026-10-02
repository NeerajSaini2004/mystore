/**
 * Utility functions for pricing, discounts, and profit calculations.
 * Always handles null/zero values safely to prevent NaN and division by zero.
 */

/**
 * Calculate Discount Percentage: ((MRP - Selling Price) / MRP) * 100
 * @param {number|string} mrp - Maximum Retail Price
 * @param {number|string} sellingPrice - Actual Selling Price
 * @returns {number} Discount percentage rounded to 2 decimal places
 */
export function calculateDiscountPercent(mrp, sellingPrice) {
  const m = parseFloat(mrp);
  const s = parseFloat(sellingPrice);
  if (!m || isNaN(m) || isNaN(s) || m <= 0 || s >= m) return 0;
  const discount = ((m - s) / m) * 100;
  return Math.round(discount * 100) / 100;
}

/**
 * Calculate Profit Amount: Selling Price - Cost Price
 * (Admin-Only Calculation)
 * @param {number|string} sellingPrice
 * @param {number|string} costPrice
 * @returns {number} Profit amount rounded to 2 decimal places
 */
export function calculateProfitAmount(sellingPrice, costPrice) {
  const s = parseFloat(sellingPrice);
  const c = parseFloat(costPrice);
  if (isNaN(s) || isNaN(c)) return 0;
  const profit = s - c;
  return Math.round(profit * 100) / 100;
}

/**
 * Calculate Profit Percentage: ((Selling Price - Cost Price) / Cost Price) * 100
 * (Admin-Only Calculation)
 * @param {number|string} sellingPrice
 * @param {number|string} costPrice
 * @returns {number} Profit percentage rounded to 2 decimal places
 */
export function calculateProfitPercent(sellingPrice, costPrice) {
  const s = parseFloat(sellingPrice);
  const c = parseFloat(costPrice);
  if (!c || isNaN(c) || isNaN(s) || c <= 0) return 0;
  const profitMargin = ((s - c) / c) * 100;
  return Math.round(profitMargin * 100) / 100;
}

/**
 * Format currency amount for India (₹)
 * @param {number|string} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  const val = parseFloat(amount);
  if (isNaN(val)) return '₹0';
  return `₹${val.toLocaleString('en-IN')}`;
}
