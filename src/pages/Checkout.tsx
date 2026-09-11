import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../lib/utils';
import type { DeliveryType } from '../lib/types';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const deliveryType: DeliveryType = 'pickup';
  const [slot, setSlot] = useState('');
  const [pickupPoint, setPickupPoint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const deliveryFee = 0;
  const grandTotal = totalPrice + deliveryFee;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!profile) {
      navigate('/connexion');
      return;
    }

    if (!pickupPoint) {
      setError('Veuillez choisir un point de retrait.');
      return;
    }

    if (!slot) {
      setError('Veuillez choisir un créneau.');
      return;
    }

    setLoading(true);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          consumer_id: profile.id,
          status: 'paid',
          total: grandTotal,
          delivery_type: deliveryType,
          delivery_slot: slot,
          pickup_point: pickupPoint,
        })
        .select()
        .single();

      if (orderError) throw orderError;
  if (!orderData) throw new Error('La commande n’a pas pu être créée.');

      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.product.id,
        producer_id: item.product.producer_id,
        product_name: item.product.name,
        quantity: item.quantity,
        price_at_order: item.product.final_price,
        unit: item.product.unit,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // Decrement stock
      for (const item of items) {
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock: Math.max(0, item.product.stock - item.quantity) })
          .eq('id', item.product.id);

        // Stock update is independent from order creation in this demo flow.
        if (stockError) console.error('Stock update failed:', stockError);
      }

      clearCart();
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string'
          ? err.message
          : 'Une erreur est survenue lors de la commande.';
      console.error('Order creation failed:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0 && !success) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-stone-500">Votre panier est vide.</p>
        <Link to="/catalogue" className="btn-primary mt-4">Voir le catalogue</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-stone-800 mb-2">Commande confirmée !</h1>
        <p className="text-stone-500 mb-6">
          Merci pour votre commande. Vous recevrez un email de confirmation. Vous pouvez suivre son statut dans votre espace.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/commandes" className="btn-primary">Voir mes commandes</Link>
          <Link to="/catalogue" className="btn-secondary">Continuer mes achats</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/panier" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-primary-600 mb-4">
        <ArrowLeft className="h-4 w-4" /> Retour au panier
      </Link>

      <h1 className="font-serif text-3xl font-bold text-stone-800 mb-6">Finaliser ma commande</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery type */}
          <div className="card p-6">
            <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-primary-500 bg-primary-50">
              <MapPin className="h-5 w-5 mt-0.5 text-primary-600" />
              <div>
                <p className="font-semibold text-stone-800">Point de retrait</p>
                <p className="text-sm text-stone-500">Retrait gratuit</p>
              </div>
            </div>
          </div>

          {/* Delivery details */}
          <div className="card p-6">
            <h2 className="font-semibold text-stone-800 mb-4">
              Point de retrait
            </h2>
            <div>
              <label className="label">Choisissez un point de retrait</label>
              <select value={pickupPoint} onChange={(e) => setPickupPoint(e.target.value)} className="input">
                <option value="">-- Sélectionner --</option>
                <option value="ferme-brosses">Ferme des Brosses - Saint-Priest</option>
                <option value="vergers-bertrand">Vergers de Bertrand - Villeurbanne</option>
                <option value="maraichage-durand">Maraîchage Durand - Bron</option>
                <option value="marche-lyon">Marché de Lyon - Point relais</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="label">Créneau de retrait</label>
              <select value={slot} onChange={(e) => setSlot(e.target.value)} className="input">
                <option value="">-- Sélectionner --</option>
                <option value="Mercredi 9h-12h">Mercredi 9h - 12h</option>
                <option value="Mercredi 14h-17h">Mercredi 14h - 17h</option>
                <option value="Vendredi 10h-13h">Vendredi 10h - 13h</option>
                <option value="Samedi 9h-12h">Samedi 9h - 12h</option>
              </select>
            </div>
          </div>

          {/* Payment info (simulated) */}
          <div className="card p-6">
            <h2 className="font-semibold text-stone-800 mb-4">Paiement</h2>
            <p className="text-sm text-stone-500 mb-4">
              Le paiement est simulé pour cette démo. Aucune carte ne sera débitée.
            </p>
            <div>
              <label className="label">Numéro de carte (simulé)</label>
              <input className="input" placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="label">Expiration</label>
                <input className="input" placeholder="MM/AA" defaultValue="12/28" />
              </div>
              <div>
                <label className="label">CVC</label>
                <input className="input" placeholder="123" defaultValue="123" />
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="font-semibold text-stone-800 mb-4">Récapitulatif</h2>
            <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-stone-600">{item.product.name} x{item.quantity}</span>
                  <span className="text-stone-800 font-medium">{formatPrice(item.product.final_price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-stone-200 pt-4">
              <div className="flex justify-between text-stone-600">
                <span>Sous-total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Livraison</span>
                <span>{deliveryFee === 0 ? 'Gratuit' : formatPrice(deliveryFee)}</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-stone-200">
              <span>Total</span>
              <span className="text-primary-700">{formatPrice(grandTotal)}</span>
            </div>

            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-4">
              {loading ? 'Traitement...' : `Payer ${formatPrice(grandTotal)}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
