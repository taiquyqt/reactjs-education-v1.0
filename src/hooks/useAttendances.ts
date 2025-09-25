import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import attendanceApi from '../api/attendanceApi';
import type { Attendance, BulkAttendanceRequest } from '../types/Attendance';

// Lấy danh sách điểm danh theo buổi học
export const useAttendancesBySession = (sessionId: number) => {
  return useQuery<Attendance[], Error>({
    queryKey: ['attendances', sessionId],
    queryFn: () => attendanceApi.getBySessionId(sessionId),
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5,
  });
};

// Ghi nhận điểm danh cả lớp
export const useRecordAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: BulkAttendanceRequest }) =>
      attendanceApi.recordAttendance(sessionId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendances', variables.sessionId] });
    },
  });
};

// Cập nhật điểm danh một học sinh
export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: number; data: Partial<Attendance> }) =>
      attendanceApi.updateAttendance(recordId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
    },
  });
};
