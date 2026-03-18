import os
import re

def fix_relative_imports(file_path, depth_change):
    if not os.path.exists(file_path):
        return
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    
    # regex for relative imports: from "../..." or import '.../...'
    # We want to match strings starting with ../
    
    def replacer(match):
        path = match.group(2)
        if path.startswith('../'):
            if depth_change > 0:
                # Prepend ../ for each level deeper
                new_path = ('../' * depth_change) + path
            else:
                # Remove ../ for each level shallower
                # This is tricky, but let's assume it always starts with enough ../
                new_path = path[3 * abs(depth_change):]
            return f'{match.group(1)}{new_path}{match.group(3)}'
        return match.group(0)

    # Simplified regex for import/export statements
    pattern = r'(from\s+["\']|import\s+["\']|require\s*\(["\'])([^"\']+)(["\'])'
    new_content = re.sub(pattern, replacer, new_content)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed relative paths in: {file_path}")

# Backend Moves (Depth +1)
backend_root = r'C:\Users\DELL\OneDrive\Desktop\completed Projects\Photo-book\backend\src'

# Controllers moved to user/
controller_user_dir = os.path.join(backend_root, 'controller', 'user')
if os.path.exists(controller_user_dir):
    for f in os.listdir(controller_user_dir):
        if f.endswith('.ts'):
            fix_relative_imports(os.path.join(controller_user_dir, f), 1)

# Repositories nested deeper
repo_impl_dir = os.path.join(backend_root, 'repositories', 'implementation')
if os.path.exists(repo_impl_dir):
    for sub in ['booking', 'rental', 'user', 'wallet', 'photographer', 'common']:
        sub_dir = os.path.join(repo_impl_dir, sub)
        if os.path.exists(sub_dir):
            for f in os.listdir(sub_dir):
                if f.endswith('.ts'):
                    fix_relative_imports(os.path.join(sub_dir, f), 1)

# Services nested deeper
service_impl_dir = os.path.join(backend_root, 'services', 'implementation')
if os.path.exists(service_impl_dir):
    for sub in ['booking', 'rental', 'user', 'wallet', 'common']:
        sub_dir = os.path.join(service_impl_dir, sub)
        if os.path.exists(sub_dir):
            for f in os.listdir(sub_dir):
                if f.endswith('.ts'):
                    fix_relative_imports(os.path.join(sub_dir, f), 1)

# Frontend Moves (Depth -1)
frontend_root = r'C:\Users\DELL\OneDrive\Desktop\completed Projects\Photo-book\frontend\src'
fix_relative_imports(os.path.join(frontend_root, 'services', 'api', 'auth.api.ts'), -1)
fix_relative_imports(os.path.join(frontend_root, 'interfaces', 'services', 'IAuthService.ts'), -1)
