import { useState } from 'react';
import {
  Download, ExternalLink, Clock, Copy, Check, Truck, X
} from 'lucide-react';
import { toast } from 'sonner';
import { downloadIndiaPostBulkFile } from '@/utils/indiaPostExport';

interface IndiaPostBatchExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders?: any[];
}

export default function IndiaPostBatchExporterModal({
  isOpen,
  onClose,
  orders = [],
}: IndiaPostBatchExporterModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const totalParcels = orders.length;
  const totalWeightKg = (orders.reduce((sum, o) => sum + Math.max(250, (o.items?.length || 1) * 350), 0) / 1000).toFixed(2);
  const totalValue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Copied ${field} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleExport = () => {
    setIsExporting(true);
    try {
      const res = downloadIndiaPostBulkFile(orders);
      toast.success(`Exported ${res.count} orders to ${res.filename}`);
    } catch (err: any) {
      toast.error('Failed to export file: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-700 border border-red-200">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  India Post Daily Batch Exporter
                </h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-mono font-semibold text-slate-700">
                  ID: 1762888069
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Generate official bulk upload files for the India Post Customer Self-Service Portal.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 4:00 PM PICKUP TIMELINE NOTICE */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
            <Clock className="h-4 w-4 text-amber-700" />
            <span>Daily 4:00 PM Courier Pickup Schedule & Cutoff</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
            <div className="rounded-lg bg-white/80 p-2 border border-amber-200/60">
              <span className="block font-mono font-bold text-slate-900">2:00 PM</span>
              <span className="text-[11px] text-slate-600">Daily Order Cutoff</span>
            </div>
            <div className="rounded-lg bg-white/80 p-2 border border-amber-200/60">
              <span className="block font-mono font-bold text-slate-900">2:15 PM</span>
              <span className="text-[11px] text-slate-600">Upload Excel to Portal</span>
            </div>
            <div className="rounded-lg bg-white/80 p-2 border border-amber-200/60">
              <span className="block font-mono font-bold text-slate-900">2:30 - 3:45 PM</span>
              <span className="text-[11px] text-slate-600">Print Labels & Pack</span>
            </div>
            <div className="rounded-lg bg-amber-100/90 p-2 border border-amber-300">
              <span className="block font-mono font-bold text-amber-900">4:00 PM</span>
              <span className="text-[11px] text-amber-800 font-medium">Pickup & Scan</span>
            </div>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            <strong>Rule:</strong> Submit your Excel file by <strong>2:00 PM - 2:30 PM</strong> so India Post registers the batch, barcodes are issued, and warehouse staff has time to stick labels before the van arrives at 4:00 PM.
          </p>
        </div>

        {/* BATCH SUMMARY STATS */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className="block text-[11px] font-medium text-slate-500 uppercase">Parcels in Batch</span>
            <span className="text-xl font-bold font-mono text-slate-900">{totalParcels}</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className="block text-[11px] font-medium text-slate-500 uppercase">Est. Weight</span>
            <span className="text-xl font-bold font-mono text-slate-900">{totalWeightKg} kg</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className="block text-[11px] font-medium text-slate-500 uppercase">Total Invoice Value</span>
            <span className="text-xl font-bold font-mono text-slate-900">₹{totalValue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* INDIA POST PORTAL QUICK LOGIN HELPER */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800">
              India Post Portal Credentials (AKIBUR RAHMAN)
            </span>
            <a
              href="https://business.cept.gov.in"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
            >
              Open Click n Book Portal <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1">
              <span className="text-slate-500">Customer ID:</span>
              <span className="font-mono font-bold text-slate-900">1762888069</span>
              <button
                type="button"
                onClick={() => copyToClipboard('1762888069', 'Customer ID')}
                className="ml-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {copiedField === 'Customer ID' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1">
              <span className="text-slate-500">Password:</span>
              <span className="font-mono font-bold text-slate-900">Dop@1234</span>
              <button
                type="button"
                onClick={() => copyToClipboard('Dop@1234', 'Password')}
                className="ml-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {copiedField === 'Password' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || totalParcels === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-red-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Download India Post Excel Batch ({totalParcels})</span>
          </button>
        </div>

      </div>
    </div>
  );
}
