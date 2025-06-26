import axiosInstance from "./axiosInstance";

const processApi = {
  getByModule: (module) => axiosInstance.get(`/api/process/${module}`),

  save: (payload) => axiosInstance.post(`/api/process`, payload),

  download: (stepId) =>
    `${axiosInstance.defaults.baseURL}/api/process/download/${stepId}`,

  delete: (id) => axiosInstance.delete(`/api/process/${id}`),
};

export default processApi;
