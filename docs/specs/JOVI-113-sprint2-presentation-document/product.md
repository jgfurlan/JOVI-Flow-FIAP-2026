# Especificação de Produto: JOVI-113 — Documento de Apresentação da Sprint 2

**Tarefa:** `JOVI-113` — https://app.clickup.com/t/JOVI-113  
**Fonte da Rubrica:** `docs/jovi-flow-sprint2.pdf` ("Apresentação .pdf", valor 5 pontos, nome e RM dos integrantes, modelagem de dados, mapeamento de negócio e front-end)  
**Data:** 2026-09-09  
**Status:** Em Progresso  
**Depende de:** `JOVI-108`, `JOVI-109`, `JOVI-110`, `JOVI-111`, `JOVI-112`, `JOVI-114`  

---

## 1. Sumário Executivo

A entrega da Sprint 2 do FIAP Challenge 2026 exige, além do projeto web empacotado em ZIP (15 pontos), um documento formal de apresentação em formato PDF (5 pontos). O documento não pode ser texto corrido (Word), devendo apresentar formato visual de slides profissionais com identidade visual alinhada à marca JOVI, listando expressamente os integrantes da equipe com seus respectivos RMs, o mapeamento de negócio (atendimento às dores do desafio), a modelagem de dados (MER) e a demonstração detalhada do front-end desenvolvido.

Esta especificação define o conteúdo estruturado, a narrativa estratégica e o pipeline automatizado de geração da apresentação visual em formato PDF (A4 Paisagem).

---

## 2. Problema e Requisitos da Rubrica

1. **Requisitos Obrigatórios do Edital:**
   - Formato estritamente `.pdf` em formato de slides de apresentação (não texto corrido).
   - Identificação completa da equipe: Nome e RM de todos os integrantes.
   - Apresentação do Modelo Entidade-Relacionamento (MER) e dicionário de dados (entregues na Sprint 1 e agora validados na implementação).
   - Mapeamento explícito de como a solução atende às necessidades e dores de negócio da empresa apresentadas no briefing.
   - Demonstração do front-end funcional em conformidade com as regras (HTML, CSS/Tailwind, JS Vanilla, Mobile-First, sem links externos).
2. **Diferenciais Competitivos da Avaliação:**
   - Destaque das rubricas específicas da Sprint 2:
     - "Sugestões automáticas de uso" (Pílula contextual de iluminação e banner de recomendação na galeria).
     - "Feedback visual de performance" (Badge instantâneo de latência `<50ms` e skeleton screens).
   - Evidência metrológica da auditoria Mobile-First (JOVI-114): zero overflow em 360/390/428px, touch targets ≥ 48x48px e tempo capture-to-save comprovado abaixo do orçamento de 200ms.

---

## 3. Metas e Não-Metas

- **Metas:**
  - Estruturar o documento de apresentação em 10 slides estratégicos de alto impacto visual.
  - Disponibilizar tanto o roteiro textual estruturado em Markdown (`docs/apresentacao-sprint2.md`) quanto o arquivo PDF gerado (`docs/jovi-flow-sprint2-apresentacao.pdf`).
  - Utilizar a paleta de cores oficial JOVI (Azul Royal `#0A3DFF`, Amarelo `#FFD600`, Escuro `#1A1A1A`, Branco `#FFFFFF`), tipografia Poppins e estética Liquid Glass.
  - Apresentar a equipe completa com RM 555627 (João Gabriel Furlan) e funções do time de engenharia.
- **Não-Metas:**
  - Dependência de ferramentas externas online (como Figma ou Canva fechados em nuvem) que quebrem a reprodutibilidade local.

---

## 4. Estrutura dos Slides (Roteiro em PT-BR)

1. **Slide 1: Capa Oficial**
   - Título: JOVI Flow — A Câmera Web de Próxima Geração
   - Subtítulo: Entrega Sprint 2: Implementação Front-End Mobile-First (3 Toques)
   - Integrantes, RMs, Turma 1TDS, FIAP Challenge 2026.
2. **Slide 2: O Desafio & Proposta de Valor**
   - O problema da experiência de câmera mobile e a proposta do JOVI Flow: 100% Web, zero atrito de app store, mobile-first e preservação de bateria.
3. **Slide 3: Mapeamento de Necessidades de Negócio (As 5 Dores)**
   - Tabela comparativa correlacionando as 5 dores levantadas no briefing da JOVI com os recursos front-end implementados.
4. **Slide 4: Modelo Entidade-Relacionamento (MER) & Armazenamento Local**
   - Diagrama do MER (MIDIA 1:0..1 METADADOS), justificativa arquitetural e integração física com o IndexedDB (`JOVIFlowDB`).
5. **Slide 5: Dicionário de Dados & Integridade Referencial**
   - Atributos detalhados (id, data, createdAt, sharpness_score, category, aura_light_sim, orientation) e exclusão atômica por ID.
6. **Slide 6: Arquitetura Técnica do Front-End (Escopo Estrito)**
   - Tecnologias do escopo: HTML5 semântico, CSS3 + Tailwind v4 híbrido (`@theme` + Liquid Glass), Vanilla JavaScript ES6 modular, Canvas API e View Transitions API.
7. **Slide 7: Jornada de 3 Toques & Design Interativo**
   - Toque 1: Câmera com Aura Shutter e presets térmicos.
   - Toque 2: Galeria Bento inteligente com classificação Laplacian e skeletons.
   - Toque 3: Compartilhamento rápido em redes e clipboard com Optimistic UI.
8. **Slide 8: Atendimento aos Diferenciais da Rubrica**
   - "Sugestões automáticas de uso" (Pílula contextual na câmera + banner na galeria).
   - "Feedback visual de performance" (Badge de latência em tempo real + feedback tátil/haptic).
9. **Slide 9: Evidências de QA & Auditoria Mobile-First (JOVI-114)**
   - Relatório da auditoria headless automatizada (29/29 checks verdes): conformidade em viewports 360, 390 e 428px, zero overflow, touch targets ≥ 48x48px e latência média de 16-19ms (<200ms).
10. **Slide 10: Resumo de Conformidade, Conclusão & Entregáveis**
    - Checklist final: ZIP de 50 KB autônomo, execução offline sem câmera física via Modo Demo, prontidão total para avaliação dos professores.
