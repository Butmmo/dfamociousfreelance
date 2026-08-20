// Google's OAuth redirect lands here with ?code=...&state=<the user's own
// Supabase access token>. Passing the access token as `state` lets this
// endpoint stay unauthenticated (Google can't attach the user's session
// cookie) while still proving which DBI Citadel account is connecting —
// the token is verified via supabase.auth.getUser() before anything is
// written, so a forged state can't attach tokens to someone else's
// profile. Needs two secrets set once in the project's edge function
// secrets: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (from a Google Cloud
// project with the Calendar API enabled and this function's URL
// registered as an authorized redirect URI).

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function page(title: string, body: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
    <style>body{font-family:Inter,system-ui,sans-serif;background:#F8F5EE;color:#201A16;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px}
    .card{max-width:420px;text-align:center;background:#fff;border:1px solid #EDE7DA;border-radius:16px;padding:32px}
    h1{font-size:20px;margin:0 0 8px}p{color:#6E6459;font-size:14px}</style></head>
    <body><div class="card"><h1>${title}</h1><p>${body}</p></div></body></html>`;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  if (errorParam || !code || !state) {
    return new Response(page("Not connected", "Google Calendar wasn't connected — you can close this tab and try again from your Profile page."), {
      headers: { "Content-Type": "text/html" },
    });
  }

  const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: userRes, error: userErr } = await anon.auth.getUser(state);
  if (userErr || !userRes?.user) {
    return new Response(page("Sign-in expired", "Your session expired mid-connection — sign back in and try connecting Google Calendar again."), {
      headers: { "Content-Type": "text/html" },
    });
  }
  const userId = userRes.user.id;

  const CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
  const CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return new Response(page("Not configured", "Google Calendar isn't set up on this server yet — ask the founder to add GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET."), {
      headers: { "Content-Type": "text/html" },
    });
  }

  const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/google-calendar-callback`;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
      redirect_uri: redirectUri, grant_type: "authorization_code",
    }),
  });
  const tokenJson: any = await tokenRes.json();
  if (!tokenRes.ok || !tokenJson.refresh_token) {
    return new Response(page("Connection failed", tokenJson.error_description ?? "Google didn't return a refresh token — try disconnecting any prior grant in your Google Account's app permissions, then connect again so Google issues a fresh one."), {
      headers: { "Content-Type": "text/html" },
    });
  }

  const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  await supabaseAdmin.from("profiles").update({
    google_refresh_token: tokenJson.refresh_token,
    google_calendar_connected: true,
  }).eq("id", userId);

  // Seed the calendar immediately rather than waiting for the nightly sync.
  fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/google-calendar-sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  }).catch(() => {});

  return new Response(page("Google Calendar connected", "Your DBI Citadel dates — Affirmation/Evaluation checkpoints, the TPE weekly requirement, and your 45-Day Plan — will start appearing on your Google Calendar. You can close this tab."), {
    headers: { "Content-Type": "text/html" },
  });
});
