import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@libsql/client', 'bcryptjs', 'jsonwebtoken'],
  async redirects() {
    return [
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
      // next-intl's localePrefix: 'as-needed' strips the default '/en' prefix
      // with a 307 from middleware. Config redirects run before middleware, so
      // handling it here makes it a permanent 308 that consolidates signals.
      {
        source: '/en',
        destination: '/',
        statusCode: 308,
      },
      {
        source: '/en/:path*',
        destination: '/:path*',
        statusCode: 308,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
