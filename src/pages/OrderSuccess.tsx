import { Link, useLocation } from 'react-router';
import { CheckCircle2, ChevronRight, Package, Truck, ArrowRight } from 'lucide-react';

export default function OrderSuccess() {
  const location = useLocation();
  const orderNumber = new URLSearchParams(location.search).get('id') || 'TW-12345678-9012';

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 text-center">
      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-emerald-100 p-3">
          <CheckCircle2 className="h-16 w-16 text-emerald-600" />
        </div>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Order Placed Successfully!
      </h1>
      <p className="mt-4 text-base text-slate-500">
        Thank you for your purchase. We've received your order <b className="text-slate-800">#{orderNumber}</b> and will begin processing it right away.
      </p>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row justify-around gap-6 items-center">
        <div className="flex flex-col items-center text-slate-700">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
          <span className="font-semibold text-sm">Order Confirmed</span>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-300 hidden sm:block" />
        <div className="flex flex-col items-center text-slate-400">
          <Package className="h-8 w-8 mb-2" />
          <span className="font-medium text-sm">Processing</span>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-300 hidden sm:block" />
        <div className="flex flex-col items-center text-slate-400">
          <Truck className="h-8 w-8 mb-2" />
          <span className="font-medium text-sm">Shipped</span>
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/my-orders" className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white shadow-sm hover:bg-slate-800 transition">
          View My Orders
        </Link>
        <Link to="/" className="inline-flex items-center justify-center rounded-xl bg-emerald-50 px-6 py-3 font-semibold text-emerald-700 hover:bg-emerald-100 transition">
          Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
