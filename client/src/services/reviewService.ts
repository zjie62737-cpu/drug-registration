import api from './api';
import type { Review, Application } from '../types/application';

export const reviewService = {
  async getByApplication(applicationId: number): Promise<Review[]> {
    const res = await api.get(`/reviews/applications/${applicationId}`);
    return res.data;
  },

  async create(applicationId: number, data: {
    stageId?: number;
    content: string;
    action?: string;
    isInternal?: boolean;
  }): Promise<Review> {
    const res = await api.post(`/reviews/applications/${applicationId}`, data);
    return res.data;
  },

  async getMyTasks(): Promise<any[]> {
    const res = await api.get('/reviews/tasks');
    return res.data;
  },

  async getPendingStages(): Promise<any[]> {
    const res = await api.get('/reviews/pending-stages');
    return res.data;
  },
};

export const documentService = {
  async getByApplication(applicationId: number) {
    const res = await api.get(`/documents/applications/${applicationId}`);
    return res.data;
  },

  async upload(applicationId: number, file: File, documentType: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    const res = await api.post(`/documents/applications/${applicationId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getDownloadUrl(id: number): string {
    return `/api/documents/${id}/download`;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/documents/${id}`);
  },
};

export const userService = {
  async list() {
    const res = await api.get('/users');
    return res.data;
  },

  async create(data: any) {
    const res = await api.post('/users', data);
    return res.data;
  },

  async update(id: number, data: any) {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`/users/${id}`);
  },
};
