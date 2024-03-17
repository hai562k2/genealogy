export type PaginationType<T> = Readonly<{
  items: T[];
  page: number;
  limit: number;
  total: number;
}>;
