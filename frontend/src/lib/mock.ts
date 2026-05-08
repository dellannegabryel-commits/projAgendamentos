import { Category, Professional, TimeSlot, Appointment } from './api';

const categories: Category[] = [
  { id: '1', name: 'Corte de Cabelo', description: 'Cortes e estilização' },
  { id: '2', name: 'Manicure', description: 'Esmalte e unhas postiças' },
  { id: '3', name: 'Massagem', description: 'Massagens relaxantes' },
];

const professionals: Professional[] = [
  { id: '1', name: 'João Silva', phone: '11999999999', categoryId: '1', category: categories[0], address: 'Rua das Flores, 123' },
  { id: '2', name: 'Maria Santos', phone: '11988887777', categoryId: '1', category: categories[0], address: 'Av. Principal, 456' },
  { id: '3', name: 'Ana Costa', phone: '11977776666', categoryId: '2', category: categories[1], address: 'Rua Nova, 789' },
  { id: '4', name: 'Carlos Oliveira', phone: '11966665555', categoryId: '3', category: categories[2], address: 'Praça Central, 101' },
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
  },

  availabilities: {
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