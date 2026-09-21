import { useState } from 'react';
import { Building2, CheckCircle2, KeyRound, Mail, User } from 'lucide-react';
import AdminBackButton from '../../components/AdminBackButton';
import { supabase } from '../../lib/supabase';

export default function AdminProducerAccount() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    companyName: '',
    siret: '',
    description: '',
    address: '',
    city: '',
    region: '',
    postalCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: invokeError } = await supabase.functions.invoke('create-producer-account', {
      body: form,
    });

    if (invokeError) {
      let message = invokeError.message || 'Impossible de créer le compte producteur.';
      const response = (invokeError as { context?: Response }).context;

      if (response) {
        try {
          const responseBody = await response.clone().json();
          if (typeof responseBody?.error === 'string') message = responseBody.error;
        } catch {}
      }

      setError(message);
    } else if (data?.error) {
      setError(data.error);
    } else {
      setCreated(true);
      setForm({
        fullName: '', email: '', password: '', companyName: '', siret: '', description: '',
        address: '', city: '', region: '', postalCode: '',
      });
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <AdminBackButton />
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-stone-800 mb-2">Ajouter un compte producteur</h1>
        <p className="text-stone-600">Créez le compte et la fiche de l'exploitation depuis l'administration.</p>
      </div>

      {created && (
        <div className="mb-6 flex gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>Le compte producteur et sa fiche ont été créés. Transmettez ses identifiants de manière sécurisée.</span>
        </div>
      )}
      {error && <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

      <form onSubmit={handleSubmit} className="card space-y-6 p-6">
        <section>
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-stone-800"><User className="h-5 w-5 text-primary-600" /> Accès du producteur</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="label">Nom complet
              <span className="relative mt-1 block"><User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} className="input pl-10" required /></span>
            </label>
            <label className="label">Email
              <span className="relative mt-1 block"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="input pl-10" required /></span>
            </label>
            <label className="label">Mot de passe initial
              <span className="relative mt-1 block"><KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input type="password" minLength={6} value={form.password} onChange={(e) => updateField('password', e.target.value)} className="input pl-10" required /></span>
            </label>
          </div>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-stone-800"><Building2 className="h-5 w-5 text-primary-600" /> Exploitation</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="label">Nom de l'exploitation<input value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)} className="input mt-1" placeholder="Ferme des Brosses" required /></label>
            <label className="label">Numéro de SIRET<input value={form.siret} onChange={(e) => updateField('siret', e.target.value)} className="input mt-1" placeholder="123 456 789 00012" required /></label>
          </div>
          <label className="label mt-4">Description<textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} className="input mt-1 min-h-24 resize-y" /></label>
        </section>

        <section>
          <h2 className="mb-4 font-semibold text-stone-800">Coordonnées</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="label">Adresse<input value={form.address} onChange={(e) => updateField('address', e.target.value)} className="input mt-1" /></label>
            <label className="label">Ville<input value={form.city} onChange={(e) => updateField('city', e.target.value)} className="input mt-1" /></label>
            <label className="label">Région<input value={form.region} onChange={(e) => updateField('region', e.target.value)} className="input mt-1" /></label>
            <label className="label">Code postal<input value={form.postalCode} onChange={(e) => updateField('postalCode', e.target.value)} className="input mt-1" /></label>
          </div>
        </section>

        <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto">
          {loading ? 'Création...' : 'Créer le compte producteur'}
        </button>
      </form>
    </div>
  );
}
