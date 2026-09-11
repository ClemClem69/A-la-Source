import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Mail, ArrowRight, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const hashSearchParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const isRecoveryMode = urlSearchParams.get('type') === 'recovery' || hashSearchParams.get('type') === 'recovery';

    if (!isRecoveryMode) {
      return;
    }

    setRecoveryMode(true);
    (async () => {
      setLoading(true);

      const { error: initError } = await supabase.auth.initialize();
      if (initError) {
        setError(initError.message);
        setLoading(false);
        return;
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        setError(sessionError.message);
      } else if (!sessionData.session) {
        setError('Impossible de valider le lien de réinitialisation. Veuillez demander un nouveau lien.');
      }

      setLoading(false);
    })();
  }, []);

  async function handleRequestSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/mot-de-passe-oublie',
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Un email de réinitialisation a été envoyé si ce compte existe.');
    }
    setLoading(false);
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setError(error.message);
    } else {
      setMessage('Votre mot de passe a bien été réinitialisé. Vous pouvez maintenant vous connecter.');
      setTimeout(() => navigate('/connexion'), 2000);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 mb-4">
            <Leaf className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-800">Réinitialiser le mot de passe</h1>
          <p className="text-stone-500 mt-1">
            {recoveryMode ? 'Choisissez un nouveau mot de passe.' : "Entrez l'email utilisé lors de l'inscription."}
          </p>
        </div>

        {recoveryMode ? (
          <form onSubmit={handleResetSubmit} className="card p-6 space-y-4">
            <div>
              <label className="label">Nouveau mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="Retapez votre mot de passe"
                  minLength={6}
                  required
                />
              </div>
            </div>

            {message && <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">{message}</p>}
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Chargement...' : 'Réinitialiser le mot de passe'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRequestSubmit} className="card p-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="vous@exemple.com"
                  required
                />
              </div>
            </div>

            {message && <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">{message}</p>}
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Envoi...' : 'Envoyer le lien'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        <p className="text-center text-sm text-stone-500 mt-4">
          <Link to="/connexion" className="text-primary-600 font-semibold hover:text-primary-700">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
