import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import type { ClassUser, AddStudentToClassDTO } from '../types';

const BASE_URL = '/auth/classes';

export const useClassUsers = (classId?: number) => {
  const queryClient = useQueryClient();

  // Lấy danh sách học sinh trong lớp
  const query = useQuery<ClassUser[], Error>({
    queryKey: ['classUsers', classId],
    queryFn: async () => {
      if (!classId) return [];
      const res = await apiClient.get<ClassUser[]>(`${BASE_URL}/${classId}/students`);
      return res.data;
    },
    enabled: !!classId,
    staleTime: 1000 * 60 * 5,
  });

  // Thêm học sinh vào lớp
  const addMutation = useMutation({
    mutationFn: (data: AddStudentToClassDTO) =>
      apiClient.post(`${BASE_URL}/add-student`, data).then(res => res.data),
    onSuccess: () => {
      if (classId) queryClient.invalidateQueries({ queryKey: ['classUsers', classId] });
    },
  });

  // Xóa học sinh khỏi lớp
  const removeMutation = useMutation({
    mutationFn: (studentId: number) =>
      apiClient.delete(`${BASE_URL}/student/${studentId}/classes/${classId}`).then(res => res.data),
    onSuccess: () => {
      if (classId) queryClient.invalidateQueries({ queryKey: ['classUsers', classId] });
    },
  });

  return {
    classUsers: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    addStudent: addMutation.mutateAsync,
    removeStudent: removeMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
};
