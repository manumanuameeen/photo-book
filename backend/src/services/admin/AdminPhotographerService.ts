import {
    IAdminPhotographerService,
    IGetPhotographersQuery,
    IPaginatedPhotographersResponse,
    IPhotographerResponse
} from "./interface/IAdminPhotographerService";
import { IPhotographerRepository } from "../../repositories/interface/IPhotographerRepository";
import { IUserRepository } from "../../repositories/interface/IUserRespository";
import { IEmailService } from "../user/email/IEmailServise";
import { AdminPhotographerMapper } from "../../mappers/adminPhotographerMapper";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../constants/httpStatus";
import { Messages } from "../../constants/messages";

export class AdminPhotographerService implements IAdminPhotographerService {
    constructor(
        private readonly _photographerRepo: IPhotographerRepository,
        private readonly _userRepo: IUserRepository,
        private readonly _emailService: IEmailService
    ) { }

    async getPhotographers(query: IGetPhotographersQuery): Promise<IPaginatedPhotographersResponse> {
        const page = parseInt(query.page || "1");
        const limit = parseInt(query.limit || "10");

        const result = await this._photographerRepo.findAllWithPagination({
            page,
            limit,
            search: query.search,
            status: query.status,
            isBlocked: query.isBlocked
        });

        return {
            photographers: AdminPhotographerMapper.toResponseArray(result.photographers),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
            approvedCount: result.approvedCount,
            pendingCount:result.pendingCount,
            rejectedCount:result.rejectedCount
        };
    }

    async getPhotographerById(id: string): Promise<IPhotographerResponse> {
        const photographer = await this._photographerRepo.findById(id);
        if (!photographer) {
            throw new AppError(Messages.PHOTOGRAPHER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        return AdminPhotographerMapper.toResponse(photographer);
    }

    async blockPhotographer(photographerId: string, reason?: string): Promise<void> {
        const photographer = await this._photographerRepo.blockById(photographerId);
        if (!photographer) {
            throw new AppError(Messages.PHOTOGRAPHER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
    }

    async unblockPhotographer(photographerId: string): Promise<void> {
        const photographer = await this._photographerRepo.unblockById(photographerId);
        if (!photographer) {
            throw new AppError(Messages.PHOTOGRAPHER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
    }

    async getApplications(query: IGetPhotographersQuery): Promise<IPaginatedPhotographersResponse> {
        return await this.getPhotographers({ ...query, status: query.status || "PENDING" });
    }

    async getApplicationById(id: string): Promise<IPhotographerResponse> {
        return await this.getPhotographerById(id);
    }

    async approveApplication(id: string, message: string): Promise<void> {
        const photographer = await this._photographerRepo.approveById(id);
        if (!photographer) {
            throw new AppError(Messages.APPLICATION_NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        // Update user role to photographer
        await this._userRepo.update(photographer.userId.toString(), { role: "photographer" });

        // Send approval email
        await this._emailService.sendApprovalEmail(
            photographer.personalInfo.email,
            photographer.personalInfo.name,
            message
        );
    }

    async rejectApplication(id: string, reason: string): Promise<void> {
        const photographer = await this._photographerRepo.rejectById(id, reason);
        if (!photographer) {
            throw new AppError(Messages.APPLICATION_NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        // Send rejection email
        await this._emailService.sendRejectionEmail(
            photographer.personalInfo.email,
            photographer.personalInfo.name,
            reason
        );
    }

    async getStatistics() {
        return await this._photographerRepo.getStatistics();
    }
}
