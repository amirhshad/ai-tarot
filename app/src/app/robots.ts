import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/fa/', '/reading/free', '/fa/reading/free'],
        disallow: [
          '/api/',
          '/auth/',
          '/dashboard', '/fa/dashboard', '/ar/dashboard',
          '/reading/new', '/fa/reading/new', '/ar/reading/new',
          '/settings', '/fa/settings', '/ar/settings',
          '/billing', '/fa/billing', '/ar/billing',
          // Auth-gated; middleware redirects these to /login, which shows up in
          // Search Console as "Page with redirect" / "Redirect error".
          '/admin', '/fa/admin', '/ar/admin',
        ],
      },
    ],
    sitemap: 'https://www.tarotveil.com/sitemap.xml',
  };
}
