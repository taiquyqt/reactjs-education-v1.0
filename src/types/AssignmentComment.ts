export interface AssignmentComment {
  id: number;
  assignment_id: number;
  user_id: number;
  comment: string;
  created_at: string;
    updated_at: string;
    parent_id?: number;
}
