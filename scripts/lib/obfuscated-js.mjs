const SIGNATURE_PATTERNS = [
  { id: "global_bang_hook", pattern: /global\s*\[\s*['"]!/ },
  { id: "global_unicode_bang", pattern: /global\s*\[\s*"\\u0021"/ },
  { id: "shuffle_decoder_y7", pattern: /\bfunction\s+y7\s*\(/ },
  { id: "shuffle_decoder_rv", pattern: /\brv\$mIJCKYxZ\b/ },
  { id: "hex_string_array_dropper", pattern: /EtVPcVKfhHvchsbpbJRrEavgP/ },
  { id: "api_js_script_hook", pattern: /node\s+api\.js\s*&&/ },
  {
    id: "reverse_split_join",
    pattern: /\.split\s*\(\s*["'][^"']*["']\s*\)\.reverse\s*\(\)\.join/,
  },
];

const SCAN_EXTENSIONS = new Set([".js", ".mjs", ".cjs"]);
/** Signature literals live here; scanning this file would false-positive. */
const SCAN_SKIP_RELATIVE_PATHS = new Set(["scripts/lib/obfuscated-js.mjs"]);
const IGNORE_DIR_NAMES = new Set([
  "node_modules",
  ".next",
  "dist",
  "build",
  "coverage",
  ".git",
  "out",
]);

export function shouldScanRelativePath(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
  if (SCAN_SKIP_RELATIVE_PATHS.has(normalized)) {
    return false;
  }
  const segments = normalized.split("/");
  if (segments.some((segment) => IGNORE_DIR_NAMES.has(segment))) {
    return false;
  }
  const extension = pathExtension(normalized);
  return SCAN_EXTENSIONS.has(extension);
}

function pathExtension(relativePath) {
  const index = relativePath.lastIndexOf(".");
  if (index === -1) return "";
  return relativePath.slice(index);
}

export function analyzeJavaScript(content, relativePath = "") {
  const reasons = [];

  for (const { id, pattern } of SIGNATURE_PATTERNS) {
    if (
      id === "api_js_script_hook" &&
      !relativePath.replace(/\\/g, "/").endsWith("package.json")
    ) {
      continue;
    }
    if (pattern.test(content)) {
      reasons.push(id);
    }
  }

  const unicodeEscapes = content.match(/\\u[0-9a-fA-F]{4}/g);
  if (unicodeEscapes && unicodeEscapes.length >= 20) {
    reasons.push(`unicode_escapes:${unicodeEscapes.length}`);
  }

  const lines = content.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].length > 2000) {
      reasons.push(`line_length:${relativePath || "file"}:${index + 1}`);
      break;
    }
  }

  if (/export default config;[\t ]{8,}\S/.test(content)) {
    reasons.push("postcss_mjs_trailing_payload");
  }

  if (/module\.exports\s*=\s*\{[\s\S]*?\};[\t ]{8,}\S/.test(content)) {
    reasons.push("postcss_js_trailing_payload");
  }

  return {
    suspicious: reasons.length > 0,
    reasons,
  };
}

export function formatFinding(relativePath, analysis) {
  return `${relativePath}: ${analysis.reasons.join(", ")}`;
}

export { SCAN_EXTENSIONS, IGNORE_DIR_NAMES };
