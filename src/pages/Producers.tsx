import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import SeoMetadata from '../components/SeoMetadata';
import { supabase } from '../lib/supabase';
import type { Producer } from '../lib/types';
import ProducerCard from '../components/ProducerCard';

export default function Producers() {
  const pageTitle = 'Producteurs | Mon marché futé';
  const pageDescription = 'Découvrez la page consacrée aux producteurs référencés par Mon marché futé et les informations disponibles sur leurs exploitations.';
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
    '@id': 'https://monmarchefute.com/producteurs/#webpage',
    url: 'https://monmarchefute.com/producteurs/',
    name: pageTitle,
    description: pageDescription,
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
      <SeoMetadata title={pageTitle} description={pageDescription} canonicalPath="/producteurs/" />
      <Helmet>
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
