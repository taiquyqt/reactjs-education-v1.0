export interface ActivityLog {
  id: number;
  actionType: string;
  targetTable: string;
  targetId?: number; 
  description: string;
  classId?: number;
  userId: number;
  fullName: string;
  createdAt: string;
}
