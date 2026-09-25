/**
 * CONFORMA GSASP — Testes Unitários de Persistência Local (S2.4)
 * Executado nativamente pelo Node.js test runner
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  salvarRascunhoAtual,
  recuperarUltimoRascunho,
  listarTodosRascunhos,
  excluirRascunhoSalvo,
  formatarCarimboSalvamento,
  obterRepositorioArmazenamento,
  AVISO_PERSISTENCIA_LOCAL
} from './armazenamento.ts';
import type { Processo, Pertinencia, ItemConformidade, Condicionante } from '../domain/tipos.ts';

test('armazenamento: salva e recupera rascunho completo preservando dados', async () => {
  const repo = obterRepositorioArmazenamento();
  await repo.limparTudo();

  const processo: Processo = {
    id: 'proc-teste-01',
    numero: 'SESP-TESTE-2026/001',
    instrumento: 'Contrato Administrativo',
    contratado: 'Empresa Teste Fictícia',
    cnpj: '00.000.000/0001-00',
    objeto: 'Objeto de teste para validação de persistência no IndexedDB',
    tipoOrigem: 'Pregão',
    valor: 150000,
    vigenciaInicio: '2026-01-01',
    vigenciaFim: '2027-01-01',
    regimeJuridico: 'Lei nº 14.133/2021'
  };

  const pertinencia: Pertinencia = {
    respostas: {
      competenciaNecessidade: true,
      vinculoPlanejamento: true,
      beneficioInteressePublico: true,
      custoProporcionalidade: true,
      economicidade: true
    },
    evidencias: 'Documento Demonstrativo nº 10/2026',
    justificativa: 'Necessidade plenamente justificada para o serviço policial.',
    conclusao: 'PERTINENTE',
    providencia: 'Avançar para conformidade.'
  };

  const checklist: ItemConformidade[] = [
    {
      id: 'chk-t1',
      descricao: 'Parecer Jurídico Favorável',
      status: 'ok',
      referenciaFonte: 'Peça 01'
    },
    {
      id: 'chk-t2',
      descricao: 'Item não aplicável',
      status: 'nao_aplicavel',
      justificativaNaoAplicavel: 'Justificativa válida do item.'
    }
  ];

  const condicionantes: Condicionante[] = [
    {
      id: 'cond-t1',
      descricao: 'Apresentar certidão atualizada',
      referenciaParecer: 'Parecer nº 01',
      situacao: 'atendida',
      providencia: 'Juntada aos autos',
      responsavel: 'Setor de Licitações'
    }
  ];

  // 1. Salvar rascunho
  const resultadoSalvar = await salvarRascunhoAtual(processo, pertinencia, checklist, condicionantes, 'rascunho');
  assert.ok(resultadoSalvar.analiseId);
  assert.ok(resultadoSalvar.salvoEm);

  // 2. Recuperar rascunho
  const recuperado = await recuperarUltimoRascunho();
  assert.ok(recuperado, 'Deve recuperar o rascunho salvo');
  assert.equal(recuperado.processo.numero, 'SESP-TESTE-2026/001');
  assert.equal(recuperado.processo.objeto, 'Objeto de teste para validação de persistência no IndexedDB');
  assert.equal(recuperado.pertinencia.conclusao, 'PERTINENTE');
  assert.equal(recuperado.checklist.length, 2);
  assert.equal(recuperado.checklist[1].justificativaNaoAplicavel, 'Justificativa válida do item.');
  assert.equal(recuperado.condicionantes.length, 1);
  assert.equal(recuperado.condicionantes[0].responsavel, 'Setor de Licitações');
  assert.equal(recuperado.estadoEdicao, 'rascunho');
});

test('armazenamento: permite salvar rascunho incompleto sem exigir preenchimento total', async () => {
  const repo = obterRepositorioArmazenamento();
  await repo.limparTudo();

  const processoIncompleto: Processo = {
    id: 'proc-incompleto',
    numero: 'SESP-INCOMP-2026',
    instrumento: 'Termo Aditivo',
    contratado: '',
    cnpj: '',
    objeto: 'Rascunho em preenchimento inicial...',
    tipoOrigem: '',
    valor: null,
    vigenciaInicio: null,
    vigenciaFim: null
  };

  const pertinenciaVazia: Pertinencia = {
    respostas: {
      competenciaNecessidade: null,
      vinculoPlanejamento: null,
      beneficioInteressePublico: null,
      custoProporcionalidade: null,
      economicidade: null
    },
    evidencias: '',
    justificativa: '',
    conclusao: null,
    providencia: ''
  };

  await salvarRascunhoAtual(processoIncompleto, pertinenciaVazia, [], [], 'rascunho');

  const recuperado = await recuperarUltimoRascunho();
  assert.ok(recuperado);
  assert.equal(recuperado.processo.numero, 'SESP-INCOMP-2026');
  assert.equal(recuperado.estadoEdicao, 'rascunho');
  assert.equal(recuperado.checklist.length, 0);
});

test('armazenamento: listar e excluir rascunhos', async () => {
  const repo = obterRepositorioArmazenamento();
  await repo.limparTudo();

  const procA: Processo = {
    id: 'proc-a',
    numero: 'SESP-A-2026',
    instrumento: 'Contrato',
    contratado: 'Alpha',
    cnpj: '11.111.111/0001-11',
    objeto: 'Objeto Processo A',
    tipoOrigem: 'Pregão',
    valor: 10000,
    vigenciaInicio: '2026-01-01',
    vigenciaFim: '2027-01-01'
  };

  const procB: Processo = {
    id: 'proc-b',
    numero: 'SESP-B-2026',
    instrumento: 'Aditivo',
    contratado: 'Beta',
    cnpj: '22.222.222/0001-22',
    objeto: 'Objeto Processo B',
    tipoOrigem: 'Aditivo',
    valor: 20000,
    vigenciaInicio: '2026-02-01',
    vigenciaFim: '2027-02-01'
  };

  const pertDemo: Pertinencia = {
    respostas: {
      competenciaNecessidade: true,
      vinculoPlanejamento: true,
      beneficioInteressePublico: true,
      custoProporcionalidade: true,
      economicidade: true
    },
    evidencias: 'Evidência',
    justificativa: 'Justificativa',
    conclusao: 'PERTINENTE',
    providencia: 'Providência'
  };

  await salvarRascunhoAtual(procA, pertDemo, [], []);
  await salvarRascunhoAtual(procB, pertDemo, [], []);

  const lista = await listarTodosRascunhos();
  assert.equal(lista.length, 2);

  // Excluir procA
  await excluirRascunhoSalvo('anl-local-proc-a');

  const listaAposExclusao = await listarTodosRascunhos();
  assert.equal(listaAposExclusao.length, 1);
  assert.equal(listaAposExclusao[0].processoId, 'proc-b');
});

test('armazenamento: diagnóstico e aviso de não sincronização', async () => {
  const repo = obterRepositorioArmazenamento();
  const diag = await repo.getDiagnostico();
  assert.ok(diag.mensagem);
  assert.ok(AVISO_PERSISTENCIA_LOCAL.toLowerCase().includes('armazenamento local neste dispositivo'));
});

test('armazenamento: formatarCarimboSalvamento formata data ISO adequadamente', () => {
  const formatado = formatarCarimboSalvamento('2026-09-24T18:30:00.000Z');
  assert.match(formatado, /\d{2}\/\d{2}\/2026 às \d{2}:\d{2}:\d{2}/);
  assert.equal(formatarCarimboSalvamento(null), 'Ainda não salvo localmente');
});

test('armazenamento (regressão): salva condicionante personalizada incompleta e recupera preservando todos os dados', async () => {
  const repo = obterRepositorioArmazenamento();
  await repo.limparTudo();

  const processo: Processo = {
    id: 'proc-regressao-cond',
    numero: 'SESP-REG-2026/099',
    instrumento: 'Contrato Administrativo',
    contratado: 'Contratada Teste',
    cnpj: '99.999.999/0001-99',
    objeto: 'Processo para teste de regressão de condicionante personalizada',
    tipoOrigem: 'Pregão',
    valor: 50000,
    vigenciaInicio: '2026-03-01',
    vigenciaFim: '2027-03-01'
  };

  const pertinencia: Pertinencia = {
    respostas: {
      competenciaNecessidade: true,
      vinculoPlanejamento: true,
      beneficioInteressePublico: true,
      custoProporcionalidade: true,
      economicidade: true
    },
    evidencias: 'Doc. 01',
    justificativa: 'Justificativa técnica',
    conclusao: 'PERTINENTE',
    providencia: 'Prosseguir'
  };

  const checklistComItemPersonalizado: ItemConformidade[] = [
    {
      id: 'chk-custom-01',
      descricao: 'Documento fictício — teste de persistência',
      status: 'confirmar',
      referenciaFonte: '',
      observacao: ''
    }
  ];

  // Condicionante personalizada criada pelo usuário com campos incompletos
  // (preenchida apenas a descrição no momento do salvamento do rascunho)
  const condicionantePersonalizada: Condicionante = {
    id: 'cond-custom-persist-99',
    descricao: 'Condicionante fictícia — teste de persistência',
    referenciaParecer: '',
    situacao: 'pendente',
    evidenciaAtendimento: '',
    providencia: '',
    responsavel: ''
  };

  // 1. Salvar rascunho contendo a condicionante personalizada incompleta
  await salvarRascunhoAtual(
    processo,
    pertinencia,
    checklistComItemPersonalizado,
    [condicionantePersonalizada],
    'rascunho'
  );

  // 2. Recuperar do repositório
  const recuperado = await recuperarUltimoRascunho();
  assert.ok(recuperado, 'O rascunho com a condicionante deve ser recuperado com sucesso');
  assert.equal(recuperado.processo.numero, 'SESP-REG-2026/099');

  // 3. Conferir o item de checklist personalizado
  assert.equal(recuperado.checklist.length, 1);
  assert.equal(recuperado.checklist[0].id, 'chk-custom-01');
  assert.equal(recuperado.checklist[0].descricao, 'Documento fictício — teste de persistência');

  // 4. Conferir a condicionante personalizada
  assert.equal(recuperado.condicionantes.length, 1, 'Deve conter exatamente 1 condicionante recuperada');
  const condRecuperada = recuperado.condicionantes[0];
  assert.equal(condRecuperada.id, 'cond-custom-persist-99');
  assert.equal(condRecuperada.descricao, 'Condicionante fictícia — teste de persistência');
  assert.equal(condRecuperada.situacao, 'pendente');
  assert.equal(condRecuperada.referenciaParecer, '', 'Campos vazios de condicionante incompleta devem ser preservados');
  assert.equal(condRecuperada.providencia, '', 'Campos vazios de condicionante incompleta devem ser preservados');
});
