import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import activityLogApi from '../api/activityLogApi';
import type { ActivityLog } from '../types';

export const useActivityLogs = () => {
  const queryClient = useQueryClient();

  const query = useQuery<ActivityLog[], Error>({
    queryKey: ['activityLogs'],
    queryFn: activityLogApi.getAll,
    staleTime: 5 * 60 * 1000,
  });

  const deleteLogs = useMutation({
    mutationFn: (ids: number[]) => activityLogApi.deleteMany(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
    },
  });

  return {
    ...query,
    deleteLogs,
  };
};
