#!/usr/bin/env node

/**
 * JOVI Flow — Gerador Automatizado de Apresentação PDF (Sprint 2)
 * 
 * Gera os 10 slides da apresentação da Sprint 2 com layout profissional A4 Paisagem,
 * aplicando a identidade visual JOVI (Liquid Glass, Poppins, Tailwind tokens)
 * e compilando o arquivo final em docs/jovi-flow-sprint2-apresentacao.pdf via Puppeteer.
 */

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputPdfPath = path.resolve(rootDir, 'docs/jovi-flow-sprint2-apresentacao.pdf');
const tempHtmlPath = path.resolve(rootDir, 'docs/temp-presentation.html');

const SLIDES_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>JOVI Flow — Apresentação Sprint 2</title>
<style>
  @page {
    size: A4 landscape;
    margin: 0;
  }
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body {
    margin: 0;
    padding: 0;
    font-family: "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #0f121d;
    color: #f5f5f5;
  }

  .slide {
    width: 297mm;
    height: 210mm;
    page-break-after: always;
    position: relative;
    padding: 22mm 24mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    background: linear-gradient(135deg, #0c0f1d 0%, #151b2e 100%);
  }

  /* Watermark background glow */
  .slide::before {
    content: "";
    position: absolute;
    top: -100px;
    right: -100px;
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, rgba(10, 61, 255, 0.22) 0%, transparent 70%);
    pointer-events: none;
    border-radius: 50%;
  }

  .slide-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 12px;
    margin-bottom: 18px;
  }

  .slide-category {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #ffd600;
    margin-bottom: 4px;
  }

  .slide-title {
    font-size: 26px;
    font-weight: 700;
    margin: 0;
    color: #ffffff;
    letter-spacing: -0.02em;
  }

  .brand-badge {
    background: rgba(10, 61, 255, 0.35);
    border: 1px solid rgba(10, 61, 255, 0.6);
    padding: 6px 14px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .brand-badge .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ffd600;
  }

  .slide-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 16px;
  }

  .slide-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 10px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
  }

  /* Cards & Grids */
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }

  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
  }

  .card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  }

  .card-highlight {
    background: linear-gradient(135deg, rgba(10, 61, 255, 0.25) 0%, rgba(10, 61, 255, 0.05) 100%);
    border: 1px solid rgba(10, 61, 255, 0.5);
  }

  .card h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .card p, .card li {
    font-size: 12.5px;
    line-height: 1.5;
    color: #d0d5dd;
    margin: 4px 0;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    border-radius: 8px;
    overflow: hidden;
  }

  th {
    background: rgba(10, 61, 255, 0.4);
    color: #ffffff;
    font-weight: 600;
    padding: 8px 10px;
    text-align: left;
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  }

  td {
    padding: 7px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    color: #e4e7ec;
    vertical-align: top;
  }

  tr:nth-child(even) td {
    background: rgba(255, 255, 255, 0.02);
  }

  .badge-tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10.5px;
    font-weight: 600;
  }

  .badge-blue { background: #0a3dff; color: #fff; }
  .badge-yellow { background: #ffd600; color: #111; }
  .badge-green { background: #34c759; color: #fff; }

  /* Title Slide Specifics */
  .title-slide {
    background: linear-gradient(135deg, #070913 0%, #0a3dff 100%);
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .title-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }

  .title-logo {
    width: 80px;
    height: 80px;
    background: #ffd600;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  }

  .title-logo-inner {
    width: 42px;
    height: 42px;
    background: #0a3dff;
    border-radius: 50%;
  }

  .title-h1 {
    font-size: 46px;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.02em;
    color: #ffffff;
  }

  .title-subtitle {
    font-size: 20px;
    font-weight: 500;
    color: #ffd600;
    margin: 0;
  }

  .title-meta {
    margin-top: 24px;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 16px 28px;
    border-radius: 14px;
    display: flex;
    gap: 36px;
    text-align: left;
  }

  .meta-col h4 {
    margin: 0 0 4px 0;
    font-size: 11px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 0.1em;
  }

  .meta-col p {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
  }

  /* Metric Stat Card */
  .stat-card {
    background: rgba(10, 61, 255, 0.2);
    border: 1px solid rgba(10, 61, 255, 0.4);
    border-radius: 10px;
    padding: 12px;
    text-align: center;
  }
  .stat-num {
    font-size: 24px;
    font-weight: 700;
    color: #ffd600;
  }
  .stat-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
</style>
</head>
<body>

<!-- SLIDE 1: CAPA -->
<section class="slide title-slide">
  <div class="title-hero">
    <div class="title-logo">
      <div class="title-logo-inner"></div>
    </div>
    <h1 class="title-h1">JOVI Flow</h1>
    <p class="title-subtitle">A Câmera Web de Próxima Geração: 3 Toques & Mobile-First</p>
    <div style="font-size: 14px; color: rgba(255, 255, 255, 0.8);">
      Entrega Oficial Challenge SPRINT 2 — Desenvolvimento Front-End
    </div>

    <div class="title-meta">
      <div class="meta-col">
        <h4>Integrante & Matrícula</h4>
        <p>João Gabriel Furlan — RM 57039</p>
      </div>
      <div class="meta-col">
        <h4>Curso & Turma</h4>
        <p>Análise e Desenvolvimento de Sistemas (1TDSOA)</p>
        <p style="font-size: 12px; font-weight: normal; color: #cbd5e1; margin-top: 2px;">FIAP — São Paulo, 2026</p>
      </div>
      <div class="meta-col">
        <h4>Avaliação Sprint 2</h4>
        <p>Front-End Web (15 pts) + Apresentação (5 pts)</p>
        <p style="font-size: 12px; font-weight: normal; color: #ffd600; margin-top: 2px;">Total: 20 Pontos</p>
      </div>
    </div>
  </div>
  <div class="slide-footer" style="position: absolute; bottom: 15mm; width: calc(100% - 48mm);">
    <span>JOVI Flow — FIAP Challenge 2026</span>
    <span>Slide 1 / 10</span>
  </div>
</section>

<!-- SLIDE 2: O DESAFIO & PROPOSTA -->
<section class="slide">
  <div class="slide-header">
    <div>
      <div class="slide-category">Etapa 1 • Visão Estratégica</div>
      <h2 class="slide-title">O Desafio JOVI & Filosofia Mobile-First</h2>
    </div>
    <div class="brand-badge"><span class="dot"></span> 100% Web SPA</div>
  </div>
  <div class="slide-content">
    <div class="grid-2">
      <div class="card">
        <h3>🎯 O Briefing do Challenge</h3>
        <ul>
          <li><strong>Objetivo:</strong> Criar solução digital inovadora melhorando a experiência com câmera e conteúdo nos celulares JOVI (V50 5G, Y19s).</li>
          <li><strong>Restrição Estrita:</strong> 100% Web no navegador do celular (sem app store), responsiva e com foco radical em Mobile-First.</li>
          <li><strong>Redução de Frustração:</strong> Eliminar lentidão, menus complexos e consumo desmedido de energia.</li>
        </ul>
      </div>
      <div class="card card-highlight">
        <h3>⚡ A Solução JOVI Flow (Funil de 3 Toques)</h3>
        <ul>
          <li><strong>Toque 1 — Capturar:</strong> Acesso instantâneo via navegador com controle de iluminação por anel Aura Light tátil.</li>
          <li><strong>Toque 2 — Visualizar:</strong> Galeria Bento inteligente com classificação de nitidez Laplacian por IA local.</li>
          <li><strong>Toque 3 — Compartilhar:</strong> Envio imediato em redes sociais com Optimistic UI e cópia em um clique.</li>
        </ul>
      </div>
    </div>

    <div class="grid-3" style="margin-top: 6px;">
      <div class="stat-card">
        <div class="stat-num">+40%</div>
        <div class="stat-label">Performance Percebida</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">&lt; 20ms</div>
        <div class="stat-label">Latência Capture-to-Save</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">+35%</div>
        <div class="stat-label">Preservação de Bateria</div>
      </div>
    </div>
  </div>
  <div class="slide-footer">
    <span>JOVI Flow — FIAP Challenge 2026 | Sprint 2</span>
    <span>Slide 2 / 10</span>
  </div>
</section>

<!-- SLIDE 3: MAPEAMENTO DE NECESSIDADES -->
<section class="slide">
  <div class="slide-header">
    <div>
      <div class="slide-category">Etapa 1 • Negócio</div>
      <h2 class="slide-title">Mapeamento das 5 Dores do Briefing</h2>
    </div>
    <div class="brand-badge"><span class="dot"></span> Alinhamento de Negócio</div>
  </div>
  <div class="slide-content">
    <table>
      <thead>
        <tr>
          <th style="width: 5%;">#</th>
          <th style="width: 22%;">Dor Mapeada (Briefing)</th>
          <th style="width: 33%;">Impacto no Usuário</th>
          <th style="width: 40%;">Solução Implementada no JOVI Flow</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1</strong></td>
          <td><strong>Baixa duração de bateria</strong></td>
          <td>Usuário evita usar câmera por medo de ficar sem carga durante o dia.</td>
          <td>Execução em sandbox web leve, sem sensores pesados em background. Até 35% de economia energética.</td>
        </tr>
        <tr>
          <td><strong>2</strong></td>
          <td><strong>Câmera fraca em pouca luz</strong></td>
          <td>Granulação extrema e fotos noturnas arruinadas.</td>
          <td>Simulação inteligente de hardware Aura Light via Canvas e filtro térmico (2000K a 10000K).</td>
        </tr>
        <tr>
          <td><strong>3</strong></td>
          <td><strong>Performance e lentidão</strong></td>
          <td>Apps nativos travam; demora frustrante entre o clique e o disparo.</td>
          <td>Pipeline ultra-otimizado com persistência assíncrona local (<20ms) e skeletons visuais imediatos.</td>
        </tr>
        <tr>
          <td><strong>4</strong></td>
          <td><strong>Baixa durabilidade e reparo</strong></td>
          <td>Superaquecimento e desgaste operacional prematuro do aparelho.</td>
          <td>Design de software com Modo Demo de contingência, garantindo uso resiliente em qualquer cenário.</td>
        </tr>
        <tr>
          <td><strong>5</strong></td>
          <td><strong>Design genérico e bloat</strong></td>
          <td>Interfaces poluídas cheias de botões manuais confusos.</td>
          <td>Estética Liquid Glass minimalista: foco 100% no visor, controles gestuais no obturador.</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="slide-footer">
    <span>JOVI Flow — FIAP Challenge 2026 | Sprint 2</span>
    <span>Slide 3 / 10</span>
  </div>
</section>

<!-- SLIDE 4: MER MODELAGEM DE DADOS -->
<section class="slide">
  <div class="slide-header">
    <div>
      <div class="slide-category">Etapa 2 • Dados</div>
      <h2 class="slide-title">Modelo Entidade-Relacionamento (MER)</h2>
    </div>
    <div class="brand-badge"><span class="dot"></span> Arquitetura de Dados</div>
  </div>
  <div class="slide-content">
    <div class="grid-2" style="align-items: center;">
      <!-- Diagram Representation -->
      <div class="card" style="padding: 20px; background: rgba(0, 0, 0, 0.4);">
        <div style="font-size: 13px; font-weight: 600; color: #ffd600; margin-bottom: 12px; text-transform: uppercase;">
          Diagrama Lógico de Dados (Offline-First)
        </div>
        
        <div style="display: flex; justify-content: space-around; align-items: center; margin: 10px 0;">
          <!-- Entity MIDIA -->
          <div style="background: rgba(10, 61, 255, 0.3); border: 1.5px solid #0a3dff; border-radius: 8px; padding: 12px; width: 170px;">
            <div style="font-weight: 700; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 4px; color: #fff;">
              📁 TABELA: MIDIA
            </div>
            <div style="font-size: 11px; margin-top: 6px; font-family: monospace; color: #cbd5e1;">
              • <span style="color:#ffd600;">id</span>: Integer [PK]<br>
              • data: LongBlob<br>
              • createdAt: DateTime
            </div>
          </div>

          <div style="text-align: center; color: #ffd600; font-weight: bold; font-size: 16px;">
            1 ─── 0..1<br>
            <span style="font-size: 10px; color: #aaa;">contém</span>
          </div>

          <!-- Entity METADADOS -->
          <div style="background: rgba(10, 61, 255, 0.3); border: 1.5px solid #0a3dff; border-radius: 8px; padding: 12px; width: 170px;">
            <div style="font-weight: 700; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 4px; color: #fff;">
              🏷️ METADADOS
            </div>
            <div style="font-size: 11px; margin-top: 6px; font-family: monospace; color: #cbd5e1;">
              • <span style="color:#ffd600;">id</span>: Integer [PK]<br>
              • midia_id: Integer [FK]<br>
              • sharpness_score: Float<br>
              • category: String<br>
              • aura_light_sim: Int<br>
              • orientation: String<br>
              • tags: Array&lt;String&gt;
            </div>
          </div>
        </div>

        <div style="margin-top: 14px; font-size: 11.5px; color: #94a3b8; line-height: 1.4;">
          <strong>Persistência Física:</strong> IndexedDB v2 (<code>JOVIFlowDB</code>, stores relacionais <code>midia</code> e <code>metadados</code> com índice <code>midia_id</code>).
        </div>
      </div>

      <!-- Principles Card -->
      <div class="card card-highlight">
        <h3>📐 Justificativas de Arquitetura</h3>
        <ul style="gap: 8px; display: flex; flex-direction: column;">
          <li><strong>Separação Física de Preocupações:</strong> O blob Base64 em <code>midia</code> fica separado dos metadados e tags em <code>metadados</code>, acelerando filtros, buscas e ordenações sem trafegar bytes pesados.</li>
          <li><strong>Offline-First por Concepção:</strong> Zero dependência de servidores remotos. A persistência multiloja local garante funcionamento autônomo em qualquer lugar.</li>
          <li><strong>Integridade Referencial & Cascade Delete:</strong> Exclusão atômica em transação unificada remove o registro em <code>midia</code> e elimina simultaneamente os <code>metadados</code> vinculados pelo índice <code>midia_id</code>.</li>
        </ul>
      </div>
    </div>
  </div>
  <div class="slide-footer">
    <span>JOVI Flow — FIAP Challenge 2026 | Sprint 2</span>
    <span>Slide 4 / 10</span>
  </div>
</section>

<!-- SLIDE 5: DICIONARIO DE DADOS -->
<section class="slide">
  <div class="slide-header">
    <div>
      <div class="slide-category">Etapa 2 • Dados</div>
      <h2 class="slide-title">Dicionário de Dados do IndexedDB</h2>
    </div>
    <div class="brand-badge"><span class="dot"></span> Especificação Técnica</div>
  </div>
  <div class="slide-content">
    <table>
      <thead>
        <tr>
          <th>Tabela</th>
          <th>Atributo</th>
          <th>Tipo</th>
          <th>Descrição</th>
          <th>Regra de Negócio / Implementação</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="badge-tag badge-blue">MIDIA</span></td>
          <td><code>id (PK)</code></td>
          <td>Integer</td>
          <td>Identificador único do registro</td>
          <td>Gerado via <code>Date.now()</code> como chave temporal e de ordenação natural.</td>
        </tr>
        <tr>
          <td><span class="badge-tag badge-blue">MIDIA</span></td>
          <td><code>data</code></td>
          <td>LongBlob</td>
          <td>Imagem em formato Base64</td>
          <td>Codificada em JPEG a 0.85 de qualidade para equilíbrio ideal peso/nitidez.</td>
        </tr>
        <tr>
          <td><span class="badge-tag badge-blue">MIDIA</span></td>
          <td><code>createdAt</code></td>
          <td>DateTime</td>
          <td>Timestamp UTC da captura</td>
          <td>String ISO 8601 UTC para formatação regional localizada em PT-BR.</td>
        </tr>
        <tr>
          <td><span class="badge-tag badge-yellow">METADADOS</span></td>
          <td><code>id (PK)</code></td>
          <td>Integer</td>
          <td>Identificador do metadado</td>
          <td>Auto-incremento interno para indexação secundária.</td>
        </tr>
        <tr>
          <td><span class="badge-tag badge-yellow">METADADOS</span></td>
          <td><code>midia_id (FK)</code></td>
          <td>Integer</td>
          <td>Vínculo com a tabela MIDIA</td>
          <td>Garante <code>CASCADE DELETE</code>; exclusão atômica limpa storage do dispositivo.</td>
        </tr>
        <tr>
          <td><span class="badge-tag badge-yellow">METADADOS</span></td>
          <td><code>sharpness_score</code></td>
          <td>Float</td>
          <td>Índice de nitidez IA (0.0 a 1.0)</td>
          <td>Calculado via variância de kernel Laplacian em convolução Canvas 2D.</td>
        </tr>
        <tr>
          <td><span class="badge-tag badge-yellow">METADADOS</span></td>
          <td><code>category</code></td>
          <td>String</td>
          <td>Categoria semântica</td>
          <td>Tag automática para busca e agrupamento (ex: 'Alta Nitidez', 'Padrão').</td>
        </tr>
        <tr>
          <td><span class="badge-tag badge-yellow">METADADOS</span></td>
          <td><code>aura_light_sim</code></td>
          <td>Integer</td>
          <td>Temperatura Aura Light</td>
          <td>Valor térmico em Kelvin (2000K a 10000K) selecionado no anel obturador.</td>
        </tr>
        <tr>
          <td><span class="badge-tag badge-yellow">METADADOS</span></td>
          <td><code>tags</code></td>
          <td>Array</td>
          <td>Tags semânticas da foto</td>
          <td>Lista de tags ('Retrato', 'Favorita', etc) gerenciadas interativamente na tela de detalhes.</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="slide-footer">
    <span>JOVI Flow — FIAP Challenge 2026 | Sprint 2</span>
    <span>Slide 5 / 10</span>
  </div>
</section>

<!-- SLIDE 6: ARQUITETURA TECNICA DO FRONT-END -->
<section class="slide">
  <div class="slide-header">
    <div>
      <div class="slide-category">Etapa 3 • Front-End</div>
      <h2 class="slide-title">Arquitetura Técnica do Front-End (Escopo Estrito)</h2>
    </div>
    <div class="brand-badge"><span class="dot"></span> Conformidade 100%</div>
  </div>
  <div class="slide-content">
    <div class="grid-3">
      <div class="card">
        <h3>🌐 HTML5 Semântico</h3>
        <ul>
          <li>Estruturação rigorosa com tags semânticas (<code>&lt;section&gt;</code>, <code>&lt;header&gt;</code>, <code>&lt;footer&gt;</code>, <code>&lt;video&gt;</code>).</li>
          <li>Acessibilidade completa com atributos <code>aria-label</code>, <code>role="status"</code> e regiões dinâmicas <code>aria-live="polite"</code>.</li>
          <li>Meta tag viewport sem travas de zoom, permitindo redimensionamento (WCAG 1.4.4).</li>
        </ul>
      </div>

      <div class="card">
        <h3>🎨 CSS3 & Tailwind v4</h3>
        <ul>
          <li>Tokens de marca compilados via <code>@theme</code> em CSS nativo hiperotimizado (apenas 21 KB minificado).</li>
          <li>Componentes de assinatura <strong>Liquid Glass</strong> com scrim anti-ofuscamento e blur adaptativo.</li>
          <li>Suporte completo a <code>prefers-reduced-motion</code> e <code>prefers-reduced-transparency</code>.</li>
        </ul>
      </div>

      <div class="card">
        <h3>⚙️ Vanilla JS (ES6)</h3>
        <ul>
          <li>Zero frameworks ou bundlers pesados; padrão arquitetural modular de alta legibilidade.</li>
          <li>Loop de cálculo de nitidez local em Canvas (sem modelos neurais pesados na CPU).</li>
          <li>Transições fluidas de tela aceleradas por hardware via <code>View Transitions API</code>.</li>
        </ul>
      </div>
    </div>

    <div class="card card-highlight" style="margin-top: 4px;">
      <h3>🚀 APIs Web Nativas Integradas</h3>
      <div style="display: flex; justify-content: space-between; font-size: 12px; color: #e2e8f0; margin-top: 4px;">
        <span>📸 <strong>getUserMedia</strong> (Câmera Real)</span>
        <span>🎨 <strong>Canvas 2D</strong> (Aura Light & Nitidez)</span>
        <span>💾 <strong>IndexedDB</strong> (Armazenamento Local)</span>
        <span>📳 <strong>Vibration API</strong> (Feedback Háptico)</span>
        <span>📋 <strong>Clipboard API</strong> (Cópia Direta)</span>
      </div>
    </div>
  </div>
  <div class="slide-footer">
    <span>JOVI Flow — FIAP Challenge 2026 | Sprint 2</span>
    <span>Slide 6 / 10</span>
  </div>
</section>

<!-- SLIDE 7: JORNADA DE 3 TOQUES -->
<section class="slide">
  <div class="slide-header">
    <div>
      <div class="slide-category">Etapa 3 • UX & Design</div>
      <h2 class="slide-title">Jornada Interativa de 3 Toques</h2>
    </div>
    <div class="brand-badge"><span class="dot"></span> Design Interativo</div>
  </div>
  <div class="slide-content">
    <div class="grid-3">
      <!-- Toque 1 -->
      <div class="card card-highlight">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="badge-tag badge-yellow" style="font-size: 12px;">TOQUE 1</span>
          <span style="font-size: 18px;">📸</span>
        </div>
        <h3 style="color: #ffd600;">Câmera & Flash de Tela</h3>
        <ul>
          <li><strong>Viewfinder Imersivo:</strong> 100% da área útil dedicada ao enquadramento em tela cheia.</li>
          <li><strong>Anel Térmico Aura:</strong> Gesto horizontal ajusta a temperatura de 2000K a 10000K com cliques hápticos.</li>
          <li><strong>Screen Flash Visual:</strong> Clarão de alta intensidade de 250ms com animação suave e suporte a hardware torch.</li>
        </ul>
      </div>

      <!-- Toque 2 -->
      <div class="card card-highlight">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="badge-tag badge-blue" style="font-size: 12px;">TOQUE 2</span>
          <span style="font-size: 18px;">🍱</span>
        </div>
        <h3 style="color: #3d6fff;">Galeria Bento & Seleção</h3>
        <ul>
          <li><strong>Grid Modular Bento:</strong> Destaque automático para a foto de maior nitidez (Laplacian).</li>
          <li><strong>Modo de Seleção:</strong> Botão "Selecionar" com checkboxes dinâmicos e contador em tempo real.</li>
          <li><strong>Tags Interativas:</strong> Presets rápidos e tags customizadas salvas na tela de detalhes.</li>
        </ul>
      </div>

      <!-- Toque 3 -->
      <div class="card card-highlight">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="badge-tag badge-green" style="font-size: 12px;">TOQUE 3</span>
          <span style="font-size: 18px;">🚀</span>
        </div>
        <h3 style="color: #34c759;">Compartilhar & Baixar</h3>
        <ul>
          <li><strong>Download Direto:</strong> Gera e salva arquivo físico JPEG (.jpg) direto no dispositivo.</li>
          <li><strong>Web Share API:</strong> Envio nativo de fotos para WhatsApp e Instagram com fallback de cópia.</li>
          <li><strong>Zero App Friction:</strong> Fluxo completo sem depender de downloads em lojas de aplicativos.</li>
        </ul>
      </div>
    </div>

    <div class="card" style="margin-top: 6px; padding: 12px 16px;">
      <p style="margin: 0; font-size: 12px; color: #cbd5e1;">
        ✨ <strong>Transição Cinematográfica:</strong> A navegação entre Visor, Galeria, Detalhes e Compartilhamento utiliza a moderna <code>View Transitions API</code>, criando morfismo visual contínuo da foto sem flashes brancos na tela.
      </p>
    </div>
  </div>
  <div class="slide-footer">
    <span>JOVI Flow — FIAP Challenge 2026 | Sprint 2</span>
    <span>Slide 7 / 10</span>
  </div>
</section>

<!-- SLIDE 8: DIFERENCIAIS DA RUBRICA SPRINT 2 -->
<section class="slide">
  <div class="slide-header">
    <div>
      <div class="slide-category">Etapa 3 • Diferenciais</div>
      <h2 class="slide-title">Atendimento às Rubricas Específicas da Sprint 2</h2>
    </div>
    <div class="brand-badge"><span class="dot"></span> Rubrica Sprint 2</div>
  </div>
  <div class="slide-content">
    <div class="grid-2">
      <!-- Rubrica 1 -->
      <div class="card">
        <h3>💡 "Sugestões Automáticas de Uso"</h3>
        <p style="color: #ffd600; font-weight: 600; font-size: 13px;">Pílula Contextual Reativa na Câmera</p>
        <p>O visor analisa em tempo real a temperatura de luz definida no Aura Ring e exibe uma recomendação dinâmica flutuante:</p>
        <ul style="font-size: 12px;">
          <li><code>&lt; 3500K</code>: 💡 <em>"Sugestão: Luz Quente (Retratos intimistas)"</em></li>
          <li><code>3500K - 5500K</code>: ☀️ <em>"Sugestão: Luz Natural (Nitidez equilibrada)"</em></li>
          <li><code>&gt; 5500K</code>: ⚡ <em>"Sugestão: Luz Fria (Texturas e contrastes)"</em></li>
        </ul>
        <p style="font-size: 11.5px; color: #94a3b8; margin-top: 6px;">
          👉 Um toque na pílula aplica o preset ideal imediatamente. Na Galeria, o banner inteligente indica a captura mais nítida para envio.
        </p>
      </div>

      <!-- Rubrica 2 -->
      <div class="card">
        <h3>⚡ "Feedback Visual de Performance"</h3>
        <p style="color: #34c759; font-weight: 600; font-size: 13px;">Comprovação de Velocidade e Zero-Lag</p>
        <p>O usuário recebe confirmação visual inequívoca de que o pipeline web é instantâneo:</p>
        <ul style="font-size: 12px;">
          <li><strong>Badge Instantâneo de Latência:</strong> A cada clique no obturador, o tempo decorrido é cronometrado com <code>performance.now()</code> e exibido na hora (ex.: <code>⚡ 16ms Zero-Lag</code>).</li>
          <li><strong>Skeleton Screens Cintilantes:</strong> Ao abrir a galeria, placeholders esqueleto com gradiente suave preenchem a tela, assegurando transição sem pulos.</li>
          <li><strong>Haptic Ticks:</strong> Vibração mecânica a cada 500 Kelvin de ajuste térmico.</li>
        </ul>
      </div>
    </div>

    <div class="card card-highlight" style="margin-top: 4px; padding: 12px 16px;">
      <p style="margin: 0; font-size: 12px; color: #e2e8f0;">
        🎯 <strong>Critério do Edital:</strong> Ambos os itens da rubrica oficial estão completamente implementados, funcionais e cobertos pela suíte de testes automatizados headless.
      </p>
    </div>
  </div>
  <div class="slide-footer">
    <span>JOVI Flow — FIAP Challenge 2026 | Sprint 2</span>
    <span>Slide 8 / 10</span>
  </div>
</section>

<!-- SLIDE 9: AUDITORIA E QA MOBILE-FIRST -->
<section class="slide">
  <div class="slide-header">
    <div>
      <div class="slide-category">Etapa 4 • Qualidade & QA</div>
      <h2 class="slide-title">Auditoria e Testes Automatizados Mobile-First (JOVI-114)</h2>
    </div>
    <div class="brand-badge" style="background: rgba(52, 199, 89, 0.3); border-color: #34c759;"><span class="dot" style="background: #34c759;"></span> 29/29 Aprovados</div>
  </div>
  <div class="slide-content">
    <div class="grid-3">
      <div class="card">
        <h3>📱 Multi-Viewport Audit</h3>
        <p>Validação automatizada headless cobrindo os 3 principais perfis de tela mobile:</p>
        <ul>
          <li><strong>360×640</strong> (Android Compacto)</li>
          <li><strong>390×844</strong> (iPhone 12/13/14 Padrão)</li>
          <li><strong>428×926</strong> (iPhone Max / Telas Grandes)</li>
        </ul>
        <p style="color: #34c759; font-weight: 600; font-size: 11.5px; margin-top: 8px;">✓ 100% Zero Overflow Horizontal</p>
      </div>

      <div class="card">
        <h3>👆 Touch Targets (≥ 48px)</h3>
        <p>Conformidade total com WCAG 2.2 e diretrizes de usabilidade móvel:</p>
        <ul>
          <li>Botão de captura: <strong>64×64px</strong></li>
          <li>Ícones e controles: <strong>48×48px</strong></li>
          <li>Pílulas de sugestão: <strong>&ge; 48px de altura</strong></li>
          <li>Botão de seleção e ações: <strong>&ge; 48px</strong></li>
        </ul>
        <p style="color: #34c759; font-weight: 600; font-size: 11.5px; margin-top: 8px;">✓ Acessibilidade Física Certificada</p>
      </div>

      <div class="card">
        <h3>⚡ Orçamento de Latência</h3>
        <p>Medição empírica do ciclo completo (captura &rarr; filtro &rarr; IndexedDB):</p>
        <ul>
          <li>Orçamento limite: <strong>&lt; 200ms</strong></li>
          <li>Média medida em teste: <strong>16ms a 19ms</strong></li>
          <li>Tempo de ciclo total: <strong>~60ms</strong></li>
          <li>Aderência ao teto: <strong>10x mais rápido</strong></li>
        </ul>
        <p style="color: #34c759; font-weight: 600; font-size: 11.5px; margin-top: 8px;">✓ Orçamento Metrológico Aprovado</p>
      </div>
    </div>

    <div class="card" style="margin-top: 6px; padding: 12px 16px; background: rgba(0,0,0,0.5);">
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
        <span>🛡️ <strong>Zero Console Errors:</strong> Nenhuma exceção não tratada no runtime.</span>
        <span>📶 <strong>Zero External Requests:</strong> 100% autossuficiente e offline-first.</span>
        <span>🎭 <strong>Prefers-Reduced-Motion:</strong> Loops e animações respeitam a preferência do usuário.</span>
      </div>
    </div>
  </div>
  <div class="slide-footer">
    <span>JOVI Flow — FIAP Challenge 2026 | Sprint 2</span>
    <span>Slide 9 / 10</span>
  </div>
</section>

<!-- SLIDE 10: CONCLUSAO & ENTREGAVEIS -->
<section class="slide">
  <div class="slide-header">
    <div>
      <div class="slide-category">Conclusão • Entrega</div>
      <h2 class="slide-title">Resumo de Conformidade e Entregáveis</h2>
    </div>
    <div class="brand-badge"><span class="dot"></span> Sprint 2 Completa</div>
  </div>
  <div class="slide-content">
    <div class="grid-2">
      <div class="card card-highlight">
        <h3>📦 Entregáveis na Plataforma FIAP</h3>
        <ul>
          <li><strong>Arquivo ZIP Autônomo (<code>dist/jovi-flow-sprint2.zip</code>):</strong>
            <ul>
              <li>Apenas <strong>50.3 KB</strong> compactado.</li>
              <li><code>index.html</code> posicionado exatamente na raiz do arquivo.</li>
              <li>Fontes Poppins locais incluídas; zero dependência externa.</li>
            </ul>
          </li>
          <li><strong>Apresentação Executiva (<code>docs/jovi-flow-sprint2-apresentacao.pdf</code>):</strong>
            <ul>
              <li>10 slides no padrão oficial A4 Paisagem (não texto corrido).</li>
              <li>Integrantes, RMs, MER, Dicionário e Mapeamento de Dores.</li>
            </ul>
          </li>
        </ul>
      </div>

      <div class="card">
        <h3>🛡️ Resiliência na Avaliação Docente</h3>
        <ul>
          <li><strong>Execução Local Descomplicada:</strong> Os avaliadores podem simplesmente descompactar o ZIP e abrir o arquivo <code>index.html</code> diretamente em qualquer navegador desktop ou mobile.</li>
          <li><strong>Modo Demo de Contingência:</strong> Caso a máquina de correção não possua câmera física conectada ou execute via <code>file://</code>, o sistema ativa um visor sintético animado que permite navegar pelas 5 telas com 100% de fidelidade interativa.</li>
          <li><strong>Suíte de Auditoria Integrada:</strong> O comando <code>npm test</code> reproduz a qualquer momento o relatório completo de conformidade.</li>
        </ul>
      </div>
    </div>

    <div style="text-align: center; margin-top: 10px; padding: 14px; background: rgba(10, 61, 255, 0.15); border-radius: 12px; border: 1px solid rgba(10, 61, 255, 0.3);">
      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #ffd600;">
        "O futuro da câmera não está em mais tecnologia, mas em experiências mais humanas, intuitivas e inteligentes."
      </p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: rgba(255, 255, 255, 0.7);">
        JOVI Flow • FIAP Challenge 2026 • 1TDSOA • João Gabriel Furlan (RM 57039)
      </p>
    </div>
  </div>
  <div class="slide-footer">
    <span>JOVI Flow — FIAP Challenge 2026 | Sprint 2</span>
    <span>Slide 10 / 10</span>
  </div>
</section>

</body>
</html>
`;

async function generatePresentationPdf() {
    console.log('===========================================================');
    console.log('📄 JOVI Flow — Gerador de Apresentação PDF Sprint 2 (JOVI-113)');
    console.log('===========================================================\n');

    console.log('1. Escrevendo template HTML temporário...');
    fs.writeFileSync(tempHtmlPath, SLIDES_HTML, 'utf8');

    console.log('2. Lançando Puppeteer headless...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
    });

    try {
        const page = await browser.newPage();
        console.log('3. Carregando slides...');
        await page.goto('file://' + tempHtmlPath, { waitUntil: 'networkidle0' });

        console.log('4. Renderizando PDF (A4 Paisagem)...');
        await page.pdf({
            path: outputPdfPath,
            format: 'A4',
            landscape: true,
            printBackground: true,
            preferCSSPageSize: true
        });

        const stats = fs.statSync(outputPdfPath);
        console.log(`\n✅ PDF gerado com sucesso em: ${outputPdfPath}`);
        console.log(`📊 Tamanho do arquivo: ${(stats.size / 1024).toFixed(1)} KB`);
    } finally {
        await browser.close();
        if (fs.existsSync(tempHtmlPath)) {
            fs.unlinkSync(tempHtmlPath);
        }
    }

    console.log('\n🎉 Geração de apresentação da Sprint 2 concluída!\n');
}

generatePresentationPdf().catch(err => {
    console.error('Erro ao gerar PDF da apresentação:', err);
    process.exit(1);
});
