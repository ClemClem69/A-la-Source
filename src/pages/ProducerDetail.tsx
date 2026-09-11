import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, BadgeCheck, Leaf, ArrowLeft, Truck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Producer, Product, Review } from '../lib/types';
import ProductCard from '../components/ProductCard';
import StarRating from '../components/StarRating';

export default function ProducerDetail() {
  const { id } = useParams();
  const [producer, setProducer] = useState<Producer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducer() {
      setLoading(true);
      const { data: producerData } = await supabase
        .from('producers')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      setProducer(producerData as unknown as Producer);

      if (producerData) {
        const [productsRes, reviewsRes] = await Promise.all([
          supabase
            .from('products')
            .select('*, producer:producers(*), category:categories(*)')
            .eq('producer_id', id)
            .eq('is_active', true)
            .order('created_at', { ascending: false }),
          supabase
            .from('reviews')
            .select('*, profiles(full_name)')
            .eq('producer_id', id)
            .order('created_at', { ascending: false }),
        ]);

        setProducts((productsRes.data as unknown as Product[]) || []);
        setReviews((reviewsRes.data as unknown as Review[]) || []);
      }
      setLoading(false);
    }
    loadProducer();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (!producer) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-stone-500">Producteur introuvable.</p>
        <Link to="/producteurs" className="btn-primary mt-4">Voir tous les producteurs</Link>
      </div>
    );
  }

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div>
      {/* Cover */}
      <div className="relative h-48 md:h-64 overflow-hidden bg-primary-200">
        {producer.cover_url && (
          <img src={producer.cover_url} alt={producer.company_name} className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link to="/producteurs" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-primary-600 mt-4">
          <ArrowLeft className="h-4 w-4" /> Tous les producteurs
        </Link>

        {/* Producer header */}
        <div className="flex flex-col md:flex-row gap-6 mt-4 pb-8 border-b border-stone-200">
          <div className="flex flex-col md:flex-row gap-6 w-full">
            <div className="h-24 w-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden shrink-0 -mt-12 md:mt-0">
              {producer.logo_url ? (
                <img src={producer.logo_url} alt={producer.company_name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary-100">
                  <Leaf className="h-10 w-10 text-primary-400" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="font-serif text-3xl font-bold text-stone-800">{producer.company_name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {producer.city && (
                  <span className="flex items-center gap-1 text-sm text-stone-500">
                    <MapPin className="h-4 w-4" /> {producer.city}, {producer.region}
                  </span>
                )}
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1">
                    <StarRating rating={avgRating} size="sm" />
                    <span className="text-sm text-stone-500">({reviews.length} avis)</span>
                  </div>
                )}
              </div>

              {producer.certifications.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {producer.certifications.map((cert) => (
                    <span key={cert} className="badge bg-primary-100 text-primary-700">
                      <BadgeCheck className="h-3 w-3" /> {cert}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2">
            <h2 className="font-serif text-xl font-bold text-stone-800 mb-3">À propos de l'exploitation</h2>
            <p className="text-stone-600 leading-relaxed">{producer.description}</p>

            {producer.farming_methods && (
              <>
                <h3 className="font-semibold text-stone-700 mt-6 mb-2">Méthodes de culture</h3>
                <p className="text-stone-600 leading-relaxed">{producer.farming_methods}</p>
              </>
            )}
          </div>

          <div className="space-y-4">
            <div className="card p-4">
              <h3 className="font-semibold text-stone-700 mb-2 flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary-600" /> Zones desservies
              </h3>
              {producer.delivery_zones.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {producer.delivery_zones.map((zone) => (
                    <span key={zone} className="badge bg-stone-100 text-stone-700">{zone}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-stone-500">Non renseigné</p>
              )}
            </div>

            {producer.siret && (
              <div className="card p-4">
                <h3 className="font-semibold text-stone-700 mb-1">SIRET</h3>
                <p className="text-sm text-stone-600">{producer.siret}</p>
              </div>
            )}
          </div>
        </div>

        {/* Products */}
        <section className="mt-12">
          <h2 className="font-serif text-2xl font-bold text-stone-800 mb-6">
            Produits de {producer.company_name}
          </h2>
          {products.length === 0 ? (
            <p className="text-stone-500">Ce producteur n'a pas encore de produits disponibles.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="mt-12 pb-8">
            <h2 className="font-serif text-2xl font-bold text-stone-800 mb-6">Avis sur le producteur</h2>
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
          </section>
        )}
      </div>
    </div>
  );
}
