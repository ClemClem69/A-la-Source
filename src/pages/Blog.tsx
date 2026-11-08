import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { BlogPost } from '../lib/types';
import { formatDate } from '../lib/utils';
import { Helmet } from 'react-helmet-async';
import SeoMetadata from '../components/SeoMetadata';

function articleSummary(post: BlogPost): string {
  const source = (post.excerpt || post.content).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (source.length <= 220) return source;
  const shortened = source.slice(0, 220);
  const lastSpace = shortened.lastIndexOf(' ');
  return `${shortened.slice(0, lastSpace > 0 ? lastSpace : 220).trim()}…`;
}

export default function Blog() {
  const pageTitle = 'Actualités | Mon marché futé';
  const pageDescription = 'Parcourez les articles de Mon Marché Futé sur les fruits et légumes, leur saisonnalité et les circuits courts.';
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false });
      setPosts((data as BlogPost[]) || []);
      setLoading(false);
    }
    loadPosts();
  }, []);

  const blogStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': 'https://monmarchefute.com/actualites/#blog',
    url: 'https://monmarchefute.com/actualites/',
    name: pageTitle,
    description: pageDescription,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': 'https://monmarchefute.com/#website' },
    publisher: { '@id': 'https://monmarchefute.com/#organization' },
    blogPost: posts
      .filter((post) => post.published_at)
      .map((post) => ({
        '@type': 'BlogPosting',
        headline: post.title,
        url: `https://monmarchefute.com/actualites/${encodeURIComponent(post.slug)}/`,
        datePublished: post.published_at,
        description: articleSummary(post),
        mainEntityOfPage: `https://monmarchefute.com/actualites/${encodeURIComponent(post.slug)}/`,
        publisher: { '@id': 'https://monmarchefute.com/#organization' },
      })),
  };

  return (
    <>
      <SeoMetadata title={pageTitle} description={pageDescription} canonicalPath="/actualites/" />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(blogStructuredData).replace(/</g, '\\u003c')}</script>
      </Helmet>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-serif text-3xl font-bold text-stone-800 mb-2">Actualités</h1>
      <p className="text-stone-500 mb-8">Nouveautés, conseils et histoires de nos producteurs.</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse h-72" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="card p-12 text-center">
          <Newspaper className="mx-auto mb-3 h-10 w-10 text-stone-300" />
          <p className="text-stone-500">Aucune actualité publiée pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} to={`/actualites/${post.slug}/`} className="card overflow-hidden group">
              <div className="aspect-video overflow-hidden bg-stone-100">
                {post.image_url && (
                  <img src={post.image_url} alt={post.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                )}
              </div>
              <div className="p-4">
                {post.published_at && (
                  <time dateTime={post.published_at} className="text-xs text-stone-400 mb-1 block">
                    {formatDate(post.published_at)}
                  </time>
                )}
                <h3 className="font-semibold text-stone-800 group-hover:text-primary-700 transition-colors">{post.title}</h3>
                <p className="text-sm text-stone-500 mt-1 line-clamp-2">{articleSummary(post)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
      </div>
    </>
  );
}
