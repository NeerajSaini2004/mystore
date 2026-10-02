# 🏪 Local Store Digital Catalogue Platform

A premium, mobile-first **Local Store Digital Catalogue Platform** engineered for local general stores, kirana stores, stationery shops, mini-marts, and retail shops.

> **Core Philosophy:**  
> **QR Code at Shop Counter → Customer scans on smartphone → Instant search & price/stock check → Call, WhatsApp, or Google Maps directions.**  
> *Fast, zero-login customer experience with zero clutter.*

---

## ✨ Features

### 🛍️ Customer Experience (Mobile-First)
- **Zero-Friction Access:** No customer registration, no app install, instant load on scanning a QR code.
- **Shop Status & Live Timings:** Displays `🟢 Open Now (8:00 AM – 9:00 PM)` or `🔴 Closed` based on shopkeeper settings.
- **Prominent Instant Search:** Real-time search across product titles, brands, categories, and keywords (e.g., *“tea”*, *“notebook”*, *“pencil”*, *“oil”*).
- **Dynamic Categories:** Stationery, Grocery, Cold Drinks, Snacks, Personal Care, Household, Spices, etc.
- **Detailed Product Cards:**
  - High-res product images with lazy loading and fallback.
  - MRP (struck out), Selling Price, and calculated Discount Percentage badge (`15.38% OFF`).
  - Stock availability badges (`✓ Available` vs `Out of Stock`).
  - Direct 1-tap **WhatsApp Availability Inquiry** with pre-filled product details.
- **Product Detail Drawer:** High-resolution zoom, savings amount, store location guarantee, share product link.
- **Sticky Mobile Action Dock:** Direct phone dialer, WhatsApp chat, and Google Maps turn-by-turn directions.
- **Printable Shop Counter QR Flyer:** Built-in QR generator with one-click counter poster printing.

---

### 🛡️ Secure Admin Dashboard (`/admin`)
- **Separate Owner Portal:** Protected behind Supabase Auth (with 1-tap demo mode for instant local testing).
- **Dashboard Stats & Private Financials:**
  - Total Products, Available in Stock, Out of Stock, Total Categories.
  - Retail Catalogue Value vs. Wholesale Cost Value.
  - Total Potential Profit & Profit Margin % with an eye-toggle privacy switch (masks confidential wholesale prices from customer eyes at the counter).
- **Product Management:**
  - Add, Edit, Delete, Search, and Filter products.
  - 1-tap instant stock availability toggle (`In Stock` / `Out of Stock`).
  - Mobile camera photo upload or gallery picker with WebP compression.
  - Real-time automatic calculations:
    - **Discount %:** `((MRP - Selling Price) / MRP) * 100`
    - **Profit Amount (₹):** `Selling Price - Cost Price`
    - **Profit Margin (%):** `((Selling Price - Cost Price) / Cost Price) * 100`
- **Category Management:**
  - Create, edit, reorder, and assign emoji icons to store categories.
- **Shop Profile & Settings (`/admin/settings`):**
  - Change shop name, logo, hero banner, tagline, contact number, WhatsApp number, opening hours, live status, and address.
  - Changes reflect immediately across the entire customer catalogue.
- **Multi-Store Ready:**
  - Built with a store identifier model (`store_id`) so the codebase can be reused for any local retail shop.

---

## 🔒 Security & Privacy Architecture

- **Customer-Safe Queries:** The public customer interface uses the sanitized `public_store_products` view.
- **Admin-Only Financial Data:** `cost_price`, `profit amount`, and `profit percentage` are **never** exposed to anonymous customer queries.
- **Row Level Security (RLS):** Supabase database policies restrict write access strictly to authorized shop owners.

---

## 🚀 Quick Start Guide

### 1. Install & Run Locally
```bash
# Navigate to project
cd "d:/my store"

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) on your browser or mobile phone on the same Wi-Fi.

---

## ☁️ Supabase Setup (Optional for Cloud Sync)

The project includes an automatic local storage fallback with the complete **Saini General Store** dataset for immediate use.

To connect your own cloud Supabase database:
1. Create a project on [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in Supabase and paste the contents of `supabase/schema.sql`.
3. Create a `.env` file in the root folder:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. Restart the dev server (`npm run dev`). The application will now read and write directly to Supabase with full Row Level Security and Supabase Storage!

---

## 🌐 Vercel Deployment

1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. If using Supabase, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel Environment Variables.
4. Click **Deploy**. Your digital store catalogue will be live on a custom domain with SSL!
