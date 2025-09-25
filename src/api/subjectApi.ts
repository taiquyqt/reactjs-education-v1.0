
import apiClient from "./apiClient";
import type { Subject } from "../types/Subject";

const API_URL = '/auth/subjects';

const subjectApi = {
  // Lấy danh sách tất cả môn học
  getAll: async (): Promise<Subject[]> => {
    const { data } = await apiClient.get(`${API_URL}`);
    return data;
  },

  // Tạo mới môn học
  create: async (subject: Partial<Subject>): Promise<Subject> => {
    const { data } = await apiClient.post(`${API_URL}`, subject);
    return data;
  },

  // Cập nhật môn học
  update: async (id: number, subject: Partial<Subject>): Promise<Subject> => {
    const { data } = await apiClient.put(`${API_URL}/${id}`, subject);
    return data;
  },

  // Xóa môn học
  delete: async (id: number): Promise<void> => {
    const { data } = await apiClient.delete(`${API_URL}/${id}`);
    return data;
  },
};

export default subjectApi;
