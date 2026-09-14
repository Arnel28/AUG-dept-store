export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // cents
  category: string;
  image: string;
  sizes: string[];
  stock: number;
  featured: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number; // cents
  image: string;
  size: string;
  quantity: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
}

export interface Order {
  id: string;
  email: string;
  total: number;
  status: string;
  stripeSessionId?: string | null;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  shippingCountry: string;
  createdAt: string;
  items: OrderItem[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin?: boolean;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockCount: number;
  pendingOrders: number;
}

export interface AdminOrder extends Order {
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

