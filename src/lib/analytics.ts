export type AnalyticsConsentChoice = 'accepted' | 'rejected';

type AnalyticsEventName =
  | 'page_view'
  | 'preregistration_cta_click'
  | 'preregistration_submit_success';

type AnalyticsEventParameters = Record<string, string>;

declare global {
  interface Window {
    dataLayer?: IArguments[];
    gtag?: (...args: unknown[]) => void;
  }
}

const consentStorageKey = 'mmf-analytics-consent';
const measurementId = 'G-9X06PB2MDB';
const consentSubscribers = new Set<() => void>();
let analyticsInitialized = false;

function readStoredChoice(): AnalyticsConsentChoice | null {
  try {
    const storedChoice = window.localStorage.getItem(consentStorageKey);
    return storedChoice === 'accepted' || storedChoice === 'rejected' ? storedChoice : null;
  } catch {
    return null;
  }
}

let consentChoice: AnalyticsConsentChoice | null =
  typeof window === 'undefined' ? null : readStoredChoice();

export function getAnalyticsConsent(): AnalyticsConsentChoice | null {
  return consentChoice;
}

export function subscribeToAnalyticsConsent(callback: () => void): () => void {
  consentSubscribers.add(callback);
  return () => consentSubscribers.delete(callback);
}

function updateGoogleConsent(choice: AnalyticsConsentChoice): void {
  window.gtag?.('consent', 'update', {
    analytics_storage: choice === 'accepted' ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
}

function loadGoogleAnalytics(): void {
  if (analyticsInitialized) return;
  analyticsInitialized = true;

  window.gtag?.('js', new Date());
  window.gtag?.('config', measurementId, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

export function setAnalyticsConsent(choice: AnalyticsConsentChoice): void {
  consentChoice = choice;
  try {
    window.localStorage.setItem(consentStorageKey, choice);
  } catch {
    // Keep this choice for the current page view if browser storage is unavailable.
  }

  updateGoogleConsent(choice);
  if (choice === 'accepted') loadGoogleAnalytics();

  consentSubscribers.forEach((subscriber) => subscriber());
}

export function trackAnalyticsEvent(
  eventName: AnalyticsEventName,
  parameters: AnalyticsEventParameters = {},
): void {
  if (consentChoice !== 'accepted') return;

  loadGoogleAnalytics();
  window.gtag?.('event', eventName, parameters);
}

export function openAnalyticsConsentSettings(): void {
  window.dispatchEvent(new Event('open-analytics-consent-settings'));
}

if (consentChoice) {
  updateGoogleConsent(consentChoice);
  if (consentChoice === 'accepted') loadGoogleAnalytics();
}
