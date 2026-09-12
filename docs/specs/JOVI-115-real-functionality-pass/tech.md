# Especificação Técnica: JOVI-115 — Implementação Funcional Completa

**Tarefa:** `JOVI-115` — https://app.clickup.com/t/JOVI-115  
**Data:** 2026-09-12  
**Status:** Em Progresso  
**Correspondente de Produto:** `docs/specs/JOVI-115-real-functionality-pass/product.md`  

---

## 1. Contexto Atual e Referências de Código

- `src/poc/js/app.js`:
  - `openDB()`: Cria apenas o store monolítico `jovi-flow-media`. Deve ser refatorado para versionar o schema (versão 2) com os dois stores do MER: `midia` e `metadados`, incluindo índice secundário `midia_id`.
  - Linha 126: `#btn-gallery-thumb` não carrega a última foto gravada na inicialização do app.
  - `#btn-select`: Elemento presente em `index.html:87`, sem nenhum binding de evento em `app.js`.
  - `#btn-share`: Elemento em `index.html:101`, permanentemente `disabled`.
  - `#btn-add-tag`: Elemento em `index.html:122`, sem nenhum listener de clique.
  - `#btn-flash`: Linha 921 apenas tenta a API experimental de hardware `torch`, sem simulação de flash de tela.
  - `shareTo()`: Linhas 863-893 não implementam `navigator.share` com arquivo real nem download direto de imagem.

---

## 2. Mudanças Propostas

### 2.1 Schema Relacional no IndexedDB (`JOVIFlowDB`, v2)
- **Object Store `midia`**:
  - `keyPath: 'id'` (integer, timestamp).
  - Objeto: `{ id, data: base64Blob, createdAt: ISOString }`.
- **Object Store `metadados`**:
  - `keyPath: 'id'`, `autoIncrement: true`.
  - Índice: `midia_id` (`unique: true`).
  - Objeto: `{ id, midia_id, sharpness_score, category, aura_light_sim, orientation, tags }`.
- **Exclusão em Cascata (Cascade Delete)**:
  - Função `deletePhoto(photoId)` abre transação em `['midia', 'metadados']`, exclui em `midia` e localiza pelo índice `midia_id` em `metadados` para exclusão atômica.
- **Compatibilidade Retroativa**:
  - Ao subir para versão 2 do banco, registros legados existentes no store antigo são migrados automaticamente para `midia` e `metadados`.

### 2.2 Modo de Seleção e Compartilhamento na Galeria
- Estado `isSelectMode = false` e conjunto `selectedPhotoIds = new Set()`.
- `#btn-select`:
  - Alterna entre "Selecionar" e "Cancelar".
  - Exibe checkboxes nos itens da galeria.
- `#btn-share` (rodapé):
  - Habilitado dinamicamente quando `selectedPhotoIds.size > 0`.
  - Rótulo dinâmico: `Compartilhar (${selectedPhotoIds.size})`.
  - Ao clicar, direciona para o fluxo de compartilhamento com a(s) imagem(ns) selecionada(s).

### 2.3 Sistema Real de Tags na Tela de Detalhes
- Estrutura HTML/CSS para exibir tags associadas (`#detail-tags`).
- Modal ou sheet de tags rápidas (`#tag-modal`):
  - Presets: *Retrato, Noturno, Produto, Favorita, Macro*.
  - Opção de adicionar tag personalizada.
- Gravação persistente no campo `tags` da tabela `metadados`.
- Exibição de chips de tags na galeria e na tela de detalhes.

### 2.4 Flash Visual de Tela (Screen Flash)
- Elemento de overlay `#screen-flash-overlay` no viewfinder.
- Ao alternar `#btn-flash`, comuta estado `flashMode`:
  - Ligado (ícone iluminado e clarão branco de 150ms na captura).
  - Desligado (captura normal).
- Funciona 100% garantido em qualquer navegador desktop, tablet ou smartphone.

### 2.5 Compartilhamento Real e Download Direto
- Adição da opção "Baixar" (`btn-share-option` com ícone 📥).
- Converte Base64 em Blob JPEG e aciona download de arquivo físico no navegador.
- Suporte a `navigator.share` nativo com `File` quando suportado (iOS Safari, Android Chrome).

### 2.6 Carregamento de Miniatura no Início
- Na inicialização (`init()`), busca o último registro em `midia` e injeta a imagem em `.thumbnail-placeholder`.

---

## 3. Checklist de Implementação

- [ ] Atualizar `index.html` com overlay de flash, container de tags e opção de download.
- [ ] Atualizar `input.css` com estilos de seleção, tags e clarão de flash.
- [ ] Compilar CSS via `npm run css`.
- [ ] Refatorar IndexedDB em `app.js` para os stores `midia` e `metadados` com Cascade Delete.
- [ ] Implementar modo de seleção e compartilhamento na galeria em `app.js`.
- [ ] Implementar adição e persistência de tags em `app.js`.
- [ ] Implementar flash visual e download de foto em `app.js`.
- [ ] Carregar miniatura da galeria no `init()`.
- [ ] Atualizar suíte de testes `scripts/qa-mobile-audit.mjs` para validar o MER e as novas interações.
- [ ] Executar `npm test`, `npm run zip` e `npm run pdf`.
