import { useEffect, useState } from 'react';
import { Activity, Filter, Mail, Package, ShoppingCart, Trash2, UserPlus, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDateTime } from '../../lib/utils';
import AdminBackButton from '../../components/AdminBackButton';
import { useAuth } from '../../contexts/AuthContext';

type EventFilter = 'all' | 'account' | 'producer' | 'product' | 'order';

interface AuditEvent {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string | null;
  title: string;
  details: Record<string, unknown>;
  created_at: string;
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string;
}

const filters: Array<{ value: EventFilter; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'account', label: 'Comptes' },
  { value: 'producer', label: 'Producteurs' },
  { value: 'product', label: 'Articles' },
  { value: 'order', label: 'Ventes' },
];

function getEventIcon(event: AuditEvent) {
  if (event.event_type.includes('account')) return event.event_type.includes('deleted') ? Trash2 : UserPlus;
  if (event.entity_type === 'producer') return Users;
  if (event.entity_type === 'product') return Package;
  if (event.entity_type === 'order') return ShoppingCart;
  return Activity;
}

function getEventColor(event: AuditEvent) {
  if (event.event_type.includes('deleted')) return 'bg-red-100 text-red-700';
  if (event.entity_type === 'order') return 'bg-green-100 text-green-700';
  if (event.entity_type === 'product') return 'bg-amber-100 text-amber-700';
  return 'bg-primary-100 text-primary-700';
}

function getEventDescription(event: AuditEvent) {
  const details = event.details;
  const name = typeof details.name === 'string' ? details.name : null;
  const companyName = typeof details.company_name === 'string' ? details.company_name : null;
  const email = typeof details.email === 'string' ? details.email : null;
  const total = typeof details.total === 'number' || typeof details.total === 'string' ? `${details.total} €` : null;
  const subject = name || companyName || email || total;
  return subject ? `${event.title} - ${subject}` : event.title;
}

export default function AdminEvents() {
  const { profile } = useAuth();
  const canViewSubscribers = profile?.email.toLowerCase() === 'ledclement341@gmail.com';
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [filter, setFilter] = useState<EventFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribersError, setSubscribersError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvents() {
      const [eventsResult, subscribersResult] = await Promise.all([
        supabase
          .from('audit_events')
          .select('id, event_type, entity_type, entity_id, title, details, created_at')
          .order('created_at', { ascending: false })
          .limit(250),
        canViewSubscribers
          ? supabase
              .from('newsletter_subscribers')
              .select('id, email, subscribed_at')
              .order('subscribed_at', { ascending: false })
          : Promise.resolve(null),
      ]);

      if (eventsResult.error) setError(eventsResult.error.message);
      setEvents((eventsResult.data as AuditEvent[]) || []);
      if (subscribersResult) {
        if (subscribersResult.error) setSubscribersError(subscribersResult.error.message);
        setSubscribers((subscribersResult.data as NewsletterSubscriber[]) || []);
      }
      setLoading(false);
    }

    loadEvents();
  }, [canViewSubscribers]);

  const filteredEvents = filter === 'all' ? events : events.filter((event) => event.entity_type === filter);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <AdminBackButton />
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-800">Évènements</h1>
          <p className="mt-1 text-stone-600">Suivez les activités importantes de la plateforme.</p>
        </div>
        <Activity className="h-8 w-8 text-primary-600" />
      </div>

      {error && <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">Impossible de charger les évènements : {error}</p>}

      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="h-4 w-4 shrink-0 text-stone-500" />
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${filter === item.value ? 'bg-primary-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <div className="card p-10 text-center text-stone-500">Aucun évènement enregistré.</div>
      ) : (
        <div className="card divide-y divide-stone-100 overflow-hidden">
          {filteredEvents.map((event) => {
            const Icon = getEventIcon(event);
            return (
              <div key={event.id} className="flex items-start gap-4 p-4 sm:p-5">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${getEventColor(event)}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-stone-800">{getEventDescription(event)}</p>
                  <p className="mt-1 text-xs text-stone-500">{formatDateTime(event.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {canViewSubscribers && (
        <section className="mt-10" aria-labelledby="newsletter-subscribers-title">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 id="newsletter-subscribers-title" className="font-serif text-2xl font-bold text-stone-800">Inscriptions à la newsletter</h2>
              <p className="mt-1 text-sm text-stone-600">{subscribers.length} inscription{subscribers.length > 1 ? 's' : ''}</p>
            </div>
            <Mail className="h-7 w-7 text-primary-600" aria-hidden="true" />
          </div>

          {subscribersError && (
            <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              Impossible de charger les inscriptions : {subscribersError}
            </p>
          )}

          {subscribers.length === 0 ? (
            <div className="card p-8 text-center text-stone-500">Aucune inscription à la newsletter pour le moment.</div>
          ) : (
            <div className="card divide-y divide-stone-100 overflow-hidden">
              {subscribers.map((subscriber) => (
                <div key={subscriber.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <p className="font-medium text-stone-800">{subscriber.email}</p>
                  <p className="text-xs text-stone-500">Inscription le {formatDateTime(subscriber.subscribed_at)}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
