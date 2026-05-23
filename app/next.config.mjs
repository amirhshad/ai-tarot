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
    ];
  },
};

export default withNextIntl(nextConfig);
