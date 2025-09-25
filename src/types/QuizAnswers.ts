export interface QuizAnswer {
  id: number;
  submission_id: number;
  question_id: number;
    selected_option: string;
    is_correct: boolean;
}
