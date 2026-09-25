/**
 * CONFORMA GSASP — Testes Unitários da Etapa 4: Apontamento e Validação de Achados (S3.3)
 * Executado nativamente pelo Node.js test runner
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  getAchadosAtivos,
  setAchadosAtivos,
  sincronizarAchadosComMotor,
  validarAchado,
  alterarClassificacaoAchado,
  rejeitarAchado,
  reabrirAchadoParaRevisao,
  adicionarAchadoManual,
  removerAchadoManual,
  type AchadoComMetadados
} from './achados.ts';

import { setProcessoAtivo } from './identificacao.ts';
import { setPertinenciaAtiva } from './pertinencia.ts';
import { setChecklistAtivo, setCondicionantesAtivas } from './conformidade.ts';
import { salvarRascunhoAtual, recuperarUltimoRascunho, obterRepositorioArmazenamento } from '../services/armazenamento.ts';
import type { Processo, Pertinencia, ItemConformidade, Condicionante } from '../domain/tipos.ts';

describe('S3.3 — Apontamento e Validação de Achados', () => {
  beforeEach(() => {
    // Reseta estado base
    setAchadosAtivos([]);
    setProcessoAtivo({
      id: 'proc-t1',
      numero: 'SESP-PRO-2026/00100',
      instrumento: 'Contrato nº 100/2026',
      contratado: 'Empresa Teste',
      cnpj: '00.000.000/0001-91',
      objeto: 'Aquisição de equipamentos de teste com mais de vinte caracteres',
      valor: 50000,
      valorNaoAplicavel: false,
      vigenciaInicio: '2026-01-01',
      vigenciaFim: '2026-12-31',
      vigenciaNaoAplicavel: false
    });
    setPertinenciaAtiva({
      alinhamentoEstrategico: 'sim',
      justificativaAlinhamento: 'Alinhado ao planejamento estratégico da SESP',
      necessidadePublica: 'sim',
      justificativaNecessidade: 'Necessidade pública comprovada nos autos',
      capacidadeOperacional: 'sim',
      justificativaCapacidade: 'Unidade possui servidores capacitados',
      analiseCustos: 'sim',
      justificativaCustos: 'Pesquisa ampla de preços com menor cotação',
      competenciaLegal: 'sim',
      justificativaCompetencia: 'Competência do Secretário Adjunto',
      conclusao: 'PERTINENTE',
      observacoesGerais: 'Processo regular'
    });
    setChecklistAtivo([
      { id: 'c1', descricao: 'Estudo Técnico Preliminar', status: 'ok', referenciaFonte: 'Fls. 10', observacao: '' }
    ]);
    setCondicionantesAtivas([]);
  });

  test('sincronizarAchadosComMotor: ausência de inconsistências gera lista vazia sem aprovação automática', () => {
    const res = sincronizarAchadosComMotor();
    assert.equal(res.achados.length, 0);
    assert.equal(getAchadosAtivos().length, 0);
    assert.equal(res.resumo.totalAchados, 0, 'RN11: ausência de achados não confere aptidão automática');
  });

  test('sincronizarAchadosComMotor: gera sugestões com estado SUGESTAO_SISTEMA e anatomia RN03', () => {
    // Configura processo com vigência invertida (REG-01) e item a confirmar (REG-05)
    setProcessoAtivo({
      id: 'proc-t2',
      numero: 'SESP-PRO-2026/00200',
      instrumento: 'Contrato nº 200/2026',
      contratado: 'Empresa Teste',
      cnpj: '00.000.000/0001-91',
      objeto: 'Aquisição de suprimentos de informática para delegacias',
      valor: 10000,
      valorNaoAplicavel: false,
      vigenciaInicio: '2026-12-31',
      vigenciaFim: '2026-01-01', // invertida
      vigenciaNaoAplicavel: false
    });
    setChecklistAtivo([
      { id: 'chk-conf', descricao: 'Certidão Fiscal', status: 'confirmar', referenciaFonte: '', observacao: '' }
    ]);

    sincronizarAchadosComMotor();
    const achados = getAchadosAtivos();
    assert.equal(achados.length, 2);

    const aReg01 = achados.find((a) => a.regraId?.startsWith('REG-01'));
    assert.ok(aReg01, 'Deve conter achado da REG-01');
    assert.equal(aReg01?.estadoValidacao, 'SUGESTAO_SISTEMA');
    assert.equal(aReg01?.classificacaoSugerida, 'FORMAL');
    assert.equal(aReg01?.classificacaoValidada, null);
    assert.ok(aReg01?.evidencia.length > 0);
    assert.ok(aReg01?.regraOuMotivo.length > 0);
    assert.ok(aReg01?.impacto.length > 0);
    assert.ok(aReg01?.providencia.length > 0);
    assert.ok(aReg01?.responsavel.length > 0);

    const aReg05 = achados.find((a) => a.regraId?.startsWith('REG-05'));
    assert.ok(aReg05, 'Deve conter achado da REG-05');
    assert.equal(aReg05?.estadoValidacao, 'SUGESTAO_SISTEMA');
    assert.equal(aReg05?.classificacaoSugerida, null, 'Classificação sugerida pendente');
    assert.equal(aReg05?.classificacaoValidada, null);
  });

  test('validarAchado: valida com gravidade sugerida ou classificação explícita do assessor', () => {
    setProcessoAtivo({
      id: 'proc-t3',
      numero: 'SESP-PRO-2026/00300',
      instrumento: 'Contrato nº 300/2026',
      contratado: 'Empresa Teste',
      cnpj: '00.000.000/0001-91',
      objeto: 'Aquisição de suprimentos de informática para delegacias',
      valor: 10000,
      valorNaoAplicavel: false,
      vigenciaInicio: '2026-12-31',
      vigenciaFim: '2026-01-01',
      vigenciaNaoAplicavel: false
    });
    setChecklistAtivo([
      { id: 'chk-conf', descricao: 'Certidão Fiscal', status: 'confirmar', referenciaFonte: '', observacao: '' }
    ]);

    sincronizarAchadosComMotor();
    const achados = getAchadosAtivos();
    const reg01 = achados.find((a) => a.regraId?.startsWith('REG-01'))!;
    const reg05 = achados.find((a) => a.regraId?.startsWith('REG-05'))!;

    // Validar REG-01 que já tinha sugestão 'FORMAL'
    const ok01 = validarAchado(reg01.id);
    assert.equal(ok01, true);
    assert.equal(reg01.estadoValidacao, 'VALIDADO');
    assert.equal(reg01.classificacaoValidada, 'FORMAL');
    assert.equal(reg01.classificacao, 'FORMAL');

    // Validar REG-05 sem informar gravidade deve falhar (pois classificacaoSugerida é null)
    const falha05 = validarAchado(reg05.id);
    assert.equal(falha05, false, 'Não pode validar item com classificação pendente sem que o assessor escolha');

    // Agora valida fornecendo classificação explícita
    const ok05 = validarAchado(reg05.id, 'RELEVANTE');
    assert.equal(ok05, true);
    assert.equal(reg05.estadoValidacao, 'VALIDADO');
    assert.equal(reg05.classificacaoValidada, 'RELEVANTE');
    assert.equal(reg05.classificacao, 'RELEVANTE');
  });

  test('alterarClassificacaoAchado: assessor altera gravidade e valida achado', () => {
    setProcessoAtivo({
      id: 'proc-t4',
      numero: 'SESP-PRO-2026/00400',
      instrumento: 'Contrato nº 400/2026',
      contratado: 'Empresa Teste',
      cnpj: '00.000.000/0001-91',
      objeto: 'Aquisição de suprimentos de informática para delegacias',
      valor: 10000,
      valorNaoAplicavel: false,
      vigenciaInicio: '2026-12-31',
      vigenciaFim: '2026-01-01',
      vigenciaNaoAplicavel: false
    });

    sincronizarAchadosComMotor();
    const reg01 = getAchadosAtivos().find((a) => a.regraId?.startsWith('REG-01'))!;

    const alterado = alterarClassificacaoAchado(reg01.id, 'IMPEDITIVO');
    assert.equal(alterado, true);
    assert.equal(reg01.classificacaoValidada, 'IMPEDITIVO');
    assert.equal(reg01.classificacaoSugerida, 'FORMAL', 'Preserva a classificação original sugerida pelo sistema');
    assert.equal(reg01.estadoValidacao, 'VALIDADO');
  });

  test('rejeitarAchado: exige justificativa obrigatória e registra o estado REJEITADO', () => {
    setProcessoAtivo({
      id: 'proc-t5',
      numero: 'SESP-PRO-2026/00500',
      instrumento: 'Contrato nº 500/2026',
      contratado: 'Empresa Teste',
      cnpj: '00.000.000/0001-91',
      objeto: 'Aquisição de suprimentos de informática para delegacias',
      valor: 10000,
      valorNaoAplicavel: false,
      vigenciaInicio: '2026-12-31',
      vigenciaFim: '2026-01-01',
      vigenciaNaoAplicavel: false
    });

    sincronizarAchadosComMotor();
    const reg01 = getAchadosAtivos().find((a) => a.regraId?.startsWith('REG-01'))!;

    // Rejeição sem justificativa deve falhar (RN06)
    const semJust = rejeitarAchado(reg01.id, '   ');
    assert.equal(semJust, false);
    assert.notEqual(reg01.estadoValidacao, 'REJEITADO');

    // Rejeição com justificativa válida
    const comJust = rejeitarAchado(reg01.id, 'Inconsistência saneada na folha 45 com termo de retificação cadastral.');
    assert.equal(comJust, true);
    assert.equal(reg01.estadoValidacao, 'REJEITADO');
    assert.equal(reg01.justificativaRejeicao, 'Inconsistência saneada na folha 45 com termo de retificação cadastral.');
  });

  test('reabrirAchadoParaRevisao: reverte achado validado ou rejeitado para SUGESTAO_SISTEMA', () => {
    setProcessoAtivo({
      id: 'proc-t6',
      numero: 'SESP-PRO-2026/00600',
      instrumento: 'Contrato nº 600/2026',
      contratado: 'Empresa Teste',
      cnpj: '00.000.000/0001-91',
      objeto: 'Aquisição de suprimentos de informática para delegacias',
      valor: 10000,
      valorNaoAplicavel: false,
      vigenciaInicio: '2026-12-31',
      vigenciaFim: '2026-01-01',
      vigenciaNaoAplicavel: false
    });

    sincronizarAchadosComMotor();
    const reg01 = getAchadosAtivos().find((a) => a.regraId?.startsWith('REG-01'))!;

    validarAchado(reg01.id);
    assert.equal(reg01.estadoValidacao, 'VALIDADO');

    const reaberto = reabrirAchadoParaRevisao(reg01.id);
    assert.equal(reaberto, true);
    assert.equal(reg01.estadoValidacao, 'SUGESTAO_SISTEMA');
    assert.equal(reg01.classificacaoValidada, null);
  });

  test('achados manuais: adição com campos obrigatórios e exclusão pelo assessor', () => {
    sincronizarAchadosComMotor();
    const totalInicial = getAchadosAtivos().length;

    // Tentativa inválida sem campos obrigatórios
    const invalido = adicionarAchadoManual({
      titulo: '',
      evidencia: '',
      regraOuMotivo: '',
      impacto: '',
      providencia: '',
      responsavel: '',
      classificacao: 'FORMAL'
    });
    assert.equal(invalido, null);
    assert.equal(getAchadosAtivos().length, totalInicial);

    // Adição válida
    const valido = adicionarAchadoManual({
      titulo: 'Ausência de carimbo de conferência no termo de referência',
      evidencia: 'Folha 12 do TR sem carimbo do setor requisitante',
      regraOuMotivo: 'Manual de Padronização Interna do GSASP',
      impacto: 'Dúvida formal quanto à autoria da revisão',
      providencia: 'Solicitar aposição de assinatura do chefe de setor',
      responsavel: 'Setor Requisitante',
      classificacao: 'FORMAL'
    });
    assert.ok(valido);
    assert.equal(valido?.origemManual, true);
    assert.equal(valido?.regraId, 'MANUAL');
    assert.equal(valido?.estadoValidacao, 'VALIDADO');
    assert.equal(getAchadosAtivos().length, totalInicial + 1);

    // Exclusão do achado manual
    const removido = removerAchadoManual(valido!.id);
    assert.equal(removido, true);
    assert.equal(getAchadosAtivos().length, totalInicial);
  });

  test('preservação de revisões humanas e RN10: reexecutar motor não duplica e sinaliza se evidência mudar', () => {
    // Configura processo com vigência invertida
    setProcessoAtivo({
      id: 'proc-t7',
      numero: 'SESP-PRO-2026/00700',
      instrumento: 'Contrato nº 700/2026',
      contratado: 'Empresa Teste',
      cnpj: '00.000.000/0001-91',
      objeto: 'Aquisição de suprimentos de informática para delegacias',
      valor: 10000,
      valorNaoAplicavel: false,
      vigenciaInicio: '2026-10-01',
      vigenciaFim: '2026-05-01',
      vigenciaNaoAplicavel: false
    });

    sincronizarAchadosComMotor();
    assert.equal(getAchadosAtivos().length, 1);

    const reg01 = getAchadosAtivos()[0];
    validarAchado(reg01.id);
    assert.equal(reg01.estadoValidacao, 'VALIDADO');
    assert.equal(reg01.necessitaNovaRevisao, false);

    // Reexecuta motor com OS MESMOS DADOS: não duplica e mantém validado
    sincronizarAchadosComMotor();
    assert.equal(getAchadosAtivos().length, 1, 'Não deve duplicar achado na reexecução');
    const mesmoAchado = getAchadosAtivos()[0];
    assert.equal(mesmoAchado.estadoValidacao, 'VALIDADO');
    assert.equal(mesmoAchado.necessitaNovaRevisao, false);

    // ALTERA OS DADOS DE ORIGEM (RN10): muda a data de término
    setProcessoAtivo({
      id: 'proc-t7',
      numero: 'SESP-PRO-2026/00700',
      instrumento: 'Contrato nº 700/2026',
      contratado: 'Empresa Teste',
      cnpj: '00.000.000/0001-91',
      objeto: 'Aquisição de suprimentos de informática para delegacias',
      valor: 10000,
      valorNaoAplicavel: false,
      vigenciaInicio: '2026-10-01',
      vigenciaFim: '2026-02-01', // término ainda anterior, mas valor diferente nos autos
      vigenciaNaoAplicavel: false
    });

    sincronizarAchadosComMotor();
    assert.equal(getAchadosAtivos().length, 1);
    const achadoAlterado = getAchadosAtivos()[0];
    assert.equal(achadoAlterado.estadoValidacao, 'VALIDADO', 'Preserva a validação');
    assert.equal(achadoAlterado.necessitaNovaRevisao, true, 'RN10: deve sinalizar necessidade de nova revisão');
  });

  test('persistência: salvarRascunhoAtual e recuperarUltimoRascunho persistem achados com metadados', async () => {
    const repo = obterRepositorioArmazenamento();
    await repo.limparTudo();

    const achadoExemplo: AchadoComMetadados = {
      id: 'achado-teste-persistencia',
      regraId: 'REG-01',
      titulo: 'Vigência com Inconsistência Cronológica',
      evidencia: 'Início em 2026-12-31 e término em 2026-01-01',
      regraOuMotivo: 'Cláusula de vigência inconsistente',
      impacto: 'Incerteza na duração contratual',
      providencia: 'Verificar os autos e retificar datas',
      responsavel: 'Setor de Contratos',
      classificacaoSugerida: 'FORMAL',
      classificacaoValidada: 'FORMAL',
      classificacao: 'FORMAL',
      estadoValidacao: 'VALIDADO',
      evidenciaAoValidar: 'Início em 2026-12-31 e término em 2026-01-01',
      necessitaNovaRevisao: false
    };

    setAchadosAtivos([achadoExemplo]);

    const proc = {
      id: 'p-rascunho',
      numero: 'SESP-PRO-2026/99999',
      instrumento: 'Contrato de Teste',
      contratado: 'Empresa',
      cnpj: '00.000.000/0001-91',
      objeto: 'Objeto de teste com mais de dez caracteres',
      valor: 1000,
      valorNaoAplicavel: false,
      vigenciaInicio: '2026-01-01',
      vigenciaFim: '2026-12-31',
      vigenciaNaoAplicavel: false
    };

    const pert: Pertinencia = {
      alinhamentoEstrategico: 'sim',
      justificativaAlinhamento: 'Sim',
      necessidadePublica: 'sim',
      justificativaNecessidade: 'Sim',
      capacidadeOperacional: 'sim',
      justificativaCapacidade: 'Sim',
      analiseCustos: 'sim',
      justificativaCustos: 'Sim',
      competenciaLegal: 'sim',
      justificativaCompetencia: 'Sim',
      conclusao: 'PERTINENTE',
      observacoesGerais: ''
    };

    const chk: ItemConformidade[] = [];
    const conds: Condicionante[] = [];

    await salvarRascunhoAtual(proc, pert, chk, conds, 'rascunho', getAchadosAtivos());

    const recuperado = await recuperarUltimoRascunho();
    assert.ok(recuperado);
    assert.ok(recuperado.achados);
    assert.equal(recuperado.achados.length, 1);
    assert.equal(recuperado.achados[0].id, 'achado-teste-persistencia');
    assert.equal(recuperado.achados[0].estadoValidacao, 'VALIDADO');
    assert.equal(recuperado.achados[0].classificacaoValidada, 'FORMAL');
  });
});
