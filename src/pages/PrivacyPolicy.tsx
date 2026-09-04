import { Link } from 'react-router';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 mb-8">
        <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Shield className="h-4 w-4" /> Privacy & Security
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mt-2">
          How Techno World Books protects and handles your personal information
        </p>
      </div>

      <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            When you purchase books or create an account on Techno World Books, we collect personal information strictly necessary to fulfill your orders:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li><b>Contact Details:</b> Name, email address, and phone number for delivery updates and dispatch notices.</li>
            <li><b>Delivery Address:</b> House/flat number, street, nearby landmark, post office, city, state, and 6-digit postal pincode.</li>
            <li><b>Transaction Data:</b> Order history, payment method selection, and invoice records. We do not store full credit/debit card numbers or CVVs on our servers.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">2. How We Use Your Information</h2>
          <p>
            Your information is used solely to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Process, pack, and ship your ordered books via India Post or designated courier partners.</li>
            <li>Send order confirmation emails, shipment tracking details, and replacement status updates.</li>
            <li>Provide customer support and resolve order queries.</li>
            <li>Detect and prevent fraudulent transactions.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">3. Data Sharing with Courier Partners</h2>
          <p>
            To deliver your parcels, we share necessary recipient details (name, address, phone number, and COD payable amounts) with our shipping logistics providers, including India Post (Department of Posts, Govt. of India) and local on-demand courier partners. We do not sell or rent your personal information to third-party advertisers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">4. Payment Security</h2>
          <p>
            All online transactions are processed through encrypted 256-bit SSL connections via certified payment gateways compliant with PCI-DSS standards.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">5. Contacting Our Data Officer</h2>
          <p>
            If you have questions about your personal data or wish to delete your account, reach out to us at <b>support@technoworldbooks.in</b> or call <b>033 2219 6115</b>.
          </p>
        </section>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap gap-4 text-xs font-semibold">
        <Link to="/terms" className="text-emerald-700 hover:underline">Read Terms of Service →</Link>
        <Link to="/refund-policy" className="text-emerald-700 hover:underline">Read Refund & Replacement Policy →</Link>
        <Link to="/shipping-policy" className="text-emerald-700 hover:underline">Read Shipping Policy →</Link>
      </div>
    </div>
  );
}
