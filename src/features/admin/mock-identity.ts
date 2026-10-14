import type { AdminRole } from "./model";
const key = "inspection-operations-mock-role";
export function readMockRole(): AdminRole | null {
  if (typeof window === "undefined") return null;
  try { const role = sessionStorage.getItem(key); if (role === "reviewer" || role === "viewer" || role === "template-editor") return role; } catch {}
  return "platform-admin";
}
export function persistMockRole(role: AdminRole) {
  try { sessionStorage.setItem(key, role); } catch {}
  window.dispatchEvent(new Event("operations-identity-change"));
}
export function subscribeMockRole(callback: () => void) {
  window.addEventListener("operations-identity-change", callback); window.addEventListener("storage", callback);
  return () => { window.removeEventListener("operations-identity-change", callback); window.removeEventListener("storage", callback); };
}
