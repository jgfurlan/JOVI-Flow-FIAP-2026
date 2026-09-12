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

// 1. Ensure fresh CSS compilation and presentation PDF
console.log('🔨 Step 1: Rebuilding Tailwind CSS...');
execSync('npm run css', { cwd: projectRoot, stdio: 'inherit' });

console.log('📄 Step 1.1: Rebuilding Presentation PDF...');
execSync('npm run pdf', { cwd: projectRoot, stdio: 'inherit' });

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
console.log('📂 Step 3: Staging client files with index.html and presentation PDF at root...');

// Copy index.html
fs.copyFileSync(
    path.join(srcPocDir, 'index.html'),
    path.join(stagingDir, 'index.html')
);

// Copy presentation PDF (Sprint 2 deliverable #2)
const presentationPdfSrc = path.join(projectRoot, 'docs', 'jovi-flow-sprint2-apresentacao.pdf');
if (fs.existsSync(presentationPdfSrc)) {
    fs.copyFileSync(
        presentationPdfSrc,
        path.join(stagingDir, 'jovi-flow-sprint2-apresentacao.pdf')
    );
} else {
    console.error('❌ Error: presentation PDF not found at docs/jovi-flow-sprint2-apresentacao.pdf');
    process.exit(1);
}

// Copy INSTRUCOES.txt
const instructionsContent = `========================================================================
FIAP CHALLENGE 2026 — SPRINT 2 (VALOR: 20 PONTOS)
Projeto: JOVI Flow — Câmera Web de Próxima Geração: 3 Toques & Mobile-First
Turma: 1TDSOA
Integrante: João Gabriel Furlan — RM: 57039
========================================================================

ENTREGÁVEIS INCLUÍDOS NESTE ARQUIVO ZIP:

1. PROJETO WEB (Código Implementado - 15 PONTOS)
   - Arquivo principal: index.html (localizado na raiz desta pasta).
   - Tecnologias utilizadas: APENAS HTML5, CSS3, Vanilla JavaScript e Tailwind CSS v4 (compilado localmente).
   - Zero dependências externas ou de CDN: todo o projeto (inclusive fontes Poppins) funciona 100% offline.
   - Execução: Basta abrir o arquivo 'index.html' diretamente no navegador (Chrome, Edge, Safari, Firefox) via protocolo local (file://).
   - Modo Demo: Caso o dispositivo avaliador não possua câmera física conectada ou execute via file://, a aplicação ativa automaticamente o Modo Demo com visor simulado e interativo, permitindo avaliar a jornada completa de 3 toques (Capturar -> Visualizar na Galeria Bento -> Compartilhar).

2. APRESENTAÇÃO (Documento de Apresentação - 5 PONTOS)
   - Arquivo: jovi-flow-sprint2-apresentacao.pdf (localizado na raiz desta pasta).
   - Formato: Apresentação visual em slides (A4 Paisagem, 10 slides), NÃO texto corrido.
   - Conteúdo abordado:
     • Nome, RM (57039) e turma (1TDSOA);
     • Mapeamento de como a solução atende às 5 dores de negócio do briefing da JOVI;
     • Modelo Entidade-Relacionamento (MER) e Dicionário de Dados do IndexedDB;
     • Arquitetura do front-end e tecnologias do escopo;
     • Demonstração da jornada de 3 toques e interface Liquid Glass;
     • Atendimento às rubricas da Sprint 2 ("Sugestões automáticas de uso" e "Feedback visual de performance");
     • Evidências de testes automatizados e QA mobile-first (zero overflow, touch targets >= 48px, latência < 20ms).

========================================================================
`;
fs.writeFileSync(path.join(stagingDir, 'INSTRUCOES.txt'), instructionsContent, 'utf-8');

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

// Assert index.html and presentation PDF are at the root
if (!listOutput.includes(' index.html\n') && !listOutput.includes(' index.html\r\n')) {
    console.error('❌ Error: index.html is not at the root of the ZIP archive!');
    process.exit(1);
}
if (!listOutput.includes(' jovi-flow-sprint2-apresentacao.pdf\n') && !listOutput.includes(' jovi-flow-sprint2-apresentacao.pdf\r\n')) {
    console.error('❌ Error: jovi-flow-sprint2-apresentacao.pdf is not at the root of the ZIP archive!');
    process.exit(1);
}

console.log('🎉 Verification passed! Both deliverables (Web Project + Presentation PDF) are packed and ready for platform upload.');
