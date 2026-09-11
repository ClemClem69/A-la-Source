import { useState } from 'react';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const { profile, refreshProfile } = useAuth();
  const storageBucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'product-images';
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [city, setCity] = useState(profile?.city || '');
  const [postalCode, setPostalCode] = useState(profile?.postal_code || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);

    let avatarUrl = profile.avatar_url || null;
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `profile-avatars/${profile.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from(storageBucket)
        .upload(fileName, avatarFile, { cacheControl: '3600', upsert: true });
      if (uploadError) {
        setError(uploadError.message);
        setSaving(false);
        return;
      }

      const publicUrlResponse = supabase.storage.from(storageBucket).getPublicUrl(fileName);
      if ('error' in publicUrlResponse && publicUrlResponse.error) {
        const message = (publicUrlResponse.error as { message?: string }).message || JSON.stringify(publicUrlResponse.error);
        setError(message);
        setSaving(false);
        return;
      }
      avatarUrl = publicUrlResponse.data.publicUrl;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone, address, city, postal_code: postalCode, avatar_url: avatarUrl })
      .eq('id', profile.id);

    if (!error) {
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-serif text-3xl font-bold text-stone-800 mb-6">Mon profil</h1>

      <form onSubmit={handleSave} className="card p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-[auto_1fr] items-center">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-stone-100">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name || 'Avatar'} className="h-full w-full object-cover" />
            ) : (
              <User className="h-10 w-10 text-stone-400" />
            )}
          </div>
          <div>
            <label className="label">Photo de profil</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              className="input file:border-0 file:bg-primary-600 file:text-white file:px-3 file:py-2 file:rounded-lg"
            />
            <p className="text-xs text-stone-500 mt-1">Téléchargez votre photo de profil ici.</p>
          </div>
        </div>
        <div>
          <label className="label">Nom complet</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input pl-10" placeholder="Votre nom" />
          </div>
        </div>

        <div>
          <label className="label">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input value={profile.email} disabled className="input pl-10 bg-stone-50" />
          </div>
        </div>

        <div>
          <label className="label">Téléphone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input pl-10" placeholder="06 12 34 56 78" />
          </div>
        </div>

        <div>
          <label className="label">Adresse</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="input pl-10" placeholder="12 rue Exemple" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Ville</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} className="input" placeholder="Lyon" />
          </div>
          <div>
            <label className="label">Code postal</label>
            <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="input" placeholder="69000" />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button type="submit" disabled={saving} className="btn-primary">
          <Save className="h-4 w-4" />
          {saved ? 'Enregistré !' : saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  );
}
