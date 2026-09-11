import { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const { error: insertError } = await supabase.from('contact_messages').insert({
      sender_name: formData.get('name'),
      sender_email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    });

    if (insertError) {
      setError('Votre message n’a pas pu être envoyé. Veuillez réessayer.');
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-stone-800 mb-2">Message envoyé</h1>
        <p className="text-stone-500">Merci pour votre message. Nous reviendrons vers vous dès que possible.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-serif text-3xl font-bold text-stone-800 mb-2">Contactez-nous</h1>
      <p className="text-stone-500 mb-8">Une question ou besoin d'aide ? Écrivez-nous via ce formulaire.</p>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label htmlFor="name" className="label">Nom</label>
          <input id="name" name="name" type="text" required className="input" />
        </div>
        <div>
          <label htmlFor="email" className="label">Adresse email</label>
          <input id="email" name="email" type="email" required className="input" />
        </div>
        <div>
          <label htmlFor="subject" className="label">Sujet</label>
          <input id="subject" name="subject" type="text" required className="input" />
        </div>
        <div>
          <label htmlFor="message" className="label">Message</label>
          <textarea id="message" name="message" required className="input min-h-36 resize-y" />
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <button type="submit" className="btn-primary inline-flex items-center gap-2">
          <Send className="h-4 w-4" />
          {loading ? 'Envoi...' : 'Envoyer le message'}
        </button>
      </form>
    </div>
  );
}
