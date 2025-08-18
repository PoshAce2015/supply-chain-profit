/* Blocks commits that change testIds without explicit message */
const { execSync } = require("child_process");

try {
  const diff = execSync("git diff --cached --name-only").toString();
  if (diff.includes("src/testing/testIds.ts")) {
    const msg = execSync('git log -1 --pretty=%B').toString();
    if (!/BREAKING-TESTID/i.test(msg)) {
      console.error("\n⛔ Changing testIds requires commit message to include: BREAKING-TESTID\n");
      process.exit(1);
    }
  }
} catch {
  process.exit(1);
}
