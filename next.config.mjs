/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    // Force HTTPS (HSTS) pendant 2 ans avec sous-domaines et preload
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // Empêche le reniflage de type MIME (protection XSS / téléchargements VST)
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Protection contre le clickjacking (interdit la mise en iframe externe)
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // Contrôle strict des informations de provenance envoyées via l'en-tête Referer
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Désactive les API navigateur sensibles non utilisées et bloque le tracking FLoC/Topics
    key: "Permissions-Policy",
    value:
      "camera=(), geolocation=(), payment=(), usb=(), browsing-topics=(), microphone=(self), autoplay=(self)",
  },
  {
    // Optimisation DNS tout en conservant l'isolation d'origine
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    // Politique de sécurité du contenu (CSP) adaptée à Next.js et à l'audio WebAudio/WASM
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "media-src 'self' data: blob:",
      "worker-src 'self' blob:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig = {
  poweredByHeader: false, // Masque l'en-tête X-Powered-By pour réduire la surface d'empreinte
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
