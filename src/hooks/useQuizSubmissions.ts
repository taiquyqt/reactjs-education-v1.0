// hooks/useQuizSubmissions.ts
import { useQuery } from "@tanstack/react-query";
import quizSubmissionApi from "../api/quizSubmissionApi";
import type { QuizSubmission } from "../types";

export const useQuizSubmissions = (quizId?: number) => {
  return useQuery<QuizSubmission[], Error>({
    queryKey: ["quiz-submissions", quizId],
    queryFn: () => quizSubmissionApi.getByQuiz(quizId as number),
    enabled: !!quizId, // chỉ chạy khi có quizId
    staleTime: 1000 * 60 * 5,
  });
};
