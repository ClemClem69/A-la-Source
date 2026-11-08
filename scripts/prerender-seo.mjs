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
  if (article.slug === 'circuits-courts-un-enjeu-majeur-pour-l-agriculture-de-demain') {
    return 'Les circuits courts permettent de rapprocher producteurs et consommateurs en limitant les intermédiaires.';
  }

  const excerpt = stripHtml(article.excerpt);
  const content = stripHtml(article.content);
  const source = excerpt.length >= 50 ? excerpt : content || excerpt;
  if (!source) return 'Consultez cet article publié par Mon marché futé.';
  if (!/[.!?]$/.test(source)) {
    const sentenceEnd = source.search(/[.!?]/);
    if (sentenceEnd >= 50) return source.slice(0, sentenceEnd + 1);
  }
  if (source.length <= 155) return source;

  const shortened = source.slice(0, 155);
  const lastSpace = shortened.lastIndexOf(' ');
  return shortened.slice(0, lastSpace > 0 ? lastSpace : 155).trim();
}

function articleSummary(article) {
  const excerpt = stripHtml(article.excerpt);
  const source = excerpt || stripHtml(article.content);
  if (source.length <= 220) return source;

  const shortened = source.slice(0, 220);
  const lastSpace = shortened.lastIndexOf(' ');
  return `${shortened.slice(0, lastSpace > 0 ? lastSpace : 220).trim()}…`;
}

function formatPublishedDate(date) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Paris',
  }).format(new Date(date));
}

function snapshot({ heading, description, links, includePreregistrationTarget = false }) {
  const renderedLinks = links
    .map(({ href, label }) => `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`)
    .join('');
  const preregistrationTarget = includePreregistrationTarget
    ? '<section id="preinscription"><h2>Être informé du lancement</h2><p>Retrouvez le formulaire de préinscription sur cette page.</p></section>'
    : '';
  return `<main><h1>${escapeHtml(heading)}</h1><p>${escapeHtml(description)}</p><ul>${renderedLinks}</ul>${preregistrationTarget}</main>`;
}

function replaceManagedMetadata(html, metadata) {
  let result = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`);
  result = result.replace(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*>\s*/gi, '');
  result = result.replace(/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>\s*/gi, '');
  result = result.replace(/<meta\b(?=[^>]*\bname=["']twitter:[^"']+["'])[^>]*>\s*/gi, '');
  result = result.replace(/<meta\b(?=[^>]*\bproperty=["']og:[^"']+["'])[^>]*>\s*/gi, '');
  result = result.replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>\s*/gi, '');
  result = result.replace(/<script\b(?=[^>]*\bdata-react-helmet=["'])[^>]*>[\s\S]*?<\/script>\s*/gi, '');
  result = result.replace(
    /(<div\b[^>]*\bid=["']root["'][^>]*>)[\s\S]*?(<\/div>)/i,
    `$1${metadata.contentHtml ?? ''}$2`,
  );

  const tags = [
    `<meta name="description" content="${escapeHtml(metadata.description)}" />`,
    ...(metadata.indexable ? [`<link rel="canonical" href="${escapeHtml(metadata.url)}" />`] : [
      '<meta name="robots" content="noindex,follow" />',
    ]),
    `<meta property="og:type" content="${metadata.type ?? 'website'}" />`,
    `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`,
    ...(metadata.indexable ? [`<meta property="og:url" content="${escapeHtml(metadata.url)}" />`] : []),
    `<meta property="og:image" content="${escapeHtml(metadata.image ?? defaultImage)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(metadata.image ?? defaultImage)}" />`,
    ...(metadata.structuredData
      ? [`<script type="application/ld+json">${JSON.stringify(metadata.structuredData).replace(/</g, '\\u003c')}</script>`]
      : []),
  ].map((tag) => tag.replace(/<(meta|link|script)\b/i, '<$1 data-react-helmet="true"'));

  return result.replace('</head>', `  ${tags.join('\n  ')}\n  </head>`);
}

const pages = new Map([
  ['/', {
    title: 'Fruits et légumes à prix accessibles à Lyon | Mon marché futé',
    description: 'Découvrez Mon marché futé : un projet de fruits et légumes à l’unité, avec retrait hebdomadaire prévu dans Lyon centre. Soyez informé du lancement.',
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
          name: 'Fruits et légumes à prix accessibles à Lyon | Mon marché futé',
          description: 'Découvrez Mon marché futé : un projet de fruits et légumes à l’unité, avec retrait hebdomadaire prévu dans Lyon centre. Soyez informé du lancement.',
          isPartOf: { '@id': `${siteUrl}/#website` },
          about: { '@id': `${siteUrl}/#organization` },
          inLanguage: 'fr-FR',
        },
      ],
    },
    contentHtml: snapshot({
      heading: 'Des fruits et légumes à prix accessibles à Lyon',
      description: 'Des fruits et légumes commandés à l’unité auprès de producteurs, avec un retrait hebdomadaire dans le centre-ville de Lyon. Mon marché futé vise à rendre les fruits et légumes plus accessibles grâce à une organisation simple des commandes et du retrait.',
      links: [
        { href: '/#preinscription', label: 'Être informé du lancement' },
        { href: '/catalogue/', label: 'Catalogue' },
        { href: '/producteurs/', label: 'Producteurs' },
        { href: '/actualites/', label: 'Actualités' },
        { href: '/qui-sommes-nous/', label: 'Qui sommes-nous ?' },
        { href: '/comment-ca-marche/', label: 'Comment ça marche' },
      ],
      includePreregistrationTarget: true,
    }),
  }],
  ['/catalogue', {
    title: 'Catalogue de fruits et légumes | Mon marché futé',
    description: 'Consultez le catalogue de fruits et légumes proposés à l’unité par Mon marché futé et inscrivez-vous pour recevoir les informations sur le lancement.',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      url: `${siteUrl}/catalogue/`,
      name: 'Catalogue de fruits et légumes | Mon marché futé',
      inLanguage: 'fr-FR',
      isPartOf: { '@id': `${siteUrl}/#website` },
    },
    contentHtml: snapshot({
      heading: 'Catalogue',
      description: 'Consultez le catalogue de fruits et légumes proposés à l’unité par Mon marché futé.',
      links: [
        { href: '/#preinscription', label: 'Être informé du lancement' },
        { href: '/producteurs/', label: 'Producteurs' },
        { href: '/actualites/', label: 'Actualités' },
      ],
    }),
  }],
  ['/producteurs', {
    title: 'Producteurs | Mon marché futé',
    description: 'Découvrez la page consacrée aux producteurs référencés par Mon marché futé et les informations disponibles sur leurs exploitations.',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      url: `${siteUrl}/producteurs/`,
      name: 'Producteurs | Mon marché futé',
      inLanguage: 'fr-FR',
      isPartOf: { '@id': `${siteUrl}/#website` },
    },
    contentHtml: snapshot({
      heading: 'Nos producteurs',
      description: 'Découvrez les maraîchers et arboriculteurs qui cultivent vos fruits et légumes.',
      links: [
        { href: '/#preinscription', label: 'Être informé du lancement' },
        { href: '/catalogue/', label: 'Catalogue' },
        { href: '/actualites/', label: 'Actualités' },
      ],
    }),
  }],
  ['/actualites', {
    title: 'Actualités | Mon marché futé',
    description: 'Lisez les actualités et articles publiés par Mon marché futé sur les fruits, les légumes et le lancement du service.',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      url: `${siteUrl}/actualites/`,
      name: 'Actualités | Mon marché futé',
      inLanguage: 'fr-FR',
      isPartOf: { '@id': `${siteUrl}/#website` },
      publisher: { '@id': `${siteUrl}/#organization` },
    },
    contentHtml: snapshot({
      heading: 'Actualités',
      description: 'Nouveautés, conseils et histoires de nos producteurs.',
      links: [
        { href: '/#preinscription', label: 'Être informé du lancement' },
        { href: '/catalogue/', label: 'Catalogue' },
        { href: '/qui-sommes-nous/', label: 'Qui sommes-nous ?' },
      ],
    }),
  }],
  ['/qui-sommes-nous', {
    title: 'Qui sommes-nous ? | Mon marché futé',
    description: 'Découvrez la mission de Mon marché futé et son approche pour organiser les commandes et le retrait des fruits et légumes.',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      url: `${siteUrl}/qui-sommes-nous/`,
      name: 'Qui sommes-nous ? | Mon marché futé',
      inLanguage: 'fr-FR',
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': `${siteUrl}/#organization` },
    },
    contentHtml: snapshot({
      heading: 'Qui sommes-nous ?',
      description: 'Mon marché futé vise à rendre les fruits et légumes plus accessibles grâce à une organisation simple des commandes et du retrait.',
      links: [
        { href: '/#preinscription', label: 'Être informé du lancement' },
        { href: '/catalogue/', label: 'Catalogue' },
        { href: '/contact/', label: 'Contact' },
      ],
    }),
  }],
  ['/comment-ca-marche', {
    title: 'Comment fonctionne Mon marché futé à Lyon ?',
    description: 'Découvrez Mon marché futé à Lyon : commande de fruits et légumes à l’unité, retrait hebdomadaire dans le centre-ville et informations pratiques sur le retrait.',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${siteUrl}/comment-ca-marche/#webpage`,
      url: `${siteUrl}/comment-ca-marche/`,
      name: 'Comment fonctionne Mon marché futé à Lyon ?',
      description: 'Découvrez Mon marché futé à Lyon : commande de fruits et légumes à l’unité, retrait hebdomadaire dans le centre-ville et informations pratiques sur le retrait.',
      inLanguage: 'fr-FR',
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': `${siteUrl}/#organization` },
    },
    contentHtml: `<main>
      <h1>Comment fonctionne Mon marché futé à Lyon ?</h1>
      <section><h2>Mon marché fûté à Lyon</h2><p>Mon marché futé vise à rendre les fruits et légumes plus accessibles grâce à une organisation simple des commandes et du retrait. Le service s’organise autour d’un point de retrait dans le centre-ville de Lyon.</p></section>
      <section><h2>La commande de fruits et légumes à l’unité</h2><p>Les fruits et légumes se commandent à l’unité, en ligne.</p></section>
      <section><h2>Un retrait une fois par semaine dans le centre-ville</h2><p>Le retrait a lieu une fois par semaine dans le centre-ville de Lyon. Les informations pratiques sur le retrait, notamment l’adresse, le jour et les horaires, sont communiquées avant chaque retrait.</p></section>
      <section><h2>À qui s’adresse le service</h2><p>Le service s’adresse aux particuliers, aux familles comme aux personnes seules, qui peuvent se déplacer dans le centre-ville de Lyon pour retirer leur commande.</p></section>
      <section><h2>FAQ pratique</h2>
        <h3>Comment commander les fruits et légumes ?</h3><p>Les fruits et légumes se commandent à l’unité, en ligne.</p>
        <h3>Où et quand retirer une commande ?</h3><p>Le retrait a lieu une fois par semaine dans le centre-ville de Lyon. L’adresse, le jour et les horaires sont communiqués avant chaque retrait.</p>
        <h3>À qui s’adresse le service ?</h3><p>Aux particuliers, aux familles et aux personnes seules qui peuvent se déplacer dans le centre-ville de Lyon.</p>
      </section>
      <section><h2>Une question sur le fonctionnement ?</h2><p><a href="/contact/">Contactez Mon marché futé</a></p></section>
      <nav aria-label="Liens utiles"><ul>
        <li><a href="/">Accueil</a></li>
        <li><a href="/qui-sommes-nous/">Qui sommes-nous ?</a></li>
      </ul></nav>
    </main>`,
  }],
  ['/contact', {
    title: 'Contact | Mon marché futé',
    description: 'Contactez Mon marché futé pour poser une question ou transmettre un message via le formulaire.',
    contentHtml: snapshot({
      heading: 'Contactez-nous',
      description: 'Une question ou besoin d’aide ? Écrivez-nous via ce formulaire.',
      links: [
        { href: '/#preinscription', label: 'Être informé du lancement' },
        { href: '/qui-sommes-nous/', label: 'Qui sommes-nous ?' },
      ],
    }),
  }],
  ['/devenir-producteur', {
    title: 'Proposer ses produits | Mon marché futé',
    description: 'Informations destinées aux producteurs qui souhaitent proposer leurs produits sur Mon marché futé.',
    contentHtml: snapshot({
      heading: 'Vendre sur Mon marché futé',
      description: 'Vous souhaitez proposer vos produits sur Mon marché futé ? Contactez-nous via le formulaire dédié.',
      links: [
        { href: '/contact/', label: 'Accéder au formulaire de contact' },
        { href: '/#preinscription', label: 'Être informé du lancement' },
      ],
    }),
  }],
]);

const nonIndexablePages = new Map([
  ['/engagements', {
    title: 'Engagements | Mon marché futé',
    description: 'Les principes et engagements présentés par Mon marché futé.',
  }],
  ['/faq', {
    title: 'Questions fréquentes | Mon marché futé',
    description: 'Réponses aux questions courantes sur le fonctionnement du service Mon marché futé.',
  }],
  ['/cgv', {
    title: 'Conditions générales de vente | Mon marché futé',
    description: 'Conditions générales de vente de Mon marché futé.',
  }],
  ['/mentions-legales', {
    title: 'Mentions légales | Mon marché futé',
    description: 'Mentions légales de Mon marché futé.',
  }],
  ['/confidentialite', {
    title: 'Politique de confidentialité | Mon marché futé',
    description: 'Informations sur la collecte et l’utilisation des données par Mon marché futé.',
    contentHtml: `<main>
      <h1>Politique de confidentialité</h1>
      <h2>Préinscription</h2>
      <p>Lorsque vous demandez à être informé du lancement, votre adresse e-mail est enregistrée dans Supabase afin de vous envoyer une information liée à cette demande. Elle n’est pas transmise à Google Analytics.</p>
      <h2>Mesure d’audience et consentement</h2>
      <p>Avec votre accord, Google Analytics 4 (Google) mesure la fréquentation du site et les clics sur les appels à la préinscription. Les événements analytiques concernés sont les pages consultées, les clics sur ces appels et les inscriptions effectivement enregistrées. Aucun e-mail, hash d’e-mail, token, identifiant utilisateur ou contenu de formulaire n’est envoyé dans ces événements.</p>
      <p>Google Analytics n’est chargé qu’après acceptation de la mesure d’audience. Vous pouvez accepter ou refuser dans la bannière, puis modifier votre choix à tout moment avec le bouton « Gérer le consentement analytique » en pied de page. Votre choix est mémorisé dans le stockage local de votre navigateur. Le refus n’empêche pas l’utilisation du formulaire de préinscription.</p>
      <p>Les signaux de stockage analytique et publicitaire de Google Consent Mode v2 sont configurés selon votre choix. Le stockage publicitaire, l’utilisation des données à des fins publicitaires et la personnalisation des annonces restent refusés.</p>
      <p>La durée de conservation applicable aux données Google Analytics doit être confirmée à partir du paramétrage du compte GA4 avant publication de cette information.</p>
      <h2>Vos droits</h2>
      <p>Conformément au RGPD, vous pouvez demander l’accès à vos données, leur rectification ou leur effacement, vous opposer à certains traitements et retirer votre consentement à la mesure d’audience. Pour exercer vos droits concernant les données de préinscription, utilisez le formulaire de contact du site. Vous pouvez aussi modifier le consentement analytique depuis le pied de page.</p>
      <p>Vous pouvez introduire une réclamation auprès de la CNIL. Les informations de contact du responsable de traitement et la durée de conservation définitive doivent être confirmées avant la mise en production de cette politique.</p>
    </main>`,
  }],
]);

const nonIndexableRoutes = [
  '/connexion',
  '/inscription',
  '/mot-de-passe-oublie',
  '/panier',
  '/commander',
  '/commandes',
  '/profil',
  '/producteur',
  '/producteur/inscription',
  '/producteur/produits',
  '/producteur/commandes',
  '/admin',
  '/admin/producteurs',
  '/admin/utilisateurs',
  '/admin/produits',
  '/admin/tarifs',
  '/admin/messagerie',
  '/admin/evenements',
  '/admin/ajouter-producteur',
  '/admin/actualites',
];

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
const publishedPosts = posts.filter((post) => post.published_at);
if (publishedPosts.some((post) => (
  !post.slug
  || !post.title
  || !Number.isFinite(Date.parse(post.published_at))
  || !articleSummary(post)
))) {
  throw new Error('Prérendu SEO impossible : un article publié ne possède pas un titre, un slug, un résumé ou une date valide.');
}

async function fetchPublicRows(table, filters) {
  const rowsUrl = new URL(`/rest/v1/${table}`, supabaseUrl);
  for (const [key, value] of Object.entries(filters)) {
    rowsUrl.searchParams.set(key, value);
  }

  const response = await fetch(rowsUrl, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Prérendu SEO impossible : Supabase a répondu avec le statut ${response.status} pour ${table}.`);
  }

  const rows = await response.json();
  if (!Array.isArray(rows)) {
    throw new Error(`Prérendu SEO impossible : la réponse Supabase de ${table} est invalide.`);
  }
  return rows;
}

const products = await fetchPublicRows('products', {
  select: 'id,name',
  is_active: 'eq.true',
  pricing_status: 'eq.validated',
  order: 'created_at.desc',
});
const producers = await fetchPublicRows('producers', {
  select: 'id,company_name,description,logo_url,address,city,region,postal_code',
  status: 'eq.active',
  order: 'company_name.asc',
});

const indexHtml = await readFile(path.join(distDirectory, 'index.html'), 'utf8');
const sitemapPath = path.join(distDirectory, 'sitemap.xml');
const sitemap = await readFile(sitemapPath, 'utf8');
const previousSitemapRoutes = [...sitemap.matchAll(/<loc>\s*https?:\/\/[^/]+(\/[^<]*)<\/loc>/gi)]
  .map((match) => match[1] || '/');

function normalizeRoute(route) {
  if (route === '/') return route;
  return `/${route.replace(/^\/+|\/+$/g, '')}/`;
}

function outputPath(route) {
  const normalizedRoute = normalizeRoute(route);
  return normalizedRoute === '/'
    ? path.join(distDirectory, 'index.html')
    : path.join(distDirectory, ...normalizedRoute.split('/').filter(Boolean), 'index.html');
}

async function writePage(route, metadata) {
  const normalizedRoute = normalizeRoute(route);
  const canonicalUrl = `${siteUrl}${normalizedRoute}`;
  const pageHtml = replaceManagedMetadata(indexHtml, {
    ...metadata,
    url: canonicalUrl,
  });
  const filePath = outputPath(normalizedRoute);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, pageHtml, 'utf8');
}

const postsBySlug = new Map(publishedPosts.map((post) => [post.slug, post]));
const cataloguePage = pages.get('/catalogue');
const producerPage = pages.get('/producteurs');
const catalogueItems = products
  .filter((product) => product.id && product.name)
  .map((product, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: product.name,
    url: `${siteUrl}/produit/${encodeURIComponent(product.id)}`,
  }));
const producerItems = producers
  .filter((producer) => producer.id && producer.company_name)
  .map((producer, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'Organization',
      name: producer.company_name,
      url: `${siteUrl}/producteur/${encodeURIComponent(producer.id)}`,
      ...(producer.description ? { description: producer.description } : {}),
      ...(producer.logo_url ? { image: new URL(producer.logo_url, siteUrl).toString() } : {}),
      ...(producer.city || producer.address ? {
        address: {
          '@type': 'PostalAddress',
          ...(producer.address ? { streetAddress: producer.address } : {}),
          ...(producer.city ? { addressLocality: producer.city } : {}),
          ...(producer.region ? { addressRegion: producer.region } : {}),
          ...(producer.postal_code ? { postalCode: producer.postal_code } : {}),
          addressCountry: 'FR',
        },
      } : {}),
    },
  }));

cataloguePage.structuredData.mainEntity = catalogueItems.length > 0
  ? {
      '@type': 'ItemList',
      numberOfItems: catalogueItems.length,
      itemListElement: catalogueItems,
    }
  : undefined;
cataloguePage.contentHtml = `<main>
  <h1>Catalogue</h1>
  <p>Consultez le catalogue de fruits et légumes proposés à l’unité par Mon marché futé.</p>
  ${catalogueItems.length > 0
    ? `<section><h2>Fruits et légumes</h2><ul>${catalogueItems.map((item) => `<li><a href="${escapeHtml(new URL(item.url).pathname)}">${escapeHtml(item.name)}</a></li>`).join('')}</ul></section>`
    : ''}
  <ul><li><a href="/#preinscription">Être informé du lancement</a></li><li><a href="/producteurs/">Producteurs</a></li></ul>
</main>`;

producerPage.structuredData.mainEntity = producerItems.length > 0
  ? {
      '@type': 'ItemList',
      numberOfItems: producerItems.length,
      itemListElement: producerItems,
    }
  : undefined;
producerPage.contentHtml = `<main>
  <h1>Nos producteurs</h1>
  <p>Découvrez les maraîchers et arboriculteurs qui cultivent vos fruits et légumes.</p>
  ${producerItems.length > 0
    ? `<section><h2>Producteurs référencés</h2><ul>${producerItems.map((item) => `<li><a href="${escapeHtml(new URL(item.item.url).pathname)}">${escapeHtml(item.item.name)}</a></li>`).join('')}</ul></section>`
    : ''}
  <ul><li><a href="/#preinscription">Être informé du lancement</a></li><li><a href="/catalogue/">Catalogue</a></li></ul>
</main>`;
const newsPage = pages.get('/actualites');
newsPage.structuredData.blogPost = publishedPosts.map((post) => {
  const route = normalizeRoute(`/actualites/${post.slug}`);
  const summary = articleSummary(post);
  return {
    '@type': 'BlogPosting',
    headline: post.title,
    url: `${siteUrl}${route}`,
    datePublished: post.published_at,
    ...(summary ? { description: summary } : {}),
    mainEntityOfPage: `${siteUrl}${route}`,
    publisher: { '@id': `${siteUrl}/#organization` },
  };
});

const previousArticleRoutes = previousSitemapRoutes
  .map(normalizeRoute)
  .filter((route) => route.startsWith('/actualites/') && route !== '/actualites/');

for (const route of previousArticleRoutes) {
  const slug = decodeURIComponent(route.slice('/actualites/'.length, -1));
  if (!postsBySlug.has(slug)) {
    throw new Error(`Le sitemap référence un article non publié ou introuvable : ${route}`);
  }
}

for (const [route, metadata] of pages) {
  let contentHtml = metadata.contentHtml;
  if (route === '/actualites') {
    const articles = publishedPosts.map((post) => {
      const articleUrl = `/actualites/${encodeURIComponent(post.slug)}/`;
      return `<article>
        <h2><a href="${escapeHtml(articleUrl)}">${escapeHtml(post.title)}</a></h2>
        <time datetime="${escapeHtml(post.published_at)}">${escapeHtml(formatPublishedDate(post.published_at))}</time>
        <p>${escapeHtml(articleSummary(post))}</p>
      </article>`;
    }).join('');
    contentHtml = `<main>
      <h1>Actualités</h1>
      <p>${escapeHtml(metadata.description)}</p>
      <section aria-label="Articles publiés">${articles}</section>
      <p><a href="/#preinscription">Être informé du lancement à Lyon</a></p>
      <nav aria-label="Liens utiles"><ul>
        <li><a href="/catalogue/">Catalogue</a></li>
        <li><a href="/qui-sommes-nous/">Qui sommes-nous ?</a></li>
      </ul></nav>
    </main>`;
  }
  await writePage(route, { ...metadata, contentHtml, indexable: true });
}

for (const [route, metadata] of nonIndexablePages) {
  await writePage(route, { ...metadata, indexable: false });
}

await writePage('/blog', {
  title: 'Actualités | Mon marché futé',
  description: 'Retrouvez les actualités de Mon marché futé.',
  indexable: false,
  contentHtml: '',
});

for (const route of nonIndexableRoutes) {
  await writePage(route, {
    title: 'Espace personnel | Mon marché futé',
    description: 'Espace personnel de Mon marché futé.',
    indexable: false,
    contentHtml: '',
  });
}

for (const post of posts) {
  if (!post.published_at) continue;

  const route = normalizeRoute(`/actualites/${post.slug}`);
  const canonicalUrl = `${siteUrl}${route}`;
  const description = articleDescription(post);
  const image = post.image_url ? new URL(post.image_url, siteUrl).toString() : undefined;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    ...(image ? { image: [image] } : {}),
    datePublished: post.published_at,
    description,
    publisher: { '@id': `${siteUrl}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    inLanguage: 'fr-FR',
  };
  const articleContent = stripHtml(post.content);
  const contentHtml = `<main>
    <p><time datetime="${escapeHtml(post.published_at)}">Publié le ${escapeHtml(formatPublishedDate(post.published_at))}</time></p>
    <h1>${escapeHtml(post.title)}</h1>
    <p>${escapeHtml(description)}</p>
    <p><a href="/actualites/">Toutes les actualités</a></p>
    <div><p>${escapeHtml(articleContent)}</p></div>
    <aside>
      <p>Pour découvrir le fonctionnement des commandes et du retrait à Lyon, consultez la page <a href="/comment-ca-marche/">Comment ça marche ?</a></p>
    </aside>
  </main>`;

  await writePage(route, {
    title: `${post.title} | Mon marché futé`,
    description,
    image,
    type: 'article',
    structuredData: articleSchema,
    indexable: true,
    contentHtml,
  });
  await writePage(`/blog/${post.slug}`, {
    title: 'Redirection vers les actualités | Mon marché futé',
    description: 'Retrouvez cet article dans les actualités de Mon marché futé.',
    indexable: false,
    contentHtml: '',
  });
}

const indexableRouteKeys = new Set([...pages.keys()].map((route) => normalizeRoute(route)));
const sitemapRoutes = [
  ...previousSitemapRoutes
    .map(normalizeRoute)
    .filter((route) => indexableRouteKeys.has(route) || route.startsWith('/actualites/')),
  ...[...pages.keys()].map(normalizeRoute),
  ...publishedPosts
    .map((post) => normalizeRoute(`/actualites/${post.slug}`)),
];
const uniqueRoutes = [...new Set(sitemapRoutes)];
const sitemapEntries = uniqueRoutes.map((route) => (
  `  <url>\n    <loc>${siteUrl}${escapeHtml(route)}</loc>\n  </url>`
));

await writeFile(
  sitemapPath,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.join('\n')}\n</urlset>\n`,
  'utf8',
);

console.log(`SEO prerendered for ${pages.size} public pages and ${posts.length} published article(s).`);
