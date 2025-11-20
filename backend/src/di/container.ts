import { UserRepository } from "../repositories/implementaion/user/user.repositery.ts";
import { AdminRepository } from "../repositories/implementaion/admin/admin.repository.ts";
import { AuthService } from "../services/user/auth/auth.servise.ts";
import { AdminServices } from "../services/admin/implementaion/admin.service.ts";
import { NodeMailerService } from "../services/user/email/nodemailer.service.ts";
import { Otpservice } from "../services/user/otp/otp.service.ts";
import { TokenBlacklistService } from "../services/token/tokenBalcklist.service.ts";
import { AuthController } from "../controller/auth.controller.ts";
import { AdminController } from "../controller/adminUser.controller.ts";


class DIContainer {
  // Repositories (Singleton)
  private _userRepository?: UserRepository;
  private _adminRepository?: AdminRepository;

  // Services (Singleton)
  private _emailService?: NodeMailerService;
  private _otpService?: Otpservice;

  private _tokenBlacklistService?: TokenBlacklistService;
  private _authService?: AuthService;
  private _adminService?: AdminServices;

  // Controllers (Singleton)
  private _authController?: AuthController;
  private _adminController?: AdminController;

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

  // Services
  get emailService(): NodeMailerService {
    if (!this._emailService) {
      this._emailService = new NodeMailerService();
    }
    return this._emailService;
  }

  get otpService(): Otpservice {
    if (!this._otpService) {
      this._otpService = new Otpservice();
    }
    return this._otpService;
  }

 

  get tokenBlacklistService(): TokenBlacklistService {
    if (!this._tokenBlacklistService) {
      this._tokenBlacklistService = new TokenBlacklistService();
    }
    return this._tokenBlacklistService;
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
}

export const container = new DIContainer();