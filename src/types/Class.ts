export interface Class {
  id: number;
  className: string;
  schoolYear: number;
  semester: string;
  description?: string;
  teacherId: number;
  fullName: string;
  subjectId: number;
  createdAt?: Date;
  joinMode: "APPROVAL" | "AUTO"
}
