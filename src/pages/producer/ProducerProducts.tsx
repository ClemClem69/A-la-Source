import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, Package, ArrowLeft, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Producer, Product, Category, ProductUnit } from '../../lib/types';
import { formatPrice, formatUnit, slugify } from '../../lib/utils';

const storageBucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'product-images';

export default function ProducerProducts() {
  const { profile } = useAuth();
  const [producer, setProducer] = useState<Producer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadData();
  }, [profile]);

  async function loadData() {
    if (!profile) return;
    const { data: producerData } = await supabase
      .from('producers')
      .select('*')
      .eq('user_id', profile.id)
      .maybeSingle();
    setProducer(producerData as Producer | null);

    if (producerData) {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*').eq('producer_id', producerData.id).order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
      ]);
      setProducts((productsRes.data as Product[]) || []);
      setCategories((categoriesRes.data as Category[]) || []);
    }
    setLoading(false);
  }

  async function toggleActive(product: Product) {
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id);
    loadData();
  }

  async function deleteProduct(id: string) {
    if (!confirm('Supprimer ce produit ?')) return;
    await supabase.from('products').delete().eq('id', id);
    loadData();
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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/producteur" className="btn-secondary" aria-label="Retour à l'espace producteur">
            <ArrowLeft className="h-4 w-4" /> Retour à l'espace producteur
          </Link>
          <h1 className="font-serif text-3xl font-bold text-stone-800">Mes produits</h1>
        </div>
        <div>
          <button
            onClick={() => { setEditingProduct(null); setShowForm(true); }}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" /> Ajouter un produit
          </button>
        </div>
      </div>

      {/* Info sur la validation des prix */}
      <div className="card p-4 mb-6 bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Vos produits ne seront visibles aux consommateurs que lorsque l'équipe de la plateforme aura validé le prix consommateur.
          En attendant, ils resteront en attente de validation.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500 mb-4">Vous n'avez pas encore de produits.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Ajouter mon premier produit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="card p-4">
              <div className="flex gap-3">
                <div className="h-16 w-16 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                  {product.image_url && <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-800 truncate">{product.name}</h3>
                  <p className="text-sm text-stone-500">{formatPrice(product.price)} / {formatUnit(product.unit)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge ${product.stock === 0 ? 'bg-red-100 text-red-700' : product.stock <= 10 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {product.stock === 0 ? 'Épuisé' : `${product.stock} en stock`}
                    </span>
                    <span className={`badge ${product.is_active ? 'bg-primary-100 text-primary-700' : 'bg-stone-100 text-stone-500'}`}>
                      {product.is_active ? 'Actif' : 'Inactif'}
                    </span>
                    <span className={`badge ${product.pricing_status === 'validated' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {product.pricing_status === 'validated' ? 'Prix validé' : 'En attente'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-stone-100">
                <button onClick={() => toggleActive(product)} className="btn-secondary flex-1 text-xs py-1.5">
                  {product.is_active ? 'Désactiver' : 'Activer'}
                </button>
                <button onClick={() => { setEditingProduct(product); setShowForm(true); }} className="btn-secondary px-3 py-1.5" aria-label="Modifier">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => deleteProduct(product.id)} className="btn-secondary px-3 py-1.5 text-red-600 hover:bg-red-50" aria-label="Supprimer">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editingProduct}
          producerId={producer.id}
          categories={categories}
          onClose={() => { setShowForm(false); setEditingProduct(null); }}
          onSaved={() => { setShowForm(false); setEditingProduct(null); loadData(); }}
        />
      )}
    </div>
  );
}

function ProductForm({
  product,
  producerId,
  categories,
  onClose,
  onSaved,
}: {
  product: Product | null;
  producerId: string;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [unit, setUnit] = useState<ProductUnit>(product?.unit || 'kg');
  const [stock, setStock] = useState(product?.stock?.toString() || '0');
  const [categoryId, setCategoryId] = useState(product?.category_id || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [season, setSeason] = useState<string[]>(product?.season || []);
  const [showShippingInfo, setShowShippingInfo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seasons = ['printemps', 'ete', 'automne', 'hiver', 'toutes'];
  const seasonLabels: Record<string, string> = {
    printemps: 'Printemps', ete: 'Été', automne: 'Automne', hiver: 'Hiver', toutes: 'Toute l\'année',
  };

  function toggleSeason(s: string) {
    setSeason((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) return product?.image_url || null;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${producerId}/${slugify(name)}-${Date.now()}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(storageBucket)
      .upload(filePath, imageFile, { cacheControl: '3600', upsert: true });

    if (uploadError) {
      setError(`Erreur upload image : ${uploadError.message}`);
      return null;
    }

    const publicUrlResponse = supabase.storage
      .from(storageBucket)
      .getPublicUrl(filePath);

    if ('error' in publicUrlResponse && publicUrlResponse.error) {
      const errorObj = publicUrlResponse.error as { message?: string };
      const message = errorObj.message || JSON.stringify(publicUrlResponse.error);
      setError(`Erreur URL publique : ${message}`);
      return null;
    }

    return publicUrlResponse.data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const uploadedImageUrl = await uploadImage();
    if (imageFile && !uploadedImageUrl) {
      setSaving(false);
      return;
    }

    const data = {
      producer_id: producerId,
      category_id: categoryId || null,
      name,
      slug: slugify(name),
      description,
      price: parseFloat(price),
      unit,
      stock: parseInt(stock),
      image_url: uploadedImageUrl,
      season,
      is_active: product?.is_active ?? true,
      is_featured: product?.is_featured ?? false,
      pricing_status: product?.pricing_status || 'pending', // Garder le statut existant ou 'pending' pour nouveaux
    };

    if (product) {
      const { error } = await supabase.from('products').update(data).eq('id', product.id);
      if (error) setError(error.message);
      else onSaved();
    } else {
      const { error } = await supabase.from('products').insert({
        ...data,
        final_price: parseFloat(price),
      });
      if (error) setError(error.message);
      else onSaved();
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-stone-200 sticky top-0 bg-white">
          <h2 className="font-semibold text-stone-800">{product ? 'Modifier le produit' : 'Nouveau produit'}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="label">Nom du produit</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" required placeholder="Tomates anciennes" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input min-h-20 resize-y" placeholder="Description du produit..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1">
                <label htmlFor="product-price" className="label">Prix producteur suggéré (€)</label>
                <button
                  type="button"
                  onClick={() => setShowShippingInfo((visible) => !visible)}
                  className="mb-2 text-stone-400 hover:text-primary-600"
                  aria-label="Informations sur le prix producteur suggéré"
                  aria-expanded={showShippingInfo}
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>
              {showShippingInfo && (
                <p className="mb-2 rounded-lg bg-blue-50 px-3 py-2 text-xs leading-relaxed text-blue-900">
                  Le prix producteur est le montant directement perçu par le producteur pour chaque unité vendue. Vous le suggérez selon vos coûts et la valeur du produit ; l'équipe de la plateforme le vérifie, puis fixe séparément le prix consommateur.
                </p>
              )}
              <input id="product-price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="input" required placeholder="3.50" />
              <p className="text-xs text-stone-500 mt-1">Ce prix sera validé et ajusté par l'équipe de la plateforme</p>
            </div>
            <div>
              <label className="label">Unité</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value as ProductUnit)} className="input">
                <option value="kg">kg</option>
                <option value="piece">pièce</option>
                <option value="bunch">botte</option>
                <option value="tray">barquette</option>
                <option value="liter">litre</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Stock</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="input" required placeholder="100" />
            </div>
            <div>
              <label className="label">Catégorie</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
                <option value="">-- Aucune --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Image du produit</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="input file:border-0 file:bg-primary-600 file:text-white file:px-3 file:py-2 file:rounded-lg"
            />
            {product?.image_url && !imageFile && (
              <p className="text-xs text-stone-500 mt-2">Image actuelle : {product.image_url}</p>
            )}
          </div>
          <div>
            <label className="label">Saisons</label>
            <div className="flex flex-wrap gap-2">
              {seasons.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSeason(s)}
                  className={`badge cursor-pointer transition-colors ${
                    season.includes(s) ? 'bg-primary-600 text-white' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {seasonLabels[s]}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Enregistrement...' : product ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
