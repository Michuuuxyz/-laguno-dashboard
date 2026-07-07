import { MetadataRoute } from 'next';

// Convenção de metadados do Next — serve automaticamente em /sitemap.xml.
// URLs no domínio canónico (NÃO-www) para não apontar para redirects.
const BASE = 'https://lagunoapp.xyz';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const pages: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
    { path: '',          changeFrequency: 'weekly',  priority: 1.0 },
    { path: '/features', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/comandos', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/docs',     changeFrequency: 'monthly', priority: 0.7 },
    { path: '/sobre',    changeFrequency: 'monthly', priority: 0.6 },
    { path: '/legal',    changeFrequency: 'yearly',  priority: 0.3 },
  ];

  return pages.map((p) => ({
    url: `${BASE}${p.path}`,
    lastModified,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
