import { access, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeJavaScript } from './lib/obfuscated-js.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');

const suspiciousGitignoreTail = [
  'branch_structure.json',
  'temp_auto_push.bat',
  'temp_interactive_push.bat',
];

function getEol(content) {
  return content.includes('\r\n') ? '\r\n' : '\n';
}

function hasFinalNewline(content) {
  return /\r?\n$/.test(content);
}

function splitContentLines(content) {
  const lines = content.split(/\r?\n/);

  if (lines.at(-1) === '') {
    lines.pop();
  }

  return lines;
}

function sanitizeGitignore(content) {
  const eol = getEol(content);
  const lines = splitContentLines(content);
  let changed = false;

  while (
    lines.length >= suspiciousGitignoreTail.length &&
    suspiciousGitignoreTail.every(
      (line, index) =>
        lines[lines.length - suspiciousGitignoreTail.length + index] === line,
    )
  ) {
    lines.splice(-suspiciousGitignoreTail.length, suspiciousGitignoreTail.length);
    changed = true;
  }

  if (!changed) {
    return { changed: false, content };
  }

  const sanitizedContent = `${lines.join(eol)}${hasFinalNewline(content) ? eol : ''}`;
  return { changed: true, content: sanitizedContent };
}

const tailwindPostcssMjs = [
  "/** @type {import('postcss-load-config').Config} */",
  'const config = {',
  '  plugins: {',
  '    tailwindcss: {},',
  '  },',
  '};',
  '',
  'export default config;',
  '',
].join('\n');

const tailwindAutoprefixerPostcssMjs = [
  "/** @type {import('postcss-load-config').Config} */",
  'const config = {',
  '  plugins: {',
  '    tailwindcss: {},',
  '    autoprefixer: {},',
  '  },',
  '};',
  '',
  'export default config;',
  '',
].join('\n');

const tailwindV4PostcssMjs = [
  'const config = {',
  '  plugins: {',
  '    "@tailwindcss/postcss": {},',
  '  },',
  '};',
  '',
  'export default config;',
  '',
].join('\n');

const tailwindAutoprefixerPostcssJs = [
  'module.exports = {',
  '  plugins: {',
  '    tailwindcss: {},',
  '    autoprefixer: {},',
  '  },',
  '};',
  '',
].join('\n');

function pickPostcssTemplate(content, isCjs) {
  if (isCjs) {
    return tailwindAutoprefixerPostcssJs;
  }
  if (content.includes('@tailwindcss/postcss')) {
    return tailwindV4PostcssMjs;
  }
  if (content.includes('autoprefixer')) {
    return tailwindAutoprefixerPostcssMjs;
  }
  return tailwindPostcssMjs;
}

function normalizeNewlines(content) {
  return content.replace(/\r\n/g, '\n').trimEnd();
}

function sanitizePostcss(content, relativePath) {
  const isCjs = relativePath.endsWith('.js');
  const template = pickPostcssTemplate(content, isCjs);
  const normalized = normalizeNewlines(content);
  const normalizedTemplate = normalizeNewlines(template);

  if (normalized === normalizedTemplate) {
    return { changed: false, content };
  }

  const analysis = analyzeJavaScript(content, relativePath);
  const hasTrailingPayload =
    /export default config;[\t ]{8,}\S/.test(content) ||
    /module\.exports\s*=\s*\{[\s\S]*?\};[\t ]{8,}\S/.test(content);

  if (!analysis.suspicious && !hasTrailingPayload) {
    return { changed: false, content };
  }

  const eol = getEol(content);
  const rewritten = `${normalizedTemplate}\n`.replace(/\n/g, eol);
  return { changed: true, content: rewritten };
}

const dropperPaths = ['api.js', 'branch_structure.json'];

async function fileExists(relativePath) {
  try {
    await access(path.join(repoRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

const protectedFileCandidates = [
  { relativePath: '.gitignore', sanitize: sanitizeGitignore },
  { relativePath: 'postcss.config.mjs', sanitize: sanitizePostcss },
  { relativePath: 'postcss.config.js', sanitize: sanitizePostcss },
];

const changedFiles = [];
const erroredFiles = [];

for (const protectedFile of protectedFileCandidates) {
  if (!(await fileExists(protectedFile.relativePath))) {
    continue;
  }

  const absolutePath = path.join(repoRoot, protectedFile.relativePath);
  const originalContent = await readFile(absolutePath, 'utf8');
  const sanitizedResult = protectedFile.sanitize(
    originalContent,
    protectedFile.relativePath,
  );

  if (sanitizedResult.error) {
    erroredFiles.push(
      `${protectedFile.relativePath}: ${sanitizedResult.error}`,
    );
    continue;
  }

  if (!sanitizedResult.changed) {
    continue;
  }

  changedFiles.push(protectedFile.relativePath);

  if (!checkOnly) {
    await writeFile(absolutePath, sanitizedResult.content, 'utf8');
  }
}

for (const relativePath of dropperPaths) {
  if (!(await fileExists(relativePath))) continue;
  changedFiles.push(relativePath);
  if (!checkOnly) {
    await unlink(path.join(repoRoot, relativePath));
  }
}

const packagePath = path.join(repoRoot, 'package.json');
const packageContent = await readFile(packagePath, 'utf8');
if (packageContent.includes('node api.js')) {
  changedFiles.push('package.json');
  if (!checkOnly) {
    await writeFile(
      packagePath,
      packageContent.replaceAll('node api.js && ', ''),
    );
  }
}

if (erroredFiles.length > 0) {
  console.error(erroredFiles.join('\n'));
  process.exit(1);
}

if (changedFiles.length === 0) {
  console.log('Protected files are clean.');
  process.exit(0);
}

if (checkOnly) {
  console.error(
    `Protected files require sanitization: ${changedFiles.join(', ')}`,
  );
  process.exit(1);
}

console.log(`Sanitized protected files: ${changedFiles.join(', ')}`);
