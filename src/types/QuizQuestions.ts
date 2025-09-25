export interface QuizQuestion {
  id: number;
  quiz_id: number;
  question_text: string;
  score: number;
  correct_option: string;
  created_at: string;
  updated_at: string;
  question_type: 'FILL_BLANK' | 'MULTI_CHOICE' | 'ONE_CHOICE' | 'TRUE_FALSE';
  validation_regex?: string;
  case_sensitive?: boolean;
  answer_regex?: string;
  correct_true_false?: boolean;
  trim_whitespace?: boolean;
}
