import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, ChefHat } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Recipe } from '../lib/types';

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecipes() {
      const { data } = await supabase
        .from('recipes')
        .select('*')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false });
      setRecipes((data as Recipe[]) || []);
      setLoading(false);
    }
    loadRecipes();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-serif text-3xl font-bold text-stone-800 mb-2">Recettes & conseils</h1>
      <p className="text-stone-500 mb-8">Des idées simples et savoureuses avec les produits de saison.</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse h-72" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Link key={recipe.id} to={`/recettes/${recipe.slug}`} className="card overflow-hidden group">
              <div className="aspect-video overflow-hidden bg-stone-100">
                {recipe.image_url && (
                  <img src={recipe.image_url} alt={recipe.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-stone-800 group-hover:text-primary-700 transition-colors">{recipe.title}</h3>
                <p className="text-sm text-stone-500 mt-1 line-clamp-2">{recipe.excerpt}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-stone-500">
                  {recipe.prep_time && (
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {recipe.prep_time} min</span>
                  )}
                  {recipe.cook_time && (
                    <span className="flex items-center gap-1"><ChefHat className="h-3.5 w-3.5" /> {recipe.cook_time} min</span>
                  )}
                  {recipe.servings && (
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {recipe.servings} pers.</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
