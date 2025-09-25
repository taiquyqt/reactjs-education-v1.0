export interface QuizSubmission {
  id: number;
  quizId: number;
  studentId: number;
  studentName?: string;
  submittedAt: Date;
  score: number;
  gradedAt?: Date;
  startAt: Date;
  endAt: Date;
}
