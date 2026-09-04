import { Link } from 'react-router';
import { FileText } from 'lucide-react';

export default function Terms() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 mb-8">
        <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
          <FileText className="h-4 w-4" /> Legal & Compliance
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Terms and Conditions of Service</h1>
        <p className="text-sm text-slate-500 mt-2">
          Last Updated: September 2026 &bull; Techno World Books (Publisher & Distributors), College Street, Kolkata
        </p>
      </div>

      {/* Essential Policy Summary - Premium Executive Editorial Styling */}
      <div className="mb-10 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
        {/* Authoritative Header Strip */}
        <div className="bg-slate-900 px-5 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold tracking-wider uppercase text-slate-100">
              Essential Policy Summary &bull; Read Before Ordering
            </span>
          </div>
          <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-400">
            Binding Terms of Sale
          </span>
        </div>

        {/* 2-Column High-Contrast Breakdown */}
        <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 p-6 gap-6 bg-slate-50/60">
          {/* Column 1 */}
          <div className="space-y-2 sm:pr-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                Cancellation & Refund Policy
              </h3>
              <span className="rounded bg-slate-200/90 px-2 py-0.5 text-[10px] font-extrabold text-slate-800 uppercase tracking-wider shrink-0">
                Pre-Dispatch Only
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Order cancellations with full monetary refund are accepted <b>exclusively prior to courier dispatch</b>. Once handed over to the carrier (status marked as Shipped), shipments cannot be recalled or refunded. Refusal of delivery resulting in Return to Origin (RTO) is strictly non-refundable.
            </p>
          </div>

          {/* Column 2 */}
          <div className="space-y-2 sm:pl-4 pt-4 sm:pt-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                7-Day Replacement Guarantee
              </h3>
              <span className="rounded bg-slate-200/90 px-2 py-0.5 text-[10px] font-extrabold text-slate-800 uppercase tracking-wider shrink-0">
                Replacements Only
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              We provide direct <b>complimentary book replacements</b> for misprinted, damaged, or defective copies within <b>7 days of delivery</b> via our official claim process (unboxing video required). Delivered items are not eligible for direct cash/bank refunds.
            </p>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or placing an order on <b>Techno World Books</b> (&ldquo;the Website&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), you acknowledge that you have read, understood, and agreed to be legally bound by these Terms and Conditions, alongside our Privacy Policy and Shipping Policy.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">2. Order Cancellation Policy (Pre-Dispatch Only)</h2>
          <p>
            Customers may request cancellation of an order <b>exclusively while the order status is PENDING, CONFIRMED, or PROCESSING</b> (prior to dispatch and courier handover).
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li><b>Before Dispatch:</b> If you cancel before dispatch, your order will be cancelled and 100% of the paid amount will be refunded to your original payment method within 5–7 business days.</li>
            <li><b>After Dispatch:</b> Once the parcel is booked and handed over to India Post or local courier partners (status transitions to <b>SHIPPED</b>), the order <b>CANNOT be cancelled</b> under any circumstances.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">3. Non-Refundable Delivery Refusal & RTO (Return to Origin)</h2>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 space-y-1.5">
            <p className="font-bold text-slate-900">
              Notice Regarding Doorstep Refusals and Unclaimed Parcels:
            </p>
            <p>
              If a recipient declines or refuses to receive the parcel upon delivery attempt by postal or courier personnel, or fails to collect it from the local post office during the standard retention window resulting in Return to Origin (RTO), <b>NO REFUND WILL BE ISSUED</b>. Postal logistics expenses, reverse transit charges, packaging overhead, and allocated academic inventory cannot be refunded post-dispatch.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">4. 7-Day Product Replacement & Quality Inspection Policy</h2>
          <p>
            We take meticulous care in verifying and packaging academic textbooks and university publications. Delivered orders operate strictly under our <b>Complimentary Replacement Framework</b>:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li><b>Eligibility Window:</b> The replacement window remains active for strictly <b>7 calendar days</b> following the delivery confirmation recorded by India Post or courier tracking.</li>
            <li><b>Mandatory Unpacking Video:</b> An uninterrupted video showing the sealed parcel being unboxed is mandatory for initiating a replacement. The video must be shared via WhatsApp to <b>+91 747 913 5626</b>.</li>
            <li><b>Replacement Request Submission:</b> The customer must complete our official{' '}
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSdP7BBi2SNX67XU0xoBDzqiXSaL4nyBBIwDfVacG8M9kVR1RQ/viewform?usp=publish-editor"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
              >
                Online Replacement Form &rarr;
              </a>
              {' '}including Order Number, description of issue, and clear photographs of the damage or defect.
            </li>
            <li><b>Physical Warehouse Inspection:</b> Upon receiving the returned copy at our facility, our quality team will physically inspect the book. The book must be in its original condition—completely free of pen/pencil markings, notations, highlighting, torn or folded pages, and physical modifications.</li>
            <li><b>Zero Replacement Delivery Charge:</b> Once the returned item satisfies all inspection criteria, a fresh replacement copy will be dispatched immediately at <b>no additional shipping fee</b> to the customer.</li>
            <li><b>Non-Compliant Items:</b> If an item returned for replacement does not fulfill these criteria (e.g. exhibits user marks or physical modifications), the replacement cannot be granted and the original book will be returned to the customer.</li>
            <li><b>No Monetary Return Refunds:</b> Cash or bank account refunds are not offered post-delivery.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">5. Pricing, Shipping Charges & COD Handling Fee</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li><b>Standard Delivery:</b> Flat ₹69 for domestic orders below ₹799. Orders of ₹799 and above qualify for <b>FREE Standard Delivery</b> nationwide.</li>
            <li><b>Speed Post:</b> Flat ₹199 premium express rate nationwide via India Post.</li>
            <li><b>Express Delivery:</b> Flat ₹149 same-day on-demand delivery for eligible Kolkata and Howrah pincodes.</li>
            <li><b>Cash on Delivery (COD):</b> An additional handling fee of <b>₹20</b> is applicable to all COD orders to cover courier cash processing.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">6. Customer Contact & Grievance Redressal</h2>
          <p>
            For any queries regarding an active order or replacement submission, contact us:
          </p>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1 text-xs text-slate-700">
            <p><b>Techno World Books</b> (Opp. Grace Cinema, College Street)</p>
            <p>90/6A, Mahatma Gandhi Rd, Calcutta University, Kolkata, West Bengal 700007</p>
            <p>Phone: 033 2219 6115 &bull; WhatsApp: <b>+91 747 913 5626</b></p>
            <p>Email: support@technoworldbooks.in</p>
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap gap-4 text-xs font-semibold">
        <Link to="/refund-policy" className="text-emerald-700 hover:underline">Read Refund & Replacement Policy →</Link>
        <Link to="/shipping-policy" className="text-emerald-700 hover:underline">Read Shipping Policy →</Link>
        <Link to="/privacy-policy" className="text-emerald-700 hover:underline">Read Privacy Policy →</Link>
        <Link to="/contact" className="text-emerald-700 hover:underline">Contact Support →</Link>
      </div>
    </div>
  );
}
