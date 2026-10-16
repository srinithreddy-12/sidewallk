export interface SupabasePublicConfig {
  url: string;
  publishableKey: string;
}

function isSecureOrLocal(url: URL): boolean {
  return url.protocol === "https:" || ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
}

export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url && !publishableKey) return null;
  if (!url || !publishableKey) {
    throw new Error("Both public Supabase environment variables must be configured together.");
  }

  const parsedUrl = new URL(url);
  if (!isSecureOrLocal(parsedUrl)) {
    throw new Error("The Supabase URL must use HTTPS outside local development.");
  }

  return { url: parsedUrl.toString(), publishableKey };
}

export function getSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  const url = new URL(configured);
  if (!isSecureOrLocal(url)) {
    throw new Error("NEXT_PUBLIC_SITE_URL must use HTTPS outside local development.");
  }
  return url;
}
