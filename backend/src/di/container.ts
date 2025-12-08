import { UserRepository } from "../repositories/implementaion/user/user.repositery.ts";
import { AdminRepository } from "../repositories/implementaion/admin/admin.repository.ts";
import { AuthService } from "../services/user/auth/auth.servise.ts";
import { AdminServices } from "../services/admin/implementaion/admin.service.ts";
import { NodeMailerService } from "../services/user/email/nodemailer.service.ts";
import { Otpservice } from "../services/user/otp/otp.service.ts";
import { TokenBlacklistService } from "../services/token/tokenBalcklist.service.ts";
import { AuthController } from "../controller/auth.controller.ts";
import { AdminController } from "../controller/adminUser.controller.ts";
import { UserService } from "../services/user/user.service/user.service.ts";
import { UserController } from "../controller/user.controller.ts";
import { PhotographerController } from "../controller/photographer.controller.ts";
import { PhotographerService } from "../services/photographer/photograher.service.ts";
import { PhotographerRepository } from "../repositories/implementaion/photographer/PhotographerRespository.ts";
import { CloudinaryService } from "../services/external/CloudinaryService.ts";
import { S3FileService } from "../services/external/S3FileService.ts";
import { AdminPhotographerService } from "../services/admin/AdminPhotographerService.ts";
import { AdminPhotographerController } from "../controller/AdminPhotographerController.ts";

class DIContainer {
  //repository
  private _userRepository?: UserRepository;
  private _adminRepository?: AdminRepository;
  private _photographerRespositoy?: PhotographerRepository;

  //services
  private _emailService?: NodeMailerService;
  private _otpService?: Otpservice;
  private _tokenBlacklistService?: TokenBlacklistService;
  private _authService?: AuthService;
  private _adminService?: AdminServices;
  private _userService?: UserService;
  private _PhotographerService?: PhotographerService;
  private _fileService?: S3FileService;
  private _adminPhotographerService?: AdminPhotographerService;


  //controller
  private _authController?: AuthController;
  private _adminController?: AdminController;
  private _userController?: UserController;
  private _photographerController?: PhotographerController;
  private _adminPhotographerController?: AdminPhotographerController;

  get userRepository(): UserRepository {
    this._userRepository ??= new UserRepository();
    return this._userRepository;
  }

  get adminRepository(): AdminRepository {
    this._adminRepository ??= new AdminRepository();
    return this._adminRepository;
  }

  get photographerRepository(): PhotographerRepository {
    this._photographerRespositoy ??= new PhotographerRepository();
    return this._photographerRespositoy;
  }

  get emailService(): NodeMailerService {
    this._emailService ??= new NodeMailerService();
    return this._emailService;
  }

  get otpService(): Otpservice {
    this._otpService ??= new Otpservice();
    return this._otpService;
  }

  get tokenBlacklistService(): TokenBlacklistService {
    this._tokenBlacklistService ??= new TokenBlacklistService();
    return this._tokenBlacklistService;
  }

  get authService(): AuthService {
    this._authService ??= new AuthService(this.userRepository, this.emailService, this.otpService);
    return this._authService;
  }

  get adminService(): AdminServices {
    this._adminService ??= new AdminServices(this.adminRepository);
    return this._adminService;
  }

  get userService(): UserService {
    this._userService ??= new UserService(this.userRepository, this.photographerRepository);
    return this._userService;
  }

  get photographerService(): PhotographerService {
    this._PhotographerService ??= new PhotographerService(this.photographerRepository);
    return this._PhotographerService;
  }

  get fileSevice(): S3FileService {
    this._fileService ??= new S3FileService();
    return this._fileService;
  }

  get authController(): AuthController {
    this._authController ??= new AuthController(this.authService);
    return this._authController;
  }

  get adminController(): AdminController {
    this._adminController ??= new AdminController(this.adminService);
    return this._adminController;
  }

  get userController(): UserController {
    this._userController ??= new UserController(this.userService);
    return this._userController;
  }

  get photogrpherController(): PhotographerController {
    this._photographerController ??= new PhotographerController(
      this.photographerService,
      this.fileSevice,
    );
    return this._photographerController;
  }

  get adminPhotographerService(): AdminPhotographerService {
    this._adminPhotographerService ??= new AdminPhotographerService(
      this.photographerRepository,
      this.userRepository,
      this.emailService
    );
    return this._adminPhotographerService;
  }

  get adminPhotographerController(): AdminPhotographerController {
    this._adminPhotographerController ??= new AdminPhotographerController(
      this.adminPhotographerService
    );
    return this._adminPhotographerController;
  }
}

export const container = new DIContainer();
