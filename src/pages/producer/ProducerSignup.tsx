import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function ProducerSignup() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const storageBucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'product-images';
  const [companyName, setCompanyName] = useState('');
  const [siret, setSiret] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [certifications, setCertifications] = useState('');
  const [deliveryZones, setDeliveryZones] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;

    if (!companyName) {
      setError('Veuillez renseigner le nom de votre exploitation.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      let logoUrl: string | null = null;
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `producer-logos/${profile.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from(storageBucket)
          .upload(fileName, logoFile, { cacheControl: '3600', upsert: true });
        if (uploadError) throw uploadError;

        const publicUrlResponse = supabase.storage.from(storageBucket).getPublicUrl(fileName);
        if ('error' in publicUrlResponse && publicUrlResponse.error) {
          const message = (publicUrlResponse.error as { message?: string }).message || JSON.stringify(publicUrlResponse.error);
          throw new Error(message);
        }
        logoUrl = publicUrlResponse.data.publicUrl;
      }

      const { error: insertError } = await supabase.from('producers').insert({
        user_id: profile.id,
        company_name: companyName,
        siret: siret || null,
        description: description || null,
        address: address || null,
        city: city || null,
        region: region || null,
        postal_code: postalCode || null,
        latitude: null,
        longitude: null,
        certifications: certifications ? certifications.split(',').map((item) => item.trim()) : [],
        status: 'pending',
        logo_url: logoUrl,
        cover_url: null,
        farming_methods: null,
        delivery_zones: deliveryZones ? deliveryZones.split(',').map((item) => item.trim()) : [],
      });
      if (insertError) throw insertError;
      setSuccess(true);
      setTimeout(() => navigate('/producteur'), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la création du profil.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-stone-800 mb-2">Profil producteur créé</h1>
        <p className="text-stone-500 mb-6">Votre fiche a bien été enregistrée. Elle sera examinée par l'équipe avant mise en ligne.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 mb-4">
          <Leaf className="h-7 w-7 text-white" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-stone-800">Créer ma fiche producteur</h1>
        <p className="text-stone-500 mt-2">Complétez votre dossier pour rejoindre la marketplace A la Source.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 rounded-xl bg-white border border-stone-200 p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="label">Nom de l'exploitation</label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="input"
              placeholder="Ferme de la Source"
              required
            />
          </div>
          <div>
            <label className="label">SIRET</label>
            <input
              value={siret}
              onChange={(e) => setSiret(e.target.value)}
              className="input"
              placeholder="123 456 789 00012"
            />
          </div>
          <div>
            <label className="label">Photo de profil</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              className="input file:border-0 file:bg-primary-600 file:text-white file:px-3 file:py-2 file:rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input min-h-28 resize-y"
            placeholder="Présentez votre exploitation, vos pratiques et vos engagements."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Adresse</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="input" placeholder="Rue et numéro" />
          </div>
          <div>
            <label className="label">Ville</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} className="input" placeholder="Lyon" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="label">Région</label>
            <input value={region} onChange={(e) => setRegion(e.target.value)} className="input" placeholder="Auvergne-Rhône-Alpes" />
          </div>
          <div>
            <label className="label">Code postal</label>
            <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="input" placeholder="69000" />
          </div>
          <div>
            <label className="label">Certifications</label>
            <input
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
              className="input"
              placeholder="AB, HVE, etc."
            />
          </div>
        </div>

        <div>
          <label className="label">Points de retrait / zones desservies</label>
          <input
            value={deliveryZones}
            onChange={(e) => setDeliveryZones(e.target.value)}
            className="input"
            placeholder="Marché central, Ferme, Point relais"
          />
          <p className="text-xs text-stone-500 mt-1">Séparez les zones par des virgules.</p>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary inline-flex items-center justify-center gap-2">
          {loading ? 'Enregistrement...' : 'Créer mon profil'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
