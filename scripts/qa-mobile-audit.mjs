#!/usr/bin/env node

/**
 * JOVI Flow — Suíte de Auditoria e QA Mobile-First (JOVI-114)
 * 
 * Executa verificações automatizadas headless via Puppeteer:
 * 1. Meta tag viewport sem restrições a11y (drop user-scalable=no).
 * 2. Multi-viewport audit (360x640, 390x844, 428x926) em todas as 5 telas.
 * 3. Zero overflow horizontal em todas as combinações de tela e viewport.
 * 4. Touch targets com dimensão mínima de 48x48px para todos os elementos interativos.
 * 5. Conformidade com prefers-reduced-motion: reduce.
 * 6. Orçamento de performance: loop de captura e persistência < 200ms.
 * 7. Zero erros de console e zero requisições externas (100% offline).
 */

import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const POC_HTML_PATH = 'file://' + path.resolve(__dirname, '../src/poc/index.html');

const VIEWPORTS = [
    { name: 'Android Compacto (Galaxy S / Padrão)', width: 360, height: 640 },
    { name: 'iPhone 12/13/14 / Padrão Moderno', width: 390, height: 844 },
    { name: 'iPhone Pro Max / Telas Grandes', width: 428, height: 926 }
];

const SCREENS = ['splash', 'camera', 'gallery', 'detail', 'share'];

let totalAssertions = 0;
let passedAssertions = 0;
const failures = [];

function assert(condition, message, details = '') {
    totalAssertions++;
    if (condition) {
        passedAssertions++;
        console.log(`  ✓ ${message}`);
    } else {
        failures.push({ message, details });
        console.error(`  ✗ FALHA: ${message} ${details ? '(' + details + ')' : ''}`);
    }
}

async function runAudit() {
    console.log('===========================================================');
    console.log('🚀 JOVI Flow — Auditoria e QA Mobile-First (JOVI-114)');
    console.log('===========================================================\n');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--allow-file-access-from-files'
        ]
    });

    try {
        const page = await browser.newPage();

        // 1. Auditoria de Console e Requisições
        const consoleErrors = [];
        const externalRequests = [];

        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        page.on('pageerror', err => {
            consoleErrors.push(err.message);
        });

        page.on('request', req => {
            const url = req.url();
            if (!url.startsWith('file://') && !url.startsWith('data:')) {
                externalRequests.push(url);
            }
        });

        // 2. Carregamento Inicial & Viewport Meta Check
        console.log('📋 [1/5] Verificação de Acessibilidade & Meta Viewport');
        await page.setViewport(VIEWPORTS[0]);
        await page.goto(POC_HTML_PATH, { waitUntil: 'load' });

        const viewportMeta = await page.evaluate(() => {
            const meta = document.querySelector('meta[name="viewport"]');
            return meta ? meta.getAttribute('content') : null;
        });

        assert(
            viewportMeta !== null,
            'Tag meta viewport está presente no <head>'
        );
        assert(
            viewportMeta.includes('width=device-width'),
            'Meta viewport define width=device-width'
        );
        assert(
            !viewportMeta.includes('user-scalable=no'),
            'Meta viewport NÃO bloqueia zoom (sem user-scalable=no)'
        );
        assert(
            !viewportMeta.includes('maximum-scale'),
            'Meta viewport NÃO limita escala máxima (sem maximum-scale)'
        );

        // Aguarda transição inicial da splash para câmera
        await new Promise(r => setTimeout(r, 2200));

        // 3. Multi-Viewport & Overflow & Touch Targets
        console.log('\n📱 [2/5] Testes de Viewport, Overflow Zero e Touch Targets (≥ 48x48px)');

        for (const vp of VIEWPORTS) {
            console.log(`\n  --- Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
            await page.setViewport(vp);
            await new Promise(r => setTimeout(r, 150));

            // Testa zero overflow em todas as telas
            for (const screenId of SCREENS) {
                await page.evaluate((id) => {
                    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
                    const target = document.getElementById(`screen-${id}`);
                    if (target) target.classList.add('active');
                }, screenId);

                await new Promise(r => setTimeout(r, 100));

                const overflowCheck = await page.evaluate(() => {
                    const scrollW = document.documentElement.scrollWidth;
                    const innerW = window.innerWidth;
                    const bodyScrollW = document.body.scrollWidth;
                    return {
                        hasOverflow: scrollW > innerW || bodyScrollW > innerW,
                        scrollW,
                        innerW,
                        bodyScrollW
                    };
                });

                assert(
                    !overflowCheck.hasOverflow,
                    `Tela [${screenId}] possui zero overflow horizontal`,
                    `scrollWidth: ${overflowCheck.scrollW}px, innerWidth: ${overflowCheck.innerW}px`
                );
            }

            // Retorna para tela da câmera para testar os controles
            await page.evaluate(() => {
                document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
                document.getElementById('screen-camera')?.classList.add('active');
            });
            await new Promise(r => setTimeout(r, 100));

            // Auditoria de Touch Targets em todos os botões visíveis
            const touchTargets = await page.evaluate(() => {
                const results = [];
                const buttons = document.querySelectorAll('button, .camera-suggestion-pill, .btn-gallery-thumb');
                buttons.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    const style = window.getComputedStyle(el);
                    const isVisible = rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
                    if (isVisible) {
                        results.push({
                            id: el.id || el.className,
                            width: Math.round(rect.width),
                            height: Math.round(rect.height),
                            meetsTarget: rect.width >= 48 && rect.height >= 48
                        });
                    }
                });
                return results;
            });

            let allTargetsValid = true;
            const invalidList = [];
            touchTargets.forEach(t => {
                if (!t.meetsTarget) {
                    allTargetsValid = false;
                    invalidList.push(`${t.id}: ${t.width}x${t.height}px`);
                }
            });

            assert(
                allTargetsValid,
                `Todos os alvos de toque interativos têm dimensão mínima de 48x48px`,
                invalidList.length > 0 ? `Sub-48px: ${invalidList.join(', ')}` : `Total checados: ${touchTargets.length}`
            );
        }

        // 4. Auditoria de Preferência de Movimento Reduzido (prefers-reduced-motion)
        console.log('\n🎭 [3/5] Verificação de Prefers-Reduced-Motion (Acessibilidade)');
        await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

        const reducedMotionCSS = await page.evaluate(() => {
            const spinner = document.querySelector('.spinner');
            const spark = document.querySelector('.performance-spark');
            const pill = document.querySelector('.camera-suggestion-pill');
            
            const getAnim = el => el ? window.getComputedStyle(el).animationName : 'none';
            const getTrans = el => el ? window.getComputedStyle(el).transitionDuration : '0s';

            return {
                spinnerAnim: getAnim(spinner),
                sparkAnim: getAnim(spark),
                pillTrans: getTrans(pill)
            };
        });

        assert(
            reducedMotionCSS.spinnerAnim === 'none',
            'Animação do spinner desativada sob prefers-reduced-motion'
        );
        assert(
            reducedMotionCSS.sparkAnim === 'none',
            'Animação de pulso da spark desativada sob prefers-reduced-motion'
        );

        // Retorna media features ao padrão
        await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);

        // 5. Orçamento de Performance: Capture-to-Save Loop < 200ms
        console.log('\n⚡ [4/5] Benchmark de Performance: Loop de Captura e Persistência (<200ms)');

        // Assegura que está na tela da câmera
        await page.evaluate(() => {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('screen-camera')?.classList.add('active');
        });
        await new Promise(r => setTimeout(r, 200));

        const tStart = performance.now();
        await page.click('#btn-capture');

        // Aguarda a exibição do badge de latência
        await page.waitForSelector('#perf-latency-badge:not(.d-none)', { timeout: 3000 });
        const tEnd = performance.now();
        const wallClockTime = Math.round(tEnd - tStart);

        const latencyBadgeText = await page.evaluate(() => {
            return document.getElementById('perf-latency-badge')?.textContent || '';
        });

        console.log(`  ℹ Badge de latência renderizado: "${latencyBadgeText}"`);
        console.log(`  ℹ Tempo de ciclo ponta a ponta medido: ${wallClockTime}ms`);

        const match = latencyBadgeText.match(/(\d+)ms/);
        const measuredMs = match ? parseInt(match[1], 10) : wallClockTime;

        assert(
            measuredMs < 200,
            `Latência de processamento e gravação em IndexedDB < 200ms`,
            `Medido no badge: ${measuredMs}ms (Meta: <200ms)`
        );

        assert(
            measuredMs < 50,
            `Latência atende ao alvo de alto desempenho Zero-Lag (< 50ms)`,
            `Medido: ${measuredMs}ms`
        );

        // Verifica persistência real no IndexedDB
        const photoSavedInDB = await page.evaluate(async () => {
            return new Promise((resolve) => {
                const req = indexedDB.open('JOVIFlowDB', 1);
                req.onsuccess = () => {
                    const db = req.result;
                    const tx = db.transaction('jovi-flow-media', 'readonly');
                    const store = tx.objectStore('jovi-flow-media');
                    const getAll = store.getAll();
                    getAll.onsuccess = () => {
                        resolve(getAll.result.length > 0);
                    };
                    getAll.onerror = () => resolve(false);
                };
                req.onerror = () => resolve(false);
            });
        });

        assert(
            photoSavedInDB === true,
            'Foto foi gravada com sucesso no IndexedDB local'
        );

        // 6. Auditoria de Console & Dependências Externas
        console.log('\n🛡️ [5/5] Auditoria de Integridade e Isolamento Offline');

        assert(
            consoleErrors.length === 0,
            'Zero erros de console detectados durante os testes',
            consoleErrors.length > 0 ? consoleErrors.join(' | ') : 'Nenhum erro'
        );

        assert(
            externalRequests.length === 0,
            'Zero requisições de rede externas (100% autônomo e offline)',
            externalRequests.length > 0 ? externalRequests.join(' | ') : '0 requests'
        );

    } finally {
        await browser.close();
    }

    console.log('\n===========================================================');
    console.log(`📊 RESULTADO DA AUDITORIA: ${passedAssertions}/${totalAssertions} asserções passaram`);
    console.log('===========================================================');

    if (failures.length > 0) {
        console.error(`\n❌ ${failures.length} falhas detectadas:`);
        failures.forEach((f, i) => {
            console.error(`  ${i + 1}. ${f.message} ${f.details ? '(' + f.details + ')' : ''}`);
        });
        process.exit(1);
    } else {
        console.log('\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO! Qualidade Mobile-First Atestada.\n');
        process.exit(0);
    }
}

runAudit().catch(err => {
    console.error('Erro fatal durante a auditoria:', err);
    process.exit(1);
});
