import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Remove all comments from a JavaScript/TypeScript file while preserving content in strings
 */
function removeComments(content) {
  // Split content into lines to process line by line
  const lines = content.split('\n');
  const result = [];

  let inString = false;
  let stringChar = '';
  let inMultiLineComment = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let processedLine = '';
    let j = 0;

    while (j < line.length) {
      const char = line[j];
      const nextChar = line[j + 1] || '';

      // Handle string literals
      if (!inMultiLineComment && !inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
        processedLine += char;
        j++;
        continue;
      }

      if (inString && char === stringChar && line[j - 1] !== '\\') {
        inString = false;
        stringChar = '';
        processedLine += char;
        j++;
        continue;
      }

      // Handle multi-line comments
      if (!inString && char === '/' && nextChar === '*') {
        inMultiLineComment = true;
        j += 2;
        continue;
      }

      if (inMultiLineComment && char === '*' && nextChar === '/') {
        inMultiLineComment = false;
        j += 2;
        continue;
      }

      // Handle single-line comments
      if (!inString && !inMultiLineComment && char === '/' && nextChar === '/') {
        // Remove the rest of the line
        break;
      }

      // Add character if not in comment
      if (!inMultiLineComment) {
        processedLine += char;
      }

      j++;
    }

    // Only add non-empty lines
    if (processedLine.trim() || inString) {
      result.push(processedLine);
    }
  }

  // Join lines and clean up extra whitespace
  let finalContent = result.join('\n');

  // Remove multiple consecutive empty lines
  finalContent = finalContent.replace(/\n\s*\n\s*\n/g, '\n\n');

  return finalContent.trim() + '\n';
}

/**
 * Process all .ts and .js files in a directory recursively
 */
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules and other common directories
      if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
        processDirectory(fullPath);
      }
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.js'))) {
      console.log(`Processing: ${fullPath}`);
      const content = fs.readFileSync(fullPath, 'utf8');
      const cleanedContent = removeComments(content);
      fs.writeFileSync(fullPath, cleanedContent, 'utf8');
    }
  }
}

// Start processing from src directory
const srcPath = path.join(__dirname, 'src');
console.log('Starting comment removal from backend src files...');
processDirectory(srcPath);
console.log('Comment removal completed!');