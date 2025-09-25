import { useQuery } from '@tanstack/react-query';
import schedulesApi from '../api/scheduleApi';
import type { ClassScheduleSession } from '../types/Schedule';

export const useSchedules = (classId?: number) => {
  const { data: schedules, ...rest } = useQuery<ClassScheduleSession[]>({
    queryKey: ['schedules', classId],
    queryFn: () => classId ? schedulesApi.getAllByClass(classId) : Promise.resolve([]),
    enabled: !!classId, 
  });

  return {
    schedules,
    ...rest,
  };
};
