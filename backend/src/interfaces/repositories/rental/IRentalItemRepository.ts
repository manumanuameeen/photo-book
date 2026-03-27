import { IRentalItem } from "../../../models/rentalItem.model";
import { IBaseRepository } from "../IBaseRepository";

export interface IRentalItemRepository extends IBaseRepository<IRentalItem> {
  createItem(data: Partial<IRentalItem>): Promise<IRentalItem>;
  getItems(
    filter: Record<string, unknown>,
    page: number,
    limit: number,
  ): Promise<{ items: IRentalItem[]; total: number }>;
  getItemById(id: string): Promise<IRentalItem | null>;
  updateItem(id: string, data: Partial<IRentalItem>): Promise<IRentalItem | null>;
  deleteItem(id: string): Promise<boolean>;
  getUserListings(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ items: IRentalItem[]; total: number }>;
  updateItemStatus(id: string, status: string): Promise<IRentalItem | null>;
  toggleLike(id: string, userId: string): Promise<IRentalItem | null>;
}
