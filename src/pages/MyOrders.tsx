import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Package, Truck, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { orderService } from '@/services/api';
import { formatINR } from '@/utils/helpers';
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

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await orderService.getUserOrders();
        // The backend returns { success: true, data: [...] } for this route
        setOrders(res.data || []);
      } catch (err) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

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
                  <p className="text-xs text-slate-500 font-medium mb-1">ORDER ID</p>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
