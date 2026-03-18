import os
import re

root_dir = r"c:\Users\DELL\OneDrive\Desktop\completed Projects\Photo-book\backend\src"

def fix_imports(file_path, content):
    # Regex to find imports from models
    # e.g. from "../models/Report"
    
    def model_subst(match):
        quote = match.group(1)
        path = match.group(2)
        
        # If it's a model import but missing .model
        if "models/" in path and ".model" not in path:
            # Get the base filename
            parts = path.split("/")
            filename = parts[-1]
            # Check if it's one of our models
            models = ["Report", "Transaction", "ReportCategory", "ModerationLog", "User", "Photographer", "Booking", "RentalItem", "RentalOrder"]
            # Case insensitive check
            for m in models:
                if filename.lower() == m.lower():
                    # Replace with .model version, preserving casing of the original filename for now 
                    # Actually, our files are lowercase now: report.model.ts
                    return f"{quote}{'/'.join(parts[:-1])}/{filename.lower()}.model{quote}"
        return match.group(0)

    # First, handle the models/X -> models/x.model
    new_content = re.sub(r'([\'"])(.*?models/.*?)[\'"]', model_subst, content)
    
    # Also handle some missed typos
    new_content = new_content.replace("tokenBalcklist.service", "tokenBlacklist.service")
    new_content = new_content.replace("photograher", "photographer")
    
    return new_content

def update_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = fix_imports(file_path, content)
    
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

print(f"Smart-fixed imports in {updated_count} files.")
