"use client";

import { useState } from "react";
import Image from "next/image";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";

export interface CommentProfile {
  display_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
}

/**
 * Discord sign-in / sign-out for the comment section.
 *
 * Lives here rather than in Header.tsx on purpose: the header is rendered by
 * the root layout, so putting auth there would mount session state on every
 * page of the site. Keeping it inside the comment section means the rest of
 * SpikeReport stays exactly as static as it was.
 */
export function CommentAuthButton({
  session,
  profile,
  loading,
}: {
  session: Session | null;
  profile: CommentProfile | null;
  loading: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setBusy(true);
    setError(null);

    const { error: signInError } = await getSupabase().auth.signInWithOAuth({
      provider: "discord",
      // Come back to the exact article being read, not the site root. This URL
      // must match an entry in the Supabase redirect allow list.
      options: { redirectTo: window.location.href },
    });

    // On success the browser navigates to Discord, so there is nothing to
    // reset; only a failure gets this far.
    if (signInError) {
      setError(signInError.message);
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    setError(null);

    const { error: signOutError } = await getSupabase().auth.signOut();
    if (signOutError) setError(signOutError.message);
    setBusy(false);
  }

  if (loading) {
    return (
      <div className="h-10 w-40 animate-pulse rounded-full bg-ink-800/60" aria-hidden="true" />
    );
  }

  if (!session) {
    return (
      <div>
        <button type="button" onClick={signIn} disabled={busy} className="btn-primary disabled:opacity-60">
          <DiscordMark />
          {busy ? "Redirecting..." : "Sign in with Discord"}
        </button>
        <p className="mt-2 text-xs text-slate-500">
          Comment as your Discord handle. SpikeReport stores your name and avatar, nothing else.
        </p>
        {error && <AuthError message={error} />}
      </div>
    );
  }

  const name = profile?.display_name ?? "your profile";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {profile?.avatar_url ? (
        <Image
          src={profile.avatar_url}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 rounded-full bg-ink-800 object-cover"
        />
      ) : (
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink-800 text-xs font-semibold text-accent"
          aria-hidden="true"
        >
          {(profile?.display_name ?? "?").slice(0, 1).toUpperCase()}
        </span>
      )}

      <span className="text-sm text-slate-300">
        Signed in as <span className="font-medium text-white">{name}</span>
        {profile?.is_admin && (
          <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent ring-1 ring-inset ring-accent/25">
            admin
          </span>
        )}
      </span>

      <button
        type="button"
        onClick={signOut}
        disabled={busy}
        className="text-sm text-slate-400 underline-offset-4 transition-colors hover:text-accent hover:underline disabled:opacity-60"
      >
        Sign out
      </button>

      {error && <AuthError message={error} />}
    </div>
  );
}

function AuthError({ message }: { message: string }) {
  // message is a Supabase error string, rendered as a text child. Never HTML.
  return (
    <p role="alert" className="mt-2 text-sm text-red-400">
      {message}
    </p>
  );
}

function DiscordMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.3 4.37A19.8 19.8 0 0 0 15.4 3c-.2.37-.44.87-.6 1.26a18.3 18.3 0 0 0-5.6 0A13 13 0 0 0 8.6 3a19.7 19.7 0 0 0-4.9 1.37C.6 9 .07 13.5.33 17.95A19.9 19.9 0 0 0 6.3 21c.4-.56.77-1.16 1.08-1.78-.6-.23-1.17-.5-1.72-.83.15-.1.29-.22.42-.33a14.2 14.2 0 0 0 12 0c.14.11.28.23.42.33-.55.33-1.12.6-1.72.83.31.62.68 1.22 1.08 1.78a19.9 19.9 0 0 0 5.98-3.05c.3-5.15-.54-9.6-3.55-13.58ZM8.3 15.23c-1.18 0-2.15-1.08-2.15-2.4 0-1.33.95-2.41 2.15-2.41 1.2 0 2.17 1.09 2.15 2.4 0 1.33-.95 2.41-2.15 2.41Zm7.4 0c-1.18 0-2.15-1.08-2.15-2.4 0-1.33.95-2.41 2.15-2.41 1.2 0 2.17 1.09 2.15 2.4 0 1.33-.95 2.41-2.15 2.41Z" />
    </svg>
  );
}
