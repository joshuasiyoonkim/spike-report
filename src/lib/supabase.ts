/**
 * Browser-only Supabase client.
 *
 * Deliberately a lazy module singleton rather than a React provider: the root
 * layout is a server component that reads the filesystem, so it cannot host a
 * provider, and every client island that calls getSupabase() shares this one
 * instance and therefore one auth state. That sharing is what makes a provider
 * unnecessary.
 *
 * Lazy because client components are also rendered on the server during the
 * static prerender. Creating the client at module load would run it at build
 * time; creating it on first call keeps it in the browser where it belongs.
 *
 * Only ever import this from a "use client" module.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * False when the env vars are absent, so comment UI can degrade quietly
 * instead of failing the build. NEXT_PUBLIC_* values are inlined at build
 * time, so this is effectively a build-time constant.
 */
export const isSupabaseConfigured = Boolean(url && publishableKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!url || !publishableKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local (see .env.example).",
    );
  }

  if (!client) {
    client = createClient(url, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Completes the Discord OAuth redirect in the browser, which is why
        // this app needs no /auth/callback route and articles stay static.
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    });
  }

  return client;
}
