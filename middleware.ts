import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware global de sécurité — Open Hub (by Anarchy)
 *
 * 1. Redirection automatique HTTP -> HTTPS en environnement de production
 *    (vérifie l'en-tête `x-forwarded-proto` des reverse-proxies / Load Balancers).
 * 2. Injection d'en-têtes de traçabilité technique et d'isolation Cross-Origin.
 */
export function middleware(request: NextRequest) {
  const proto = request.headers.get("x-forwarded-proto");
  const host = request.headers.get("host") || "";
  const isLocalhost =
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("[::1]");

  // En production (hors localhost), force la redirection permanente (308) vers HTTPS
  if (
    process.env.NODE_ENV === "production" &&
    proto === "http" &&
    !isLocalhost
  ) {
    const httpsUrl = new URL(request.url);
    httpsUrl.protocol = "https:";
    return NextResponse.redirect(httpsUrl, 308);
  }

  const response = NextResponse.next();
  response.headers.set("X-OpenHub-Security", "TLS-ENFORCED // RGPD-CNIL-V1");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  return response;
}

export const config = {
  matcher: [
    /*
     * Applique le middleware sur toutes les routes applicatives hors assets statiques
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
