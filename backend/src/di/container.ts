import { UserRepository } from "../repositories/implementaion/user/user.repository.ts";
import { AdminRepository } from "../repositories/implementaion/admin/admin.repository.ts";
import { PhotographerRepository } from "../repositories/implementaion/photographer/PhotographerRepository.ts";
import { AuthService } from "../services/user/auth/auth.service.ts";
import { AdminServices } from "../services/admin/implementaion/admin.service.ts";
import { NodeMailerService } from "../services/user/email/nodemailer.service.ts";
import { OtpService } from "../services/user/otp/otp.service.ts";
import { TokenBlacklistService } from "../services/token/tokenBalcklist.service.ts";
import { UserService } from "../services/user/user.service/user.service.ts";
import { PhotographerService } from "../services/photographer/photograher.service.ts";
import { AdminPhotographerService } from "../services/admin/AdminPhotographerService.ts";
import { S3FileService } from "../services/external/S3FileService.ts";
import { AuthController } from "../controller/auth.controller.ts";
import { AdminController } from "../controller/admin/adminUser.controller.ts";
import { UserController } from "../controller/user.controller.ts";
import { PhotographerController } from "../controller/photographer.controller.ts";

import { AdminPhotographerController } from "../controller/admin/adminPhotographer.controller.ts";
import { PackageRepository } from "../repositories/implementaion/PackageRepository.ts";
import { AvailabilityRepository } from "../repositories/implementaion/AvailabilityRepository.ts";
import { PackageService } from "../services/photographer/package.service.ts";
import { AvailabilityService } from "../services/photographer/availability.service.ts";
import { PackageAvailabilityController } from "../controller/packageAvailability.controller.ts";
import { PortfolioRepository } from "../repositories/implementaion/PortfolioRepository.ts";
import { PortfolioService } from "../services/photographer/PortfolioService.ts";
import { PortfolioController } from "../controller/portfolio.controller.ts";
import { IPortfolioController } from "../interfaces/controllers/IPortfolioController.ts";
import { CategoryRepository } from "../repositories/implementaion/CategoryRepository.ts";
import { MessageRepository } from "../repositories/implementaion/MessageRepository.ts";
import { CategoryService } from "../services/common/CategoryService.ts";
import { MessageService } from "../services/messaging/MessageService.ts";
import { CategoryController } from "../controller/CategoryController.ts";
import { ICategoryController } from "../interfaces/controllers/ICategoryController.ts";
import { BookingRepository } from "../repositories/implementaion/booking/BookingRepository.ts";
import { BookingService } from "../services/implementaion/BookingService.ts";
import { BookingController } from "../controller/BookingController.ts";
import { IBookingController } from "../interfaces/controllers/IBookingController.ts";
import { MessageController } from "../controller/MessageController.ts";
import { IMessageController } from "../interfaces/controllers/IMessageController.ts";
import { WalletRepository } from "../repositories/implementaion/wallet/WalletRepository.ts";
import { WalletService } from "../services/implementaion/WalletService.ts";
import { BookingQueueService } from "../services/common/BookingQueueService.ts";
import { StripeService } from "../services/implementaion/StripeService.ts";
import { WalletController } from "../controller/WalletController.ts";
import { PaymentController } from "../controller/PaymentController.ts";
import { PaymentService } from "../services/implementaion/PaymentService.ts";
import { RentalRepository } from "../repositories/implementaion/rental/RentalRepository.ts";
import { PdfService } from "../services/implementaion/PdfService.ts";
import { BookingPaymentService } from "../services/booking/BookingPaymentService.ts";

import { RentalItemRepository } from "../repositories/rental/RentalItemRepository.ts";
import { RentalOrderRepository } from "../repositories/rental/RentalOrderRepository.ts";
import { RentalItemService } from "../services/rental/RentalItemService.ts";
import { RentalOrderService } from "../services/rental/RentalOrderService.ts";
import { RentalPaymentService } from "../services/rental/RentalPaymentService.ts";
import { RentalAvailabilityService } from "../services/rental/RentalAvailabilityService.ts";
import { RentalFinanceService } from "../services/rental/RentalFinanceService.ts";
import { RentalService } from "../services/implementaion/RentalService.ts";
import { AdminRentalService } from "../services/rental/AdminRentalService.ts";
import { AdminRentalController } from "../controller/admin/AdminRentalController.ts";
import { AdminDashboardService } from "../services/admin/AdminDashboardService.ts";
import { AdminDashboardController } from "../controller/admin/AdminDashboardController.ts";
import { RentalController } from "../controller/RentalController.ts";
import { ReviewRepository } from "../repositories/implementaion/ReviewRepository.ts";
import { ReviewService } from "../services/implementaion/ReviewService.ts";
import { ReviewController } from "../controller/ReviewController.ts";
import { IReviewController } from "../interfaces/controllers/IReviewController.ts";
import { IEmailService } from "../interfaces/services/IEmailService.ts";
import { ReportService } from "../services/implementaion/ReportService.ts";
import { ReportController } from "../controller/ReportController.ts";
import { RuleRepository } from "../repositories/implementaion/admin/RuleRepository.ts";
import { RuleService } from "../services/implementaion/admin/RuleService.ts";
import { RuleController } from "../controller/ruleController.ts";

class DIContainer {
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
  private _rentalRepository?: RentalRepository;
  private _rentalService?: RentalService;
  private _rentalAvailabilityService?: RentalAvailabilityService;
  private _rentalFinanceService?: RentalFinanceService;

  private _rentalItemRepository?: RentalItemRepository;
  private _rentalOrderRepository?: RentalOrderRepository;
  private _ruleRepository?: RuleRepository;

  private _pdfService?: PdfService;
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
  private _bookingPaymentService?: BookingPaymentService;
  private _paymentService?: PaymentService;


  private _rentalItemService?: RentalItemService;
  private _rentalOrderService?: RentalOrderService;
  private _rentalPaymentService?: RentalPaymentService;
  private _adminRentalService?: AdminRentalService;
  private _ruleService?: RuleService;

  private _authController?: AuthController;
  private _adminController?: AdminController;
  private _userController?: UserController;
  private _photographerController?: PhotographerController;
  private _adminPhotographerController?: AdminPhotographerController;
  private _packageAvailabilityController?: PackageAvailabilityController;
  private _portfolioController?: IPortfolioController;
  private _scheduleService?: any;
  private _scheduleController?: any;
  private _reviewRepository?: any;
  private _reviewService?: any;
  private _reviewController?: IReviewController;
  private _bookingController?: IBookingController;
  private _messageController?: IMessageController;
  private _walletController?: WalletController;
  private _paymentController?: PaymentController;
  private _categoryController?: ICategoryController;


  private _rentalController?: RentalController;
  private _adminRentalController?: AdminRentalController;

  private _reportService?: ReportService;
  private _reportController?: ReportController;
  private _ruleController?: RuleController;
  private _adminDashboardService?: AdminDashboardService;
  private _adminDashboardController?: AdminDashboardController;

  get bookingQueueService(): BookingQueueService {
    this._bookingQueueService ??= new BookingQueueService();
    return this._bookingQueueService;
  }

  get userRepository(): UserRepository {
    this._userRepository ??= new UserRepository();
    return this._userRepository;
  }

  get adminRepository(): AdminRepository {
    this._adminRepository ??= new AdminRepository();
    return this._adminRepository;
  }

  get photographerRepository(): PhotographerRepository {
    this._photographerRepository ??= new PhotographerRepository();
    return this._photographerRepository;
  }

  get packageRepository(): PackageRepository {
    this._packageRepository ??= new PackageRepository();
    return this._packageRepository;
  }

  get availabilityRepository(): AvailabilityRepository {
    this._availabilityRepository ??= new AvailabilityRepository();
    return this._availabilityRepository;
  }

  get portfolioRepository(): PortfolioRepository {
    this._portfolioRepository ??= new PortfolioRepository();
    return this._portfolioRepository;
  }

  get categoryRepository(): CategoryRepository {
    this._categoryRepository ??= new CategoryRepository();
    return this._categoryRepository;
  }

  get messageRepository(): MessageRepository {
    this._messageRepository ??= new MessageRepository();
    return this._messageRepository;
  }

  get bookingRepository(): BookingRepository {
    this._bookingRepository ??= new BookingRepository();
    return this._bookingRepository;
  }

  get walletRepository(): WalletRepository {
    this._walletRepository ??= new WalletRepository();
    return this._walletRepository;
  }

  get rentalRepository(): RentalRepository {
    this._rentalRepository ??= new RentalRepository();
    return this._rentalRepository;
  }

  get rentalItemRepository(): RentalItemRepository {
    this._rentalItemRepository ??= new RentalItemRepository();
    return this._rentalItemRepository;
  }

  get rentalOrderRepository(): RentalOrderRepository {
    this._rentalOrderRepository ??= new RentalOrderRepository();
    return this._rentalOrderRepository;
  }

  get pdfService(): PdfService {
    this._pdfService ??= new PdfService();
    return this._pdfService;
  }

  get emailService(): IEmailService {
    this._emailService ??= new NodeMailerService();
    return this._emailService;
  }

  get otpService(): OtpService {
    this._otpService ??= new OtpService();
    return this._otpService;
  }

  get tokenBlacklistService(): TokenBlacklistService {
    this._tokenBlacklistService ??= new TokenBlacklistService();
    return this._tokenBlacklistService;
  }

  get fileService(): S3FileService {
    this._fileService ??= new S3FileService();
    return this._fileService;
  }

  get authService(): AuthService {
    this._authService ??= new AuthService(
      this.userRepository,
      this.emailService,
      this.otpService,
      this.walletService,
    );
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
    this._photographerService ??= new PhotographerService(
      this.photographerRepository,
      this.messageService,
    );
    return this._photographerService;
  }

  get adminPhotographerService(): AdminPhotographerService {
    this._adminPhotographerService ??= new AdminPhotographerService(
      this.photographerRepository,
      this.userRepository,
      this.emailService,
      this.messageService,
    );
    return this._adminPhotographerService;
  }

  get packageService(): PackageService {
    this._packageService ??= new PackageService(
      this.packageRepository,
      this.photographerRepository,
    );
    return this._packageService;
  }

  get availabilityService(): AvailabilityService {
    this._availabilityService ??= new AvailabilityService(this.availabilityRepository);
    return this._availabilityService;
  }

  get portfolioService(): PortfolioService {
    this._portfolioService ??= new PortfolioService(
      this.portfolioRepository,
      this.photographerRepository,
    );
    return this._portfolioService;
  }

  get categoryService(): CategoryService {
    this._categoryService ??= new CategoryService(this.categoryRepository, this.messageService);
    return this._categoryService;
  }

  get messageService(): MessageService {
    this._messageService ??= new MessageService(this.messageRepository);
    return this._messageService;
  }

  get walletService(): WalletService {
    this._walletService ??= new WalletService(this.walletRepository);
    return this._walletService;
  }

  get rentalItemService(): RentalItemService {
    this._rentalItemService ??= new RentalItemService(
      this.rentalItemRepository,
      this.rentalOrderRepository,
    );
    return this._rentalItemService;
  }

  get rentalPaymentService(): RentalPaymentService {
    this._rentalPaymentService ??= new RentalPaymentService(
      this.rentalOrderRepository,
      this.paymentService,
      this.walletService,
      this.stripeService,
      this.emailService,
      this.pdfService,
    );
    return this._rentalPaymentService;
  }

  get rentalOrderService(): RentalOrderService {
    this._rentalOrderService ??= new RentalOrderService(
      this.rentalOrderRepository,
      this.rentalItemRepository,
      this.rentalItemService,
      this.rentalPaymentService,
      this.userRepository,
      this.stripeService,
    );
    return this._rentalOrderService;
  }

  get adminRentalService(): AdminRentalService {
    this._adminRentalService ??= new AdminRentalService(
      this.rentalItemRepository,
      this.rentalOrderRepository,
    );
    return this._adminRentalService;
  }

  get bookingPaymentService(): BookingPaymentService {
    this._bookingPaymentService ??= new BookingPaymentService(
      this.bookingRepository,
      this.stripeService,
      this.paymentService,
      this.walletService,
      this.emailService,
    );
    return this._bookingPaymentService;
  }

  get bookingService(): BookingService {
    this._bookingService ??= new BookingService(
      this.bookingRepository,
      this.bookingQueueService,
      this.emailService,
      this.messageService,
      this.availabilityService,
      this.bookingPaymentService,
    );
    return this._bookingService;
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

  get photographerController(): PhotographerController {
    this._photographerController ??= new PhotographerController(
      this.photographerService,
      this.fileService,
    );
    return this._photographerController;
  }

  get adminPhotographerController(): AdminPhotographerController {
    this._adminPhotographerController ??= new AdminPhotographerController(
      this.adminPhotographerService,
    );
    return this._adminPhotographerController;
  }

  get packageAvailabilityController(): PackageAvailabilityController {
    this._packageAvailabilityController ??= new PackageAvailabilityController(
      this.packageService,
      this.availabilityService,
      this.fileService,
    );
    return this._packageAvailabilityController;
  }

  get portfolioController(): IPortfolioController {
    this._portfolioController ??= new PortfolioController(this.portfolioService, this.fileService);
    return this._portfolioController;
  }

  get categoryController(): ICategoryController {
    this._categoryController ??= new CategoryController(this.categoryService);
    return this._categoryController;
  }

  get bookingController(): IBookingController {
    this._bookingController ??= new BookingController(this.bookingService);
    return this._bookingController;
  }

  get messageController(): IMessageController {
    this._messageController ??= new MessageController(this.messageService);
    return this._messageController;
  }

  get stripeService(): StripeService {
    this._stripeService ??= new StripeService();
    return this._stripeService;
  }

  get walletController(): WalletController {
    this._walletController ??= new WalletController(
      this.walletService,
      this.bookingRepository,
      this.rentalRepository,
    );
    return this._walletController;
  }

  get paymentController(): PaymentController {
    this._paymentController ??= new PaymentController(this.stripeService, this.walletService);
    return this._paymentController;
  }

  get rentalAvailabilityService(): RentalAvailabilityService {
    this._rentalAvailabilityService ??= new RentalAvailabilityService(this.rentalRepository);
    return this._rentalAvailabilityService;
  }

  get rentalFinanceService(): RentalFinanceService {
    this._rentalFinanceService ??= new RentalFinanceService(
      this.rentalRepository,
      this.stripeService,
      this.walletService,
      this.paymentService,
      this.emailService,
      this.pdfService,
      this.rentalAvailabilityService,
    );
    return this._rentalFinanceService;
  }

  get rentalService(): RentalService {
    this._rentalService ??= new RentalService(
      this.rentalRepository,
      this.userRepository,
      this.rentalAvailabilityService,
      this.rentalFinanceService,
      this.messageService,
    );
    return this._rentalService;
  }

  get rentalController(): RentalController {
    this._rentalController ??= new RentalController(
      this.rentalService,
      this.fileService,
    );
    return this._rentalController;
  }

  get adminRentalController(): AdminRentalController {
    this._adminRentalController ??= new AdminRentalController(this.adminRentalService);
    return this._adminRentalController;
  }

  get paymentService(): PaymentService {
    this._paymentService ??= new PaymentService(
      this.walletService,
      this.messageService,
      this.emailService,
      this.stripeService,
      this.rentalRepository,
      this.bookingRepository,
    );
    return this._paymentService;
  }

  get reviewRepository(): ReviewRepository {
    this._reviewRepository ??= new ReviewRepository();
    return this._reviewRepository;
  }

  get reviewService(): ReviewService {
    this._reviewService ??= new ReviewService(this.reviewRepository);
    return this._reviewService;
  }

  get reviewController(): IReviewController {
    this._reviewController ??= new ReviewController(this.reviewService);
    return this._reviewController;
  }

  get reportService(): ReportService {
    this._reportService ??= new ReportService(this.messageService);
    return this._reportService;
  }

  get reportController(): ReportController {
    this._reportController ??= new ReportController(this.reportService);
    return this._reportController;
  }

  get ruleRepository(): RuleRepository {
    this._ruleRepository ??= new RuleRepository();
    return this._ruleRepository;
  }

  get ruleService(): RuleService {
    this._ruleService ??= new RuleService(this.ruleRepository);
    return this._ruleService;
  }

  get ruleController(): RuleController {
    this._ruleController ??= new RuleController(this.ruleService);
    return this._ruleController;
  }

  get adminDashboardService(): AdminDashboardService {
    this._adminDashboardService ??= new AdminDashboardService();
    return this._adminDashboardService;
  }

  get adminDashboardController(): AdminDashboardController {
    this._adminDashboardController ??= new AdminDashboardController(this.adminDashboardService);
    return this._adminDashboardController;
  }
}

export const container = new DIContainer();
