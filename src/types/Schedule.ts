export interface ClassScheduleSession {
  id: number;
  classId: number;
  patternId: number;
  startPeriod: number;
  endPeriod: number;
  sessionDate: string;
  location: string;
  note?: string;
  status: 'CANCELLED' | 'COMPLETED' | 'HOLIDAY' | 'MAKEUP' | 'SCHEDULED';
  submittedAt?: string;
}
