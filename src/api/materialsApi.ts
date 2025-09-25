import apiClient from './apiClient';
import type { ClassMaterial } from '../types';
import type { AxiosResponse } from 'axios';

export const materialsApi = {
  // Lấy tất cả tài liệu
  getAll: async (): Promise<ClassMaterial[]> => {
    const response: AxiosResponse<ClassMaterial[]> = await apiClient.get('/materials');
    return response.data;
  },

  // Lấy tài liệu theo classId
  getByClass: async (classId: number): Promise<ClassMaterial[]> => {
    const response: AxiosResponse<ClassMaterial[]> = await apiClient.get(`/materials/class/${classId}`);
    return response.data;
  },

  // Lấy chi tiết 1 tài liệu
  getById: async (id: number): Promise<ClassMaterial> => {
    const response: AxiosResponse<ClassMaterial> = await apiClient.get(`/materials/${id}`);
    return response.data;
  },

  // Tạo tài liệu mới (upload file)
  create: async (formData: FormData): Promise<ClassMaterial> => {
    const response: AxiosResponse<ClassMaterial> = await apiClient.post('/materials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Cập nhật tài liệu (có thể là metadata hoặc re-upload file)
  update: async (id: number, formData: FormData): Promise<ClassMaterial> => {
    const response: AxiosResponse<ClassMaterial> = await apiClient.put(`/materials/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Xóa tài liệu
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/materials/${id}`);
  },

  // Tải về và lưu file
  downloadAndSave: async (id: number) => {
    const response = await apiClient.get(`/materials/download/${id}`, {
      responseType: "blob",
    });

    // Lấy MIME type từ server
    const contentType = response.headers["content-type"] || "application/octet-stream";

    const blob = new Blob([response.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    const disposition = response.headers["content-disposition"];
    let fileName = `file_${id}`;
    if (disposition) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match?.[1]) {
        fileName = match[1];
      }
    }

    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
