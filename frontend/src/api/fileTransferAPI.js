import { api } from "./api";

export const copyItemAPI = async (sourceIds, destinationId, workspace) => {
  const response = await api.post("/copy", { sourceIds, destinationId, workspace });
  return response;
};

export const moveItemAPI = async (sourceIds, destinationId, workspace) => {
  const response = await api.put("/move", { sourceIds, destinationId, workspace });
  return response;
};
