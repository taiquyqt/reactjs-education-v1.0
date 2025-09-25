/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import assignmentApi from '../api/assignmentApi';
import type { Assignment } from '../types';

export const useAssignments = (classId?: number) => {
  const queryClient = useQueryClient();

  // Query danh sách bài tập
  const assignmentsQuery = useQuery<Assignment[], Error>({
    queryKey: ['assignments', classId ?? 'all'],
    queryFn: () => assignmentApi.getAll(classId),
    enabled: true,
    staleTime: 1000 * 60 * 5,
  });

  // Mutation thêm bài tập (FormData luôn)
  const createAssignmentMutation = useMutation<Assignment, Error, FormData>({
    mutationFn: assignmentApi.create,
    onSuccess: () => {
      message.success('Thêm bài tập thành công');
      queryClient.invalidateQueries({ queryKey: ['assignments', classId ?? 'all'] });
    },
    onError: (err: any) => {
      message.error(err.message || 'Thêm bài tập thất bại');
    },
  });

  // Mutation cập nhật bài tập (FormData)
  const updateAssignmentMutation = useMutation<
    Assignment,
    Error,
    { id: number; data: FormData }
  >({
    mutationFn: ({ id, data }) => assignmentApi.update(id, data),
    onSuccess: () => {
      message.success('Cập nhật bài tập thành công');
      queryClient.invalidateQueries({ queryKey: ['assignments', classId ?? 'all'] });
    },
    onError: (err: any) => {
      message.error(err.message || 'Cập nhật bài tập thất bại');
    },
  });

  // Mutation xóa bài tập
  const deleteAssignmentMutation = useMutation<void, Error, number>({
    mutationFn: assignmentApi.remove,
    onSuccess: () => {
      message.success('Xóa bài tập thành công');
      queryClient.invalidateQueries({ queryKey: ['assignments', classId ?? 'all'] });
    },
    onError: (err: any) => {
      message.error(err.message || 'Xóa bài tập thất bại');
    },
  });

  return {
    ...assignmentsQuery,
    assignments: assignmentsQuery.data || [],
    isLoading: assignmentsQuery.isLoading,
    isError: assignmentsQuery.isError,
    error: assignmentsQuery.error,

    // CRUD operations
    createAssignment: createAssignmentMutation.mutateAsync,
    updateAssignment: updateAssignmentMutation.mutateAsync,
    deleteAssignment: deleteAssignmentMutation.mutateAsync,

    // State flags
    isCreating: createAssignmentMutation.isPending,
    isUpdating: updateAssignmentMutation.isPending,
    isDeleting: deleteAssignmentMutation.isPending,
  };
};
