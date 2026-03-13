import os
import re

root_dir = r"c:\Users\DELL\OneDrive\Desktop\completed Projects\Photo-book\backend\src"

def find_file_in_src(basename):
    # Returns the absolute path to a file in src that matches basename (case-insensitive)
    # basename could be "User" or "report.model"
    target = basename.lower()
    if target.endswith('.ts'): target = target[:-3]
    
    for root, dirs, files in os.walk(root_dir):
        for f in files:
            f_lower = f.lower()
            if f_lower.endswith('.ts'):
                f_name = f_lower[:-3]
                # Match exactly or match with .model suffix if the original didn't have it
                if f_name == target or f_name == target + ".model":
                    return os.path.join(root, f)
    return None

def get_correct_relative_path(current_file_dir, target_file_path):
    rel = os.path.relpath(target_file_path, current_file_dir)
    rel = rel.replace(os.sep, '/')
    if not rel.startswith('.'):
        rel = './' + rel
    return rel

def fix_broken_relatives(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    dir_path = os.path.dirname(file_path)
    regex = r"((?:import|from|import\s*\()[\s\n]*[\'\"])([^\'\"]+)([\'\"])"
    
    def subst(match):
        prefix = match.group(1)
        path = match.group(2)
        suffix = match.group(3)
        
        if path.startswith('.'):
            # Check if it exists as is
            abs_path = os.path.normpath(os.path.join(dir_path, path))
            # Test several possibilities
            exists = False
            for ext in ['', '.ts', '.tsx', '/index.ts']:
                if os.path.exists(abs_path + ext) and not os.path.isdir(abs_path + ext):
                    exists = True
                    break
            
            if not exists:
                # Broken! Find it.
                basename = path.split('/')[-1]
                found_path = find_file_in_src(basename)
                
                if found_path:
                    new_rel = get_correct_relative_path(dir_path, found_path)
                    # Preserve .ts extension if it was present
                    if path.endswith('.ts') and not new_rel.endswith('.ts'):
                        new_rel += '.ts'
                    elif not path.endswith('.ts') and new_rel.endswith('.ts'):
                        new_rel = new_rel[:-3]
                    
                    print(f"Fixed: {file_path} -> {path} to {new_rel}")
                    return f"{prefix}{new_rel}{suffix}"
        return match.group(0)

    new_content = re.sub(regex, subst, content)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

updated_count = 0
for subdir, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            if fix_broken_relatives(os.path.join(subdir, file)):
                updated_count += 1

print(f"ULTRA-Fixed broken relative imports in {updated_count} files.")
