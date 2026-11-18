"use client";

import { useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { useSession } from "@/lib/useSession";
import { CommentAuthButton, type CommentProfile } from "./CommentAuthButton";

/**
 * Comment section for one article, keyed by slug.
 *
 * The whole feature is a single client island so the article page itself stays
 * statically generated: this renders as an empty shell into the prerendered
 * HTML and fills in after hydration.
 *
 * Phase 3 scope: Discord sign-in and the signed-in identity only. The thread
 * and the composer arrive in Phase 5, which is also when `slug` starts being
 * read.
 */
export function Comments({ slug }: { slug: string }) {
  const { session, loading } = useSession();
  const userId = session?.user.id ?? null;

  // Stored with the id it was fetched for, so signing out needs no state write
  // at all: userId goes null and `profile` derives to null. That keeps the
  // effect free of synchronous setState, which React warns about because it
  // causes cascading renders.
  const [fetched, setFetched] = useState<{
    userId: string;
    profile: CommentProfile | null;
  } | null>(null);

  const profile = fetched && fetched.userId === userId ? fetched.profile : null;

  useEffect(() => {
    if (!userId) return;

    let active = true;

    // Reading the profile row rather than session.user.user_metadata on
    // purpose: user_metadata is whatever the client last wrote, while this is
    // the sanitized row the signup trigger produced, with avatar_url already
    // constrained to the Discord CDN. is_admin is only trustworthy from here.
    //
    // Keyed on userId, not the session object: onAuthStateChange emits a new
    // session on every token refresh, which would otherwise refetch the
    // profile roughly hourly for no reason.
    getSupabase()
      .from("profiles")
      .select("display_name, avatar_url, is_admin")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setFetched({ userId, profile: data as CommentProfile | null });
      });

    return () => {
      active = false;
    };
  }, [userId]);

  // Without env vars there is nothing to talk to; render nothing rather than
  // an error, so the site still builds and serves normally.
  if (!isSupabaseConfigured) return null;

  return (
    <section
      aria-labelledby="comments-heading"
      data-article-slug={slug}
      className="mt-14 border-t border-ink-700/70 pt-8"
    >
      <h2 id="comments-heading" className="font-display text-xl font-bold tracking-tight text-white">
        Comments
      </h2>

      <div className="mt-5">
        <CommentAuthButton session={session} profile={profile} loading={loading} />
      </div>
    </section>
  );
}
