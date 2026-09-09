export type DatabaseResult<T> = {
  data: T | null;
  error: Error | null;
};
