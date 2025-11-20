// printFrontendFiles.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Change this to your src folder
const srcFolder = path.join(__dirname, "src");

// Output file
const outputFile = path.join(__dirname, "allFrontendFiles.txt");

interface FileEntry {
  path: string;
  content: string;
}

/**
 * Recursively read all files in directory
 */
function getAllFiles(dir: string): FileEntry[] {
  let results: FileEntry[] = [];

  const list = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of list) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      results = results.concat(getAllFiles(fullPath));
    } else if (item.isFile()) {
      // Skip binary files
      if (!fullPath.endsWith(".png") && !fullPath.endsWith(".jpg") && !fullPath.endsWith(".ico")) {
        try {
          const content = fs.readFileSync(fullPath, "utf-8");
          results.push({ path: fullPath, content });
        } catch (err) {
          results.push({ path: fullPath, content: `[ERROR READING FILE: ${err}]` });
        }
      }
    }
  }

  return results;
}

// Run
const files = getAllFiles(srcFolder);

let output = "";
files.forEach(file => {
  output += `\n\n==== ${file.path} ====\n`;
  output += file.content;
});

fs.writeFileSync(outputFile, output, "utf-8");
console.log(`All frontend files saved to: ${outputFile}`);