import React, { useState, useMemo } from 'react';
import { X, Printer, Eye, Package, Check } from 'lucide-react';
import type {
  ShippingLabelSize,
  ShippingLabelOptions
} from '@/utils/generateShippingLabel';
import {
  generateSingleStickerCardHtml,
  generatePrintDocumentHtml,
  printSingleShippingSticker,
  printBatchShippingStickers
} from '@/utils/generateShippingLabel';

interface ShippingStickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: any;
  orders?: any[];
}

export const ShippingStickerModal: React.FC<ShippingStickerModalProps> = ({
  isOpen,
  onClose,
  order,
  orders = []
}) => {
  const isBatch = Array.isArray(orders) && orders.length > 0;
  const currentOrder = isBatch ? orders[0] : order;

  const [size, setSize] = useState<ShippingLabelSize>('75x125');
  const [showLogo, setShowLogo] = useState(true);
  const [showSkus, setShowSkus] = useState(true);
  const [showOrderBarcode, setShowOrderBarcode] = useState(true);

  // Single order editable overrides
  const [carrier, setCarrier] = useState<string>(
    currentOrder?.shippingMethod === 'NORMAL_POST' ? 'BOOK POST (PARCEL)' : 'SPEED POST (DOMESTIC)'
  );
  const [articleNumber, setArticleNumber] = useState<string>(currentOrder?.trackingNumber || '');
  const [weight, setWeight] = useState<number>(
    Math.max(350, (currentOrder?.items?.length || 1) * 420)
  );
  const [senderAddress, setSenderAddress] = useState<string>(
    'College Street (Bidhan Sarani), Near Presidency, Kolkata - 700006'
  );
  const [customNotes, setCustomNotes] = useState<string>('');

  // Update defaults when order changes
  React.useEffect(() => {
    if (currentOrder) {
      setCarrier(currentOrder.shippingMethod === 'NORMAL_POST' ? 'BOOK POST (PARCEL)' : 'SPEED POST (DOMESTIC)');
      setArticleNumber(currentOrder.trackingNumber || '');
      setWeight(Math.max(350, (currentOrder.items?.length || 1) * 420));
    }
  }, [currentOrder?.id]);

  const previewOptions: ShippingLabelOptions = useMemo(() => ({
    size,
    showLogo,
    showSkus,
    showOrderBarcode,
    customCarrier: carrier,
    customArticleNumber: articleNumber || undefined,
    customWeight: weight,
    customSenderAddress: senderAddress,
    customNotes: customNotes || undefined,
  }), [size, showLogo, showSkus, showOrderBarcode, carrier, articleNumber, weight, senderAddress, customNotes]);

  const previewHtml = useMemo(() => {
    if (!currentOrder) return '';
    const cardHtml = generateSingleStickerCardHtml(currentOrder, previewOptions);
    return generatePrintDocumentHtml(cardHtml, size);
  }, [currentOrder, previewOptions, size]);

  if (!isOpen || (!currentOrder && !isBatch)) return null;

  const handlePrint = () => {
    if (isBatch) {
      printBatchShippingStickers(orders, previewOptions);
    } else {
      printSingleShippingSticker(currentOrder, previewOptions);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">
                  {isBatch ? `Batch Shipping Stickers (${orders.length} Parcels)` : `India Post Shipping Sticker — #${currentOrder?.orderNumber}`}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-red-100 text-red-800 border border-red-200">
                  {size} Format
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Official CEPT standard consignment barcode label with Techno World logo & Book SKUs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Main Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Left Column: Customization Controls (5 cols) */}
          <div className="lg:col-span-5 p-5 space-y-5 bg-white">
            {/* 1. Sticker Paper Size Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                1. Select Sticker Paper Size
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: '75x125', title: '75 × 125 mm', sub: 'Standard 3" × 5" Thermal Roll (Default)' },
                  { id: 'A7', title: 'A7 Thermal', sub: '74 × 105 mm (3" Roll)' },
                  { id: 'A6', title: 'A6 Standard', sub: '105 × 148 mm (4" × 6")' },
                  { id: 'A5', title: 'A5 Laser', sub: '148 × 210 mm (Half A4)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSize(s.id as ShippingLabelSize)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      size === s.id
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-extrabold text-xs flex items-center justify-between">
                      <span>{s.title}</span>
                      {size === s.id && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{s.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Postal Service Carrier */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                2. Postal Service Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Speed Post (Domestic)', val: 'SPEED POST (DOMESTIC)' },
                  { label: 'Book Post (Parcel)', val: 'BOOK POST (PARCEL)' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setCarrier(item.val)}
                    className={`px-3 py-2 rounded-lg border text-xs font-bold transition text-center ${
                      carrier === item.val
                        ? 'border-red-600 bg-red-50 text-red-900 ring-1 ring-red-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Parcel Details (Editable) */}
            <div className="space-y-3 pt-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                3. Parcel & Dispatch Fields
              </label>

              {!isBatch && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">
                    Article Tracking Number (AWB)
                  </label>
                  <input
                    type="text"
                    value={articleNumber}
                    onChange={(e) => setArticleNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. EB468827991IN"
                    className="w-full mt-1 px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Total Weight (grams)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Dispatch Note</label>
                  <input
                    type="text"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="e.g. HANDLE WITH CARE"
                    className="w-full mt-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600">Sender Return Address</label>
                <textarea
                  rows={2}
                  value={senderAddress}
                  onChange={(e) => setSenderAddress(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-medium"
                />
              </div>
            </div>

            {/* 4. Display Toggles */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                4. Label Inclusions
              </label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLogo}
                    onChange={(e) => setShowLogo(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Include Techno World Brand Logo</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSkus}
                    onChange={(e) => setShowSkus(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Include Book SKU IDs & Item Titles</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOrderBarcode}
                    onChange={(e) => setShowOrderBarcode(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Include Order ID Code128 Barcode</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Live Printable Preview (7 cols) */}
          <div className="lg:col-span-7 p-4 bg-slate-100/80 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-slate-500" /> Live Sticker Preview ({size})
              </span>
              {isBatch && (
                <span className="text-[11px] font-bold text-slate-500">
                  Showing 1 of {orders.length} stickers
                </span>
              )}
            </div>

            <div className="flex-1 bg-white rounded-xl border border-slate-300 shadow-inner overflow-hidden flex items-center justify-center p-2 min-h-[380px]">
              <iframe
                title="Sticker Preview"
                srcDoc={previewHtml}
                className="w-full h-full min-h-[460px] border-0 rounded"
              />
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {isBatch ? (
              <span>Ready to print <b>{orders.length}</b> parcel stickers in <b>{size}</b> size</span>
            ) : (
              <span>Ready to print 1 consignment sticker for <b>#{currentOrder?.orderNumber}</b></span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-6 py-2 text-xs font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md inline-flex items-center gap-2 transition"
            >
              <Printer className="h-4 w-4" />
              {isBatch ? `Print All ${orders.length} Stickers (${size})` : `Print Sticker (${size})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

