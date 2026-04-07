// import axios from "axios";

// const BASE_URL =
//   import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// const api = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true,
// });

// // 🔐 Attach access token automatically
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("accessToken");

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// // 🔄 Auto refresh on 401
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry
//     ) {
//       originalRequest._retry = true;

//       try {
//         const res = await api.post("/auth/refresh");

//         const newAccessToken = res.data.accessToken;

//         localStorage.setItem("accessToken", newAccessToken);

//         originalRequest.headers.Authorization =
//           `Bearer ${newAccessToken}`;

//         return api(originalRequest);

//       } catch (err) {
//         console.error("Refresh failed:", err);

//         localStorage.removeItem("accessToken");
//         window.location.href = "/";
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;
// <------------------------------------------------------------------------------------------------>
import axios from "axios";
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/**
 * Manages all API client interactions, encapsulating token management,
 * request authentication, and automatic session refreshing logic.
 */
export class ApiClient {
    private readonly axiosInstance: AxiosInstance;
    // Using 'this' to manage the state of the initialized HTTP client.
    private static baseUrl: string = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

    /**
     * Initializes the API Client and sets up interceptors for authentication flows.
     */
    constructor() {
        this.axiosInstance = axios.create({
            baseURL: ApiClient.baseUrl,
            withCredentials: true,
        });

        // Phase 1: Request Interceptor (Attach Token)
        this.setupRequestInterceptor();

        // Phase 2: Response Interceptor (Handle Refresh)
        this.setupResponseInterceptor();
    }

    /**
     * Attaches the stored access token to every outgoing request header.
     */
    private setupRequestInterceptor(): void {
        this.axiosInstance.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem("accessToken");
                if (token) {
                    const headers = config.headers as Record<string, string>;
                    headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );
    }

    /**
     * Sets up the response interceptor to detect 401 Unauthorized errors and
     * automatically attempt a token refresh cycle.
     */
    private setupResponseInterceptor(): void {
        this.axiosInstance.interceptors.response.use(
            (response) => response, // Successful response passes through.
            async (error: AxiosError) => {
                const originalRequest = error.config as RetryableRequestConfig | undefined;

                // Condition 1: Must be a 401 AND we must not have already attempted refresh for this request.
                if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
                    
                    // Mark the request attempt to prevent infinite loop retries.
                    originalRequest._retry = true;

                    try {
                        // Attempt to refresh the token using a separate API call.
                        const res = await this._refreshAccessToken();
                        const newAccessToken = res.data?.accessToken;

                        if (!newAccessToken) {
                            throw new Error("Failed to retrieve new access token.");
                        }

                        // State Management: Update local storage immediately.
                        localStorage.setItem("accessToken", newAccessToken);

                        // Modify the original request headers with the fresh token.
                        const headers = originalRequest.headers as Record<string, string>;
                        headers.Authorization = `Bearer ${newAccessToken}`;

                        // Retry the original failed request automatically.
                        return this.axiosInstance(originalRequest);

                    } catch (err) {
                        console.error("Session refresh failure detected.", err);

                        // Critical Failure Path: Token is stale, or refresh endpoint failed. Log out user.
                        localStorage.removeItem("accessToken");
                        window.location.href = "/"; // Force redirect to login page.
                        return Promise.reject(err);
                    }
                }

                // For all other errors (403, 500, or already-retried 401s), reject the promise normally.
                return Promise.reject(error);
            }
        );
    }

    /**
     * Private helper method to execute the token refresh logic and handle its potential failure.
     */
    private async _refreshAccessToken() {
        const response = await this.axiosInstance.post("/auth/refresh");
        return response;
    }

    /**
     * Public accessor for the underlying axios instance, allowing modular service usage.
     * @returns The configured Axios instance.
     */
    public get client(): AxiosInstance {
        return this.axiosInstance;
    }
}

// Usage: Instead of exporting 'api', export and instantiate the class.
const apiService = new ApiClient();
export default apiService.client; 
