/**
 * CONFORMA GSASP — Testes Unitários do Extrator Determinístico (S5.1.2A)
 * Executado nativamente pelo Node.js test runner
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { extrairCamposIdentificacao } from './extratorIdentificacao.ts';
import {
  getFixtureContratoRegular,
  getFixtureTermoAditivo,
  getFixtureValorMultiplasEvidencias,
  getFixtureValoresConflitantesAmbiguo,
  getFixtureCampoAusenteNaoLocalizado,
  getFixtureDocumentoMistoInconclusivo,
  getFixtureDocumentoSemTexto,
  getFixturePalavrasQuebradasLinhaHifen,
  getFixtureFormatosDistintosDatasValores
} from './fixtures/minutasFixtures.ts';

test('1. Contrato regular: extrai todos os 9 campos com estado localizado e pendente de revisão', () => {
  const doc = getFixtureContratoRegular();
  const mapa = extrairCamposIdentificacao(doc, 'exec-01');

  // 1. numeroProcesso
  assert.strictEqual(mapa.numeroProcesso.estadoExtracao, 'localizado');
  assert.strictEqual(mapa.numeroProcesso.valorSugerido, 'SESP-PRO-2026/00123');
  assert.strictEqual(mapa.numeroProcesso.estadoRevisao, 'pendente');
  assert.strictEqual(mapa.numeroProcesso.evidencias[0].pagina, 1);

  // 2. tipoInstrumento
  assert.strictEqual(mapa.tipoInstrumento.estadoExtracao, 'localizado');
  assert.ok(mapa.tipoInstrumento.valorSugerido?.includes('CONTRATO ADMINISTRATIVO'));

  // 3. contratadoInteressado
  assert.strictEqual(mapa.contratadoInteressado.estadoExtracao, 'localizado');
  assert.ok(mapa.contratadoInteressado.valorSugerido?.includes('TECH SOLUÇÕES'));

  // 4. cnpjCpf
  assert.strictEqual(mapa.cnpjCpf.estadoExtracao, 'localizado');
  assert.strictEqual(mapa.cnpjCpf.valorSugerido, '12.345.678/0001-90');

  // 5. objeto
  assert.strictEqual(mapa.objeto.estadoExtracao, 'localizado');
  assert.ok(mapa.objeto.valorSugerido?.includes('sustentação de infraestrutura'));
  assert.strictEqual(mapa.objeto.evidencias[0].pagina, 2);

  // 6. valor
  assert.strictEqual(mapa.valor.estadoExtracao, 'localizado');
  assert.strictEqual(mapa.valor.valorSugerido, 360000);
  assert.strictEqual(mapa.valor.evidencias[0].pagina, 3);

  // 7. vigenciaInicio e 8. vigenciaFim
  assert.strictEqual(mapa.vigenciaInicio.estadoExtracao, 'localizado');
  assert.strictEqual(mapa.vigenciaInicio.valorSugerido, '2026-05-01');
  assert.strictEqual(mapa.vigenciaFim.estadoExtracao, 'localizado');
  assert.strictEqual(mapa.vigenciaFim.valorSugerido, '2027-05-01');
  assert.strictEqual(mapa.vigenciaInicio.evidencias[0].pagina, 4);

  // 9. modalidadeOrigem
  assert.strictEqual(mapa.modalidadeOrigem.estadoExtracao, 'localizado');
  assert.ok(mapa.modalidadeOrigem.valorSugerido?.includes('PREGÃO ELETRÔNICO Nº 05/2026'));
});

test('2. Termo Aditivo: extração de aditamento com objeto e valor aditado', () => {
  const doc = getFixtureTermoAditivo();
  const mapa = extrairCamposIdentificacao(doc, 'exec-02');

  assert.strictEqual(mapa.numeroProcesso.valorSugerido, 'SESP-PRO-2026/00456');
  assert.ok(mapa.tipoInstrumento.valorSugerido?.includes('TERMO ADITIVO'));
  assert.ok(mapa.contratadoInteressado.valorSugerido?.includes('INOVA SERVIÇOS'));
  assert.strictEqual(mapa.cnpjCpf.valorSugerido, '98.765.432/0001-10');
  assert.strictEqual(mapa.valor.valorSugerido, 85000);
  assert.strictEqual(mapa.vigenciaInicio.valorSugerido, '2026-06-01');
  assert.strictEqual(mapa.vigenciaFim.valorSugerido, '2026-12-01');
  assert.ok(mapa.modalidadeOrigem.valorSugerido?.includes('DISPENSA DE LICITAÇÃO'));
});

test('3. Valor com múltiplas evidências concordantes: acumula evidências mantendo candidato único', () => {
  const doc = getFixtureValorMultiplasEvidencias();
  const mapa = extrairCamposIdentificacao(doc, 'exec-03');

  assert.strictEqual(mapa.valor.estadoExtracao, 'localizado');
  assert.strictEqual(mapa.valor.valorSugerido, 180000);
  assert.strictEqual(mapa.valor.evidencias.length, 2, 'Deve acumular duas ocorrências de R$ 180.000,00');
  assert.strictEqual(mapa.valor.evidencias[0].pagina, 2, 'Primeira evidência na Cláusula 4ª (pág 2)');
  assert.strictEqual(mapa.valor.evidencias[1].pagina, 3, 'Segunda evidência na Cláusula 10ª (pág 3)');
  assert.strictEqual(mapa.valor.candidatos?.length, 1, 'Deve possuir apenas 1 candidato unificado');
});

test('4. Valores conflitantes: gera estado ambiguo, valorSugerido null e preserva candidatos separados', () => {
  const doc = getFixtureValoresConflitantesAmbiguo();
  const mapa = extrairCamposIdentificacao(doc, 'exec-04');

  assert.strictEqual(mapa.valor.estadoExtracao, 'ambiguo');
  assert.strictEqual(mapa.valor.valorSugerido, null, 'Não deve decidir arbitrariamente entre valores conflitantes');
  assert.strictEqual(mapa.valor.estadoRevisao, 'pendente');
  assert.ok(mapa.valor.candidatos && mapa.valor.candidatos.length >= 2, 'Deve registrar os candidatos conflitantes');

  const valoresCandidatos = mapa.valor.candidatos?.map((c) => c.valor);
  assert.ok(valoresCandidatos?.includes(40000), 'Deve conter o candidato de R$ 40.000,00');
  assert.ok(valoresCandidatos?.includes(240000), 'Deve conter o candidato de R$ 240.000,00');

  // Cada candidato preserva suas próprias evidências
  const cand40k = mapa.valor.candidatos?.find((c) => c.valor === 40000);
  const cand240k = mapa.valor.candidatos?.find((c) => c.valor === 240000);
  assert.strictEqual(cand40k?.evidencias[0].pagina, 2);
  assert.strictEqual(cand240k?.evidencias[0].pagina, 3);
});

test('5. Campo ausente factual em documento integral: gera nao_localizado com evidencias vazias', () => {
  const doc = getFixtureCampoAusenteNaoLocalizado();
  const mapa = extrairCamposIdentificacao(doc, 'exec-05');

  // Cessão gratuita sem valor
  assert.strictEqual(mapa.valor.estadoExtracao, 'nao_localizado');
  assert.strictEqual(mapa.valor.valorSugerido, null);
  assert.deepStrictEqual(mapa.valor.evidencias, []);

  // Sem modalidade de licitação
  assert.strictEqual(mapa.modalidadeOrigem.estadoExtracao, 'nao_localizado');
  assert.strictEqual(mapa.modalidadeOrigem.valorSugerido, null);
  assert.deepStrictEqual(mapa.modalidadeOrigem.evidencias, []);
});

test('6. Documento misto: campos ausentes nas páginas textuais geram inconclusivo com diagnosticoExtracao', () => {
  const doc = getFixtureDocumentoMistoInconclusivo();
  const mapa = extrairCamposIdentificacao(doc, 'exec-06');

  // Processo, Instrumento e Contratada estavam na pág 1 -> localizados
  assert.strictEqual(mapa.numeroProcesso.estadoExtracao, 'localizado');
  assert.strictEqual(mapa.contratadoInteressado.estadoExtracao, 'localizado');

  // Valor e Vigência não estavam nas páginas 1 e 2, e págs 3 e 4 estão sem texto -> inconclusivo
  assert.strictEqual(mapa.valor.estadoExtracao, 'inconclusivo');
  assert.strictEqual(mapa.valor.valorSugerido, null);
  assert.strictEqual(mapa.valor.justificativaEdicao, undefined, 'justificativaEdicao permanece exclusivamente humana e ausente');
  assert.ok(mapa.valor.diagnosticoExtracao, 'Deve conter diagnosticoExtracao gerado pelo pipeline');
  assert.deepStrictEqual(mapa.valor.diagnosticoExtracao?.paginasNaoAnalisaveis, [3, 4], 'Deve registrar as páginas não analisáveis');

  assert.strictEqual(mapa.vigenciaInicio.estadoExtracao, 'inconclusivo');
  assert.deepStrictEqual(mapa.vigenciaInicio.diagnosticoExtracao?.paginasNaoAnalisaveis, [3, 4]);
  assert.strictEqual(mapa.vigenciaFim.estadoExtracao, 'inconclusivo');
});

test('7. Documento sem texto: todos os campos permanecem sem dados extraídos', () => {
  const doc = getFixtureDocumentoSemTexto();
  const mapa = extrairCamposIdentificacao(doc, 'exec-07');

  assert.strictEqual(doc.coberturaTextual, 'sem_texto');
  assert.strictEqual(mapa.numeroProcesso.estadoExtracao, 'nao_localizado');
  assert.strictEqual(mapa.valor.estadoExtracao, 'nao_localizado');
  assert.strictEqual(mapa.objeto.estadoExtracao, 'nao_localizado');
  assert.strictEqual(mapa.valor.valorSugerido, null);
});

test('8. Palavras quebradas por hífen: normaliza e extrai corretamente', () => {
  const doc = getFixturePalavrasQuebradasLinhaHifen();
  const mapa = extrairCamposIdentificacao(doc, 'exec-08');

  assert.strictEqual(mapa.numeroProcesso.valorSugerido, 'SESP-PRO-2026/00888');
  assert.ok(mapa.tipoInstrumento.valorSugerido?.includes('CONTRATO ADMINISTRATIVO'));
  assert.ok(mapa.contratadoInteressado.valorSugerido?.includes('ENGENHARIA E CONSTRUTORA'));
  assert.ok(mapa.modalidadeOrigem.valorSugerido?.includes('PREGÃO ELETRÔNICO'));
  assert.strictEqual(mapa.valor.valorSugerido, 125000);
});

test('9. Formatos distintos de datas e valores: normaliza para ISO e moeda', () => {
  const doc = getFixtureFormatosDistintosDatasValores();
  const mapa = extrairCamposIdentificacao(doc, 'exec-09');

  assert.strictEqual(mapa.valor.valorSugerido, 90000);
  assert.strictEqual(mapa.vigenciaInicio.valorSugerido, '2026-09-01');
  assert.strictEqual(mapa.vigenciaFim.valorSugerido, '2027-03-01');
});

test('10. Imutabilidade e integridade: chamada do extrator não muta documento e serializa limpo em JSON', () => {
  const doc = getFixtureContratoRegular();
  const docJsonAntes = JSON.stringify(doc);

  const mapa = extrairCamposIdentificacao(doc, 'exec-10');
  const docJsonDepois = JSON.stringify(doc);

  assert.strictEqual(docJsonAntes, docJsonDepois, 'Documento de entrada não deve sofrer mutação');

  // Serialização do mapa gerado
  const mapaJson = JSON.stringify(mapa);
  assert.ok(mapaJson.length > 0);
  const mapaRestaurado = JSON.parse(mapaJson);
  assert.strictEqual(mapaRestaurado.numeroProcesso.valorSugerido, 'SESP-PRO-2026/00123');
});
