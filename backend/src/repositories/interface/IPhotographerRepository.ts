import type { IPhotographer } from "../../model/photographerModel";

export interface IPhotographerQuery {
  page: number;
  limit: number;
  search?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "ALL";
  isBlocked?: "true" | "false" | "all";
}

export interface IPaginatedPhotographers {
  photographers: IPhotographer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IPhotographerStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  blocked: number;
}

export interface IPhotographerRepository {
  // Base methods from BaseRepository
  create(data: Partial<IPhotographer>): Promise<IPhotographer>;
  findById(id: string): Promise<IPhotographer | null>;
  findOne(query: Partial<IPhotographer>): Promise<IPhotographer | null>;
  update(id: string, data: Partial<IPhotographer>): Promise<IPhotographer | null>;

  // Custom methods
  findByUserId(userId: string): Promise<IPhotographer | null>;
  findAllWithPagination(query: IPhotographerQuery): Promise<IPaginatedPhotographers>;
  blockById(id: string): Promise<IPhotographer | null>;
  unblockById(id: string): Promise<IPhotographer | null>;
  approveById(id: string): Promise<IPhotographer | null>;
  rejectById(id: string, reason: string): Promise<IPhotographer | null>;
  getStatistics(): Promise<IPhotographerStats>;
}