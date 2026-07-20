/* eslint-disable no-useless-escape */
import { useState } from 'react';
import { Link } from 'react-router';
import { MapPin, CreditCard, CheckCircle2, Smartphone, Landmark, Banknote, Wallet, PartyPopper, Download } from 'lucide-react';
import { formatINR } from '@/utils/helpers';
import { useStore } from '@/store/StoreContext';
import { useCartTotals } from './Cart';
import type { Address, Order } from '@/types';
import { toast } from 'sonner';

const PAYMENTS = [
  { id: 'upi', name: 'UPI', desc: 'GPay, PhonePe, Paytm & more', icon: Smartphone },
  { id: 'card', name: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', icon: CreditCard },
  { id: 'netbanking', name: 'Net Banking', desc: 'All major Indian banks', icon: Landmark },
  { id: 'wallet', name: 'Wallets', desc: 'Paytm, Amazon Pay, Mobikwik', icon: Wallet },
  { id: 'cod', name: 'Cash on Delivery', desc: 'Pay when your books arrive', icon: Banknote },
];

const INDIAN_STATES = ['West Bengal', 'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Telangana', 'Gujarat', 'Rajasthan', 'Kerala', 'Bihar', 'Madhya Pradesh', 'Punjab', 'Odisha', 'Assam', 'Other'];

export default function Checkout() {
  const { user, addresses, addAddress, clearCart } = useStore();
  const { items, subtotal, shipping, discount, total, loading, error } = useCartTotals();
  const [placed, setPlaced] = useState<Order | null>(null);
  const [selectedAddr, setSelectedAddr] = useState<string>('new');
  const [payment, setPayment] = useState('upi');
  const [form, setForm] = useState({ name: user?.name ?? '', phone: user?.phone ?? '', line1: '', city: '', state: 'West Bengal', pincode: '', type: 'Home' as 'Home' | 'Work' });
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-slate-500">
        <span className="text-4xl mb-4">⚠️</span>
        <h2 className="text-xl font-bold text-slate-700">Error Loading Cart Data</h2>
        <p className="text-sm mt-2">{error.message}</p>
        <Link to="/cart" className="mt-4 inline-block rounded-lg bg-emerald-600 px-6 py-2 font-bold text-white">Back to Cart</Link>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 text-center">
        <PartyPopper className="mx-auto h-16 w-16 text-amber-500" />
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Order placed successfully!</h1>
        <p className="mt-2 text-sm text-slate-500">
          Order <b className="text-slate-800">{placed.id}</b> · {placed.items.length} item(s) · {formatINR(placed.total)} · {placed.payment}
        </p>
        <div className="mt-6 rounded-xl border border-slate-100 bg-white p-5 text-left shadow-sm">
          <p className="flex items-center gap-2 text-sm font-bold text-slate-800"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Confirmation sent via WhatsApp, SMS & email</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <p>📦 Courier: <b>{placed.courier}</b></p>
            <p>🔢 Tracking ID: <b>{placed.trackingId}</b></p>
            <p>🚚 Expected: <b>{new Date(placed.expectedDelivery).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</b></p>
            <p>🎁 Points earned: <b>+{Math.floor(placed.total / 100) * 5}</b></p>
          </div>
          <p className="mt-3 text-xs text-slate-400">Delivering to: {placed.address.name}, {placed.address.line1}, {placed.address.city} — {placed.address.pincode}</p>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to={`/track?id=${placed.id}`} className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">Track Order</Link>
          <button onClick={() => toast.success('Invoice downloaded (PDF)')} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4" /> Download Invoice
          </button>
          <Link to="/" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <p className="text-4xl">🛒</p>
        <h1 className="mt-3 text-xl font-bold">Nothing to checkout</h1>
        <Link to="/" className="mt-4 inline-block rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white">Browse Books</Link>
      </div>
    );
  }

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaceOrder = async () => {
    let address: Address;
    if (selectedAddr !== 'new') {
      address = addresses.find((a) => a.id === selectedAddr)!;
    } else {
      if (!form.name || !/^\d{10}$/.test(form.phone) || !form.line1 || !form.city || !/^\d{6}$/.test(form.pincode)) {
        return toast.error('Please fill a complete delivery address (valid phone & pincode)');
      }
      address = { id: 'addr_' + Date.now(), ...form };
      addAddress(address);
    }
    if (payment === 'upi' && !/^[\w.\-]+@[a-zA-Z]+$/.test(upiId)) {
      return toast.error('Enter your UPI ID (e.g. name@upi)');
    }
    if (payment === 'card' && (card.number.replace(/\s/g, '').length < 16 || !card.expiry || card.cvv.length < 3)) {
      return toast.error('Enter valid card details');
    }

    setIsSubmitting(true);
    try {
      // Import orderService locally to avoid circular deps if any, or just import at top. We need it imported at top.
      const { orderService } = await import('@/services/api');
      
      const orderPayload = {
        items: items.map(i => ({ bookId: i.bookId, quantity: i.qty })),
        addressId: address.id, // For a real app, you'd save the address to DB first and get ID. Here we pass ID.
        paymentMethod: PAYMENTS.find(p => p.id === payment)!.name,
      };

      const res = await orderService.create(orderPayload);
      
      toast.success('Payment successful!');
      
      // Simulate real order object based on what the frontend expects
      const createdOrder: Order = {
        id: res.data.orderNumber,
        items: items.map(i => ({ bookId: i.bookId, qty: i.qty, price: i.book.price })),
        subtotal,
        shipping,
        discount,
        total: res.data.totalAmount,
        status: res.data.status,
        placedAt: new Date().toISOString(),
        payment: res.data.paymentMethod,
        address,
        trackingId: `TW${Math.floor(10000000 + Math.random() * 90000000)}`,
        courier: 'Delhivery',
        expectedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      setPlaced(createdOrder);
      if (clearCart) clearCart();
      window.scrollTo(0, 0);
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6">
      <h1 className="mb-5 text-2xl font-extrabold text-slate-900">Checkout</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {/* address */}
          <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="mb-4 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-slate-700">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-xs text-white">1</span>
              <MapPin className="h-4 w-4" /> Delivery Address
            </p>
            {addresses.length > 0 && (
              <div className="mb-4 space-y-2">
                {addresses.map((a) => (
                  <label key={a.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${selectedAddr === a.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                    <input type="radio" checked={selectedAddr === a.id} onChange={() => setSelectedAddr(a.id)} className="mt-1" />
                    <span className="text-sm">
                      <b>{a.name}</b> <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold">{a.type}</span><br />
                      <span className="text-slate-500">{a.line1}, {a.city}, {a.state} — {a.pincode} · {a.phone}</span>
                    </span>
                  </label>
                ))}
                <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm font-semibold ${selectedAddr === 'new' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                  <input type="radio" checked={selectedAddr === 'new'} onChange={() => setSelectedAddr('new')} /> + Add a new address
                </label>
              </div>
            )}
            {selectedAddr === 'new' && (
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit mobile" inputMode="numeric" className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
                <input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} placeholder="House no, street, area" className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 sm:col-span-2" />
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
                <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500">
                  {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="Pincode" inputMode="numeric" className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
                <div className="flex gap-2">
                  {(['Home', 'Work'] as const).map((t) => (
                    <button key={t} onClick={() => setForm({ ...form, type: t })} className={`rounded-lg border px-4 py-2 text-xs font-bold ${form.type === t ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-500'}`}>{t}</button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* payment */}
          <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="mb-4 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-slate-700">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-xs text-white">2</span>
              <CreditCard className="h-4 w-4" /> Payment Method
            </p>
            <div className="space-y-2">
              {PAYMENTS.map((p) => (
                <label key={p.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 ${payment === p.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" checked={payment === p.id} onChange={() => setPayment(p.id)} />
                  <p.icon className="h-5 w-5 text-emerald-700" />
                  <span className="text-sm">
                    <b className="text-slate-800">{p.name}</b>
                    <span className="block text-xs text-slate-500">{p.desc}</span>
                  </span>
                  {p.id === 'upi' && <span className="ml-auto rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">FASTEST</span>}
                </label>
              ))}
            </div>
            {payment === 'upi' && (
              <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 sm:max-w-xs" />
            )}
            {payment === 'card' && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value.replace(/[^\d]/g, '').slice(0, 16) })} placeholder="Card number" inputMode="numeric" className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 sm:col-span-2" />
                <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="Name on card" className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
                <div className="flex gap-3">
                  <input value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value.slice(0, 5) })} placeholder="MM/YY" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
                  <input value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })} placeholder="CVV" type="password" inputMode="numeric" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
                </div>
              </div>
            )}
            {payment === 'cod' && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">₹20 COD handling fee waived on prepaid conversion at delivery. Keep exact change ready.</p>}
          </section>
        </div>

        {/* summary */}
        <aside className="h-fit rounded-xl border border-slate-100 bg-white p-5 shadow-sm lg:sticky lg:top-36">
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">Order Summary</p>
          <div className="max-h-48 space-y-2 overflow-auto border-b border-dashed border-slate-200 pb-3">
            {items.map((i) => (
              <div key={i.bookId} className="flex justify-between gap-2 text-sm">
                <span className="line-clamp-1 text-slate-600">{i.book.title} × {i.qty}</span>
                <span className="shrink-0 font-semibold">{formatINR(i.book.price * i.qty)}</span>
              </div>
            ))}
          </div>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd>{formatINR(subtotal)}</dd></div>
            {discount > 0 && <div className="flex justify-between"><dt className="text-slate-500">Coupon</dt><dd className="text-emerald-700">− {formatINR(discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-slate-500">Delivery</dt><dd>{shipping === 0 ? 'FREE' : formatINR(shipping)}</dd></div>
            <div className="flex justify-between border-t pt-2 text-base font-extrabold"><span>Total</span><span>{formatINR(total)}</span></div>
          </dl>
          <button disabled={isSubmitting} onClick={handlePlaceOrder} className="mt-4 w-full rounded-xl bg-amber-400 py-3.5 text-sm font-extrabold text-slate-900 shadow hover:bg-amber-500 disabled:opacity-50">
            {isSubmitting ? 'Processing...' : payment === 'cod' ? `Place Order · ${formatINR(total)}` : `Pay ${formatINR(total)} Securely`}
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-400">🔒 256-bit SSL encrypted · PCI-DSS compliant · Demo checkout, no real charge</p>
        </aside>
      </div>
    </div>
  );
}
