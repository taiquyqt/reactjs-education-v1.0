// Model trả về từ BE
export interface ClassSchedulePattern {
  id: number;
  classId: number;
  className: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startPeriod: number;
  endPeriod: number;
  startDate: string;
  endDate: string;
  location: string;
  active: boolean;
}

// DTO để tạo pattern
export interface ClassSchedulePatternCreateDTO {
  classId: number;
  startDate: string; // yyyy-MM-dd
  endDate: string;   // yyyy-MM-dd
  slots: {
    dayOfWeek: ClassSchedulePattern['dayOfWeek'];
    startPeriod: number;
    endPeriod: number;
    locationId: number;
  }[];
}

// DTO để cập nhật pattern (update 1 pattern)
export interface ClassSchedulePatternUpdateDTO {
  id: number;
  classId: number;
  startDate: string; // yyyy-MM-dd
  endDate: string;   // yyyy-MM-dd
  slots: {
    dayOfWeek: ClassSchedulePattern['dayOfWeek'];
    startPeriod: number;
    endPeriod: number;
    locationId: number;
  }[];
  active: boolean;
}
