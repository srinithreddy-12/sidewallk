import type { AllowedLinkProtocol } from "./types";

const ALLOWED_PROTOCOLS: AllowedLinkProtocol[] = ["http:", "https:", "mailto:"];

/**
 * True only for http:, https: and mailto: URLs that actually parse. Everything
 * else — javascript:, data:, unparseable strings — is rejected so it never
 * reaches an href, on first render or after loading an old save.
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_PROTOCOLS.includes(parsed.protocol as AllowedLinkProtocol);
  } catch {
    return false;
  }
}
