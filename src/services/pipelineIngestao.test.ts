/**
 * CONFORMA GSASP — Testes de Integração do Pipeline de Ingestão (S5.1.2B)
 * Executado nativamente pelo Node.js test runner sem dependência de DOM.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

// Polyfill defensivo restrito ao ambiente de teste Node.js
if (typeof (Uint8Array.prototype as any).toHex !== 'function') {
  (Uint8Array.prototype as any).toHex = function (): string {
    return Array.from(this as Uint8Array)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };
}

import { executarPipelineIngestao } from './pipelineIngestao.ts';
import { ErroLeituraPdf } from './leitorPdf.ts';

/**
 * Mapeia caracteres especiais e acentuados da língua portuguesa para a codificação WinAnsi do PDF.
 */
function escaparParaWinAnsiPdf(str: string): string {
  return str.replace(/[\(\)\\]|[^\x20-\x7E]/g, (char) => {
    if (char === '\\') return '\\\\';
    if (char === '(') return '\\(';
    if (char === ')') return '\\)';
    const mapaOctal: Record<string, string> = {
      'Á': '\\301', 'Â': '\\302', 'Ã': '\\303', 'É': '\\311', 'Ê': '\\312',
      'Í': '\\315', 'Ó': '\\323', 'Ô': '\\324', 'Õ': '\\325', 'Ú': '\\332',
      'Ç': '\\307', 'á': '\\341', 'â': '\\342', 'ã': '\\343', 'é': '\\351',
      'ê': '\\352', 'í': '\\355', 'ó': '\\363', 'ô': '\\364', 'õ': '\\365',
      'ú': '\\372', 'ç': '\\347', 'º': '\\272', 'ª': '\\252', '–': '-', '—': '-'
    };
    return mapaOctal[char] || char;
  });
}

/**
 * Utilitário sintético para gerar PDFs válidos de N páginas em memória sem dependência externa.
 */
function gerarPdfSintetico(paginas: (string | string[])[]): Uint8Array {
  const numPaginas = paginas.length;
  const kids = paginas.map((_, idx) => `${3 + idx * 2} 0 R`).join(' ');

  let body = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  body += `2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${numPaginas} >>\nendobj\n`;

  paginas.forEach((conteudo, idx) => {
    const pageObjNum = 3 + idx * 2;
    const contentObjNum = 4 + idx * 2;
    const linhas = Array.isArray(conteudo) ? conteudo : [conteudo];
    let stream = 'BT\n/F1 12 Tf\n72 750 Td\n';
    linhas.forEach((linha, lIdx) => {
      if (lIdx > 0) {
        stream += '0 -25 Td\n';
      }
      if (linha.length > 0) {
        stream += `(${escaparParaWinAnsiPdf(linha)}) Tj\n`;
      }
    });
    stream += 'ET';

    body += `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >> >> >> /Contents ${contentObjNum} 0 R >>\nendobj\n`;
    body += `${contentObjNum} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`;
  });

  const totalObjs = 2 + numPaginas * 2;
  body += `xref\n0 ${totalObjs + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= totalObjs; i++) {
    body += `0000000010 00000 n \n`;
  }
  body += `trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\nstartxref\n${body.length}\n%%EOF`;

  return new TextEncoder().encode(body);
}

test('S5.1.2B - pipelineIngestao: ciclo completo PDF -> extração -> montagem do dossiê', async () => {
  const linhasMinuta = [
    'ESTADO DE MATO GROSSO',
    'PROCESSO SEDUC-PRO-2026/01234',
    'TERMO DE CONTRATAÇÃO PÚBLICA',
    'CONTRATO ADMINISTRATIVO N 045/2026',
    'CONTRATADA: TECH SOLUTIONS LTDA CNPJ: 12.345.678/0001-90',
    'PREGAO ELETRONICO N 012/2026',
    'CLÁUSULA PRIMEIRA - DO OBJETO: Prestação de serviços de suporte técnico em TI.',
    'CLÁUSULA QUINTA - DO VALOR: O valor global deste contrato é de R$ 240.000,00.',
    'CLÁUSULA NONA - DA VIGÊNCIA:',
    'O presente contrato vigorará com vigência a contar de 01/02/2026 até 31/01/2027.'
  ];

  const bytes = gerarPdfSintetico([linhasMinuta]);
  const resultado = await executarPipelineIngestao({
    arquivo: bytes,
    nomeArquivo: 'minuta_contrato_seduc.pdf'
  });

  const { dossie, documentoTexto } = resultado;

  // 1. Integridade do Dossiê e Identificadores
  assert.ok(dossie, 'Dossiê deve ser retornado');
  assert.ok(dossie.id.startsWith('dossie-'), 'ID do dossiê deve possuir prefixo');
  assert.ok(dossie.executionId, 'executionId é obrigatório');
  assert.match(
    dossie.executionId,
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    'executionId deve ser um UUID válido'
  );
  assert.equal(dossie.aiRunId, undefined, 'aiRunId deve estar estritamente ausente');
  assert.equal(dossie.nomeArquivo, 'minuta_contrato_seduc.pdf');
  assert.equal(dossie.totalPaginas, 1);
  assert.equal(dossie.coberturaTextual, 'integral');
  assert.ok(dossie.tamanhoBytes > 0, 'Tamanho em bytes deve ser positivo');
  assert.ok(!isNaN(Date.parse(dossie.timestampCriacao)), 'Timestamp de criação deve ser ISO válido');

  // 2. Garantia de que TODOS os 9 campos estão em estado 'pendente' de revisão
  const chavesCampos = Object.keys(dossie.campos) as (keyof typeof dossie.campos)[];
  assert.equal(chavesCampos.length, 9, 'Deve conter exatamente os 9 campos da Identificação');
  for (const chave of chavesCampos) {
    const campo = dossie.campos[chave];
    assert.equal(campo.estadoRevisao, 'pendente', `Campo ${chave} deve estar com estadoRevisao pendente`);
  }

  // 3. Validação dos campos extraídos factualmente
  assert.equal(dossie.campos.numeroProcesso.valorSugerido, 'SEDUC-PRO-2026/01234');
  assert.equal(dossie.campos.numeroProcesso.estadoExtracao, 'localizado');
  assert.ok(dossie.campos.numeroProcesso.evidencias.length > 0);
  assert.equal(dossie.campos.numeroProcesso.evidencias[0].pagina, 1);

  assert.equal(dossie.campos.tipoInstrumento.valorSugerido, 'CONTRATO ADMINISTRATIVO N 045/2026');
  assert.equal(dossie.campos.tipoInstrumento.estadoExtracao, 'localizado');

  assert.equal(dossie.campos.contratadoInteressado.valorSugerido, 'TECH SOLUTIONS LTDA');
  assert.equal(dossie.campos.contratadoInteressado.estadoExtracao, 'localizado');

  assert.equal(dossie.campos.cnpjCpf.valorSugerido, '12.345.678/0001-90');
  assert.equal(dossie.campos.cnpjCpf.estadoExtracao, 'localizado');

  assert.equal(dossie.campos.valor.valorSugerido, 240000);
  assert.equal(dossie.campos.valor.estadoExtracao, 'localizado');

  assert.equal(dossie.campos.vigenciaInicio.valorSugerido, '2026-02-01');
  assert.equal(dossie.campos.vigenciaFim.valorSugerido, '2027-01-31');

  // 4. Documento intermediário retornado intacto
  assert.ok(documentoTexto);
  assert.equal(documentoTexto.totalPaginas, 1);
});

test('S5.1.2B - pipelineIngestao: documento misto gera inconclusivo para campos ausentes com diagnóstico', async () => {
  // P1 tem número de processo e CNPJ, mas não tem objeto nem valor
  // P2 não tem texto útil
  const pagina1 = 'ESTADO DE MATO GROSSO PROCESSO SAD-PRO-2026/99999 CONTRATADA: ALFA LTDA CNPJ: 99.888.777/0001-66';
  const pagina2 = '';

  const bytes = gerarPdfSintetico([pagina1, pagina2]);
  const resultado = await executarPipelineIngestao({
    arquivo: bytes,
    nomeArquivo: 'misto_inconclusivo.pdf'
  });

  const { dossie } = resultado;
  assert.equal(dossie.coberturaTextual, 'misto');
  assert.deepEqual(dossie.paginasSemTexto, [2]);

  // Campo presente na P1 é localizado normalmente
  assert.equal(dossie.campos.numeroProcesso.estadoExtracao, 'localizado');

  // Campo ausente na P1 em documento misto torna-se inconclusivo com diagnóstico técnico
  assert.equal(dossie.campos.valor.estadoExtracao, 'inconclusivo');
  assert.equal(dossie.campos.valor.valorSugerido, null);
  assert.deepEqual(dossie.campos.valor.diagnosticoExtracao?.paginasNaoAnalisaveis, [2]);
  assert.equal(dossie.campos.valor.justificativaEdicao, undefined, 'justificativaEdicao humana deve ser undefined');
});

test('S5.1.2B - pipelineIngestao: repassa exceções do leitor preservando códigos de erro', async () => {
  const bytesCorrompidos = new Uint8Array([0x01, 0x02, 0x03]);

  await assert.rejects(
    async () => {
      await executarPipelineIngestao({
        arquivo: bytesCorrompidos,
        nomeArquivo: 'corrompido.pdf'
      });
    },
    (err: unknown) => {
      assert.ok(err instanceof ErroLeituraPdf);
      assert.equal(err.codigo, 'PDF_CORROMPIDO_OU_INVALIDO');
      return true;
    }
  );
});
