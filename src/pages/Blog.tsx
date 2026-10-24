import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { BlogPost } from '../lib/types';
import { formatDate } from '../lib/utils';
import { Helmet } from 'react-helmet-async';


export default function Blog() {
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
    '@id': 'https://monmarchefute.com/actualites#blog',
    url: 'https://monmarchefute.com/actualites',
    name: 'Actualités, produits de saison et conseils | Mon Marché Futé',
    description: 'Retrouvez les actualités de Mon Marché Futé, les fruits et légumes de saison, des conseils pour acheter local et les nouveautés de la plateforme.',
    inLanguage: 'fr-FR',
    isPartOf: { '@id': 'https://monmarchefute.com/#website' },
    publisher: { '@id': 'https://monmarchefute.com/#organization' },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `https://monmarchefute.com/actualites/${encodeURIComponent(post.slug)}`,
      ...(post.excerpt ? { description: post.excerpt } : {}),
      ...(post.image_url ? { image: new URL(post.image_url, 'https://monmarchefute.com').toString() } : {}),
      datePublished: post.published_at,
      dateModified: post.published_at,
      author: { '@id': 'https://monmarchefute.com/#organization' },
      publisher: { '@id': 'https://monmarchefute.com/#organization' },
    })),
  };

  return (
    <>
      <Helmet>
        <title>Actualités, produits de saison et conseils | Mon Marché Futé</title>
        <meta
          name="description"
          content="Retrouvez les actualités de Mon Marché Futé, les fruits et légumes de saison, des conseils pour acheter local et les nouveautés de la plateforme."
        />
        <link rel="canonical" href="https://monmarchefute.com/actualites" />
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
            <Link key={post.id} to={`/actualites/${post.slug}`} className="card overflow-hidden group">
              <div className="aspect-video overflow-hidden bg-stone-100">
                {post.image_url && (
                  <img src={post.image_url} alt={post.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-stone-400 mb-1">{post.published_at && formatDate(post.published_at)}</p>
                <h3 className="font-semibold text-stone-800 group-hover:text-primary-700 transition-colors">{post.title}</h3>
                <p className="text-sm text-stone-500 mt-1 line-clamp-2">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
      </div>
    </>
  );
}
