// src/api/quizDetailsApi.ts
import apiClient from './apiClient';
import type { QuizQuestion, QuizSubmission } from '../types';

export interface QuizDetails {
  questions: QuizQuestion[];
  submissions: QuizSubmission[];
}

const quizDetailsApi = {
  get: async (quizId: number): Promise<QuizDetails> => {
    const { data: questions } = await apiClient.get<QuizQuestion[]>(`/quizzes/${quizId}/questions`);
    const { data: submissions } = await apiClient.get<QuizSubmission[]>(`/quizzes/${quizId}/submissions`);
    return { questions, submissions };
  },
};

export default quizDetailsApi;
