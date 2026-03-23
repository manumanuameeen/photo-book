import os
import re

root_dir = r"c:\Users\DELL\OneDrive\Desktop\completed Projects\Photo-book\backend\src"

# This script will find any identifier with .model and try to fix it.
# It will also fix the previous over-replacement of ReportCategory, etc.

def fix_content(content):
    # Fix the specific ones first
    content = content.replace("IreportCategory.model", "IReportCategory")
    content = content.replace("reportCategory.model", "ReportCategory")
    content = content.replace("Ireport.model", "IReport")
    content = content.replace("report.model", "Report")
    content = content.replace("IreportCategory.model", "IReportCategory")
    content = content.replace("report.model", "Report")
    content = content.replace("ImoderationLog.model", "IModerationLog")
    content = content.replace("moderationLog.model", "ModerationLog")
    content = content.replace("IreportCategory.model", "IReportCategory")
    content = content.replace("reportCategory.model", "ReportCategory")
    content = content.replace("Itransaction.model", "ITransaction")
    content = content.replace("transaction.model", "Transaction")
    
    # Also handle the suffixes that might have been added to identifiers
    # e.g. user.modelRepository -> UserRepository
    # Actually, let's just look for .model followed by letters in an identifier
    # but NOT inside a string.
    
    def identifier_fix(match):
        full_match = match.group(0)
        # If it's inside quotes, leave it alone (it's a path)
        if full_match.startswith("'") or full_match.startswith('"'):
            return full_match
        # Otherwise, it's an identifier or something else.
        # Replace .model with nothing and capitalize next letter if it's there
        # But for now, let's just replace .model with nothing for identifiers.
        return full_match.replace(".model", "")

    # This regex tries to find strings or identifiers. 
    # Strings are matched and returned as is.
    # Identifiers with .model are matched and fixed.
    regex = r"(['\"][^'\"]*['\"])|([a-zA-Z_][a-zA-Z0-9_\.]*\.model[a-zA-Z0-9_]*)"
    
    def subst(match):
        if match.group(1): # It's a string
            return match.group(1)
        else: # It's an identifier with .model
            return match.group(2).replace(".model", "")
            
    return re.sub(regex, subst, content)

def update_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = fix_content(content)
    
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

print(f"Fixed identifiers in {updated_count} files.")
