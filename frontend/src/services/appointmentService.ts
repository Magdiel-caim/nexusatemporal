import api from './api';

export interface Appointment {
  id: string;
  leadId: string;
  procedureId: string;
  procedureIds?: string[]; // Múltiplos procedimentos
  professionalId?: string;
  scheduledDate: string;
  estimatedDuration?: number;
  location: string;
  status: string;
  paymentStatus: string;
  paymentAmount?: number;
  paymentMethod?: string;
  hasReturn: boolean;
  returnCount?: number;
  returnFrequency?: number;
  notes?: string;
  lead?: {
    id: string;
    name: string;
    phone: string;
    whatsapp: string;
  };
  procedure?: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
  professional?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentDto {
  leadId: string;
  procedureId: string;
  procedureIds?: string[]; // Múltiplos procedimentos
  professionalId?: string;
  scheduledDate: string;
  estimatedDuration?: number;
  location: string;
  paymentAmount?: number;
  paymentMethod?: string;
  hasReturn?: boolean;
  returnCount?: number;
  returnFrequency?: number;
  notes?: string;
}

export interface UpdateAppointmentDto {
  professionalId?: string;
  scheduledDate?: string;
  estimatedDuration?: number;
  location?: string;
  status?: string;
  paymentStatus?: string;
  paymentProof?: string;
  paymentAmount?: number;
  notes?: string;
  privateNotes?: string;
}

class AppointmentService {
  private readonly baseUrl = '/appointments';

  async getToday(): Promise<Appointment[]> {
    const response = await api.get(`${this.baseUrl}/today`);
    return response.data.data;
  }

  async getAll(page = 1, limit = 50): Promise<{ data: Appointment[]; total: number }> {
    const response = await api.get(`${this.baseUrl}?page=${page}&limit=${limit}`);
    return {
      data: response.data.data,
      total: response.data.total,
    };
  }

  async getByDateRange(startDate: string, endDate: string): Promise<Appointment[]> {
    const response = await api.get(`${this.baseUrl}?startDate=${startDate}&endDate=${endDate}`);
    return response.data.data;
  }

  async getById(id: string): Promise<Appointment> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data.data;
  }

  async getByLead(leadId: string): Promise<Appointment[]> {
    const response = await api.get(`${this.baseUrl}/lead/${leadId}`);
    return response.data.data;
  }

  async getByProfessional(professionalId: string, startDate: string, endDate: string): Promise<Appointment[]> {
    const response = await api.get(
      `${this.baseUrl}/professional/${professionalId}?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data.data;
  }

  async create(data: CreateAppointmentDto): Promise<Appointment> {
    const response = await api.post(this.baseUrl, data);
    return response.data.data;
  }

  async update(id: string, data: UpdateAppointmentDto): Promise<Appointment> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response.data.data;
  }

  async confirmPayment(id: string, paymentProof: string, paymentMethod: string): Promise<Appointment> {
    const response = await api.post(`${this.baseUrl}/${id}/confirm-payment`, {
      paymentProof,
      paymentMethod,
    });
    return response.data.data;
  }

  async sendAnamnesis(id: string): Promise<void> {
    await api.post(`${this.baseUrl}/${id}/send-anamnesis`);
  }

  async confirm(id: string, confirmed: boolean, reschedule?: { newDate: string; reason?: string }): Promise<Appointment> {
    const response = await api.post(`${this.baseUrl}/${id}/confirm`, {
      confirmed,
      reschedule,
    });
    return response.data.data;
  }

  async checkIn(id: string): Promise<Appointment> {
    const response = await api.post(`${this.baseUrl}/${id}/check-in`);
    return response.data.data;
  }

  async startAttendance(id: string): Promise<Appointment> {
    const response = await api.post(`${this.baseUrl}/${id}/start`);
    return response.data.data;
  }

  async finalizeAttendance(
    id: string,
    data: { hasReturn: boolean; returnCount?: number; returnFrequency?: number; notes?: string }
  ): Promise<Appointment> {
    const response = await api.post(`${this.baseUrl}/${id}/finalize`, data);
    return response.data.data;
  }

  async cancel(id: string, reason: string): Promise<Appointment> {
    const response = await api.delete(`${this.baseUrl}/${id}`, {
      data: { reason },
    });
    return response.data.data;
  }

  async checkAvailability(
    scheduledDate: string,
    duration: number,
    location: string,
    professionalId?: string,
    excludeAppointmentId?: string
  ): Promise<{ available: boolean; conflicts: Appointment[] }> {
    const response = await api.post(`${this.baseUrl}/check-availability`, {
      scheduledDate,
      duration,
      location,
      professionalId,
      excludeAppointmentId,
    });
    return response.data.data;
  }

  async getOccupiedSlots(
    date: string, // YYYY-MM-DD
    location: string,
    professionalId?: string,
    interval = 5
  ): Promise<string[]> {
    const params = new URLSearchParams({
      date,
      location,
      interval: interval.toString(),
    });

    if (professionalId) {
      params.append('professionalId', professionalId);
    }

    const response = await api.get(`${this.baseUrl}/occupied-slots?${params.toString()}`);
    return response.data.data;
  }

  async getAvailableSlots(
    date: string, // YYYY-MM-DD
    location: string,
    professionalId?: string,
    startHour = 7,
    endHour = 20,
    interval = 5
  ): Promise<{ time: string; available: boolean }[]> {
    const params = new URLSearchParams({
      date,
      location,
      startHour: startHour.toString(),
      endHour: endHour.toString(),
      interval: interval.toString(),
    });

    if (professionalId) {
      params.append('professionalId', professionalId);
    }

    const response = await api.get(`${this.baseUrl}/available-slots?${params.toString()}`);
    return response.data.data;
  }
}

export default new AppointmentService();
