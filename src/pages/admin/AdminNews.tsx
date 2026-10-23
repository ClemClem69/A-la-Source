import { useEffect, useState } from 'react';
import { Newspaper, Pencil, Plus, Trash2, X } from 'lucide-react';
import AdminBackButton from '../../components/AdminBackButton';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { BlogPost } from '../../lib/types';
import { formatDate, slugify } from '../../lib/utils';

const ADMIN_EMAIL = 'ledclement341@gmail.com';
const storageBucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'product-images';

const emptyForm = {
  title: '',
  excerpt: '',
  content: '',
  imageUrl: '',
};

export default function AdminNews() {
  const { profile } = useAuth();
  const isAuthorized = profile?.email === ADMIN_EMAIL;
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [publishNow, setPublishNow] = useState(true);
  const [originalPublishedAt, setOriginalPublishedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthorized) return;
    loadPosts();
  }, [isAuthorized]);

  async function loadPosts() {
    const { data, error: loadError } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (loadError) setError(loadError.message);
    setPosts((data as BlogPost[]) || []);
    setLoading(false);
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setPublishNow(true);
    setOriginalPublishedAt(null);
    setError(null);
    setSuccess(null);
    setShowForm(true);
  }

  function openEdit(post: BlogPost) {
    setEditingId(post.id);
    setForm({
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content,
      imageUrl: post.image_url || '',
    });
    setImageFile(null);
    setPublishNow(Boolean(post.published_at));
    setOriginalPublishedAt(post.published_at);
    setError(null);
    setSuccess(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
  }

  async function uniqueSlug(title: string, currentId?: string | null) {
    const base = slugify(title) || `article-${Date.now()}`;
    let slug = base;
    let attempt = 1;

    while (true) {
      let query = supabase.from('blog_posts').select('id').eq('slug', slug);
      if (currentId) query = query.neq('id', currentId);
      const { data } = await query.maybeSingle();
      if (!data) return slug;
      attempt += 1;
      slug = `${base}-${attempt}`;
    }
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) return form.imageUrl || null;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `news-images/${Date.now()}-${slugify(form.title) || 'article'}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from(storageBucket)
      .upload(fileName, imageFile, { cacheControl: '3600', upsert: true });

    if (uploadError) {
      setError(`Impossible d'envoyer l'image : ${uploadError.message}`);
      return null;
    }

    const publicUrlResponse = supabase.storage.from(storageBucket).getPublicUrl(fileName);
    return publicUrlResponse.data.publicUrl;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    const imageUrl = await uploadImage();
    if (imageFile && !imageUrl) {
      setSaving(false);
      return;
    }

    const slug = await uniqueSlug(form.title, editingId);
    const payload = {
      title: form.title.trim(),
      slug,
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim(),
      image_url: imageUrl,
      author_id: profile.id,
      published_at: publishNow ? originalPublishedAt || new Date().toISOString() : null,
    };

    const result = editingId
      ? await supabase.from('blog_posts').update(payload).eq('id', editingId)
      : await supabase.from('blog_posts').insert(payload);

    if (result.error) {
      setError(result.error.message);
    } else {
      setSuccess(publishNow ? 'Article publié.' : 'Brouillon enregistré.');
      closeForm();
      await loadPosts();
    }
    setSaving(false);
  }

  async function handleDelete(post: BlogPost) {
    if (!window.confirm(`Supprimer l'article « ${post.title} » ?`)) return;
    const { error: deleteError } = await supabase.from('blog_posts').delete().eq('id', post.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setPosts((current) => current.filter((item) => item.id !== post.id));
  }

  if (!isAuthorized) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="card p-6">
          <Newspaper className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-700 font-semibold mb-2">Accès non autorisé</p>
          <p className="text-stone-500">Seul le compte administrateur peut publier des actualités.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <AdminBackButton />
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-800">Actualités</h1>
          <p className="mt-1 text-stone-600">Rédigez et publiez les articles visibles dans l’onglet Actualités.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Nouvel article
        </button>
      </div>

      {error && <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
      {success && <p className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">{success}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-8 space-y-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-stone-800">{editingId ? 'Modifier l’article' : 'Nouvel article'}</h2>
            <button type="button" onClick={closeForm} className="rounded-lg p-1 text-stone-500 hover:bg-stone-100" aria-label="Fermer">
              <X className="h-5 w-5" />
            </button>
          </div>
          <label className="label">Titre
            <input
              value={form.title}
              onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
              className="input mt-1"
              required
            />
          </label>
          <label className="label">Chapô
            <input
              value={form.excerpt}
              onChange={(e) => setForm((current) => ({ ...current, excerpt: e.target.value }))}
              className="input mt-1"
              placeholder="Court résumé affiché dans la liste"
            />
          </label>
          <label className="label">Contenu
            <textarea
              value={form.content}
              onChange={(e) => setForm((current) => ({ ...current, content: e.target.value }))}
              className="input mt-1 min-h-40 resize-y"
              required
            />
          </label>
          <label className="label">Image (URL)
            <input
              value={form.imageUrl}
              onChange={(e) => setForm((current) => ({ ...current, imageUrl: e.target.value }))}
              className="input mt-1"
              placeholder="https://..."
            />
          </label>
          <label className="label">Ou importer une image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm text-stone-600"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} />
            Publier immédiatement (sinon enregistrer en brouillon)
          </label>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : publishNow ? 'Publier' : 'Enregistrer le brouillon'}
          </button>
        </form>
      )}

      {posts.length === 0 ? (
        <div className="card p-10 text-center text-stone-500">Aucun article pour le moment.</div>
      ) : (
        <div className="card divide-y divide-stone-100 overflow-hidden">
          {posts.map((post) => (
            <div key={post.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium text-stone-800">{post.title}</p>
                <p className="mt-1 text-xs text-stone-500">
                  {post.published_at ? `Publié le ${formatDate(post.published_at)}` : 'Brouillon'}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => openEdit(post)} className="btn-secondary py-1.5 text-sm">
                  <Pencil className="h-4 w-4" /> Modifier
                </button>
                <button type="button" onClick={() => handleDelete(post)} className="btn-secondary py-1.5 text-sm text-red-600">
                  <Trash2 className="h-4 w-4" /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
