const AUTH_REDIRECT_ORIGIN = "https://sidewallk.invalid";
const UNSAFE_PATH_CHARACTERS = /[\\\u0000-\u001f\u007f]|%(?:0[0-9a-f]|1[0-9a-f]|7f|5c)/i;

/** Accept only a same-origin application path, never a host-relative or absolute URL. */
export function safeAuthNextPath(value: string | null): string {
  if (!value?.startsWith("/") || value.startsWith("//") || UNSAFE_PATH_CHARACTERS.test(value)) return "/";

  try {
    const parsed = new URL(value, AUTH_REDIRECT_ORIGIN);
    if (parsed.origin !== AUTH_REDIRECT_ORIGIN) return "/";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/";
  }
}
