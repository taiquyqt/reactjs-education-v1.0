import apiClient from './apiClient';
import type { ClassUser } from '../types';

const API_URL = '/auth/class-users';

const classUserApi = {
  getByClassId: async (classId: number): Promise<ClassUser[]> => {
    const { data } = await apiClient.get(`${API_URL}?classId=${classId}`);
    return data;
  },

  add: async (payload: { classId: number; studentId: number }): Promise<void> => {
    await apiClient.post(`${API_URL}`, payload);
  },

  remove: async (classId: number, studentId: number): Promise<void> => {
    await apiClient.delete(`${API_URL}`, { params: { classId, studentId } });
  },
};

export default classUserApi;
