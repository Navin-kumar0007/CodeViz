// Thin, provider-agnostic analytics + error monitoring.
// No-ops unless the relevant env keys are set, so local/dev runs stay clean:
//   VITE_POSTHOG_KEY   (+ optional VITE_POSTHOG_HOST) → product analytics
//   VITE_SENTRY_DSN                                   → error monitoring
//
// Usage:  import { track } from './utils/analytics';  track('code_run', { language });

let posthog = null;
let sentry = null;

export async function initTelemetry() {
  const phKey = import.meta.env.VITE_POSTHOG_KEY;
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

  if (phKey && !posthog) {
    try {
      const mod = await import('posthog-js');
      posthog = mod.default;
      posthog.init(phKey, {
        api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
        capture_pageview: true,
        person_profiles: 'identified_only',
      });
    } catch (e) { console.warn('PostHog init skipped:', e.message); }
  }

  if (sentryDsn && !sentry) {
    try {
      sentry = await import('@sentry/react');
      sentry.init({
        dsn: sentryDsn,
        environment: import.meta.env.MODE,
        tracesSampleRate: 0.1,
      });
    } catch (e) { console.warn('Sentry init skipped:', e.message); }
  }
}

/** Track a product event. Safe to call anywhere; no-op without a key. */
export function track(event, props = {}) {
  try { if (posthog) posthog.capture(event, props); } catch { /* ignore */ }
}

/** Associate events with a user after login. */
export function identify(userId, traits = {}) {
  try { if (posthog) posthog.identify(String(userId), traits); } catch { /* ignore */ }
}

/** Clear identity on logout. */
export function resetIdentity() {
  try { if (posthog) posthog.reset(); } catch { /* ignore */ }
}

/** Report a handled error. */
export function captureError(err, context) {
  try { if (sentry) sentry.captureException(err, context ? { extra: context } : undefined); } catch { /* ignore */ }
}
