import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseStatus(): {
  configured: boolean;
  urlPresent: boolean;
  keyPresent: boolean;
  mode: 'supabase_postgres' | 'local_fallback_unconfigured';
} {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '';

  const urlPresent = Boolean(url && url.startsWith('https://'));
  const keyPresent = Boolean(key && key.length > 20);
  const configured = urlPresent && keyPresent;

  return {
    configured,
    urlPresent,
    keyPresent,
    mode: configured ? 'supabase_postgres' : 'local_fallback_unconfigured',
  };
}

export function getSupabaseServerClient(ownerIdHeader?: string): SupabaseClient | null {
  const status = getSupabaseStatus();
  if (!status.configured) {
    return null;
  }

  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)!;
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY
  )!;

  if (ownerIdHeader) {
    return createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        headers: {
          'x-atelier-owner-id': ownerIdHeader,
        },
      },
    });
  }

  if (!cachedClient) {
    cachedClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedClient;
}
