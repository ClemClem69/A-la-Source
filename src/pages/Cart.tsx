import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { formatPrice, formatUnit } from '../lib/utils';

export default function Cart() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 mb-4">
          <ShoppingBag className="h-10 w-10 text-primary-400" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-stone-800 mb-2">Votre panier est vide</h1>
        <p className="text-stone-500 mb-6">Découvrez nos produits frais et ajoutez-les à votre panier.</p>
        <Link to="/catalogue" className="btn-primary">
          Voir le catalogue <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-serif text-3xl font-bold text-stone-800 mb-6">Mon panier</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.product.id} className="card p-4 flex gap-4">
              <Link to={`/produit/${item.product.id}`} className="shrink-0">
                <div className="h-20 w-20 rounded-lg overflow-hidden bg-stone-100">
                  {item.product.image_url ? (
                    <img src={item.product.image_url} alt={item.product.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
              </Link>

              <div className="flex-1 flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <Link to={`/produit/${item.product.id}`}>
                      <h3 className="font-semibold text-stone-800 hover:text-primary-700">{item.product.name}</h3>
                    </Link>
                    {item.product.producer && (
                      <p className="text-xs text-stone-500">{item.product.producer.company_name}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-stone-400 hover:text-red-500 transition-colors"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-end justify-between mt-auto">
                  <div className="flex items-center rounded-lg border border-stone-300">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="px-2.5 py-1.5 text-stone-600 hover:bg-stone-100 rounded-l-lg"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-3 py-1.5 text-sm font-semibold min-w-10 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="px-2.5 py-1.5 text-stone-600 hover:bg-stone-100 rounded-r-lg"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-700">
                      {formatPrice(item.product.final_price * item.quantity)}
                    </p>
                    <p className="text-xs text-stone-500">
                      {formatPrice(item.product.final_price)} / {formatUnit(item.product.unit)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="font-semibold text-stone-800 mb-4">Récapitulatif</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Sous-total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Retrait</span>
                <span>Calculée à l'étape suivante</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-stone-200">
              <span>Total</span>
              <span className="text-primary-700">{formatPrice(totalPrice)}</span>
            </div>
            <button onClick={() => navigate('/commander')} className="btn-primary w-full mt-4">
              Passer commande <ArrowRight className="h-4 w-4" />
            </button>
            <Link to="/catalogue" className="btn-secondary w-full mt-2">
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
