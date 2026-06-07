/**
 * Compile-time feature flags for the website UI.
 *
 * Flip a flag here, run `npm run build && npm run deploy`, done.
 * Backend Firebase OAuth providers stay configured — we only gate the UI.
 */

/**
 * Set to false while the Microsoft Azure App Registration is unavailable
 * (e.g. trial expired). Hides every "Continue with Microsoft" button and
 * blocks the `?method=microsoft` deep-link path. The underlying
 * `signInWithMicrosoft()` function stays in the auth context — re-enable
 * by setting this back to true.
 */
export const MICROSOFT_LOGIN_ENABLED = false
