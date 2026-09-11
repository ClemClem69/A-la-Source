import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Users, ChefHat, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Recipe } from '../lib/types';

export default function RecipeDetail() {
  const { slug } = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecipe() {
      const { data } = await supabase
        .from('recipes')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      setRecipe(data as Recipe | null);
      setLoading(false);
    }
    loadRecipe();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-stone-500">Recette introuvable.</p>
        <Link to="/recettes" className="btn-primary mt-4">Voir toutes les recettes</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/recettes" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-primary-600 mb-4">
        <ArrowLeft className="h-4 w-4" /> Toutes les recettes
      </Link>

      {recipe.image_url && (
        <div className="rounded-xl overflow-hidden mb-6 aspect-video">
          <img src={recipe.image_url} alt={recipe.title} className="h-full w-full object-cover" />
        </div>
      )}

      <h1 className="font-serif text-3xl font-bold text-stone-800 mb-3">{recipe.title}</h1>
      <p className="text-stone-600 mb-4">{recipe.excerpt}</p>

      <div className="flex items-center gap-4 text-sm text-stone-500 mb-6 pb-6 border-b border-stone-200">
        {recipe.prep_time && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Préparation : {recipe.prep_time} min</span>}
        {recipe.cook_time && <span className="flex items-center gap-1"><ChefHat className="h-4 w-4" /> Cuisson : {recipe.cook_time} min</span>}
        {recipe.servings && <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {recipe.servings} personnes</span>}
      </div>

      <div className="prose prose-stone max-w-none">
        <pre className="whitespace-pre-wrap font-sans text-stone-700 leading-relaxed">{recipe.content}</pre>
      </div>
    </div>
  );
}
