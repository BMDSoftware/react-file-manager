import { api } from "./api";

export const deleteAPI = async (ids, workspace) => {
  const response = await api.delete("", { data: { ids: ids, workspace: workspace } });
  return response;
};
