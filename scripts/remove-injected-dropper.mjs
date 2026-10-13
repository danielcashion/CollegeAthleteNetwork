import { readFile, unlink, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dropperPaths = ["api.js", "branch_structure.json"];
const pushing = process.argv.includes("--push");

function git(args) {
  return spawnSync("git", args, { cwd: repoRoot, encoding: "utf8" });
}

let changed = false;

for (const relativePath of dropperPaths) {
  const absolutePath = path.join(repoRoot, relativePath);
  const tracked = git(["ls-files", "--error-unmatch", "--", relativePath]).status === 0;
  if (tracked) {
    const removed = git(["rm", "-f", "--ignore-unmatch", "--", relativePath]);
    if (removed.status !== 0) {
      console.error(removed.stderr.trim() || `Could not remove ${relativePath}`);
      process.exit(1);
    }
    changed = true;
  }
  try {
    await unlink(absolutePath);
    changed = true;
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

const packagePath = path.join(repoRoot, "package.json");
const packageContent = await readFile(packagePath, "utf8");
if (packageContent.includes("node api.js")) {
  await writeFile(packagePath, packageContent.replaceAll("node api.js && ", ""));
  const staged = git(["add", "--", "package.json"]);
  if (staged.status !== 0) {
    console.error(staged.stderr.trim() || "Could not stage package.json");
    process.exit(1);
  }
  changed = true;
}

if (!pushing || !changed) {
  if (changed) console.log("Removed injected api.js before the commit.");
  process.exit(0);
}

const dirty = git(["status", "--porcelain", "--", ...dropperPaths, "package.json"]);
if (dirty.status !== 0) {
  console.error(dirty.stderr.trim() || "Could not check the working tree.");
  process.exit(1);
}
if (dirty.stdout.trim()) {
  console.error("Removed injected api.js before push. Commit that removal, then push again.");
  process.exit(10);
}

process.exit(0);
