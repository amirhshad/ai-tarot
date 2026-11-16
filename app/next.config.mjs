import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@libsql/client', 'bcryptjs', 'jsonwebtoken'],
  // Inlined at build so sitemap lastmod stays on the deploy date. Computing
  // `new Date()` inside the ISR sitemap would move lastmod on every cold start.
  env: {
    SITEMAP_BUILD_DATE: new Date().toISOString().slice(0, 10),
  },
  async headers() {
    return [
      {
        // Covers routes the middleware matcher skips (API, metadata images,
        // sitemap, robots) as well as pages. Middleware sets the same values
        // on the responses it builds, including auth redirects.
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
        ],
      },
      {
        // User data and session routes. Marketing HTML is cached separately;
        // these must not be stored by a shared cache.
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // `/cards/...` is excluded from the middleware matcher so the static
      // card images under public/cards keep being served. The legacy slug
      // redirect therefore has to live here, where it runs before middleware.
      {
        source: '/cards',
        destination: '/tarot-card-meanings',
        statusCode: 301,
      },
      {
        source: '/cards/:slug',
        destination: '/tarot-card-meanings/:slug',
        statusCode: 301,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
