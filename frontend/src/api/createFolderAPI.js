import { api } from "./api";

export const createFolderAPI = async (name, parentId, workspace) => {
  try {
    const response = await api.post("/folder", { name, parentId, workspace });
    return response;
  } catch (error) {
    return error;
  }
};
