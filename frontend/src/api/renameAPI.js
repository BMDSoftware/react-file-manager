import { api } from "./api";

export const renameAPI = async (id, newName, workspace) => {
  const response = api.patch("/rename", {
    id,
    newName,
    workspace
  });
  return response;
};
