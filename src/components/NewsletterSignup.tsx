import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { trackAnalyticsEvent } from '../lib/analytics';

export default function NewsletterSignup() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submissionInProgress = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionInProgress.current) return;

    submissionInProgress.current = true;
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim().toLowerCase();

    try {
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert({ email, consent: true });

      if (insertError && insertError.code !== '23505') {
        setError('Votre demande n’a pas pu être enregistrée. Vérifiez votre connexion et réessayez.');
        return;
      }

      if (!insertError) {
        trackAnalyticsEvent('preregistration_submit_success');
      }
      setSubmitted(true);
    } catch {
      setError('Une erreur réseau a empêché l’enregistrement. Vérifiez votre connexion et réessayez.');
    } finally {
      submissionInProgress.current = false;
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-primary-100 bg-primary-50 p-6 sm:p-8" aria-labelledby="newsletter-title">
      {submitted ? (
        <div className="flex items-start gap-3" role="status" aria-live="polite">
          <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-primary-600" aria-hidden="true" />
          <div>
            <h2 id="newsletter-title" className="font-serif text-xl font-bold text-stone-800">Demande enregistrée</h2>
            <p className="mt-1 text-sm text-stone-600">Votre demande a bien été prise en compte.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3">
            <Mail className="mt-1 h-6 w-6 shrink-0 text-primary-600" aria-hidden="true" />
            <div>
              <h2 id="newsletter-title" className="font-serif text-xl font-bold text-stone-800">Soyez informé du lancement à Lyon</h2>
              <p className="mt-1 text-sm text-stone-600">
                Fruits et légumes à l’unité, avec un retrait prévu une fois par semaine dans le centre-ville de Lyon. L’adresse, les horaires et la date d’ouverture seront communiqués en amont.
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="newsletter-email" className="label">Votre adresse e-mail</label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-describedby="newsletter-privacy"
                className="input"
                placeholder="vous@exemple.fr"
              />
            </div>
            <p id="newsletter-privacy" className="text-sm leading-relaxed text-stone-600">
              En validant, vous demandez à recevoir un e-mail vous informant du lancement de Mon marché futé à Lyon. Vos données ne seront utilisées que pour cette finalité.{' '}
              <Link to="/confidentialite" className="font-medium text-primary-700 underline hover:text-primary-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700">
                Lire la politique de confidentialité
              </Link>
            </p>
            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading} aria-busy={loading}>
              <Mail className="h-4 w-4" aria-hidden="true" />
              {loading ? (
                <span role="status" aria-live="polite">Envoi en cours...</span>
              ) : (
                'Être informé du lancement'
              )}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
