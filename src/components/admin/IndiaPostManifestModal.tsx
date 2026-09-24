import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Download,
  FileText,
  Package,
  Calendar,
} from 'lucide-react';
import { generateCode128Svg } from '@/utils/generateShippingLabel';

interface IndiaPostManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders?: any[];
}

export const IndiaPostManifestModal: React.FC<IndiaPostManifestModalProps> = ({
  isOpen,
  onClose,
  orders = [],
}) => {
  const [manifestData, setManifestData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false); void isLoading;
  const [manifestDate, setManifestDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    if (!isOpen) return;

    const fetchManifest = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        const res = await fetch(`/api/v1/shipping/manifest?date=${manifestDate}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json();
        if (data.success && data.data) {
          setManifestData(data.data);
        } else {
          // Fallback to local passed orders
          fallbackFromOrders(orders);
        }
      } catch (e) {
        fallbackFromOrders(orders);
      } finally {
        setIsLoading(false);
      }
    };

    fetchManifest();
  }, [isOpen, manifestDate, orders]);

  const fallbackFromOrders = (orderList: any[]) => {
    const validOrders = orderList.filter((o) => o.trackingNumber);
    const items = validOrders.map((o, idx) => {
      const weight = Math.max(
        250,
        (o.items || []).reduce(
          (sum: number, i: any) => sum + Math.round((i.book?.weight || 0.45) * 1000 * (i.quantity || 1)),
          0
        )
      );
      return {
        serialNo: idx + 1,
        orderId: o.id,
        orderNumber: o.orderNumber,
        barcode: o.trackingNumber,
        serviceType: o.shippingCarrier?.includes('Book Post') ? 'Book Post' : 'Speed Post',
        bookingDate: o.updatedAt || o.createdAt,
        consigneeName: o.address?.fullName || o.user?.name || 'Customer',
        consigneePhone: o.address?.phone || o.user?.phone || 'N/A',
        destinationPincode: o.address?.pincode || 'N/A',
        destinationCity: o.address?.city || 'Kolkata',
        destinationState: o.address?.state || 'West Bengal',
        weightGrams: weight,
        declaredValue: o.totalAmount,
        shippingCharge: o.shippingCharge || 0,
        paymentMode: o.paymentMethod === 'COD' ? 'COD' : 'PREPAID',
        codAmount: o.paymentMethod === 'COD' ? o.totalAmount : 0,
      };
    });

    const totalWeight = items.reduce((acc, i) => acc + i.weightGrams, 0);

    setManifestData({
      manifestDate: new Date().toISOString(),
      bookingOffice: 'College Street SO / Kolkata GPO (700006)',
      bnplAccountId: 'BNPL-KOL-TW-700006',
      consignorName: 'Techno World Books Hub',
      consignorAddress: 'College Street (Bidhan Sarani), Kolkata - 700006, WB',
      consignorPhone: '+91 98300 00000',
      totalArticles: items.length,
      totalWeightGrams: totalWeight,
      totalWeightKg: Number((totalWeight / 1000).toFixed(2)),
      totalDeclaredValue: items.reduce((acc, i) => acc + i.declaredValue, 0),
      totalPostage: items.reduce((acc, i) => acc + i.shippingCharge, 0),
      items,
    });
  };

  if (!isOpen) return null;

  const items = manifestData?.items || [];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (!items || items.length === 0) return;

    const headers = [
      'S.No',
      'Consignment Barcode',
      'Service Type',
      'Booking Date',
      'Addressee Name',
      'Addressee Phone',
      'Destination Pincode',
      'Destination City',
      'Destination State',
      'Weight (Grams)',
      'Declared Value (INR)',
      'Payment Mode',
      'COD Amount (INR)',
    ];

    const rows = items.map((i: any) => [
      i.serialNo,
      i.barcode,
      i.serviceType,
      i.bookingDate.slice(0, 10),
      `"${i.consigneeName.replace(/"/g, '""')}"`,
      `"${i.consigneePhone}"`,
      i.destinationPincode,
      `"${i.destinationCity}"`,
      `"${i.destinationState}"`,
      i.weightGrams,
      i.declaredValue.toFixed(2),
      i.paymentMode,
      i.codAmount.toFixed(2),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IndiaPost_Manifest_${manifestDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      {/* Container */}
      <div className="relative flex flex-col w-full max-w-5xl h-[92vh] max-h-[920px] rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden text-slate-900 print:max-w-none print:h-auto print:rounded-none print:shadow-none print:border-none print:p-0">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700">
              <FileText className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                India Post Despatch Manifest
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Official postal booking journal for carrier handover & driver sign-off
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="date"
                value={manifestDate}
                onChange={(e) => setManifestDate(e.target.value)}
                className="bg-transparent outline-none font-bold text-slate-800"
              />
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={items.length === 0}
              className="glass-action-button disabled:opacity-40"
              title="Download CSV report"
            >
              <Download className="h-3.5 w-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={items.length === 0}
              className="glass-action-button-primary disabled:opacity-40"
              title="Print official handover document"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Manifest</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Manifest Sheet */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-100/60 print:bg-white print:p-4 print:overflow-visible">
          <div className="max-w-4xl mx-auto rounded-xl border border-slate-300 bg-white p-6 sm:p-8 shadow-sm print:shadow-none print:border-none print:p-0 print:max-w-none">
            
            {/* Manifest Header */}
            <div className="border-b-2 border-slate-900 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                    Department of Posts · Ministry of Communications · Government of India
                  </div>
                  <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight mt-0.5">
                    Despatch Manifest / Booking Journal (BNPL)
                  </h1>
                  <div className="text-xs text-slate-600 font-semibold mt-1">
                    Booking Sub-Post Office: <span className="font-bold text-slate-900">College Street SO / Kolkata GPO (700006)</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="rounded border border-slate-300 bg-slate-50 px-2.5 py-1 text-right">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                      BNPL Account Code
                    </span>
                    <span className="font-mono text-xs font-black text-slate-900">
                      BNPL-KOL-TW-700006
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-semibold mt-1.5">
                    Date: <span className="font-bold text-slate-900">{manifestDate}</span>
                  </div>
                </div>
              </div>

              {/* Consignor Details */}
              <div className="mt-3 grid grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Consignor / Bulk Mailer:
                  </span>
                  <span className="font-bold text-slate-900">Techno World Books Hub</span>
                  <span className="text-slate-600 block">
                    College Street (Bidhan Sarani), Near Presidency, Kolkata - 700006, West Bengal
                  </span>
                  <span className="text-slate-500 text-[11px]">Phone: +91 98300 00000 · Contact: Logistics Desk</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Contract & Facility:
                  </span>
                  <span className="text-slate-700 block">Business Post & Speed Post Daily Pickup</span>
                  <span className="text-slate-600 block">Tariff Mode: Credit Facility (Monthly Billing)</span>
                  <span className="text-slate-600 block">CEPT Electronic Data Interface (EDI)</span>
                </div>
              </div>
            </div>

            {/* Summary KPI Strip */}
            <div className="grid grid-cols-4 gap-3 my-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Articles</span>
                <span className="text-base font-black text-slate-900">{items.length}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Weight</span>
                <span className="text-base font-black text-slate-900">{manifestData?.totalWeightKg || '0.00'} kg</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Declared Value</span>
                <span className="text-base font-black text-slate-900">₹{(manifestData?.totalDeclaredValue || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Prepaid / Billed Postage</span>
                <span className="text-base font-black text-slate-900">₹{(manifestData?.totalPostage || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Consignment Table */}
            {items.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Package className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold">No booked consignments found for this date.</p>
                <p className="text-[11px] text-slate-400">Generate India Post barcodes on orders to populate the manifest.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-300">
                    <th className="p-2 border-r border-slate-300 w-10 text-center">S.No</th>
                    <th className="p-2 border-r border-slate-300 w-44">Article Barcode</th>
                    <th className="p-2 border-r border-slate-300">Addressee Details</th>
                    <th className="p-2 border-r border-slate-300 w-28">Destination</th>
                    <th className="p-2 border-r border-slate-300 w-20 text-center">Weight</th>
                    <th className="p-2 border-r border-slate-300 w-24 text-right">Value (₹)</th>
                    <th className="p-2 w-24 text-center">Driver Stamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item: any) => {
                    const barcodeSvg = generateCode128Svg(item.barcode, 26, 1.2);
                    return (
                      <tr key={item.barcode || item.serialNo} className="hover:bg-slate-50/50">
                        <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-slate-700">
                          {item.serialNo}
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          <div className="space-y-1">
                            <div
                              className="w-36 h-6 overflow-hidden [&_svg]:w-full [&_svg]:h-full"
                              dangerouslySetInnerHTML={{ __html: barcodeSvg }}
                            />
                            <span className="font-mono text-[11px] font-black text-slate-900 block tracking-wider">
                              {item.barcode}
                            </span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase">
                              {item.serviceType}
                            </span>
                          </div>
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          <div className="font-bold text-slate-900">{item.consigneeName}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{item.consigneePhone}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Ref: {item.orderNumber}</div>
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          <div className="font-mono font-bold text-slate-900">{item.destinationPincode}</div>
                          <div className="text-[11px] text-slate-600">{item.destinationCity}</div>
                          <div className="text-[10px] text-slate-400">{item.destinationState}</div>
                        </td>
                        <td className="p-2 border-r border-slate-200 text-center font-mono font-semibold">
                          {item.weightGrams} g
                        </td>
                        <td className="p-2 border-r border-slate-200 text-right">
                          <div className="font-bold text-slate-900">₹{item.declaredValue.toFixed(2)}</div>
                          <div className="text-[9px] font-semibold text-slate-500 uppercase">{item.paymentMode}</div>
                        </td>
                        <td className="p-2 text-center">
                          <div className="h-8 border border-dashed border-slate-200 rounded flex items-center justify-center text-[9px] text-slate-300">
                            Stamp / OK
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Official Postal Handover Sign-off Blocks */}
            <div className="mt-8 pt-4 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs">
              <div className="p-4 rounded-lg border border-slate-300 bg-slate-50/50 space-y-6">
                <div className="font-bold uppercase tracking-wider text-slate-900 text-[11px]">
                  1. Despatched by Consignor (Techno World)
                </div>
                <div className="space-y-1 text-slate-600 text-[11px]">
                  <p>Certified that the above {items.length} postal article(s) are securely packed and labelled strictly according to India Post BNPL specifications.</p>
                </div>
                <div className="pt-6 border-t border-slate-300 flex justify-between items-end text-slate-700">
                  <div>
                    <span className="block text-[10px] text-slate-400">Signature & Date</span>
                    <span className="font-bold">Authorized Dispatcher</span>
                  </div>
                  <div className="text-right font-mono text-[10px] text-slate-400">
                    Date: {manifestDate}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-slate-300 bg-slate-50/50 space-y-6">
                <div className="font-bold uppercase tracking-wider text-slate-900 text-[11px]">
                  2. Received by Department of Posts Official
                </div>
                <div className="space-y-1 text-slate-600 text-[11px]">
                  <p>Received {items.length} article(s) in good condition for onward transmission via Kolkata GPO / College Street SO.</p>
                </div>
                <div className="pt-6 border-t border-slate-300 flex justify-between items-end text-slate-700">
                  <div>
                    <span className="block text-[10px] text-slate-400">Postal Official / Driver Signature</span>
                    <span className="font-bold">Employee Code / Name</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] text-slate-400 uppercase">GPO Round Stamp</span>
                    <span className="inline-block h-6 w-16 border border-dashed border-slate-300 rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* Print Footer Notice */}
            <div className="mt-4 text-center text-[9px] text-slate-400 font-mono">
              Techno World Books Hub · College Street, Kolkata · System Generated Despatch Manifest
            </div>

          </div>
        </div>

      </div>

      {/* Embedded Print CSS to format standard A4 sheet cleanly */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block,
          .print\\:overflow-visible,
          .print\\:overflow-visible * {
            visibility: visible;
          }
          .fixed {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default IndiaPostManifestModal;
