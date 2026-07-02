import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.lagunoapp.xyz';
  const lastModified = new Date();
  return [
    { url: base,               lastModified, changeFrequency: 'weekly',  priority: 1   },
    { url: `${base}/features`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/docs`,     lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/sobre`,    lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/legal`,    lastModified, changeFrequency: 'yearly',  priority: 0.3 },
  ];
}
