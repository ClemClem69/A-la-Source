import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Leaf } from 'lucide-react';
import type { Product } from '../lib/types';
import { formatPrice, formatUnit } from '../lib/utils';
import { useCart } from '../contexts/CartContext';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="card overflow-hidden group flex flex-col">
      <Link to={`/produit/${product.id}`} className="block relative overflow-hidden aspect-square bg-stone-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary-50">
            <Leaf className="h-12 w-12 text-primary-300" />
          </div>
        )}
        {product.is_featured && (
          <span className="absolute top-2 left-2 badge bg-secondary-500 text-white">
            <Star className="h-3 w-3" /> Coup de cœur
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-2 right-2 badge bg-red-500 text-white">Épuisé</span>
        )}
        {product.stock > 0 && product.stock <= 10 && (
          <span className="absolute top-2 right-2 badge bg-amber-500 text-white">Plus que {product.stock}</span>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link to={`/produit/${product.id}`}>
          <h3 className="font-semibold text-stone-800 group-hover:text-primary-700 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        {product.producer && (
          <Link to={`/producteur/${product.producer.id}`} className="text-xs text-stone-500 hover:text-primary-600 mt-0.5">
            {product.producer.company_name}
          </Link>
        )}
        <span className="french-badge mt-2 w-fit">Produit français</span>
        <p className="text-sm text-stone-500 mt-1 line-clamp-2 flex-1">
          {product.description || 'Produit frais du producteur'}
        </p>

        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-primary-700">{formatPrice(product.final_price)}</span>
            <span className="text-sm text-stone-500"> / {formatUnit(product.unit)}</span>
          </div>
          <button
            onClick={() => addItem(product)}
            disabled={product.stock === 0}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-90"
            aria-label="Ajouter au panier"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
