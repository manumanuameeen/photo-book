import type { CreateRentalItemDTO, UpdateRentalItemDTO } from "../../dto/rental.dto";
import type { IRentalItem } from "../../models/rentalItem.model";
import type { IMapper } from "./IMapper";
export interface IRentalItemResponseDto {
  id: string;
  name: string;
  description: string;
  category: string;
  pricePerDay: number;
  securityDeposit: number;
  minRentalPeriod: number;
  location: string;
  features: string[];
  images: string[];
  status: string;
  ownerId: string;
  createdAt: Date;
}
export interface IRentalItemMapper
  extends IMapper<CreateRentalItemDTO, IRentalItem, IRentalItemResponseDto> {
  fromUpdateDto(dto: UpdateRentalItemDTO): Partial<IRentalItem>;
  toResponseArray(items: IRentalItem[]): IRentalItemResponseDto[];
}
