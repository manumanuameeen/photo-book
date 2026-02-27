import { Types, Document } from "mongoose";

export type Populated<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: T[P] extends Types.ObjectId | undefined ? Document : T[P];
};

export type SortOrder = 1 | -1 | "asc" | "desc" | "ascending" | "descending";

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
