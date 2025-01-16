import { api } from "./api";

export const createFolderAPI = async (name, parentPath) => {
  try {
    const response = await api.post("/folder", { name, parentPath });
    return response;
  } catch (error) {
    return error;
  }
};
