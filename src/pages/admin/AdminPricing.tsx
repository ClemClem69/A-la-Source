import { useEffect, useState } from 'react';
import { Package, X, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Product, Producer } from '../../lib/types';
import { formatPrice, formatUnit, formatDate } from '../../lib/utils';

export default function AdminPricing() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string>('');
  const [editingSuggestedId, setEditingSuggestedId] = useState<string | null>(null);
  const [editingSuggestedPrice, setEditingSuggestedPrice] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vérifier que l'utilisateur a l'email autorisé
  const isAuthorized = profile?.email === 'ledclement341@gmail.com';

  useEffect(() => {
    if (!isAuthorized) return;
    loadProducts();
  }, [isAuthorized]);

  async function loadProducts() {
    const { data } = await supabase
      .from('products')
      .select('*, producer:producers(*), category:categories(*)')
      .order('created_at', { ascending: false });
    setProducts((data as unknown as Product[]) || []);
    setLoading(false);
  }

  async function updatePrice(productId: string, newPrice: number) {
    if (!Number.isFinite(newPrice) || newPrice < 0) {
      setError('Veuillez saisir un prix consommateur valide.');
      return;
    }

    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from('products')
      .update({ final_price: newPrice, pricing_status: 'validated' })
      .eq('id', productId);

    if (error) {
      setError(`Impossible de valider le prix : ${error.message}`);
    } else {
      setProducts((prev) =>
        prev.map((p) => p.id === productId ? { ...p, final_price: newPrice, pricing_status: 'validated' } : p)
      );
      setEditingId(null);
    }
    setSaving(false);
  }

  async function updateSuggestedPrice(productId: string, newPrice: number) {
    setSaving(true);
    const { error } = await supabase
      .from('products')
      .update({ price: newPrice })
      .eq('id', productId);

    if (!error) {
      setProducts((prev) =>
        prev.map((p) => p.id === productId ? { ...p, price: newPrice } : p)
      );
      setEditingSuggestedId(null);
    }
    setSaving(false);
  }

  if (!isAuthorized) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="card p-6">
          <Package className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-700 font-semibold mb-2">Accès non autorisé</p>
          <p className="text-stone-500">Vous n'avez pas les permissions pour accéder à cette page.</p>
        </div>
      </div>
    );
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
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-stone-800 mb-2">Gestion des tarifs</h1>
        <p className="text-stone-600">Définissez le prix consommateur de chaque produit</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

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
                  <th className="text-left px-4 py-3 text-sm font-semibold text-stone-700">Prix producteur suggéré</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-stone-700">Prix consommateur</th>
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
                    <td className="px-4 py-3 text-sm">
                      {editingSuggestedId === product.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editingSuggestedPrice}
                            onChange={(e) => setEditingSuggestedPrice(e.target.value)}
                            className="input w-24 text-sm"
                            aria-label={`Prix producteur suggéré de ${product.name}`}
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => updateSuggestedPrice(product.id, parseFloat(editingSuggestedPrice))}
                            disabled={saving || !editingSuggestedPrice || Number.isNaN(parseFloat(editingSuggestedPrice))}
                            className="btn-primary text-xs py-1 px-2 disabled:opacity-50"
                            title="Enregistrer le prix producteur suggéré"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSuggestedId(null)}
                            className="btn-secondary text-xs py-1 px-2"
                            title="Annuler"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSuggestedId(product.id);
                            setEditingSuggestedPrice(product.price.toString());
                          }}
                          className="bg-amber-50 text-amber-800 px-3 py-1 rounded-lg font-medium hover:bg-amber-100"
                          title="Modifier le prix producteur suggéré"
                        >
                          {formatPrice(product.price)} / {formatUnit(product.unit)}
                        </button>
                      )}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {editingId === product.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editingPrice}
                            onChange={(e) => setEditingPrice(e.target.value)}
                            className="input w-24 text-sm"
                            aria-label={`Prix consommateur de ${product.name}`}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <span className="font-medium text-stone-800">
                          {formatPrice(product.final_price)} / {formatUnit(product.unit)}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
  <span
    className={`badge ${
      product.pricing_status === "validated"
        ? "bg-green-100 text-green-700"
        : "bg-amber-100 text-amber-700"
    }`}
  >
    {product.pricing_status === "validated" ? "Validé" : "En attente"}
  </span>
                    </td>

                    <td className="px-4 py-3">
  {editingId === product.id ? (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() =>
          updatePrice(product.id, parseFloat(editingPrice))
        }
        disabled={saving || !editingPrice}
        className="btn-primary text-xs py-1 px-2 disabled:opacity-50"
      >
        <Check className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => setEditingId(null)}
        className="btn-secondary text-xs py-1 px-2"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  ) : (
    <button
      type="button"
      onClick={() => {
        setEditingId(product.id);
                            setEditingPrice(product.final_price.toString());
      }}
      className="btn-secondary text-xs py-1 px-3"
    >
      Modifier
    </button>
  )}
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
