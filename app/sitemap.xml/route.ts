// Sitemap servido como Route Handler para controlar o Content-Type.
// text/xml; charset=utf-8 é aceite por todos os validadores (a rota de metadados
// do Next só servia application/xml, que algumas ferramentas rejeitam).

export const dynamic = 'force-static';
export const revalidate = 86400; // regenera 1x/dia

const BASE = 'https://lagunoapp.xyz';

const PAGES: { path: string; changefreq: string; priority: string }[] = [
  { path: '',          changefreq: 'weekly',  priority: '1.0' },
  { path: '/features', changefreq: 'monthly', priority: '0.8' },
  { path: '/docs',     changefreq: 'monthly', priority: '0.7' },
  { path: '/sobre',    changefreq: 'monthly', priority: '0.6' },
  { path: '/legal',    changefreq: 'yearly',  priority: '0.3' },
];

export function GET() {
  const lastmod = new Date().toISOString();
  const urls = PAGES.map(p => (
    `  <url>\n` +
    `    <loc>${BASE}${p.path}</loc>\n` +
    `    <lastmod>${lastmod}</lastmod>\n` +
    `    <changefreq>${p.changefreq}</changefreq>\n` +
    `    <priority>${p.priority}</priority>\n` +
    `  </url>`
  )).join('\n');

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${urls}\n` +
    `</urlset>\n`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, must-revalidate',
    },
  });
}
