import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDirectory = path.join(projectRoot, 'dist');
const siteUrl = 'https://monmarchefute.com';
const defaultImage = `${siteUrl}/mon-marche-fute-og.png`;

function loadEnvFile(contents) {
  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, '');
    }
    process.env[match[1]] = value;
  }
}

for (const fileName of ['.env.production.local', '.env.production', '.env.local', '.env']) {
  try {
    loadEnvFile(await readFile(path.join(projectRoot, fileName), 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function stripHtml(value) {
  return String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function articleDescription(article) {
  const excerpt = stripHtml(article.excerpt);
  if (excerpt) return excerpt;

  const content = stripHtml(article.content);
  if (!content) return 'Découvrez cet article sur Mon Marché Futé.';
  if (content.length <= 155) return content;

  const shortened = content.slice(0, 155);
  const lastSpace = shortened.lastIndexOf(' ');
  return shortened.slice(0, lastSpace > 0 ? lastSpace : 155).trim();
}

function replaceManagedMetadata(html, metadata) {
  let result = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`);
  result = result.replace(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*>\s*/gi, '');
  result = result.replace(/<meta\b(?=[^>]*\bname=["']twitter:card["'])[^>]*>\s*/gi, '');
  result = result.replace(/<meta\b(?=[^>]*\bname=["']twitter:title["'])[^>]*>\s*/gi, '');
  result = result.replace(/<meta\b(?=[^>]*\bname=["']twitter:description["'])[^>]*>\s*/gi, '');
  result = result.replace(/<meta\b(?=[^>]*\bname=["']twitter:image["'])[^>]*>\s*/gi, '');
  result = result.replace(/<meta\b(?=[^>]*\bproperty=["']og:[^"']+["'])[^>]*>\s*/gi, '');
  result = result.replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>\s*/gi, '');
  result = result.replace(/<script\b(?=[^>]*\bdata-react-helmet=["'])[^>]*>[\s\S]*?<\/script>\s*/gi, '');

  const tags = [
    `<meta name="description" content="${escapeHtml(metadata.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(metadata.url)}" />`,
    `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(metadata.url)}" />`,
    `<meta property="og:type" content="${metadata.type ?? 'website'}" />`,
    `<meta property="og:image" content="${escapeHtml(metadata.image ?? defaultImage)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(metadata.image ?? defaultImage)}" />`,
    `<script type="application/ld+json">${JSON.stringify(metadata.structuredData).replace(/</g, '\\u003c')}</script>`,
  ].map((tag) => tag.replace(/<(meta|link|script)\b/i, '<$1 data-react-helmet="true"'));
  return result.replace('</head>', `  ${tags.join('\n  ')}\n  </head>`);
}

const pages = new Map([
  ['/', {
    title: 'Mon Marché Futé — Produits locaux en vente directe',
    description: 'Achetez des fruits et légumes frais directement auprès de producteurs français. Découvrez les produits de saison et soutenez une agriculture locale.',
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${siteUrl}/#website`,
          url: `${siteUrl}/`,
          name: 'Mon Marché Futé',
          inLanguage: 'fr-FR',
          publisher: { '@id': `${siteUrl}/#organization` },
        },
        {
          '@type': 'WebPage',
          '@id': `${siteUrl}/#webpage`,
          url: `${siteUrl}/`,
          name: 'Mon Marché Futé — Produits locaux en vente directe',
          inLanguage: 'fr-FR',
          isPartOf: { '@id': `${siteUrl}/#website` },
          about: { '@id': `${siteUrl}/#organization` },
        },
      ],
    },
  }],
  ['/catalogue', {
    title: 'Catalogue de produits locaux | Mon Marché Futé',
    description: 'Parcourez notre catalogue de fruits et légumes frais proposés en vente directe par des producteurs français.',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      url: `${siteUrl}/catalogue`,
      name: 'Catalogue de produits locaux | Mon Marché Futé',
      inLanguage: 'fr-FR',
      isPartOf: { '@id': `${siteUrl}/#website` },
    },
  }],
  ['/producteurs', {
    title: 'Découvrez nos producteurs français | Mon Marché Futé',
    description: 'Rencontrez les producteurs français de fruits et légumes frais. Découvrez leurs exploitations et leurs produits en vente directe.',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      url: `${siteUrl}/producteurs`,
      name: 'Découvrez nos producteurs français | Mon Marché Futé',
      inLanguage: 'fr-FR',
      isPartOf: { '@id': `${siteUrl}/#website` },
    },
  }],
  ['/actualites', {
    title: 'Actualités, produits de saison et conseils | Mon Marché Futé',
    description: 'Retrouvez les actualités de Mon Marché Futé, les fruits et légumes de saison, des conseils pour acheter local et les nouveautés de la plateforme.',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      url: `${siteUrl}/actualites`,
      name: 'Actualités, produits de saison et conseils | Mon Marché Futé',
      inLanguage: 'fr-FR',
      isPartOf: { '@id': `${siteUrl}/#website` },
      publisher: { '@id': `${siteUrl}/#organization` },
    },
  }],
  ['/qui-sommes-nous', {
    title: 'Qui sommes-nous ? | Mon Marché Futé',
    description: 'Découvrez Mon Marché Futé, la plateforme qui relie les consommateurs aux producteurs français pour une vente directe, locale et plus équitable.',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      url: `${siteUrl}/qui-sommes-nous`,
      name: 'Qui sommes-nous ? | Mon Marché Futé',
      inLanguage: 'fr-FR',
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': `${siteUrl}/#organization` },
    },
  }],
]);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Prérendu SEO impossible : VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être disponibles au build.');
}

const postsUrl = new URL('/rest/v1/blog_posts', supabaseUrl);
postsUrl.searchParams.set('select', 'slug,title,excerpt,content,image_url,published_at');
postsUrl.searchParams.set('published_at', 'not.is.null');
postsUrl.searchParams.set('order', 'published_at.desc');

const postsResponse = await fetch(postsUrl, {
  headers: {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
  },
});
if (!postsResponse.ok) {
  throw new Error(`Prérendu SEO impossible : Supabase a répondu avec le statut ${postsResponse.status}.`);
}

const posts = await postsResponse.json();
if (!Array.isArray(posts)) {
  throw new Error('Prérendu SEO impossible : la réponse Supabase des articles est invalide.');
}

const indexHtml = await readFile(path.join(distDirectory, 'index.html'), 'utf8');
const sitemapPath = path.join(distDirectory, 'sitemap.xml');
const sitemap = await readFile(sitemapPath, 'utf8');
const sitemapPaths = [...sitemap.matchAll(/<loc>\s*https?:\/\/[^/]+(\/[^<]*)<\/loc>/gi)]
  .map((match) => match[1] || '/');

function writePage(route, metadata) {
  const outputDirectory = route === '/'
    ? distDirectory
    : path.join(distDirectory, ...route.split('/').filter(Boolean));
  const outputFile = route === '/'
    ? path.join(outputDirectory, 'index.html')
    : path.join(outputDirectory, 'index.html');
  const canonicalUrl = `${siteUrl}${route === '/' ? '/' : route}`;

  return mkdir(outputDirectory, { recursive: true }).then(() => writeFile(
    outputFile,
    replaceManagedMetadata(indexHtml, { ...metadata, url: canonicalUrl }),
    'utf8',
  ));
}

for (const route of sitemapPaths) {
  if (route.startsWith('/actualites/') && route !== '/actualites/') continue;
  const metadata = pages.get(route);
  if (metadata) await writePage(route, metadata);
}

const postsBySlug = new Map(posts.map((post) => [post.slug, post]));
for (const post of posts) {
  if (!post.slug || !post.title || !post.published_at) continue;

  const route = `/actualites/${post.slug}`;
  const canonicalUrl = `${siteUrl}${route}`;
  const description = articleDescription(post);
  const image = post.image_url ? new URL(post.image_url, siteUrl).toString() : undefined;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    ...(image ? { image: [image] } : {}),
    datePublished: post.published_at,
    dateModified: post.published_at,
    author: {
      '@type': 'Organization',
      name: 'Mon Marché Futé',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mon Marché Futé',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/favicon.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    inLanguage: 'fr-FR',
  };

  await writePage(route, {
    title: `${post.title} | Mon Marché Futé`,
    description,
    image,
    type: 'article',
    structuredData: articleSchema,
  });
}

for (const route of sitemapPaths) {
  if (!route.startsWith('/actualites/') || route === '/actualites/') continue;
  const slug = decodeURIComponent(route.slice('/actualites/'.length));
  if (!postsBySlug.has(slug)) {
    throw new Error(`Le sitemap référence un article non publié ou introuvable : ${route}`);
  }
}

const nonArticleRoutes = sitemapPaths.filter((route) => !route.startsWith('/actualites/'));
const sitemapEntries = [
  ...new Set(nonArticleRoutes),
  ...posts
    .filter((post) => post.slug && post.published_at)
    .map((post) => `/actualites/${post.slug}`),
].map((route) => {
  const post = route.startsWith('/actualites/')
    ? postsBySlug.get(decodeURIComponent(route.slice('/actualites/'.length)))
    : null;
  const lastmod = post?.published_at ? `\n    <lastmod>${post.published_at.slice(0, 10)}</lastmod>` : '';
  return `  <url>\n    <loc>${siteUrl}${escapeHtml(route)}</loc>${lastmod}\n  </url>`;
});

await writeFile(
  sitemapPath,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.join('\n')}\n</urlset>\n`,
  'utf8',
);

console.log(`SEO prerendered for ${pages.size} primary pages and ${posts.length} published article(s).`);
