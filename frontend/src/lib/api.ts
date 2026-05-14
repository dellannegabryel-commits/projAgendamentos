const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

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

export const api = {
  categories: {
    list: () => fetchApi<Category[]>('/categories'),
    get: (id: string) => fetchApi<Category>(`/categories/${id}`),
    create: (data: { name: string; description?: string }) =>
      fetchApi<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<{ name: string; description: string }>) =>
      fetchApi<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchApi<void>(`/categories/${id}`, { method: 'DELETE' }),
  },

  professionals: {
    list: () => fetchApi<Professional[]>('/professionals'),
    getByCategory: (categoryId: string) => fetchApi<Professional[]>(`/professionals/category/${categoryId}`),
    get: (id: string) => fetchApi<Professional>(`/professionals/${id}`),
    create: (data: Omit<Professional, 'id' | 'category'>) =>
      fetchApi<Professional>('/professionals', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Omit<Professional, 'id' | 'category'>>) =>
      fetchApi<Professional>(`/professionals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchApi<void>(`/professionals/${id}`, { method: 'DELETE' }),
  },

  availabilities: {
    list: () => fetchApi<Availability[]>('/availabilities'),
    getByProfessional: (professionalId: string) => fetchApi<Availability[]>(`/availabilities/professional/${professionalId}`),
    getSlots: (professionalId: string, date: string) =>
      fetchApi<TimeSlot[]>(`/availabilities/slots?professionalId=${professionalId}&date=${date}`),
    create: (data: Omit<Availability, 'id' | 'professional'>) =>
      fetchApi<Availability>('/availabilities', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Omit<Availability, 'id' | 'professional'>>) =>
      fetchApi<Availability>(`/availabilities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchApi<void>(`/availabilities/${id}`, { method: 'DELETE' }),
  },

  appointments: {
    list: (filters?: { status?: string; professionalId?: string }) => {
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.professionalId) params.set('professionalId', filters.professionalId);
      const query = params.toString();
      return fetchApi<Appointment[]>(`/appointments${query ? `?${query}` : ''}`);
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