#!/usr/bin/env node
/**
 * scripts/package-zip.mjs
 * 
 * Packages the JOVI Flow Sprint 2 deliverable into dist/jovi-flow-sprint2.zip.
 * Adheres strictly to the FIAP Challenge Sprint 2 rubric:
 * - Single ZIP containing only the runnable client code (HTML, CSS, JS, Tailwind assets).
 * - index.html placed at the ROOT of the zip archive for instant double-click execution on file://.
 * - Zero devDependencies, zero node_modules, zero external requests.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const srcPocDir = path.join(projectRoot, 'src', 'poc');
const distDir = path.join(projectRoot, 'dist');
const stagingDir = path.join(distDir, 'staging');
const zipFile = path.join(distDir, 'jovi-flow-sprint2.zip');

console.log('📦 [JOVI Flow] Packaging Sprint 2 ZIP deliverable...');

// 1. Ensure fresh CSS compilation
console.log('🔨 Step 1: Rebuilding Tailwind CSS...');
execSync('npm run css', { cwd: projectRoot, stdio: 'inherit' });

// 2. Prepare staging directory
console.log('🧹 Step 2: Preparing staging directory...');
if (fs.existsSync(stagingDir)) {
    fs.rmSync(stagingDir, { recursive: true, force: true });
}
if (fs.existsSync(zipFile)) {
    fs.rmSync(zipFile, { force: true });
}
fs.mkdirSync(stagingDir, { recursive: true });

// 3. Copy only shipping files (exclude input.css and dev artifacts)
console.log('📂 Step 3: Staging client files with index.html at root...');

// Copy index.html
fs.copyFileSync(
    path.join(srcPocDir, 'index.html'),
    path.join(stagingDir, 'index.html')
);

// Copy css/jovi.css
fs.mkdirSync(path.join(stagingDir, 'css'), { recursive: true });
fs.copyFileSync(
    path.join(srcPocDir, 'css', 'jovi.css'),
    path.join(stagingDir, 'css', 'jovi.css')
);

// Copy js/app.js
fs.mkdirSync(path.join(stagingDir, 'js'), { recursive: true });
fs.copyFileSync(
    path.join(srcPocDir, 'js', 'app.js'),
    path.join(stagingDir, 'js', 'app.js')
);

// Copy assets recursively
function copyDirRecursive(src, dest) {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name.startsWith('.git')) continue;
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
copyDirRecursive(path.join(srcPocDir, 'assets'), path.join(stagingDir, 'assets'));

// 4. Create ZIP archive
console.log('🗜️ Step 4: Compressing into dist/jovi-flow-sprint2.zip...');
// Using standard zip utility from within staging directory so entries have root-relative paths
execSync(`zip -r -q "${zipFile}" .`, { cwd: stagingDir });

// 5. Clean up staging directory
fs.rmSync(stagingDir, { recursive: true, force: true });

// 6. Verify ZIP archive
const stats = fs.statSync(zipFile);
const sizeKb = (stats.size / 1024).toFixed(1);
console.log(`\n✅ Successfully generated: dist/jovi-flow-sprint2.zip (${sizeKb} KB)`);

console.log('\n📋 ZIP Archive Contents:');
const listOutput = execSync(`unzip -l "${zipFile}"`, { encoding: 'utf-8' });
console.log(listOutput);

// Assert index.html is at the root
if (!listOutput.includes(' index.html\n') && !listOutput.includes(' index.html\r\n')) {
    console.error('❌ Error: index.html is not at the root of the ZIP archive!');
    process.exit(1);
}

console.log('🎉 Verification passed! The deliverable is ready for platform upload.');
