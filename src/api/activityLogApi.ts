import apiClient from './apiClient';
import type { ActivityLog } from '../types';

const BASE_URL = '/activity-logs';

const activityLogApi = {
  getAll: async (): Promise<ActivityLog[]> => {
    try {
      const response = await apiClient.get<ActivityLog[]>(BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy nhật ký hoạt động:', error);
      throw error;
    }
  },

deleteMany: async (ids: number[]): Promise<void> => {
  try {
    // Gửi trực tiếp mảng trong body
    await apiClient.delete(BASE_URL, { data: ids }); 
  } catch (error) {
    console.error('Lỗi khi xóa nhật ký hoạt động:', error);
    throw error;
  }
},


  // Lấy danh sách các actionType duy nhất (nếu backend hỗ trợ)
  getActionTypes: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get<string[]>(`${BASE_URL}/action-types`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy loại hành động:', error);
      throw error;
    }
  },
};

export default activityLogApi;
