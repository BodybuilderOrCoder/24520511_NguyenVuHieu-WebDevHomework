// Windows workaround: some editors/shells start Node with a lower-case drive letter (`c:\...`).
// Vitest then resolves its runner twice (`c:` vs `C:`) and every suite fails with
// "Cannot read properties of undefined (reading 'config')". Re-launch Vitest from a normalised cwd.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const upperDrive = (p) => p.replace(/^[a-z]:/, (drive) => drive.toUpperCase());
const vitestBin = upperDrive(fileURLToPath(new URL('../node_modules/vitest/vitest.mjs', import.meta.url)));
const cwd = upperDrive(process.cwd());

const { status } = spawnSync(process.execPath, [vitestBin, ...process.argv.slice(2)], {
  cwd,
  stdio: 'inherit',
});
process.exit(status ?? 1);
