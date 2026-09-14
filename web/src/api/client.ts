import type { Product, Order, User, AdminStats, AdminOrder } from "../types";

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
  : "/api";
const TOKEN_KEY = "aug_dept_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(BASE + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed (${res.status})`);
  }
  return data as T;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CheckoutPayload {
  items: { productId: string; size: string; quantity: number }[];
  shipping: {
    name: string;
    email: string;
    address: string;
    city: string;
    zip: string;
    country: string;
  };
}

export type CheckoutResponse =
  | { mode: "stripe"; url: string }
  | { mode: "demo"; orderId: string };

export const api = {
  // Products
  products: (params?: { category?: string; q?: string; featured?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.category && params.category !== "All")
      qs.set("category", params.category);
    if (params?.q) qs.set("q", params.q);
    if (params?.featured) qs.set("featured", "true");
    const suffix = qs.toString() ? `?${qs}` : "";
    return request<Product[]>(`/products${suffix}`);
  },
  product: (id: string) => request<Product>(`/products/${id}`),
  categories: () => request<string[]>(`/products/categories`),

  // Auth
  register: (body: { email: string; password: string; name: string }) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  me: () => request<{ user: User }>("/auth/me"),

  // Checkout + orders
  checkout: (body: CheckoutPayload) =>
    request<CheckoutResponse>("/checkout", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  confirm: (sessionId: string) =>
    request<{ ok: boolean; order?: Order; demo?: boolean }>(
      "/checkout/confirm",
      { method: "POST", body: JSON.stringify({ sessionId }) }
    ),
  orders: () => request<Order[]>("/orders"),
  order: (id: string) => request<Order>(`/orders/${id}`),

  // Admin
  adminStats: () => request<AdminStats>("/admin/stats"),
  adminProducts: () => request<Product[]>("/admin/products"),
  adminCreateProduct: (body: {
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    sizes: string[];
    stock: number;
    featured?: boolean;
  }) =>
    request<Product>("/admin/products", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  adminUpdateProduct: (
    id: string,
    body: Partial<{
      name: string;
      description: string;
      price: number;
      category: string;
      image: string;
      sizes: string[];
      stock: number;
      featured: boolean;
    }>
  ) =>
    request<Product>(`/admin/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  adminDeleteProduct: (id: string) =>
    request<{ ok: boolean; id: string }>(`/admin/products/${id}`, {
      method: "DELETE",
    }),
  adminOrders: () => request<AdminOrder[]>("/admin/orders"),
  adminUpdateOrderStatus: (id: string, status: string) =>
    request<AdminOrder>(`/admin/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
