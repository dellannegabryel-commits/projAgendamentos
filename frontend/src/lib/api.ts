const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('@agendafacil:token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers,
    ...options,
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('@agendafacil:token');
    localStorage.removeItem('@agendafacil:user');
    document.cookie = 'agendafacil_token=; path=/; max-age=0';
    window.location.href = '/admin/login';
    throw new Error('Sessão expirada');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || 'Erro na requisição');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Professional {
  id: string;
  name: string;
  phone: string;
  categoryId: string;
  category: Category;
  address: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Availability {
  id: string;
  professionalId: string;
  professional?: Professional;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface Appointment {
  id: string;
  professionalId: string;
  professional: Professional;
  clientName: string;
  clientPhone: string;
  date: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

export interface PaginatedAppointments {
  data: Appointment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const api = {
  auth: {
    status: () => fetchApi<{ hasAdmin: boolean }>('/auth/status'),
    setup: (data: { name: string; email: string; password: string }) =>
      fetchApi<{ token: string; admin: { id: string; name: string; email: string } }>('/auth/setup', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: unknown) =>
      fetchApi<{ token: string; admin: { id: string; name: string; email: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => fetchApi<{ id: string; name: string; email: string }>('/auth/me'),
    forgotPassword: (data: { email: string }) =>
      fetchApi<{ sent: boolean }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    resetPassword: (data: { token: string; password: string }) =>
      fetchApi<{ reset: boolean }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  categories: {
    list: (options?: RequestInit) => fetchApi<Category[]>('/categories', options),
    get: (id: string) => fetchApi<Category>(`/categories/${id}`),
    create: (data: { name: string; description?: string }) =>
      fetchApi<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<{ name: string; description: string }>) =>
      fetchApi<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchApi<void>(`/categories/${id}`, { method: 'DELETE' }),
  },

  professionals: {
    list: () => fetchApi<Professional[]>('/professionals'),
    getByCategory: (categoryId: string, options?: RequestInit) => fetchApi<Professional[]>(`/professionals/category/${categoryId}`, options),
    get: (id: string) => fetchApi<Professional>(`/professionals/${id}`),
    create: (data: Omit<Professional, 'id' | 'category'>) =>
      fetchApi<Professional>('/professionals', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Omit<Professional, 'id' | 'category'>>) =>
      fetchApi<Professional>(`/professionals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchApi<void>(`/professionals/${id}`, { method: 'DELETE' }),
  },

  availabilities: {
    list: () => fetchApi<Availability[]>('/availabilities'),
    getByProfessional: (professionalId: string, options?: RequestInit) => fetchApi<Availability[]>(`/availabilities/professional/${professionalId}`, options),
    getSlots: (professionalId: string, date: string, options?: RequestInit) =>
      fetchApi<TimeSlot[]>(`/availabilities/slots?professionalId=${professionalId}&date=${date}`, options),
    create: (data: Omit<Availability, 'id' | 'professional'>) =>
      fetchApi<Availability>('/availabilities', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Omit<Availability, 'id' | 'professional'>>) =>
      fetchApi<Availability>(`/availabilities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchApi<void>(`/availabilities/${id}`, { method: 'DELETE' }),
  },

  appointments: {
    list: (filters?: { status?: string; professionalId?: string; dateFrom?: string; dateTo?: string; page?: number; pageSize?: number; sortBy?: 'date' | 'createdAt' | 'status'; order?: 'asc' | 'desc' }) => {
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.professionalId) params.set('professionalId', filters.professionalId);
      if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.set('dateTo', filters.dateTo);
      if (filters?.page) params.set('page', String(filters.page));
      if (filters?.pageSize) params.set('pageSize', String(filters.pageSize));
      if (filters?.sortBy) params.set('sortBy', filters.sortBy);
      if (filters?.order) params.set('order', filters.order);
      const query = params.toString();
      return fetchApi<PaginatedAppointments>(`/appointments${query ? `?${query}` : ''}`);
    },
    get: (id: string) => fetchApi<Appointment>(`/appointments/${id}`),
    create: (data: { professionalId: string; clientName: string; clientPhone: string; date: string }) =>
      fetchApi<Appointment>('/appointments', { method: 'POST', body: JSON.stringify(data) }),
    confirm: (id: string) =>
      fetchApi<Appointment>(`/appointments/${id}/confirm`, { method: 'PATCH' }),
    cancel: (id: string) =>
      fetchApi<Appointment>(`/appointments/${id}/cancel`, { method: 'PATCH' }),
    delete: (id: string) =>
      fetchApi<void>(`/appointments/${id}`, { method: 'DELETE' }),
  },
};