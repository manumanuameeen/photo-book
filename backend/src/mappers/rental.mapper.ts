import mongoose from "mongoose";
import type { CreateRentalItemDTO, UpdateRentalItemDTO } from "../dto/rental.dto";
import type { IRentalItem } from "../models/rentalItem.model";
import type { IRentalItemMapper, IRentalItemResponseDto } from "./interfaces/IRentalMapper";
export class RentalItemMapper implements IRentalItemMapper {
  fromDto(dto: CreateRentalItemDTO): Partial<IRentalItem> {
    return {
      name: dto.name,
      description: dto.description,
      category: dto.category,
      condition: dto.condition,
      pricePerDay: dto.pricePerDay,
      securityDeposit: dto.securityDeposit,
      minRentalPeriod: dto.minRentalPeriod,
      maxRentalPeriod: dto.maxRentalPeriod,
      stock: dto.stock || 1,
      quantity: dto.stock || 1,
      images: dto.images || [],
      status: "AVAILABLE",
      ownerId: dto.ownerId ? new mongoose.Types.ObjectId(dto.ownerId) : undefined,
    };
  }
  toResponse(item: IRentalItem): IRentalItemResponseDto {
    return {
      id: item._id?.toString() || "",
      name: item.name,
      description: item.description,
      category: item.category,
      condition: item.condition,
      pricePerDay: item.pricePerDay,
      securityDeposit: item.securityDeposit,
      minRentalPeriod: item.minRentalPeriod,
      maxRentalPeriod: item.maxRentalPeriod,
      stock: item.stock,
      images: item.images || [],
      status: item.status,
      ownerId: item.ownerId?.toString() || "",
      createdAt: item.createdAt || new Date(),
    };
    
  }
  fromUpdateDto(dto: UpdateRentalItemDTO): Partial<IRentalItem> {
    const updateData: Partial<IRentalItem> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.condition !== undefined) updateData.condition = dto.condition;
    if (dto.pricePerDay !== undefined) updateData.pricePerDay = dto.pricePerDay;
    if (dto.securityDeposit !== undefined) updateData.securityDeposit = dto.securityDeposit;
    if (dto.minRentalPeriod !== undefined) updateData.minRentalPeriod = dto.minRentalPeriod;
    if (dto.maxRentalPeriod !== undefined) updateData.maxRentalPeriod = dto.maxRentalPeriod;
    if (dto.stock !== undefined) {
      updateData.stock = dto.stock;
      updateData.quantity = dto.stock;
    }

    if (dto.images !== undefined) updateData.images = dto.images;
    return updateData;
  }
  toResponseArray(items: IRentalItem[]): IRentalItemResponseDto[] {
    return items.map((item: IRentalItem) => this.toResponse(item));
  }
}
