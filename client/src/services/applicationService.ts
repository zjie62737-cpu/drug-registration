import api from './api';
import type { Application, DashboardStats, Activity } from '../types/application';

export const applicationService = {
  async list(params?: {
    status?: string;
    type?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ total: number; page: number; pageSize: number; items: Application[] }> {
    const res = await api.get('/applications', { params });
    return res.data;
  },

  async getById(id: number): Promise<Application> {
    const res = await api.get(`/applications/${id}`);
    return res.data;
  },

  async create(data: {
    type: string;
    drugName: string;
    drugType: string;
    specification?: string;
    manufacturer?: string;
    regulatorySystemId?: string;
    applicationCategory?: string;
    registrationClass?: string;
    genericName?: string;
    tradeName?: string;
    dosageForm?: string;
    indication?: string;
    usageDosage?: string;
    atcCode?: string;
    isOverseas?: boolean;
    productionSite?: string;
    priorityReview?: boolean;
    breakthroughTherapy?: boolean;
    orphanDrug?: boolean;
    emergencyUse?: boolean;
    isSmallEnterprise?: boolean;
    feePayer?: string;
  }): Promise<Application> {
    const res = await api.post('/applications', data);
    return res.data;
  },

  async update(id: number, data: Partial<Application>): Promise<Application> {
    const res = await api.put(`/applications/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/applications/${id}`);
  },

  async submit(id: number): Promise<Application> {
    const res = await api.post(`/applications/${id}/submit`);
    return res.data;
  },

  async advanceStage(id: number, action: string, notes?: string): Promise<Application> {
    const res = await api.put(`/applications/${id}/advance-stage`, { action, notes });
    return res.data;
  },

  async resumeReview(id: number): Promise<Application> {
    const res = await api.post(`/applications/${id}/resume`);
    return res.data;
  },
};

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },

  async getActivities(): Promise<Activity[]> {
    const res = await api.get('/dashboard/activities');
    return res.data;
  },

  async getNotifications(): Promise<import('../types/application').Notification[]> {
    const res = await api.get('/dashboard/notifications');
    return res.data;
  },

  async markNotificationRead(id: number): Promise<void> {
    await api.put(`/dashboard/notifications/${id}/read`);
  },

  async markAllNotificationsRead(): Promise<void> {
    await api.put('/dashboard/notifications/read-all');
  },
};
