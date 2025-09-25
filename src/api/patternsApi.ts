import apiClient from './apiClient';
import type {
  ClassSchedulePattern,
  ClassSchedulePatternCreateDTO,
  ClassSchedulePatternUpdateDTO,
} from '../types/Pattern';

const BASE_URL = '/auth/class-schedule-patterns';

const patternsApi = {
  getAll: async (): Promise<ClassSchedulePattern[]> => {
    const { data } = await apiClient.get(`${BASE_URL}`);
    return data.content;
  },

  // Lấy tất cả pattern của 1 lớp
  getAllByClass: async (classId: number): Promise<ClassSchedulePattern[]> => {
    const { data } = await apiClient.get(`${BASE_URL}/class/${classId}`);
    return data;
  },

  // Tạo nhiều pattern cho 1 lớp
  createBatch: async (
    dto: ClassSchedulePatternCreateDTO
  ): Promise<ClassSchedulePattern[]> => {
    const { data } = await apiClient.post(BASE_URL, dto);
    return data;
  },

  // Cập nhật nhiều pattern (theo dto)
  updateBatch: async (
    dto: ClassSchedulePatternUpdateDTO
  ): Promise<ClassSchedulePattern[]> => {
    const { data } = await apiClient.put(`${BASE_URL}/batch`, dto);
    return data;
  },

  // Xóa pattern
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};

export default patternsApi;
