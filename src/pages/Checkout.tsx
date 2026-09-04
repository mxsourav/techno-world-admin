import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { MapPin, CreditCard, CheckCircle2, Smartphone, Landmark, Banknote, Wallet, PartyPopper, Download, Tag, Loader2, ShieldCheck, AlertCircle, Truck, Sparkles, Package, Zap, Store, Clock, Building2, Info, CalendarCheck } from 'lucide-react';
import { formatINR } from '@/utils/helpers';
import { useStore } from '@/store/StoreContext';
import { useCartTotals } from '@/hooks/useCartTotals';
import type { Address, Order } from '@/types';
import { toast } from 'sonner';
import { shippingService, profileService, orderService } from '@/services/api';

const PAYMENTS = [
  { id: 'upi', name: 'UPI', desc: 'GPay, PhonePe, Paytm & more', icon: Smartphone },
  { id: 'card', name: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', icon: CreditCard },
  { id: 'netbanking', name: 'Net Banking', desc: 'All major Indian banks', icon: Landmark },
  { id: 'wallet', name: 'Wallets', desc: 'Paytm, Amazon Pay, Mobikwik', icon: Wallet },
  { id: 'cod', name: 'Cash on Delivery', desc: 'Pay when your books arrive', icon: Banknote },
];

const INDIAN_STATES = ['West Bengal', 'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Telangana', 'Gujarat', 'Rajasthan', 'Kerala', 'Bihar', 'Madhya Pradesh', 'Punjab', 'Odisha', 'Assam', 'Other'];

export default function Checkout() {
  const { user, addresses: storeAddresses, addAddress, clearCart, applyCoupon, clearCoupon } = useStore();
  const [fulfillmentMode, setFulfillmentMode] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [dbAddresses, setDbAddresses] = useState<any[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<string>('new');
  const [shippingMethod, setShippingMethod] = useState<string>('NORMAL_POST');
  const [payment, setPayment] = useState('upi');
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: (user?.email && !user.email.includes('technoworld.com') && !user.email.includes('google.dev') && !user.email.includes('@mail.com')) ? user.email : '',
    phone: user?.phone ?? '',
    line1: '',
    line2: '',
    postOffice: '',
    landmark: '',
    city: '',
    state: 'West Bengal',
    pincode: '',
    type: 'Home' as 'Home' | 'Work',
  });
  const [pickupForm, setPickupForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    email: (user?.email && !user.email.includes('technoworld.com') && !user.email.includes('google.dev') && !user.email.includes('@mail.com')) ? user.email : '',
  });
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [couponInput, setCouponInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);

  useEffect(() => {
    profileService.getAddresses().then((res: any) => {
      if (res.success && Array.isArray(res.data)) {
        setDbAddresses(res.data);
      }
    }).catch(() => {});
  }, []);

  // Strict Address Deduplication: unique by address line and pincode
  const addresses = useMemo(() => {
    const rawList = dbAddresses.length > 0 ? dbAddresses : storeAddresses;
    if (!rawList || !Array.isArray(rawList)) return [];
    const seen = new Set<string>();
    return rawList.filter((a: any) => {
      const line = (a.line1 || a.addressLine1 || '').trim().toLowerCase();
      const pin = (a.pincode || '').trim();
      const key = `${line}_${pin}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [dbAddresses, storeAddresses]);

  const selectedAddressObj = useMemo(() => {
    if (selectedAddr !== 'new') {
      return addresses.find((a: any) => a.id === selectedAddr);
    }
    return null;
  }, [selectedAddr, addresses]);

  const effectiveShippingMethod = fulfillmentMode === 'PICKUP' ? 'SELF_PICKUP' : shippingMethod;

  const activePincode = useMemo(() => {
    if (fulfillmentMode === 'PICKUP') return '700007';
    if (selectedAddressObj) {
      return selectedAddressObj.pincode;
    }
    const clean = form.pincode.replace(/\D/g, '').slice(0, 6);
    if (clean.length === 6 && /^[1-8]\d{5}$/.test(clean)) {
      return clean;
    }
    return undefined;
  }, [fulfillmentMode, selectedAddressObj, form.pincode]);

  const effectivePricingAddress = useMemo(() => {
    if (fulfillmentMode === 'PICKUP') {
      return {
        fullName: pickupForm.name || user?.name || 'Valued Customer',
        phone: pickupForm.phone || user?.phone || '9876543210',
        email: pickupForm.email || user?.email || '',
        addressLine1: 'Techno World Books Takeaway Desk, 90/6A Mahatma Gandhi Rd',
        pincode: '700007',
        city: 'Kolkata',
        state: 'West Bengal',
      };
    }
    if (selectedAddressObj) {
      return {
        fullName: selectedAddressObj.name || selectedAddressObj.fullName,
        phone: selectedAddressObj.phone,
        email: form.email,
        addressLine1: selectedAddressObj.line1 || selectedAddressObj.addressLine1,
        pincode: selectedAddressObj.pincode,
        city: selectedAddressObj.city,
        state: selectedAddressObj.state,
      };
    }
    return {
      fullName: (form as any).name || (form as any).fullName,
      phone: form.phone,
      email: form.email,
      addressLine1: (form as any).line1 || (form as any).addressLine1,
      pincode: form.pincode,
      city: form.city,
      state: form.state,
    };
  }, [fulfillmentMode, pickupForm, user, selectedAddressObj, form]);

  const {
    items,
    subtotal,
    shipping,
    codFee,
    isShippingCalculated,
    deliveryOptions,
    selectedShippingMethod,
    shippingZone,
    estimatedTransitDays,
    isAddonBundle,
    bundledWithOrderNumber,
    discount,
    total,
    appliedCoupon,
    couponError,
    isValid,
    errors,
    loading,
    error,
  } = useCartTotals(activePincode, selectedAddressObj?.id, effectivePricingAddress, effectiveShippingMethod, payment);

  const [pincodeStatus, setPincodeStatus] = useState<{
    loading: boolean;
    verified: boolean;
    postOffice?: string;
    error?: string;
  }>({ loading: false, verified: false });

  // Real-time India Post Pincode Lookup
  useEffect(() => {
    const cleanPin = form.pincode.replace(/\D/g, '').slice(0, 6);
    if (cleanPin.length === 6) {
      setPincodeStatus({ loading: true, verified: false });
      shippingService
        .verifyPincode(cleanPin)
        .then((res) => {
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            const office = res.data[0];
            setPincodeStatus({
              loading: false,
              verified: true,
              postOffice: `${office.office_name}, ${office.state_name}`,
            });
            setForm((prev) => ({
              ...prev,
              city: prev.city || office.city_name || '',
              postOffice: prev.postOffice || office.office_name || '',
              state: INDIAN_STATES.includes(office.state_name) ? office.state_name : prev.state,
            }));
          } else {
            setPincodeStatus({
              loading: false,
              verified: false,
              error: `PIN code ${cleanPin} is non-existent or unserviceable`,
            });
          }
        })
        .catch((err) => {
          setPincodeStatus({
            loading: false,
            verified: false,
            error: err?.response?.data?.message || `Invalid or non-existent PIN code (${cleanPin})`,
          });
        });
    } else {
      setPincodeStatus({ loading: false, verified: false });
    }
  }, [form.pincode]);

  if (loading && items.length === 0) {
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
    if (placed.courier === 'STORE_TAKEAWAY' || placed.trackingId?.startsWith('PICKUP-')) {
      return (
        <div className="mx-auto max-w-2xl px-4 py-14 text-center">
          <PartyPopper className="mx-auto h-16 w-16 text-emerald-600" />
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Store Pickup Order Placed!</h1>
          <p className="mt-2 text-sm text-slate-500">
            Order <b className="text-slate-800">{placed.id}</b> · {placed.items?.length} item(s) · {formatINR(placed.total)} · {placed.payment}
          </p>
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm">
            <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Store Takeaway Order Confirmed
            </p>
            <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400 font-medium">Pickup Desk Location</p>
                <p className="font-semibold text-slate-800">Techno World Books Dispatch Desk</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  90/6A, Mahatma Gandhi Rd, opp. Grace Cinema, College Street, Kolkata 700007
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Collector</p>
                <p className="font-semibold text-slate-800">{placed.address.name}</p>
                <p className="text-xs text-slate-600">+91 {placed.address.phone}</p>
                <p className="text-xs text-slate-400 mt-1">{placed.address.email}</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900">
              <p className="font-bold flex items-center gap-1.5">
                <CalendarCheck className="h-4 w-4 text-emerald-700" /> Next Step: Choose Your Pickup Time Slot
              </p>
              <p className="mt-1 text-emerald-800 leading-relaxed">
                Our warehouse team is preparing your books and will send 3–4 time slots to your <b>Notification Center</b> and <b>Order Details</b>. Select your slot and bring your invoice (on mobile or printed) to collect your books.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/profile?tab=orders" className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">
              View Order & Pickup Slots
            </Link>
            <button onClick={() => toast.success('Official Invoice will be available once appointment slot is confirmed.')} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <Download className="h-4 w-4" /> Download Invoice
            </button>
            <Link to="/" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
              Continue Shopping
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-2xl px-4 py-14 text-center">
        <PartyPopper className="mx-auto h-16 w-16 text-amber-500" />
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Order placed successfully!</h1>
        <p className="mt-2 text-sm text-slate-500">
          Order <b className="text-slate-800">{placed.id}</b> · {placed.items?.length} item(s) · {formatINR(placed.total)} · {placed.payment}
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

  if (items?.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <p className="text-4xl">🛒</p>
        <h1 className="mt-3 text-xl font-bold">Nothing to checkout</h1>
        <Link to="/" className="mt-4 inline-block rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white">Browse Books</Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    const userEmail = (form.email || user?.email || pickupForm.email || '').trim();
    if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      return toast.error('Valid Email ID is mandatory to place an order');
    }

    if (fulfillmentMode === 'PICKUP') {
      const collectorName = pickupForm.name.trim();
      const collectorPhone = pickupForm.phone.replace(/\D/g, '');
      const collectorEmail = (pickupForm.email || userEmail).trim();

      if (!collectorName) return toast.error("Collector's Full Name is required for Store Pickup");
      if (!collectorPhone || collectorPhone.length < 10) {
        return toast.error("Please enter a valid 10-digit mobile phone number for pickup notifications");
      }
      if (payment === 'cod') {
        return toast.error("Cash on Delivery is not available for Store Takeaway. Please pay online via UPI, Card, or Net Banking.");
      }
      if (payment === 'upi' && !/^[\w.\-]+@[a-zA-Z]+$/.test(upiId)) {
        return toast.error('Enter your UPI ID (e.g. name@upi)');
      }
      if (payment === 'card' && (card.number.replace(/\s/g, '').length < 16 || !card.expiry || card.cvv.length < 3)) {
        return toast.error('Enter valid card details');
      }

      setIsSubmitting(true);
      try {
        const orderPayload = {
          items: items.map((i: any) => ({ bookId: i.bookId, quantity: i.quantity })),
          email: collectorEmail,
          shippingMethod: 'SELF_PICKUP',
          pickupName: collectorName,
          pickupPhone: collectorPhone,
          pickupEmail: collectorEmail,
          address: {
            fullName: collectorName,
            email: collectorEmail,
            phone: collectorPhone,
            addressLine1: 'Store Takeaway Desk - College Street Office',
            city: 'Kolkata',
            state: 'West Bengal',
            pincode: '700007',
          },
          paymentMethod: PAYMENTS.find(p => p.id === payment)?.name || 'UPI',
          couponCode: appliedCoupon ? appliedCoupon : undefined,
        };

        const res = await orderService.create(orderPayload);
        const serverOrder = res.data;

        const finishOrder = () => {
          const createdOrder: Order = {
            id: serverOrder.orderNumber,
            items: items.map((i: any) => ({ bookId: i.bookId, qty: i.quantity, price: i.unitPrice })),
            subtotal,
            shipping: 0,
            discount,
            total: serverOrder.totalAmount,
            status: serverOrder.status,
            placedAt: new Date().toISOString(),
            payment: serverOrder.paymentMethod,
            address: {
              id: 'pickup_office',
              name: collectorName,
              phone: collectorPhone,
              email: collectorEmail,
              line1: '90/6A, Mahatma Gandhi Rd, opp. Grace Cinema, College Street',
              postOffice: 'College Street SO',
              city: 'Kolkata',
              state: 'West Bengal',
              pincode: '700007',
              type: 'Work',
            },
            trackingId: 'PICKUP-APPOINTMENT-PENDING',
            courier: 'STORE_TAKEAWAY',
            expectedDelivery: new Date().toISOString(),
          };
          setPlaced(createdOrder);
          if (clearCart) clearCart();
          window.scrollTo(0, 0);
        };

        if (serverOrder.razorpayOrderId) {
          const { loadRazorpay } = await import('@/utils/loadRazorpay');
          const loaded = await loadRazorpay();
          if (!loaded) {
            throw new Error('Razorpay SDK failed to load. Are you online?');
          }

          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
            amount: Math.round(serverOrder.totalAmount * 100),
            currency: 'INR',
            name: 'Techno World Books',
            description: 'Store Pickup Order',
            order_id: serverOrder.razorpayOrderId,
            handler: function (_response: any) {
              toast.success('Payment successful!');
              finishOrder();
            },
            prefill: {
              name: collectorName,
              contact: collectorPhone,
              email: collectorEmail,
            },
            theme: {
              color: '#059669',
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.on('payment.failed', function (response: any) {
            toast.error('Payment failed: ' + response.error.description);
            setIsSubmitting(false);
          });
          rzp.open();
        } else {
          toast.success('Store pickup order placed successfully!');
          finishOrder();
          setIsSubmitting(false);
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to place order');
        setIsSubmitting(false);
      }
      return;
    }

    let address: Address;
    const deliveryEmail = (form.email || user?.email || '').trim();
    if (!deliveryEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryEmail)) {
      return toast.error('Valid Email ID is mandatory to place an order');
    }

    if (selectedAddr !== 'new') {
      address = addresses.find((a: any) => a.id === selectedAddr)!;
    } else {
      if (!form.name.trim()) return toast.error('Full Name is required');
      if (!form.phone || !/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) {
        return toast.error('Please enter a valid 10-digit mobile number');
      }
      if (!form.line1.trim()) return toast.error('Address line (House no, Street) is required');
      if (!form.postOffice.trim()) return toast.error('Local Post Office name is mandatory');
      if (!form.city.trim()) return toast.error('City is required');
      if (!form.pincode || !/^\d{6}$/.test(form.pincode.replace(/\D/g, ''))) {
        return toast.error('Please enter a valid 6-digit PIN code');
      }

      address = { id: 'addr_' + Date.now(), ...form, email: userEmail };
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
      const orderPayload = {
        items: items.map((i: any) => ({ bookId: i.bookId, quantity: i.quantity })),
        addressId: address.id?.startsWith('addr_') ? undefined : address.id,
        email: userEmail,
        address: {
          fullName: address.name || (address as any).fullName || form.name || 'Valued Customer',
          email: userEmail,
          phone: address.phone || form.phone || '9876543210',
          addressLine1: address.line1 || (address as any).addressLine1 || form.line1 || 'Delivery Address',
          addressLine2: (address as any).line2 || (address as any).addressLine2 || null,
          postOffice: (address as any).postOffice || form.postOffice || 'Local Post Office',
          landmark: (address as any).landmark || form.landmark || null,
          city: address.city || form.city || 'Kolkata',
          state: address.state || form.state || 'West Bengal',
          pincode: address.pincode || form.pincode || '700001',
        },
        paymentMethod: payment === 'cod' ? 'COD' : (PAYMENTS.find(p => p.id === payment)?.name || 'UPI'),
        couponCode: appliedCoupon ? appliedCoupon : undefined,
        shippingMethod,
      };

      const res = await orderService.create(orderPayload);
      const serverOrder = res.data;

      const finishOrder = () => {
        const createdOrder: Order = {
          id: serverOrder.orderNumber,
          items: items.map((i: any) => ({ bookId: i.bookId, qty: i.quantity, price: i.unitPrice })),
          subtotal,
          shipping,
          discount,
          total: serverOrder.totalAmount,
          status: serverOrder.status,
          placedAt: new Date().toISOString(),
          payment: serverOrder.paymentMethod,
          address,
          trackingId: `TW${Math.floor(10000000 + Math.random() * 90000000)}`,
          courier: 'Delhivery',
          expectedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        };
        
        setPlaced(createdOrder);
        if (clearCart) clearCart();
        window.scrollTo(0, 0);
      };

      if (payment !== 'cod' && serverOrder.razorpayOrderId) {
        const { loadRazorpay } = await import('@/utils/loadRazorpay');
        const loaded = await loadRazorpay();
        if (!loaded) {
          throw new Error('Razorpay SDK failed to load. Are you online?');
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder', // Fallback for demo
          amount: Math.round(serverOrder.totalAmount * 100),
          currency: 'INR',
          name: 'Techno World Books',
          description: 'Book Purchase',
          order_id: serverOrder.razorpayOrderId,
          handler: function (_response: any) {
            toast.success('Payment successful!');
            finishOrder();
          },
          prefill: {
            name: form.name,
            contact: form.phone
          },
          theme: {
            color: '#059669' // Emerald-600
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          toast.error('Payment failed: ' + response.error.description);
          setIsSubmitting(false);
        });
        rzp.open();
        // Do not set isSubmitting to false yet, let handler or fail event do it
      } else {
        toast.success('Order placed successfully!');
        finishOrder();
        setIsSubmitting(false);
      }

    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6">
      <h1 className="mb-5 text-2xl font-extrabold text-slate-900">Checkout</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {/* Fulfillment Mode Selector */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Select How You Want to Receive Your Order
            </p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setFulfillmentMode('DELIVERY');
                  if (shippingMethod === 'SELF_PICKUP') setShippingMethod('NORMAL_POST');
                }}
                className={`flex items-center gap-2.5 sm:gap-3 rounded-xl border p-3 text-left transition-all ${
                  fulfillmentMode === 'DELIVERY'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${fulfillmentMode === 'DELIVERY' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className={`text-sm font-bold ${fulfillmentMode === 'DELIVERY' ? 'text-emerald-950' : 'text-slate-800'}`}>
                    Home Delivery
                  </p>
                  <p className="text-[11px] text-slate-500">Speed Post / Postal Network</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFulfillmentMode('PICKUP');
                  setShippingMethod('SELF_PICKUP');
                  if (payment === 'cod') setPayment('upi');
                }}
                className={`flex items-center gap-2.5 sm:gap-3 rounded-xl border p-3 text-left transition-all ${
                  fulfillmentMode === 'PICKUP'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${fulfillmentMode === 'PICKUP' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className={`text-sm font-bold ${fulfillmentMode === 'PICKUP' ? 'text-emerald-950' : 'text-slate-800'}`}>
                      Store Self-Pickup
                    </p>
                    <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-extrabold text-white">FREE</span>
                  </div>
                  <p className="text-[11px] text-slate-500">College Street Dispatch Desk</p>
                </div>
              </button>
            </div>
          </div>

          {fulfillmentMode === 'PICKUP' ? (
            /* STORE SELF-PICKUP DETAILS */
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-4 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-slate-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-xs text-white">1</span>
                <Store className="h-4 w-4" /> Collector Information & Pickup Desk
              </p>

              {/* Collector Contact Form */}
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Collector Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      value={pickupForm.name}
                      onChange={(e) => setPickupForm({ ...pickupForm, name: e.target.value })}
                      placeholder="Person who will collect the book"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Collector Mobile / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex rounded-lg border border-slate-200 focus-within:border-emerald-500">
                      <span className="flex items-center bg-slate-50 px-2.5 text-xs font-semibold text-slate-500 border-r border-slate-200">+91</span>
                      <input
                        value={pickupForm.phone}
                        onChange={(e) => setPickupForm({ ...pickupForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        placeholder="10-digit mobile number"
                        className="w-full rounded-r-lg px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">Can be different from your account if a friend or family member is collecting.</p>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Email Address for Official Tax Invoice <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={pickupForm.email}
                    onChange={(e) => setPickupForm({ ...pickupForm, email: e.target.value })}
                    placeholder="youremail@example.com"
                    type="email"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">Invoice will be emailed here and available in your Account Center for pickup verification.</p>
                </div>
              </div>

              {/* Store Address & Location Card */}
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-emerald-100 p-2 text-emerald-800 shrink-0 mt-0.5">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Techno World Books — College Street Dispatch Desk</p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      90/6A, Mahatma Gandhi Rd, opp. Grace Cinema, Calcutta University, College Street, Kolkata, West Bengal 700007
                    </p>
                    <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      Operating Hours: Monday – Saturday, 11:00 AM – 7:30 PM (Per appointed slot)
                    </p>
                  </div>
                </div>
              </div>

              {/* Strict Independence Disclaimer */}
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <p className="font-bold text-slate-800">Enterprise Division & Offline Retail Notice</p>
                    <p className="leading-relaxed">
                      Techno World Books Online and the College Street offline retail bookstore operate under the same parent brand trademark, but run as completely separate corporate divisions with independent inventory and accounting systems.
                    </p>
                    <p className="leading-relaxed">
                      Offline retail counter exchanges, returns, or over-the-counter replacements are strictly not possible. You can place your order online, receive your official invoice in your account / email upon acceptance, and present that invoice at our College Street dispatch desk at your selected appointment time to collect your books.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            /* DELIVERY ADDRESS */
            <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="mb-4 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-slate-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-xs text-white">1</span>
                <MapPin className="h-4 w-4" /> Delivery Address
              </p>
              {addresses?.length > 0 && (
                <div className="mb-4 space-y-2">
                  {addresses.map((a: any) => (
                    <label key={a.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${selectedAddr === a.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                      <input type="radio" checked={selectedAddr === a.id} onChange={() => setSelectedAddr(a.id)} className="mt-1" />
                      <span className="text-sm">
                        <b>{a.name || a.fullName}</b> <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold">{a.type || 'HOME'}</span><br />
                        <span className="text-slate-500">{a.line1 || a.addressLine1}, {a.city}, {a.state} — <b>{a.pincode}</b> · +91 {a.phone}</span>
                      </span>
                    </label>
                  ))}
                  <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm font-semibold ${selectedAddr === 'new' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                    <input type="radio" checked={selectedAddr === 'new'} onChange={() => setSelectedAddr('new')} /> + Add a new address
                  </label>
                </div>
              )}
              {/* Mandatory Email for Order Confirmation */}
              <div className="mb-4 rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Email ID <span className="text-rose-600">* (Mandatory for order invoices & tracking)</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. yourname@gmail.com"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 shadow-sm"
                />
              </div>

              {selectedAddr === 'new' && (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full Name *" className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Mobile Number *" type="tel" className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
                  </div>
                  <input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} placeholder="House/Flat No., Building Name, Street *" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
                  <input value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} placeholder="Apartment, Suite, Unit, etc. (optional)" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
                  
                  {/* Mandatory Post Office Name Input */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Local Post Office Name <span className="text-rose-600">* (Mandatory for postal dispatch)</span>
                    </label>
                    <input
                      value={form.postOffice}
                      onChange={(e) => setForm({ ...form, postOffice: e.target.value })}
                      placeholder="e.g. Bowbazar SO, Park Street PO, College Street SO"
                      required
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>

                  <input value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} placeholder="Landmark (e.g. Near Metro Station)" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City *" className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
                    <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500">
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="flex gap-2">
                      <input
                        value={form.pincode}
                        onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        placeholder="6-digit Pincode"
                        inputMode="numeric"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                      />
                      <div className="flex shrink-0 gap-2">
                        {(['Home', 'Work'] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setForm({ ...form, type: t })}
                            className={`rounded-lg border px-4 py-2 text-xs font-bold ${
                              form.type === t
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                                : 'border-slate-200 text-slate-500'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* India Post Pincode Deliverability Feedback */}
                    {pincodeStatus.loading && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                        <Loader2 className="h-3 w-3 animate-spin text-emerald-600" /> Verifying postal delivery via India Post...
                      </p>
                    )}
                    {pincodeStatus.verified && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        Speed Post Deliverable: {pincodeStatus.postOffice}
                      </p>
                    )}
                    {pincodeStatus.error && form.pincode.length === 6 && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded border border-rose-100">
                        <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                        {pincodeStatus.error}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Step 2: Fulfillment / Delivery Method */}
          {fulfillmentMode === 'PICKUP' ? (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-slate-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-xs text-white">2</span>
                <Store className="h-4 w-4" /> Fulfillment Method
              </p>
              <div className="rounded-xl border-2 border-emerald-600 bg-emerald-50/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Store className="h-5 w-5 text-emerald-700" />
                    <div>
                      <p className="text-sm font-bold text-emerald-950">Store Self-Pickup (College Street Desk)</p>
                      <p className="text-xs text-emerald-800 mt-0.5">Ready per appointed time slot · Zero shipping fee</p>
                    </div>
                  </div>
                  <span className="rounded-md bg-emerald-700 px-2.5 py-1 text-xs font-black text-white">FREE</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-2.5 border-t border-emerald-100 pt-2 leading-relaxed">
                  📅 Once your order is placed, our admin team will offer <b>3 to 4 pickup time slots</b> in your Notification Center & Order Details. Choose the one that suits your schedule and collect your books using your official invoice!
                </p>
              </div>
            </section>
          ) : (
            isShippingCalculated && (
              <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                <p className="mb-4 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-slate-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-xs text-white">2</span>
                  <Truck className="h-4 w-4" /> Choose Delivery Method
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {deliveryOptions?.filter((opt: any) => opt.eligible !== false).map((opt: any) => {
                    const methodId = opt.method || opt.id;
                    const isSelected = shippingMethod === methodId;
                    const isExpress = methodId === 'EXPRESS_LOCAL';
                    const Icon = methodId === 'SPEED_POST' ? Zap : methodId === 'EXPRESS_LOCAL' ? Truck : Package;
                    return (
                      <label
                        key={methodId}
                        className={`relative flex cursor-pointer flex-col gap-2 rounded-xl border p-4 transition-all ${
                          isSelected 
                            ? isExpress 
                              ? 'border-purple-800 bg-purple-50 ring-1 ring-purple-800' 
                              : 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isExpress && <div className="absolute inset-y-0 left-0 w-1.5 rounded-l-xl bg-gradient-to-b from-purple-800 to-purple-600" />}
                        <div className="flex items-start justify-between gap-3 ml-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="shippingMethod"
                              checked={isSelected}
                              onChange={() => setShippingMethod(methodId)}
                              className="mt-0.5"
                            />
                            <div>
                              <p className={`text-sm font-bold flex items-center gap-1.5 ${isSelected && isExpress ? 'text-purple-900' : 'text-slate-800'}`}>
                                <Icon className={`h-4 w-4 ${isSelected && isExpress ? 'text-purple-700' : isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                                {opt.label}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{opt.description}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-extrabold text-slate-900">
                              {opt.price === 0 ? <span className="text-emerald-600">FREE</span> : formatINR(opt.price)}
                            </p>
                            <p className="text-[10px] font-medium text-slate-500 mt-1 whitespace-nowrap">{opt.estimatedDays}</p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>
            )
          )}

          {/* payment */}
          <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="mb-4 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-slate-700">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-xs text-white">3</span>
              <CreditCard className="h-4 w-4" /> Payment Method
            </p>
            <div className="space-y-2">
              {PAYMENTS.map((p) => {
                const isCod = p.id === 'cod';
                const isPickupDisabled = fulfillmentMode === 'PICKUP' && isCod;
                return (
                  <label
                    key={p.id}
                    className={`flex items-center gap-3 rounded-lg border p-3.5 transition-all ${
                      isPickupDisabled
                        ? 'cursor-not-allowed opacity-50 bg-slate-50 border-slate-200'
                        : payment === p.id
                        ? 'cursor-pointer border-emerald-500 bg-emerald-50'
                        : 'cursor-pointer border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      disabled={isPickupDisabled}
                      checked={payment === p.id && !isPickupDisabled}
                      onChange={() => !isPickupDisabled && setPayment(p.id)}
                    />
                    <p.icon className="h-5 w-5 text-emerald-700" />
                    <span className="text-sm">
                      <b className="text-slate-800">{p.name}</b>
                      {isPickupDisabled ? (
                        <span className="block text-xs text-rose-600 font-medium">Prepaid only for Store Pickup (COD is not available)</span>
                      ) : (
                        <span className="block text-xs text-slate-500">{p.desc}</span>
                      )}
                    </span>
                    {p.id === 'upi' && <span className="ml-auto rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">FASTEST</span>}
                  </label>
                );
              })}
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
            {payment === 'cod' && fulfillmentMode !== 'PICKUP' && (
              <p className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900 font-medium">
                💵 ₹20 Cash on Delivery handling fee added to your order total. Please keep exact change ready upon delivery.
              </p>
            )}
          </section>
        </div>

        {/* summary */}
        <aside className="h-fit rounded-xl border border-slate-100 bg-white p-5 shadow-sm lg:sticky lg:top-36">
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">Order Summary</p>

          {/* Same-Batch Free Add-on Shipping Notification */}
          {isAddonBundle && (
            <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900 shadow-sm flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-emerald-950">
                  🎉 Free Add-on Delivery Activated (₹0 Shipping)!
                </p>
                <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                  You already placed order <span className="font-bold font-mono">#{bundledWithOrderNumber}</span> in today&apos;s 2:00 PM dispatch batch for this same delivery address. This book will be bundled into your <b>same parcel</b> at <b>no extra delivery charge</b>!
                </p>
              </div>
            </div>
          )}

          <div className="max-h-48 space-y-2 overflow-auto border-b border-dashed border-slate-200 pb-3">
            {items.map((i: any) => (
              <div key={i.bookId} className="flex justify-between gap-2 text-sm">
                <span className="line-clamp-1 text-slate-600">{i.title} × {i.quantity}</span>
                <span className="shrink-0 font-semibold">{formatINR(i.totalPrice)}</span>
              </div>
            ))}
          </div>

          {/* Coupon Code Section in Checkout */}
          <div className="my-3 border-b border-dashed border-slate-200 pb-3">
            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <Tag className="h-3.5 w-3.5" /> &ldquo;{appliedCoupon}&rdquo; applied ({formatINR(discount)} OFF)
                </span>
                <button onClick={clearCoupon} className="font-bold text-rose-600 hover:text-rose-700 underline">Remove</button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Promo code (e.g. TEST20)"
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-emerald-500 font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!couponInput.trim()) return toast.error('Enter a promo code');
                      applyCoupon(couponInput.trim());
                    }}
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1">
                    ✕ {couponError}
                  </p>
                )}
              </div>
            )}
          </div>

          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd>{formatINR(subtotal)}</dd></div>
            {discount > 0 && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Coupon discount</dt>
                <dd className="font-bold text-emerald-700">− {formatINR(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between items-center">
              <dt className="text-slate-500">Delivery</dt>
              <dd>
                {fulfillmentMode === 'PICKUP' ? (
                  <span className="font-bold text-emerald-700">FREE</span>
                ) : isShippingCalculated ? (
                  shipping === 0 ? (
                    <span className="font-bold text-emerald-700">FREE</span>
                  ) : (
                    <span className="font-semibold text-slate-900">{formatINR(shipping)}</span>
                  )
                ) : (
                  <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                    Calculated at address step
                  </span>
                )}
              </dd>
            </div>

            {fulfillmentMode === 'PICKUP' ? (
              <div className="rounded-lg bg-emerald-50/80 border border-emerald-200 p-2 text-[11px] text-emerald-900 flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                <span>Store Takeaway · College Street Desk · <b>Appointed Slot</b></span>
              </div>
            ) : isShippingCalculated && (
              <div className="rounded-lg bg-emerald-50/80 border border-emerald-200 p-2 text-[11px] text-emerald-900 flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                <span>{deliveryOptions?.find((o: any) => (o.method || o.id) === (selectedShippingMethod || shippingMethod))?.label || shippingZone} · Est. <b>{estimatedTransitDays}</b></span>
              </div>
            )}

            {payment === 'cod' && (
              <div className="flex justify-between items-center">
                <dt className="text-slate-500">COD Handling Fee</dt>
                <dd className="font-semibold text-slate-900">+ {formatINR(codFee || 20)}</dd>
              </div>
            )}

            <div className="flex justify-between border-t pt-2 text-base font-extrabold">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
            {!isShippingCalculated && (
              <p className="text-[10px] text-slate-400 text-right">Delivery fee added once address + pincode is confirmed</p>
            )}
          </dl>
          {errors && errors?.length > 0 && (
            <div className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              <ul className="list-inside list-disc">
                {errors.map((e: string, i: number) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
          {/* Techno Points Reward Preview */}
          <div className="mt-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/60 p-3 flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-xs font-black text-slate-900 shadow-sm shrink-0">
              🪙
            </span>
            <div className="text-left">
              <p className="text-xs font-extrabold text-amber-950">Earn {Math.floor(total / 100)} Techno Points</p>
              <p className="text-[10px] text-amber-800 font-medium">1 Coin per ₹100 spent · Valid for 1 year upon delivery</p>
            </div>
          </div>

          <button disabled={isSubmitting || !isValid} onClick={handlePlaceOrder} className="mt-4 w-full rounded-xl bg-amber-400 py-3.5 text-sm font-extrabold text-slate-900 shadow hover:bg-amber-500 disabled:opacity-50">
            {isSubmitting ? 'Processing...' : payment === 'cod' ? `Place Order · ${formatINR(total)}` : `Pay ${formatINR(total)} Securely`}
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-400">🔒 256-bit SSL encrypted · PCI-DSS compliant · Demo checkout, no real charge</p>
        </aside>
      </div>
    </div>
  );
}
