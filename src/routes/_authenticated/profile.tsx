import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { PATH_MAP } from "@/lib/paths";
import { toast } from "sonner";
import { usePushSubscription } from "@/lib/push";
import { buildGoogleAuthUrl, isGoogleCalendarConfigured } from "@/lib/google-calendar";
import {
  User, Camera, Loader2, Save, Mail, Lock, Award, Calendar as CalIcon, Compass, Bell, BellOff, Link2, Unlink,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — DBI Citadel" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, role } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [niche, setNiche] = useState("");
  const [positioning, setPositioning] = useState("");
  const [bio, setBio] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const push = usePushSubscription();
  const [savingMessagePush, setSavingMessagePush] = useState(false);
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [disconnectingGoogle, setDisconnectingGoogle] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    setProfile(data);
    setFullName(data?.full_name ?? "");
    setCountry(data?.country ?? "");
    setCity(data?.city ?? "");
    setNiche(data?.niche ?? "");
    setPositioning(data?.positioning_statement ?? "");
    setBio(data?.bio ?? "");
    setNewEmail(data?.email ?? user.email ?? "");
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  const onAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB."); return; }

    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) {
      setUploading(false);
      toast.error(upErr.message);
      return;
    }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: pub.publicUrl } as never).eq("id", user.id);
    setUploading(false);
    if (dbErr) { toast.error(dbErr.message); return; }
    setProfile((p: any) => ({ ...p, avatar_url: pub.publicUrl }));
    toast.success("Profile picture updated.");
  };

  const saveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingDetails(true);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName.trim() || null,
      country: country.trim() || null,
      city: city.trim() || null,
      niche: niche.trim() || null,
      positioning_statement: positioning.trim() || null,
      bio: bio.trim() || null,
    } as never).eq("id", user.id);
    setSavingDetails(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Details saved.");
    load();
  };

  const saveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newEmail.trim() || newEmail.trim() === (profile?.email ?? user.email)) return;
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    setSavingEmail(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Confirmation link sent to your new email. Your login updates once you confirm it.");
  };

  const connectGoogleCalendar = async () => {
    setConnectingGoogle(true);
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    setConnectingGoogle(false);
    if (!accessToken) { toast.error("Sign-in session not found — refresh and try again."); return; }
    window.location.href = buildGoogleAuthUrl(accessToken);
  };

  const disconnectGoogleCalendar = async () => {
    setDisconnectingGoogle(true);
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    const { error } = await supabase.functions.invoke("google-calendar-disconnect", {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
    setDisconnectingGoogle(false);
    if (error) { toast.error(error.message); return; }
    setProfile((p: any) => ({ ...p, google_calendar_connected: false }));
    toast.success("Google Calendar disconnected.");
  };

  const toggleMessagePush = async (enabled: boolean) => {
    if (!user) return;
    setSavingMessagePush(true);
    const { error } = await supabase.from("profiles").update({ push_messages_enabled: enabled } as never).eq("id", user.id);
    setSavingMessagePush(false);
    if (error) { toast.error(error.message); return; }
    setProfile((p: any) => ({ ...p, push_messages_enabled: enabled }));
    toast.success(enabled ? "Message notifications enabled." : "Message notifications silenced.");
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match."); return; }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated.");
    setNewPassword(""); setConfirmPassword("");
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading profile…</div>;

  const path = profile?.path_key ? PATH_MAP[profile.path_key as keyof typeof PATH_MAP] : null;

  return (
    <div className="space-y-8 max-w-3xl">
      <header>
        <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-2">
          <User className="h-3.5 w-3.5" /> Your account
        </div>
        <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold">Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">Update your details, picture, email, and password.</p>
      </header>

      {/* AVATAR + READ-ONLY SUMMARY */}
      <section className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-gold bg-muted grid place-items-center group"
            title="Change profile picture"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <User className="h-10 w-10 text-muted-foreground" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
              {uploading ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarPick} />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="font-display text-xl font-bold">{profile?.full_name ?? "Unnamed"}</div>
          <div className="text-sm text-muted-foreground">{profile?.email ?? user?.email}</div>
          <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs">
            <span className="rounded-full bg-gold/15 px-3 py-1 font-semibold text-gold-deep tracking-widest">{profile?.rank ?? "recruit"}</span>
            <span className="text-muted-foreground">{profile?.xp ?? 0} XP</span>
            <span className="rounded-full bg-muted px-3 py-1 tracking-widest">{role === "admin" ? "Council Admin" : "Beneficiary"}</span>
            {profile?.vetted_dse_certified_at && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 font-semibold text-emerald-600">
                <Award className="h-3 w-3" /> V. DsE.
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-muted-foreground">
            {path && (
              <span className="inline-flex items-center gap-1"><Compass className="h-3.5 w-3.5" /> {path.name}</span>
            )}
            {profile?.start_date && (
              <span className="inline-flex items-center gap-1"><CalIcon className="h-3.5 w-3.5" /> Started {new Date(profile.start_date).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </section>

      {/* DETAILS */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-bold">Details</h2>
        <form onSubmit={saveDetails} className="mt-4 space-y-4">
          <Field label="Full name" value={fullName} onChange={setFullName} placeholder="Your name" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Country" value={country} onChange={setCountry} placeholder="e.g. Nigeria" />
            <Field label="City" value={city} onChange={setCity} placeholder="e.g. Lagos" />
          </div>
          <Field label="Niche / specialization" value={niche} onChange={setNiche} placeholder="What you focus on inside your path" />
          <TextArea label="Positioning statement" value={positioning} onChange={setPositioning} placeholder="One or two sentences on who you help and how" rows={2} />
          <TextArea label="Bio" value={bio} onChange={setBio} placeholder="A short bio for your profile" rows={3} />
          <div className="flex justify-end">
            <button type="submit" disabled={savingDetails} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {savingDetails ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save details
            </button>
          </div>
        </form>
      </section>

      {/* NOTIFICATIONS */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-bold flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Push access is required to use the Citadel — escalations, mentorship, BPS, DFY and council updates
          always reach every subscribed device. Messages are the one exception: silence them here without
          losing the underlying subscription.
        </p>

        {push.supported && !push.subscribed && (
          <div className="mt-4 rounded-lg border border-gold/40 bg-gold/5 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <span className="text-sm text-gold-deep">
              {push.permission === "denied"
                ? "Notifications are blocked in your browser's site settings — enable them there, then reload."
                : "This device isn't subscribed yet."}
            </span>
            {push.permission !== "denied" && (
              <button
                onClick={push.subscribe}
                disabled={push.loading}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {push.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bell className="h-3.5 w-3.5" />} Enable on this device
              </button>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
          <div>
            <div className="text-sm font-semibold">Message notifications</div>
            <div className="text-xs text-muted-foreground">Direct, cohort and group chat pings — the one category you can silence.</div>
          </div>
          <button
            type="button"
            onClick={() => toggleMessagePush(!(profile?.push_messages_enabled ?? true))}
            disabled={savingMessagePush}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
              (profile?.push_messages_enabled ?? true)
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {savingMessagePush ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (profile?.push_messages_enabled ?? true) ? (
              <Bell className="h-3.5 w-3.5" />
            ) : (
              <BellOff className="h-3.5 w-3.5" />
            )}
            {(profile?.push_messages_enabled ?? true) ? "On" : "Off"}
          </button>
        </div>

        <div className="mt-3 text-[11px] text-muted-foreground">
          Every reminder — the daily tracker check-ins, checkpoint due dates, weekly reports — fires on{" "}
          <strong className="text-foreground">your own local time</strong> ({profile?.timezone ?? "detecting…"}),
          detected automatically from this device and kept in sync every time you sign in.
        </div>
      </section>

      {/* GOOGLE CALENDAR */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-bold flex items-center gap-2"><CalIcon className="h-5 w-5" /> Google Calendar</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Syncs your Affirmation/Evaluation Goal due dates and the TPE weekly requirement straight onto your own
          Google Calendar, kept current every night.
        </p>
        {!isGoogleCalendarConfigured() ? (
          <p className="mt-4 rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            Not set up yet on this server — ask the founder to finish the Google Cloud OAuth setup.
          </p>
        ) : profile?.google_calendar_connected ? (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3">
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Connected</span>
            <button
              onClick={disconnectGoogleCalendar}
              disabled={disconnectingGoogle}
              className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-xs font-semibold hover:bg-muted disabled:opacity-60"
            >
              {disconnectingGoogle ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlink className="h-3.5 w-3.5" />} Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={connectGoogleCalendar}
            disabled={connectingGoogle}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {connectingGoogle ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />} Connect Google Calendar
          </button>
        )}
      </section>

      {/* EMAIL */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-bold flex items-center gap-2"><Mail className="h-5 w-5" /> Email</h2>
        <p className="mt-1 text-sm text-muted-foreground">Changing this sends a confirmation link to the new address — your login updates once you confirm it.</p>
        <form onSubmit={saveEmail} className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <button type="submit" disabled={savingEmail} className="inline-flex items-center justify-center gap-2 rounded-md border border-gold px-5 py-2.5 text-sm font-semibold text-gold-deep hover:bg-gold/10 disabled:opacity-60">
            {savingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update email"}
          </button>
        </form>
      </section>

      {/* PASSWORD */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-bold flex items-center gap-2"><Lock className="h-5 w-5" /> Password</h2>
        <form onSubmit={savePassword} className="mt-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingPassword} className="inline-flex items-center gap-2 rounded-md border border-gold px-5 py-2.5 text-sm font-semibold text-gold-deep hover:bg-gold/10 disabled:opacity-60">
              {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (s: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-widest text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
    </label>
  );
}
function TextArea({ label, value, onChange, placeholder, rows }: { label: string; value: string; onChange: (s: string) => void; placeholder?: string; rows?: number }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-widest text-muted-foreground">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows ?? 3}
        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
    </label>
  );
}
