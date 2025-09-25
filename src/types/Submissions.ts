export interface Student {
  id: number;
  fullName: string;
  email: string;
  imageUrl: string | null;
}

export interface Submission {
  id: number;
  assignmentId: number;
  filePath: string;
  fileType: string;
  fileSize: string; 
  description: string | null;
  status: "SUBMITTED" | "GRADED";
  score: number | null;
  teacherComment: string | null;
  submittedAt: string;  
  gradedAt: string | null; 
  student: Student;
}
