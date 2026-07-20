export interface Review {
  id: string;
  user: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
}

export interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  edition: string;
  pubDate: string;
  language: string;
  pages: number;
  description: string;
  toc: string[];
  category: string;
  tags: string[];
  price: number;
  mrp: number;
  rating: number;
  ratingsCount: number;
  stock: number;
  bestseller?: boolean;
  featured?: boolean;
  trending?: boolean;
  newRelease?: boolean;
  rare?: boolean;
  exam?: string;
  university?: string;
  course?: string;
  semester?: string;
  coverHue: number;
  reviews: Review[];
}

export interface CartItem {
  bookId: string;
  qty: number;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  type: 'Home' | 'Work';
}

export interface Order {
  id: string;
  items: { bookId: string; qty: number; price: number }[];
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  payment: string;
  address: Address;
  status: 'Placed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  placedAt: string;
  expectedDelivery: string;
  trackingId: string;
  courier: string;
}

export interface User {
  name: string;
  email: string;
  phone: string;
  rewardPoints: number;
}
