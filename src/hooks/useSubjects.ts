// hooks/useSubjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import subjectApi from '../api/subjectApi';
import type { Subject } from '../types';

// Hook lấy danh sách môn học
export const useSubjects = () => {
  return useQuery<Subject[], Error>({
    queryKey: ['subjects'],
    queryFn: subjectApi.getAll,
    staleTime: 1000 * 60 * 5,
  });
};

// Hook tạo môn học
export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation<Subject, Error, Partial<Subject>>({
    mutationFn: subjectApi.create,
    onMutate: async (newSubject) => {
      await queryClient.cancelQueries({ queryKey: ['subjects'] });
      const previousSubjects = queryClient.getQueryData<Subject[]>(['subjects']);

      const tempId = Date.now();
      queryClient.setQueryData<Subject[]>(['subjects'], (old) => [
        ...(old || []),
        { id: tempId, ...newSubject } as Subject,
      ]);

      return { previousSubjects };
    },
    onError: (err, _, context) => {
      const ctx = context as { previousSubjects?: Subject[] } | undefined;
      if (ctx?.previousSubjects) {
        queryClient.setQueryData(['subjects'], ctx.previousSubjects);
      }
      message.error(err.message || 'Tạo môn học thất bại');
    },
    onSuccess: () => {
      message.success('Tạo môn học thành công');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
};

// Hook xóa môn học
export const useDeleteSubject = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: subjectApi.delete,
    onMutate: async (subjectId) => {
      await queryClient.cancelQueries({ queryKey: ['subjects'] });
      const previousSubjects = queryClient.getQueryData<Subject[]>(['subjects']);

      queryClient.setQueryData<Subject[]>(['subjects'], (old) =>
        old?.filter((subject) => subject.id !== subjectId) || []
      );

      return { previousSubjects };
    },
    onError: (err, _, context) => {
      const ctx = context as { previousSubjects?: Subject[] } | undefined;
      if (ctx?.previousSubjects) {
        queryClient.setQueryData(['subjects'], ctx.previousSubjects);
      }
      message.error(err.message || 'Xóa môn học thất bại');
    },
    onSuccess: () => {
      message.success('Xóa môn học thành công');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
};

// Hook cập nhật môn học
export const useUpdateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation<Subject, Error, { subjectId: number; subjectData: Partial<Subject> }>({
    mutationFn: ({ subjectId, subjectData }) => subjectApi.update(subjectId, subjectData),
    onMutate: async ({ subjectId, subjectData }) => {
      await queryClient.cancelQueries({ queryKey: ['subjects'] });
      const previousSubjects = queryClient.getQueryData<Subject[]>(['subjects']);

      queryClient.setQueryData<Subject[]>(['subjects'], (old) =>
        old?.map((subject) =>
          subject.id === subjectId ? { ...subject, ...subjectData } : subject
        ) || []
      );

      return { previousSubjects };
    },
    onError: (err, _, context) => {
      const ctx = context as { previousSubjects?: Subject[] } | undefined;
      if (ctx?.previousSubjects) {
        queryClient.setQueryData(['subjects'], ctx.previousSubjects);
      }
      message.error(err.message || 'Cập nhật môn học thất bại');
    },
    onSuccess: () => {
      message.success('Cập nhật môn học thành công');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
};
