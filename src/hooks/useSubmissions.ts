import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import submissionApi from '../api/submissionApi';
import type { Submission } from '../types/Submissions';

export const useSubmissions = (assignmentId?: number) => {
  const queryClient = useQueryClient();

  const submissionsQuery = useQuery<Submission[], Error>({
    queryKey: ['submissions', assignmentId ?? 'all'],
    queryFn: () => assignmentId ? submissionApi.getAll(assignmentId) : submissionApi.getAll(),
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => submissionApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['submissions', assignmentId ?? 'all'] }),
  });

  return {
    data: submissionsQuery.data,
    isLoading: submissionsQuery.isLoading,
    isError: submissionsQuery.isError,
    refetch: submissionsQuery.refetch,
    deleteSubmission: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
