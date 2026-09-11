import { useEffect, useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Leaf } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product, Category } from '../lib/types';
import ProductCard from '../components/ProductCard';
import { getCurrentSeason } from '../lib/utils';

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [onlyBio, setOnlyBio] = useState(false);
  const [onlySeasonal, setOnlySeasonal] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, producer:producers(*), category:categories(*)')
          .eq('is_active', true)
          .eq('pricing_status', 'validated')
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
      ]);

      setProducts((productsRes.data as unknown as Product[]) || []);
      setCategories((categoriesRes.data as Category[]) || []);
      setLoading(false);
    }
    loadData();
  }, []);

  const currentSeason = getCurrentSeason();

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description?.toLowerCase().includes(q) ?? false)
      );
    }

    if (selectedCategory) {
      result = result.filter((p) => p.category_id === selectedCategory);
    }

    if (onlyBio) {
      result = result.filter(
        (p) => p.producer?.certifications?.some((c) => c.toLowerCase().includes('bio')) ?? false
      );
    }

    if (onlySeasonal) {
      result = result.filter(
        (p) => p.season?.includes(currentSeason) || p.season?.includes('toutes') || (p.season?.length ?? 0) === 0
      );
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.final_price - b.final_price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.final_price - a.final_price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [products, search, selectedCategory, onlyBio, onlySeasonal, sortBy, currentSeason]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-serif text-3xl font-bold text-stone-800 mb-6">Catalogue</h1>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0 space-y-6`}>
          <div>
            <h3 className="font-semibold text-stone-700 mb-3">Catégories</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('')}
                className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  !selectedCategory ? 'bg-primary-100 text-primary-700 font-medium' : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                Toutes les catégories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedCategory === cat.id ? 'bg-primary-100 text-primary-700 font-medium' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyBio}
                onChange={(e) => setOnlyBio(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-stone-700">Bio uniquement</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlySeasonal}
                onChange={(e) => setOnlySeasonal(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-stone-700">De saison</span>
            </label>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-stone-500">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 focus:border-primary-500 focus:outline-none"
            >
              <option value="newest">Plus récents</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="name">Nom (A-Z)</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card animate-pulse h-64" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Leaf className="h-12 w-12 text-stone-300 mb-4" />
              <p className="text-stone-500">Aucun produit ne correspond à vos critères.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
