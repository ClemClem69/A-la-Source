import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import type { Producer } from '../lib/types';
import ProducerCard from '../components/ProducerCard';

export default function Producers() {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducers() {
      const { data } = await supabase
        .from('producers')
        .select('*')
        .eq('status', 'active')
        .order('company_name');
      setProducers((data as Producer[]) || []);
      setLoading(false);
    }
    loadProducers();
  }, []);

  const producersStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://monmarchefute.com/producteurs#webpage',
    url: 'https://monmarchefute.com/producteurs',
    name: 'Découvrez nos producteurs français | Mon Marché Futé',
    description: 'Rencontrez les producteurs français de fruits et légumes frais et découvrez leurs exploitations.',
    inLanguage: 'fr-FR',
    isPartOf: { '@id': 'https://monmarchefute.com/#website' },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: producers.length,
      itemListElement: producers.map((producer, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Organization',
          name: producer.company_name,
          url: `https://monmarchefute.com/producteur/${encodeURIComponent(producer.id)}`,
          ...(producer.description ? { description: producer.description } : {}),
          ...(producer.logo_url ? { image: new URL(producer.logo_url, 'https://monmarchefute.com').toString() } : {}),
          ...(producer.city || producer.address ? {
            address: {
              '@type': 'PostalAddress',
              ...(producer.address ? { streetAddress: producer.address } : {}),
              ...(producer.city ? { addressLocality: producer.city } : {}),
              ...(producer.region ? { addressRegion: producer.region } : {}),
              ...(producer.postal_code ? { postalCode: producer.postal_code } : {}),
              addressCountry: 'FR',
            },
          } : {}),
        },
      })),
    },
  };

  return (
    <>
      <Helmet>
        <title>Découvrez nos producteurs français | Mon Marché Futé</title>
        <meta name="description" content="Rencontrez les producteurs français de fruits et légumes frais. Découvrez leurs exploitations et leurs produits en vente directe." />
        <link rel="canonical" href="https://monmarchefute.com/producteurs" />
        <meta property="og:title" content="Découvrez nos producteurs français | Mon Marché Futé" />
        <meta property="og:description" content="Rencontrez les producteurs français de fruits et légumes frais. Découvrez leurs exploitations et leurs produits en vente directe." />
        <meta property="og:url" content="https://monmarchefute.com/producteurs" />
        <meta property="og:image" content="https://monmarchefute.com/mon-marche-fute-og.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Découvrez nos producteurs français | Mon Marché Futé" />
        <meta name="twitter:description" content="Rencontrez les producteurs français de fruits et légumes frais. Découvrez leurs exploitations et leurs produits en vente directe." />
        <meta name="twitter:image" content="https://monmarchefute.com/mon-marche-fute-og.png" />
        <script type="application/ld+json">{JSON.stringify(producersStructuredData).replace(/</g, '\\u003c')}</script>
      </Helmet>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-serif text-3xl font-bold text-stone-800 mb-2">Nos producteurs</h1>
      <p className="text-stone-500 mb-8">Découvrez les maraîchers et arboriculteurs qui cultivent vos fruits et légumes.</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse h-56" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {producers.map((producer) => (
            <ProducerCard key={producer.id} producer={producer} />
          ))}
        </div>
      )}
      </div>
    </>
  );
}
