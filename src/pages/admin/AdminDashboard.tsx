import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, ShoppingCart, Euro, TrendingUp, AlertCircle, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Producer, Order } from '../../lib/types';
import { formatPrice, formatDate } from '../../lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    consumers: 0,
    producers: 0,
    pendingProducers: 0,
    products: 0,
    orders: 0,
    totalRevenue: 0,
  });
  const [pendingProducers, setPendingProducers] = useState<Producer[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [consumersRes, producersRes, pendingRes, productsRes, ordersRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'consumer'),
        supabase.from('producers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('producers').select('*').eq('status', 'pending'),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).limit(5),
      ]);

      const orders = (ordersRes.data as Order[]) || [];
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);

      setStats({
        consumers: consumersRes.count || 0,
        producers: producersRes.count || 0,
        pendingProducers: pendingRes.data?.length || 0,
        products: productsRes.count || 0,
        orders: orders.length,
        totalRevenue,
      });
      setPendingProducers((pendingRes.data as Producer[]) || []);
      setRecentOrders(orders);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-serif text-3xl font-bold text-stone-800 mb-6">Tableau de bord</h1>

      {/* Quick nav */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <Link to="/admin/ajouter-producteur" className="btn-primary text-center py-2">
          <UserPlus className="h-4 w-4 mx-auto mb-1" />
          <span className="text-xs">Ajouter producteur</span>
        </Link>
        <Link to="/admin/produits" className="btn-secondary text-center py-2">
          <Package className="h-4 w-4 mx-auto mb-1" />
          <span className="text-xs">Produits</span>
        </Link>
        <Link to="/admin/tarifs" className="btn-secondary text-center py-2">
          <Euro className="h-4 w-4 mx-auto mb-1" />
          <span className="text-xs">Tarifs</span>
        </Link>
        <Link to="/admin/producteurs" className="btn-secondary text-center py-2">
          <Users className="h-4 w-4 mx-auto mb-1" />
          <span className="text-xs">Producteurs</span>
        </Link>
        <Link to="/admin/utilisateurs" className="btn-secondary text-center py-2">
          <ShoppingCart className="h-4 w-4 mx-auto mb-1" />
          <span className="text-xs">Utilisateurs</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Euro} label="Chiffre d'affaires" value={formatPrice(stats.totalRevenue)} color="green" />
        <StatCard icon={ShoppingCart} label="Commandes" value={stats.orders.toString()} color="blue" />
        <StatCard icon={Users} label="Consommateurs" value={stats.consumers.toString()} color="primary" />
        <StatCard icon={Package} label="Produits" value={stats.products.toString()} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending producers */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" /> Producteurs en attente
            </h2>
            <Link to="/admin/producteurs" className="text-sm text-primary-600 font-semibold">Voir tout</Link>
          </div>
          {pendingProducers.length === 0 ? (
            <p className="text-stone-500 text-sm">Aucune candidature en attente.</p>
          ) : (
            <div className="space-y-2">
              {pendingProducers.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                  <div>
                    <p className="font-medium text-stone-800">{p.company_name}</p>
                    <p className="text-xs text-stone-500">{p.city} - {formatDate(p.created_at)}</p>
                  </div>
                  <Link to="/admin/producteurs" className="btn-secondary text-xs py-1"> Examiner</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-600" /> Commandes récentes
            </h2>
            <Link to="/admin/commandes" className="text-sm text-primary-600 font-semibold">Voir tout</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-stone-500 text-sm">Aucune commande.</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-stone-800">{formatDate(o.created_at)}</p>
                    <p className="text-xs text-stone-500">{o.order_items?.length || 0} article(s)</p>
                  </div>
                  <span className="font-bold text-primary-700">{formatPrice(o.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    primary: 'bg-primary-100 text-primary-700',
    amber: 'bg-amber-100 text-amber-700',
  };
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-stone-500">{label}</p>
          <p className="text-xl font-bold text-stone-800">{value}</p>
        </div>
      </div>
    </div>
  );
}
