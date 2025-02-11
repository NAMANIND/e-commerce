import { User as SupabaseUser } from "@supabase/supabase-js";

export type Timestamp = string;

export interface User extends Omit<SupabaseUser, "phone"> {
  role: "admin" | "customer";
  name: string | null;
  avatar_url: string | null;
  phone: string | null;
}

export interface Address {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  category_id: string;
  stock_quantity: number;
  sku: string;
  status: "draft" | "published" | "archived";
  images: string[];
  features: string[];
  specifications: Record<string, string>;
  created_at: Timestamp;
  updated_at: Timestamp;
  category?: Category;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: Timestamp;
  updated_at: Timestamp;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shipping_address_id: string;
  payment_status: "pending" | "paid" | "failed";
  payment_method: "razorpay";
  payment_id: string | null;
  subtotal: number;
  shipping_cost: number;
  total: number;
  notes: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
  shipping_address?: Address;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  total: number;
  created_at: Timestamp;
  product?: Product;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
