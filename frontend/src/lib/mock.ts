import { Category, Professional, TimeSlot, Appointment, Availability } from './api';

let categories: Category[] = [
  { id: '1', name: 'Corte de Cabelo', description: 'Cortes e estilização' },
  { id: '2', name: 'Manicure', description: 'Esmalte e unhas postiças' },
  { id: '3', name: 'Massagem', description: 'Massagens relaxantes' },
];

let professionals: Professional[] = [
  { id: '1', name: 'João Silva', phone: '11999999999', categoryId: '1', category: categories[0], address: 'Rua das Flores, 123' },
  { id: '2', name: 'Maria Santos', phone: '11988887777', categoryId: '1', category: categories[0], address: 'Av. Principal, 456' },
  { id: '3', name: 'Ana Costa', phone: '11977776666', categoryId: '2', category: categories[1], address: 'Rua Nova, 789' },
  { id: '4', name: 'Carlos Oliveira', phone: '11966665555', categoryId: '3', category: categories[2], address: 'Praça Central, 101' },
];

let availabilities: Availability[] = [
  { id: '1', professionalId: '1', dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: true, professional: professionals[0] },
  { id: '2', professionalId: '1', dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isActive: true, professional: professionals[0] },
];

let appointments: Appointment[] = [
  {
    id: '1',
    professionalId: '1',
    professional: professionals[0],
    clientName: 'Pedro Santos',
    clientPhone: '11999999999',
    date: new Date(Date.now() + 86400000).toISOString(),
    status: 'PENDING',
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  categories: {
    list: async (): Promise<Category[]> => {
      await delay(300);
      return categories;
    },
    get: async (id: string): Promise<Category | undefined> => {
      await delay(200);
      return categories.find((c) => c.id === id);
    },
    create: async (data: { name: string; description?: string }): Promise<Category> => {
      await delay(400);
      const newCat: Category = { id: String(Date.now()), ...data };
      categories.push(newCat);
      return newCat;
    },
    update: async (id: string, data: Partial<{ name: string; description: string }>): Promise<Category> => {
      await delay(400);
      const idx = categories.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error('Categoria não encontrada');
      categories[idx] = { ...categories[idx], ...data };
      return categories[idx];
    },
    delete: async (id: string): Promise<void> => {
      await delay(300);
      categories = categories.filter((c) => c.id !== id);
    },
  },

  professionals: {
    list: async (): Promise<Professional[]> => {
      await delay(300);
      return professionals;
    },
    getByCategory: async (categoryId: string): Promise<Professional[]> => {
      await delay(300);
      return professionals.filter((p) => p.categoryId === categoryId);
    },
    get: async (id: string): Promise<Professional | undefined> => {
      await delay(200);
      return professionals.find((p) => p.id === id);
    },
    create: async (data: Omit<Professional, 'id' | 'category'>): Promise<Professional> => {
      await delay(400);
      const cat = categories.find((c) => c.id === data.categoryId);
      if (!cat) throw new Error('Categoria não encontrada');
      const newProf: Professional = { id: String(Date.now()), ...data, category: cat };
      professionals.push(newProf);
      return newProf;
    },
    update: async (id: string, data: Partial<Omit<Professional, 'id' | 'category'>>): Promise<Professional> => {
      await delay(400);
      const idx = professionals.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error('Profissional não encontrado');
      let cat = professionals[idx].category;
      if (data.categoryId) {
        cat = categories.find((c) => c.id === data.categoryId) || cat;
      }
      professionals[idx] = { ...professionals[idx], ...data, category: cat };
      return professionals[idx];
    },
    delete: async (id: string): Promise<void> => {
      await delay(300);
      professionals = professionals.filter((p) => p.id !== id);
    },
  },

  availabilities: {
    list: async (): Promise<Availability[]> => {
      await delay(300);
      return availabilities.map(a => ({
        ...a,
        professional: professionals.find(p => p.id === a.professionalId)
      }));
    },
    getByProfessional: async (professionalId: string): Promise<Availability[]> => {
      await delay(300);
      return availabilities.filter((a) => a.professionalId === professionalId);
    },
    getSlots: async (professionalId: string, _date: string): Promise<TimeSlot[]> => {
      await delay(400);
      const slots: TimeSlot[] = [];
      for (let hour = 9; hour < 18; hour++) {
        for (let min = 0; min < 60; min += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
          const booked = appointments.some(
            (a) =>
              a.professionalId === professionalId &&
              new Date(a.date).toTimeString().slice(0, 5) === time &&
              a.status !== 'CANCELLED'
          );
          slots.push({ time, available: !booked });
        }
      }
      return slots;
    },
    create: async (data: Omit<Availability, 'id' | 'professional'>): Promise<Availability> => {
      await delay(400);
      const newAvail: Availability = { id: String(Date.now()), ...data };
      availabilities.push(newAvail);
      return newAvail;
    },
    update: async (id: string, data: Partial<Omit<Availability, 'id' | 'professional'>>): Promise<Availability> => {
      await delay(400);
      const idx = availabilities.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error('Disponibilidade não encontrada');
      availabilities[idx] = { ...availabilities[idx], ...data };
      return availabilities[idx];
    },
    delete: async (id: string): Promise<void> => {
      await delay(300);
      availabilities = availabilities.filter((a) => a.id !== id);
    },
  },

  appointments: {
    list: async (filters?: { status?: string }): Promise<Appointment[]> => {
      await delay(300);
      if (filters?.status) {
        return appointments.filter((a) => a.status === filters.status);
      }
      return appointments;
    },
    get: async (id: string): Promise<Appointment | undefined> => {
      await delay(200);
      return appointments.find((a) => a.id === id);
    },
    create: async (data: { professionalId: string; clientName: string; clientPhone: string; date: string }): Promise<Appointment> => {
      await delay(500);
      const professional = professionals.find((p) => p.id === data.professionalId);
      if (!professional) throw new Error('Profissional não encontrado');
      
      const newAppointment: Appointment = {
        id: String(appointments.length + 1),
        ...data,
        professional,
        status: 'PENDING',
      };
      appointments.push(newAppointment);
      return newAppointment;
    },
    confirm: async (id: string): Promise<Appointment> => {
      await delay(400);
      const appointment = appointments.find((a) => a.id === id);
      if (!appointment) throw new Error('Agendamento não encontrado');
      if (appointment.status !== 'PENDING') throw new Error('Apenas pendentes');
      
      appointment.status = 'CONFIRMED';
      return appointment;
    },
    cancel: async (id: string): Promise<Appointment> => {
      await delay(300);
      const appointment = appointments.find((a) => a.id === id);
      if (!appointment) throw new Error('Agendamento não encontrado');
      
      appointment.status = 'CANCELLED';
      return appointment;
    },
  },
};