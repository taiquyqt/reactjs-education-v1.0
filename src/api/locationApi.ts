
import apiClient from './apiClient';
import type { Location } from '../types';

const BASE_URL = '/auth/locations';

const locationApi = {
  getAll: async (): Promise<Location[]> => {
    const response = await apiClient.get<Location[]>(BASE_URL);
    return response.data;
  },
};

export default locationApi;
