import os
import re

root_dir = r"c:\Users\DELL\OneDrive\Desktop\completed Projects\Photo-book\backend\src"

def find_file(base_dir, path):
    # Try with .ts, .tsx, /index.ts, etc.
    abs_path = os.path.normpath(os.path.join(base_dir, path))
    for ext in ['', '.ts', '.tsx', '.model.ts', '.service.ts', '.controller.ts' , '/index.ts']:
        if os.path.exists(abs_path + ext) and not os.path.isdir(abs_path + ext):
            return True
    return False

def get_correct_relative_path(current_file_dir, target_file_path):
    # current_file_dir: absolute path to dir of file we are editing
    # target_file_path: absolute path to file we want to import
    rel = os.path.relpath(target_file_path, current_file_dir)
    rel = rel.replace(os.sep, '/')
    if not rel.startswith('.'):
        rel = './' + rel
    # Remove .ts extension for the import string? 
    # The project seems to use .ts extensions. Let's keep them if they were there.
    return rel

def fix_broken_relatives(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    dir_path = os.path.dirname(file_path)
    # Match imports: import ... from "./path"
    regex = r"((?:import|from|import\s*\()[\s\n]*[\'\"])([^\'\"]+)([\'\"])"
    
    def subst(match):
        prefix = match.group(1)
        path = match.group(2)
        suffix = match.group(3)
        
        if path.startswith('.'):
            # Check if it exists
            if not find_file(dir_path, path):
                # It's broken! Let's try to find where the file is.
                # Usually it moved up or down.
                # Try finding a file with the same basename in the whole src
                basename = path.split('/')[-1]
                if basename.endswith('.ts'): basename = basename[:-3]
                
                # Search for any file with this basename in src
                matches = []
                for root, dirs, files in os.walk(root_dir):
                    for f in files:
                        if f.startswith(basename) and f.endswith('.ts'):
                            matches.append(os.path.join(root, f))
                
                if len(matches) == 1:
                    # Found a unique match! Correct the path.
                    new_rel = get_correct_relative_path(dir_path, matches[0])
                    # If original had .ts, keep it.
                    if path.endswith('.ts') and not new_rel.endswith('.ts'):
                        new_rel += '.ts'
                    elif not path.endswith('.ts') and new_rel.endswith('.ts'):
                        new_rel = new_rel[:-3]
                    
                    print(f"Fixed: {file_path} -> {path} to {new_rel}")
                    return f"{prefix}{new_rel}{suffix}"
                elif len(matches) > 1:
                    # Ambiguous, try to match by directory structure
                    # e.g. if we are looking for ../constants/httpStatus, look for constants/httpStatus somewhere else
                    # This is more complex, for now let's just log it.
                    print(f"Ambiguous match for {path} in {file_path}: {matches}")
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

print(f"Fixed broken relative imports in {updated_count} files.")
