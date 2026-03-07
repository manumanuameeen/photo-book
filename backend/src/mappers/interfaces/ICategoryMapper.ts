import type { CreateCategoryDto, UpdateCategoryDto } from "../../dto/category.dto.ts";
import type { ICategory } from "../../model/categoryModel.ts";
import type { IMapper } from "./IMapper.ts";
export interface ICategoryResponseDto {
  id: string;
  name: string;
  type: string;
  description: string;
  isBlocked: boolean;
  createdAt: Date;
}
export interface ICategoryMapper
  extends IMapper<CreateCategoryDto, ICategory, ICategoryResponseDto> {
  fromUpdateDto(dto: UpdateCategoryDto): Partial<ICategory>;
  fromSuggestionDto(dto: unknown): {
    isSuggested: boolean;
    suggestionStatus: string;
  };
}
