import os
import re

def update_imports(root_dir, old_path_part, new_path_part):
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Basic import update logic - needs to handle relative paths
                # This is a simplified version, more robust logic might be needed
                # for complex relative path changes.
                
                # For this specific move:
                # old: '@/modules/auth/services/authService' or '../../modules/auth/services/authService'
                # new: '@/services/api/auth.api' or '../../services/api/auth.api'
                
                new_content = content
                
                # Handle alias imports if used
                new_content = new_content.replace('modules/auth/services/authService', 'services/api/auth.api')
                new_content = new_content.replace('modules/auth/services/IAuthsevice', 'interfaces/services/IAuthService')
                
                if new_content != content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {file_path}")

frontend_src = r'C:\Users\DELL\OneDrive\Desktop\completed Projects\Photo-book\frontend\src'
update_imports(frontend_src, 'modules/auth/services/', 'services/api/')
