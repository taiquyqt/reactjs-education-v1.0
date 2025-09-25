// api/quizSubmissionApi.ts
import apiClient from "./apiClient";
import type { QuizSubmission } from "../types";

const BASE_URL = "/quiz-submissions";

const quizSubmissionApi = {
  getByQuiz: async (quizId: number): Promise<QuizSubmission[]> => {
    const { data } = await apiClient.get<QuizSubmission[]>(`${BASE_URL}/by-quiz/${quizId}`);
    return data;
  },
};

export default quizSubmissionApi;
