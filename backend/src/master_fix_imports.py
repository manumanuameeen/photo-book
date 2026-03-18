import os
import re

root_dir = r"c:\Users\DELL\OneDrive\Desktop\completed Projects\Photo-book\backend\src"

# Define the renames
# Keys are the old parts of the import strings, values are the new parts
# We need to be careful with overlaps, so we'll do specific ones first or use regex
renames = [
    # Typos
    (r"implementaion", "implementation"),
    (r"photograher", "photographer"),
    (r"balcklist", "blacklist"),
    
    # Folders
    (r"([\'\"/])model/", r"\1models/"),
    
    # Individual Models (both with and without suffix/extension)
    (r"ModerationLog", "moderationLog.model"),
    (r"ReportCategory", "reportCategory.model"),
    (r"Report", "report.model"),
    (r"Transaction", "transaction.model"),
    
    # Model suffix changes
    (r"addressModel", "address.model"),
    (r"availabilityModel", "availability.model"),
    (r"bookingModel", "booking.model"),
    (r"bookingPackageModel", "bookingPackage.model"),
    (r"categoryModel", "category.model"),
    (r"helpContentModel", "helpContent.model"),
    (r"helpTopicRequestModel", "helpTopicRequest.model"),
    (r"messageModel", "message.model"),
    (r"paymentModel", "payment.model"),
    (r"photographerModel", "photographer.model"),
    (r"portfolioSectionModel", "portfolioSection.model"),
    (r"rentalItemModel", "rentalItem.model"),
    (r"rentalOrderModel", "rentalOrder.model"),
    (r"reviewModel", "review.model"),
    (r"ruleModel", "rule.model"),
    (r"userModel", "user.model"),
    (r"walletModel", "wallet.model"),

    # Moved files
    (r"services/user/user\.service/user\.service", "services/user/user.service"),
    (r"\.\./controller/adminUser\.controller", "../controller/admin/adminUser.controller"),
    (r"\.\./controller/RentalController", "../controller/rental/RentalController"),
]

# We also need to handle relative path adjustments for files that MOVED
# Moved from services/user/user.service/ to services/user/
def fix_relative_in_user_service(content):
    # If the file is user.service.ts, it moved up one level.
    # So ../../../ becomes ../../
    return content.replace("../../../", "../../")

def update_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    
    # Apply standard renames
    for pattern, replacement in renames:
        new_content = re.sub(pattern, replacement, new_content)
    
    # Special case for user.service.ts
    if "user.service.ts" in file_path and "user.service.ts" not in os.path.dirname(file_path):
        new_content = fix_relative_in_user_service(new_content)
        # Also need to fix imports of neighboring services which were in ../
        # e.g. ../email/nodemailer.service.ts becomes ./email/nodemailer.service.ts
        new_content = new_content.replace("../email/", "./email/")
        new_content = new_content.replace("../otp/", "./otp/")

    # Special case for RentalController.ts (now in controller/rental/)
    if "controller" in file_path and "rental" in file_path and "RentalController.ts" in file_path:
         # It moved DOWN one level.
         # So ../middleware becomes ../../middleware
         # We'll just replace ../ with ../../ BUT NOT ../../ which would become ../../../
         # Actually it's easier to just target the specific ones
         new_content = new_content.replace("../constants/", "../../constants/")
         new_content = new_content.replace("../interfaces/", "../../interfaces/")
         new_content = new_content.replace("../middleware/", "../../middleware/")
         new_content = new_content.replace("../utils/", "../../utils/")
         new_content = new_content.replace("../dto/", "../../dto/")

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

updated_count = 0
for subdir, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            if update_file(os.path.join(subdir, file)):
                updated_count += 1

print(f"Updated {updated_count} files.")
