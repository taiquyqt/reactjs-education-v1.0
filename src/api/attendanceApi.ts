import apiClient from './apiClient';
import type { Attendance, BulkAttendanceRequest } from '../types/Attendance';

const BASE_URL = '/attendance';

const attendanceApi = {
  // Lấy danh sách điểm danh theo buổi học
  getBySessionId: async (sessionId: number): Promise<Attendance[]> => {
    const response = await apiClient.get<Attendance[]>(`${BASE_URL}/${sessionId}`);
    return response.data;
  },

  // Ghi nhận điểm danh cho cả lớp
  recordAttendance: async (sessionId: number, data: BulkAttendanceRequest): Promise<void> => {
    await apiClient.post(`${BASE_URL}/${sessionId}`, data);
  },

  // Cập nhật điểm danh cho một học sinh
  updateAttendance: async (recordId: number, data: Partial<Attendance>): Promise<Attendance> => {
    const response = await apiClient.put<Attendance>(`${BASE_URL}/${recordId}`, data);
    return response.data;
  },
};

export default attendanceApi;
