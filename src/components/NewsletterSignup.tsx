import { useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function NewsletterSignup() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({ email, consent: true });

    if (insertError && insertError.code !== '23505') {
      setError('Votre inscription n’a pas pu être enregistrée. Veuillez réessayer.');
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  }

  return (
    <section className="rounded-2xl border border-primary-100 bg-primary-50 p-6 sm:p-8" aria-labelledby="newsletter-title">
      {submitted ? (
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-primary-600" aria-hidden="true" />
          <div>
            <h2 id="newsletter-title" className="font-serif text-xl font-bold text-stone-800">Inscription confirmée</h2>
            <p className="mt-1 text-sm text-stone-600">Merci ! Vous serez informée de nos actualités et du lancement du site par e-mail.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3">
            <Mail className="mt-1 h-6 w-6 shrink-0 text-primary-600" aria-hidden="true" />
            <div>
              <h2 id="newsletter-title" className="font-serif text-xl font-bold text-stone-800">Ne manquez pas le lancement du site</h2>
              <p className="mt-1 text-sm text-stone-600">Abonnez-vous à notre newsletter pour recevoir nos actualités et être avertie par e-mail dès le lancement.</p>
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
                className="input"
                placeholder="vous@exemple.fr"
              />
            </div>
            <label className="flex items-start gap-2 text-sm text-stone-600">
              <input type="checkbox" name="consent" required className="mt-1 accent-primary-600" />
              <span>J’accepte de recevoir la newsletter et un e-mail lorsque le site sera lancé.</span>
            </label>
            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              <Mail className="h-4 w-4" aria-hidden="true" />
              {loading ? 'Inscription...' : 'M’abonner'}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
