import apiClient from "./apiClient";
import type { Credentials, AuthResponse } from "../types/Auth";

export const login = async (payload: Credentials): Promise<AuthResponse> => {
  const response = await apiClient.post("/auth/login", payload);
  const data = response.data.data;
console.log('Dữ liệu nhận được từ API:', data);
  return {
    token: data.accessToken,
    user: {
      id: data.userId,
      username: data.username,
      fullName: data.username,
      email: data.email,
      roles: data.roles,   
    },
  };
};
