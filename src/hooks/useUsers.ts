// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, createUser, updateUser, deleteUser } from '../api/userApi';
import type { User } from '../types';

// Hook lấy danh sách người dùng
export const useUsers = () => {
  return useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, Partial<User>>({
    mutationFn: createUser,
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previousUsers = queryClient.getQueryData<User[]>(['users']);
      const tempId = Date.now(); // ID tạm
      queryClient.setQueryData<User[]>(['users'], (old) => [
        ...(old || []),
        { id: tempId, ...newUser } as User,
      ]);
      return { previousUsers };
    },
    onError: (_err, _newUser, context) => {
      // rollback nếu lỗi
      const ctx = context as { previousUsers?: User[] } | undefined;
      queryClient.setQueryData(['users'], ctx?.previousUsers);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useMutation<void, any, number>({
    mutationFn: deleteUser,
    onMutate: async (userId) => {
      if (!userId) return;
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previousUsers = queryClient.getQueryData<User[]>(['users']);
      queryClient.setQueryData<User[]>(['users'], (old) =>
        old?.filter((user) => user.id !== userId) || []
      );
      return { previousUsers };
    },
    onError: (_err, _userId, context) => {
      const ctx = context as { previousUsers?: User[] } | undefined;
      queryClient.setQueryData(['users'], ctx?.previousUsers);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { userId: number; userData: Partial<User> }>({
    mutationFn: ({ userId, userData }) => updateUser(userId, userData),
    onMutate: async ({ userId, userData }) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previousUsers = queryClient.getQueryData<User[]>(['users']);
      queryClient.setQueryData<User[]>(['users'], (old) =>
        old?.map((user) =>
          user.id === userId ? { ...user, ...userData } : user
        ) || []
      );
      return { previousUsers };
    },
    onError: (_err, _vars, context) => {
      const ctx = context as { previousUsers?: User[] } | undefined;
      queryClient.setQueryData(['users'], ctx?.previousUsers);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
