import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Printer,
  Eye,
  Package,
  Check,
  RefreshCw,
  Layers,
  User,
  BookOpen,
  Building,
  Truck,
  RotateCcw,
  Sliders,
  Sparkles
} from 'lucide-react';
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

type TabType = 'layout' | 'consignee' | 'manifest' | 'sender' | 'carrier';

export const ShippingStickerModal: React.FC<ShippingStickerModalProps> = ({
  isOpen,
  onClose,
  order,
  orders = []
}) => {
  const isBatch = Array.isArray(orders) && orders.length > 0;
  const currentOrder = isBatch ? orders[0] : order;

  // Active sub-tab for remapping fields
  const [activeTab, setActiveTab] = useState<TabType>('layout');

  // 1. Layout & Presentation Options
  const [size, setSize] = useState<ShippingLabelSize>('100x150');
  const [design, setDesign] = useState<ShippingLabelDesign>('techno-speed-post'); // Default to reference format
  const [showLogo, setShowLogo] = useState(true);
  const [showSkus, setShowSkus] = useState(true);
  const [showOrderBarcode, setShowOrderBarcode] = useState(true);
  const [showPrice, setShowPrice] = useState(false); // Optional price button/toggle

  // 2. Carrier & Tracking Remappable Fields
  const [carrier, setCarrier] = useState<string>('SPEED POST');
  const [articleNumber, setArticleNumber] = useState<string>('');

  // 3. Consignee (Ship To) Remappable Fields
  const [recipientName, setRecipientName] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [recipientCity, setRecipientCity] = useState<string>('');
  const [recipientState, setRecipientState] = useState<string>('');
  const [recipientPin, setRecipientPin] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState<string>('');

  // 4. Ordered Items Manifest Remappable Fields
  const [orderItemsHeader, setOrderItemsHeader] = useState<string>('');
  const [orderItemsText, setOrderItemsText] = useState<string>('');

  // 5. Sender & Return Address Remappable Fields
  const [senderName, setSenderName] = useState<string>('Techno World Books Hub');
  const [senderCompany, setSenderCompany] = useState<string>('Techno World Publications');
  const [senderAddress, setSenderAddress] = useState<string>(
    'College Street (Bidhan Sarani), Near Presidency, Kolkata - 700006'
  );
  const [senderPhone, setSenderPhone] = useState<string>('033-2219-XXXX / 9830000000');
  const [senderGst, setSenderGst] = useState<string>('19AAACT0000A1Z5');

  // 6. Footer & Consignment Remappable Fields
  const [footerText, setFooterText] = useState<string>('POSTAGE APPROVED FOR SHIPPING');
  const [weight, setWeight] = useState<number>(420);
  const [customNotes, setCustomNotes] = useState<string>('');

  // Populate or reset state from actual order data
  const populateDefaultsFromOrder = (ord: any) => {
    if (!ord) return;
    const addr = ord.address || {};
    const items = Array.isArray(ord.items) ? ord.items : [];
    const totalQty = items.reduce((acc: number, it: any) => acc + (it.quantity || it.qty || 1), 0) || 1;
    const booksCount = items.length || 1;

    setCarrier(ord.shippingMethod === 'NORMAL_POST' ? 'BOOK POST' : 'SPEED POST');
    setArticleNumber(ord.trackingNumber || `EE${Math.floor(100000000 + Math.random() * 900000000)}IN`);

    setRecipientName(addr.fullName || addr.name || ord.user?.name || 'Washim');
    setRecipientAddress(addr.addressLine1 || addr.address || '90/6 A M.G Road, College Street');
    setRecipientCity(addr.city || 'Kolkata');
    setRecipientState(addr.state || 'West Bengal');
    setRecipientPin(String(addr.pincode || '700007').trim());
    setRecipientPhone(addr.phone || ord.user?.phone || '7479135626');

    setOrderItemsHeader(`ORDER ITEMS (${booksCount} BOOK${booksCount > 1 ? 'S' : ''}, TOTAL QTY: ${totalQty})`);

    const manifest = items.map((it: any) => {
      const bk = it.book || {};
      const sku = bk.sku || bk.isbn13 || bk.isbn10 || it.sku || 'SKU-TW';
      const title = bk.title || it.title || 'Textbook of Educational Technology Nursing Education - Vol 1';
      const qty = it.quantity || it.qty || 1;
      return `[${sku}] ${title} ... Qty: ${qty}`;
    }).join('\n') || `[SKU-TW] Textbook of Educational Technology Nursing Education - Vol ... Qty: 1`;
    setOrderItemsText(manifest);

    setSenderName('Techno World Books Hub');
    setSenderCompany('Techno World Publications');
    setSenderAddress('College Street (Bidhan Sarani), Near Presidency, Kolkata - 700006');
    setSenderPhone('033-2219-XXXX / 9830000000');
    setSenderGst('19AAACT0000A1Z5');

    setFooterText('POSTAGE APPROVED FOR SHIPPING');
    setWeight(Math.max(350, totalQty * 420));
    setCustomNotes('');
  };

  useEffect(() => {
    if (currentOrder) {
      populateDefaultsFromOrder(currentOrder);
    }
  }, [currentOrder?.id, currentOrder?.orderNumber]);

  const handleGenerateTrackingNo = () => {
    const prefix = carrier.toUpperCase().includes('SPEED') ? 'EE' : 'EB';
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
    customRecipientName: recipientName || undefined,
    customRecipientAddress: recipientAddress || undefined,
    customRecipientCity: recipientCity || undefined,
    customRecipientState: recipientState || undefined,
    customRecipientPin: recipientPin || undefined,
    customRecipientPhone: recipientPhone || undefined,
    customOrderItemsHeader: orderItemsHeader || undefined,
    customOrderItemsText: orderItemsText || undefined,
    customSenderName: senderName || undefined,
    customSenderCompany: senderCompany || undefined,
    customSenderAddress: senderAddress || undefined,
    customSenderPhone: senderPhone || undefined,
    customSenderGst: senderGst || undefined,
    customFooterText: footerText || undefined,
    customWeight: weight,
    customNotes: customNotes || undefined,
  }), [
    size, design, showLogo, showSkus, showOrderBarcode, showPrice,
    carrier, articleNumber,
    recipientName, recipientAddress, recipientCity, recipientState, recipientPin, recipientPhone,
    orderItemsHeader, orderItemsText,
    senderName, senderCompany, senderAddress, senderPhone, senderGst,
    footerText, weight, customNotes
  ]);

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
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-7xl max-h-[96vh] flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-slate-900 text-base">
                  {isBatch ? `Batch Shipping Labels (${orders.length} Parcels)` : `Shipping Label — #${currentOrder?.orderNumber}`}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-red-100 text-red-800 border border-red-200">
                  {size} Format
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                  {design.replace(/-/g, ' ')}
                </span>
                {showPrice && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                    Price Visible
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Official postal tracking barcode label with item manifest, return address &amp; optional price display
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs for Remapping */}
        <div className="px-6 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'layout', label: 'Layout & Options', icon: Sliders },
              { id: 'consignee', label: 'Consignee (Ship To)', icon: User },
              { id: 'manifest', label: 'Order Manifest', icon: BookOpen },
              { id: 'sender', label: 'Return Address', icon: Building },
              { id: 'carrier', label: 'Carrier & AWB', icon: Truck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer ${
                    isActive
                      ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => populateDefaultsFromOrder(currentOrder)}
            className="px-2.5 py-1 text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg inline-flex items-center gap-1 transition cursor-pointer shadow-2xs shrink-0"
            title="Discard changes and reload original order values"
          >
            <RotateCcw className="h-3 w-3 text-amber-700" />
            <span>Reset to Order Defaults</span>
          </button>
        </div>

        {/* Modal Main Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Left Column: Remapping / Editing Controls (5 cols) */}
          <div className="lg:col-span-5 p-5 space-y-4 bg-white overflow-y-auto max-h-[calc(96vh-170px)]">
            {/* TAB 1: LAYOUT & SIZES */}
            {activeTab === 'layout' && (
              <div className="space-y-4 animate-in fade-in duration-100">
                {/* 1. Label Design Style */}
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Layers className="h-3.5 w-3.5 text-red-600" /> 1. Select Label Design Style
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      {
                        id: 'techno-speed-post',
                        title: 'Techno Speed Post (Exact Mock)',
                        desc: '3-col header, rectangular TW logo, India Post emblem, consignee, manifest & AWB barcode',
                        badge: 'Recommended'
                      },
                      {
                        id: 'india-post',
                        title: 'India Post (CEPT Official)',
                        desc: 'Govt postal emblem, red/navy header, official parcel format',
                      },
                      {
                        id: 'modern-thermal',
                        title: 'Modern Thermal',
                        desc: 'Flipkart / Delhivery style, bold high-contrast monochrome',
                      },
                      {
                        id: 'compact-courier',
                        title: 'Compact Courier',
                        desc: 'Space-saving layout for 3" or 4" roll stickers',
                      },
                      {
                        id: 'all-in-one',
                        title: 'Label + Packing Slip',
                        desc: 'Shipping label + itemized dispatch packing manifest',
                      },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDesign(d.id as ShippingLabelDesign)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          design === d.id
                            ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-extrabold text-xs flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            {d.title}
                            {d.badge && (
                              <span className="text-[9.5px] px-1.5 py-0.2 bg-emerald-600 text-white rounded font-bold uppercase">
                                {d.badge}
                              </span>
                            )}
                          </span>
                          {design === d.id && <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
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
                      { id: 'A7', title: 'A7 Mini Roll', sub: '72 × 120 mm (Custom Roll)' },
                      { id: '75x125', title: '75 × 125 mm', sub: '3" × 5" Roll' },
                      { id: '100x100', title: '100 × 100 mm', sub: '4" × 4" Square' },
                      { id: 'A6', title: 'A6 Postcard', sub: '105 × 148 mm' },
                      { id: 'A5', title: 'A5 Laser', sub: '148 × 210 mm' },
                      { id: 'A4', title: 'A4 Full Sheet', sub: '210 × 297 mm' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSize(s.id as ShippingLabelSize)}
                        className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
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

                {/* 3. Optional Features & Price Toggle */}
                <div className="pt-2 border-t border-slate-200 space-y-2.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    3. Optional Display Badges &amp; Controls
                  </label>

                  {/* Price Visibility Optional Toggle */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                    <div>
                      <div className="text-xs font-bold text-slate-800">Print Price &amp; Collect Amounts</div>
                      <div className="text-[10px] text-slate-500">
                        {showPrice
                          ? '₹ Amount badge (Prepaid / C.O.D.) will be printed on footer'
                          : 'Prices hidden — confidential / institutional / gift parcel'}
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
                        checked={showLogo}
                        onChange={(e) => setShowLogo(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span>Include Rectangular Techno World Logo</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showSkus}
                        onChange={(e) => setShowSkus(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span>Include Ordered Book Titles &amp; Quantities Manifest</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOrderBarcode}
                        onChange={(e) => setShowOrderBarcode(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span>Include Order ID Barcode (if supported by template)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CONSIGNEE (SHIP TO) REMAPPING */}
            {activeTab === 'consignee' && (
              <div className="space-y-3 animate-in fade-in duration-100">
                <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-blue-600" /> Consignee (Ship To) Address
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">Fully Editable &amp; Remappable</span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Recipient / Student Name</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Washim"
                    className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Delivery Street Address</label>
                  <textarea
                    rows={2}
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="e.g. 90/6 A M.G Road, College Street"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">City</label>
                    <input
                      type="text"
                      value={recipientCity}
                      onChange={(e) => setRecipientCity(e.target.value)}
                      placeholder="Kolkata"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">State</label>
                    <input
                      type="text"
                      value={recipientState}
                      onChange={(e) => setRecipientState(e.target.value)}
                      placeholder="West Bengal"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">PIN Code</label>
                    <input
                      type="text"
                      value={recipientPin}
                      onChange={(e) => setRecipientPin(e.target.value)}
                      placeholder="700007"
                      maxLength={6}
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Recipient Mobile Number</label>
                  <input
                    type="text"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="e.g. 7479135626"
                    className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: ORDER ITEMS MANIFEST REMAPPING */}
            {activeTab === 'manifest' && (
              <div className="space-y-3 animate-in fade-in duration-100">
                <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-emerald-600" /> Order Items Manifest
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">Custom Quantity &amp; SKUs</span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Items Header Text</label>
                  <input
                    type="text"
                    value={orderItemsHeader}
                    onChange={(e) => setOrderItemsHeader(e.target.value)}
                    placeholder="e.g. ORDER ITEMS (1 BOOK, TOTAL QTY: 1)"
                    className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Book Details &amp; Quantities (Editable Textarea)
                  </label>
                  <textarea
                    rows={5}
                    value={orderItemsText}
                    onChange={(e) => setOrderItemsText(e.target.value)}
                    placeholder="[SKU-TW] Book Title ... Qty: 1"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Each line represents a book item. You can edit quantities, change titles, or add custom pack instructions.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: RETURN ADDRESS / SENDER REMAPPING */}
            {activeTab === 'sender' && (
              <div className="space-y-3 animate-in fade-in duration-100">
                <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-purple-600" /> Sender &amp; Return Address
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">If Undelivered Address</span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Sender Hub / Title</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Techno World Books Hub"
                    className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Publisher / Company Name</label>
                  <input
                    type="text"
                    value={senderCompany}
                    onChange={(e) => setSenderCompany(e.target.value)}
                    placeholder="Techno World Publications"
                    className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Return Address</label>
                  <textarea
                    rows={2}
                    value={senderAddress}
                    onChange={(e) => setSenderAddress(e.target.value)}
                    placeholder="College Street (Bidhan Sarani), Near Presidency, Kolkata - 700006"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Return Phone / Helpline</label>
                    <input
                      type="text"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="033-2219-XXXX / 9830000000"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">GSTIN</label>
                    <input
                      type="text"
                      value={senderGst}
                      onChange={(e) => setSenderGst(e.target.value)}
                      placeholder="19AAACT0000A1Z5"
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: CARRIER & AWB TRACKING REMAPPING */}
            {activeTab === 'carrier' && (
              <div className="space-y-3 animate-in fade-in duration-100">
                <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-red-600" /> Carrier &amp; Postal Barcode
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">India Post Speed Post / Book Post</span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Carrier Title Banner</label>
                  <div className="flex gap-2 mb-1.5">
                    {['SPEED POST', 'BOOK POST'].map((btnText) => (
                      <button
                        key={btnText}
                        type="button"
                        onClick={() => setCarrier(btnText)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition cursor-pointer ${
                          carrier === btnText
                            ? 'border-red-600 bg-red-50 text-red-900 ring-1 ring-red-500'
                            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {btnText}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value.toUpperCase())}
                    placeholder="e.g. SPEED POST"
                    className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      India Post Article / Tracking # (Code 128)
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
                    placeholder="e.g. EE987654321IN"
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Consignment Weight (g)</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Handling Note</label>
                    <input
                      type="text"
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder="e.g. FRAGILE / BOOKS"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Approved Footer Text</label>
                  <input
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="POSTAGE APPROVED FOR SHIPPING"
                    className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Printable Preview (7 cols) */}
          <div className="lg:col-span-7 p-4 bg-slate-100/80 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-slate-500" /> Live Label Preview ({size} • {design.replace(/-/g, ' ')})
              </span>
              {isBatch ? (
                <span className="text-[11px] font-bold text-slate-500">
                  Showing parcel 1 of {orders.length}
                </span>
              ) : (
                <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-emerald-600" /> Real-time instant preview
                </span>
              )}
            </div>

            <div className="flex-1 bg-slate-200/60 rounded-xl border border-slate-300 shadow-inner overflow-y-auto flex items-start justify-center p-2 min-h-[500px] max-h-[620px]">
              <iframe
                title="Shipping Label Preview"
                srcDoc={previewHtml}
                className="w-full h-[580px] border-0 rounded bg-white shadow-xs"
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
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
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
