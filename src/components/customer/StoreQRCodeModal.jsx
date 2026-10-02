import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Printer, Share2, Sparkles, Store } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export function StoreQRCodeModal() {
  const { store, isQRModalOpen, setIsQRModalOpen } = useStore();
  const printRef = useRef(null);

  if (!isQRModalOpen || !store) return null;

  const currentStoreUrl = window.location.origin + window.location.pathname;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSVG = () => {
    const svg = document.getElementById('store-qr-code-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `${store.slug || 'store'}-catalogue-qr.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="absolute inset-0" onClick={() => setIsQRModalOpen(false)}></div>

      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 z-10 animate-slide-up text-center border border-stone-200">
        
        {/* Close Button */}
        <button
          onClick={() => setIsQRModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Shop Branding Header */}
        <div className="flex items-center justify-center gap-2 mb-2 text-emerald-800">
          <Store className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Digital Counter Stand</span>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
          {store.name}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Scan to check live prices & product availability
        </p>

        {/* QR Code Canvas Card */}
        <div className="my-5 p-5 bg-stone-50 rounded-2xl border-2 border-dashed border-emerald-800/20 inline-block shadow-inner">
          <QRCodeSVG
            id="store-qr-code-svg"
            value={currentStoreUrl}
            size={190}
            level="H"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#064e3b"
          />
        </div>

        <div className="text-[11px] text-slate-400 font-mono break-all px-2">
          {currentStoreUrl}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            onClick={handleDownloadSVG}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 font-semibold text-xs transition"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Save QR Code</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-xs transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Counter Flyer</span>
          </button>
        </div>

      </div>
    </div>
  );
}
