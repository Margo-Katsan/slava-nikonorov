// Protect cookie-authenticated mutation APIs from cross-origin browser requests.
// Same-origin browser requests to /api/admin/media/* include an Origin header.
export function isAllowedMutationOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    // Calls without Origin cannot submit credentials cross-origin via ordinary
    // browser fetch. Same-origin requests in some non-browser clients may omit it.
    return true;
  }
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
