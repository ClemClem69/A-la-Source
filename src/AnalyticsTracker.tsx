import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag?: (
      command: 'event',
      eventName: 'page_view',
      eventParams: {
        page_path: string;
        page_location: string;
        page_title: string;
      },
    ) => void;
  }
}

function AnalyticsTracker() {
  const location = useLocation();
  const lastTrackedLocationKey = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window.gtag !== 'function' || lastTrackedLocationKey.current === location.key) {
      return;
    }

    lastTrackedLocationKey.current = location.key;
    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location]);

  return null;
}

export default AnalyticsTracker;
