import apiClient from "./apiClient";

export const getTasks = async () => {
  const response = await apiClient.get("/tasks");
  return response.data;
};

export const getFullTaskDetails = async (taskId) => {
  const response = await apiClient.get(`/tasks/${taskId}/full-details`);
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await apiClient.post("/tasks", taskData);
  return response.data;
};

export const assignSeoTask = async (taskId) => {
  const response = await apiClient.post(`/tasks/${taskId}/assign-seo`, {
    assigned_by: "CEO",
  });
  return response.data;
};

export const runSeoAgent = async (taskId) => {
  const response = await apiClient.post(`/agents/seo/run/${taskId}`, {
    triggered_by: "CEO",
  });
  return response.data;
};

export const reviewTask = async (taskId, reviewData) => {
  const response = await apiClient.post(`/tasks/${taskId}/review`, reviewData);
  return response.data;
};

export const reviseSeoOutput = async (taskId) => {
  const response = await apiClient.post(`/agents/seo/revise/${taskId}`, {
    triggered_by: "CEO",
  });
  return response.data;
};

export const finalizeTask = async (taskId) => {
  const response = await apiClient.post(`/tasks/${taskId}/finalize`, {
    generated_by: "CEO",
  });
  return response.data;
};

export const downloadReportUrl = (taskId) => {
  return `http://localhost:5000/api/reports/${taskId}/download`;
};

export const archiveTask = async (taskId) => {
  const response = await apiClient.patch(`/tasks/${taskId}/archive`, {
    changed_by: "CEO",
  });
  return response.data;
};

export const restoreTask = async (taskId) => {
  const response = await apiClient.patch(`/tasks/${taskId}/restore`, {
    changed_by: "CEO",
  });
  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await apiClient.delete(`/tasks/${taskId}`);
  return response.data;
};