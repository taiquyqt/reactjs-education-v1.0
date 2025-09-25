export interface ClassUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  joinedAt: string;
}

export interface AddStudentToClassDTO {
    classId: number;
    studentId: number;
}