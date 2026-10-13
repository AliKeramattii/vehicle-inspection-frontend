import { createServer } from "node:http";

export function assertDevelopment() {
  if (process.env.NODE_ENV === "production") throw new Error("Development Neshan tools cannot run in production.");
}
export function localAccess(request, response, port, origins) {
  const host = request.headers.host;
  if (![`127.0.0.1:${port}`, `localhost:${port}`].includes(host)) {
    response.writeHead(403, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    response.end(JSON.stringify({ error: { code: "host-denied", message: "Only loopback hosts are allowed." } })); return false;
  }
  const origin = request.headers.origin;
  if ((origin && !origins.includes(origin)) || (!origin && request.headers["sec-fetch-site"] === "cross-site")) {
    response.writeHead(403, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    response.end(JSON.stringify({ error: { code: "origin-denied", message: "Development origin is not allowed." } })); return false;
  }
  if (origin) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Vary", "Origin");
  }
  return true;
}
export function createReverseServer({ key, port = 8787, origins = ["http://localhost:3114"], fetcher = fetch, timeoutMs = 8000, limit = 30, now = Date.now, report = () => {} }) {
  assertDevelopment();
  if (!key || /[\r\n]/.test(key)) throw new Error("Configure NESHAN_SERVICE_KEY in the ignored local environment file.");
  let windowStart = now(), count = 0, active = 0;
  const server = createServer(async (request, response) => {
    if (!localAccess(request, response, server.address()?.port ?? port, origins)) return;
    const json = (status, body, headers = {}) => {
      if (response.destroyed) return;
      response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers });
      response.end(JSON.stringify(body));
    };
    const fail = (status, code, message, headers) => json(status, { error: { code, message } }, headers);
    let url;
    try { url = new URL(request.url, "http://localhost"); }
    catch { return fail(400, "invalid-request", "Invalid request."); }
    if (url.pathname !== "/api/maps/reverse") return fail(404, "not-found", "Not found.");
    if (request.method === "OPTIONS") {
      response.writeHead(204, { "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Accept", "Access-Control-Max-Age": "60" }); response.end(); return;
    }
    if (request.method !== "GET") return fail(405, "method-not-allowed", "Only GET is supported.", { Allow: "GET, OPTIONS" });
    const lat = url.searchParams.get("lat"), lng = url.searchParams.get("lng");
    const number = /^-?(?:\d+(?:\.\d*)?|\.\d+)$/;
    if (!lat || !lng || !number.test(lat) || !number.test(lng) || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng)) ||
        Math.abs(Number(lat)) > 90 || Math.abs(Number(lng)) > 180 ||
        url.searchParams.getAll("lat").length !== 1 || url.searchParams.getAll("lng").length !== 1 || [...url.searchParams.keys()].some(k => !["lat", "lng"].includes(k))) {
      return fail(400, "invalid-coordinates", "مختصات معتبر نیست.");
    }
    if (now() - windowStart >= 60000) { windowStart = now(); count = 0; }
    if (++count > limit || active >= 2) return fail(429, "rate-limited", "کمی صبر کنید و دوباره تلاش کنید.", { "Retry-After": "60" });
    active++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const abandoned = () => { if (!response.writableEnded) controller.abort(); };
    response.once("close", abandoned);
    try {
      const upstream = new URL("https://api.neshan.org/v5/reverse");
      upstream.searchParams.set("lat", lat); upstream.searchParams.set("lng", lng);
      const result = await fetcher(upstream, { headers: { "Api-Key": key, Accept: "application/json" }, signal: controller.signal, redirect: "error" });
      report({ upstreamStatus: result.status }); // Status only: no key, URL, coordinate or provider body.
      if (!result.ok) {
        await result.body?.cancel();
        if ([429, 481, 482].includes(result.status)) return fail(429, "provider-rate-limited", "محدودیت سرویس آدرس؛ کمی بعد دوباره تلاش کنید.", { "Retry-After": "60" });
        if ([401, 403, 480, 483, 484, 485].includes(result.status)) return fail(502, "provider-authorization", "دسترسی سرویس آدرس پذیرفته نشد. آدرس را دستی وارد کنید.");
        return fail(502, "provider-failure", "سرویس آدرس در دسترس نیست. آدرس را دستی وارد کنید.");
      }
      const reader = result.body?.getReader();
      if (!reader) return fail(502, "invalid-provider-response", "پاسخ سرویس آدرس معتبر نیست.");
      const chunks = []; let bytes = 0;
      while (true) {
        const { value, done } = await reader.read(); if (done) break;
        bytes += value.byteLength;
        if (bytes > 32768) { await reader.cancel(); return fail(502, "invalid-provider-response", "پاسخ سرویس آدرس معتبر نیست."); }
        chunks.push(Buffer.from(value));
      }
      const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      const address = typeof body.formatted_address === "string" ? body.formatted_address.trim() : "";
      if (body.status !== "OK" || !address || address.length > 300 || address.includes(key)) return fail(502, "invalid-provider-response", "پاسخ سرویس آدرس معتبر نیست.");
      json(200, { formatted_address: address });
    } catch {
      fail(controller.signal.aborted ? 504 : 502, controller.signal.aborted ? "timeout" : "provider-unavailable", "دریافت آدرس انجام نشد. دوباره تلاش کنید یا آدرس را دستی وارد کنید.");
    } finally { clearTimeout(timer); response.removeListener("close", abandoned); active--; }
  });
  return server;
}
