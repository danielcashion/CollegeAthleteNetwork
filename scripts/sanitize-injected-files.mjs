import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

function sanitizePostcss(content) {
  const eol = getEol(content);
  const expectedContent = [
    "import { createRequire } from 'module';",
    '',
    'const require = createRequire(import.meta.url);',
    '',
    '',
    "/** @type {import('postcss-load-config').Config} */",
    'const config = {',
    '  plugins: {',
    '    tailwindcss: {},',
    '  },',
    '};',
    '',
    'export default config;',
  ].join(eol) + eol;

  if (content === expectedContent) {
    return { changed: false, content };
  }

  if (content.startsWith(expectedContent)) {
    return { changed: true, content: expectedContent };
  }

  return {
    changed: false,
    content,
    error:
      'postcss.config.mjs changed unexpectedly and no longer matches the protected baseline.',
  };
}

const protectedFiles = [
  {
    relativePath: '.gitignore',
    sanitize: sanitizeGitignore,
  },
  {
    relativePath: 'postcss.config.mjs',
    sanitize: sanitizePostcss,
  },
];

const changedFiles = [];
const erroredFiles = [];

for (const protectedFile of protectedFiles) {
  const absolutePath = path.join(repoRoot, protectedFile.relativePath);
  const originalContent = await readFile(absolutePath, 'utf8');
  const sanitizedResult = protectedFile.sanitize(originalContent);

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
