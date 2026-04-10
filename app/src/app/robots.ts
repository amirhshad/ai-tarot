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
          '/dashboard', '/fa/dashboard',
          '/reading/new', '/fa/reading/new',
          '/settings', '/fa/settings',
          '/billing', '/fa/billing',
        ],
      },
    ],
    sitemap: 'https://www.tarotveil.com/sitemap.xml',
  };
}
