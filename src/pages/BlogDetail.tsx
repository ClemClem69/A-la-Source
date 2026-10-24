import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import type { BlogPost } from '../lib/types';
import { formatDate } from '../lib/utils';
import NewsletterSignup from '../components/NewsletterSignup';

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function makeMetaDescription(excerpt: string | null | undefined, content: string | null | undefined): string {
  const cleanExcerpt = stripHtml(excerpt ?? '');
  if (cleanExcerpt) return cleanExcerpt;

  const cleanContent = stripHtml(content ?? '');
  if (!cleanContent) return 'Découvrez cet article sur Mon Marché Futé.';
  if (cleanContent.length <= 155) return cleanContent;

  const shortened = cleanContent.slice(0, 155);
  const lastSpace = shortened.lastIndexOf(' ');
  return shortened.slice(0, lastSpace > 0 ? lastSpace : 155).trim();
}

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [relatedPostsError, setRelatedPostsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .not('published_at', 'is', null)
        .maybeSingle();
      setPost(data as BlogPost | null);
      setLoading(false);
    }
    loadPost();
  }, [slug]);

  useEffect(() => {
    let isCurrent = true;

    async function loadRelatedPosts() {
      if (!slug) {
        setRelatedPosts([]);
        return;
      }

      setRelatedPosts([]);
      setRelatedPostsError(null);

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .not('published_at', 'is', null)
        .neq('slug', slug)
        .order('published_at', { ascending: false })
        .limit(3);

      if (!isCurrent) return;

      if (error) {
        setRelatedPostsError(error.message);
        return;
      }

      setRelatedPosts((data as BlogPost[]) || []);
    }

    loadRelatedPosts();

    return () => {
      isCurrent = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-stone-500">Article introuvable.</p>
        <Link to="/actualites" className="btn-primary mt-4">Voir toutes les actualités</Link>
      </div>
    );
  }

  const description = makeMetaDescription(post.excerpt, post.content);
  const canonicalUrl = `https://monmarchefute.com/actualites/${encodeURIComponent(post.slug)}`;
  const imageUrl = post.image_url ? new URL(post.image_url, 'https://monmarchefute.com').toString() : null;
  const dateModified = (post as BlogPost & { updated_at?: string | null }).updated_at || post.published_at;
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    ...(imageUrl ? { image: [imageUrl] } : {}),
    datePublished: post.published_at,
    dateModified,
    inLanguage: 'fr-FR',
    author: {
      '@type': 'Organization',
      name: 'Mon Marché Futé',
      url: 'https://monmarchefute.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mon Marché Futé',
      logo: {
        '@type': 'ImageObject',
        url: 'https://monmarchefute.com/favicon.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };
  const contentText = /<\/?[a-z][\s\S]*>/i.test(post.content)
    ? stripHtml(post.content)
    : post.content;
  const contentParagraphs = contentText.split(/\r?\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const publishedDate = post.published_at
    ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(post.published_at))
    : null;

  return (
    <>
      <Helmet>
        <title>{post.title} | Mon Marché Futé</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${post.title} | Mon Marché Futé`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        {imageUrl && <meta property="og:image" content={imageUrl} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} | Mon Marché Futé`} />
        <meta name="twitter:description" content={description} />
        {imageUrl && <meta name="twitter:image" content={imageUrl} />}
        <script type="application/ld+json">
          {JSON.stringify(articleJsonLd).replace(/</g, '\\u003c')}
        </script>
      </Helmet>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/actualites" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-primary-600 mb-4">
        <ArrowLeft className="h-4 w-4" /> Toutes les actualités
      </Link>

      {post.image_url && (
        <div className="rounded-xl overflow-hidden mb-6 aspect-video">
          <img src={post.image_url} alt={post.title} className="h-full w-full object-cover" />
        </div>
      )}

      {publishedDate && <p className="text-sm text-stone-400 mb-2">Publié le {publishedDate}</p>}
      <h1 className="font-serif text-3xl font-bold text-stone-800 mb-3">{post.title}</h1>
      <p className="text-lg text-stone-600 mb-6">{post.excerpt}</p>

      <div className="prose prose-stone max-w-none">
        {contentParagraphs.map((paragraph, index) => (
          <p key={`${index}-${paragraph.slice(0, 24)}`} className="font-sans text-stone-700 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {relatedPostsError && (
        <p role="alert" className="mt-8 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Impossible de charger les articles à lire aussi : {relatedPostsError}
        </p>
      )}

      {relatedPosts.length > 0 && (
        <section className="mt-10" aria-labelledby="related-articles-title">
          <h2 id="related-articles-title" className="mb-5 font-serif text-2xl font-bold text-stone-800">À lire aussi</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.id}
                to={`/actualites/${relatedPost.slug}`}
                className="card group overflow-hidden"
              >
                <div className="aspect-video overflow-hidden bg-stone-100">
                  {relatedPost.image_url && (
                    <img
                      src={relatedPost.image_url}
                      alt={relatedPost.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="p-4">
                  {relatedPost.published_at && (
                    <p className="mb-1 text-xs text-stone-400">{formatDate(relatedPost.published_at)}</p>
                  )}
                  <h3 className="font-semibold text-stone-800 transition-colors group-hover:text-primary-700">
                    {relatedPost.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10">
        <NewsletterSignup />
      </div>
      </div>
    </>
  );
}
