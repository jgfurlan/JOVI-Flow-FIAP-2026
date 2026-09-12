# Especificação de Produto: JOVI-115 — Implementação Funcional Completa

**Tarefa:** `JOVI-115` — https://app.clickup.com/t/JOVI-115  
**Data:** 2026-09-12  
**Status:** Em Progresso  
**Depende de:** `JOVI-108`, `JOVI-109`, `JOVI-110`, `JOVI-111`, `JOVI-112`, `JOVI-113`, `JOVI-114`  

---

## 1. Sumário

Esta especificação aborda e soluciona definitivamente todas as lacunas funcionais, inconsistências com o modelo de dados e botões inoperantes da aplicação web JOVI Flow. Com esta entrega, o projeto atinge 100% de maturidade operacional:
- A Galeria Bento ganha modo de seleção real (`#btn-select`) e habilitação dinâmica do botão de compartilhamento em lote (`#btn-share`).
- O banco de dados IndexedDB (`JOVIFlowDB`) passa a materializar fisicamente as tabelas `midia` e `metadados` com relacionamento 1:0..1 e exclusão atômica em cascata, eliminando qualquer divergência com o MER da apresentação.
- A tela de detalhes ganha sistema real de adição e remoção de tags (`#btn-add-tag`), persistido em `metadados`.
- O compartilhamento passa a suportar a `Web Share API` nativa e download direto do arquivo `.jpg`.
- A câmera ganha clarão visual de tela (Screen Flash) funcional em qualquer navegador, e a miniatura da galeria carrega a última captura já no início da sessão.

---

## 2. Problema

1. **Botões inoperantes na interface:**
   - `#btn-select` não possuía listener de clique nem estado visual de seleção.
   - `#btn-share` na galeria permanecia perpetuamente desabilitado.
   - `#btn-add-tag` na tela de detalhes não executava nenhuma ação.
2. **Divergência entre o MER apresentado e o IndexedDB:**
   - O PDF e as diretrizes prometem duas tabelas físicas normalizadas (`MIDIA` e `METADADOS`), mas o código persistia um único objeto monolítico em `jovi-flow-media`.
3. **Compartilhamento limitado e propenso a erros:**
   - O compartilhamento para Instagram tentava copiar Base64 bruto, e a Clipboard API falhava em contextos locais `file://` sem HTTPS.
   - Não havia opção de download direto do arquivo de imagem capturado.
4. **Miniatura cinza na inicialização da câmera:**
   - O botão `#btn-gallery-thumb` iniciava vazio mesmo com imagens prévias persistidas no banco.
5. **Flash não-funcional em desktops/navegadores padrão:**
   - A dependência exclusiva da API experimental `torch` do hardware deixava o flash inoperante em quase todos os testes.

---

## 3. Metas e Não-Metas

- **Metas:**
  - Implementar o modo de seleção na galeria com checkboxes interativos e ativação dinâmica de `#btn-share`.
  - Estruturar o `JOVIFlowDB` com dois object stores: `midia` e `metadados`, vinculados por `midia_id` com exclusão em cascata.
  - Implementar modal/pílula de tags na tela de detalhes com persistência no IndexedDB e exibição na galeria.
  - Integrar a `Web Share API` com fallback universal para download direto de imagem JPEG.
  - Adicionar simulação visual de Flash de tela (White Screen Flash) com controle liga/desliga no `#btn-flash`.
  - Carregar a foto mais recente na miniatura da câmera durante o `init()`.
  - Manter 100% de conformidade com as restrições de tecnologia (HTML, CSS/Tailwind, Vanilla JS, zero dependências externas).
- **Não-Metas:**
  - Introduzir frameworks externos como React, Vue ou bibliotecas de terceiros (o código permanece estritamente Vanilla ES6).
  - Quebrar compatibilidade com avaliações locais via `file://`.

---

## 4. Experiência do Usuário e Invariantes Testáveis

1. **Modo de Seleção na Galeria:**
   - Ao tocar em `Selecionar` (`#btn-select`), o texto muda para `Cancelar`, e os cards exibem seletores de marcação.
   - Selecionar fotos atualiza o botão `#btn-share` no rodapé (ex.: `Compartilhar (2)`).
   - Clicar em `Compartilhar` com itens selecionados abre a tela de compartilhamento ou aciona a Web Share API.
2. **Modelo de Dados Relacional no IndexedDB:**
   - Ao salvar foto, grava o binário em `midia` e atributos analíticos em `metadados` (`midia_id`, `sharpness_score`, `category`, `aura_light_sim`, `tags`).
   - Ao excluir uma foto, a exclusão remove tanto o registro em `midia` quanto os metadados associados.
3. **Tags Rápidas nos Detalhes:**
   - Clicar em `#btn-add-tag` abre um seletor com tags contextuais (*Retrato, Noite, Produto, Favorita*) ou campo de texto.
   - Tags selecionadas aparecem como chips visuais na tela de detalhes e nos cards da galeria.
4. **Compartilhamento Confiável:**
   - Tocar em qualquer opção de compartilhamento oferece a Web Share API se suportada, ou opção de baixar o arquivo `.jpg` diretamente no dispositivo.
5. **Flash da Câmera:**
   - Tocar em `#btn-flash` alterna os modos. Se ativo, um flash branco cobre o visor durante o clique do obturador.
6. **Miniatura Inicial:**
   - Ao abrir o app, se houver fotos salvas, o thumbnail exibe a imagem mais recente.

---

## 5. Critérios de Sucesso

- Zero botões sem funcionalidade na interface.
- Stores `midia` e `metadados` visíveis e verificáveis no DevTools IndexedDB.
- Testes automatizados headless (`npm test`) passando 100% verde.
- Empacotamento do ZIP (`npm run zip`) e PDF (`npm run pdf`) atualizados e consistentes.
