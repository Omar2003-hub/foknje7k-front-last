import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { hideLoader, showLoader } from "../../redux/store/loader-slices";
import store from "../../redux/store/store";
import { getSnackbarContext } from "../hooks/use-toast";
import { logOut } from "../../redux/store/isLogged-slices";
import { BASE_API_URL } from "../api";

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
      baseURL: BASE_API_URL,
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
              // Try to collect textual error info from different response shapes
              const collectedErrors: string[] = [];
              const pushIfString = (v: any) => {
                if (!v) return;
                if (typeof v === "string") collectedErrors.push(v);
                else if (Array.isArray(v)) collectedErrors.push(...v.filter(Boolean).map(String));
                else if (typeof v === "object") collectedErrors.push(...Object.values(v).flat().map(String));
              };

              pushIfString(response.data?.message);
              pushIfString(response.data?.errors);
              pushIfString(response.data?.data);

              const combined = collectedErrors.join(" ").toLowerCase();

              const isDisabled =
                combined.includes("disabled") ||
                combined.includes("désactiv") ||
                combined.includes("desactiv");

              if (isDisabled) {
                // Attempt to determine the user's email from several places before clearing auth
                const state = store.getState();
                let userEmail = state.user?.userData?.email;

                // Try response payload
                if (!userEmail) {
                  userEmail = response.data?.data?.email;
                }

                // Try request payload (config.data) if it's JSON containing email
                if (!userEmail && config?.data) {
                  try {
                    const parsed = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
                    if (parsed?.email) userEmail = parsed.email;
                  } catch (e) {
                    // ignore parse errors
                  }
                }

                this.showMessage(
                  "Erreur",
                  "Veuillez confirmer votre email pour activer votre compte.",
                  "error",
                );

                localStorage.removeItem("token");
                store.dispatch(logOut());

                // Always redirect to confirm-email for disabled accounts
                // Note: resendConfirmationCode is NOT called here to avoid duplicate calls
                // The login page or confirm-email page will handle resending
                const target = userEmail
                  ? `/confirm-email?email=${encodeURIComponent(userEmail)}`
                  : "/confirm-email";
                window.location.href = target;
              } else {
                this.showMessage(
                  response.data?.message || "Erreur",
                  "Accès non autorisé.",
                  "error",
                );
                window.location.href = "/";
                localStorage.removeItem("token");
                store.dispatch(logOut());
              }
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
