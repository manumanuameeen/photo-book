import os
import re

def update_backend_imports():
    root_dir = r'C:\Users\DELL\OneDrive\Desktop\completed Projects\Photo-book\backend\src'
    
    # Define mappings (part of the path -> new part of the path)
    mappings = {
        # Controllers
        'controller/auth.controller': 'controller/user/auth.controller',
        'controller/BookingController': 'controller/user/BookingController',
        'controller/CategoryController': 'controller/user/CategoryController',
        'controller/HelpController': 'controller/user/HelpController',
        'controller/HelpTopicRequestController': 'controller/user/HelpTopicRequestController',
        'controller/MessageController': 'controller/user/MessageController',
        'controller/packageAvailability.controller': 'controller/user/packageAvailability.controller',
        'controller/PaymentController': 'controller/user/PaymentController',
        'controller/photographer.controller': 'controller/user/photographer.controller',
        'controller/portfolio.controller': 'controller/user/portfolio.controller',
        'controller/ReportCategoryController': 'controller/user/ReportCategoryController',
        'controller/ReportController': 'controller/user/ReportController',
        'controller/ReviewController': 'controller/user/ReviewController',
        'controller/user.controller': 'controller/user/user.controller',
        'controller/WalletController': 'controller/user/WalletController',
        'controller/ruleController': 'controller/user/RuleController',
        
        # Repositories (Implementation)
        'repositories/implementation/AvailabilityRepository': 'repositories/implementation/photographer/AvailabilityRepository',
        'repositories/implementation/PackageRepository': 'repositories/implementation/photographer/PackageRepository',
        'repositories/implementation/PortfolioRepository': 'repositories/implementation/photographer/PortfolioRepository',
        'repositories/implementation/CancelLimit': 'repositories/implementation/booking/CancelLimit',
        'repositories/implementation/CategoryRepository': 'repositories/implementation/common/CategoryRepository',
        'repositories/implementation/HelpRepository': 'repositories/implementation/common/HelpRepository',
        'repositories/implementation/HelpTopicRequestRepository': 'repositories/implementation/common/HelpTopicRequestRepository',
        'repositories/implementation/MessageRepository': 'repositories/implementation/common/MessageRepository',
        'repositories/implementation/ReportCategoryRepository': 'repositories/implementation/common/ReportCategoryRepository',
        'repositories/implementation/ReportRepository': 'repositories/implementation/common/ReportRepository',
        'repositories/implementation/ReviewRepository': 'repositories/implementation/common/ReviewRepository',
        
        # Repositories (Legacy Rental)
        'repositories/rental/RentalItemRepository': 'repositories/implementation/rental/RentalItemRepository',
        'repositories/rental/RentalOrderRepository': 'repositories/implementation/rental/RentalOrderRepository',
        
        # Services (Implementation)
        'services/implementation/BookingService': 'services/implementation/booking/BookingService',
        'services/implementation/PaymentService': 'services/implementation/booking/PaymentService',
        'services/implementation/StripeService': 'services/implementation/booking/StripeService',
        'services/implementation/RentalService': 'services/implementation/rental/RentalService',
        'services/implementation/WalletService': 'services/implementation/wallet/WalletService',
        'services/implementation/HelpService': 'services/implementation/common/HelpService',
        'services/implementation/HelpTopicRequestService': 'services/implementation/common/HelpTopicRequestService',
        'services/implementation/PdfService': 'services/implementation/common/PdfService',
        'services/implementation/ReportCategoryService': 'services/implementation/common/ReportCategoryService',
        'services/implementation/ReportService': 'services/implementation/common/ReportService',
        'services/implementation/ReviewService': 'services/implementation/common/ReviewService',
        
        # Interfaces
        'interfaces/admin/IAdminController': 'interfaces/controllers/IAdminController',
        'interfaces/admin/IAdminPhotographerController': 'interfaces/controllers/IAdminPhotographerController',
        'interfaces/admin/IAdminPhotographersController': 'interfaces/controllers/IAdminPhotographersController',
        'interfaces/admin/IAdminUser.interface': 'interfaces/services/IAdminUserService',
        'interfaces/user/IauthController': 'interfaces/controllers/IauthController',
        'interfaces/user/IPhotographyController': 'interfaces/controllers/IPhotographyController',
        'interfaces/user/IUserController': 'interfaces/controllers/IUserController',
        'interfaces/user/userRole.enum': 'interfaces/common/userRole.enum',
        'interfaces/user/userStatus.enum': 'interfaces/common/userStatus.enum',
    }

    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.ts'):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                new_content = content
                for old, new in mappings.items():
                    # Match imports like: from "../../controller/auth.controller"
                    # We look for the pattern in the string literal
                    new_content = new_content.replace(old, new)

                if new_content != content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated: {file_path}")

if __name__ == "__main__":
    update_backend_imports()
