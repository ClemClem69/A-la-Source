import { useEffect, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import {
  getAnalyticsConsent,
  setAnalyticsConsent,
  subscribeToAnalyticsConsent,
  type AnalyticsConsentChoice,
} from '../lib/analytics';

export default function AnalyticsConsentBanner() {
  const consent = useSyncExternalStore(
    subscribeToAnalyticsConsent,
    getAnalyticsConsent,
    () => null,
  );
  const [settingsOpen, setSettingsOpen] = useState(consent === null);

  useEffect(() => {
    function handleOpenSettings() {
      setSettingsOpen(true);
    }

    window.addEventListener('open-analytics-consent-settings', handleOpenSettings);
    return () => window.removeEventListener('open-analytics-consent-settings', handleOpenSettings);
  }, []);

  useEffect(() => {
    if (consent === null) setSettingsOpen(true);
  }, [consent]);

  function choose(choice: AnalyticsConsentChoice) {
    setAnalyticsConsent(choice);
    setSettingsOpen(false);
  }

  if (!settingsOpen) return null;

  return (
    <section
      role="region"
      aria-label="Choix concernant la mesure d’audience"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-stone-300 bg-white p-4 shadow-2xl sm:p-6"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-3xl">
          <h2 className="font-semibold text-stone-900">Mesure d’audience</h2>
          <p className="mt-1 text-sm leading-relaxed text-stone-700">
            Avec votre accord, Google Analytics mesure la fréquentation et les interactions avec les appels à la préinscription. Ces statistiques ne contiennent pas l’adresse e-mail saisie. Vous pouvez accepter ou refuser ; votre choix n’affecte pas le formulaire.
          </p>
          <Link
            to="/confidentialite"
            className="mt-2 inline-block text-sm font-medium text-primary-700 underline hover:text-primary-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
          >
            Consulter la politique de confidentialité
          </Link>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button type="button" className="btn-primary" onClick={() => choose('accepted')}>
            Accepter
          </button>
          <button
            type="button"
            className="rounded-lg border border-stone-400 px-4 py-2 font-medium text-stone-800 hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
            onClick={() => choose('rejected')}
          >
            Refuser
          </button>
          {consent && (
            <button
              type="button"
              className="rounded-lg px-3 py-2 text-sm text-stone-600 underline hover:text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
              onClick={() => setSettingsOpen(false)}
            >
              Fermer
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
