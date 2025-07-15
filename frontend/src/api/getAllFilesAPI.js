import { api } from "./api";

export const getAllFilesAPI = async (workspace, additionalPath, offset, limit) => {
  try {
    const params = { workspace, additionalPath, offset, limit };
    const response = await api.get("", {params});
    return response;
  } catch (error) {
    return error;
  }
};
