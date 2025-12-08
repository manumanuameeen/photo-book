import { ApplyPhtographerDtoType, PhotographerResponseDto } from "../../dto/photographer.dto";

export interface IPhotographerService {
    apply(userId: string, data: ApplyPhtographerDtoType): Promise<PhotographerResponseDto>;
}
