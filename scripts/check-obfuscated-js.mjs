import { readFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  analyzeJavaScript,
  formatFinding,
  shouldScanRelativePath,
} from "./lib/obfuscated-js.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const revisionFlagIndex = process.argv.indexOf("--revision");
const revision =
  revisionFlagIndex === -1 ? null : process.argv[revisionFlagIndex + 1];

function git(args) {
  return spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

function listTrackedPaths() {
  const result = git(["ls-files", "-z", "--", "*.js", "*.mjs", "*.cjs"]);
  if (result.status !== 0) {
    console.error(result.stderr.trim() || "Could not list tracked JavaScript files.");
    process.exit(1);
  }

  return result.stdout
    .split("\0")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((entry) => shouldScanRelativePath(entry));
}

function readRevisionContent(relativePath, commitSha) {
  const result = git(["show", `${commitSha}:${relativePath}`]);
  if (result.status !== 0) {
    return null;
  }
  return result.stdout;
}

async function scanWorkingTreePaths(relativePaths) {
  const findings = [];

  for (const relativePath of relativePaths) {
    const absolutePath = path.join(repoRoot, relativePath);
    let content;
    try {
      content = await readFile(absolutePath, "utf8");
    } catch {
      continue;
    }

    const analysis = analyzeJavaScript(content, relativePath);
    if (analysis.suspicious) {
      findings.push(formatFinding(relativePath, analysis));
    }
  }

  return findings;
}

function scanRevisionPaths(relativePaths, commitSha) {
  const findings = [];

  for (const relativePath of relativePaths) {
    const content = readRevisionContent(relativePath, commitSha);
    if (content === null) {
      continue;
    }

    const analysis = analyzeJavaScript(content, relativePath);
    if (analysis.suspicious) {
      findings.push(formatFinding(`${relativePath}@${commitSha.slice(0, 7)}`, analysis));
    }
  }

  return findings;
}

const relativePaths = listTrackedPaths();
const findings = revision
  ? scanRevisionPaths(relativePaths, revision)
  : await scanWorkingTreePaths(relativePaths);

if (findings.length === 0) {
  console.log("No obfuscated JavaScript detected.");
  process.exit(0);
}

console.error("Obfuscated or injected JavaScript detected:");
console.error(findings.join("\n"));
process.exit(1);
