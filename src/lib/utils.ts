import type { OrderStatus, ProductUnit } from './types';

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(price));
}

export function formatUnit(unit: ProductUnit): string {
  const units: Record<ProductUnit, string> = {
    kg: 'kg',
    piece: 'pièce',
    bunch: 'botte',
    tray: 'barquette',
    liter: 'litre',
  };
  return units[unit] || unit;
}

export function formatOrderStatus(status: OrderStatus): string {
  const statuses: Record<OrderStatus, string> = {
    pending: 'En attente',
    paid: 'Payée',
    preparing: 'En préparation',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  };
  return statuses[status] || status;
}

export function getOrderStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    pending: 'bg-amber-100 text-amber-800',
    paid: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getSeasonLabel(seasons: string[]): string {
  const labels: Record<string, string> = {
    printemps: 'Printemps',
    ete: 'Été',
    automne: 'Automne',
    hiver: 'Hiver',
    toutes: 'Toute l\'année',
  };
  return seasons.map((s) => labels[s] || s).join(', ');
}

export function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'printemps';
  if (month >= 6 && month <= 8) return 'ete';
  if (month >= 9 && month <= 11) return 'automne';
  return 'hiver';
}
