import { AxiosError } from "axios";

interface ErrorResponse {
  message?: string;
  error?: string;
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ErrorResponse | undefined;
    return data?.message || data?.error || "An error occurred";
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return "An unexpected error occurred";
};

export type ApiError = AxiosError<ErrorResponse>;