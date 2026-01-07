
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
import { PackageRepository } from "../repositories/implementaion/PackageRepository.ts";
import { AvailabilityRepository } from "../repositories/implementaion/AvailabilityRepository.ts";
import { PackageService } from "../services/photographer/package.service.ts";
import { AvailabilityService } from "../services/photographer/availability.service.ts";
import { PackageAvailabilityController } from "../controller/packageAvailability.controller.ts";
import { PortfolioRepository } from "../repositories/implementaion/PortfolioRepository.ts";
import { PortfolioService } from "../services/photographer/PortfolioService.ts";
import { PortfolioController } from "../controller/portfolio.controller.ts";
import { IPortfolioController } from "../controller/interface/IPortfolioController.ts";

import { CategoryRepository } from "../repositories/implementaion/CategoryRepository.ts";
import { MessageRepository } from "../repositories/implementaion/MessageRepository.ts";
import { CategoryService } from "../services/common/CategoryService.ts";
import { MessageService } from "../services/messaging/MessageService.ts";
import { CategoryController } from "../controller/CategoryController.ts";
import { ICategoryController } from "../controller/interface/ICategoryController.ts";

import { BookingRepository } from "../repositories/implementaion/booking/BookingRepository.ts";
import { BookingService } from "../services/implementaion/BookingService.ts";
import { BookingController } from "../controller/BookingController.ts";
import { IBookingController } from "../controller/interface/IBookingController.ts";
import { MessageController, IMessageController } from "../controller/MessageController.ts";

import { WalletRepository } from "../repositories/implementaion/wallet/WalletRepository.ts";
import { WalletService } from "../services/implementaion/WalletService.ts";
import { BookingQueueService } from "../services/common/BookingQueueService.ts";
import { StripeService } from "../services/implementaion/StripeService.ts";
import { WalletController } from "../controller/WalletController.ts";
import { PaymentController } from "../controller/PaymentController.ts";

class DIContainer {
    // repositories (singleton)
    private _userRepository?: UserRepository;
    private _adminRepository?: AdminRepository;
    private _photographerRepository?: PhotographerRepository;
    private _packageRepository?: PackageRepository;
    private _availabilityRepository?: AvailabilityRepository;
    private _portfolioRepository?: PortfolioRepository;
    private _categoryRepository?: CategoryRepository;
    private _messageRepository?: MessageRepository;
    private _bookingRepository?: BookingRepository;
    private _walletRepository?: WalletRepository;

    // services (singleton)
    private _emailService?: NodeMailerService;
    private _otpService?: OtpService;
    private _tokenBlacklistService?: TokenBlacklistService;
    private _fileService?: S3FileService;
    private _authService?: AuthService;
    private _adminService?: AdminServices;
    private _userService?: UserService;
    private _photographerService?: PhotographerService;
    private _adminPhotographerService?: AdminPhotographerService;
    private _packageService?: PackageService;
    private _availabilityService?: AvailabilityService;
    private _portfolioService?: PortfolioService;
    private _categoryService?: CategoryService;
    private _messageService?: MessageService;
    private _bookingService?: BookingService;
    private _walletService?: WalletService;
    private _bookingQueueService?: BookingQueueService;
    private _stripeService?: StripeService;

    // controllers (singleton)
    private _authController?: AuthController;
    private _adminController?: AdminController;
    private _userController?: UserController;
    private _photographerController?: PhotographerController;
    private _adminPhotographerController?: AdminPhotographerController;
    private _packageAvailabilityController?: PackageAvailabilityController;
    private _portfolioController?: IPortfolioController;
    private _categoryController?: ICategoryController;
    private _bookingController?: IBookingController;
    private _messageController?: IMessageController;
    private _walletController?: WalletController;
    private _paymentController?: PaymentController;

    // ...

    get bookingQueueService(): BookingQueueService {
        if (!this._bookingQueueService) {
            this._bookingQueueService = new BookingQueueService();
        }
        return this._bookingQueueService;
    }

    // controllers (singleton)


    // repositories
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

    get packageRepository(): PackageRepository {
        if (!this._packageRepository) {
            this._packageRepository = new PackageRepository();
        }
        return this._packageRepository;
    }

    get availabilityRepository(): AvailabilityRepository {
        if (!this._availabilityRepository) {
            this._availabilityRepository = new AvailabilityRepository();
        }
        return this._availabilityRepository;
    }

    get portfolioRepository(): PortfolioRepository {
        if (!this._portfolioRepository) {
            this._portfolioRepository = new PortfolioRepository();
        }
        return this._portfolioRepository;
    }

    get categoryRepository(): CategoryRepository {
        if (!this._categoryRepository) {
            this._categoryRepository = new CategoryRepository();
        }
        return this._categoryRepository;
    }

    get messageRepository(): MessageRepository {
        if (!this._messageRepository) {
            this._messageRepository = new MessageRepository();
        }
        return this._messageRepository;
    }

    get bookingRepository(): BookingRepository {
        if (!this._bookingRepository) {
            this._bookingRepository = new BookingRepository();
        }
        return this._bookingRepository;
    }

    get walletRepository(): WalletRepository {
        if (!this._walletRepository) {
            this._walletRepository = new WalletRepository();
        }
        return this._walletRepository;
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
                this.otpService,
                this.walletService
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
                this.photographerRepository,
                this.messageService
            );
        }
        return this._photographerService;
    }

    get adminPhotographerService(): AdminPhotographerService {
        if (!this._adminPhotographerService) {
            this._adminPhotographerService = new AdminPhotographerService(
                this.photographerRepository,
                this.userRepository,
                this.emailService,
                this.messageService
            );
        }
        return this._adminPhotographerService;
    }

    get packageService(): PackageService {
        if (!this._packageService) {
            this._packageService = new PackageService(this.packageRepository);
        }
        return this._packageService;
    }

    get availabilityService(): AvailabilityService {
        if (!this._availabilityService) {
            this._availabilityService = new AvailabilityService(this.availabilityRepository);
        }
        return this._availabilityService;
    }

    get portfolioService(): PortfolioService {
        if (!this._portfolioService) {
            this._portfolioService = new PortfolioService(this.portfolioRepository);
        }
        return this._portfolioService;
    }

    get categoryService(): CategoryService {
        if (!this._categoryService) {
            this._categoryService = new CategoryService(this.categoryRepository, this.messageService);
        }
        return this._categoryService;
    }

    get messageService(): MessageService {
        if (!this._messageService) {
            this._messageService = new MessageService(this.messageRepository);
        }
        return this._messageService;
    }

    get walletService(): WalletService {
        if (!this._walletService) {
            this._walletService = new WalletService(this.walletRepository);
        }
        return this._walletService;
    }

    get bookingService(): BookingService {
        if (!this._bookingService) {
            this._bookingService = new BookingService(
                this.bookingRepository,
                this.walletService,
                this.bookingQueueService,
                this.emailService,
                this.messageService,
                this.availabilityService
            );
        }
        return this._bookingService;
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

    get photographerController(): PhotographerController {
        if (!this._photographerController) {
            this._photographerController = new PhotographerController(this.photographerService, this.fileService);
        }
        return this._photographerController;
    }

    get adminPhotographerController(): AdminPhotographerController {
        if (!this._adminPhotographerController) {
            this._adminPhotographerController = new AdminPhotographerController(this.adminPhotographerService);
        }
        return this._adminPhotographerController;
    }

    get packageAvailabilityController(): PackageAvailabilityController {
        if (!this._packageAvailabilityController) {
            this._packageAvailabilityController = new PackageAvailabilityController(
                this.packageService,
                this.availabilityService,
                this.fileService
            );
        }
        return this._packageAvailabilityController;
    }

    get portfolioController(): IPortfolioController {
        if (!this._portfolioController) {
            this._portfolioController = new PortfolioController(this.portfolioService, this.fileService);
        }
        return this._portfolioController;
    }

    get categoryController(): ICategoryController {
        if (!this._categoryController) {
            this._categoryController = new CategoryController(this.categoryService);
        }
        return this._categoryController;
    }

    get bookingController(): IBookingController {
        if (!this._bookingController) {
            this._bookingController = new BookingController(this.bookingService);
        }
        return this._bookingController;
    }

    get messageController(): IMessageController {
        if (!this._messageController) {
            this._messageController = new MessageController(this.messageService);
        }
        return this._messageController;
    }

    get stripeService(): StripeService {
        if (!this._stripeService) {
            this._stripeService = new StripeService();
        }
        return this._stripeService;
    }

    get walletController(): WalletController {
        if (!this._walletController) {
            this._walletController = new WalletController(this.walletService);
        }
        return this._walletController;
    }

    get paymentController(): PaymentController {
        if (!this._paymentController) {
            this._paymentController = new PaymentController(); // PaymentController internally instantiates services currently? checking...
        }
        return this._paymentController;
    }
}


export const container = new DIContainer();
