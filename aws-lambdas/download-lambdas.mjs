import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import AdmZip from 'adm-zip';

// Dynamically uses the folder you are currently running the script from
const TARGET_DIR = process.cwd();
const SEARCH_TERM = "athletenetwork";

/**
 * Executes an AWS CLI command and parses the JSON response
 */
function runAwsCli(command) {
  try {
    const output = execSync(command, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
    return JSON.parse(output);
  } catch (error) {
    console.error(`❌ AWS CLI Error: ${error.message}`);
    return null;
  }
}

/**
 * Downloads a binary file from a presigned S3 URL
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

/**
 * Discovers lambdas matching SEARCH_TERM (filtered in JS)
 */
function getMatchingLambdas(term) {
  console.log(`🔎 Searching AWS for functions with '${term}' in the name...`);
  
  const command = `aws lambda list-functions --query "Functions[].FunctionName" --output json`;
  const allFunctions = runAwsCli(command);

  if (!allFunctions) return [];

  return allFunctions.filter(name => 
    name.toLowerCase().includes(term.toLowerCase())
  );
}

async function processLambda(functionName) {
  console.log(`\n📦 Processing Lambda: ${functionName}`);
  
  const meta = runAwsCli(`aws lambda get-function --function-name ${functionName}`);
  if (!meta) return;

  const downloadUrl = meta.Code?.Location;
  const handlerSetting = meta.Configuration?.Handler || "index.handler";
  const handlerStem = handlerSetting.split('.')[0]; // e.g., "index" from "index.handler"

  if (!downloadUrl) {
    console.log(`⚠️ No deployment package location found for ${functionName}`);
    return;
  }

  const functionDir = path.join(TARGET_DIR, functionName);
  const tempZipPath = path.join(TARGET_DIR, `${functionName}_temp.zip`);

  try {
    console.log(`  📥 Downloading deployment archive...`);
    await downloadFile(downloadUrl, tempZipPath);

    fs.mkdirSync(functionDir, { recursive: true });
    const zip = new AdmZip(tempZipPath);
    const zipEntries = zip.getEntries();

    let handlerExtracted = false;
    let packageJsonExtracted = false;

    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;

      // Ensure file is in the ROOT of the zip archive (ignoring node_modules / subfolders)
      const isRootFile = !entry.entryName.includes('/') && !entry.entryName.includes('\\');
      if (!isRootFile) continue;

      const ext = path.extname(entry.entryName);
      const fileNameWithoutExt = path.basename(entry.entryName, ext);

      // 1. Extract root package.json if present
      if (entry.entryName === 'package.json') {
        const destFile = path.join(functionDir, 'package.json');
        fs.writeFileSync(destFile, entry.getData());
        console.log(`  ✅ Saved package.json: ${destFile}`);
        packageJsonExtracted = true;
        continue;
      }

      // 2. Match and extract root handler file (e.g., index.mjs, index.js)
      if (!handlerExtracted && fileNameWithoutExt === handlerStem && ['.mjs', '.js', '.cjs', '.ts'].includes(ext)) {
        const destFile = path.join(functionDir, entry.name);
        fs.writeFileSync(destFile, entry.getData());
        console.log(`  ✅ Saved root handler: ${destFile}`);
        handlerExtracted = true;
      }
    }

    // Fallback: If no exact root stem match was found, grab the first root JS/MJS file
    if (!handlerExtracted) {
      for (const entry of zipEntries) {
        const isRootFile = !entry.entryName.includes('/') && !entry.entryName.includes('\\');
        const ext = path.extname(entry.entryName);
        
        if (isRootFile && ['.mjs', '.js', '.ts'].includes(ext)) {
          const destFile = path.join(functionDir, entry.name);
          fs.writeFileSync(destFile, entry.getData());
          console.log(`  ✅ Saved fallback handler: ${destFile}`);
          handlerExtracted = true;
          break;
        }
      }
    }

    if (!handlerExtracted) {
      console.log(`  ⚠️ No root-level JavaScript/TypeScript handler found.`);
    }

    if (!packageJsonExtracted) {
      console.log(`  ℹ️ No root-level package.json found in the package.`);
    }

  } catch (err) {
    console.error(`  ❌ Failed processing ${functionName}:`, err.message);
  } finally {
    if (fs.existsSync(tempZipPath)) {
      fs.unlinkSync(tempZipPath);
    }
  }
}

async function main() {
  const matchingFunctions = getMatchingLambdas(SEARCH_TERM);

  if (matchingFunctions.length === 0) {
    console.log(`❓ No Lambda functions found containing "${SEARCH_TERM}".`);
    return;
  }

  console.log(`Found ${matchingFunctions.length} matching function(s):`, matchingFunctions);

  for (const fn of matchingFunctions) {
    await processLambda(fn);
  }

  console.log(`\n🎉 All matching Lambdas downloaded to ${TARGET_DIR}`);
}

main();