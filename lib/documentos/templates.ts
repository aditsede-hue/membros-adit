// ── Templates de PDF para documentos da Igreja ────────────────────────────────
// Cada função gera uma string HTML completa pronta para window.print()

export type DocDados = Record<string, string>;

const MESES_PT = [
  "janeiro","fevereiro","março","abril","maio","junho",
  "julho","agosto","setembro","outubro","novembro","dezembro",
];

function fmtData(iso?: string): string {
  if (!iso) return "_____________________________";
  const [y, m, d] = iso.split("-");
  const mes = MESES_PT[parseInt(m, 10) - 1] ?? "";
  return `${d} de ${mes} de ${y}`;
}

function nome(s?: string): string {
  return s ? `<strong>${s.toUpperCase()}</strong>` : "<strong>___________________________</strong>";
}

// ── Base CSS compartilhado ────────────────────────────────────────────────────

const BASE_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=EB+Garamond:wght@400;500&display=swap');

  body {
    font-family: 'EB Garamond', 'Times New Roman', serif;
    font-size: 14px;
    color: #0f1117;
    background: white;
    max-width: 780px;
    margin: 0 auto;
    padding: 48px 64px;
    line-height: 1.8;
  }

  .header {
    text-align: center;
    padding-bottom: 20px;
    margin-bottom: 28px;
    border-bottom: 3px double #c9a84c;
  }
  .header-cross {
    font-size: 28px;
    color: #c9a84c;
    display: block;
    margin-bottom: 6px;
  }
  .header-nome {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #0f1117;
  }
  .header-denominacao {
    font-size: 11px;
    color: #6b7280;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-top: 4px;
  }
  .header-endereco {
    font-size: 10px;
    color: #9ca3af;
    margin-top: 3px;
  }

  .doc-title-wrapper {
    text-align: center;
    margin: 28px 0 32px;
  }
  .doc-title {
    display: inline-block;
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 17px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 4px;
    color: #a87e2e;
    border: 2px solid #c9a84c;
    padding: 10px 28px;
  }
  .doc-numero {
    font-size: 11px;
    color: #9ca3af;
    margin-top: 8px;
  }

  .corpo {
    font-size: 14.5px;
    line-height: 2.1;
    text-align: justify;
    margin-bottom: 36px;
    text-indent: 40px;
  }
  .corpo p { margin-bottom: 16px; }
  .corpo p:first-child { text-indent: 40px; }

  .corpo-direto {
    font-size: 14px;
    line-height: 2;
    margin-bottom: 28px;
  }

  .dado-linha {
    margin-bottom: 6px;
  }
  .dado-label {
    font-size: 11px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 1px;
  }
  .dado-valor {
    font-size: 14px;
    font-weight: 600;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 2px;
    display: inline-block;
    min-width: 280px;
  }

  .assinaturas {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    margin-top: 52px;
    flex-wrap: wrap;
    gap: 24px;
  }
  .assinatura {
    text-align: center;
    min-width: 160px;
  }
  .assinatura-linha {
    border-top: 1px solid #374151;
    padding-top: 8px;
    width: 180px;
    margin: 0 auto;
  }
  .assinatura-nome {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 13px;
    font-weight: 600;
    color: #0f1117;
  }
  .assinatura-cargo {
    font-size: 10px;
    color: #6b7280;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .rodape {
    margin-top: 48px;
    text-align: center;
    font-size: 10px;
    color: #9ca3af;
    border-top: 1px solid #e5e7eb;
    padding-top: 12px;
  }
  .rodape-validade {
    font-size: 9px;
    color: #d1d5db;
    margin-top: 4px;
  }

  .selo {
    text-align: right;
    font-size: 10px;
    color: #c9a84c;
    margin-top: 8px;
    font-style: italic;
  }

  @media print {
    body { padding: 20px 32px; }
    .no-print { display: none !important; }
  }
`;

function wrapHTML(titulo: string, body: string, numero?: string): string {
  const n = numero ?? `${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${titulo} — Campo ADIT</title>
  <style>${BASE_CSS}</style>
</head>
<body>
  <div class="header">
    <span class="header-cross">✝</span>
    <div class="header-nome">Campo ADIT</div>
    <div class="header-denominacao">Assembleia de Deus do Itapoã</div>
    <div class="header-endereco">Brasília — Distrito Federal &nbsp;·&nbsp; CNPJ 00.000.000/0001-00</div>
  </div>

  <div class="doc-title-wrapper">
    <div class="doc-title">${titulo}</div>
    <div class="doc-numero">Nº ${n}</div>
  </div>

  ${body}

  <div class="rodape">
    Documento emitido pelo Sistema de Gestão — Campo ADIT
    <div class="rodape-validade">Este documento tem validade somente com assinatura e carimbo</div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  </script>
</body>
</html>`;
}

// ── 1. Certificado de Batismo — A4 Paisagem ──────────────────────────────────

export function genBatismo(d: DocDados): string {
  const n = `${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>Certificado de Batismo — Campo ADIT</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
    @page { size: A4 landscape; margin: 0; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 297mm; height: 210mm; overflow: hidden; }
    body {
      font-family: 'EB Garamond', 'Times New Roman', serif;
      background: #0b2d6b;
      position: relative;
    }
    .bg {
      position: absolute; inset: 0;
      background:
        radial-gradient(ellipse at 50% 130%, rgba(30,110,190,0.9) 0%, transparent 55%),
        radial-gradient(ellipse at 15% 60%, rgba(10,50,130,0.5) 0%, transparent 45%),
        linear-gradient(180deg, #0a2260 0%, #0d3580 45%, #0f4ba0 72%, #1565c0 100%);
    }
    .waves {
      position: absolute; bottom: 0; left: 0; width: 100%; height: 28%; opacity: 0.12;
    }
    .border-outer { position: absolute; inset: 5.5mm; border: 2px solid rgba(201,168,76,0.85); }
    .border-inner  { position: absolute; inset: 8.5mm;  border: 1px solid rgba(201,168,76,0.30); }

    .corner { position: absolute; width: 11mm; height: 11mm; }
    .c-tl { top: 2.5mm;  left: 2.5mm; }
    .c-tr { top: 2.5mm;  right: 2.5mm;  transform: scaleX(-1); }
    .c-bl { bottom: 2.5mm; left: 2.5mm; transform: scaleY(-1); }
    .c-br { bottom: 2.5mm; right: 2.5mm; transform: scale(-1); }

    .cert {
      position: relative; width: 100%; height: 100%;
      padding: 15mm 22mm 13mm;
      display: flex; flex-direction: column; align-items: center; color: white;
    }
    .header {
      display: flex; align-items: flex-start; justify-content: space-between;
      width: 100%; margin-bottom: 5mm;
    }
    .church-name {
      font-family: 'Cinzel', serif; font-size: 9.5pt; letter-spacing: 4px;
      text-transform: uppercase; color: #c9a84c; font-weight: 600;
    }
    .church-denom {
      font-size: 7pt; color: rgba(255,255,255,0.55); letter-spacing: 1.8px;
      text-transform: uppercase; margin-top: 1mm;
    }
    .cert-title {
      font-family: 'Cinzel', serif; font-size: 20pt; font-weight: 700;
      text-transform: uppercase; letter-spacing: 5px; color: #c9a84c;
      text-shadow: 0 0 28px rgba(201,168,76,0.55), 0 2px 6px rgba(0,0,0,0.6);
      text-align: center; line-height: 1;
    }
    .title-line {
      width: 95mm; height: 1px;
      background: linear-gradient(90deg, transparent, #c9a84c, transparent);
      margin: 3mm auto;
    }
    .body-text {
      font-size: 11pt; line-height: 1.85; text-align: center;
      color: rgba(255,255,255,0.93); flex: 1;
    }
    .nome-dest {
      font-family: 'Cinzel', serif; font-size: 14.5pt; font-weight: 600;
      color: #c9a84c; display: inline-block; letter-spacing: 1.5px;
      border-bottom: 1px solid rgba(201,168,76,0.55);
      padding: 0 5mm 1mm; margin: 1mm 0;
    }
    .verse {
      font-size: 8pt; font-style: italic; color: rgba(255,255,255,0.45);
      margin-top: 3mm; text-align: center;
    }
    .assinaturas {
      display: flex; justify-content: center; gap: 38mm;
      margin-top: 4mm; width: 100%;
    }
    .assinatura { text-align: center; }
    .assinatura-linha {
      border-top: 1px solid rgba(201,168,76,0.65); padding-top: 3px;
      width: 60mm; margin: 0 auto;
    }
    .assinatura-nome {
      font-family: 'Cinzel', serif; font-size: 8.5pt; font-weight: 600;
      color: #c9a84c; letter-spacing: 0.3px;
    }
    .assinatura-cargo {
      font-size: 6.5pt; color: rgba(255,255,255,0.5);
      letter-spacing: 1.5px; text-transform: uppercase; margin-top: 1px;
    }
    .doc-num {
      position: absolute; bottom: 10mm; right: 23mm;
      font-size: 6.5pt; color: rgba(255,255,255,0.2);
    }
    @media print {
      html, body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="bg"></div>
  <svg class="waves" viewBox="0 0 1260 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,80 C210,140 420,20 630,80 C840,140 1050,20 1260,80 L1260,200 L0,200 Z" fill="white"/>
    <path d="M0,120 C200,70 420,145 630,120 C840,95 1060,160 1260,120 L1260,200 L0,200 Z" fill="white" opacity="0.5"/>
  </svg>
  <div class="border-outer"></div>
  <div class="border-inner"></div>
  <!-- Corner ornaments -->
  <div class="corner c-tl"><svg viewBox="0 0 40 40" fill="none"><path d="M4 4 L22 4 M4 4 L4 22" stroke="#c9a84c" stroke-width="1.8" stroke-linecap="round"/><circle cx="4" cy="4" r="2" fill="#c9a84c"/></svg></div>
  <div class="corner c-tr"><svg viewBox="0 0 40 40" fill="none"><path d="M4 4 L22 4 M4 4 L4 22" stroke="#c9a84c" stroke-width="1.8" stroke-linecap="round"/><circle cx="4" cy="4" r="2" fill="#c9a84c"/></svg></div>
  <div class="corner c-bl"><svg viewBox="0 0 40 40" fill="none"><path d="M4 4 L22 4 M4 4 L4 22" stroke="#c9a84c" stroke-width="1.8" stroke-linecap="round"/><circle cx="4" cy="4" r="2" fill="#c9a84c"/></svg></div>
  <div class="corner c-br"><svg viewBox="0 0 40 40" fill="none"><path d="M4 4 L22 4 M4 4 L4 22" stroke="#c9a84c" stroke-width="1.8" stroke-linecap="round"/><circle cx="4" cy="4" r="2" fill="#c9a84c"/></svg></div>

  <div class="cert">
    <div class="header">
      <div>
        <div class="church-name">Campo ADIT</div>
        <div class="church-denom">Assembleia de Deus do Itapoã</div>
        <div class="church-denom" style="letter-spacing:1px;">Brasília — Distrito Federal</div>
      </div>
      <!-- ADIT Logo / Cross com ondas (batismo) -->
      <svg width="52" height="60" viewBox="0 0 52 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="26" cy="26" r="23" stroke="#c9a84c" stroke-width="1.2" opacity="0.35"/>
        <rect x="23" y="7"  width="6"  height="38" rx="2.5" fill="#c9a84c"/>
        <rect x="11" y="18" width="30" height="6"  rx="2.5" fill="#c9a84c"/>
        <path d="M8 50 Q14 45 20 50 Q26 55 32 50 Q38 45 44 50" stroke="#c9a84c" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.75"/>
        <path d="M10 56 Q16 52 22 56 Q28 60 34 56 Q38 53 42 56" stroke="#c9a84c" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.45"/>
      </svg>
    </div>

    <div class="cert-title">Certificado de Batismo</div>
    <div class="title-line"></div>

    <div class="body-text">
      <p>Certificamos que o(a) irmão(ã)</p>
      <p><span class="nome-dest">${(d.nome ?? "___________________________").toUpperCase()}</span></p>
      <p>
        foi batizado(a) nas águas em obediência ao mandato do Senhor Jesus Cristo,<br>
        perante esta igreja, no dia <strong>${fmtData(d.data_batismo)}</strong>.
      </p>
    </div>

    <div class="verse">
      "Portanto ide, fazei discípulos de todas as nações, batizando-os em nome do Pai, e do Filho, e do Espírito Santo." — Mateus 28:19
    </div>

    <div class="assinaturas">
      <div class="assinatura">
        <div class="assinatura-linha"></div>
        <div class="assinatura-nome">Elton Mendes Guilherme</div>
        <div class="assinatura-cargo">Pastor Presidente</div>
      </div>
      <div class="assinatura">
        <div class="assinatura-linha"></div>
        <div class="assinatura-nome">Fagner Silva Ribeiro</div>
        <div class="assinatura-cargo">Secretário Executivo</div>
      </div>
    </div>

    <div class="doc-num">Nº ${n}</div>
  </div>

  <script>
    window.onload = function() { setTimeout(function() { window.print(); }, 400); };
  </script>
</body>
</html>`;
}

// ── 2. Certificado de Consagração ─────────────────────────────────────────────

export function genConsagracao(d: DocDados): string {
  const body = `
    <div class="corpo">
      <p>
        Certificamos que o(a) irmão(ã) ${nome(d.nome)},
        após processo de análise, aprovação e oração do presbitério desta
        congregação, foi consagrado(a) ao cargo de
        <strong>${(d.cargo ?? "________________________").toUpperCase()}</strong>
        da Igreja Assembleia de Deus, no dia ${fmtData(d.data_consagracao)}.
      </p>
      <p>
        Este ato foi realizado conforme as normas e estatutos da
        Assembleia de Deus e da Convenção Estadual, reconhecendo
        o chamado divino e a fidelidade demonstrada no serviço ao Senhor.
      </p>
      <p>
        "Não negligencie o dom que está em você, que lhe foi dado
        mediante profecia." — 1 Timóteo 4:14
      </p>
    </div>

    <div style="text-align:center; margin-bottom:28px;">
      <div class="dado-label">Local e Data</div>
      <div class="dado-valor">Brasília/DF, ${fmtData(d.data_consagracao)}</div>
    </div>

    <div class="assinaturas">
      <div class="assinatura">
        <div class="assinatura-linha"></div>
        <div class="assinatura-nome">Elton Mendes Guilherme</div>
        <div class="assinatura-cargo">Pastor Presidente</div>
      </div>
      <div class="assinatura">
        <div class="assinatura-linha"></div>
        <div class="assinatura-nome">Fagner Silva Ribeiro</div>
        <div class="assinatura-cargo">Secretário Executivo</div>
      </div>
    </div>
    <div class="selo">Campo ADIT — Brasília/DF</div>
  `;
  return wrapHTML("Certificado de Consagração", body);
}

// ── 3. Certificado de Apresentação ────────────────────────────────────────────

export function genApresentacao(d: DocDados): string {
  const body = `
    <div class="corpo">
      <p>
        Certificamos que a criança ${nome(d.nome_crianca)},
        filha de ${nome(d.nome_pai)} e ${nome(d.nome_mae)},
        nascida em ${fmtData(d.data_nascimento)},
        foi apresentada ao Senhor perante esta congregação
        no dia ${fmtData(d.data_apresentacao)}.
      </p>
      <p>
        Os pais e/ou responsáveis assumiram o compromisso de criar
        esta criança segundo os princípios cristãos e ensiná-la
        nos caminhos do Senhor, confiando esta vida preciosa
        ao cuidado e proteção de Deus Todo-Poderoso.
      </p>
      <p>
        "Instruí o menino no caminho em que deve andar,
        e até quando envelhecer não se desviará dele." — Provérbios 22:6
      </p>
    </div>

    <div style="text-align:center; margin-bottom:28px;">
      <div class="dado-label">Local e Data</div>
      <div class="dado-valor">Brasília/DF, ${fmtData(d.data_apresentacao)}</div>
    </div>

    <div class="assinaturas">
      <div class="assinatura">
        <div class="assinatura-linha"></div>
        <div class="assinatura-nome">Elton Mendes Guilherme</div>
        <div class="assinatura-cargo">Pastor Presidente</div>
      </div>
      <div class="assinatura">
        <div class="assinatura-linha"></div>
        <div class="assinatura-nome">${d.nome_pai || "________________________"}</div>
        <div class="assinatura-cargo">Pai / Responsável</div>
      </div>
      <div class="assinatura">
        <div class="assinatura-linha"></div>
        <div class="assinatura-nome">Fagner Silva Ribeiro</div>
        <div class="assinatura-cargo">Secretário Executivo</div>
      </div>
    </div>
    <div class="selo">Campo ADIT — Brasília/DF</div>
  `;
  return wrapHTML("Certificado de Apresentação", body);
}

// ── 4. Certificado de Curso de Obreiros ──────────────────────────────────────

export function genCursoObreiros(d: DocDados): string {
  const curso = d.curso || "Curso de Formação de Obreiros — CFO";
  const body = `
    <div class="corpo">
      <p>
        Certificamos que o(a) aluno(a) ${nome(d.nome)},
        concluiu com aproveitamento o <strong>${curso}</strong>,
        realizado pela Igreja Assembleia de Deus — Campo ADIT,
        encerrando em ${fmtData(d.data_conclusao)}.
      </p>
      <p>
        Durante o curso, o(a) aluno(a) demonstrou dedicação,
        comprometimento com a Palavra de Deus e aptidão para
        o serviço no Reino de Deus, sendo habilitado(a) para
        atuar como obreiro(a) nesta congregação.
      </p>
      <p>
        "Apressa-te em apresentares a Deus como homem aprovado,
        como obreiro que não tem de que se envergonhar." — 2 Timóteo 2:15
      </p>
    </div>

    <div style="text-align:center; margin-bottom:28px;">
      <div class="dado-label">Local e Data</div>
      <div class="dado-valor">Brasília/DF, ${fmtData(d.data_conclusao)}</div>
    </div>

    <div class="assinaturas">
      <div class="assinatura">
        <div class="assinatura-linha"></div>
        <div class="assinatura-nome">Elton Mendes Guilherme</div>
        <div class="assinatura-cargo">Pastor Presidente</div>
      </div>
      <div class="assinatura">
        <div class="assinatura-linha"></div>
        <div class="assinatura-nome">${d.coordenador || "________________________"}</div>
        <div class="assinatura-cargo">Coordenador(a) do Curso</div>
      </div>
      <div class="assinatura">
        <div class="assinatura-linha"></div>
        <div class="assinatura-nome">${d.nome || "________________________"}</div>
        <div class="assinatura-cargo">Aluno(a)</div>
      </div>
    </div>
    <div class="selo">Campo ADIT — Brasília/DF</div>
  `;
  return wrapHTML("Certificado de Curso de Obreiros", body);
}

// ── 5. Carta de Mudança ───────────────────────────────────────────────────────

export function genMudanca(d: DocDados): string {
  const body = `
    <div class="corpo">
      <p>
        Atestamos que o(a) irmão(ã) ${nome(d.nome)}
        é membro em plena comunhão desta congregação —
        Igreja Assembleia de Deus, Campo ADIT — situada em Brasília/DF.
      </p>
      <p>
        Por motivo de mudança de residência, expedimos a presente
        <strong>CARTA DE MUDANÇA</strong>, recomendando-o(a) a qualquer
        congregação cristã onde vier a residir, para que seja recebido(a)
        em plena comunhão, na certeza de que mantém boa conduta
        cristã e testemunho irrepreensível.
      </p>
      <p>
        Esta carta é expedida em ${fmtData(d.data)}, com validade
        de 90 (noventa) dias a partir desta data.
      </p>
    </div>

    <div style="text-align:center; margin-bottom:28px;">
      <div class="dado-label">Local e Data</div>
      <div class="dado-valor">Brasília/DF, ${fmtData(d.data)}</div>
    </div>

    <div class="assinaturas">
      <div class="assinatura">
        <div class="assinatura-linha"></div>
        <div class="assinatura-nome">Elton Mendes Guilherme</div>
        <div class="assinatura-cargo">Pastor Presidente</div>
      </div>
      <div class="assinatura">
        <div class="assinatura-linha"></div>
        <div class="assinatura-nome">Fagner Silva Ribeiro</div>
        <div class="assinatura-cargo">Secretário Executivo</div>
      </div>
    </div>
    <div class="selo">Campo ADIT — Brasília/DF</div>
  `;
  return wrapHTML("Carta de Mudança", body);
}

// ── 6. Carta de Recomendação ──────────────────────────────────────────────────

export function genRecomendacao(d: DocDados): string {
  const body = `
    <div class="corpo">
      <p>
        É com grande satisfação que recomendamos o(a) irmão(ã)
        ${nome(d.nome)}, membro ativo(a) desta congregação —
        Igreja Assembleia de Deus, Campo ADIT — à consideração
        de qualquer congregação cristã.
      </p>
      <p>
        O(a) referido(a) irmão(ã) tem se destacado pela
        fidelidade, comprometimento com a obra do Senhor e
        conduta cristã irrepreensível, sendo digno(a) de toda
        confiança e apreço desta congregação.
      </p>
      <p>
        Recomendamos sem restrições, para que seja recebido(a)
        como membro participante, contribuindo com seus dons
        e talentos para a edificação do Corpo de Cristo.
      </p>
      <p>
        Esta carta é expedida em ${fmtData(d.data)}.
      </p>
    </div>

    <div style="text-align:center; margin-bottom:28px;">
      <div class="dado-label">Local e Data</div>
      <div class="dado-valor">Brasília/DF, ${fmtData(d.data)}</div>
    </div>

    <div class="assinaturas">
      <div class="assinatura">
        <div class="assinatura-linha"></div>
        <div class="assinatura-nome">Elton Mendes Guilherme</div>
        <div class="assinatura-cargo">Pastor Presidente</div>
      </div>
      <div class="assinatura">
        <div class="assinatura-linha"></div>
        <div class="assinatura-nome">Fagner Silva Ribeiro</div>
        <div class="assinatura-cargo">Secretário Executivo</div>
      </div>
    </div>
    <div class="selo">Campo ADIT — Brasília/DF</div>
  `;
  return wrapHTML("Carta de Recomendação", body);
}

// ── 7. Ofício ─────────────────────────────────────────────────────────────────

export function genOficio(d: DocDados): string {
  const body = `
    <div style="margin-bottom: 28px;">
      <div class="dado-label">Assunto</div>
      <div style="font-size:15px; font-weight:600; border-bottom:1px solid #e5e7eb; padding-bottom:6px;">
        ${d.assunto || "________________________________"}
      </div>
    </div>

    <div style="margin-bottom:24px;">
      <p style="font-size:13px; color:#6b7280;">Ao(s) Sr(s)/Sra(s),</p>
      <p style="font-size:14px; font-weight:600; margin-top:4px;">
        ${d.destinatario || "________________________________"}
      </p>
    </div>

    <div class="corpo-direto" style="white-space: pre-wrap;">
${d.conteudo || ""}
    </div>

    <div style="text-align:right; margin-bottom:32px;">
      <div class="dado-label">Local e Data</div>
      <div>Brasília/DF, ${fmtData(d.data)}</div>
    </div>

    <div class="assinaturas" style="justify-content:flex-start; gap:48px;">
      <div class="assinatura">
        <div class="assinatura-linha"></div>
        <div class="assinatura-nome">${d.remetente || "________________________"}</div>
        <div class="assinatura-cargo">Remetente</div>
      </div>
      <div class="assinatura">
        <div class="assinatura-linha"></div>
        <div class="assinatura-nome">Fagner Silva Ribeiro</div>
        <div class="assinatura-cargo">Secretário Executivo</div>
      </div>
    </div>
    <div class="selo">Campo ADIT — Brasília/DF</div>
  `;
  return wrapHTML("Ofício", body);
}

// ── 8. Declaração ─────────────────────────────────────────────────────────────

export function genDeclaracao(d: DocDados): string {
  const body = `
    <div style="margin-bottom: 24px;">
      <div class="dado-label">Assunto</div>
      <div style="font-size:15px; font-weight:600; border-bottom:1px solid #e5e7eb; padding-bottom:6px;">
        ${d.assunto || "________________________________"}
      </div>
    </div>

    <div class="corpo-direto" style="white-space: pre-wrap;">
${d.conteudo || ""}
    </div>

    <div style="text-align:center; margin-bottom:32px;">
      <p style="font-size:12px; color:#6b7280;">
        Por ser verdade, firmo a presente declaração.
      </p>
      <div class="dado-valor" style="margin-top:8px;">
        Brasília/DF, ${fmtData(d.data)}
      </div>
    </div>

    <div class="assinaturas">
      <div class="assinatura">
        <div class="assinatura-linha"></div>
        <div class="assinatura-nome">${d.remetente || "________________________"}</div>
        <div class="assinatura-cargo">Declarante</div>
      </div>
      <div class="assinatura">
        <div class="assinatura-linha"></div>
        <div class="assinatura-nome">${d.secretario || "Fagner Silva Ribeiro"}</div>
        <div class="assinatura-cargo">Secretário(a) Executivo(a)</div>
      </div>
    </div>
    <div class="selo">Campo ADIT — Brasília/DF</div>
  `;
  return wrapHTML("Declaração", body);
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

import type { DocTipo } from "./types";

export function generateDocHTML(tipo: DocTipo, dados: DocDados): string {
  switch (tipo) {
    case "batismo":         return genBatismo(dados);
    case "consagracao":     return genConsagracao(dados);
    case "apresentacao":    return genApresentacao(dados);
    case "curso_obreiros":  return genCursoObreiros(dados);
    case "mudanca":         return genMudanca(dados);
    case "recomendacao":    return genRecomendacao(dados);
    case "oficio":          return genOficio(dados);
    case "declaracao":      return genDeclaracao(dados);
    default:                return genDeclaracao(dados);
  }
}
