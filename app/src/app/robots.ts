import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/reading/free'],
        disallow: ['/api/', '/dashboard', '/reading/new', '/settings', '/billing'],
      },
    ],
    sitemap: 'https://www.tarotveil.com/sitemap.xml',
  };
}
