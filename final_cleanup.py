import os

def fix_imports_in_dir(directory, depth_to_src, mappings):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.ts'):
                fpath = os.path.join(root, file)
                with open(fpath, 'r', encoding='utf-8') as f: content = f.read()
                new_content = content
                for old, new in mappings.items():
                    new_content = new_content.replace(old, new)
                
                # Rule for relative paths starting with ../
                # If we are at depth 3 (e.g. src/repositories/impl/sub), and we want to reach src/
                # we need ../../../
                
                if new_content != content:
                    with open(fpath, 'w', encoding='utf-8') as f: f.write(new_content)
                    print(f"Cleaned {fpath}")

backend_src = r'C:\Users\DELL\OneDrive\Desktop\completed Projects\Photo-book\backend\src'

# Specific adjustments for Repositories in subfolders
# They are at src/repositories/implementation/[sub] (level 3 relative to src)
repo_subs = ['booking', 'rental', 'user', 'wallet', 'photographer', 'common']
for sub in repo_subs:
    dir_path = os.path.join(backend_src, 'repositories', 'implementation', sub)
    if os.path.exists(dir_path):
        fix_imports_in_dir(dir_path, 3, {
            '../../../base/BaseRepository': '../../base/BaseRepository', # Level 3 to level 2
            '../../../../models/': '../../../models/', # Level 3 to level 1
            '../../../../interfaces/repositories/': '../../../interfaces/repositories/',
            '../../../../interfaces/models/': '../../../interfaces/models/',
            '../../../../dto/': '../../../dto/',
        })

# Specific adjustments for Services in subfolders
# They are at src/services/implementation/[sub] (level 3 relative to src)
service_subs = ['booking', 'rental', 'user', 'wallet', 'common']
for sub in service_subs:
    dir_path = os.path.join(backend_src, 'services', 'implementation', sub)
    if os.path.exists(dir_path):
        fix_imports_in_dir(dir_path, 3, {
            '../../../../models/': '../../../models/',
            '../../../../interfaces/services/': '../../../interfaces/services/',
            '../../../../interfaces/repositories/': '../../../interfaces/repositories/',
            '../../../../utils/': '../../../utils/',
            '../../../../constants/': '../../../constants/',
        })

# Specific adjustments for Controllers in user/
# They are at src/controller/user (level 2 relative to src)
controller_user_dir = os.path.join(backend_src, 'controller', 'user')
if os.path.exists(controller_user_dir):
    fix_imports_in_dir(controller_user_dir, 2, {
        '../../../interfaces/': '../../interfaces/',
        '../../../constants/': '../../constants/',
        '../../../utils/': '../../utils/',
        '../../../middleware/': '../../middleware/',
        '../../../models/': '../../models/',
        '../../../services/external/': '../../services/external/',
    })

# Fix the specific Auth legacy migration references
# frontend/src/services/api/auth.api.ts
# It moved from src/modules/auth/services (3) to src/services/api (2)
# My previous script might have over-corrected.
frontend_src = r'C:\Users\DELL\OneDrive\Desktop\completed Projects\Photo-book\frontend\src'
fix_imports_in_dir(os.path.join(frontend_src, 'services', 'api'), 2, {
    '../../../interfaces/': '../../interfaces/',
    '../../../utils/': '../../utils/',
    '../../../constants/': '../../constants/',
})
