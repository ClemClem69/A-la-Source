import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Producer, Order, OrderItem, OrderStatus } from '../../lib/types';
import { formatPrice, formatOrderStatus, getOrderStatusColor, formatDate } from '../../lib/utils';

export default function ProducerOrders() {
  const { profile } = useAuth();
  const [producer, setProducer] = useState<Producer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    async function loadData() {
      if (!profile) return;
      const { data: producerData } = await supabase
        .from('producers')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();
      setProducer(producerData as Producer | null);

      if (producerData) {
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false });

        const allOrders = (ordersData as Order[]) || [];
        const producerOrders = allOrders.filter((order) =>
          order.order_items?.some((item: OrderItem) => item.producer_id === producerData.id)
        );
        setOrders(producerOrders);
      }
      setLoading(false);
    }
    loadData();
  }, [profile]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (!producer) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-stone-500">Profil producteur introuvable.</div>;
  }

  const filteredOrders = filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus);
  const statuses: OrderStatus[] = ['pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-serif text-3xl font-bold text-stone-800">Commandes</h1>
        <Link to="/producteur" className="btn-secondary">
          <ArrowLeft className="h-4 w-4" /> Retour à l'espace producteur
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`badge cursor-pointer whitespace-nowrap px-3 py-1.5 ${filterStatus === 'all' ? 'bg-primary-600 text-white' : 'bg-stone-100 text-stone-600'}`}
        >
          Toutes ({orders.length})
        </button>
        {statuses.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`badge cursor-pointer whitespace-nowrap px-3 py-1.5 ${filterStatus === s ? 'bg-primary-600 text-white' : 'bg-stone-100 text-stone-600'}`}
            >
              {formatOrderStatus(s)} ({count})
            </button>
          );
        })}
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-stone-500 text-center py-12">Aucune commande.</p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const producerItems = order.order_items?.filter((item: OrderItem) => item.producer_id === producer.id) || [];
            const orderTotal = producerItems.reduce((s, item: OrderItem) => s + item.price_at_order * item.quantity, 0);

            return (
              <div key={order.id} className="card p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                  <div>
                    <p className="font-semibold text-stone-800">Commande du {formatDate(order.created_at)}</p>
                    <p className="text-sm text-stone-500">
                      Point de retrait
                      {order.delivery_slot && ` - ${order.delivery_slot}`}
                    </p>
                    {order.pickup_point && (
                      <p className="text-sm text-stone-500">Retrait : {order.pickup_point}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`badge ${getOrderStatusColor(order.status)}`}>
                      {formatOrderStatus(order.status)}
                    </span>
                    <p className="font-bold text-primary-700 mt-1">{formatPrice(orderTotal)}</p>
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-3 space-y-1">
                  {producerItems.map((item: OrderItem) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-stone-600">{item.product_name} x{item.quantity}</span>
                      <span className="text-stone-800">{formatPrice(item.price_at_order * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Status actions */}
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-stone-100">
                  {order.status === 'paid' && (
                    <button onClick={() => updateStatus(order.id, 'preparing')} className="btn-primary text-xs py-1.5">
                      Marquer en préparation
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button onClick={() => updateStatus(order.id, 'shipped')} className="btn-primary text-xs py-1.5">
                      Marquer expédiée
                    </button>
                  )}
                  {order.status === 'shipped' && (
                    <button onClick={() => updateStatus(order.id, 'delivered')} className="btn-primary text-xs py-1.5">
                      Marquer livrée
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
