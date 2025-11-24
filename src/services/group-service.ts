import NetworkService from "../config/interceptor/interceptor";

export const createGroupService = async (credentials: any) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: "groups",
    method: "POST",
    data: credentials,
    withLoader: true,
    withFailureLogs: false,
  });
  return response.data;
};
export const updateGroupService = async (id: number, credentials: any) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `groups/${id}`,
    method: "PUT",
    data: credentials,
    withLoader: true,
    withFailureLogs: false,
  });
  return response.data;
};
export const getGroupByIdService = async (id: number) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `groups/${id}`,
    method: "PUT",
    withLoader: true,
    withFailureLogs: false,
  });
  return response.data;
};
export const getUserGroupService = async () => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `groups`,
    method: "GET",
    withLoader: true,
    withFailureLogs: false,
  });
  return response.data;
};
export const getUserPublicGroupService = async () => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `groups/public`,
    method: "GET",
    withLoader: true,
    withFailureLogs: false,
  });
  return response.data;
};
export const addStudentGroupService = async (
  id: number,
  studentId: string,
  studentOfferId: string,
  selectedPeriod: string
) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `groups/add-student/${studentId}`,
    method: "PUT",
    withLoader: true,
    withFailureLogs: false,
    data: {
      studentOfferId,
      selectedPeriod,
    },
  });
  return response.data;
};
export const RemoveStudentGroupService = async (
  id: number,
  studentId: string,
) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `groups/${id}/remove-student/${studentId}`,
    method: "PUT",
    withLoader: true,
    withFailureLogs: false,
  });
  return response.data;
};
export const makePublicGroupService = async (id: number, isPublic: boolean) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `groups/${id}/make-public`,
    method: "PUT",
    withLoader: true,
    withFailureLogs: false,
    params: { isPublic: isPublic },
  });
  return response.data;
};
export const deleteGroupService = async (id: number) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `groups/${id}`,
    method: "DELETE",
    withLoader: true,
    withFailureLogs: false,
  });
  return response.data;
};
