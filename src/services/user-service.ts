import NetworkService from "../config/interceptor/interceptor";

export const getAllUsersService = async () => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: "users",
    method: "GET",
    withLoader: true,
    withFailureLogs: true,
  });
  return response.data;
};

export const updateUserService = async (id: number | string, userData: any) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `users/${id}`,
    method: "PUT",
    data: userData,
    withLoader: true,
    withFailureLogs: true,
  });
  return response.data;
};

export const deleteUserService = async (id: number | string) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `users/${id}`,
    method: "DELETE",
    withLoader: true,
    withFailureLogs: true,
  });
  return response.data;
};

const UserService = {
  getAllUsersService,
  updateUserService,
  deleteUserService,
};

export default UserService;
