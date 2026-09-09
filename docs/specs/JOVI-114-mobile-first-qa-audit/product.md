# Especificação de Produto: JOVI-114 — Auditoria e QA Mobile-First

**Tarefa:** `JOVI-114` — https://app.clickup.com/t/JOVI-114  
**Fonte da Rubrica:** `docs/jovi-flow-sprint2.pdf` ("Mobile First, com foco total na experiência mobile", "Feedback visual de performance", usabilidade e acessibilidade)  
**Data:** 2026-09-09  
**Status:** Em Progresso  
**Depende de:** `JOVI-108`, `JOVI-109`, `JOVI-110`, `JOVI-111`, `JOVI-112`  

---

## 1. Sumário Executivo

O JOVI Flow é uma aplicação 100% web projetada sob a filosofia *Mobile-First*. Para a entrega final da Sprint 2 do FIAP Challenge 2026, é mandatório garantir conformidade rigorosa com usabilidade móvel, acessibilidade física (touch targets confortáveis), adaptabilidade a múltiplos tamanhos de tela de smartphones modernos e comprovação metrológica do orçamento de performance (<200ms para o loop de captura e persistência).

Esta especificação define a bateria de testes automatizados headless (via Puppeteer) e as correções cirúrgicas de layout/acessibilidade necessárias para certificar que o JOVI Flow atende a 100% dos requisitos em qualquer aparelho.

---

## 2. Problema

1. **Touch Targets limítrofes:** O token `--touch-target` estava definido em `44px` (padrão iOS legado), enquanto as diretrizes modernas de acessibilidade (WCAG 2.2 / Google Lighthouse / Material Design) exigem uma área de toque mínima recomendada de `48×48px`.
2. **Restrição de zoom (Acessibilidade WCAG 1.4.4):** A tag meta viewport continha `maximum-scale=1.0, user-scalable=no`, o que impede o usuário com baixa visão de utilizar zoom no navegador, configurando uma violação de acessibilidade.
3. **Ausência de validação automatizada contínua multi-viewport:** Era necessário ter uma suíte de testes headless cobrindo os 3 viewports padrão de mercado (360×640, 390×844 e 428×926) para atestar a ausência de rolagem horizontal (zero overflow) em todas as 5 telas.
4. **Comprovação empírica do orçamento de performance (<200ms):** A tese do projeto alega latência imperceptível no loop completo (captura de frame → processamento Laplacian de nitidez → persistência no IndexedDB → atualização de UI). É necessário auditar e registrar que essa latência permanece consistentemente abaixo de 200ms.

---

## 3. Metas e Não-Metas

- **Metas:**
  - Garantir tamanho mínimo de toque de 48×48px para todos os elementos interativos primários e secundários.
  - Remover `user-scalable=no` e `maximum-scale=1.0` da meta tag de viewport em `index.html`.
  - Criar suíte de testes automatizados headless com Puppeteer cobrindo:
    - Viewports: 360×640 (Android compacto), 390×844 (iPhone padrão), 428×926 (iPhone Max / telas grandes).
    - Verificação de overflow horizontal em 100% das telas (`scrollWidth <= innerWidth`).
    - Validação de conformidade com `prefers-reduced-motion: reduce`.
    - Medição do loop completo de captura e persistência em IndexedDB assegurando tempo < 200ms.
  - Adicionar script `npm test` no `package.json` para execução reprodutível em CI e local.
- **Não-Metas:**
  - Refatorar a arquitetura visual Liquid Glass ou alterar fluxos da jornada de 3 toques.
  - Adicionar dependências externas em tempo de execução (o protótipo em `src/poc/` continua 100% autossuficiente e offline).

---

## 4. Experiência do Usuário e Invariantes Testáveis

1. **Invariante de Viewport e Zoom:**
   - `<meta name="viewport" content="width=device-width, initial-scale=1.0">` permite redimensionamento sem forçar layout quebrado.
2. **Invariante de Touch Targets (≥ 48×48px):**
   - Botões de controle de câmera (`#btn-flash`, `#btn-settings`, `#btn-switch-camera`, `#btn-gallery-thumb`), o botão obturador (`#btn-capture`, 64×64px), botão voltar (`#btn-back-camera`, `#btn-back-gallery`, `#btn-back-detail`), botão de exclusão (`#btn-delete`), botão de seleção (`#btn-select`), opções de compartilhamento e pílulas interativas devem apresentar bounding box navegável de no mínimo 48×48px.
3. **Invariante de Overflow Zero:**
   - Em todas as resoluções testadas (360px, 390px, 428px), em todas as 5 telas ativas (`splash`, `camera`, `gallery`, `detail`, `share`), o `document.documentElement.scrollWidth` deve ser estritamente igual ou inferior a `window.innerWidth`.
4. **Invariante de Movimento Reduzido (`prefers-reduced-motion`):**
   - Quando ativado, animações de rotação, pulsações e loops de renderização de canvas contínuos cessam, mantendo o frame estático para poupar carga sensorial e processamento.
5. **Invariante de Performance (<200ms):**
   - O tempo decorrido desde o acionamento de captura até a confirmação de escrita assíncrona no IndexedDB e emissão do feedback visual deve ser rigorosamente inferior a 200ms (típico: 15ms a 50ms).

---

## 5. Critérios de Sucesso

- Suíte de auditoria headless executável via `npm test` finaliza com código de saída 0 e relatório verde.
- 0 erros no console durante todo o ciclo de vida da aplicação.
- Arquivo ZIP empacotado (`npm run zip`) continua sem dependências externas e leve.
