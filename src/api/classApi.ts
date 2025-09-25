// classApi.ts
import apiClient from "./apiClient";
import type { Class } from "../types";

const BASE_URL = "auth/classes";

export type ClassCreateDTO = Omit<Class, "id">;
export type ClassUpdateDTO = Class;

const classApi = {
  getAll: async (): Promise<Class[]> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await apiClient.get<any[]>("/auth/classes"); // trả về mảng class từ API

    // map dữ liệu để phù hợp với interface Class
    return response.data.map((item) => ({
      id: item.id,
      className: item.className,
      schoolYear: item.schoolYear,
      semester: item.semester,
      description: item.description,
      teacherId: item.teacher?.id ?? 0,
      fullName: item.teacher?.fullName ?? "",
      subjectId: item.subject?.id ?? 0,
      joinMode: item.joinMode,

    })) as Class[];
  },

  getById: async (id: number): Promise<Class> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await apiClient.get<any>(`${BASE_URL}/${id}`);
    const item = response.data;
    return {
      id: item.id,
      className: item.className,
      schoolYear: item.schoolYear,
      semester: item.semester,
      description: item.description,
      teacherId: item.teacher?.id ?? 0,
      fullName: item.teacher?.fullName ?? "",
      subjectId: item.subject?.id ?? 0,
      joinMode: item.joinMode,

    } as Class;
  },

  create: async (newClass: ClassCreateDTO): Promise<Class> => {
    const response = await apiClient.post<Class>(BASE_URL, newClass);
    return response.data;
  },

  update: async (updatedClass: ClassUpdateDTO): Promise<Class> => {
    const response = await apiClient.put<Class>(`${BASE_URL}/${updatedClass.id}`, updatedClass);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};

export default classApi;
