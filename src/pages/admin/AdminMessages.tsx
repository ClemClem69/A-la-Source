import { useEffect, useState } from 'react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface ContactMessage {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  message: string;
  reply: string | null;
  replied_at: string | null;
  created_at: string;
}

export default function AdminMessages() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedMessage = messages.find((message) => message.id === selectedId) || null;

  useEffect(() => {
    if (profile?.role !== 'admin') return;

    async function loadMessages() {
      const { data, error: loadError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (loadError) setError(loadError.message);
      setMessages((data as ContactMessage[]) || []);
      setLoading(false);
    }

    loadMessages();
  }, [profile]);

  function selectMessage(message: ContactMessage) {
    setSelectedId(message.id);
    setReply(message.reply || '');
    setError(null);
  }

  async function sendReply() {
    if (!selectedMessage || !reply.trim()) return;
    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('contact_messages')
      .update({ reply: reply.trim(), replied_at: new Date().toISOString() })
      .eq('id', selectedMessage.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-contact-reply', {
      body: {
        recipientEmail: selectedMessage.sender_email,
        recipientName: selectedMessage.sender_name,
        subject: selectedMessage.subject,
        reply: reply.trim(),
      },
    });

    if (emailError) {
      let detail = emailError.message || 'vérifiez le déploiement de la fonction email.';
      const errorContext = 'context' in emailError ? emailError.context : null;
      if (errorContext instanceof Response) {
        const responseBody = await errorContext.json().catch(() => null) as { error?: string } | null;
        if (responseBody?.error) detail = responseBody.error;
      }
      setError(`La réponse est enregistrée, mais l’email n’a pas pu être envoyé : ${detail}`);
    } else if (emailData?.error) {
      setError(`La réponse est enregistrée, mais l’email n’a pas pu être envoyé : ${emailData.error}`);
    }

    setMessages((current) => current.map((message) => (
      message.id === selectedMessage.id
        ? { ...message, reply: reply.trim(), replied_at: new Date().toISOString() }
        : message
    )));
    setSaving(false);
  }

  if (profile?.role !== 'admin') {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-stone-500">Accès non autorisé.</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-stone-800">Messagerie</h1>
        <p className="text-stone-600 mt-1">Consultez les messages reçus via la page Contactez-nous et répondez directement.</p>
      </div>

      {error && <p className="mb-6 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : messages.length === 0 ? (
        <div className="card p-10 text-center text-stone-500">Aucun message reçu.</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
          <div className="card divide-y divide-stone-100 overflow-hidden">
            {messages.map((message) => (
              <button
                key={message.id}
                type="button"
                onClick={() => selectMessage(message)}
                className={`w-full text-left p-4 hover:bg-stone-50 ${selectedId === message.id ? 'bg-primary-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-800 truncate">{message.subject}</p>
                    <p className="text-sm text-stone-600 truncate">{message.sender_name} · {message.sender_email}</p>
                  </div>
                  {message.reply ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" /> : <Mail className="h-4 w-4 shrink-0 text-amber-600" />}
                </div>
                <p className="text-xs text-stone-400 mt-2">{new Date(message.created_at).toLocaleString('fr-FR')}</p>
              </button>
            ))}
          </div>

          <div className="card p-6">
            {selectedMessage ? (
              <>
                <p className="text-sm text-stone-500">Message de {selectedMessage.sender_name} ({selectedMessage.sender_email})</p>
                <h2 className="font-semibold text-xl text-stone-800 mt-1">{selectedMessage.subject}</h2>
                <p className="whitespace-pre-wrap text-stone-700 mt-5">{selectedMessage.message}</p>
                <div className="border-t border-stone-200 mt-6 pt-6">
                  <label className="label" htmlFor="reply">Votre réponse</label>
                  <textarea id="reply" value={reply} onChange={(event) => setReply(event.target.value)} className="input min-h-32 resize-y" placeholder="Écrivez votre réponse..." />
                  <button type="button" onClick={sendReply} disabled={saving || !reply.trim()} className="btn-primary mt-3">
                    <Send className="h-4 w-4" /> {saving ? 'Envoi...' : 'Répondre par email'}
                  </button>
                </div>
              </>
            ) : (
              <div className="h-full min-h-56 flex items-center justify-center text-stone-500">Sélectionnez un message.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
