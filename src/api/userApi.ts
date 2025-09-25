/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "./apiClient";

export const fetchUsers = async () => {
  const { data } = await apiClient.get("/users");
  return data;
};

export const createUser = async (userData: any) => {
  const { data } = await apiClient.post("/users", userData);
  return data;
};

export const updateUser = async (userId: number, userData: any) => {
  const { data } = await apiClient.patch(`/users/${userId}`, userData);
  return data;
};

export const deleteUser = async (userId: number) => {
  const { data } = await apiClient.delete(`/users/${userId}`);
  return data;
};
