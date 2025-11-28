
import NetworkService from "../config/interceptor/interceptor";
// Validate promo code for student offer
export const validatePromoCode = async (code: string, offerId: number, userId: string) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `promo-codes/validate`,
    method: "POST",
    params: { code, offerId, userId },
    withLoader: false,
    withFailureLogs: false,
  });
  return response.data;
};

export const createStudentOfferService = async (data: any) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `offers/student`,
    method: "POST",
    withLoader: true,
    withFailureLogs: false,
    data: data,
  });
  return response.data;
};

export const updateStudentOfferService = async (id: number, data: any) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `offers/student/${id}`,
    method: "PUT",
    withLoader: true,
    withFailureLogs: false,
    data: data,
  });
  return response.data;
};

export const getAllStudentOfferService = async () => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `offers/student`,
    method: "GET",
    withLoader: true,
    withFailureLogs: false,
  });
  return response.data;
};

export const getStudentOfferService = async (id: number) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `offers/student/${id}`,
    method: "GET",
    withLoader: true,
    withFailureLogs: false,
  });
  return response.data;
};

export const deleteStudentOfferService = async (id: number) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `offers/student/${id}`,
    method: "DELETE",
    withLoader: true,
    withFailureLogs: false,
  });
  return response.data;
};

export const respondOfferService = async (
  id: number,
  status: "ACCEPTED" | "REJECTED",
) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `offers/student-request/${id}`,
    method: "PUT",
    withLoader: true,
    withFailureLogs: false,
    params: { status: status },
  });
  return response.data;
};

export const getAllStudentRequests = async () => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `offers/student-requests`,
    method: "GET",
    withLoader: true,
    withFailureLogs: false,
  });
  return response.data;
};

export const getAllStudentCurrentRequests = async () => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `offers/student/current-requests`,
    method: "GET",
    withLoader: true,
    withFailureLogs: false,
  });
  return response.data;
};

//student-offers+matiers(get+post)
export const getAvailableSubjects = async () => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `subjects`,
    method: "GET",
    withLoader: true,
    withFailureLogs: false,
  });
  return response.data;
};
export const sendOfferService = async (id: number, data: any, subjectIds?: string) => {
  const url = subjectIds !== undefined
    ? `offers/student-request/${id}?subjectIds=${subjectIds}`
    : `offers/student-request/${id}`;
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: url,
    method: "POST",
    withLoader: true,
    withFailureLogs: false,
    data: data,
  });
  return response.data;
};