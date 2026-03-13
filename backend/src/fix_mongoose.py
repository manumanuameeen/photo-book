import os
import re

root_dir = r"c:\Users\DELL\OneDrive\Desktop\completed Projects\Photo-book\backend\src"

def fix_mongoose(content):
    # Only replace if not already mongoose.model
    content = re.sub(r'mongoose(?<!\.model)<', 'mongoose.model<', content)
    content = re.sub(r'mongoose(?<!\.model)\(', 'mongoose.model(', content)
    return content

def update_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = fix_mongoose(content)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

updated_count = 0
for subdir, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith('.ts'):
            if update_file(os.path.join(subdir, file)):
                updated_count += 1

print(f"Fixed mongoose calls in {updated_count} files.")
