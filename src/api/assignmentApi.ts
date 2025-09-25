import apiClient from "./apiClient";
import type { Assignment } from "../types/Assignment";
import type { AxiosResponse } from "axios";

const BASE_URL = "/assignments";

const assignmentsApi = {
  // Lấy tất cả bài tập
  getAll: async (classId?: number): Promise<Assignment[]> => {
    const url = classId ? `${BASE_URL}/class/${classId}` : BASE_URL;
    const { data } = await apiClient.get<Assignment[]>(url);
    return data;
  },

  // Lấy chi tiết 1 bài tập
  getById: async (id: number): Promise<Assignment> => {
    const { data } = await apiClient.get<Assignment>(`${BASE_URL}/${id}`);
    return data;
  },

  // Tạo mới (hỗ trợ upload file)
  create: async (formData: FormData): Promise<Assignment> => {
    const response: AxiosResponse<Assignment> = await apiClient.post(BASE_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Cập nhật (metadata hoặc file mới)
  update: async (id: number, formData: FormData): Promise<Assignment> => {
    const response: AxiosResponse<Assignment> = await apiClient.patch(`${BASE_URL}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Xóa
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  // Tải file bài tập
  downloadAndSave: async (id: number) => {
    const response = await apiClient.get(`${BASE_URL}/download/${id}`, {
      responseType: "blob",
    });

    const contentType = response.headers["content-type"] || "application/octet-stream";
    const blob = new Blob([response.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    const disposition = response.headers["content-disposition"];
    let fileName = `assignment_${id}`;
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

export default assignmentsApi;
