/**
 * Keeps `extension/manifest.json` version aligned with package.json (Chrome expects semver).
 */
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const version = pkg.version;

if (!version || typeof version !== 'string') {
  console.error('sync-version: missing package.json version');
  process.exit(1);
}

const extManifestPath = path.join(root, 'extension', 'manifest.json');
const ext = JSON.parse(readFileSync(extManifestPath, 'utf8'));
ext.version = version;
writeFileSync(extManifestPath, JSON.stringify(ext, null, 2) + '\n');
console.log('sync-version: extension/manifest.json →', version);
