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
        permanent: true,
      },
      {
        source: '/cards/:slug',
        destination: '/tarot-card-meanings/:slug',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
