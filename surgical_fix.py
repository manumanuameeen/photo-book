import os
import re

def fix_file(path, depth_delta):
    if not os.path.exists(path): return
    with open(path, 'r', encoding='utf-8') as f: content = f.read()
    
    def repl(m):
        prefix, p, suffix = m.groups()
        if p.startswith('../'):
            if depth_delta > 0: return f"{prefix}{'../' * depth_delta}{p}{suffix}"
            if depth_delta < 0: return f"{prefix}{p[3*abs(depth_delta):]}{suffix}"
        return m.group(0)

    # Simple regex for relative imports
    pattern = r'(from\s+["\']|import\s+["\']|require\s*\(["\'])([^"\']+)(["\'])'
    new_content = re.sub(pattern, repl, content)
    
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f: f.write(new_content)
        print(f"Fixed depth in {path}")

def global_replace(path_part, old, new):
     root_dir = r'C:\Users\DELL\OneDrive\Desktop\completed Projects\Photo-book\backend\src'
     for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.ts'):
                fpath = os.path.join(root, file)
                with open(fpath, 'r', encoding='utf-8') as f: content = f.read()
                new_content = content.replace(old, new)
                if new_content != content:
                    with open(fpath, 'w', encoding='utf-8') as f: f.write(new_content)
                    print(f"Global Replace in {fpath}: {old} -> {new}")

backend_src = r'C:\Users\DELL\OneDrive\Desktop\completed Projects\Photo-book\backend\src'

# list of files specifically moved to deeper folders (Depth +1)
moved_files = [
    'controller/user/auth.controller.ts', 'controller/user/BookingController.ts', 'controller/user/CategoryController.ts',
    'controller/user/HelpController.ts', 'controller/user/HelpTopicRequestController.ts', 'controller/user/MessageController.ts',
    'controller/user/packageAvailability.controller.ts', 'controller/user/PaymentController.ts', 'controller/user/photographer.controller.ts',
    'controller/user/portfolio.controller.ts', 'controller/user/ReportCategoryController.ts', 'controller/user/ReportController.ts',
    'controller/user/ReviewController.ts', 'controller/user/user.controller.ts', 'controller/user/WalletController.ts',
    'controller/user/RuleController.ts',
    'repositories/implementation/photographer/AvailabilityRepository.ts', 'repositories/implementation/photographer/PackageRepository.ts',
    'repositories/implementation/photographer/PortfolioRepository.ts', 'repositories/implementation/booking/CancelLimit.ts',
    'repositories/implementation/common/CategoryRepository.ts', 'repositories/implementation/common/HelpRepository.ts',
    'repositories/implementation/common/HelpTopicRequestRepository.ts', 'repositories/implementation/common/MessageRepository.ts',
    'repositories/implementation/common/ReportCategoryRepository.ts', 'repositories/implementation/common/ReportRepository.ts',
    'repositories/implementation/common/ReviewRepository.ts', 'repositories/implementation/rental/RentalItemRepository.ts',
    'repositories/implementation/rental/RentalOrderRepository.ts',
    'services/implementation/booking/BookingService.ts', 'services/implementation/booking/PaymentService.ts',
    'services/implementation/booking/StripeService.ts', 'services/implementation/rental/RentalService.ts',
    'services/implementation/wallet/WalletService.ts', 'services/implementation/common/HelpService.ts',
    'services/implementation/common/HelpTopicRequestService.ts', 'services/implementation/common/PdfService.ts',
    'services/implementation/common/ReportCategoryService.ts', 'services/implementation/common/ReportService.ts',
    'services/implementation/common/ReviewService.ts'
]

# FIRST: Revert any accidental double depth from previous run
# My previous run was broad across folders. I'll just fix all files by checking if they have too many ../
# But better: only apply +1 to the list above, after first ensuring they are "normal" (not already fixed).
# Actually, I'll just fix the filenames and inter-folder imports first.

# Fix the interface rename
global_replace('src', 'interfaces/admin/IAdminUser.interface', 'interfaces/services/IAdminUserService')
global_replace('src', '../admin/IAdminUser.interface', '../services/IAdminUserService')

# Fix cross-service references (e.g., StripeService moved to booking/)
global_replace('src', 'implementation/StripeService', 'implementation/booking/StripeService')
global_replace('src', 'implementation/PdfService', 'implementation/common/PdfService')

# Now fix the moved files depth. Since I already ran +1 on them once, if they have too many levels, I should fix them.
# I'll just reset relative paths in moved files and then apply +1 correctly.

def reset_and_fix_depth(fpath, delta):
    if not os.path.exists(fpath): return
    with open(fpath, 'r', encoding='utf-8') as f: content = f.read()
    # If I see ../../../../ and it should be ../../../, I fix it.
    # Let's just use the current error state (captured in head) to guide.
    # BookingRepository has ../../../../ but should have ../../../
    new_content = content.replace('../../../../', '../../../') # Temp fix for over-recursion
    if new_content != content:
        with open(fpath, 'w', encoding='utf-8') as f: f.write(new_content)
        print(f"Cleaned over-depth in {fpath}")

for f in moved_files:
    reset_and_fix_depth(os.path.join(backend_src, f), 1)

# Handle cases where files ALREADY in subfolders were accidentally messed up by my previous script
for root, dirs, files in os.walk(backend_src):
    for file in files:
        if file.endswith('.ts'):
            fpath = os.path.join(root, file)
            if fpath not in moved_files:
                # If a non-moved file has too many ../, fix it
                with open(fpath, 'r', encoding='utf-8') as f: content = f.read()
                # Files in booking/ (level 3) should have ../../../ to reach src/root
                # If my script added a level, they have ../../../../ which is wrong.
                new_content = content.replace('../../../../', '../../../')
                if new_content != content:
                    with open(fpath, 'w', encoding='utf-8') as f: f.write(new_content)
                    print(f"Cleaned non-moved file {fpath}")
