import { useEffect, useState } from 'react';
import { Star, Package, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Product, Producer } from '../../lib/types';
import { formatPrice, formatUnit, formatDate } from '../../lib/utils';
import AdminBackButton from '../../components/AdminBackButton';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [productsRes, producersRes] = await Promise.all([
        supabase.from('products').select('*, producer:producers(*), category:categories(*)').order('created_at', { ascending: false }),
        supabase.from('producers').select('*'),
      ]);
      setProducts((productsRes.data as unknown as Product[]) || []);
      setProducers((producersRes.data as Producer[]) || []);
      setLoading(false);
    }
    loadData();
  }, []);

  async function toggleFeatured(product: Product) {
    await supabase.from('products').update({ is_featured: !product.is_featured }).eq('id', product.id);
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, is_featured: !p.is_featured } : p));
  }

  async function toggleActive(product: Product) {
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id);
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, is_active: !p.is_active } : p));
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <AdminBackButton />
      <h1 className="font-serif text-3xl font-bold text-stone-800 mb-6">Modération des produits</h1>

      {/* Pricing Info */}
      <div className="card p-4 mb-6 bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Les prix affichés sont les prix producteur suggérés par les producteurs, c'est-à-dire les montants qu'ils perçoivent directement. Vous pouvez modifier ces prix pour fixer le prix consommateur.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">Aucun produit.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-stone-700">Produit</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-stone-700 hidden md:table-cell">Producteur</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-stone-700">Prix</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-stone-700 hidden md:table-cell">Stock</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-stone-700">Statut</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-stone-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                          {product.image_url && <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-800">{product.name}</p>
                          <p className="text-xs text-stone-400">{formatDate(product.created_at)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-600 hidden md:table-cell">
                      {product.producer?.company_name || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-600">
                      {formatPrice(product.price)} / {formatUnit(product.unit)}
                    </td>
                    <td className="px-4 py-3 text-sm hidden md:table-cell">
                      <span className={product.stock === 0 ? 'text-red-600' : product.stock <= 10 ? 'text-amber-600' : 'text-stone-600'}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                        {product.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => toggleFeatured(product)}
                          className={`p-1.5 rounded-lg transition-colors ${product.is_featured ? 'bg-secondary-100 text-secondary-700' : 'text-stone-400 hover:bg-stone-100'}`}
                          title={product.is_featured ? 'Retirer des coups de cœur' : 'Mettre en avant'}
                        >
                          <Star className={`h-4 w-4 ${product.is_featured ? 'fill-secondary-400' : ''}`} />
                        </button>
                        <button
                          title="Modifier le prix"
                          className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors"
                        >
                          <DollarSign className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleActive(product)}
                          className="btn-secondary text-xs py-1"
                        >
                          {product.is_active ? 'Désactiver' : 'Activer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
