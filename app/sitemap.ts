import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.lagunoapp.xyz';
  return [
    { url: base,               changeFrequency: 'weekly',  priority: 1   },
    { url: `${base}/features`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/docs`,     changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/sobre`,    changeFrequency: 'monthly', priority: 0.6 },
  ];
}
