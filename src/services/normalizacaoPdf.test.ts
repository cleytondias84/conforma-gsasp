/**
 * CONFORMA GSASP — Testes Unitários de Normalização Textual (S5.1.2A)
 * Executado nativamente pelo Node.js test runner
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  removerCaracteresControle,
  normalizarUnicode,
  removerSoftHyphen,
  corrigirHifenQuebraLinha,
  unificarEspacos,
  normalizarQuebras,
  normalizarTextoPdf,
  contarCaracteresUteis,
  criarPaginaPdfTexto,
  criarDocumentoPdfTexto,
  extrairTrechoEvidencia
} from './normalizacaoPdf.ts';

test('removerCaracteresControle: remove caracteres não imprimíveis preservando quebras e tabulações', () => {
  const entrada = 'Linha 1\u0000\u0007\uFEFF\nLinha 2\t\u001FTexto';
  const saida = removerCaracteresControle(entrada);
  assert.strictEqual(saida, 'Linha 1\nLinha 2\tTexto');
});

test('normalizarUnicode: converte ligaduras tipográficas e caracteres compatíveis via NFKC', () => {
  const ligaduras = 'ﬁlme e ﬂuxo'; // ligaduras fi e fl
  const normalizado = normalizarUnicode(ligaduras);
  assert.strictEqual(normalizado, 'filme e fluxo');
});

test('removerSoftHyphen: remove caractere de quebra silábica invisível (u00AD)', () => {
  const comSoft = 'con\u00ADtra\u00ADta\u00ADdo';
  const limpo = removerSoftHyphen(comSoft);
  assert.strictEqual(limpo, 'contratado');
});

test('corrigirHifenQuebraLinha: une palavras partidas por hífen no final de linha', () => {
  const entrada = 'A CON-\nTRATADA executará o PRE-\r\nGÃO eletrônico.';
  const corrigido = corrigirHifenQuebraLinha(entrada);
  assert.strictEqual(corrigido, 'A CONTRATADA executará o PREGÃO eletrônico.');
});

test('unificarEspacos: colapsa múltiplos espaços horizontais e apara pontas de linha', () => {
  const entrada = '  Texto   com    muitos      espaços.  \n   Outra   linha.  ';
  const unificado = unificarEspacos(entrada);
  assert.strictEqual(unificado, 'Texto com muitos espaços.\nOutra linha.');
});

test('normalizarQuebras: padroniza CRLF para LF e colapsa 3 ou mais quebras', () => {
  const entrada = 'Parágrafo 1\r\n\r\n\r\n\r\nParágrafo 2\rLinha 3';
  const normalizado = normalizarQuebras(entrada);
  assert.strictEqual(normalizado, 'Parágrafo 1\n\nParágrafo 2\nLinha 3');
});

test('normalizarTextoPdf: pipeline completo executa sem mutação de string', () => {
  const entrada = '  PROCESSO\u0000  Nº \n\n\n SESP-PRO-2026/00100  \n\n CON-\nTRATO  ';
  const resultado = normalizarTextoPdf(entrada);
  assert.strictEqual(resultado, 'PROCESSO Nº\n\nSESP-PRO-2026/00100\n\nCONTRATO');
});

test('contarCaracteresUteis: desconsidera espaços em branco e quebras', () => {
  assert.strictEqual(contarCaracteresUteis('  A B C \n\t '), 3);
  assert.strictEqual(contarCaracteresUteis(''), 0);
});

test('criarPaginaPdfTexto: classifica adequadamente página com e sem texto útil', () => {
  const pagComTexto = criarPaginaPdfTexto(1, 'CLÁUSULA PRIMEIRA - DO OBJETO DO CONTRATO ADMINISTRATIVO', 20);
  assert.strictEqual(pagComTexto.numeroPagina, 1);
  assert.strictEqual(pagComTexto.temTextoUtil, true);
  assert.ok(pagComTexto.contagemCaracteresUteis >= 20);

  const pagSemTexto = criarPaginaPdfTexto(2, '   carimbo isolado ', 30);
  assert.strictEqual(pagSemTexto.numeroPagina, 2);
  assert.strictEqual(pagSemTexto.temTextoUtil, false);
});

test('criarDocumentoPdfTexto: deriva integral, misto e sem_texto com lista de páginas vazias', () => {
  // Documento Integral
  const docIntegral = criarDocumentoPdfTexto('doc1.pdf', [
    { numeroPagina: 1, textoBruto: 'Página 1 com texto suficientemente longo para teste' },
    { numeroPagina: 2, textoBruto: 'Página 2 também com texto suficientemente longo para teste' }
  ], 15);
  assert.strictEqual(docIntegral.coberturaTextual, 'integral');
  assert.deepStrictEqual(docIntegral.paginasSemTexto, []);

  // Documento Misto
  const docMisto = criarDocumentoPdfTexto('doc2.pdf', [
    { numeroPagina: 1, textoBruto: 'Página 1 com texto longo' },
    { numeroPagina: 2, textoBruto: '    ' }, // sem texto
    { numeroPagina: 3, textoBruto: 'Página 3 com texto longo' }
  ], 15);
  assert.strictEqual(docMisto.coberturaTextual, 'misto');
  assert.deepStrictEqual(docMisto.paginasSemTexto, [2]);

  // Documento Sem Texto
  const docSemTexto = criarDocumentoPdfTexto('doc3.pdf', [
    { numeroPagina: 1, textoBruto: '   ' },
    { numeroPagina: 2, textoBruto: '' }
  ], 15);
  assert.strictEqual(docSemTexto.coberturaTextual, 'sem_texto');
  assert.deepStrictEqual(docSemTexto.paginasSemTexto, [1, 2]);
});

test('extrairTrechoEvidencia: extrai recorte fiel do texto com marcadores de elipse', () => {
  const texto = 'CLÁUSULA QUINTA - DO VALOR: O valor global deste termo é de R$ 150.000,00 para execução dos serviços.';
  const posInicio = texto.indexOf('R$ 150.000,00');
  const posFim = posInicio + 'R$ 150.000,00'.length;

  const trecho = extrairTrechoEvidencia(texto, posInicio, posFim, 20);
  assert.ok(trecho.includes('R$ 150.000,00'));
  assert.ok(trecho.includes('termo é de'));
});
