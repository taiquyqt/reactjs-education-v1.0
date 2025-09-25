import apiClient from "./apiClient";
import type { Submission } from "../types/Submissions";

const submissionApi = {
  getAll: async (assignmentId?: number): Promise<Submission[]> => {
    const url = assignmentId ? `/submissions/assignment/${assignmentId}` : '/submissions';
    const { data } = await apiClient.get(url);
    return data;
  },
  delete: async (id: number) => {
    const { data } = await apiClient.delete(`/submissions/${id}`);
    return data;
  },
};

export default submissionApi;
