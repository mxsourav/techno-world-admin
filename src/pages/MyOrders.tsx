import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Package, Truck, CheckCircle2, XCircle, Clock, ExternalLink, Store, CalendarCheck, Download, Loader2 } from 'lucide-react';
import { orderService } from '@/services/api';
import { formatINR } from '@/utils/helpers';
import { generateAndPrintInvoice } from '@/utils/generateInvoice';
import { toast } from 'sonner';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1"><Clock className="w-3 h-3"/> Pending</span>;
    case 'CONFIRMED':
    case 'PROCESSING':
      return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1"><Package className="w-3 h-3"/> Processing</span>;
    case 'SHIPPED':
      return <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1"><Truck className="w-3 h-3"/> Shipped</span>;
    case 'DELIVERED':
      return <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Delivered</span>;
    case 'CANCELLED':
    case 'REFUNDED':
      return <span className="bg-rose-100 text-rose-800 px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1"><XCircle className="w-3 h-3"/> {status}</span>;
    default:
      return <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-xs font-bold uppercase">{status}</span>;
  }
};

export default function MyOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlotsByOrder, setSelectedSlotsByOrder] = useState<{ [orderId: string]: string }>({});
  const [isConfirmingSlot, setIsConfirmingSlot] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      const res = await orderService.getUserOrders();
      setOrders(res.data || []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleConfirmSlot = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
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
        loadOrders();
      } else {
        toast.error(res.message || 'Failed to confirm pickup slot');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to confirm pickup slot');
    } finally {
      setIsConfirmingSlot(null);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading your orders...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold text-slate-900 mb-6">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No orders found</h3>
          <p className="text-slate-500 mb-6">Looks like you haven't made your first purchase yet.</p>
          <Link to="/" className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex flex-wrap justify-between items-start border-b border-slate-100 pb-4 mb-4 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-500 font-medium">ORDER ID</p>
                    {(order.shippingMethod === 'SELF_PICKUP' || order.shippingCarrier === 'STORE_TAKEAWAY') && (
                      <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-[10px] font-extrabold flex items-center gap-1">
                        <Store className="h-3 w-3 text-emerald-700" /> Store Takeaway
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-slate-900">{order.orderNumber}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-medium mb-1">TOTAL AMOUNT</p>
                  <p className="font-bold text-slate-900">{formatINR(order.totalAmount)}</p>
                  <div className="mt-1">{getStatusBadge(order.status)}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-12 h-16 bg-slate-100 rounded overflow-hidden flex-shrink-0 border border-slate-200">
                      {item.book?.coverUrl && (
                        <img src={item.book.coverUrl} alt={item.book.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-800 line-clamp-1">{item.book?.title || 'Unknown Book'}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium text-slate-700">
                      {formatINR(item.unitPrice * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Store Self-Pickup Appointment & Official Invoice Card */}
              {(order.shippingMethod === 'SELF_PICKUP' || order.shippingCarrier === 'STORE_TAKEAWAY') && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Store className="h-4 w-4 text-emerald-700" />
                      Store Takeaway Desk (College Street Office)
                    </p>
                    <button
                      type="button"
                      onClick={() => generateAndPrintInvoice(order)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-sm transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" /> Download Tax Invoice
                    </button>
                  </div>

                  {order.pickupStatus === 'SLOTS_OFFERED' && (() => {
                    let slots: string[] = [];
                    try {
                      slots = typeof order.pickupSlots === 'string' ? JSON.parse(order.pickupSlots) : (order.pickupSlots || []);
                    } catch (_e) {
                      slots = [];
                    }
                    const chosenSlot = selectedSlotsByOrder[order.id] || slots[0] || '';

                    return (
                      <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3.5 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <CalendarCheck className="h-4 w-4 text-amber-700 shrink-0" />
                          <p className="text-xs font-bold text-amber-950">
                            Action Required: Select Your Pickup Time Slot
                          </p>
                        </div>
                        <p className="text-[11px] text-amber-900 leading-relaxed">
                          Admin has proposed the following appointment slots. Choose one that fits your schedule:
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
                                name={`slot_${order.id}`}
                                checked={chosenSlot === s}
                                onChange={() => setSelectedSlotsByOrder({ ...selectedSlotsByOrder, [order.id]: s })}
                              />
                              <span>{s}</span>
                            </label>
                          ))}
                        </div>
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            disabled={isConfirmingSlot === order.id}
                            onClick={() => handleConfirmSlot(order.id)}
                            className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 shadow transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                          >
                            {isConfirmingSlot === order.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                            Confirm This Time Slot
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {order.pickupStatus === 'SLOT_CONFIRMED' && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white font-bold">✓</span>
                        <p className="text-xs font-bold text-emerald-950">
                          Pickup Appointment Confirmed: <span className="font-extrabold underline">{order.selectedPickupSlot}</span>
                        </p>
                      </div>
                      <p className="text-[11px] text-emerald-900 leading-relaxed">
                        Please present your <b>Official Tax Invoice</b> (click Download Tax Invoice above) at our College Street dispatch desk during this appointed slot to collect your books.
                      </p>
                      <div className="text-[10px] text-emerald-800 border-t border-emerald-200/60 pt-2 space-y-0.5">
                        <p><b>Desk Location:</b> 90/6A, Mahatma Gandhi Rd, opp. Grace Cinema, Calcutta University, College Street, Kolkata 700007</p>
                        <p><b>Collector Name:</b> {order.pickupName || order.user?.name} (Mobile: +91 {order.pickupPhone || order.user?.phone})</p>
                      </div>
                    </div>
                  )}

                  {order.pickupStatus === 'PENDING_SLOTS' && (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 space-y-1">
                      <p className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" /> Preparing Takeaway & Proposing Time Slots
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Our team is preparing your books. 3–4 pickup slots will be proposed here shortly.
                      </p>
                    </div>
                  )}

                  {order.pickupStatus === 'COLLECTED' && (
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

              {/* 7-Day Replacement Window */}
              {order.status === 'DELIVERED' && (() => {
                const deliveryTimestamp = order.deliveredAt || order.updatedAt || order.createdAt;
                const deliveryDate = new Date(deliveryTimestamp);
                const daysSinceDelivery = Math.floor((Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
                const isReplacementEligible = daysSinceDelivery <= 7;
                const replacementDaysRemaining = Math.max(0, 7 - daysSinceDelivery);

                return isReplacementEligible ? (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">7-Day Replacement Window Active</p>
                          <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                            {replacementDaysRemaining === 0 ? 'Expires today' : `${replacementDaysRemaining} day${replacementDaysRemaining > 1 ? 's' : ''} left`}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Delivered on {deliveryDate.toLocaleDateString('en-IN')}. Eligible for complimentary replacement if defective or transit-damaged.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href="https://docs.google.com/forms/d/e/1FAIpQLSdP7BBi2SNX67XU0xoBDzqiXSaL4nyBBIwDfVacG8M9kVR1RQ/viewform?usp=publish-editor"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors"
                        >
                          Fill Replacement Form <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <a
                          href={`https://wa.me/917479135626?text=Hello%20Techno%20World%2C%20I%20am%20sharing%20an%20unpacking%20video%20for%20order%20%23${order.orderNumber}.`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          Send Video on WhatsApp
                        </a>
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-200/80 bg-white p-3 text-[11px] text-slate-600 space-y-1">
                      <p className="font-semibold text-slate-800">Replacement Guidelines:</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-500">
                        <li><b>Unboxing Video Required:</b> Please send continuous unboxing video to WhatsApp <b>+91 747 913 5626</b> with order <b>#{order.orderNumber}</b>.</li>
                        <li><b>Quality Inspection:</b> Returned books are inspected upon arrival—must be free of pen/pencil markings, highlighting, torn pages, or modifications.</li>
                        <li><b>Zero Delivery Charge:</b> Once verified by warehouse inspection, fresh replacement book is shipped with no additional courier fees.</li>
                      </ul>
                    </div>

                    <p className="text-[10px] text-slate-400">
                      Store policy: Complimentary replacements only (no monetary return refunds post-delivery). <Link to="/refund-policy" className="font-medium text-emerald-700 hover:underline">Read Policy →</Link>
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> 7-Day Replacement Window has ended</span>
                    <Link to="/help" className="text-[11px] text-emerald-700 font-semibold hover:underline">Help</Link>
                  </div>
                );
              })()}

              {/* In-Transit Non-Cancellation */}
              {order.status === 'SHIPPED' && (
                <div className="mt-4 rounded-xl border border-purple-200 bg-purple-50/50 p-3 text-xs text-purple-950">
                  <p className="font-bold flex items-center gap-1.5 text-purple-900"><Truck className="h-4 w-4 text-purple-700" /> Dispatched & In-Transit (Non-Cancellable)</p>
                  <p className="text-[11px] text-purple-800 mt-0.5">Dispatched orders cannot be cancelled or refunded. Doorstep refusal (RTO) is strictly non-refundable.</p>
                </div>
              )}

              {/* Pre-Dispatch Cancellation */}
              {(order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PROCESSING') && (
                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-xs text-blue-950 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-blue-900">Preparing for Dispatch</p>
                    <p className="text-[11px] text-blue-800">Eligible for 100% refund cancellation before courier dispatch.</p>
                  </div>
                  <a
                    href={`https://wa.me/919876543210?text=Hi%2C%20I%20want%20to%20cancel%20order%20%23${order.orderNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-bold text-blue-800 hover:bg-blue-100 transition"
                  >
                    Cancel Order
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
