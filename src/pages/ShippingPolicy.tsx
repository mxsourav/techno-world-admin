import { Link } from 'react-router';
import { Truck, Zap, Package, Store } from 'lucide-react';

export default function ShippingPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 mb-8">
        <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Truck className="h-4 w-4" /> Logistics & Delivery
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shipping & Delivery Policy</h1>
        <p className="text-sm text-slate-500 mt-2">
          Nationwide delivery across 27,000+ Indian pincodes via India Post & local on-demand couriers
        </p>
      </div>

      {/* 4 Fulfillment Options */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
            <Package className="h-4 w-4 text-emerald-600" />
            <span>Standard Delivery</span>
          </div>
          <p className="text-base font-extrabold text-emerald-700">₹69 <span className="text-[11px] font-normal text-slate-500">(FREE ₹799+)</span></p>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Reliable delivery across all Indian states. Estimated transit: 5–7 business days.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
            <Truck className="h-4 w-4 text-orange-600" />
            <span>Speed Post</span>
          </div>
          <p className="text-base font-extrabold text-orange-600">₹199 Flat</p>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            High-priority inland parcel booked via India Post network with SMS tracking. 2–3 days.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
            <Zap className="h-4 w-4 text-purple-700" />
            <span>Local Express</span>
          </div>
          <p className="text-base font-extrabold text-purple-800">₹149 Flat</p>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            On-demand dispatch (Porter/Rapido) for Kolkata & Howrah. Same-day priority.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
            <Store className="h-4 w-4 text-emerald-700" />
            <span>Store Takeaway</span>
          </div>
          <p className="text-base font-extrabold text-emerald-700">FREE</p>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Prepaid pickup at College Street dispatch desk. 3–4 time slots offered to choose.
          </p>
        </div>
      </div>

      {/* Main Details */}
      <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">1. Daily 2:00 PM Dispatch Batch & Consolidation</h2>
          <p>
            Orders placed before 2:00 PM IST on working days (Monday to Saturday) are handed over to India Post in our daily 2:00 PM dispatch batch.
          </p>
          <p>
            <b>Same-Batch Free Add-on Shipping:</b> If you place an additional order to the same delivery address before today&apos;s 2:00 PM dispatch, your second order will be consolidated into your parcel with <b>₹0 delivery charge</b> automatically! (Applies to standard delivery).
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">2. Cash on Delivery (COD) Handling Fee</h2>
          <p>
            Cash on Delivery is available across most serviceable Indian pincodes for eligible book values. An additional handling fee of <b>₹20</b> is appended to the order total at checkout to cover courier cash processing. (Store Takeaway is prepaid-only).
          </p>
          <p className="text-xs text-slate-500">
            Please keep exact change ready upon arrival of the delivery executive.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">3. Non-Refundable Delivery Refusal & RTO Policy</h2>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 space-y-1.5">
            <p className="font-bold text-slate-900">
              Refusal of Delivery Notice:
            </p>
            <p className="leading-relaxed">
              Once an order has been dispatched from our College Street warehouse, it cannot be recalled or cancelled. If a customer refuses to accept the parcel from the postal carrier or courier agent, leading to an RTO (Return to Origin), <b>no refund will be provided</b>.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">4. Tracking Your Parcel</h2>
          <p>
            Immediately upon dispatch, you will receive an automated email notification with your official <b>India Post tracking number</b> (e.g. <code>EB...IN</code> for Speed Post or parcel article code) or courier partner details.
          </p>
          <p>
            You can also track your shipment status anytime directly via our website at{' '}
            <Link to="/track" className="font-bold text-emerald-700 hover:underline">
              Track Order Page
            </Link>
            .
          </p>
        </section>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap gap-4 text-xs font-semibold">
        <Link to="/terms" className="text-emerald-700 hover:underline">Read Terms of Service →</Link>
        <Link to="/refund-policy" className="text-emerald-700 hover:underline">Read Refund & Replacement Policy →</Link>
        <Link to="/contact" className="text-emerald-700 hover:underline">Contact Support →</Link>
      </div>
    </div>
  );
}
