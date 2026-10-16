/** Accept only an application-relative path, never a host-relative or absolute URL. */
export function safeAuthNextPath(value: string | null): string {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}
