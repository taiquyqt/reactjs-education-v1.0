import apiClient from "./apiClient";
import type { Quiz } from '../types';

const API_URL = '/quizzes';

const quizApi = {
  getAll: async (): Promise<Quiz[]> => {
    const { data } = await apiClient.get(API_URL);
    return data;
  },
  create: async (quiz: Partial<Quiz>): Promise<Quiz> => {
    const { data } = await apiClient.post(API_URL, quiz);
    return data;
  },
  update: async (id: number, quiz: Partial<Quiz>): Promise<Quiz> => {
    const { data } = await apiClient.patch(`${API_URL}/${id}`, quiz);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_URL}/${id}`);
  },
};

export default quizApi;
