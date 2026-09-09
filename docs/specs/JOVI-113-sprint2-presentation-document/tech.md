# Especificação Técnica: JOVI-113 — Documento de Apresentação da Sprint 2

**Tarefa:** `JOVI-113` — https://app.clickup.com/t/JOVI-113  
**Data:** 2026-09-09  
**Status:** Em Progresso  
**Correspondente de Produto:** `docs/specs/JOVI-113-sprint2-presentation-document/product.md`  

---

## 1. Contexto Atual e Entregáveis da Sprint 1

- O documento da Sprint 1 foi compilado como `docs/jovi-flow-sprint1.pdf` (10 slides A4 paisagem, cobrindo Negócio, MER, Dicionário de Dados e Protótipo).
- Para a Sprint 2, o edital exige a apresentação formal em formato `.pdf` (não texto corrido Word), valendo 5 pontos na composição da nota.
- O projeto possui ambiente Node.js com Puppeteer já configurado, permitindo geração determinística de PDFs com pixel-perfection e fidelidade visual aos tokens de design do JOVI Flow.

---

## 2. Estratégia de Implementação

### 2.1 Fonte Estruturada em Markdown (`docs/apresentacao-sprint2.md`)
- Documento completo em Português (PT-BR) contendo a íntegra dos 10 slides, textos explicativos, tabelas de dados e justificativas arquiteturais.

### 2.2 Gerador Automatizado de Slides em PDF (`scripts/generate-presentation-pdf.mjs`)
- Cria template HTML estilizado com proporção de slide 16:9 / A4 Paisagem (842pt x 595pt), utilizando tipografia Poppins embutida localmente, cartões Liquid Glass, paleta de cores da JOVI, badges de métricas e diagrama visual do MER.
- Utiliza o Puppeteer para renderizar cada slide em uma página do PDF com `page.pdf({ format: 'A4', landscape: true, printBackground: true })`.
- Salva o arquivo final em `docs/jovi-flow-sprint2-apresentacao.pdf`.

### 2.3 Comando no `package.json`
- Adiciona `"pdf": "node scripts/generate-presentation-pdf.mjs"` aos scripts do `package.json`.

---

## 3. Checklist Passo a Passo

- [ ] Criar branch `JOVI-113-sprint2-presentation-document` (já criada).
- [ ] Escrever `docs/apresentacao-sprint2.md` com os 10 slides completos em PT-BR.
- [ ] Criar `scripts/generate-presentation-pdf.mjs` com design em formato de slides profissionais.
- [ ] Configurar script `"pdf"` no `package.json`.
- [ ] Executar a compilação do PDF via `npm run pdf`.
- [ ] Inspecionar o PDF gerado (`pdfinfo`, número de páginas, integridade visual).
- [ ] Executar auditoria de integridade (`npm test` e `npm run zip`).
