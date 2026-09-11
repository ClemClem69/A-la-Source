import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, TrendingUp, Euro, Plus, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Producer, Product, Order, OrderItem } from '../../lib/types';
import { formatPrice, formatOrderStatus, getOrderStatusColor, formatDate } from '../../lib/utils';

export default function ProducerDashboard() {
  const { profile } = useAuth();
  const [producer, setProducer] = useState<Producer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
        const [productsRes, ordersRes] = await Promise.all([
          supabase.from('products').select('*').eq('producer_id', producerData.id),
          supabase
            .from('orders')
            .select('*, order_items(*)')
            .order('created_at', { ascending: false }),
        ]);

        const allProducts = (productsRes.data as Product[]) || [];
        const allOrders = (ordersRes.data as Order[]) || [];

        // Filter orders to only those containing this producer's products
        const producerOrders = allOrders.filter((order) =>
          order.order_items?.some((item: OrderItem) => item.producer_id === producerData.id)
        );

        setProducts(allProducts);
        setOrders(producerOrders);
      }
      setLoading(false);
    }
    loadData();
  }, [profile]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (!producer) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-stone-500 mb-4">Vous n'avez pas encore de profil producteur.</p>
        <Link to="/producteur/inscription" className="btn-primary">Créer ma fiche producteur</Link>
      </div>
    );
  }

  const totalRevenue = orders
    .filter((o) => o.status === 'paid' || o.status === 'delivered')
    .reduce((sum, o) => {
      const producerItems = o.order_items?.filter((item: OrderItem) => item.producer_id === producer.id) || [];
      return sum + producerItems.reduce((s, item: OrderItem) => s + item.price_at_order * item.quantity, 0);
    }, 0);

  const lowStockProducts = products.filter((p) => p.stock <= 10);
  const activeProducts = products.filter((p) => p.is_active);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {producer.logo_url ? (
            <div className="h-16 w-16 rounded-full overflow-hidden bg-stone-100">
              <img src={producer.logo_url} alt={producer.company_name} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-500">
              <span className="text-xl">🥕</span>
            </div>
          )}
          <div>
            <h1 className="font-serif text-3xl font-bold text-stone-800">{producer.company_name}</h1>
            <span className={`badge mt-1 ${producer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
              {producer.status === 'active' ? 'Actif' : producer.status === 'pending' ? 'En attente' : 'Refusé'}
            </span>
          </div>
        </div>
        <Link to="/producteur/produits" className="btn-primary">
          <Plus className="h-4 w-4" /> Gérer mes produits
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700">
              <Euro className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Chiffre d'affaires</p>
              <p className="text-xl font-bold text-stone-800">{formatPrice(totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Commandes</p>
              <p className="text-xl font-bold text-stone-800">{orders.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Produits actifs</p>
              <p className="text-xl font-bold text-stone-800">{activeProducts.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Stock bas</p>
              <p className="text-xl font-bold text-stone-800">{lowStockProducts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Info */}
      <div className="card p-6 mb-8 bg-blue-50 border border-blue-200">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-200 text-blue-800 shrink-0">
            <Euro className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Comment fonctionne la tarification ?</h3>
            <p className="text-sm text-blue-800 mb-2">
              Vous proposez un prix producteur pour chaque produit. Ce prix est le montant que vous recevrez directement pour chaque unité vendue.
            </p>
            <p className="text-sm text-blue-800">
              L'équipe de la plateforme validera et ajustera le prix consommateur en fonction du marché et de votre proposition.
            </p>
          </div>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStockProducts.length > 0 && (
        <div className="card border-amber-200 bg-amber-50 p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h2 className="font-semibold text-amber-800">Alertes de stock</h2>
          </div>
          <div className="space-y-1">
            {lowStockProducts.map((p) => (
              <div key={p.id} className="flex justify-between text-sm">
                <span className="text-stone-700">{p.name}</span>
                <span className={p.stock === 0 ? 'text-red-600 font-medium' : 'text-amber-700'}>
                  {p.stock === 0 ? 'Épuisé' : `${p.stock} restants`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-stone-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary-600" /> Commandes récentes
          </h2>
          <Link to="/producteur/commandes" className="text-sm text-primary-600 font-semibold hover:text-primary-700">
            Voir tout
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="text-stone-500 text-sm">Aucune commande pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => {
              const producerItems = order.order_items?.filter((item: OrderItem) => item.producer_id === producer.id) || [];
              const orderTotal = producerItems.reduce((s, item: OrderItem) => s + item.price_at_order * item.quantity, 0);
              return (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-stone-800">{formatDate(order.created_at)}</p>
                    <p className="text-xs text-stone-500">{producerItems.length} article(s) - {formatPrice(orderTotal)}</p>
                  </div>
                  <span className={`badge ${getOrderStatusColor(order.status)}`}>
                    {formatOrderStatus(order.status)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
