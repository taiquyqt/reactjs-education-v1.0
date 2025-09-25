import apiClient from './apiClient';
import type { ClassScheduleSession } from '../types/Schedule';

const BASE_URL = '/auth/sessions';

const schedulesApi = {
  // Lấy tất cả session theo classId
  getAllByClass: async (classId: number): Promise<ClassScheduleSession[]> => {
    const { data } = await apiClient.get<ClassScheduleSession[]>(`${BASE_URL}/class/${classId}`);
    return data;
  },
};

export default schedulesApi;
