import NetworkService from "../config/interceptor/interceptor";

export const loginService = async (credentials: {
  email: string;
  password: string;
}) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: "auth/login",
    method: "POST",
    data: credentials,
    withLoader: true,
    withFailureLogs: false,
  });
  return response.data;
};
export const RegisterService = async (role: string, credentials: any) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: "auth/register",
    method: "POST",
    data: credentials,
    withLoader: true,
    withFailureLogs: false,
    params: { roleName: role },
  });
  return response.data;
};
export const RegisterStudentService = async (credentials: any) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: "auth/register/student",
    method: "POST",
    data: credentials,
    withLoader: true,
    withFailureLogs: false,
  });
  return response.data;
};
export const forgetPassword = async (email: any) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: "auth/forgot-password",
    method: "GET",
    withLoader: true,
    withFailureLogs: false,
    params: {
      email: email,
    },
  });
  return response.data;
};

export const confirmEmail = async (email: string, code: string) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: "auth/confirm",
    method: "POST",
    withLoader: true,
    withFailureLogs: false,
    params: {
      email: email,
      code: code,
    },
  });
  return response.data;
};

export const resendConfirmationCode = async (email: string) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: "auth/resend-confirmation-code",
    method: "POST",
    withLoader: false,
    withFailureLogs: false,
    params: {
      email: email,
    },
  });
  return response.data;
};



export const ResetPassword = async (
  token: string,
  email: string,
  password: string,
) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: "auth/reset-password",
    method: "PUT",
    withLoader: true,
    withFailureLogs: false,
    params: {
      token: token,
      email: email,
      password: password,
    },
  });
  return response.data;
};
// Ajoutez cette fonction dans votre fichier de services
export const updateProfile = async (userData: any) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: "user/update-profile", // Endpoint à créer côté serveur
    method: "PUT",
    data: userData,
    withLoader: true,
    withFailureLogs: true
  });
  return response.data;
};