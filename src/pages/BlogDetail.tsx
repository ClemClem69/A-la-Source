import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { BlogPost } from '../lib/types';
import { formatDate } from '../lib/utils';

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      setPost(data as BlogPost | null);
      setLoading(false);
    }
    loadPost();
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
        <Link to="/blog" className="btn-primary mt-4">Voir tous les articles</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-primary-600 mb-4">
        <ArrowLeft className="h-4 w-4" /> Tous les articles
      </Link>

      {post.image_url && (
        <div className="rounded-xl overflow-hidden mb-6 aspect-video">
          <img src={post.image_url} alt={post.title} className="h-full w-full object-cover" />
        </div>
      )}

      <p className="text-sm text-stone-400 mb-2">{post.published_at && formatDate(post.published_at)}</p>
      <h1 className="font-serif text-3xl font-bold text-stone-800 mb-3">{post.title}</h1>
      <p className="text-lg text-stone-600 mb-6">{post.excerpt}</p>

      <div className="prose prose-stone max-w-none">
        <pre className="whitespace-pre-wrap font-sans text-stone-700 leading-relaxed">{post.content}</pre>
      </div>
    </div>
  );
}
