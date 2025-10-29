import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { hideLoader, showLoader } from "../../redux/store/loader-slices";
import store from "../../redux/store/store";
import { getSnackbarContext } from "../hooks/use-toast";
import { logOut } from "../../redux/store/isLogged-slices";

interface CustomHttpRequestConfig extends AxiosRequestConfig {
  withLoader?: boolean;
  withFailureAlert?: boolean;
  withSuccessAlert?: boolean;
  withSuccessLogs?: boolean;
  withFailureLogs?: boolean;
}

class NetworkService {
  private static instance: NetworkService;
  private axiosInstance: AxiosInstance;
  private showMessage: (
    title: string,
    message: string,
    severity: "success" | "error" | "warning" | "info",
  ) => void;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: "https://foknje7ek.com:8081/api/v1/",
    });

    // Initialize Snackbar Context
    const snackbarContext = getSnackbarContext();

    if (!snackbarContext || !snackbarContext.showMessage) {
      throw new Error(
        "SnackbarContext is not initialized. Make sure to wrap your app with SnackbarProvider.",
      );
    }

    this.showMessage = snackbarContext.showMessage;

    this.axiosInstance.interceptors.request.use(
      // @ts-ignore
      (config: CustomHttpRequestConfig) => {
        if (config.withLoader) {
          store.dispatch(showLoader());
        }

        const token = localStorage.getItem("token");

        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          };
        }

        return config;
      },
      (error) => {
        store.dispatch(hideLoader());
        return Promise.reject(error);
      },
    );

    this.axiosInstance.interceptors.response.use(
      (response: any) => {
        if (response.config.withLoader) {
          store.dispatch(hideLoader());
        }

        if (response.config.withSuccessLogs) {
          console.log("Success:", response);
        }

        if (response.config.withSuccessAlert) {
          this.showMessage("Succes", "Request succeeded!", "success");
        }

        return response;
      },
      (error) => {
        const { response, config } = error;

        if (config?.withLoader) {
          store.dispatch(hideLoader());
        }

        if (response) {
          let errorMessage = ``;

          switch (response.status) {
            case 400:
            case 404:
            default:
              const errors = response.data?.data;
              if (errors && typeof errors === "object") {
                errorMessage += Object.values(errors).flat().join(" ");
              } else {
                errorMessage +=
                  response.data?.errors[0] || "An error occurred.";
              }
              this.showMessage("Error", errorMessage, "error");
              break;
            
            case 401:
            case 403:
              this.showMessage(
                response.data?.message,
                "Accès non autorisé.",
                "error",
              );
              window.location.href = "/";
              localStorage.removeItem("token");
              store.dispatch(logOut());

              break;
          }
        } else {
          if (config?.withFailureAlert) {
            this.showMessage(
              response.data?.message,
              "Network error. Please check your connection.",
              "error",
            );
          }
        }

        if (config?.withFailureLogs) {
          console.log("Error:", error);
        }

        return Promise.reject(error);
      },
    );
  }

  public static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  public async sendHttpRequest(
    config: CustomHttpRequestConfig,
  ): Promise<AxiosResponse> {
    return this.axiosInstance.request(config);
  }
}

export default NetworkService;
