import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  User as UserIcon,
  MapPin,
  CreditCard,
  Gift,
  Coins,
  Edit3,
  Trash2,
  Plus,
  CheckCircle2,
  LogOut,
  HelpCircle,
  X,
  Loader2,
  Phone,
  Mail,
  ShoppingCart,
  Bell,
  Truck,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  Package,
  Store,
  CalendarCheck,
  Download,
} from 'lucide-react';
import { useAuthStore } from '@/store/AuthStore';
import { useStore } from '@/store/StoreContext';
import { profileService, authService, orderService, shippingService } from '@/services/api';
import { generateAndPrintInvoice } from '@/utils/generateInvoice';
import { toast } from 'sonner';

export default function Profile() {
  const { logout: authLogout, login: authLogin } = useAuthStore();
  const { logout: storeLogout } = useStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'notifications' | 'payments' | 'points'>('orders');
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [userNotifs, setUserNotifs] = useState<any[]>([]);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);
  const [selectedSlotsByOrder, setSelectedSlotsByOrder] = useState<{ [orderId: string]: string }>({});
  const [isConfirmingSlot, setIsConfirmingSlot] = useState<string | null>(null);

  // Edit Profile State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Address Modals & State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    postOffice: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    type: 'HOME',
    isDefault: false,
  });
  const [addressSaving, setAddressSaving] = useState(false);

  // Real-time India Post Pincode Lookup for Address Modal
  useEffect(() => {
    const cleanPin = (addressForm.pincode || '').replace(/\D/g, '').slice(0, 6);
    if (cleanPin.length === 6) {
      shippingService.verifyPincode(cleanPin)
        .then((res) => {
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            const office = res.data[0];
            setAddressForm((prev) => ({
              ...prev,
              city: prev.city || office.city_name || '',
              postOffice: prev.postOffice || office.office_name || '',
              state: prev.state || office.state_name || '',
            }));
          }
        })
        .catch(() => {});
    }
  }, [addressForm.pincode]);

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    type: 'UPI',
    provider: 'Google Pay',
    maskedData: '',
    holderName: '',
    isDefault: false,
  });
  const [paymentSaving, setPaymentSaving] = useState(false);

  // Techno Points State
  const [pointsData, setPointsData] = useState<any>(null);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const fetchFullProfile = async () => {
    try {
      setLoading(true);
      const res = await profileService.getProfile();
      if (res.success && res.data) {
        setProfileData(res.data);
        setName(res.data.name || '');
        setPhone(res.data.phone || '');
        setAddresses(res.data.addresses || []);
        setPaymentMethods(res.data.savedPaymentMethods || []);
      }
      
      const ptsRes = await profileService.getPoints().catch(() => null);
      if (ptsRes && ptsRes.data) {
        setPointsData(ptsRes.data);
      }

      // Fetch user orders
      profileService.getOrders().then((ordRes: any) => {
        if (ordRes.success && Array.isArray(ordRes.data)) {
          setUserOrders(ordRes.data);
        }
      }).catch(() => {});

      // Fetch user notifications
      profileService.getNotifications().then((notifRes: any) => {
        if (notifRes.success && Array.isArray(notifRes.data)) {
          setUserNotifs(notifRes.data);
        }
      }).catch(() => {});

    } catch (err: any) {
      // If unauthorized, user may not have logged in
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await profileService.getOrders();
      if (res.success && Array.isArray(res.data)) {
        setUserOrders(res.data);
      }
    } catch {}
    finally {
      setIsLoadingOrders(false);
    }
  };

  const handleConfirmSlot = async (orderId: string) => {
    const order = userOrders.find(o => o.id === orderId);
    let slots: string[] = [];
    try {
      slots = typeof order?.pickupSlots === 'string' ? JSON.parse(order.pickupSlots) : (order?.pickupSlots || []);
    } catch (_e) {}

    const chosen = selectedSlotsByOrder[orderId] || slots[0];
    if (!chosen) {
      return toast.error('Please select one of the proposed pickup time slots.');
    }

    setIsConfirmingSlot(orderId);
    try {
      const res = await orderService.confirmPickupSlot(orderId, chosen);
      if (res.success) {
        toast.success('Pickup appointment slot confirmed!');
        fetchUserOrders();
      } else {
        toast.error(res.message || 'Failed to confirm pickup slot');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to confirm pickup slot');
    } finally {
      setIsConfirmingSlot(null);
    }
  };

  const fetchUserNotifs = async () => {
    setIsLoadingNotifs(true);
    try {
      const res = await profileService.getNotifications();
      if (res.success && Array.isArray(res.data)) {
        setUserNotifs(res.data);
      }
    } catch {}
    finally {
      setIsLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchFullProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name cannot be empty');
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      return toast.error('Enter a valid 10-digit mobile number');
    }

    setIsUpdatingProfile(true);
    try {
      const res = await profileService.updateProfile({ name, phone: phone || null });
      if (res.success) {
        toast.success('Profile updated successfully!');
        setProfileData((prev: any) => ({ ...prev, ...res.data }));
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.fullName || !addressForm.phone || !addressForm.addressLine1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      return toast.error('Please fill in all required address fields');
    }
    if (!/^[1-8]\d{5}$/.test(addressForm.pincode)) {
      return toast.error('Enter a valid 6-digit Indian PIN code');
    }

    setAddressSaving(true);
    try {
      if (editingAddress) {
        const res = await profileService.updateAddress(editingAddress.id, addressForm);
        if (res.success) {
          toast.success('Address modified successfully!');
          setEditingAddress(null);
        }
      } else {
        const res = await profileService.createAddress(addressForm as any);
        if (res.success) {
          toast.success(res.message || 'Address saved successfully!');
          setIsAddAddressOpen(false);
        }
      }
      // Refresh addresses list
      const updatedList = await profileService.getAddresses();
      if (updatedList.data) setAddresses(updatedList.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save address');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to remove this saved address?')) return;
    try {
      await profileService.deleteAddress(id);
      toast.success('Address removed');
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete address');
    }
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.maskedData) return toast.error('Please enter payment details (e.g. UPI ID or last 4 digits)');

    setPaymentSaving(true);
    try {
      const res = await profileService.savePaymentMethod(paymentForm as any);
      if (res.success) {
        toast.success('Payment method preference saved! (External processing dormant)');
        setIsAddPaymentOpen(false);
        setPaymentMethods(prev => [...prev, res.data]);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save payment preference');
    } finally {
      setPaymentSaving(false);
    }
  };

  const handleDeletePayment = async (id: string) => {
    try {
      await profileService.deletePaymentMethod(id);
      toast.success('Payment preference removed');
      setPaymentMethods(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete payment preference');
    }
  };

  const handleLogout = () => {
    authLogout();
    storeLogout();
    authService.logout().catch(() => {});
    toast.success('Signed out successfully');
    navigate('/');
  };

  // If not logged in, prompt user to log in via Developer Google OAuth Bypass
  if (!loading && !profileData) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 shadow">
          <UserIcon className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Account Access Required</h1>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to view your profile, manage delivery addresses, and track your Techno Points loyalty coins.
        </p>

        <div className="mt-8 space-y-3">
          {/* TODO: [OAUTH_REAL_KEYS_INJECTED] Remove developer bypass button once Google Client ID is configured */}
          <button
            onClick={async () => {
              try {
                const res = await authService.devGoogleBypass();
                if (res.success && res.data) {
                  authLogin(res.data.accessToken, res.data.user);
                  toast.success('Signed in via Developer Google OAuth Bypass');
                  fetchFullProfile();
                }
              } catch (e: any) {
                toast.error(e.message || 'Bypass failed');
              }
            }}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-slate-800 transition-all"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google (Dev Bypass)
          </button>
          
          <Link to="/" className="block text-xs font-semibold text-slate-500 hover:text-slate-800">
            Back to Bookstore
          </Link>
        </div>
      </div>
    );
  }

  const technoPoints = profileData?.technoPoints || 0;
  // pending points ready for return period tracking
  // const pendingPoints = profileData?.pendingPoints || 0;

  return (
    <div className="min-h-screen bg-slate-50 py-10 font-sans">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Top Profile Banner with Loyalty Badge */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 p-8 text-white shadow-xl">
          {/* Subtle Background Art */}
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute top-0 right-1/4 h-32 w-32 rounded-full bg-amber-400/10 blur-2xl" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-2 border-emerald-400/40 bg-emerald-800 shadow-md flex items-center justify-center text-2xl font-black text-amber-300">
                {profileData?.avatarUrl ? (
                  <img src={profileData.avatarUrl} alt={profileData.name} className="h-full w-full object-cover" />
                ) : (
                  profileData?.name?.[0]?.toUpperCase() || 'U'
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-white">{profileData?.name || 'Reader'}</h1>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                    Verified Customer
                  </span>
                </div>
                <p className="text-xs font-medium text-emerald-200 mt-1 flex items-center gap-3">
                  <span><Mail className="inline h-3.5 w-3.5 mr-1" />{profileData?.email}</span>
                  {profileData?.phone && <span><Phone className="inline h-3.5 w-3.5 mr-1" />+91 {profileData.phone}</span>}
                </p>
              </div>
            </div>

            {/* Loyalty Techno Points Card */}
            <div className="flex items-center gap-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-slate-900 shadow">
                <Coins className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black text-amber-300">{technoPoints}</span>
                  <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Techno Coins</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Worth <b>₹{technoPoints}.00</b> on future purchases
                </p>
              </div>
              <button
                onClick={() => setIsTermsModalOpen(true)}
                className="ml-2 rounded-lg bg-white/15 p-1.5 text-slate-300 hover:text-white hover:bg-white/25"
                title="View Techno Points Terms & Expiry"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-4">
            {[
              { id: 'orders', label: `My Orders (${userOrders.length})`, icon: ShoppingCart },
              { id: 'notifications', label: `Alerts & Notices (${userNotifs.filter(n => !n.isRead).length > 0 ? `${userNotifs.filter(n => !n.isRead).length} New` : userNotifs.length})`, icon: Bell, badge: userNotifs.filter(n => !n.isRead).length },
              { id: 'profile', label: 'Personal Info', icon: UserIcon },
              { id: 'addresses', label: `Addresses (${addresses.length})`, icon: MapPin },
              { id: 'points', label: `Techno Coins (${technoPoints})`, icon: Gift },
              { id: 'payments', label: 'Saved Payments', icon: CreditCard },
            ].map((tab: any) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}

            <button
              onClick={handleLogout}
              className="ml-auto flex items-center gap-1.5 rounded-xl bg-rose-500/20 border border-rose-400/30 px-3.5 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/30 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="mt-8">
          {/* 0. My Orders & History Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-emerald-700" /> My Orders & Purchase History
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Track your orders, view delivery progress, and check admin status updates.</p>
                </div>
                <button
                  onClick={fetchUserOrders}
                  disabled={isLoadingOrders}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                >
                  {isLoadingOrders ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5" />}
                  Refresh Orders
                </button>
              </div>

              {userOrders.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
                  <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <h3 className="text-base font-bold text-slate-800">No orders placed yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                    Explore our vast collection of academic, competitive examination, and general books!
                  </p>
                  <Link
                    to="/catalog"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 shadow transition-all"
                  >
                    Browse Book Catalog <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((ord: any) => {
                    const statusColor =
                      ord.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : ord.status === 'PROCESSING'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : ord.status === 'SHIPPED'
                        ? 'bg-purple-100 text-purple-800 border-purple-300'
                        : ord.status === 'DELIVERED'
                        ? 'bg-green-100 text-green-900 border-green-300'
                        : ord.status === 'CANCELLED'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300';

                    const statusLabel =
                      ord.status === 'CONFIRMED'
                        ? 'Order Confirmed'
                        : ord.status === 'PROCESSING'
                        ? 'Packing & Procurement'
                        : ord.status === 'SHIPPED'
                        ? 'Dispatched (India Post)'
                        : ord.status === 'DELIVERED'
                        ? 'Delivered'
                        : ord.status === 'CANCELLED'
                        ? 'Cancelled / Rejected'
                        : 'Awaiting Admin Review';

                    return (
                      <div key={ord.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden space-y-4">
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="text-base font-black text-slate-900">#{ord.orderNumber}</span>
                              <span className={`rounded-full px-3 py-0.5 text-xs font-black border ${statusColor}`}>
                                {statusLabel}
                              </span>
                              {(ord.shippingMethod === 'SELF_PICKUP' || ord.shippingCarrier === 'STORE_TAKEAWAY') && (
                                <span className="rounded-full px-2.5 py-0.5 text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                  <Store className="h-3 w-3 text-emerald-600" /> Store Takeaway
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                              <span>Placed on: <b>{new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</b></span>
                              <span>&bull;</span>
                              <span>Payment: <b>{ord.paymentMethod?.toUpperCase() || 'PREPAID'}</b> ({ord.paymentStatus})</span>
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-xs text-slate-400 block font-medium">Total Amount</span>
                            <span className="text-lg font-black text-slate-900">₹{ord.totalAmount}</span>
                          </div>
                        </div>

                        {/* Items List */}
                        <div className="divide-y divide-slate-100">
                          {ord.items?.map((item: any) => (
                            <div key={item.id} className="py-3 flex items-center gap-4">
                              <div className="h-16 w-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                {item.book?.coverUrl ? (
                                  <img src={item.book.coverUrl} alt={item.book.title} className="h-full w-full object-cover" />
                                ) : (
                                  <span className="text-xs font-bold text-slate-400">📖</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-slate-900 truncate">{item.book?.title || 'Book'}</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  Qty: <b>{item.quantity}</b> &times; ₹{item.priceAtPurchase}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs font-bold text-slate-900">₹{item.priceAtPurchase * item.quantity}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Store Self-Pickup Appointment & Official Invoice Card */}
                        {(ord.shippingMethod === 'SELF_PICKUP' || ord.shippingCarrier === 'STORE_TAKEAWAY') && (
                          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                                <Store className="h-4 w-4 text-emerald-700" />
                                Store Takeaway Desk (College Street Office)
                              </p>
                              <button
                                type="button"
                                onClick={() => generateAndPrintInvoice(ord)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-sm transition-colors"
                              >
                                <Download className="h-3.5 w-3.5" /> Download Tax Invoice
                              </button>
                            </div>

                            {ord.pickupStatus === 'SLOTS_OFFERED' && (() => {
                              let slots: string[] = [];
                              try {
                                slots = typeof ord.pickupSlots === 'string' ? JSON.parse(ord.pickupSlots) : (ord.pickupSlots || []);
                              } catch (_e) {
                                slots = [];
                              }
                              const chosenSlot = selectedSlotsByOrder[ord.id] || slots[0] || '';

                              return (
                                <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3.5 space-y-2.5">
                                  <div className="flex items-center gap-2">
                                    <CalendarCheck className="h-4 w-4 text-amber-700 shrink-0" />
                                    <p className="text-xs font-bold text-amber-950">
                                      Action Required: Select Your Pickup Time Slot
                                    </p>
                                  </div>
                                  <p className="text-[11px] text-amber-900 leading-relaxed">
                                    Admin has prepared your books and proposed the following appointment slots. Choose one to schedule your pickup:
                                  </p>
                                  <div className="space-y-1.5 pt-1">
                                    {slots.map((s, idx) => (
                                      <label
                                        key={idx}
                                        className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 text-xs transition-all ${
                                          chosenSlot === s
                                            ? 'border-emerald-600 bg-white font-bold text-emerald-950 shadow-xs'
                                            : 'border-amber-200/80 bg-white/70 text-slate-700 hover:bg-white'
                                        }`}
                                      >
                                        <input
                                          type="radio"
                                          name={`slot_${ord.id}`}
                                          checked={chosenSlot === s}
                                          onChange={() => setSelectedSlotsByOrder({ ...selectedSlotsByOrder, [ord.id]: s })}
                                        />
                                        <span>{s}</span>
                                      </label>
                                    ))}
                                  </div>
                                  <div className="pt-2 flex justify-end">
                                    <button
                                      type="button"
                                      disabled={isConfirmingSlot === ord.id}
                                      onClick={() => handleConfirmSlot(ord.id)}
                                      className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 shadow transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                                    >
                                      {isConfirmingSlot === ord.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                      Confirm This Time Slot
                                    </button>
                                  </div>
                                </div>
                              );
                            })()}

                            {ord.pickupStatus === 'SLOT_CONFIRMED' && (
                              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white font-bold">✓</span>
                                  <p className="text-xs font-bold text-emerald-950">
                                    Pickup Appointment Confirmed: <span className="font-extrabold underline">{ord.selectedPickupSlot}</span>
                                  </p>
                                </div>
                                <p className="text-[11px] text-emerald-900 leading-relaxed">
                                  Please present your <b>Official Tax Invoice</b> (click Download Tax Invoice above or bring printout) at our College Street dispatch desk during this appointed slot to collect your books.
                                </p>
                                <div className="text-[10px] text-emerald-800 border-t border-emerald-200/60 pt-2 space-y-0.5">
                                  <p><b>Desk Location:</b> 90/6A, Mahatma Gandhi Rd, opp. Grace Cinema, Calcutta University, College Street, Kolkata 700007</p>
                                  <p><b>Collector Name:</b> {ord.pickupName || ord.user?.name} (Mobile: +91 {ord.pickupPhone || ord.user?.phone})</p>
                                </div>
                              </div>
                            )}

                            {ord.pickupStatus === 'PENDING_SLOTS' && (
                              <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 space-y-1">
                                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5 text-slate-400" /> Preparing Takeaway & Proposing Time Slots
                                </p>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                  Our team is packaging your books at our College Street facility. 3–4 pickup slots will be proposed here and in your Notification Center shortly.
                                </p>
                              </div>
                            )}

                            {ord.pickupStatus === 'COLLECTED' && (
                              <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 flex items-center justify-between">
                                <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Books Collected from College Street Desk
                                </span>
                                <span className="text-[11px] text-slate-400">Order Completed</span>
                              </div>
                            )}

                            {/* Enterprise Division Notice */}
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                              * <b>Notice:</b> Techno World Books Online and the College Street offline retail store operate independently under the same trademark. Offline retail counter exchanges are strictly prohibited. Takeaway collection is via official invoice verification only.
                            </p>
                          </div>
                        )}

                        {/* 7-Day Replacement & Return Policy Window */}
                        {ord.status === 'DELIVERED' && (() => {
                          const deliveryTimestamp = ord.deliveredAt || ord.updatedAt || ord.createdAt;
                          const deliveryDate = new Date(deliveryTimestamp);
                          const daysSinceDelivery = Math.floor((Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
                          const isReplacementEligible = daysSinceDelivery <= 7;
                          const replacementDaysRemaining = Math.max(0, 7 - daysSinceDelivery);

                          return isReplacementEligible ? (
                            <div className="rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white p-4 space-y-2.5 shadow-sm">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-start gap-2.5">
                                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm shrink-0 mt-0.5">
                                    🔄
                                  </span>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-black text-emerald-950">
                                        7-Day Replacement Window Active
                                      </p>
                                      <span className="rounded-full bg-emerald-200/80 px-2 py-0.5 text-[10px] font-black text-emerald-900 uppercase tracking-wide">
                                        {replacementDaysRemaining === 0 ? 'Expires today' : `${replacementDaysRemaining} day${replacementDaysRemaining > 1 ? 's' : ''} left`}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                                      Delivered on <b>{deliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</b>. Eligible for free replacement in case of transit damage, manufacturing defect, or wrong book.
                                    </p>
                                  </div>
                                </div>
                                <a
                                  href="https://docs.google.com/forms/d/e/1FAIpQLSdP7BBi2SNX67XU0xoBDzqiXSaL4nyBBIwDfVacG8M9kVR1RQ/viewform?usp=publish-editor"
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-extrabold text-white shadow hover:bg-emerald-800 transition-colors shrink-0"
                                >
                                  Request Replacement <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </div>
                              <div className="border-t border-emerald-200/60 pt-2 text-[10px] text-slate-500 leading-relaxed flex flex-wrap items-center justify-between gap-2">
                                <span>⚠️ <b>Store Policy:</b> Replacements only — no monetary return refunds. Use Order <span className="font-mono font-bold text-slate-700">#{ord.orderNumber}</span> in the Google form.</span>
                                <Link to="/refund-policy" className="font-bold text-emerald-700 hover:underline">Read Policy →</Link>
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 flex items-center justify-between text-xs text-slate-500">
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                <span>7-Day Replacement Window has ended for this order</span>
                              </span>
                              <Link to="/help" className="text-[11px] text-emerald-700 font-semibold hover:underline">
                                Need Help?
                              </Link>
                            </div>
                          );
                        })()}

                        {/* In-Transit Non-Cancellation Notice */}
                        {ord.status === 'SHIPPED' && (
                          <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3.5 text-xs text-purple-950 space-y-1">
                            <p className="font-bold flex items-center gap-1.5 text-purple-900">
                              <Truck className="h-4 w-4 text-purple-700" /> Dispatched & In-Transit (Non-Cancellable):
                            </p>
                            <p className="text-[11px] text-purple-800 leading-relaxed">
                              This parcel is with India Post / courier. As per terms, dispatched orders cannot be cancelled or refunded. Refusal of delivery at doorstep (RTO) is strictly non-refundable.
                            </p>
                          </div>
                        )}

                        {/* Pre-Dispatch Cancellation Notice */}
                        {(ord.status === 'PENDING' || ord.status === 'CONFIRMED' || ord.status === 'PROCESSING') && (
                          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 text-xs text-blue-950 flex flex-wrap items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <p className="font-bold text-blue-900 flex items-center gap-1.5">
                                <Package className="h-4 w-4 text-blue-700" /> Preparing for Dispatch:
                              </p>
                              <p className="text-[11px] text-blue-800">
                                Eligible for 100% refund cancellation strictly before courier handover.
                              </p>
                            </div>
                            <a
                              href={`https://wa.me/919876543210?text=Hi%20Techno%20World%20Books%2C%20I%20want%20to%20cancel%20my%20pre-dispatch%20order%20%23${ord.orderNumber}`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-bold text-blue-800 hover:bg-blue-100 transition shrink-0"
                            >
                              Request Cancellation
                            </a>
                          </div>
                        )}

                        {/* Tracking / Admin Notice Banner */}
                        {ord.notes && (
                          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-700 space-y-1">
                            <p className="font-bold text-slate-900 flex items-center gap-1.5">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Admin & Dispatch Updates:
                            </p>
                            <p className="text-[11px] text-slate-600 whitespace-pre-line font-mono bg-white p-2 rounded border border-slate-100">
                              {ord.notes}
                            </p>
                          </div>
                        )}

                        {/* Delivery Address & Tracking ID Footer */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                          <div className="text-slate-600">
                            <span className="font-bold text-slate-800">Delivery Address: </span>
                            {ord.address ? (
                              <span>{ord.address.fullName}, {ord.address.addressLine1}, {ord.address.city}, {ord.address.state} - {ord.address.pincode}</span>
                            ) : (
                              <span>Standard Delivery Address</span>
                            )}
                          </div>

                          {ord.trackingNumber && (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                <Truck className="h-3.5 w-3.5 text-emerald-700" /> India Post: {ord.trackingNumber}
                              </span>
                              <Link
                                to={`/track?trackingId=${ord.trackingNumber}`}
                                className="rounded-lg bg-slate-900 text-white font-bold px-3 py-1 text-xs hover:bg-slate-800 flex items-center gap-1"
                              >
                                Track <ExternalLink className="h-3 w-3" />
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 0.5 In-App Notifications & Admin Alerts Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-emerald-700" /> In-App Notifications & Admin Alerts
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Live notices from the bookstore regarding order confirmations, stock delays, and delivery updates.</p>
                </div>
                <button
                  onClick={fetchUserNotifs}
                  disabled={isLoadingNotifs}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                >
                  {isLoadingNotifs ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5" />}
                  Refresh Alerts
                </button>
              </div>

              {userNotifs.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
                  <Bell className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <h3 className="text-base font-bold text-slate-800">No new notifications</h3>
                  <p className="text-xs text-slate-500 mt-1">You will receive updates here whenever an admin reviews your orders.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userNotifs.map((notif: any) => (
                    <div
                      key={notif.id}
                      className={`rounded-2xl border p-5 shadow-sm transition-all ${
                        notif.isRead ? 'bg-white border-slate-200' : 'bg-emerald-50/50 border-emerald-200 shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                            {notif.type?.includes('cancel') ? '❌' : notif.type?.includes('delay') ? '⏳' : notif.type?.includes('ship') ? '🚚' : '✅'}
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-900">{notif.title}</h4>
                            <p className="text-xs text-slate-700 mt-1 whitespace-pre-line leading-relaxed">
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-2">
                              {new Date(notif.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>

                        {!notif.isRead && (
                          <button
                            onClick={async () => {
                              await profileService.markNotificationRead(notif.id);
                              fetchUserNotifs();
                            }}
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline shrink-0"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 1. Personal Information Tab */}
          {activeTab === 'profile' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="max-w-xl">
                <h2 className="text-lg font-extrabold text-slate-900">Personal Information</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage your display name and contact phone number.</p>

                <form onSubmit={handleUpdateProfile} className="mt-6 space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={profileData?.email || ''}
                      disabled
                      className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Email is permanently linked to your verified authentication credentials.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">10-Digit Mobile Number</label>
                    <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                      <span className="bg-slate-100 px-3.5 py-3 text-xs font-bold text-slate-600 border-r border-slate-200">+91</span>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="Enter mobile number"
                        className="w-full px-4 py-3 text-sm font-semibold text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-xs font-bold text-white hover:bg-emerald-800 shadow-md transition-all disabled:opacity-50"
                  >
                    {isUpdatingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Save Changes
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 2. Saved Addresses Tab (With In-Place Modification & Deduplication) */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Saved Delivery Addresses</h2>
                  <p className="text-xs text-slate-500">Manage, edit, or remove delivery addresses used for fast Speed Post checkout.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingAddress(null);
                    setAddressForm({
                      fullName: profileData?.name || '',
                      phone: profileData?.phone || '',
                      addressLine1: '',
                      addressLine2: '',
                      postOffice: '',
                      landmark: '',
                      city: 'Kolkata',
                      state: 'West Bengal',
                      pincode: '',
                      type: 'HOME',
                      isDefault: addresses.length === 0,
                    });
                    setIsAddAddressOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-sm transition-all"
                >
                  <Plus className="h-4 w-4" /> Add New Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
                  <MapPin className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <p className="font-bold text-slate-700">No saved addresses yet.</p>
                  <p className="text-xs text-slate-500 mt-1">Add your address to enjoy one-click Speed Post deliveries.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`relative rounded-2xl border p-5 bg-white shadow-sm transition-all ${
                        addr.isDefault ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">{addr.fullName}</span>
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                            {addr.type || 'HOME'}
                          </span>
                          {addr.isDefault && (
                            <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Default
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingAddress(addr);
                              setAddressForm({
                                fullName: addr.fullName,
                                phone: addr.phone,
                                addressLine1: addr.addressLine1,
                                addressLine2: addr.addressLine2 || '',
                                postOffice: addr.postOffice || '',
                                landmark: addr.landmark || '',
                                city: addr.city,
                                state: addr.state,
                                pincode: addr.pincode,
                                type: addr.type || 'HOME',
                                isDefault: addr.isDefault,
                              });
                              setIsAddAddressOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-100"
                            title="Edit Address"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Delete Address"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                        {addr.postOffice ? <span>PO: <b className="text-slate-800">{addr.postOffice}</b> · </span> : null}
                        {addr.city}, {addr.state} — <b>{addr.pincode}</b>
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        📞 Mobile: <span className="font-semibold text-slate-700">+91 {addr.phone}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Payment Preferences (Dormant External Processing) */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Saved Payment Preferences</h2>
                  <p className="text-xs text-slate-500">
                    Saved UPI handles and card preferences. <span className="text-amber-700 font-semibold">(External payment processing currently dormant until Razorpay live keys are configured).</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPaymentForm({
                      type: 'UPI',
                      provider: 'Google Pay',
                      maskedData: '',
                      holderName: profileData?.name || '',
                      isDefault: paymentMethods.length === 0,
                    });
                    setIsAddPaymentOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-all"
                >
                  <Plus className="h-4 w-4" /> Save Payment Preference
                </button>
              </div>

              {paymentMethods.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
                  <CreditCard className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <p className="font-bold text-slate-700">No payment methods saved.</p>
                  <p className="text-xs text-slate-500 mt-1">You can save your preferred UPI VPA for faster reference during checkout.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map((pm) => (
                    <div key={pm.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                          {pm.type === 'UPI' ? 'UPI' : 'CARD'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{pm.maskedData}</p>
                          <p className="text-xs text-slate-500">{pm.provider || 'UPI VPA'} · Dormant Mode</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePayment(pm.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. Techno Points Loyalty History & Terms */}
          {activeTab === 'points' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Coins className="h-6 w-6 text-amber-700" />
                    <h2 className="text-lg font-black text-amber-950">Techno Points Reward Program</h2>
                  </div>
                  <p className="text-xs text-amber-900/80 mt-1">
                    Every ₹100 spent earns you 1 Techno Point (worth ₹1.00). Coins are valid for 1 full year from issuance!
                  </p>
                </div>
                <button
                  onClick={() => setIsTermsModalOpen(true)}
                  className="rounded-xl border border-amber-400 bg-white px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-50 shadow-sm"
                >
                  View Terms & 1-Year Expiry Rules
                </button>
              </div>

              {/* Transactions Ledger */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-extrabold text-slate-900 mb-4">Points Activity Ledger</h3>
                {(!pointsData?.transactions || pointsData.transactions.length === 0) ? (
                  <p className="text-xs text-slate-500">No point transactions recorded yet. Place an order to earn coins!</p>
                ) : (
                  <div className="space-y-3">
                    {pointsData.transactions.map((tx: any) => (
                      <div key={tx.id} className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{tx.description}</p>
                          <p className="text-slate-400 text-[11px] mt-0.5">
                            Issued on {new Date(tx.createdAt).toLocaleDateString('en-IN')} · Valid until {new Date(tx.expiresAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`font-black text-sm ${tx.type === 'EARNED' ? 'text-emerald-700' : 'text-slate-800'}`}>
                            {tx.type === 'EARNED' ? `+${tx.points}` : `-${tx.points}`} Coins
                          </span>
                          <span className="block text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Address Edit / Add Modal */}
      {isAddAddressOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {editingAddress ? 'Edit Saved Address' : 'Add New Delivery Address'}
              </h3>
              <button onClick={() => setIsAddAddressOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Street Address / House No</label>
                <input
                  type="text"
                  value={addressForm.addressLine1}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                  placeholder="e.g. 32/8 Beadon Street, College Para"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Local Post Office Name <span className="text-rose-600">* (Required for postal delivery)</span>
                </label>
                <input
                  type="text"
                  value={addressForm.postOffice}
                  onChange={(e) => setAddressForm({ ...addressForm, postOffice: e.target.value })}
                  placeholder="e.g. Beadon Street Sub Post Office (S.O), Bowbazar SO"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    placeholder="733202"
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City / District</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                {['HOME', 'WORK', 'OTHER'].map(t => (
                  <label key={t} className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="addrType"
                      checked={addressForm.type === t}
                      onChange={() => setAddressForm({ ...addressForm, type: t })}
                    />
                    {t}
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddAddressOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressSaving}
                  className="rounded-lg bg-emerald-700 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-800 shadow"
                >
                  {addressSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Preference Modal (Dormant) */}
      {isAddPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">Save Payment Preference</h3>
              <button onClick={() => setIsAddPaymentOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Type</label>
                <select
                  value={paymentForm.type}
                  onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-emerald-500"
                >
                  <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                  <option value="CARD">Card Reference</option>
                  <option value="NETBANKING">Net Banking</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {paymentForm.type === 'UPI' ? 'UPI ID / VPA' : 'Card Masked Number'}
                </label>
                <input
                  type="text"
                  value={paymentForm.maskedData}
                  onChange={(e) => setPaymentForm({ ...paymentForm, maskedData: e.target.value })}
                  placeholder={paymentForm.type === 'UPI' ? 'yourname@okhdfcbank' : '•••• •••• •••• 4242'}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-900">
                🔒 Stored as a reference preference only. External card/UPI debit processing remains dormant until live payment gateway credentials are deployed.
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddPaymentOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentSaving}
                  className="rounded-lg bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow"
                >
                  {paymentSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save Preference'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Techno Points Terms & 1-Year Expiry Modal */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-6 py-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-slate-900 shadow">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-amber-950 text-base">Techno Points Terms & Expiry</h3>
                  <p className="text-xs text-amber-800">Official Customer Rewards Policy</p>
                </div>
              </div>
              <button onClick={() => setIsTermsModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-amber-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700 leading-relaxed max-h-[75vh] overflow-y-auto">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900 text-sm">🪙 Reward Earning Formula</p>
                <p>You earn <b>1 Techno Point</b> for every <b>₹100</b> net purchase value on all books across our bookstore.</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900 text-sm">⏳ Return Window & Point Credit</p>
                <p>Points are credited upon order placement and remain verified after the standard <b>7-day return period</b> concludes. If an order is returned or cancelled, corresponding awarded coins will be reversed.</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900 text-sm">🗓️ 1-Year Expiry Guarantee</p>
                <p>Every earned Techno Point is valid for exactly <b>365 days (1 year)</b> from the day it is credited to your account.</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900 text-sm">🛍️ Instant Redemption</p>
                <p>Coins can be applied directly on the checkout screen to reduce your payable total amount (1 Point = ₹1.00).</p>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setIsTermsModalOpen(false)}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 shadow"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
