import NetworkService from "../config/interceptor/interceptor";

export const createPlayListService = async (subject: number, data: any) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `play-lists`,
    method: "POST",
    withLoader: true,
    withFailureLogs: false,
    data: data,
    params: { subjectId: subject },
  });
  return response.data;
};
export const updatePlayListService = async (
  id: number,
  subject: number,
  data: any,
) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `play-lists/${id}`,
    method: "PUT",
    withLoader: true,
    withFailureLogs: false,
    data: data,
    params: { subjectId: subject },
  });
  return response.data;
};
export const uploadItemPlayListService = async (
  id: number,
  data: any,
  onUploadProgress: any,
) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `play-lists/${id}/upload`,
    method: "PUT",
    withLoader: false,
    withFailureLogs: false,
    data: data,
    onUploadProgress: onUploadProgress,
  });
  return response.data;
};

export const updateItemPlayListService = async (
  itemId: number,
  subjectId : number,
  url: string,
  category: string
) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `play-lists/url?subjectId=${subjectId}&itemId=${itemId}&url=${url}&category=${category}`,
    method: "PUT",
    withLoader: true,
    withFailureLogs: false
  });
  return response.data;
}

export const getSasTokenService = async (
  blobName: string
) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `azure-storage/generate-sas?blobName=${blobName}`,
    method: "GET",
    withLoader: true,
    withFailureLogs: false
  });
  return response.data;
}


export const getPlayListService = async (id: number) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `play-lists/${id}`,
    method: "GET",
    withLoader: true,
    withFailureLogs: false,
  });
  return response.data;
};
export const deletePlaylistService = async (id: number) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `play-lists/${id}`,
    method: "DELETE",
    withLoader: true,
    withFailureLogs: false,
  });
  return response.data;
};
export const deleteItemPlaylistService = async (id: number, fileId: number) => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `play-lists/${id}/item/${fileId}`,
    method: "DELETE",
    withLoader: true,
    withFailureLogs: false,
  });
  return response.data;
};

export const getStatService = async () => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `stats`,
    method: "GET",
    withLoader: true,
    withFailureLogs: false,
  });
  return response.data;
};
