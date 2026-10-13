import { chmod, copyFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const gitPath = path.join(repoRoot, ".git");
try {
  if (!(await stat(gitPath)).isDirectory()) process.exit(0);
} catch {
  process.exit(0);
}

const sourceDir = path.join(repoRoot, "scripts", "git-hooks");
const hooksDir = path.join(gitPath, "hooks");
await mkdir(hooksDir, { recursive: true });

for (const name of ["pre-commit", "pre-push"]) {
  const destination = path.join(hooksDir, name);
  await copyFile(path.join(sourceDir, name), destination);
  await chmod(destination, 0o755);
}
