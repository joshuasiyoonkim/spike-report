"use client";

import { useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { useSession } from "@/lib/useSession";
import { commentErrorMessage, fetchComments, type Comment } from "@/lib/comments";
import { CommentAuthButton, type CommentProfile } from "./CommentAuthButton";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

/**
 * Comment section for one article, keyed by slug.
 *
 * The whole feature is a single client island so the article page itself
 * stays statically generated: this renders as an empty shell into the
 * prerendered HTML and fills in after hydration. That is what keeps "add an
 * article" to "drop a .md file in content/articles".
 */
export function Comments({ slug }: { slug: string }) {
  const { session, loading: sessionLoading } = useSession();
  const userId = session?.user.id ?? null;

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stored with the id it was fetched for, so signing out needs no state
  // write: userId goes null and `profile` derives to null. Keeps the effect
  // free of synchronous setState.
  const [fetched, setFetched] = useState<{
    userId: string;
    profile: CommentProfile | null;
  } | null>(null);

  const profile = fetched && fetched.userId === userId ? fetched.profile : null;

  // Bumped to refetch after a successful post. A counter rather than an
  // imperative load() because the fetch then lives in exactly one place, with
  // one cancellation guard, instead of being callable from anywhere.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    fetchComments(slug)
      .then((rows) => {
        if (!active) return;
        setComments(rows);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(commentErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug, reloadKey]);

  useEffect(() => {
    if (!userId) return;

    let active = true;

    // The profile row, not session.user.user_metadata: metadata is whatever
    // the client last wrote, while this is the sanitized row the signup
    // trigger produced. is_admin is only trustworthy from here.
    //
    // Keyed on userId, not the session object, which onAuthStateChange
    // replaces on every token refresh.
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

  const count = comments.filter((c) => c.deleted_at === null).length;

  return (
    <section
      aria-labelledby="comments-heading"
      className="mt-14 border-t border-ink-700/70 pt-8"
    >
      <h2
        id="comments-heading"
        className="font-display text-xl font-bold tracking-tight text-white"
      >
        Comments{count > 0 && <span className="ml-2 text-slate-500">{count}</span>}
      </h2>

      <CommentList
        comments={comments}
        loading={loading}
        error={error}
        currentUserId={userId}
        isAdmin={profile?.is_admin ?? false}
        onChanged={() => setReloadKey((k) => k + 1)}
      />

      <div className="mt-8 border-t border-ink-700/70 pt-6">
        <CommentAuthButton
          session={session}
          profile={profile}
          loading={sessionLoading}
        />
        {session && (
          <CommentForm slug={slug} onPosted={() => setReloadKey((k) => k + 1)} />
        )}
      </div>
    </section>
  );
}
