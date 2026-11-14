const siteUrl = 'https://monmarchefute.com';
const staticRoutes = [
  '/',
  '/catalogue/',
  '/producteurs/',
  '/actualites/',
  '/qui-sommes-nous/',
  '/comment-ca-marche/',
  '/contact/',
  '/devenir-producteur/',
];

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default async function sitemap() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être configurées pour la fonction sitemap.');
  }

  const postsUrl = new URL('/rest/v1/blog_posts', supabaseUrl);
  postsUrl.searchParams.set('select', 'slug');
  postsUrl.searchParams.set('published_at', 'not.is.null');
  postsUrl.searchParams.set('order', 'published_at.desc');

  const response = await fetch(postsUrl, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Impossible de charger les articles pour le sitemap (HTTP ${response.status}).`);
  }

  const posts = await response.json();
  if (!Array.isArray(posts) || posts.some((post) => typeof post.slug !== 'string' || !post.slug)) {
    throw new Error('La réponse Supabase des articles publiés est invalide.');
  }

  const routes = [
    ...staticRoutes,
    ...posts.map((post) => `/actualites/${encodeURIComponent(post.slug)}/`),
  ];
  const entries = [...new Set(routes)].map((route) => (
    `  <url>\n    <loc>${escapeXml(`${siteUrl}${route}`)}</loc>\n  </url>`
  ));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
