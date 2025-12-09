import { UserRepository } from "../repositories/implementaion/user/user.repositery.ts";
import { AdminRepository } from "../repositories/implementaion/admin/admin.repository.ts";
import { PhotographerRepository } from "../repositories/implementaion/photographer/PhotographerRespository.ts";
import { AuthService } from "../services/user/auth/auth.servise.ts";
import { AdminServices } from "../services/admin/implementaion/admin.service.ts";
import { NodeMailerService } from "../services/user/email/nodemailer.service.ts";
import { OtpService } from "../services/user/otp/otp.service.ts";
import { TokenBlacklistService } from "../services/token/tokenBalcklist.service.ts";
import { UserService } from "../services/user/user.service/user.service.ts";
import { PhotographerService } from "../services/photographer/photograher.service.ts";
import { AdminPhotographerService } from "../services/admin/AdminPhotographerService.ts";
import { S3FileService } from "../services/external/S3FileService.ts";
import { AuthController } from "../controller/auth.controller.ts";
import { AdminController } from "../controller/adminUser.controller.ts";
import { UserController } from "../controller/user.controller.ts";
import { PhotographerController } from "../controller/photographer.controller.ts";
import { AdminPhotographerController } from "../controller/adminPhotographer.controller.ts";

class DIContainer {
    // Repositories (Singleton)
    private _userRepository?: UserRepository;
    private _adminRepository?: AdminRepository;
    private _photographerRepository?: PhotographerRepository;

    // Services (Singleton)
    private _emailService?: NodeMailerService;
    private _otpService?: OtpService;
    private _tokenBlacklistService?: TokenBlacklistService;
    private _fileService?: S3FileService;
    private _authService?: AuthService;
    private _adminService?: AdminServices;
    private _userService?: UserService;
    private _photographerService?: PhotographerService;
    private _adminPhotographerService?: AdminPhotographerService;

    // Controllers (Singleton)
    private _authController?: AuthController;
    private _adminController?: AdminController;
    private _userController?: UserController;
    private _photographerController?: PhotographerController;
    private _adminPhotographerController?: AdminPhotographerController;

    // Repositories
    get userRepository(): UserRepository {
        if (!this._userRepository) {
            this._userRepository = new UserRepository();
        }
        return this._userRepository;
    }

    get adminRepository(): AdminRepository {
        if (!this._adminRepository) {
            this._adminRepository = new AdminRepository();
        }
        return this._adminRepository;
    }

    get photographerRepository(): PhotographerRepository {
        if (!this._photographerRepository) {
            this._photographerRepository = new PhotographerRepository();
        }
        return this._photographerRepository;
    }

    // Services
    get emailService(): NodeMailerService {
        if (!this._emailService) {
            this._emailService = new NodeMailerService();
        }
        return this._emailService;
    }

    get otpService(): OtpService {
        if (!this._otpService) {
            this._otpService = new OtpService();
        }
        return this._otpService;
    }

    get tokenBlacklistService(): TokenBlacklistService {
        if (!this._tokenBlacklistService) {
            this._tokenBlacklistService = new TokenBlacklistService();
        }
        return this._tokenBlacklistService;
    }

    get fileService(): S3FileService {
        if (!this._fileService) {
            this._fileService = new S3FileService();
        }
        return this._fileService;
    }

    get authService(): AuthService {
        if (!this._authService) {
            this._authService = new AuthService(
                this.userRepository,
                this.emailService,
                this.otpService
            );
        }
        return this._authService;
    }

    get adminService(): AdminServices {
        if (!this._adminService) {
            this._adminService = new AdminServices(this.adminRepository);
        }
        return this._adminService;
    }

    get userService(): UserService {
        if (!this._userService) {
            this._userService = new UserService(this.userRepository, this.photographerRepository);
        }
        return this._userService;
    }

    get photographerService(): PhotographerService {
        if (!this._photographerService) {
            this._photographerService = new PhotographerService(
                this.photographerRepository
            );
        }
        return this._photographerService;
    }

    get adminPhotographerService(): AdminPhotographerService {
        if (!this._adminPhotographerService) {
            this._adminPhotographerService = new AdminPhotographerService(
                this.photographerRepository,
                this.userRepository,
                this.emailService
            );
        }
        return this._adminPhotographerService;
    }

    // Controllers
    get authController(): AuthController {
        if (!this._authController) {
            this._authController = new AuthController(this.authService);
        }
        return this._authController;
    }

    get adminController(): AdminController {
        if (!this._adminController) {
            this._adminController = new AdminController(this.adminService);
        }
        return this._adminController;
    }


    get userController(): UserController {
        if (!this._userController) {
            this._userController = new UserController(this.userService);
        }
        return this._userController;
    }

    get photogrpherController(): PhotographerController {
        if (!this._photographerController) {
            this._photographerController = new PhotographerController(this.photographerService,this.fileService);
        }
        return this._photographerController;
    }

    get adminPhotographerController(): AdminPhotographerController {
        if (!this._adminPhotographerController) {
            this._adminPhotographerController = new AdminPhotographerController(this.adminPhotographerService);
        }
        return this._adminPhotographerController;
    }
}


export const container = new DIContainer();
