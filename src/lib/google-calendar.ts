// Google OAuth client IDs are meant to ship in frontend code (same
// public/private split as VAPID_PUBLIC_KEY in push.ts) — only the client
// *secret* is sensitive, and that lives solely in the
// google-calendar-callback edge function's GOOGLE_CLIENT_SECRET.
//
// PLACEHOLDER — replace once the founder sends the real Client ID from
// the Google Cloud Console (OAuth consent screen + credentials, redirect
// URI set to https://hvciiodxmugcaqbjzvkn.supabase.co/functions/v1/google-calendar-callback).
export const GOOGLE_CLIENT_ID: string = "PENDING_GOOGLE_CLIENT_ID";

const REDIRECT_URI = "https://hvciiodxmugcaqbjzvkn.supabase.co/functions/v1/google-calendar-callback";
const SCOPE = "https://www.googleapis.com/auth/calendar.events";

/** `accessToken` is the user's own Supabase session token, round-tripped as `state` so the unauthenticated callback can verify who's connecting. */
export function buildGoogleAuthUrl(accessToken: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    state: accessToken,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function isGoogleCalendarConfigured(): boolean {
  return GOOGLE_CLIENT_ID !== "PENDING_GOOGLE_CLIENT_ID" && GOOGLE_CLIENT_ID.length > 0;
}
