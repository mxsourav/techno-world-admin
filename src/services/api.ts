const getApiUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  // If loaded in browser over HTTPS, never use insecure http:// (blocked by browser as Mixed Content)
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (envUrl && envUrl.startsWith('https://')) {
      return envUrl;
    }
    return 'https://techno-world-api-qw4j.onrender.com/api/v1';
  }
  if (import.meta.env.PROD) {
    if (envUrl && envUrl.startsWith('https://')) {
      return envUrl;
    }
    return 'https://techno-world-api-qw4j.onrender.com/api/v1';
  }
  return envUrl || 'http://localhost:5000/api/v1';
};

const API_URL = getApiUrl();

export const getImageUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = API_URL.replace('/api/v1', '');
  return `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
};

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    let msg = data.message || `Server returned ${response.status}`;
    if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      const detailed = data.errors.map((e: any) => `${e.field ? e.field + ': ' : ''}${e.message}`).join(', ');
      msg = `${msg}: ${detailed}`;
    }
    throw new ApiError(response.status, msg);
  }
  return data;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = await res.json();
    const newToken = data.data?.accessToken || data.accessToken || '';
    if (newToken) {
      localStorage.setItem('tw_admin_token', newToken);
    }
    return newToken;
  } catch (err) {
    return null;
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});
  const token = localStorage.getItem('tw_admin_token');
  if (token && token !== 'undefined' && token !== 'null' && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const mergedOptions: RequestInit = {
    cache: 'no-store',
    ...options,
    headers,
    credentials: 'include',
  };

  let response = await fetch(url, mergedOptions);

  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;

      if (newToken) {
        onRefreshed(newToken);
        headers.set('Authorization', `Bearer ${newToken}`);
        return fetch(url, { ...options, headers, credentials: 'include' });
      } else {
        localStorage.removeItem('tw_admin_token');
      }
    } else {
      return new Promise<Response>((resolve) => {
        subscribeTokenRefresh((newToken) => {
          headers.set('Authorization', `Bearer ${newToken}`);
          resolve(fetch(url, { ...options, headers, credentials: 'include' }));
        });
      });
    }
  }

  return response;
}

export const api = {
  get: async <T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> => {
    try {
      const url = new URL(`${API_URL}${endpoint}`);
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, String(params[key]));
          }
        });
      }

      const response = await fetchWithAuth(url.toString(), {
        headers: { 'Content-Type': 'application/json' },
      });
      
      return handleResponse<T>(response);
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      console.error(`API GET ${endpoint} error:`, error);
      throw new ApiError(0, 'Unable to connect to the server. Please check your internet connection.');
    }
  },

  post: async <T>(endpoint: string, body?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await fetchWithAuth(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      return handleResponse<T>(response);
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      console.error(`API POST ${endpoint} error:`, error);
      throw new ApiError(0, 'Unable to connect to the server.');
    }
  },

  upload: async <T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> => {
    try {
      const response = await fetchWithAuth(`${API_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });
      return handleResponse<T>(response);
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      console.error(`API UPLOAD ${endpoint} error:`, error);
      throw new ApiError(0, 'Unable to connect to the server.');
    }
  },

  patch: async <T>(endpoint: string, body?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await fetchWithAuth(`${API_URL}${endpoint}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      return handleResponse<T>(response);
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(0, 'Unable to connect to the server.');
    }
  },

  put: async <T>(endpoint: string, body?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await fetchWithAuth(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      return handleResponse<T>(response);
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(0, 'Unable to connect to the server.');
    }
  },

  delete: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const response = await fetchWithAuth(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      return handleResponse<T>(response);
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(0, 'Unable to connect to the server.');
    }
  },
};

// ─── Domain Services ──────────────────────────────────────────

export const categoryService = {
  getCategories: () => api.get<any[]>('/categories'),
  getCategoryBySlug: (slug: string) => api.get<any>(`/categories/${slug}`),
};

export const bookService = {
  getBooks: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    sort?: string;
    author?: string;
    publisher?: string;
    featured?: boolean;
    newArrival?: boolean;
    bestSeller?: boolean;
    ids?: string;
  }) => api.get<any[]>('/books', params as Record<string, string | number | boolean>),
  
  getBookBySlug: (slug: string) => api.get<any>(`/books/${slug}`),
};

export const adminService = {
  getAdminCatalog: (params?: any) => api.get<any[]>('/admin/books/catalog', params),
  createBook: (data: any) => api.post<any>('/admin/books', data),
  updateBook: (id: string, data: any) => api.patch<any>(`/admin/books/${id}`, data),
  quickUpdateStock: (id: string, data: { stock?: number, reservedStock?: number }) => api.patch<any>(`/admin/books/${id}/stock`, data),
  deleteBook: (id: string) => api.delete<any>(`/admin/books/${id}`),
  deleteAllBooks: () => api.delete<any>('/admin/books/all'),
  getBookLogs: (id: string) => api.get<any>(`/admin/books/${id}/logs`),
  getStats: () => api.get<any>('/admin/stats'),
  analyzeImport: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload<any>('/admin/import/analyze', formData);
  },
  executeImport: (payload: any) => api.post<any>('/admin/import/execute', payload),
  getBookPreview: (id: string) => api.get<any>(`/admin/books/${id}/preview`),
  uploadBookCover: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload<any>(`/admin/books/${id}/cover`, formData);
  },
  uploadBookPdf: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload<any>(`/admin/books/${id}/pdf`, formData);
  },
  getSettings: () => api.get<any>('/admin/settings'),
  updateProfile: (data: { name?: string; email?: string; phone?: string | null; password?: string }) =>
    api.patch<any>('/admin/profile', data),
  updateSmtp: (data: {
    senderEmail: string;
    senderName: string;
    host: string;
    port: number;
    user: string;
    pass: string;
    secure: boolean;
  }) => api.put<any>('/admin/smtp', data),
  testSmtp: (data: {
    toEmail: string;
    host?: string;
    port?: number;
    user?: string;
    pass?: string;
    senderEmail?: string;
    senderName?: string;
  }) => api.post<any>('/admin/smtp/test', data),
  getEmailLogs: (params?: { limit?: number }) => api.get<any[]>('/admin/emails', params),
  getCustomers: (params?: { search?: string; page?: number; limit?: number }) => api.get<any>('/admin/customers', params),
  getSearchTrends: (params?: { period?: string; startDate?: string; endDate?: string }) =>
    api.get<any>('/admin/analytics/search-trends', params),
};

export const searchService = {
  instant: (q: string) => api.get<any[]>('/search', { q }),
};

export const orderService = {
  create: (data: {
    items: { bookId: string; quantity: number }[];
    addressId?: string;
    paymentMethod?: string;
    couponCode?: string;
    shippingMethod?: string;
    pickupName?: string;
    pickupPhone?: string;
    pickupEmail?: string;
  }) => api.post<any>('/orders', data),
  getUserOrders: () => api.get<any>('/orders/my-orders'),
  getAllOrders: (params?: { status?: string; page?: number; limit?: number }) => api.get<any>('/orders/admin/all', params),
  getNotifications: () => api.get<any>('/orders/admin/notifications'),
  updateStatus: (id: string, status: string, notes?: string, reason?: string) =>
    api.patch<any>(`/orders/admin/${id}/status`, { status, notes, reason }),
  sendCustomEmail: (
    id: string,
    data: {
      subject: string;
      message: string;
      templateType?: 'DELAY_NOTICE' | 'REJECT_NOTICE' | 'ACCEPT_NOTICE' | 'CUSTOM';
      recipientEmail?: string;
      recipientName?: string;
    }
  ) => api.post<any>(`/orders/admin/${id}/email`, data),
  batchUpdateStatus: (data: { orderIds: string[]; status: string; notes?: string; reason?: string }) =>
    api.patch<any>('/orders/admin/batch-status', data),
  batchSendEmail: (data: { orderIds: string[]; subject: string; message: string; templateType?: string }) =>
    api.post<any>('/orders/admin/batch-email', data),
  updateBookDimensions: (bookId: string, data: { dimensions?: string; weight?: number }) =>
    api.patch<any>(`/orders/admin/book/${bookId}/dimensions`, data),
  setPickupSlots: (orderId: string, slots: string[]) =>
    api.post<any>(`/orders/admin/${orderId}/pickup-slots`, { slots }),
  confirmPickupSlot: (orderId: string, selectedSlot: string) =>
    api.post<any>(`/orders/${orderId}/confirm-pickup-slot`, { selectedSlot }),
  markOrderCollected: (orderId: string) =>
    api.post<any>(`/orders/admin/${orderId}/mark-collected`),
};

export const mediaService = {
  list: (folder?: string, type?: string) => {
    const params: any = {};
    if (folder) params.folder = folder;
    if (type) params.type = type;
    return api.get<any[]>('/media', params);
  },
  upload: (file: File, folder?: string, altText?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    if (altText) formData.append('altText', altText);
    return api.upload<any>('/media/upload', formData);
  },
  delete: (id: string) => api.delete<any>(`/media/${id}`),
};

export const cmsService = {
  getSections: () => api.get<any[]>('/cms/sections'),
  updateSection: (key: string, data: any) => api.put<any>(`/cms/sections/${key}`, data),
  toggleSection: (key: string) => api.patch<any>(`/cms/sections/${key}/toggle`),
};

export const promotionService = {
  getAll: () => api.get<any[]>('/promotions'),
  create: (data: any) => api.post<any>('/promotions', data),
  update: (id: string, data: any) => api.put<any>(`/promotions/${id}`, data),
  remove: (id: string) => api.delete<any>(`/promotions/${id}`),
  toggleActive: (id: string, status?: string) => api.patch<any>(`/promotions/${id}/toggle`, status ? { status } : undefined)
};

export const campaignService = {
  getAll: () => api.get<any[]>('/campaigns'),
  getById: (id: string) => api.get<any>(`/campaigns/${id}`),
  create: (data: any) => api.post<any>('/campaigns', data),
  update: (id: string, data: any) => api.put<any>(`/campaigns/${id}`, data),
  remove: (id: string) => api.delete<any>(`/campaigns/${id}`),
};

export const pricingService = {
  calculate: (data: { items: { bookId: string; quantity: number }[]; couponCode?: string | null; userId?: string | null }) =>
    api.post<any>('/pricing/calculate', data),
};

export const authService = {
  login: (data: { email: string; password: string }) => api.post<any>('/auth/login', data),
  logout: () => api.post<any>('/auth/logout'),
  me: () => api.get<any>('/auth/me'),
  devGoogleBypass: (data?: { email?: string; name?: string; googleId?: string; avatarUrl?: string }) =>
    api.post<any>('/auth/google/dev-bypass', data || {}),
};

export const profileService = {
  getProfile: () => api.get<any>('/profile'),
  updateProfile: (data: { name?: string; phone?: string | null; avatarUrl?: string | null }) =>
    api.patch<any>('/profile', data),
  getAddresses: () => api.get<any[]>('/profile/address'),
  createAddress: (data: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    postOffice?: string | null;
    landmark?: string | null;
    city: string;
    state: string;
    pincode: string;
    type?: 'HOME' | 'WORK' | 'OTHER';
    isDefault?: boolean;
  }) => api.post<any>('/profile/address', data),
  updateAddress: (id: string, data: any) => api.patch<any>(`/profile/address/${id}`, data),
  deleteAddress: (id: string) => api.delete<any>(`/profile/address/${id}`),
  getPaymentMethods: () => api.get<any[]>('/profile/payment-methods'),
  savePaymentMethod: (data: {
    type: 'UPI' | 'CARD' | 'NETBANKING';
    provider?: string;
    maskedData: string;
    holderName?: string | null;
    isDefault?: boolean;
  }) => api.post<any>('/profile/payment-methods', data),
  deletePaymentMethod: (id: string) => api.delete<any>(`/profile/payment-methods/${id}`),
  getPoints: () => api.get<any>('/profile/points'),
  getOrders: () => api.get<any[]>('/profile/orders'),
  getNotifications: () => api.get<any[]>('/profile/notifications'),
  markNotificationRead: (id: string) => api.patch<any>(`/profile/notifications/${id}/read`),
};

export const shippingService = {
  verifyPincode: (pincode: string) => api.get<any>(`/shipping/pincode/${pincode}`),
  calculateTariff: (data: {
    productCode?: string;
    weight: number;
    sourcePincode: string;
    destinationPincode: string;
    length?: number;
    width?: number;
    height?: number;
    declaredValue?: number;
    isCOD?: boolean;
    codValue?: number;
  }) => api.post<any>('/shipping/tariff', data),
  trackShipment: (identifier: string) => api.get<any>(`/shipping/track/${identifier}`),
  bookShipment: (orderId: string, data?: any) => api.post<any>(`/shipping/book/${orderId}`, data || {}),
  getShippingLabel: (orderId: string) => api.get<any>(`/shipping/label/${orderId}`),
};

export const reviewService = {
  getReviews: (params?: { bookId?: string; limit?: number; page?: number }) =>
    api.get<any[]>('/reviews', params as any),
  createReview: (data: {
    bookId: string;
    rating: number;
    title?: string;
    content: string;
    userName?: string;
    userEmail?: string;
  }) => api.post<any>('/reviews', data),
  getAdminReviews: (params?: { search?: string; rating?: number; status?: string }) =>
    api.get<any[]>('/reviews/admin', params as any),
  adminCreateReview: (data: {
    bookId: string;
    rating: number;
    title?: string;
    content: string;
    userName?: string;
    userEmail?: string;
    isVerified?: boolean;
    createdAt?: string;
  }) => api.post<any>('/reviews/admin', data),
  updateReviewStatus: (id: string, isApproved: boolean) =>
    api.patch<any>(`/reviews/admin/${id}/status`, { isApproved }),
  toggleReviewVerified: (id: string, isVerified?: boolean) =>
    api.patch<any>(`/reviews/admin/${id}/verify`, { isVerified }),
  deleteReview: (id: string) =>
    api.delete<any>(`/reviews/admin/${id}`),
  clearOldReviews: (hours = 24) =>
    api.post<any>('/reviews/admin/clear-old', { hours }),
};

export const questionService = {
  getQuestions: (params?: { bookId?: string; limit?: number; page?: number }) =>
    api.get<any[]>('/questions', params as any),
  askQuestion: (data: {
    bookId: string;
    question: string;
    userName?: string;
    userEmail?: string;
  }) => api.post<any>('/questions', data),
  getAdminQuestions: (params?: { status?: string; search?: string }) =>
    api.get<any[]>('/questions/admin', params as any),
  answerQuestion: (id: string, data: { answer: string; answeredBy?: string }) =>
    api.patch<any>(`/questions/admin/${id}/answer`, data),
  deleteQuestion: (id: string) =>
    api.delete<any>(`/questions/admin/${id}`),
  clearOldQuestions: (hours = 24) =>
    api.post<any>('/questions/admin/clear-old', { hours }),
};

export const paymentService = {
  getOverview: () => api.get<any>('/payments/overview'),
  getTransactions: (params?: { status?: string; method?: string; search?: string; page?: number; limit?: number }) =>
    api.get<any[]>('/payments/transactions', params as any),
  updatePaymentStatus: (orderId: string, data: {
    paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
    paymentId?: string;
    paymentMethod?: string;
    refundAmount?: number;
    refundReason?: string;
    notes?: string;
  }) => api.patch<any>(`/payments/${orderId}/status`, data),
};
