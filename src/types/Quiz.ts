import type { Subject } from "./Subject";

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  timeLimit: number;
  startDate: string;
  endDate: string;
  classId: number;
  className?: string;
  createdBy: number;
  subject: string | Subject;
  createdByName?: string;

  totalStudents: number;

}

export interface QuizFormValues {
  title: string;
  timeLimit: number;
  startDate: string;
  endDate: string;
  classId: number;
  subjectId: number; 
}

export interface QuizPayload {
  title: string;
  timeLimit: number;
  startDate: string;
  endDate: string;
  classId: number;
  subjectId: number;
}


