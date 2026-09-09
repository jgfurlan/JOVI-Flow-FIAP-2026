# Especificação Técnica: JOVI-114 — Auditoria e QA Mobile-First

**Tarefa:** `JOVI-114` — https://app.clickup.com/t/JOVI-114  
**Data:** 2026-09-09  
**Status:** Em Progresso  
**Correspondente de Produto:** `docs/specs/JOVI-114-mobile-first-qa-audit/product.md`  

---

## 1. Contexto Atual e Referências de Código

- `src/poc/index.html:5`: Define `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">` (deve ser atualizado para remover travas de zoom).
- `src/poc/css/input.css:93`: Define `--touch-target: 44px;` (deve ser elevado para `48px`).
- `src/poc/css/input.css:426`: `.btn-text` com `min-height: var(--touch-target)` (deve receber `min-width: var(--touch-target)` e alinhamento).
- `src/poc/css/input.css:692`: `.camera-suggestion-pill` (garantir `min-height: 48px`).
- `src/poc/css/input.css:381`: `#btn-retry-camera` (garantir `min-height: 48px`).
- `src/poc/js/app.js:529`: `capturePhoto()` executa o loop de aquisição, processamento de filtro e gravação em IndexedDB medindo `performance.now()`.
- `package.json`: Possui `"puppeteer": "^25.8.0"` instalado em `devDependencies`, mas sem comando `"test"` configurado.

---

## 2. Mudanças Propostas

### 2.1 Ajustes em `src/poc/index.html`
- Substituir a meta tag viewport por `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.

### 2.2 Ajustes em `src/poc/css/input.css`
- Atualizar token `--touch-target: 48px;`.
- Adicionar `min-height: 48px` e `min-width: 48px` onde necessário para assegurar conformidade plena WCAG / Lighthouse nos elementos clicáveis (`.btn-text`, `.camera-suggestion-pill`, `#btn-retry-camera`).
- Executar `npm run css` para sincronizar o arquivo de distribuição minificado `src/poc/css/jovi.css`.

### 2.3 Script de Auditoria Automatizada `scripts/qa-mobile-audit.mjs`
- Criar script Node ESModule autônomo utilizando Puppeteer.
- Executar testes automatizados headless cobrindo:
  1. **Viewports móveis:**
     - 360×640 (Android padrão)
     - 390×844 (iPhone 12/13/14)
     - 428×926 (iPhone Max / Telas Grandes)
  2. **Verificação de Overflow:**
     - Percorrer as 5 telas (Splash, Camera, Gallery, Detail, Share) e certificar que em nenhum momento `scrollWidth > innerWidth`.
  3. **Verificação de Touch Targets (≥ 48×48px):**
     - Inspecionar bounding boxes dos botões em tela visível e atestar que altura e largura satisfazem a dimensão mínima de 48px.
  4. **Modo de Redução de Movimento (`prefers-reduced-motion: reduce`):**
     - Emular a preferência via CDP / `page.emulateMediaFeatures` e confirmar que animações CSS e requestAnimationFrame em modo demo operam em modo estático/desligado.
  5. **Orçamento de Performance (< 200ms):**
     - Disparar a captura de foto no modo demo, aguardar o salvamento no IndexedDB e inspecionar a métrica aferida pelo badge de latência (`#perf-latency-badge`), validando que permaneceu bem abaixo do teto de 200ms.
  6. **Erros de Console:**
     - Capturar mensagens de `console.error` e exceções não tratadas da página, reprovando o teste se houver qualquer falha.

### 2.4 Integração no `package.json`
- Adicionar `"test": "node scripts/qa-mobile-audit.mjs"`.

---

## 3. Checklist Passo a Passo

- [ ] Criar branch `JOVI-114-mobile-first-qa-audit` (já criada).
- [ ] Atualizar `src/poc/index.html` removendo `user-scalable=no`.
- [ ] Atualizar `src/poc/css/input.css` com `--touch-target: 48px` e regras de alvo de toque.
- [ ] Compilar CSS com `npm run css` e verificar sincronia.
- [ ] Criar `scripts/qa-mobile-audit.mjs` e configurar `"test"` em `package.json`.
- [ ] Executar `npm test` e verificar se todos os checks passam com 100% verde.
- [ ] Validar compatibilidade do empacotamento com `npm run zip`.

---

## 4. Matriz de Verificação

| Invariante | Verificação Automatizada | Critério de Aceite |
|---|---|---|
| Viewport Zoom | Verificação de tag no DOM | Sem `user-scalable=no`, `width=device-width` |
| Touch Target ≥ 48px | `getBoundingClientRect()` nos botões | Largura e Altura ≥ 48px |
| Zero Overflow | `document.documentElement.scrollWidth <= innerWidth` | True em 360, 390 e 428px |
| Movimento Reduzido | Emulação de mídia reduzida | Loops contínuos cancelados, animações zeradas |
| Orçamento de Latência | Leitura de `#perf-latency-badge` e `performance.now()` | < 200ms (alvo: < 50ms) |
| Console limpo | Listener `page.on('console')` e `page.on('pageerror')` | 0 erros |
