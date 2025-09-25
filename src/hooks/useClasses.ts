// useClasses.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Class } from '../types'; 
import type { ClassCreateDTO, ClassUpdateDTO } from '../api/classApi'; 
import classApi from '../api/classApi';

export const useClasses = () => {
  const queryClient = useQueryClient();

  // query lấy danh sách lớp
  const classesQuery = useQuery<Class[], Error>({
    queryKey: ['classes'],
    queryFn: classApi.getAll,
    staleTime: 1000 * 60 * 5,
  });

  // mutation tạo lớp
  const createClassMutation = useMutation<Class, Error, ClassCreateDTO>({
    mutationFn: classApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  // mutation cập nhật lớp
  const updateClassMutation = useMutation<Class, Error, ClassUpdateDTO>({
    mutationFn: classApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  // mutation xóa lớp
  const deleteClassMutation = useMutation<void, Error, number>({
    mutationFn: classApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  return {
    // query object gốc -> sẽ có: data, isLoading, error, refetch...
    ...classesQuery,
      classes: classesQuery.data,

    createClass: createClassMutation.mutateAsync,
    updateClass: updateClassMutation.mutateAsync,
    deleteClass: deleteClassMutation.mutateAsync,

    isCreating: createClassMutation.isPending,
    isUpdating: updateClassMutation.isPending,
    isDeleting: deleteClassMutation.isPending,
  };
};
