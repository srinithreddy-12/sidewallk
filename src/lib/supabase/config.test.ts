import { afterEach, describe, expect, it, vi } from "vitest";
import { getSiteUrl, getSupabasePublicConfig } from "./config";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Supabase public configuration", () => {
  it("keeps the offline demo available when both credentials are absent", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    expect(getSupabasePublicConfig()).toBeNull();
  });

  it("rejects partial configuration instead of failing later", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    expect(() => getSupabasePublicConfig()).toThrow(/configured together/);
  });

  it("requires TLS outside loopback development", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://project.example");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-key");
    expect(() => getSupabasePublicConfig()).toThrow(/HTTPS/);
  });

  it("accepts Supabase local development on loopback", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-key");
    expect(getSupabasePublicConfig()?.url).toBe("http://127.0.0.1:54321/");
  });

  it("defaults the site URL to local development", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(getSiteUrl().toString()).toBe("http://localhost:3000/");
  });
});
