"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "./supabase";

/**
 * Current Supabase session, for client islands.
 *
 * Deliberately a hook rather than a React context provider. The root layout is
 * a server component that reads the filesystem, so it cannot host a provider,
 * and every caller shares the one module-singleton client from ./supabase --
 * which means they also share its auth state and its onAuthStateChange
 * broadcasts. Two islands using this hook stay in sync without any shared
 * React tree above them.
 *
 * `loading` starts false when Supabase is unconfigured, so UI that depends on
 * it does not hang in a spinner on a site built without env vars.
 */
export function useSession(): { session: Session | null; loading: boolean } {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const supabase = getSupabase();
    let active = true;

    // getSession() reads the persisted session and, on return from the Discord
    // redirect, resolves after supabase-js has exchanged the PKCE code.
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}
