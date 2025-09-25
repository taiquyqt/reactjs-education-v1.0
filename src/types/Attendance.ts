export interface Attendance {
  id: number;
  studentId: number;
  studentName:string
  scheduleId?: number;
  sessionId: number;
  className: string;
  status: 'ABSENT'|'EXCUSED'|'LATE'|'PRESENT';
  markedAt: string;
  note: string;
}

export interface BulkAttendanceRequest {
  records: Array<{
    studentId: number;
    status: Attendance['status'];
    note?: string;
  }>;
}