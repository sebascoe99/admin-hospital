import { http } from './http';

export type Appointment = {
  id: number;
  serviceId: number;
  patientId: number;
  guardianId?: number;
  slotStart: string;
  slotEnd: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  service?: { name: string };
  patient?: { firstName: string; lastName: string; document: string };
};

export async function getAppointments(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
}) {
  const res = await http.get('/appointments', { params });
  return res.data.data;
}

export async function cancelAppointment(id: number) {
  const res = await http.patch(`/appointments/${id}/cancel`);
  return res.data.data;
}
