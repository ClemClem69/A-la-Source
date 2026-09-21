import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setError(null);
    setLoading(true);
    const { error, needsConfirmation } = await signUp(email, password, fullName);
    if (error) {
      setError(error);
      setLoading(false);
    } else if (needsConfirmation) {
      setRegistered(true);
      setLoading(false);
    } else {
      navigate('/');
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 mb-4">
            <Leaf className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-800">Inscription</h1>
          <p className="text-stone-500 mt-1">Rejoignez la communauté de la vente directe</p>
        </div>

        {registered ? (
          <div className="card p-6 text-center space-y-3">
            <Mail className="h-10 w-10 mx-auto text-primary-600" />
            <h2 className="font-semibold text-lg text-stone-800">Vérifiez votre adresse email</h2>
            <p className="text-sm text-stone-600">
              Un email de confirmation a été envoyé à <strong>{email}</strong>. Cliquez sur le lien reçu pour activer votre compte.
            </p>
            <Link to="/connexion" className="btn-primary inline-flex">Aller à la connexion</Link>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label">Nom complet</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input pl-10"
                placeholder="Jean Dupont"
                required
              />
            </div>
          </div>

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

          <div>
            <label className="label">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-10"
                placeholder="Minimum 6 caractères"
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

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Inscription...' : 'S\'inscrire'}
            <ArrowRight className="h-4 w-4" />
          </button>

        </form>
        )}

        <p className="text-center text-sm text-stone-500 mt-4">
          Déjà un compte ?{' '}
          <Link to="/connexion" className="text-primary-600 font-semibold hover:text-primary-700">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
