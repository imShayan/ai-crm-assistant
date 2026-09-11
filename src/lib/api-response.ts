export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export async function readApiResponse<T>(
  response: Response,
): Promise<T> {
  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !result.success) {
    const message = result.success
      ? "Request failed"
      : result.error.message;
    throw new Error(message);
  }

  return result.data;
}
