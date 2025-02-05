import { api } from "./api";

export const getAllFilesAPI = async (workspace, additionalPath) => {
  try {
    const params = { workspace, additionalPath };
    const response = await api.get("", {params});
    return response;
  } catch (error) {
    return error;
  }
};
