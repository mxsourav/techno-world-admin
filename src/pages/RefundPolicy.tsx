import { Link } from 'react-router';
import { RefreshCw, ExternalLink, ShieldCheck, Phone } from 'lucide-react';

export default function RefundPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 mb-8">
        <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2">
          <ShieldCheck className="h-4 w-4 text-emerald-700" /> Official Bookstore Guidelines
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Cancellation, Replacement & Refund Policy</h1>
        <p className="text-sm text-slate-500 mt-2">
          Techno World Books &bull; Kolkata, India &bull; Updated September 2026
        </p>
      </div>

      {/* Core Principles Overview Cards (Clean, professional neutral styling) */}
      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Pre-Dispatch</p>
          <p className="text-sm font-bold text-slate-900 mb-1.5">100% Order Cancellation</p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Full refund is promptly issued if an order is cancelled prior to physical dispatch from our Kolkata warehouse.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Delivered Orders</p>
          <p className="text-sm font-bold text-slate-900 mb-1.5">7-Day Free Replacement</p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Defective or transit-damaged books qualify for a complimentary replacement copy within 7 calendar days of delivery.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Fulfillment Policy</p>
          <p className="text-sm font-bold text-slate-900 mb-1.5">Replacement-Only System</p>
          <p className="text-xs text-slate-600 leading-relaxed">
            We operate on a replacement-only policy for delivered items. Dispatched transit refusals (RTO) are non-refundable.
          </p>
        </div>
      </div>

      {/* Replacement Help Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 text-white p-6 sm:p-8 mb-10 shadow-sm">
        <div className="max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-xs font-medium text-emerald-400">
            <RefreshCw className="h-3.5 w-3.5 text-emerald-400" /> Replacement Support Desk
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Need a Replacement for a Delivered Book?</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            To ensure genuine requests are handled swiftly, please record an unboxing video when opening your package and submit our online form within 7 days of receiving your order.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdP7BBi2SNX67XU0xoBDzqiXSaL4nyBBIwDfVacG8M9kVR1RQ/viewform?usp=publish-editor"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-emerald-500 transition-colors shadow-xs"
            >
              Fill Online Replacement Form <ExternalLink className="h-4 w-4" />
            </a>
            <a
              href="https://wa.me/917479135626?text=Hello%20Techno%20World%2C%20I%20would%20like%20to%20submit%20an%20unpacking%20video%20for%20book%20replacement."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <Phone className="h-4 w-4 text-emerald-400" /> WhatsApp Video: +91 747 913 5626
            </a>
          </div>
        </div>
      </div>

      {/* Comprehensive Policy Document */}
      <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
        {/* Section 1: Pre-Dispatch Cancellation */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">1. Pre-Dispatch Order Cancellation & Source Refunds</h2>
          <p>
            Customers may cancel any order at no cost while it remains under <b>Pending Confirmation</b> or <b>Packing & Procurement</b> status in our system.
          </p>
          <p>
            When an order is successfully cancelled before handoff to our courier partners, 100% of the transaction amount—including book pricing, applicable shipping fees, and taxes—is refunded back to the original method of payment (UPI, Net Banking, Debit or Credit Card). Bank credit typically reflects within 5 to 7 business days depending on your issuing bank.
          </p>
        </section>

        {/* Section 2: Dispatched Orders & Delivery Refusals */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">2. Dispatched Shipments & Doorstep Delivery Refusals</h2>
          <p>
            Orders are handed over daily to India Post or on-demand logistics partners. Once a parcel transitions to <b>Shipped / In-Transit</b>, it has departed our distribution center and can no longer be intercepted, altered, or cancelled.
          </p>
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-700 space-y-2">
            <p className="font-bold text-slate-900">Courier Transit & Return-to-Origin (RTO) Terms:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <b>Delivery Refusal:</b> If a customer declines or refuses to receive the parcel upon courier arrival, or fails to collect it from the local post office during the standard postal holding timeframe, the consignment is categorized as Return to Origin (RTO).
              </li>
              <li>
                Because one-way freight, reverse logistics transit costs, packaging materials, and reserved academic inventory cannot be recovered, orders marked RTO due to doorstep refusal are <b>strictly non-refundable</b>.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3: 7-Day Replacement & Warehouse Inspection Procedure */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">3. 7-Day Product Replacement & Physical Inspection Procedure</h2>
          <p>
            We take pride in distributing authentic, high-quality textbooks and academic reference works. While we do not offer monetary returns on delivered goods, we provide a structured, complimentary replacement process for eligible books:
          </p>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-800">
                1
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs sm:text-sm">Mandatory Unpacking Video</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  To protect against postal tampering and authenticate transit damage, recording a clear, continuous unboxing video of the sealed parcel is required. Please share this video via WhatsApp to our customer support team at <b>+91 747 913 5626</b>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-800">
                2
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs sm:text-sm">Submit the Online Form Within 7 Days</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Complete the official{' '}
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdP7BBi2SNX67XU0xoBDzqiXSaL4nyBBIwDfVacG8M9kVR1RQ/viewform?usp=publish-editor"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-emerald-700 hover:underline"
                  >
                    Google Replacement Request Form
                  </a>{' '}
                  with your Order Number, contact information, and clear photographs showing the printing anomaly or shipping damage within <b>7 calendar days</b> of parcel delivery.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-800">
                3
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs sm:text-sm">Warehouse Physical Quality Inspection</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Upon return receipt at our Kolkata facility, our quality control team conducts a physical examination of the returned copy. The book must be in its original condition: free of any pen or pencil writings, marginal notes, highlighter marks, torn or missing pages, liquid stains, or customer modifications.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-800">
                4
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs sm:text-sm">Dispatch of Replacement Book (Zero Extra Shipping Charge)</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Once the returned book successfully satisfies all quality inspection criteria, a fresh replacement copy will be dispatched immediately. <b>There is no separate delivery fee</b> for replacement shipments fulfilling these requirements.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  <i>Note on Non-Matching Items:</i> If upon inspection the returned item fails to meet the criteria (for example, containing user-incurred markings, tears, or structural modifications), the replacement cannot be approved, and the same original book will be returned back to the customer.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Non-Eligible Scenarios */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">4. Cases Ineligible for Replacement</h2>
          <p className="text-xs text-slate-600">The replacement policy does not cover:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>Requests initiated beyond the 7-calendar-day window following confirmed delivery.</li>
            <li>Absence of the required unboxing video or photographic evidence of parcel condition upon arrival.</li>
            <li>Books that have been marked, annotated, dog-eared, or structurally altered after delivery.</li>
            <li>Subjective change of mind or personal syllabus changes following courier dispatch.</li>
          </ul>
        </section>

        {/* Section 5: Support Contact */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">5. Assistance & Customer Service</h2>
          <p>
            If you have questions about your active shipment or need assistance with your replacement request, our support team is happy to assist:
          </p>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5 text-xs text-slate-700">
            <p><b>Techno World Books</b> &bull; Customer Care Division</p>
            <p>Address: 90/6A, Mahatma Gandhi Rd, Calcutta University, College Street, Kolkata 700007</p>
            <p>WhatsApp Video & Support: <b>+91 747 913 5626</b></p>
            <p>Phone Support: 033 2219 6115 &bull; Email: support@technoworldbooks.in</p>
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap gap-4 text-xs font-semibold">
        <Link to="/terms" className="text-emerald-700 hover:underline">Read Terms & Conditions →</Link>
        <Link to="/shipping-policy" className="text-emerald-700 hover:underline">Read Shipping Policy →</Link>
        <Link to="/contact" className="text-emerald-700 hover:underline">Contact Customer Support →</Link>
      </div>
    </div>
  );
}

