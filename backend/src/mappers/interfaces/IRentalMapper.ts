import type { CreateRentalItemDTO, UpdateRentalItemDTO } from "../../dto/rental.dto.ts";
import type { IRentalItem } from "../../model/rentalItemModel.ts";
import type { IMapper } from "./IMapper.ts";
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
