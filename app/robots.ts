import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/api'],
    },
    sitemap: 'https://www.lagunoapp.xyz/sitemap.xml',
    host: 'https://www.lagunoapp.xyz',
  };
}