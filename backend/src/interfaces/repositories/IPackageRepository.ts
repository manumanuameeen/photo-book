import { IBookingPackage } from "../../model/bookingPackageModel.ts";
import { IBaseRepository } from "./IBaseRepository.ts";

export interface IPackageRepository extends IBaseRepository<IBookingPackage> {
  create(data: Partial<IBookingPackage>): Promise<IBookingPackage>;
  findById(id: string): Promise<IBookingPackage | null>;
  findOne(query: Partial<IBookingPackage>): Promise<IBookingPackage | null>;
  update(id: string, data: Partial<IBookingPackage>): Promise<IBookingPackage | null>;
  findByPhotographerId(
    photographerId: string,
    page?: number,
    limit?: number,
  ): Promise<{ packages: IBookingPackage[]; total: number }>;
  toggleLike(id: string, userId: string): Promise<IBookingPackage | null>;
}
