import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Truck, Shield, Heart, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product, Producer } from '../lib/types';
import ProductCard from '../components/ProductCard';
import ProducerCard from '../components/ProducerCard';
import { getCurrentSeason } from '../lib/utils';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredProducers, setFeaturedProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [productsRes, producersRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, producer:producers(*), category:categories(*)')
          .eq('is_active', true)
          .eq('is_featured', true)
          .eq('pricing_status', 'validated')
          .limit(8),
        supabase
          .from('producers')
          .select('*')
          .eq('status', 'active')
          .limit(3),
      ]);

      setFeaturedProducts((productsRes.data as unknown as Product[]) || []);
      setFeaturedProducers((producersRes.data as Producer[]) || []);
      setLoading(false);
    }
    loadData();
  }, []);

  const season = getCurrentSeason();
  const seasonLabel: Record<string, string> = {
    printemps: 'Printemps',
    ete: 'Été',
    automne: 'Automne',
    hiver: 'Hiver',
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl">
            <span className="badge bg-white/20 text-white backdrop-blur-sm mb-4">
              <Leaf className="h-3 w-3" /> Saison {seasonLabel[season]}
            </span>
            <span className="french-badge mb-4 ml-2">
              Agriculture française
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Du champ à votre assiette, en vente directe
            </h1>
            <p className="mt-4 text-lg text-primary-100 leading-relaxed">
              Commandez des fruits et légumes frais directement auprès de producteurs français.
              Qualité, fraîcheur et soutien à l'agriculture française.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/catalogue" className="btn-secondary bg-white text-primary-700 border-white hover:bg-primary-50">
                Découvrir le catalogue <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/comment-ca-marche" className="btn-outline border-white text-white hover:bg-white/10">
                Comment ça marche
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="font-serif text-3xl font-bold text-center text-stone-800 mb-12">
          Comment ça marche ?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Leaf, title: 'Choisissez vos produits', desc: 'Parcourez le catalogue de fruits et légumes proposés par nos producteurs français.' },
            { icon: Truck, title: 'Commandez en ligne', desc: 'Ajoutez au panier, choisissez votre point de retrait et votre créneau.' },
            { icon: Heart, title: 'Dégustez !', desc: 'Recevez vos produits frais directement du producteur, prêts à être dégustés.' },
          ].map((step, i) => (
            <div key={i} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 mb-4">
                <step.icon className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg text-stone-800 mb-2">{step.title}</h3>
              <p className="text-stone-600 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-3xl font-bold text-stone-800">Produits de saison</h2>
          <Link to="/catalogue" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            Voir tout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse h-64" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Values */}
      <section className="bg-primary-50 py-16 mt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Qualité garantie', desc: 'Des produits frais, cultivés avec soin par des producteurs passionnés et engagés.' },
              { icon: Leaf, title: 'Sans intermédiaires', desc: 'Achetez directement au producteur, sans intermédiaire. Une rémunération juste.' },
              { icon: Heart, title: 'Agriculture française & durable', desc: 'Soutenez l\'agriculture française et réduisez votre empreinte carbone.' },
            ].map((value, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white">
                  <value.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 mb-1">{value.title}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{value.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured producers */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-3xl font-bold text-stone-800">Nos producteurs</h2>
          <Link to="/producteurs" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            Voir tout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProducers.map((producer) => (
            <ProducerCard key={producer.id} producer={producer} />
          ))}
        </div>
      </section>
    </div>
  );
}
