import { useEffect, useState } from 'react';
import { Check, X, MapPin, BadgeCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Producer, ProducerStatus } from '../../lib/types';
import { formatDate } from '../../lib/utils';

export default function AdminProducers() {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ProducerStatus | 'all'>('all');

  useEffect(() => {
    loadProducers();
  }, []);

  async function loadProducers() {
    const { data } = await supabase.from('producers').select('*').order('created_at', { ascending: false });
    setProducers((data as Producer[]) || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: ProducerStatus) {
    await supabase.from('producers').update({ status }).eq('id', id);
    setProducers((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
  }

  const filtered = filter === 'all' ? producers : producers.filter((p) => p.status === filter);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-serif text-3xl font-bold text-stone-800 mb-6">Gestion des producteurs</h1>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'active', 'rejected'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`badge cursor-pointer px-3 py-1.5 ${filter === s ? 'bg-primary-600 text-white' : 'bg-stone-100 text-stone-600'}`}
          >
            {s === 'all' ? 'Tous' : s === 'pending' ? 'En attente' : s === 'active' ? 'Actifs' : 'Refusés'}
            ({s === 'all' ? producers.length : producers.filter((p) => p.status === s).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-stone-500 text-center py-12">Aucun producteur.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((producer) => (
            <div key={producer.id} className="card p-5">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="h-16 w-16 rounded-lg overflow-hidden bg-primary-100 shrink-0">
                  {producer.logo_url && <img src={producer.logo_url} alt={producer.company_name} className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-stone-800">{producer.company_name}</h3>
                      <p className="text-sm text-stone-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5" /> {producer.city}, {producer.region}
                      </p>
                    </div>
                    <span className={`badge ${
                      producer.status === 'active' ? 'bg-green-100 text-green-800' :
                      producer.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {producer.status === 'active' ? 'Actif' : producer.status === 'pending' ? 'En attente' : 'Refusé'}
                    </span>
                  </div>
                  <p className="text-sm text-stone-600 mt-2 line-clamp-2">{producer.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {producer.certifications.map((cert) => (
                      <span key={cert} className="badge bg-primary-100 text-primary-700">
                        <BadgeCheck className="h-3 w-3" /> {cert}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-stone-400 mt-2">Inscrit le {formatDate(producer.created_at)}</p>
                  {producer.siret && <p className="text-xs text-stone-400">SIRET : {producer.siret}</p>}
                </div>
              </div>

              {producer.status === 'pending' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100">
                  <button onClick={() => updateStatus(producer.id, 'active')} className="btn-primary text-xs py-2">
                    <Check className="h-3.5 w-3.5" /> Valider
                  </button>
                  <button onClick={() => updateStatus(producer.id, 'rejected')} className="btn-secondary text-xs py-2 text-red-600">
                    <X className="h-3.5 w-3.5" /> Refuser
                  </button>
                </div>
              )}
              {producer.status === 'active' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100">
                  <button onClick={() => updateStatus(producer.id, 'rejected')} className="btn-secondary text-xs py-2 text-red-600">
                    Suspendre
                  </button>
                </div>
              )}
              {producer.status === 'rejected' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100">
                  <button onClick={() => updateStatus(producer.id, 'active')} className="btn-primary text-xs py-2">
                    <Check className="h-3.5 w-3.5" /> Réactiver
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
