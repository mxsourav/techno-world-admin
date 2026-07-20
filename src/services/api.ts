const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

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
    throw new ApiError(response.status, data.message || `Server returned ${response.status}`);
  }
  return data;
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

      const response = await fetch(url.toString(), {
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
      const response = await fetch(`${API_URL}${endpoint}`, {
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
      const response = await fetch(`${API_URL}${endpoint}`, {
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
      const response = await fetch(`${API_URL}${endpoint}`, {
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
      const response = await fetch(`${API_URL}${endpoint}`, {
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
      const response = await fetch(`${API_URL}${endpoint}`, {
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
  deleteBook: (id: string) => api.delete<any>(`/admin/books/${id}`),
  deleteAllBooks: () => api.delete<any>(`/admin/books/all`),
  updateBook: (id: string, payload: any) => api.patch<any>(`/admin/books/${id}`, payload),
};

export const searchService = {
  instant: (q: string) => api.get<any[]>('/search', { q }),
};

export const orderService = {
  create: (data: { items: { bookId: string; quantity: number }[]; addressId?: string; paymentMethod?: string }) =>
    api.post<any>('/orders', data),
  getUserOrders: (userId?: string) => api.get<any[]>('/orders', userId ? { userId } : {}),
  getAllOrders: () => api.get<any[]>('/orders/admin/all'),
  updateStatus: (id: string, status: string) => api.patch<any>(`/orders/admin/${id}/status`, { status }),
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
