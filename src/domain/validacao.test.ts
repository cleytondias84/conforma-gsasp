/**
 * CONFORMA GSASP — Testes Unitários das Regras de Validação (S2.1)
 * Executado nativamente pelo Node.js test runner
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validarProcesso,
  formatarMoeda,
  formatarDataBR,
  calcularDuracaoVigencia,
  validarFormatoCNPJ
} from './validacao.ts';
import type { Processo } from './tipos.ts';

test('validarProcesso: processo válido completo deve ser aprovado', () => {
  const p: Processo = {
    id: 'proc-01',
    numero: 'SESP-PRO-2026/00001',
    instrumento: 'Contrato Administrativo nº 01/2026',
    objeto: 'Aquisição de estações de trabalho e equipamentos de rede',
    tipoOrigem: 'Pregão Eletrônico nº 10/2026',
    regimeJuridico: 'Lei nº 14.133/2021',
    contratado: 'Empresa Fictícia Ltda.',
    cnpj: '11.111.111/0001-11',
    valor: 350000.0,
    valorNaoAplicavel: false,
    vigenciaInicio: '2026-03-01',
    vigenciaFim: '2027-03-01',
    vigenciaNaoAplicavel: false,
    contratadoNaoAplicavel: false
  };

  const res = validarProcesso(p);
  assert.equal(res.valido, true);
  assert.equal(Object.keys(res.erros).length, 0);
});

test('validarProcesso: processo vazio deve acusar erros nos campos obrigatórios', () => {
  const res = validarProcesso({});
  assert.equal(res.valido, false);
  assert.ok(res.erros.numero, 'Deve exigir número do processo');
  assert.ok(res.erros.instrumento, 'Deve exigir instrumento');
  assert.ok(res.erros.objeto, 'Deve exigir objeto');
  assert.ok(res.erros.tipoOrigem, 'Deve exigir tipo/origem');
  assert.ok(res.erros.regimeJuridico, 'Deve exigir regime jurídico');
  assert.ok(res.erros.contratado, 'Deve exigir contratado quando aplicável');
  assert.ok(res.erros.cnpj, 'Deve exigir CNPJ quando contratado aplicável');
  assert.ok(res.erros.valor, 'Deve exigir valor quando aplicável');
  assert.ok(res.erros.vigenciaInicio, 'Deve exigir data início quando aplicável');
  assert.ok(res.erros.vigenciaFim, 'Deve exigir data fim quando aplicável');
});

test('validarProcesso: objeto muito curto (<10 caracteres) deve ser rejeitado', () => {
  const p: Partial<Processo> = {
    numero: 'SESP-01',
    instrumento: 'Contrato',
    tipoOrigem: 'Pregão',
    regimeJuridico: 'Lei nº 14.133/2021',
    objeto: 'Curto'
  };
  const res = validarProcesso(p);
  assert.equal(res.valido, false);
  assert.match(res.erros.objeto, /mínimo de 10 caracteres/);
});

test('validarProcesso: vigência invertida (término anterior ao início) deve gerar erro (RN13)', () => {
  const p: Partial<Processo> = {
    numero: 'SESP-01',
    instrumento: 'Contrato',
    tipoOrigem: 'Pregão',
    regimeJuridico: 'Lei nº 14.133/2021',
    objeto: 'Aquisição fictícia regular com vigência invertida',
    contratadoNaoAplicavel: true,
    valorNaoAplicavel: true,
    vigenciaNaoAplicavel: false,
    vigenciaInicio: '2026-08-01',
    vigenciaFim: '2026-02-01'
  };
  const res = validarProcesso(p);
  assert.equal(res.valido, false);
  assert.ok(res.erros.vigenciaFim, 'Deve acusar erro em vigenciaFim');
  assert.match(res.erros.vigenciaFim, /não pode ser anterior à data de início/);
});

test('validarProcesso: valor não aplicável deve permitir valor nulo sem erro', () => {
  const p: Partial<Processo> = {
    numero: 'SESP-02',
    instrumento: '1º Termo Aditivo',
    objeto: 'Prorrogação de vigência sem acréscimo de valor financeiro',
    tipoOrigem: 'Termo Aditivo',
    regimeJuridico: 'Lei nº 14.133/2021',
    contratado: 'Empresa Fictícia Ltda.',
    cnpj: '22.222.222/0001-22',
    valor: null,
    valorNaoAplicavel: true,
    vigenciaInicio: '2026-04-01',
    vigenciaFim: '2027-04-01',
    vigenciaNaoAplicavel: false
  };
  const res = validarProcesso(p);
  assert.equal(res.valido, true);
  assert.equal(res.erros.valor, undefined);
});

test('validarProcesso: valor zero deve ser aceito gerando aviso informativo', () => {
  const p: Partial<Processo> = {
    numero: 'SESP-02',
    instrumento: 'Acordo de Cooperação',
    objeto: 'Acordo de cooperação técnica sem repasse de recursos financeiros',
    tipoOrigem: 'Cooperação Técnica',
    regimeJuridico: 'Lei nº 14.133/2021',
    contratadoNaoAplicavel: true,
    valor: 0,
    valorNaoAplicavel: false,
    vigenciaInicio: '2026-01-01',
    vigenciaFim: '2027-01-01',
    vigenciaNaoAplicavel: false
  };
  const res = validarProcesso(p);
  assert.equal(res.valido, true);
  assert.equal(res.erros.valor, undefined);
  assert.ok(res.avisos.valor, 'Deve emitir aviso de valor zero');
});

test('validarProcesso: vigência não aplicável deve permitir datas nulas sem erro', () => {
  const p: Partial<Processo> = {
    numero: 'SESP-03',
    instrumento: 'Portaria Conjunta',
    objeto: 'Constituição de comissão intersetorial de segurança',
    tipoOrigem: 'Ato Administrativo',
    regimeJuridico: 'Decreto Estadual',
    contratadoNaoAplicavel: true,
    valorNaoAplicavel: true,
    vigenciaInicio: null,
    vigenciaFim: null,
    vigenciaNaoAplicavel: true
  };
  const res = validarProcesso(p);
  assert.equal(res.valido, true);
  assert.equal(res.erros.vigenciaInicio, undefined);
  assert.equal(res.erros.vigenciaFim, undefined);
});

test('formatadores e utilitários de domínio', () => {
  assert.equal(formatarMoeda(null), 'Não se aplica / Sem valor financeiro');
  assert.match(formatarMoeda(1250000), /1\.250\.000/);

  assert.equal(formatarDataBR('2026-05-15'), '15/05/2026');
  assert.equal(formatarDataBR(''), 'Não informada');

  assert.match(calcularDuracaoVigencia('2026-01-01', '2027-01-01'), /12 mês\(es\)/);
  assert.equal(calcularDuracaoVigencia('2026-10-01', '2026-01-01'), '(Período cronologicamente invertido)');

  assert.equal(validarFormatoCNPJ('11.111.111/0001-11'), true);
  assert.equal(validarFormatoCNPJ('123'), false);
});
