import { UserRepository } from "../repositories/user/user.repository";
import { AdminRepository } from "../repositories/admin/admin.repository";
import { PhotographerRepository } from "../repositories/photographer/photographer.repository";
import { AuthService } from "../services/user/auth/auth.service";
import { AdminServices } from "../services/admin/admin.service";
import { NodeMailerService } from "../services/user/email/nodemailer.service";
import { OtpService } from "../services/user/otp/otp.service";
import { TokenBlacklistService } from "../services/token/tokenBlacklist.service";
import { UserService } from "../services/user/user.service";
import { PhotographerService } from "../services/photographer/photographer.service";
import { AdminPhotographerService } from "../services/admin/adminPhotographer.service";
import { IAdminPhotographerService } from "../interfaces/services/IAdminPhotographerService";
import { S3FileService } from "../services/external/s3File.service";
import { AuthController } from "../controller/user/auth.controller";
import { AdminController } from "../controller/admin/adminUser.controller";
import { UserController } from "../controller/user/user.controller";
import { PhotographerController } from "../controller/user/photographer.controller";
import { AiController } from "../controller/user/ai.controller";

import { AdminPhotographerController } from "../controller/admin/adminPhotographer.controller";
import { PackageRepository } from "../repositories/photographer/package.repository";
import { AvailabilityRepository } from "../repositories/photographer/availability.repository";
import { PackageService } from "../services/photographer/package.service";
import { AvailabilityService } from "../services/photographer/availability.service";
import { PackageAvailabilityController } from "../controller/user/packageAvailability.controller";
import { PortfolioRepository } from "../repositories/photographer/portfolio.repository";
import { PortfolioService } from "../services/photographer/portfolio.service";
import { PortfolioController } from "../controller/user/portfolio.controller";
import { IPortfolioController } from "../interfaces/controllers/IPortfolioController";
import { CategoryRepository } from "../repositories/common/category.repository";
import { MessageRepository } from "../repositories/common/message.repository";
import { CategoryService } from "../services/common/category.service";
import { MessageService } from "../services/messaging/message.service";
import { CategoryController } from "../controller/user/category.controller";
import { ICategoryController } from "../interfaces/controllers/ICategoryController";
import { BookingRepository } from "../repositories/booking/booking.repository";
import { BookingService } from "../services/booking/booking.service";
import { BookingController } from "../controller/user/booking.controller";
import { IBookingController } from "../interfaces/controllers/IBookingController";
import { MessageController } from "../controller/user/message.controller";
import { IMessageController } from "../interfaces/controllers/IMessageController";
import { WalletRepository } from "../repositories/wallet/wallet.repository";
import { WalletService } from "../services/wallet/wallet.service";
import { BookingQueueService } from "../services/common/bookingQueue.service";
import { StripeService } from "../services/booking/stripe.service";
import { WalletController } from "../controller/user/wallet.controller";
import { PaymentController } from "../controller/user/payment.controller";
import { PaymentService } from "../services/booking/payment.service";
import { RentalRepository } from "../repositories/rental/rental.repository";
import { PdfService } from "../services/common/pdf.service";
import { BookingPaymentService } from "../services/booking/bookingPayment.service";

import { RentalItemRepository } from "../repositories/rental/rentalItem.repository";
import { RentalOrderRepository } from "../repositories/rental/rentalOrder.repository";
import { RentalItemService } from "../services/rental/rentalItem.service";
import { RentalOrderService } from "../services/rental/rentalOrder.service";
import { RentalPaymentService } from "../services/rental/rentalPayment.service";
import { RentalAvailabilityService } from "../services/rental/rentalAvailability.service";
import { RentalFinanceService } from "../services/rental/rentalFinance.service";
import { RentalService } from "../services/rental/rental.service";
import { IAiService } from "../interfaces/services/IAiService";
import { AiService } from "../services/ai/ai.service";
import { AdminRentalService } from "../services/rental/adminRental.service";
import { AdminRentalController } from "../controller/admin/adminRental.controller";
import { AdminDashboardService } from "../services/admin/adminDashboard.service";
import { AdminDashboardController } from "../controller/admin/adminDashboard.controller";
import { RentalController } from "../controller/rental/rental.controller";
import { IReviewRepository } from "../interfaces/repositories/IReviewRepository";
import { IReviewService } from "../interfaces/services/IReviewService";
import { IHelpRepository } from "../interfaces/repositories/IHelpRepository";
import { IHelpService } from "../interfaces/services/IHelpService";
import { ReviewRepository } from "../repositories/common/review.repository";
import { ReviewService } from "../services/common/review.service";
import { ReviewController } from "../controller/user/review.controller";
import { IReviewController } from "../interfaces/controllers/IReviewController";
import { HelpRepository } from "../repositories/common/help.repository";
import { HelpService } from "../services/common/help.service";
import { HelpController } from "../controller/user/help.controller";
import { IHelpController } from "../interfaces/controllers/IHelpController";
import { IEmailService } from "../interfaces/services/IEmailService";
import { ReportService } from "../services/common/report.service";
import { ReportController } from "../controller/user/report.controller";
import { ReportRepository } from "../repositories/common/report.repository";
import { ReportCategoryRepository } from "../repositories/common/reportCategory.repository";
import { ReportCategoryService } from "../services/common/reportCategory.service";
import { ReportCategoryController } from "../controller/user/reportCategory.controller";
import { RuleRepository } from "../repositories/admin/rule.repository";
import { RuleService } from "../services/admin/rule.service";
import { RuleController } from "../controller/user/rule.controller";
import { IRentalAvailabilityService } from "../interfaces/services/rental/IRentalAvailabilityService";
import { IRentalFinanceService } from "../interfaces/services/rental/IRentalFinanceService";
import { HelpTopicRequestRepository } from "../repositories/common/helpTopicRequest.repository";
import { HelpTopicRequestService } from "../services/common/helpTopicRequest.service";
import { HelpTopicRequestController } from "../controller/user/helpTopicRequest.controller";
import { IHelpTopicRequestRepository } from "../interfaces/repositories/IHelpTopicRequestRepository";
import { IHelpTopicRequestService } from "../interfaces/services/IHelpTopicRequestService";
import { IHelpTopicRequestController } from "../interfaces/controllers/IHelpTopicRequestController";

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
  private _rentalAvailabilityService?: IRentalAvailabilityService;
  private _rentalFinanceService?: IRentalFinanceService;

  private _rentalItemRepository?: RentalItemRepository;
  private _rentalOrderRepository?: RentalOrderRepository;
  private _ruleRepository?: RuleRepository;
  private _helpTopicRequestRepository?: IHelpTopicRequestRepository;

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
  private _helpTopicRequestService?: IHelpTopicRequestService;
  private _aiService?: IAiService;

  private _authController?: AuthController;
  private _adminController?: AdminController;
  private _userController?: UserController;
  private _photographerController?: PhotographerController;
  private _adminPhotographerController?: AdminPhotographerController;
  private _packageAvailabilityController?: PackageAvailabilityController;
  private _portfolioController?: IPortfolioController;
  private _helpRepository?: IHelpRepository;
  private _helpService?: IHelpService;
  private _helpController?: IHelpController;
  private _reviewRepository?: IReviewRepository;
  private _reviewService?: IReviewService;
  private _reviewController?: IReviewController;
  private _bookingController?: IBookingController;
  private _messageController?: IMessageController;
  private _walletController?: WalletController;
  private _paymentController?: PaymentController;
  private _categoryController?: ICategoryController;

  private _rentalController?: RentalController;
  private _adminRentalController?: AdminRentalController;

  private _reportRepository?: ReportRepository;
  private _reportService?: ReportService;
  private _reportController?: ReportController;
  private _reportCategoryRepository?: ReportCategoryRepository;
  private _reportCategoryService?: ReportCategoryService;
  private _reportCategoryController?: ReportCategoryController;
  private _ruleController?: RuleController;
  private _adminDashboardService?: AdminDashboardService;
  private _adminDashboardController?: AdminDashboardController;
  private _helpTopicRequestController?: IHelpTopicRequestController;
  private _aiController?: AiController;

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

  get helpTopicRequestRepository(): IHelpTopicRequestRepository {
    this._helpTopicRequestRepository ??= new HelpTopicRequestRepository();
    return this._helpTopicRequestRepository;
  }

  get helpRepository(): IHelpRepository {
    this._helpRepository ??= new HelpRepository();
    return this._helpRepository;
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

  get adminPhotographerService(): IAdminPhotographerService {
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

  get helpService(): IHelpService {
    this._helpService ??= new HelpService(this.helpRepository);
    return this._helpService;
  }

  get helpTopicRequestService(): IHelpTopicRequestService {
    this._helpTopicRequestService ??= new HelpTopicRequestService(this.helpTopicRequestRepository);
    return this._helpTopicRequestService;
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

  get rentalAvailabilityService(): IRentalAvailabilityService {
    this._rentalAvailabilityService ??= new RentalAvailabilityService(this.rentalRepository);
    return this._rentalAvailabilityService;
  }

  get rentalFinanceService(): IRentalFinanceService {
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
    this._rentalController ??= new RentalController(this.rentalService, this.fileService);
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

  get reviewRepository(): IReviewRepository {
    this._reviewRepository ??= new ReviewRepository();
    return this._reviewRepository;
  }

  get reviewService(): IReviewService {
    this._reviewService ??= new ReviewService(this.reviewRepository);
    return this._reviewService;
  }

  get reviewController(): IReviewController {
    this._reviewController ??= new ReviewController(this.reviewService);
    return this._reviewController;
  }

  get helpController(): IHelpController {
    this._helpController ??= new HelpController(this.helpService);
    return this._helpController;
  }

  get reportRepository(): ReportRepository {
    this._reportRepository ??= new ReportRepository();
    return this._reportRepository;
  }

  get reportCategoryRepository(): ReportCategoryRepository {
    this._reportCategoryRepository ??= new ReportCategoryRepository();
    return this._reportCategoryRepository;
  }

  get reportService(): ReportService {
    this._reportService ??= new ReportService(
      this.messageService,
      this.reportRepository,
      this.fileService,
    );
    return this._reportService;
  }

  get reportController(): ReportController {
    this._reportController ??= new ReportController(this.reportService);
    return this._reportController;
  }

  get reportCategoryService(): ReportCategoryService {
    this._reportCategoryService ??= new ReportCategoryService(this.reportCategoryRepository);
    return this._reportCategoryService;
  }

  get reportCategoryController(): ReportCategoryController {
    this._reportCategoryController ??= new ReportCategoryController(this.reportCategoryService);
    return this._reportCategoryController;
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

  get helpTopicRequestController(): IHelpTopicRequestController {
    this._helpTopicRequestController ??= new HelpTopicRequestController(
      this.helpTopicRequestService,
    );
    return this._helpTopicRequestController;
  }

  get aiService(): IAiService {
    this._aiService ??= new AiService();
    return this._aiService;
  }

  get aiController(): AiController {
    this._aiController ??= new AiController(this.aiService);
    return this._aiController;
  }
}

export const container = new DIContainer();

