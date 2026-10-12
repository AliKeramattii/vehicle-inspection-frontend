/** Commercial permission is unresolved: there is deliberately no production enable switch. */
export function vehiclePreviewEnabled(environment: string | undefined, flag: string | undefined) {
  return environment === "development" && flag === "1";
}
export function isLoopbackHost(host: string) {
  return ["localhost", "127.0.0.1", "[::1]", "::1"].includes(host.toLowerCase());
}
export function isLoopbackRequestHost(host: string) {
  if (/[/\\?#@]/.test(host)) return false;
  try { return isLoopbackHost(new URL(`http://${host}`).hostname); }
  catch { return false; }
}
