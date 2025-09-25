import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import type { Location, CreateLocationRequest, UpdateLocationRequest } from '../types';

const BASE_URL = '/auth/locations';

export const useLocations = () => {
  const queryClient = useQueryClient();

  // Lấy danh sách locations
  const query = useQuery<Location[], Error>({
    queryKey: ['locations'],
    queryFn: async () => {
      const res = await apiClient.get<Location[]>(BASE_URL);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateLocationRequest) =>
      apiClient.post<Location>(BASE_URL, data).then(res => res.data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['locations'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLocationRequest }) =>
      apiClient.put<Location>(`${BASE_URL}/${id}`, data).then(res => res.data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['locations'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiClient.delete(`${BASE_URL}/${id}`).then(res => res.data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['locations'] }),
  });

  return {
    locations: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createLocation: createMutation.mutateAsync,
    updateLocation: updateMutation.mutateAsync,
    deleteLocation: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
