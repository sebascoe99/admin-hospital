import { http } from './http';

export type ServiceSchedule = {
  id?: number;
  weekday: number;
  startTime: string;
  endTime: string;
};

export type Service = {
  id: number;
  name: string;
  slotMinutes: number;
  capacityPerSlot: number;
  cancellationHours: number;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  schedules?: ServiceSchedule[];
};

export type CreateServicePayload = {
  name: string;
  slotMinutes: number;
  capacityPerSlot: number;
  cancellationHours: number;
  timezone?: string;
  isActive?: boolean;
  schedules?: Omit<ServiceSchedule, 'id'>[];
};

export async function getServices(params?: {
  q?: string;
  onlyActive?: string;
  page?: number;
  pageSize?: number;
}) {
  const res = await http.get('/services', { params });
  return res.data.data;
}

export async function createService(data: CreateServicePayload) {
  const res = await http.post('/services', data);
  return res.data.data;
}

export type AvailabilitySlot = {
  slotStart: string;
  slotEnd: string;
  available: number;
  booked: number;
};

export async function updateService(id: number, data: Partial<CreateServicePayload>) {
  const res = await http.patch(`/services/${id}`, data);
  return res.data.data;
}

export async function getAvailability(serviceId: number, date: string) {
  const res = await http.get(`/services/${serviceId}/availability`, {
    params: { date, range: 'day' },
  });
  return res.data.data;
}
