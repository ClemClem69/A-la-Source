import { useEffect, useRef, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getAnalyticsConsent,
  subscribeToAnalyticsConsent,
  trackAnalyticsEvent,
} from './lib/analytics';

function AnalyticsTracker() {
  const location = useLocation();
  const consent = useSyncExternalStore(
    subscribeToAnalyticsConsent,
    getAnalyticsConsent,
    () => null,
  );
  const lastTrackedLocationKey = useRef<string | null>(null);

  useEffect(() => {
    if (consent !== 'accepted' || lastTrackedLocationKey.current === location.key) {
      return;
    }

    lastTrackedLocationKey.current = location.key;
    trackAnalyticsEvent('page_view', {
      page_path: location.pathname,
      page_location: `${window.location.origin}${location.pathname}`,
      page_title: document.title,
    });
  }, [consent, location]);

  return null;
}

export default AnalyticsTracker;
