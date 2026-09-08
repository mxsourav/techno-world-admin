import React, { useState, useMemo } from 'react';
import { X, Printer, Eye, Package, Check, RefreshCw, Layers } from 'lucide-react';
import type {
  ShippingLabelSize,
  ShippingLabelDesign,
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

  const [size, setSize] = useState<ShippingLabelSize>('100x150');
  const [design, setDesign] = useState<ShippingLabelDesign>('india-post');
  const [showLogo, setShowLogo] = useState(true);
  const [showSkus, setShowSkus] = useState(true);
  const [showOrderBarcode, setShowOrderBarcode] = useState(true);
  const [showPrice, setShowPrice] = useState(true); // Optional price button / toggle

  // Single order editable overrides
  const [carrier, setCarrier] = useState<string>(
    currentOrder?.shippingMethod === 'NORMAL_POST' ? 'BOOK POST (PARCEL)' : 'SPEED POST (DOMESTIC)'
  );
  const [articleNumber, setArticleNumber] = useState<string>(
    currentOrder?.trackingNumber || `EB${Math.floor(100000000 + Math.random() * 900000000)}IN`
  );
  const [weight, setWeight] = useState<number>(
    Math.max(350, (currentOrder?.items?.length || 1) * 420)
  );
  const [senderAddress] = useState<string>(
    'College Street (Bidhan Sarani), Near Presidency, Kolkata - 700006'
  );
  const [returnAddress, setReturnAddress] = useState<string>(
    'Techno World Books Hub, 90/6A Mahatma Gandhi Road, College Street, Kolkata - 700007, WB. Ph: 033-2219-XXXX / 9830000000'
  );
  const [customNotes, setCustomNotes] = useState<string>('');

  // Update defaults when order changes
  React.useEffect(() => {
    if (currentOrder) {
      setCarrier(currentOrder.shippingMethod === 'NORMAL_POST' ? 'BOOK POST (PARCEL)' : 'SPEED POST (DOMESTIC)');
      setArticleNumber(currentOrder.trackingNumber || `EB${Math.floor(100000000 + Math.random() * 900000000)}IN`);
      setWeight(Math.max(350, (currentOrder.items?.length || 1) * 420));
    }
  }, [currentOrder?.id]);

  const handleGenerateTrackingNo = () => {
    const prefix = carrier.includes('SPEED') ? 'SP' : 'EB';
    const num = Math.floor(100000000 + Math.random() * 900000000);
    setArticleNumber(`${prefix}${num}IN`);
  };

  const previewOptions: ShippingLabelOptions = useMemo(() => ({
    size,
    design,
    showLogo,
    showSkus,
    showOrderBarcode,
    showPrice,
    customCarrier: carrier,
    customArticleNumber: articleNumber || undefined,
    customWeight: weight,
    customSenderAddress: senderAddress,
    customReturnAddress: returnAddress,
    customNotes: customNotes || undefined,
  }), [size, design, showLogo, showSkus, showOrderBarcode, showPrice, carrier, articleNumber, weight, senderAddress, returnAddress, customNotes]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">
                  {isBatch ? `Batch Shipping Labels (${orders.length} Parcels)` : `Shipping Label — #${currentOrder?.orderNumber}`}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-red-100 text-red-800 border border-red-200">
                  {size} Format
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                  {design.replace('-', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Official postal tracking barcode label with item manifest, return address & optional price display
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
          <div className="lg:col-span-5 p-5 space-y-4 bg-white overflow-y-auto max-h-[calc(95vh-130px)]">
            {/* 1. Label Design Style Selector */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Layers className="h-3.5 w-3.5 text-red-600" /> 1. Select Label Design Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'india-post', title: 'India Post (CEPT)', desc: 'Govt emblem, red/navy header, official parcel format' },
                  { id: 'modern-thermal', title: 'Modern Thermal', desc: 'Flipkart / Delhivery style, bold high-contrast monochrome' },
                  { id: 'compact-courier', title: 'Compact Courier', desc: 'Space-saving layout for 3" or 4" roll stickers' },
                  { id: 'all-in-one', title: 'Label + Packing Slip', desc: 'Shipping label + itemized dispatch packing manifest' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDesign(d.id as ShippingLabelDesign)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      design === d.id
                        ? 'border-red-600 bg-red-50/70 text-red-950 ring-2 ring-red-500/20 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-extrabold text-xs flex items-center justify-between">
                      <span>{d.title}</span>
                      {design === d.id && <Check className="h-3.5 w-3.5 text-red-600" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Paper Size Selector */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                2. Select Label Size
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {[
                  { id: '100x150', title: '100 × 150 mm', sub: 'Standard 4" × 6" Thermal' },
                  { id: '75x125', title: '75 × 125 mm', sub: '3" × 5" Roll' },
                  { id: '100x100', title: '100 × 100 mm', sub: '4" × 4" Square' },
                  { id: 'A6', title: 'A6 Postcard', sub: '105 × 148 mm' },
                  { id: 'A7', title: 'A7 Mini Roll', sub: '74 × 105 mm' },
                  { id: 'A5', title: 'A5 Laser', sub: '148 × 210 mm' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSize(s.id as ShippingLabelSize)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      size === s.id
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 ring-1 ring-emerald-500 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-[11px] flex items-center justify-between">
                      <span>{s.title}</span>
                      {size === s.id && <Check className="h-3 w-3 text-emerald-600" />}
                    </div>
                    <div className="text-[9.5px] text-slate-500 mt-0.5">{s.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Postal Service Carrier */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                3. Postal Carrier / Service
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Book Post (Parcel)', val: 'BOOK POST (PARCEL)' },
                  { label: 'Speed Post (Domestic)', val: 'SPEED POST (DOMESTIC)' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setCarrier(item.val)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition text-center ${
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

            {/* 4. Tracking Number & Parcel Details */}
            <div className="space-y-2.5 pt-1">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                4. Consignment & Return Fields
              </label>

              {!isBatch && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-600">
                      India Post Article No (Tracking / AWB)
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateTrackingNo}
                      className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" /> Auto Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    value={articleNumber}
                    onChange={(e) => setArticleNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. EB301353178IN"
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  <label className="text-[11px] font-semibold text-slate-600">Handling Note</label>
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
                <label className="text-[11px] font-semibold text-slate-600">If Undelivered, Return Address</label>
                <textarea
                  rows={2}
                  value={returnAddress}
                  onChange={(e) => setReturnAddress(e.target.value)}
                  className="w-full mt-1 px-3 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-medium text-slate-800"
                />
              </div>
            </div>

            {/* 5. Optional Buttons & Inclusions */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                5. Label Customization Options
              </label>

              {/* Price Visibility Optional Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                <div>
                  <div className="text-xs font-bold text-slate-800">Print Price & COD Amounts</div>
                  <div className="text-[10px] text-slate-500">
                    {showPrice ? 'Amounts and collect cash tags will be printed' : 'Prices hidden — confidential / gift delivery'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPrice(!showPrice)}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    showPrice ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      showPrice ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSkus}
                    onChange={(e) => setShowSkus(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Include Ordered Book Titles & Quantities</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLogo}
                    onChange={(e) => setShowLogo(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Include Techno World Logo</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOrderBarcode}
                    onChange={(e) => setShowOrderBarcode(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Include Secondary Order ID Barcode</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Live Printable Preview (7 cols) */}
          <div className="lg:col-span-7 p-4 bg-slate-100/80 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-slate-500" /> Live Label Preview ({size} • {design.replace('-', ' ')})
              </span>
              {isBatch && (
                <span className="text-[11px] font-bold text-slate-500">
                  Showing 1 of {orders.length} labels
                </span>
              )}
            </div>

            <div className="flex-1 bg-white rounded-xl border border-slate-300 shadow-inner overflow-hidden flex items-center justify-center p-2 min-h-[440px]">
              <iframe
                title="Shipping Label Preview"
                srcDoc={previewHtml}
                className="w-full h-full min-h-[480px] border-0 rounded"
              />
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-600 font-medium">
            {isBatch ? (
              <span>Ready to print <b>{orders.length}</b> shipping labels in <b>{size}</b> format</span>
            ) : (
              <span>Ready to print shipping label for Order <b>#{currentOrder?.orderNumber}</b> ({size})</span>
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
              className="px-6 py-2 text-xs font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md inline-flex items-center gap-2 transition cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              {isBatch ? `Print All ${orders.length} Shipping Labels (${size})` : `Print Shipping Label (${size})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
