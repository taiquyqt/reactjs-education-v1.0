/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { materialsApi } from '../api/materialsApi';
import type { ClassMaterial } from '../types';

/**
 * Lấy danh sách tài liệu.
 * - Nếu classId = 0 hoặc null => lấy tất cả
 * - Nếu classId > 0 => lấy theo lớp
 */
export const useMaterialsByClass = (classId?: number | null) => {
  return useQuery<ClassMaterial[], Error>({
    queryKey: ['materials', classId ?? 'all'],
    queryFn: async () => {
      try {
        if (!classId || classId === 0) {
          const res = await materialsApi.getAll(); // /materials
          return res;
        } else {
          const res = await materialsApi.getByClass(classId); // /materials/class/{classId}
          return res;
        }
      } catch (err: any) {
        message.error('Lỗi khi lấy danh sách tài liệu: ' + (err.response?.data?.message || err.message));
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
};

export const useCreateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => materialsApi.create(formData),
    onSuccess: () => {
      message.success('Tạo tài liệu thành công');
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
    onError: (err: any) => {
      message.error('Tạo tài liệu thất bại: ' + (err.response?.data?.message || err.message));
    },
  });
};

export const useUpdateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      materialsApi.update(id, formData),
    onSuccess: () => {
      message.success('Cập nhật tài liệu thành công');
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
    onError: (err: any) => {
      message.error('Cập nhật tài liệu thất bại: ' + (err.response?.data?.message || err.message));
    },
  });
};

export const useDeleteMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => materialsApi.delete(id),
    onSuccess: () => {
      message.success('Xóa tài liệu thành công');
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
    onError: (err: any) => {
      message.error('Xóa tài liệu thất bại: ' + (err.response?.data?.message || err.message));
    },
  });
};
