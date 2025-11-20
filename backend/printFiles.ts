// printFiles.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folder to scan
const folderPath: string = path.join(__dirname, "src");
// Output file
const outputFile: string = path.join(__dirname, "allFilesContent.txt");

type FileEntry = { path: string; content: string };

/**
 * Recursively gets all files and their content inside a directory
 * @param dir Directory path
 * @param level Current depth level for formatting
 * @returns Array of file entries with path & content
 */
function getFilesWithContent(dir: string, level: number = 0): FileEntry[] {
  const entries: fs.Dirent[] = fs.readdirSync(dir, { withFileTypes: true });
  let files: FileEntry[] = [];

  for (const entry of entries) {
    const fullPath: string = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files = files.concat(getFilesWithContent(fullPath, level + 1));
    } else {
      const content: string = fs.readFileSync(fullPath, "utf-8");
      files.push({ path: fullPath, content });
    }
  }

  return files;
}

const allFiles: FileEntry[] = getFilesWithContent(folderPath);

// Write to a single output file with folder path header
let output: string = "";
allFiles.forEach((file) => {
  output += `\n\n==== ${file.path} ====\n\n`;
  output += file.content;
});

fs.writeFileSync(outputFile, output, "utf-8");
console.log(`All files content written to ${outputFile}`);
