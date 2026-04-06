const fs = require("node:fs");
const path = require("node:path");

const PDFDocument = require("pdfkit");

const ROOT_DIR = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(ROOT_DIR, "public", "explicacao-grafico-linha-do-tempo-meta-ads.pdf");
const LOGO_PATH = path.join(ROOT_DIR, "public", "brand", "logo-wordmark.png");

const COLORS = {
  background: "#131313",
  blue: "#2262f0",
  blueSoft: "#dbe7ff",
  ink: "#141821",
  line: "#d7dfeb",
  purple: "#7c3aed",
  purpleSoft: "#efe5ff",
  slate: "#5e6878",
  surface: "#ffffff",
  surfaceAlt: "#eef2f8",
  textOnDark: "#e5e2e1",
  textSoftOnDark: "#c3c6d7",
};

function createDocument() {
  const doc = new PDFDocument({
    autoFirstPage: false,
    compress: true,
    margin: 0,
    size: "A4",
  });

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  doc.pipe(fs.createWriteStream(OUTPUT_PATH));
  return doc;
}

function addPage(doc) {
  doc.addPage({ margin: 0, size: "A4" });
  return {
    bottom: doc.page.height,
    left: 56,
    right: doc.page.width - 56,
    top: 56,
    width: doc.page.width,
  };
}

function drawRoundedCard(doc, x, y, width, height, options = {}) {
  const {
    fill = COLORS.surface,
    lineWidth = 1,
    radius = 22,
    shadow = false,
    stroke = COLORS.line,
  } = options;

  if (shadow) {
    doc.save();
    doc.roundedRect(x, y + 10, width, height, radius).fillOpacity(0.08).fill("#000000");
    doc.restore();
  }

  doc.save();
  doc.roundedRect(x, y, width, height, radius);
  doc.fillAndStroke(fill, stroke);
  doc.lineWidth(lineWidth);
  doc.restore();
}

function drawPill(doc, x, y, text, options = {}) {
  const fill = options.fill ?? COLORS.blueSoft;
  const textColor = options.textColor ?? COLORS.blue;
  const fontSize = options.fontSize ?? 9;
  const width = doc.widthOfString(text, { font: "Helvetica-Bold", size: fontSize }) + 24;
  const height = 24;

  doc.save();
  doc.roundedRect(x, y, width, height, 999).fill(fill);
  doc.restore();

  doc
    .fillColor(textColor)
    .font("Helvetica-Bold")
    .fontSize(fontSize)
    .text(text.toUpperCase(), x, y + 7, {
      align: "center",
      width,
    });

  return width;
}

function drawSectionTitle(doc, x, y, eyebrow, title, description, options = {}) {
  if (eyebrow) {
    drawPill(doc, x, y, eyebrow, {
      fill: options.eyebrowFill ?? COLORS.blueSoft,
      textColor: options.eyebrowTextColor ?? COLORS.blue,
    });
  }

  const titleY = y + 34;
  doc
    .fillColor(options.titleColor ?? COLORS.ink)
    .font("Helvetica-Bold")
    .fontSize(options.titleSize ?? 24)
    .text(title, x, titleY, {
      width: options.width ?? 480,
    });

  doc
    .fillColor(options.descriptionColor ?? COLORS.slate)
    .font("Helvetica")
    .fontSize(options.descriptionSize ?? 11.5)
    .text(description, x, titleY + (options.titleGap ?? 42), {
      lineGap: 3,
      width: options.width ?? 480,
    });
}

function drawMetricCard(doc, x, y, width, height, metric) {
  drawRoundedCard(doc, x, y, width, height, {
    fill: metric.fill,
    radius: 20,
    shadow: true,
    stroke: metric.stroke ?? metric.fill,
  });

  doc
    .fillColor(metric.labelColor ?? COLORS.slate)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(metric.label.toUpperCase(), x + 18, y + 16, {
      width: width - 36,
    });

  doc
    .fillColor(metric.valueColor ?? COLORS.ink)
    .font("Helvetica-Bold")
    .fontSize(metric.valueSize ?? 24)
    .text(metric.value, x + 18, y + 34, {
      width: width - 36,
    });

  doc
    .fillColor(metric.descriptionColor ?? COLORS.slate)
    .font("Helvetica")
    .fontSize(10.5)
    .text(metric.description, x + 18, y + 72, {
      lineGap: 2,
      width: width - 36,
    });
}

function drawBulletList(doc, x, y, width, items, options = {}) {
  let currentY = y;

  items.forEach((item) => {
    doc.save();
    doc.circle(x + 5, currentY + 6, 2.5).fill(options.bulletColor ?? COLORS.blue);
    doc.restore();

    doc
      .fillColor(options.textColor ?? COLORS.slate)
      .font(options.bold ? "Helvetica-Bold" : "Helvetica")
      .fontSize(options.fontSize ?? 11.5)
      .text(item, x + 16, currentY, {
        lineGap: 3,
        width: width - 16,
      });

    currentY = doc.y + (options.gap ?? 8);
  });

  return currentY;
}

function drawChartPanel(doc, x, y, width, height) {
  drawRoundedCard(doc, x, y, width, height, {
    fill: COLORS.background,
    radius: 24,
    stroke: "#1f2937",
  });

  doc
    .fillColor(COLORS.textOnDark)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("Exemplo visual da leitura", x + 22, y + 20);

  doc
    .fillColor(COLORS.textSoftOnDark)
    .font("Helvetica")
    .fontSize(10.5)
    .text(
      "Azul representa investimento. Roxo representa resultados. O objetivo aqui e mostrar tendencia e relacao entre os movimentos ao longo do periodo.",
      x + 22,
      y + 44,
      { lineGap: 3, width: width - 44 },
    );

  const chartX = x + 22;
  const chartY = y + 94;
  const chartWidth = width - 44;
  const chartHeight = height - 128;
  const gridLines = 4;

  for (let index = 0; index < gridLines; index += 1) {
    const lineY = chartY + (chartHeight / (gridLines - 1)) * index;
    doc
      .save()
      .dash(4, { space: 8 })
      .moveTo(chartX, lineY)
      .lineTo(chartX + chartWidth, lineY)
      .strokeColor("rgba(255,255,255,0.16)")
      .lineWidth(1)
      .stroke()
      .undash()
      .restore();
  }

  const blueValues = [18, 48, 76, 42, 64, 24, 56, 82, 60, 72, 38, 70];
  const purpleValues = [10, 26, 52, 28, 44, 16, 36, 66, 34, 58, 22, 46];
  const maxValue = 90;

  function plotLine(values, color) {
    values.forEach((value, index) => {
      const pointX = chartX + (chartWidth / (values.length - 1)) * index;
      const pointY = chartY + chartHeight - (value / maxValue) * chartHeight;

      if (index === 0) {
        doc.moveTo(pointX, pointY);
      } else {
        doc.lineTo(pointX, pointY);
      }
    });

    doc.strokeColor(color).lineWidth(3).stroke();

    values.forEach((value, index) => {
      const pointX = chartX + (chartWidth / (values.length - 1)) * index;
      const pointY = chartY + chartHeight - (value / maxValue) * chartHeight;

      doc.save();
      doc.circle(pointX, pointY, 4).fill("#ffffff");
      doc.circle(pointX, pointY, 2.5).fill(color);
      doc.restore();
    });
  }

  doc.save();
  plotLine(blueValues, COLORS.blue);
  doc.restore();

  doc.save();
  plotLine(purpleValues, COLORS.purple);
  doc.restore();

  drawPill(doc, x + 22, y + height - 28, "Investimento", {
    fill: "#15336f",
    textColor: "#9fc2ff",
  });
  drawPill(doc, x + 130, y + height - 28, "Resultados", {
    fill: "#3b1f6b",
    textColor: "#d5beff",
  });
}

function drawLogo(doc, page) {
  if (!fs.existsSync(LOGO_PATH)) {
    return;
  }

  doc.image(LOGO_PATH, page.left, page.top - 16, {
    width: 160,
  });
}

function addFooter(doc, pageNumber) {
  doc
    .fillColor("#7b8596")
    .font("Helvetica")
    .fontSize(9)
    .text(`GSUCHOA • Guia do Cliente • Pagina ${pageNumber}`, 56, 800, {
      align: "right",
      width: 483,
    });
}

function pageOne(doc) {
  const page = addPage(doc);

  const gradient = doc.linearGradient(0, 0, page.width, 300);
  gradient.stop(0, "#0f172a");
  gradient.stop(0.5, "#16213a");
  gradient.stop(1, "#1d1b3a");
  doc.rect(0, 0, page.width, 842).fill(gradient);

  doc.save();
  doc.circle(500, 98, 90).fillOpacity(0.16).fill(COLORS.blue);
  doc.circle(452, 136, 66).fillOpacity(0.12).fill(COLORS.purple);
  doc.restore();

  drawLogo(doc, page);

  drawPill(doc, page.left, 120, "Guia do cliente", {
    fill: "rgba(255,255,255,0.12)",
    textColor: "#dfe8ff",
  });

  doc
    .fillColor(COLORS.textOnDark)
    .font("Helvetica-Bold")
    .fontSize(31)
    .text("Como o investimento vira resultado no grafico de linha do tempo", page.left, 164, {
      width: 410,
      lineGap: 4,
    });

  doc
    .fillColor(COLORS.textSoftOnDark)
    .font("Helvetica")
    .fontSize(13)
    .text(
      "Um material simples, visual e pronto para apresentacao. A ideia e ajudar o cliente a entender quanto investiu, o que recebeu em troca e como ler a evolucao dos resultados ao longo do periodo.",
      page.left,
      264,
      { lineGap: 4, width: 400 },
    );

  drawRoundedCard(doc, 56, 360, 483, 150, {
    fill: "rgba(255,255,255,0.96)",
    radius: 28,
    stroke: "rgba(255,255,255,0.12)",
  });

  const metrics = [
    {
      description: "Soma de tudo o que foi colocado em midia no periodo selecionado.",
      fill: COLORS.blueSoft,
      label: "Investimento",
      value: "R$ diario + total",
      valueColor: COLORS.blue,
    },
    {
      description: "Quantidade de acoes relevantes geradas pela campanha no periodo.",
      fill: COLORS.purpleSoft,
      label: "Resultados",
      value: "Volume entregue",
      valueColor: COLORS.purple,
    },
    {
      description: "Leitura simples da eficiencia media: quanto custou para gerar cada resultado.",
      fill: COLORS.surfaceAlt,
      label: "Custo por resultado",
      value: "Investimento / resultado",
      valueColor: COLORS.ink,
      valueSize: 19,
    },
  ];

  metrics.forEach((metric, index) => {
    drawMetricCard(doc, 76 + index * 149, 384, 129, 104, metric);
  });

  drawSectionTitle(
    doc,
    page.left,
    560,
    "Leitura rapida",
    "O que o cliente deve entender de imediato",
    "O grafico nao existe apenas para mostrar linhas. Ele foi pensado para responder tres perguntas centrais: quanto investimos, quantos resultados isso gerou e como essa relacao evoluiu ao longo do tempo.",
    {
      descriptionColor: COLORS.textSoftOnDark,
      eyebrowFill: "rgba(255,255,255,0.12)",
      eyebrowTextColor: "#dfe8ff",
      titleColor: COLORS.textOnDark,
      width: 470,
    },
  );

  drawRoundedCard(doc, 56, 664, 483, 112, {
    fill: "rgba(255,255,255,0.08)",
    radius: 24,
    stroke: "rgba(255,255,255,0.08)",
  });

  drawBulletList(doc, 80, 688, 430, [
    "Linha azul = valor investido em cada dia.",
    "Linha roxa = quantidade de resultados gerados em cada dia.",
    "Quando as duas crescem juntas, a campanha mostra tracao. Quando a verba sobe e o resultado nao acompanha, existe espaco para otimizacao.",
  ], {
    bulletColor: "#9fc2ff",
    textColor: COLORS.textOnDark,
  });

  addFooter(doc, 1);
}

function pageTwo(doc) {
  addPage(doc);

  drawLogo(doc, { left: 56, top: 56 });
  drawSectionTitle(
    doc,
    56,
    72,
    "Investimento",
    "Como chegamos no numero investido",
    "Investimento e a soma de tudo o que a campanha consumiu em midia no periodo analisado. No grafico, cada ponto azul representa exatamente o valor gasto em um dia especifico.",
    { width: 470 },
  );

  drawMetricCard(doc, 56, 176, 230, 122, {
    description: "Valor investido em cada dia.",
    fill: COLORS.blueSoft,
    label: "No grafico",
    value: "Investimento diario",
    valueColor: COLORS.blue,
  });

  drawMetricCard(doc, 309, 176, 230, 122, {
    description: "Soma de todos os dias selecionados.",
    fill: COLORS.surfaceAlt,
    label: "No resumo",
    value: "Investimento total",
    valueColor: COLORS.ink,
  });

  drawRoundedCard(doc, 56, 330, 483, 176, {
    fill: COLORS.surface,
    radius: 24,
    shadow: true,
  });

  doc
    .fillColor(COLORS.ink)
    .font("Helvetica-Bold")
    .fontSize(17)
    .text("Exemplo simples de leitura", 78, 352);

  drawBulletList(doc, 78, 388, 440, [
    "Dia 01: R$ 120,00",
    "Dia 02: R$ 150,00",
    "Dia 03: R$ 130,00",
    "Investimento total do periodo: R$ 400,00",
  ]);

  doc
    .fillColor(COLORS.slate)
    .font("Helvetica")
    .fontSize(11)
    .text(
      "Quando o cliente olha para a linha azul, ele esta vendo a distribuicao do investimento no tempo. Quando olha para o card de resumo, ele ve a soma desse movimento.",
      78,
      468,
      { lineGap: 3, width: 430 },
    );

  drawChartPanel(doc, 56, 540, 483, 214);
  addFooter(doc, 2);
}

function pageThree(doc) {
  addPage(doc);

  drawLogo(doc, { left: 56, top: 56 });
  drawSectionTitle(
    doc,
    56,
    72,
    "Resultados",
    "Quais resultados podem aparecer nesse numero",
    "Resultado e a principal acao que a campanha foi configurada para gerar. O nome exato muda conforme o objetivo de negocio, mas a ideia e sempre a mesma: mostrar o retorno concreto da verba investida.",
    { width: 470 },
  );

  const leftColumnItems = [
    "Conversas iniciadas",
    "Primeiras respostas",
    "Leads captados",
    "Contatos gerados",
  ];
  const rightColumnItems = [
    "Cadastros concluidos",
    "Compras realizadas",
    "Visitas qualificadas",
    "Outras acoes principais da campanha",
  ];

  drawRoundedCard(doc, 56, 188, 230, 220, {
    fill: COLORS.purpleSoft,
    radius: 24,
  });
  doc
    .fillColor(COLORS.purple)
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("Exemplos frequentes", 78, 212);
  drawBulletList(doc, 78, 248, 186, leftColumnItems, {
    bulletColor: COLORS.purple,
  });

  drawRoundedCard(doc, 309, 188, 230, 220, {
    fill: COLORS.blueSoft,
    radius: 24,
  });
  doc
    .fillColor(COLORS.blue)
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("Tambem pode significar", 331, 212);
  drawBulletList(doc, 331, 248, 186, rightColumnItems, {
    bulletColor: COLORS.blue,
  });

  drawRoundedCard(doc, 56, 438, 483, 152, {
    fill: COLORS.surface,
    radius: 24,
    shadow: true,
  });

  doc
    .fillColor(COLORS.ink)
    .font("Helvetica-Bold")
    .fontSize(17)
    .text("O ponto mais importante para o cliente", 78, 462);

  doc
    .fillColor(COLORS.slate)
    .font("Helvetica")
    .fontSize(11.5)
    .text(
      "O numero de resultados precisa ser lido junto com o objetivo da campanha. Quarenta resultados podem significar quarenta conversas, quarenta leads ou quarenta compras. O volume pode ser igual, mas o valor de negocio muda conforme a estrategia.",
      78,
      494,
      { lineGap: 3, width: 430 },
    );

  drawMetricCard(doc, 56, 624, 150, 108, {
    description: "Campanha voltada para abrir atendimento.",
    fill: COLORS.surfaceAlt,
    label: "Mensagem",
    value: "Conversa",
    valueColor: COLORS.ink,
    valueSize: 22,
  });
  drawMetricCard(doc, 222, 624, 150, 108, {
    description: "Campanha voltada para captacao.",
    fill: COLORS.surfaceAlt,
    label: "Lead",
    value: "Contato",
    valueColor: COLORS.ink,
    valueSize: 22,
  });
  drawMetricCard(doc, 388, 624, 150, 108, {
    description: "Campanha voltada para venda.",
    fill: COLORS.surfaceAlt,
    label: "Venda",
    value: "Compra",
    valueColor: COLORS.ink,
    valueSize: 22,
  });

  addFooter(doc, 3);
}

function pageFour(doc) {
  addPage(doc);

  drawLogo(doc, { left: 56, top: 56 });
  drawSectionTitle(
    doc,
    56,
    72,
    "Interpretacao",
    "Como explicar o grafico em uma reuniao com o cliente",
    "A melhor leitura nao acontece olhando um unico ponto isolado. O valor do grafico esta em revelar tendencia, ritmo e eficiencia ao longo do periodo.",
    { width: 470 },
  );

  const cards = [
    {
      color: COLORS.blueSoft,
      title: "Azul sobe e roxo sobe",
      text: "O aumento de investimento veio acompanhado de mais resultado.",
      titleColor: COLORS.blue,
    },
    {
      color: COLORS.purpleSoft,
      title: "Azul sobe e roxo nao acompanha",
      text: "A verba cresceu, mas o retorno nao aumentou na mesma proporcao. Normalmente esse cenario pede otimizacao.",
      titleColor: COLORS.purple,
    },
    {
      color: COLORS.surfaceAlt,
      title: "Azul controlado e roxo sobe",
      text: "A campanha ganhou eficiencia. O retorno melhorou sem depender de grande aumento de verba.",
      titleColor: COLORS.ink,
    },
  ];

  cards.forEach((card, index) => {
    const x = 56 + index * 161;
    drawRoundedCard(doc, x, 196, 145, 194, {
      fill: card.color,
      radius: 24,
    });
    doc
      .fillColor(card.titleColor)
      .font("Helvetica-Bold")
      .fontSize(15)
      .text(card.title, x + 16, 218, {
        lineGap: 2,
        width: 113,
      });
    doc
      .fillColor(COLORS.slate)
      .font("Helvetica")
      .fontSize(10.5)
      .text(card.text, x + 16, 288, {
        lineGap: 3,
        width: 113,
      });
  });

  drawRoundedCard(doc, 56, 430, 483, 138, {
    fill: COLORS.background,
    radius: 24,
  });

  doc
    .fillColor(COLORS.textOnDark)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("A frase mais clara para apresentacao", 78, 454);
  doc
    .fillColor(COLORS.textSoftOnDark)
    .font("Helvetica")
    .fontSize(12)
    .text(
      "Neste periodo investimos X. Esse investimento gerou Y resultados. Neste caso, o resultado principal da campanha foi Z. Com isso, o custo medio por resultado ficou em W.",
      78,
      490,
      { lineGap: 4, width: 430 },
    );

  drawMetricCard(doc, 56, 604, 230, 124, {
    description: "Formula simples para explicar eficiencia media no periodo.",
    fill: COLORS.blueSoft,
    label: "Formula",
    value: "Investimento / resultados",
    valueColor: COLORS.blue,
    valueSize: 20,
  });

  drawMetricCard(doc, 309, 604, 230, 124, {
    description: "O ideal e sempre ler junto com o tipo de resultado que a campanha entrega.",
    fill: COLORS.purpleSoft,
    label: "Leitura correta",
    value: "Volume + tipo + custo",
    valueColor: COLORS.purple,
    valueSize: 20,
  });

  addFooter(doc, 4);
}

function pageFive(doc) {
  addPage(doc);

  drawLogo(doc, { left: 56, top: 56 });
  drawSectionTitle(
    doc,
    56,
    72,
    "Resumo final",
    "O que esse grafico comprova para o cliente",
    "Quando investimento, resultados e custo por resultado sao apresentados juntos, o painel deixa de ser apenas um relatorio e passa a mostrar valor de negocio com clareza.",
    { width: 470 },
  );

  drawRoundedCard(doc, 56, 182, 483, 382, {
    fill: COLORS.surface,
    radius: 28,
    shadow: true,
  });

  const summaryItems = [
    "Mostra quanto foi investido ao longo do periodo.",
    "Mostra quantos resultados foram gerados ao longo do periodo.",
    "Ajuda o cliente a entender quais resultados sao esses.",
    "Facilita a leitura da evolucao diaria, sem depender de planilha.",
    "Cria uma narrativa mais profissional para apresentacao da agencia.",
    "Reforca percepcao de controle, acompanhamento e entrega.",
  ];

  drawBulletList(doc, 84, 222, 430, summaryItems, {
    bulletColor: COLORS.blue,
    fontSize: 12,
    gap: 12,
  });

  drawRoundedCard(doc, 56, 592, 230, 140, {
    fill: COLORS.blueSoft,
    radius: 24,
  });
  doc
    .fillColor(COLORS.blue)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("Mensagem-chave", 78, 618);
  doc
    .fillColor(COLORS.slate)
    .font("Helvetica")
    .fontSize(11)
    .text(
      "Nao se trata apenas de verba gasta. O grafico ajuda a mostrar como o investimento se transformou em retorno.",
      78,
      652,
      { lineGap: 3, width: 186 },
    );

  drawRoundedCard(doc, 309, 592, 230, 140, {
    fill: COLORS.purpleSoft,
    radius: 24,
  });
  doc
    .fillColor(COLORS.purple)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("Uso ideal", 331, 618);
  doc
    .fillColor(COLORS.slate)
    .font("Helvetica")
    .fontSize(11)
    .text(
      "Perfeito para apresentacoes mensais, prestacao de contas e reunioes de alinhamento com o cliente.",
      331,
      652,
      { lineGap: 3, width: 186 },
    );

  addFooter(doc, 5);
}

function generatePdf() {
  const doc = createDocument();

  pageOne(doc);
  pageTwo(doc);
  pageThree(doc);
  pageFour(doc);
  pageFive(doc);

  doc.end();
}

generatePdf();
