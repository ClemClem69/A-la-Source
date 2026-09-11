export type UserRole = 'consumer' | 'producer' | 'admin';

export type ProducerStatus = 'pending' | 'active' | 'rejected';

export type ProductUnit = 'kg' | 'piece' | 'bunch' | 'tray' | 'liter';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type DeliveryType = 'pickup';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  preferences: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Producer {
  id: string;
  user_id: string;
  company_name: string;
  siret: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  certifications: string[];
  status: ProducerStatus;
  logo_url: string | null;
  cover_url: string | null;
  farming_methods: string | null;
  delivery_zones: string[];
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  producer_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number; // Prix producteur suggéré (ce que reçoit directement le producteur)
  final_price: number; // Prix consommateur (ce que paie le client)
  pricing_status: 'pending' | 'validated'; // Statut de validation du prix consommateur
  unit: ProductUnit;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  image_url: string | null;
  season: string[];
  created_at: string;
  producer?: Producer;
  category?: Category;
}

export interface Order {
  id: string;
  consumer_id: string;
  status: OrderStatus;
  total: number;
  delivery_type: DeliveryType;
  delivery_slot: string | null;
  pickup_point: string | null;
  payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  producer_id: string;
  product_name: string;
  quantity: number;
  price_at_order: number;
  unit: ProductUnit;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string | null;
  producer_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: Pick<Profile, 'full_name'>;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  author_id: string | null;
  published_at: string | null;
  created_at: string;
}

export interface Recipe {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  published_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  order_id: string | null;
  content: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Settings {
  id: number;
  platform_commission: number;
  validation_rules: string | null;
  created_at: string;
}
