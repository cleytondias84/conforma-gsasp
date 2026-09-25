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
  validarFormatoCNPJ,
  validarPertinencia,
  sugerirConclusaoPertinencia,
  formatarConclusaoPertinencia,
  validarConformidade,
  formatarStatusConformidade,
  formatarSituacaoCondicionante
} from './validacao.ts';
import type {
  Processo,
  Pertinencia,
  ItemConformidade,
  Condicionante
} from './tipos.ts';

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

// ==========================================
// TESTES DE PERTINÊNCIA INSTITUCIONAL (S2.2)
// ==========================================

test('validarPertinencia: pertinência regular completa (Cenário 1) deve ser aprovada', () => {
  const pert: Pertinencia = {
    respostas: {
      competenciaNecessidade: true,
      vinculoPlanejamento: true,
      beneficioInteressePublico: true,
      custoProporcionalidade: true,
      economicidade: true
    },
    evidencias: 'Documento Demonstrativo nº 01/2026: renovação do parque tecnológico.',
    justificativa: 'Necessidade plenamente aderente aos objetivos estratégicos.',
    conclusao: 'PERTINENTE',
    providencia: 'Prosseguir com o trâmite regular para assinatura.'
  };

  const res = validarPertinencia(pert);
  assert.equal(res.valido, true);
  assert.equal(Object.keys(res.erros).length, 0);
  assert.equal(res.sugestaoIndicativa, 'PERTINENTE');
});

test('validarPertinencia: pertinência vazia deve acusar erros obrigatórios (RN02)', () => {
  const res = validarPertinencia({});
  assert.equal(res.valido, false);
  assert.ok(res.erros.respostas, 'Deve exigir avaliação de critérios');
  assert.ok(res.erros.conclusao, 'Deve exigir conclusão (RN02)');
  assert.ok(res.erros.evidencias, 'Deve exigir evidências dos autos');
  assert.ok(res.erros.justificativa, 'Deve exigir justificativa técnica');
  assert.ok(res.erros.providencia, 'Deve exigir providência');
});

test('sugerirConclusaoPertinencia: regras determinísticas dos 5 filtros', () => {
  // Todos verdadeiros -> PERTINENTE
  assert.equal(
    sugerirConclusaoPertinencia({
      competenciaNecessidade: true,
      vinculoPlanejamento: true,
      beneficioInteressePublico: true,
      custoProporcionalidade: true,
      economicidade: true
    }),
    'PERTINENTE'
  );

  // Cenário 4 (critérios falsos/nulos de planejamento/custo) -> NAO_DEMONSTRADA
  assert.equal(
    sugerirConclusaoPertinencia({
      competenciaNecessidade: true,
      vinculoPlanejamento: false,
      beneficioInteressePublico: null,
      custoProporcionalidade: false,
      economicidade: null
    }),
    'NAO_DEMONSTRADA'
  );

  // Cenário 5 (competência ou benefício falsos) -> NAO_PERTINENTE
  assert.equal(
    sugerirConclusaoPertinencia({
      competenciaNecessidade: false,
      vinculoPlanejamento: false,
      beneficioInteressePublico: false,
      custoProporcionalidade: false,
      economicidade: false
    }),
    'NAO_PERTINENTE'
  );
});

test('validarPertinencia: decisão humana divergente da sugestão do sistema é aceita com aviso (RN02)', () => {
  const pert: Pertinencia = {
    respostas: {
      competenciaNecessidade: true,
      vinculoPlanejamento: false,
      beneficioInteressePublico: true,
      custoProporcionalidade: true,
      economicidade: true
    },
    evidencias: 'Nota explicativa da unidade gestora anexada à fl. 32.',
    justificativa: 'Apesar de não constar expressamente no plano inicial, o objeto foi justificado por urgência operacional.',
    conclusao: 'PERTINENTE_COM_JUSTIFICATIVA',
    providencia: 'Admitir o prosseguimento com recomendação de ajuste no plano setorial.'
  };

  const res = validarPertinencia(pert);
  assert.equal(res.valido, true);
  assert.equal(Object.keys(res.erros).length, 0);
  assert.ok(res.avisos.conclusao, 'Deve alertar que a conclusão humana difere da sugestão');
  assert.match(formatarConclusaoPertinencia(pert.conclusao), /PERTINENTE COM JUSTIFICATIVA/);
});

// ==========================================
// TESTES DE CONFORMIDADE E CONDICIONANTES (S2.3)
// ==========================================

test('validarConformidade: checklist regular e condicionantes atendidas devem ser válidos', () => {
  const checklist: ItemConformidade[] = [
    {
      id: 'chk-1',
      descricao: 'Parecer Jurídico Referencial',
      status: 'ok',
      referenciaFonte: 'Peça 10'
    },
    {
      id: 'chk-2',
      descricao: 'Dotação Orçamentária',
      status: 'ok',
      referenciaFonte: 'Peça 12'
    }
  ];

  const condicionantes: Condicionante[] = [
    {
      id: 'cond-1',
      descricao: 'Juntada de certidões negativas fiscais atualizadas.',
      referenciaParecer: 'Parecer PGE nº 101/2026, item 14',
      situacao: 'atendida',
      evidenciaAtendimento: 'Certidões anexadas à Peça 15'
    }
  ];

  const res = validarConformidade(checklist, condicionantes);
  assert.equal(res.valido, true);
  assert.equal(Object.keys(res.erros).length, 0);
  assert.equal(res.estatisticas.totalItens, 2);
  assert.equal(res.estatisticas.itensOk, 2);
  assert.equal(res.estatisticas.condicionantesAtendidas, 1);
});

test('validarConformidade: item nao_aplicavel exige justificativa fundamentada', () => {
  const checklistSemJustificativa: ItemConformidade[] = [
    {
      id: 'chk-aditivo-valor',
      descricao: 'Adequação Orçamentária Imediata',
      status: 'nao_aplicavel',
      justificativaNaoAplicavel: '' // Vazio!
    }
  ];

  const resErro = validarConformidade(checklistSemJustificativa, []);
  assert.equal(resErro.valido, false);
  assert.ok(resErro.erros['chk_chk-aditivo-valor_justificativa'], 'Deve exigir justificativa');

  const checklistComJustificativa: ItemConformidade[] = [
    {
      id: 'chk-aditivo-valor',
      descricao: 'Adequação Orçamentária Imediata',
      status: 'nao_aplicavel',
      justificativaNaoAplicavel: 'Termo aditivo restrito à dilatação temporal sem acréscimo de despesa.'
    }
  ];

  const resOk = validarConformidade(checklistComJustificativa, []);
  assert.equal(resOk.valido, true);
  assert.equal(resOk.erros['chk_chk-aditivo-valor_justificativa'], undefined);
  assert.equal(resOk.estatisticas.itensNaoAplicaveis, 1);
});

test('validarConformidade: condicionante pendente exige providência saneadora', () => {
  const condicionantes: Condicionante[] = [
    {
      id: 'cond-pendente',
      descricao: 'Apresentar comprovação de garantia da execução contratual.',
      referenciaParecer: 'Parecer Jurídico nº 55/2026, item 8',
      situacao: 'pendente',
      providencia: '' // Vazio!
    }
  ];

  const res = validarConformidade([{ id: '1', descricao: 'Item teste', status: 'ok' }], condicionantes);
  assert.equal(res.valido, false);
  assert.ok(res.erros['cond_cond-pendente_providencia'], 'Deve exigir providência');

  condicionantes[0].providencia = 'Intimar contratada para juntada da apólice em 48h.';
  const resCorrigido = validarConformidade([{ id: '1', descricao: 'Item teste', status: 'ok' }], condicionantes);
  assert.equal(resCorrigido.valido, true);
});

test('formatarStatusConformidade e formatarSituacaoCondicionante', () => {
  assert.match(formatarStatusConformidade('ok'), /Conforme/);
  assert.match(formatarStatusConformidade('nao_aplicavel'), /Não se aplica/);
  assert.match(formatarSituacaoCondicionante('atendida'), /Atendida/);
  assert.match(formatarSituacaoCondicionante('em_cumprimento'), /Em cumprimento/);
});

