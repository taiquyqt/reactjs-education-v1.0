/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import patternsApi from '../api/patternsApi';
import type {
  ClassSchedulePattern,
  ClassSchedulePatternCreateDTO,
  ClassSchedulePatternUpdateDTO,
} from '../types/Pattern';

export const usePatterns = (classId?: number) => {
  const queryClient = useQueryClient();

  const query = useQuery<ClassSchedulePattern[], Error>({
    queryKey: ['patterns', classId ?? 'all'],
    queryFn: async () => {
      if (classId) {
        return await patternsApi.getAllByClass(classId);
      }
      return await patternsApi.getAll();
    },
    staleTime: 1000 * 60 * 5,
  });

  // Mutation tạo batch pattern
  const createMutation = useMutation({
    mutationFn: (dto: ClassSchedulePatternCreateDTO) =>
      patternsApi.createBatch(dto),
    onSuccess: () => {
      message.success('Tạo pattern thành công');
      queryClient.invalidateQueries({ queryKey: ['patterns', classId ?? 'all'] });
    },
    onError: (err: any) => message.error(err.message || 'Tạo pattern thất bại'),
  });

  // Mutation cập nhật batch
  const updateMutation = useMutation({
    mutationFn: (dto: ClassSchedulePatternUpdateDTO) =>
      patternsApi.updateBatch(dto),
    onSuccess: () => {
      message.success('Cập nhật pattern thành công');
      queryClient.invalidateQueries({ queryKey: ['patterns', classId ?? 'all'] });
    },
    onError: (err: any) => message.error(err.message || 'Cập nhật pattern thất bại'),
  });

  // Mutation xóa pattern
  const deleteMutation = useMutation({
    mutationFn: (id: number) => patternsApi.delete(id),
    onSuccess: () => {
      message.success('Xóa pattern thành công');
      queryClient.invalidateQueries({ queryKey: ['patterns', classId ?? 'all'] });
    },
    onError: (err: any) => message.error(err.message || 'Xóa pattern thất bại'),
  });

  return {
    patterns: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,

    createPatterns: createMutation.mutateAsync, // batch create
    updatePatterns: updateMutation.mutateAsync, // batch update
    deletePattern: deleteMutation.mutateAsync,  // delete 1

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
