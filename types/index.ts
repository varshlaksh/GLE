// ── Product ──────────────────────────────────────────
export interface Product {
  id:          string
  name:        string
  slug:        string        // SEO-friendly URL slug
  description: string
  price:       number
  images:      string[]
  category:    string
  category_id:  string;
  categories?:  { name: string; slug: string } | null;
  stock:       number
  is_active:   boolean
  created_at:  string
}

// ── Cart ─────────────────────────────────────────────
export interface CartItem {
  product:  Product
  quantity: number
}

// ── Order ────────────────────────────────────────────
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface OrderTimelineEntry {
  status:    OrderStatus
  timestamp: string
  note?:     string
}

export interface OrderItem {
  id:         string
  product_id: string
  product:    Product
  quantity:   number
  unit_price: number
}

export interface ShippingAddress {
  full_name: string
  phone:     string
  line1:     string
  line2?:    string
  city:      string
  state:     string
  pincode:   string
}

export interface Order {
  id:               string
  user_id:          string
  items:            OrderItem[]
  status:           OrderStatus
  total:            number
  shipping_address: ShippingAddress
  status_history:   OrderTimelineEntry[]
  payment_method:   'online' | 'cod'
  razorpay_order_id?:  string
  razorpay_payment_id?: string
  created_at:       string
}

// ── Store Settings ────────────────────────────────────
export interface StoreSettings {
  id:          number
  cod_enabled: boolean
  updated_at:  string
}

// ── Profile ───────────────────────────────────────────
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

export interface ProfileAddress {
  line1:   string
  line2?:  string
  city:    string
  state:   string
  pincode: string
}

export interface Profile {
  id:          string
  role:        string
  full_name?:  string
  phone?:      string
  avatar_url?: string
  gender?:     Gender
  address?:    ProfileAddress
  created_at:  string
}

// ── API Response ──────────────────────────────────────
export interface ApiResponse<T> {
  data?:    T
  error?:   string
  message?: string
}

// ── Admin Dashboard ───────────────────────────────────
export interface AdminStats {
  totalRevenue:     number
  totalOrders:      number
  pendingOrders:    number
  totalProducts:    number
  lowStockProducts: number
}

export interface AdminDashboardStats extends AdminStats {
  totalUsers:     number
  revenueByDay:   { date: string; revenue: number }[]
  ordersByStatus: { status: string; count: number }[]
  topCategories:  { category: string; count: number }[]
  recentOrders:   Order[]
}
