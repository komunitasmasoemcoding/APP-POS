// ========================
// Auth & User Types
// ========================
export interface User {
  id: string;
  username: string;
  role: string;
  permissions: string[];
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

// ========================
// Product Types
// ========================
export interface Category {
  id: string;
  name: string;
  memberDiscountRate: number | null;
}

export interface Variant {
  id: string;
  sku: string;
  barcode: string | null;
  price: number;
  size: 'SMALL' | 'MEDIUM' | 'LARGE' | null;
  temperature: 'HOT' | 'ICED' | null;
  currentStock: number;
  memberDiscountRate: number | null;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  image: string;
  categoryId: string | null;
  category?: Category;
  variants: Variant[];
  deletedAt?: string | null;
}

// ========================
// Cart Types
// ========================
export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  variantName: string;
  price: number;
  quantity: number;
  discountRate: number;
  discountAmount: number;
}

// ========================
// Member Types
// ========================
export interface Member {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  barcode: string | null;
  createdAt: string;
}

// ========================
// Order Types
// ========================
export type OrderStatus = 'PREPARING' | 'COMPLETED' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'CARD' | 'EWALLET';

export interface OrderItem {
  id: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  discountApplied: number;
  subtotal: number;
  variant?: {
    sku: string;
    product?: { name: string };
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  cashier?: { username: string };
  member?: { name: string } | null;
  items: OrderItem[];
}

// ========================
// Stock Types
// ========================
export interface StockEntry {
  variantId: string;
  sku: string;
  productName: string;
  currentStock: number;
}

// ========================
// Analytics Types
// ========================
export interface AnalyticsDaySummary {
  revenue: number;
  orders: number;
}

export interface AnalyticsSummary {
  today: AnalyticsDaySummary;
  yesterday: AnalyticsDaySummary;
}

export interface TopProduct {
  productName: string;
  sku: string;
  totalSold: number;
  totalRevenue: number;
}

export interface SalesGraphPoint {
  date: string;
  revenue: number;
  orders: number;
}
