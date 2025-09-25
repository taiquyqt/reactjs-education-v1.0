/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import quizApi from '../api/quizApi';
import type { Quiz } from '../types';

export const useQuizzes = () => {
  const queryClient = useQueryClient();

  // Lấy danh sách quiz
  const quizzesQuery = useQuery<Quiz[], Error>({
    queryKey: ['quizzes'],
    queryFn: quizApi.getAll,
    staleTime: 1000 * 60 * 5,
  });

  // Thêm bài kiểm tra
  const createQuizMutation = useMutation<Quiz, Error, Partial<Quiz>>({
    mutationFn: quizApi.create,
    onSuccess: () => {
      message.success('Thêm bài kiểm tra thành công');
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
    onError: (err: any) => {
      message.error(err.message || 'Thêm bài kiểm tra thất bại');
    },
  });

  // Cập nhật bài kiểm tra
  const updateQuizMutation = useMutation<Quiz, Error, { id: number; data: Partial<Quiz> }>({
    mutationFn: ({ id, data }) => quizApi.update(id, data),
    onSuccess: () => {
      message.success('Cập nhật bài kiểm tra thành công');
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
    onError: (err: any) => {
      message.error(err.message || 'Cập nhật bài kiểm tra thất bại');
    },
  });

  // Xóa bài kiểm tra
  const deleteQuizMutation = useMutation<void, Error, number>({
    mutationFn: quizApi.remove,
    onSuccess: () => {
      message.success('Xóa bài kiểm tra thành công');
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
    onError: (err: any) => {
      message.error(err.message || 'Xóa bài kiểm tra thất bại');
    },
  });

  return {
    // Giữ nguyên object query gốc -> có .data, .isLoading, .error, .refetch...
    ...quizzesQuery,


    createQuiz: createQuizMutation.mutateAsync,
    updateQuiz: updateQuizMutation.mutateAsync,
    deleteQuiz: deleteQuizMutation.mutateAsync,

    isCreating: createQuizMutation.isPending,
    isUpdating: updateQuizMutation.isPending,
    isDeleting: deleteQuizMutation.isPending,
  };
};
