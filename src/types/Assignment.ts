export interface Assignment {
  id: number;
  title: string;
  description: string;
  classId: number;
  className: string; 
  dueDate: string;
  maxScore: number;
  createdAt: string;
  updatedAt: string;
  file_path: string;
  file_type: string;
  file_size: string;
  subjectId: number;
  subjectName: string;
}
// DTO để tạo bài tập mới
export interface AssignmentCreateDTO {
  title: string;
  classId: number;
  dueDate: string;
  maxScore: number;
  description: string;
  file_path: string;
  file_type: string;
  file_size: string;
}

// DTO để cập nhật bài tập (có thể chỉ cập nhật một số trường)
export interface AssignmentUpdateDTO {
  title?: string;
  classId?: number;
  dueDate?: string;
  maxScore?: number;
  description?: string;
  file_path?: string;
  file_type?: string;
  file_size?: string;
}