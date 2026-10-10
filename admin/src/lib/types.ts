export type Role = 'ADMIN' | 'OPERATOR' | 'CUSTOMER';
export interface User { id: string; name: string; email: string; role: Role; active: boolean; phone?: string | null }
export interface SessionData { user: User | null; csrfToken: string }
export interface Category { id: string; name: string; slug: string; description?: string | null; active?: boolean }
export interface Flavor { id: string; name: string; active: boolean }
export interface Extra { id: string; name: string; imageUrl?: string | null; priceMinor: number; active: boolean }
export interface Presentation { id: string; name: string; priceMinor: number; stock: number; active: boolean; productId?: string; product?: { name: string } }
export interface Product { id: string; slug: string; name: string; description: string; flavorId: string | null; flavor: string | null; imageUrl: string; featured: boolean; active: boolean; categoryId: string; category?: Category; presentations: Presentation[]; extras: Extra[] }
export interface Catalog { products: Product[]; categories: Category[]; flavors: Flavor[]; extras: Extra[] }
export interface ShopSettings { name: string; description: string; currency: string; locale: string; address: string; city: string; phone: string; email: string; hours: string; coverageText: string; deliveryFeeMinor: number; deliveryEnabled: boolean }
export interface Address { id: string; label: string; address: string; city: string; reference?: string | null; recipientName?: string; phone?: string; isDefault?: boolean }
export type OrderStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'DISPATCHED' | 'CANCELED';
export type PaymentMethod = 'DEMO_CARD' | 'DEMO_QR';
export type PaymentStatus = 'APPROVED' | 'REJECTED' | 'REFUNDED';
export interface OrderItem { id: string; productName: string; presentationName: string; quantity: number; unitPriceMinor: number; totalMinor: number; flavors: string[]; extras: { name: string; priceMinor: number }[] }
export interface PaymentAttempt { id: string; method: PaymentMethod; status: PaymentStatus; amountMinor: number; createdAt: string; orderId?: string; order?: { code: string; customerName: string } }
export interface OrderHistory { id: string; fromStatus?: OrderStatus | null; toStatus: OrderStatus; note?: string | null; createdAt: string }
export interface Order { id: string; code: string; status: OrderStatus; customerName: string; email: string; phone: string; deliveryAddress: string; city: string; reference?: string | null; subtotalMinor: number; deliveryFeeMinor: number; totalMinor: number; currency: string; createdAt: string; dispatchedAt?: string | null; items: OrderItem[]; payments: PaymentAttempt[]; history: OrderHistory[] }
export interface CartItem { key: string; productId: string; productName: string; productSlug: string; imageUrl: string; presentationId: string; presentationName: string; quantity: number; unitPriceMinor: number; flavorIds: string[]; flavorNames: string[]; extraIds: string[]; extras: { name: string; priceMinor: number }[] }
