import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle2, Truck, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Order } from '../lib/types';
import { formatPrice, formatOrderStatus, getOrderStatusColor, formatDateTime } from '../lib/utils';

export default function Orders() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (!profile) return;
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('consumer_id', profile.id)
        .order('created_at', { ascending: false });
      setOrders((data as Order[]) || []);
      setLoading(false);
    }
    loadOrders();
  }, [profile]);

  function getStatusIcon(status: string) {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'paid': return <CheckCircle2 className="h-5 w-5" />;
      case 'preparing': return <Package className="h-5 w-5" />;
      case 'shipped': return <Truck className="h-5 w-5" />;
      case 'delivered': return <CheckCircle2 className="h-5 w-5" />;
      case 'cancelled': return <XCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-serif text-3xl font-bold text-stone-800 mb-6">Mes commandes</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500 mb-4">Vous n'avez pas encore de commande.</p>
          <Link to="/catalogue" className="btn-primary">Découvrir le catalogue</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${getOrderStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800">Commande du {formatDateTime(order.created_at)}</p>
                    <p className="text-xs text-stone-500">
                      Point de retrait
                      {order.delivery_slot && ` - ${order.delivery_slot}`}
                    </p>
                  </div>
                </div>
                <span className={`badge ${getOrderStatusColor(order.status)}`}>
                  {formatOrderStatus(order.status)}
                </span>
              </div>

              <div className="border-t border-stone-100 pt-3 space-y-1">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-stone-600">
                      {item.product_name} x{item.quantity}
                    </span>
                    <span className="text-stone-800 font-medium">
                      {formatPrice(item.price_at_order * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold mt-3 pt-3 border-t border-stone-100">
                <span className="text-stone-700">Total</span>
                <span className="text-primary-700">{formatPrice(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
