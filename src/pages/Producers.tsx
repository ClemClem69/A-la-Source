import { useEffect, useState } from 'react';
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

  return (
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
  );
}
