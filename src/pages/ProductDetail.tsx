import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Leaf, ArrowLeft, MapPin, BadgeCheck, Minus, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product, Review } from '../lib/types';
import { formatPrice, formatUnit, getSeasonLabel } from '../lib/utils';
import { useCart } from '../contexts/CartContext';
import StarRating from '../components/StarRating';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*, producer:producers(*), category:categories(*)')
        .eq('id', id)
        .maybeSingle();

      setProduct(data as unknown as Product);

      if (data) {
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*, profiles(full_name)')
          .eq('product_id', id)
          .order('created_at', { ascending: false });
        setReviews((reviewsData as unknown as Review[]) || []);
      }
      setLoading(false);
    }
    loadProduct();
  }, [id]);

  function handleAddToCart() {
    if (product) {
      addItem(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-stone-500">Produit introuvable.</p>
        <Link to="/catalogue" className="btn-primary mt-4">Retour au catalogue</Link>
      </div>
    );
  }

  if (product.pricing_status === 'pending') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-amber-700 bg-amber-50 p-4 rounded-lg inline-block">
          Ce produit est en attente de validation du prix. Il ne peut pas être acheté pour le moment.
        </p>
        <Link to="/catalogue" className="btn-primary mt-4">Retour au catalogue</Link>
      </div>
    );
  }

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/catalogue" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-primary-600 mb-4">
        <ArrowLeft className="h-4 w-4" /> Retour au catalogue
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="rounded-xl overflow-hidden bg-stone-100 aspect-square">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary-50">
              <Leaf className="h-16 w-16 text-primary-300" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.category && (
            <span className="badge bg-primary-100 text-primary-700 mb-2 w-fit">{product.category.name}</span>
          )}
          <h1 className="font-serif text-3xl font-bold text-stone-800">{product.name}</h1>

          {product.producer && (
            <Link to={`/producteur/${product.producer.id}`} className="flex items-center gap-2 mt-2 group">
              <MapPin className="h-4 w-4 text-stone-400" />
              <span className="text-sm text-stone-600 group-hover:text-primary-700">
                {product.producer.company_name} - {product.producer.city}
              </span>
            </Link>
          )}

          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={avgRating} />
              <span className="text-sm text-stone-500">({reviews.length} avis)</span>
            </div>
          )}

          <p className="text-stone-600 mt-4 leading-relaxed">{product.description}</p>

          {product.season.length > 0 && (
            <p className="text-sm text-stone-500 mt-3">
              <span className="font-medium text-stone-700">Saison :</span> {getSeasonLabel(product.season)}
            </p>
          )}

          {product.producer?.certifications && product.producer.certifications.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {product.producer.certifications.map((cert) => (
                <span key={cert} className="badge bg-primary-100 text-primary-700">
                  <BadgeCheck className="h-3 w-3" /> {cert}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-stone-200">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-primary-700">{formatPrice(product.final_price)}</span>
              <span className="text-stone-500 mb-1">/ {formatUnit(product.unit)}</span>
            </div>

            {product.stock > 0 ? (
              <p className="text-sm text-green-600 mt-1">En stock ({product.stock} disponibles)</p>
            ) : (
              <p className="text-sm text-red-600 mt-1">Rupture de stock</p>
            )}

            {/* Quantity selector */}
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center rounded-lg border border-stone-300">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-l-lg"
                  disabled={product.stock === 0}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 text-sm font-semibold min-w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-r-lg"
                  disabled={product.stock === 0 || quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn-primary flex-1"
              >
                <ShoppingCart className="h-4 w-4" />
                {added ? 'Ajouté !' : 'Ajouter au panier'}
              </button>
            </div>

            <button
              onClick={() => {
                handleAddToCart();
                navigate('/panier');
              }}
              disabled={product.stock === 0}
              className="btn-outline w-full mt-2"
            >
              Commander maintenant
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-12 pt-8 border-t border-stone-200">
        <h2 className="font-serif text-2xl font-bold text-stone-800 mb-6">Avis clients</h2>
        {reviews.length === 0 ? (
          <p className="text-stone-500">Soyez le premier à laisser un avis sur ce produit.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-stone-800">{review.profiles?.full_name || 'Anonyme'}</span>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                {review.comment && <p className="text-stone-600 text-sm">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
