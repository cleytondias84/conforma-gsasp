/**
 * CONFORMA GSASP — Testes Unitários da Tela da Etapa 6: Resultado Executivo e Encaminhamento (S4.2)
 * Executado nativamente pelo Node.js test runner
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  renderResultadoScreen,
  getResultadoExecutivoAtivo,
  getConclusaoValidada,
  getValidacaoHumana,
  getJustificativaDivergencia,
  getObservacoesAssessor,
  setConclusaoValidada,
  limparResultadoAtivo,
  adotarSugestaoSistema,
  validarConclusaoAssessor,
  reabrirConclusaoParaRevisao,
  verificarAlteracaoMaterialPosterior
} from './resultado.ts';

import { setProcessoAtivo } from './identificacao.ts';
import { setPertinenciaAtiva } from './pertinencia.ts';
import { setChecklistAtivo, setCondicionantesAtivas } from './conformidade.ts';
import { setAchadosAtivos } from './achados.ts';
import { getRiscosAtivos, setRiscosAtivos } from './riscos.ts';
import { setPapelAtivo } from '../auth/papeis.ts';
import { getEventosAtivos, limparEventosAtivos, ACOES_AUDITORIA } from '../services/auditoria.ts';
import type { Achado, Risco, ItemChecklist, Condicionante } from '../domain/tipos.ts';

describe('S4.2 — Tela da Etapa 6: Resultado Executivo e Encaminhamento (RN08, RN09, RN10)', () => {
  beforeEach(() => {
    setPapelAtivo('assessor');
    limparResultadoAtivo();
    limparEventosAtivos();

    // Cenário padrão: Aquisição Regular (Cenário 1 do manual)
    setProcessoAtivo({
      id: 'proc-resultado-t1',
      numero: 'SESP-PRO-2026/00123',
      instrumento: 'Termo Aditivo nº 02/2026',
      contratado: 'Tech MT Radiocomunicações Ltda.',
      cnpj: '12.345.678/0001-90',
      objeto: 'Prorrogação de prazo e prestação continuada de suporte de rádio digital',
      tipoOrigem: 'Pregão Eletrônico',
      valor: 240000,
      valorNaoAplicavel: false,
      vigenciaInicio: '2026-06-01',
      vigenciaFim: '2027-06-01',
      vigenciaNaoAplicavel: false
    });

    setPertinenciaAtiva({
      conclusao: 'PERTINENTE',
      justificativa: 'Objeto estritamente aderente ao planejamento institucional e ao plano plurianual da SESP-MT.',
      alinhamentoEstrategico: 'SIM',
      motivoAusente: 'NAO',
      acaoContinua: 'SIM',
      atendeNecessidade: 'SIM',
      riscoDescontinuidade: 'SIM'
    });

    const checklist: ItemChecklist[] = [
      { id: 'chk-01', categoria: 'JURIDICA', descricao: 'TR aprovado', status: 'conforme', obrigatorio: true },
      { id: 'chk-02', categoria: 'FISCAL', descricao: 'CND regular', status: 'conforme', obrigatorio: true },
      { id: 'chk-03', categoria: 'ORCAMENTARIA', descricao: 'Nota de reserva emitida', status: 'conforme', obrigatorio: true }
    ];
    setChecklistAtivo(checklist);

    const condicionantes: Condicionante[] = [
      { id: 'cnd-01', descricao: 'Apresentar certidão municipal atualizada', situacao: 'cumprida' }
    ];
    setCondicionantesAtivas(condicionantes);

    setAchadosAtivos([]);

    const riscos: Risco[] = [
      { dimensao: 'juridica', nivel: 'baixo', justificativa: 'Contrato padrão aprovado pela PGE-MT.', achadosRelacionados: [] },
      { dimensao: 'financeira', nivel: 'baixo', justificativa: 'Dotação orçamentária reservada.', achadosRelacionados: [] },
      { dimensao: 'operacional', nivel: 'baixo', justificativa: 'Equipe fiscal capacitada.', achadosRelacionados: [] },
      { dimensao: 'controle', nivel: 'baixo', justificativa: 'Auditoria interna sem apontamentos.', achadosRelacionados: [] }
    ];
    setRiscosAtivos(riscos);
  });

  test('renderResultadoScreen: renderiza elementos obrigatórios de governança, sugestão indicativa e salvaguardas', () => {
    const html = renderResultadoScreen();

    // 1. Título e identificação do processo
    assert.ok(html.includes('6. Resultado Executivo e Encaminhamento'));
    assert.ok(html.includes('SESP-PRO-2026/00123'));

    // 2. Banner de Governança Institucional (RN08/RN11)
    assert.ok(html.includes('Salvaguarda Institucional de Apoio à Decisão (RN08 / RN12)'));
    assert.ok(html.includes('estritamente indicativa'));
    assert.ok(html.includes('Não substitui a deliberação soberana e indelegável da autoridade competente'));

    // 3. Bloco 1: Sugestão do Motor do Sistema
    assert.ok(html.includes('1. Sugestão Indicativa do Sistema (Tabela de Decisão RN08)'));
    assert.ok(html.includes('Apto para Assinatura'));
    assert.ok(html.includes('P5 — Plena Regularidade Demonstrada'));
    assert.ok(html.includes('MOT-APTIDAO-PLENA-REGULARIDADE'));

    // 4. Bloco 2: Espaço de Deliberação do Assessor
    assert.ok(html.includes('2. Manifestação e Homologação do Parecer Técnico pelo Assessor'));
    assert.ok(html.includes('btn-adotar-sugestao-sistema'));

    // 5. Bloco 3: As Cinco Perguntas Executivas Centrais (RN09)
    assert.ok(html.includes('3. As Cinco Perguntas Executivas Centrais (RN09)'));
    assert.ok(html.includes('1. Pode assinar?'));
    assert.ok(html.includes('2. O que corrigir?'));
    assert.ok(html.includes('3. Quem corrige?'));
    assert.ok(html.includes('4. Retorna ao Gabinete?'));
    assert.ok(html.includes('5. Exige nova análise jurídica?'));

    // 6. Bloco 4: Salvaguardas Institucionais
    assert.ok(html.includes('Salvaguardas Normativas e Institucionais da Análise:'));
    assert.ok(html.includes('não constitui autorização automática para assinatura'));
  });

  test('adotarSugestaoSistema: homologa parecer em consonância com o motor e gera evento de auditoria', () => {
    const res = adotarSugestaoSistema();
    assert.equal(res.sucesso, true);
    assert.ok(res.mensagem.includes('homologada com sucesso'));

    // Verifica estado ativo
    assert.equal(getConclusaoValidada(), 'APTO_PARA_ASSINATURA');
    const validacao = getValidacaoHumana();
    assert.ok(validacao);
    assert.equal(validacao?.papel, 'assessor');
    assert.equal(getJustificativaDivergencia(), '');

    // Verifica emissão do evento de auditoria
    const eventos = getEventosAtivos();
    const evento = eventos.find((e) => e.acao === ACOES_AUDITORIA.VALIDACAO_CONCLUSAO);
    assert.ok(evento, 'Deve registrar evento VALIDACAO_CONCLUSAO');
    assert.equal(evento?.entidade, 'ConclusaoExecutiva');
    assert.equal(evento?.registroId, 'SESP-PRO-2026/00123');

    // Ao re-renderizar, deve exibir o estado homologado com selo e botão de reabertura
    const htmlAtualizado = renderResultadoScreen();
    assert.ok(htmlAtualizado.includes('PARECER HOMOLOGADO EM CONSONÂNCIA'));
    assert.ok(htmlAtualizado.includes('btn-reabrir-conclusao'));
  });

  test('validarConclusaoAssessor com divergência: exige justificativa mínima (>= 10 chars)', () => {
    // Sugestão é APTO_PARA_ASSINATURA. Assessor escolhe RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA.
    // Tentativa 1: Sem justificativa ou justificativa curta (< 10 chars)
    const resCurta = validarConclusaoAssessor(
      'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA',
      'Curto'
    );
    assert.equal(resCurta.sucesso, false);
    assert.ok(resCurta.mensagem.includes('mínimo de 10 caracteres'));
    assert.equal(getConclusaoValidada(), null);

    // Tentativa 2: Com justificativa detalhada e válida (>= 10 chars)
    const resValida = validarConclusaoAssessor(
      'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA',
      'Necessário verificar a atualização da planilha orçamentária do exercício 2026 antes de firmar o aditivo.',
      'Avisar a gerência de contratos'
    );
    assert.equal(resValida.sucesso, true);
    assert.ok(resValida.mensagem.includes('Divergência técnica fundamentada'));
    assert.equal(getConclusaoValidada(), 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA');
    assert.ok(getJustificativaDivergencia().includes('planilha orçamentária'));
    assert.equal(getObservacoesAssessor(), 'Avisar a gerência de contratos');

    // Verifica auditoria de divergência
    const eventos = getEventosAtivos();
    const eventoDivergencia = eventos.find((e) => e.acao === ACOES_AUDITORIA.DIVERGENCIA_CONCLUSAO);
    assert.ok(eventoDivergencia, 'Deve registrar evento DIVERGENCIA_CONCLUSAO');

    // Re-renderização deve exibir alerta de divergência fundamentada
    const html = renderResultadoScreen();
    assert.ok(html.includes('PARECER HOMOLOGADO COM DIVERGÊNCIA MOTIVADA'));
    assert.ok(html.includes('planilha orçamentária'));
  });

  test('reabrirConclusaoParaRevisao: reverte homologação e registra evento de auditoria', () => {
    // Homologa primeiro
    adotarSugestaoSistema();
    assert.equal(getConclusaoValidada(), 'APTO_PARA_ASSINATURA');

    // Reabre
    reabrirConclusaoParaRevisao();
    assert.equal(getConclusaoValidada(), null);
    assert.equal(getValidacaoHumana(), null);

    const eventos = getEventosAtivos();
    const eventoReabertura = eventos.find((e) => e.acao === ACOES_AUDITORIA.REABERTURA_CONCLUSAO);
    assert.ok(eventoReabertura, 'Deve registrar evento REABERTURA_CONCLUSAO');
  });

  test('verificarAlteracaoMaterialPosterior (RN10): detecta alterações supervenientes nas etapas anteriores', () => {
    // 1. Homologa com os dados atuais
    adotarSugestaoSistema();
    assert.equal(verificarAlteracaoMaterialPosterior(), false);

    // 2. Modifica a avaliação de riscos (ex: altera risco jurídico para alto)
    const riscos = getRiscosAtivos();
    riscos[0].nivel = 'alto';
    setRiscosAtivos([...riscos]);

    // 3. O detector de invalidação dinâmica deve sinalizar alteração
    assert.equal(verificarAlteracaoMaterialPosterior(), true);

    // 4. Ao renderizar a tela, deve exibir o alerta ostensivo de reavaliação necessária
    const html = renderResultadoScreen();
    assert.ok(html.includes('material-invalidation-alert'));
    assert.ok(html.includes('Alteração Material Detectada nos Autos (RN10)'));
    assert.ok(html.includes('automaticamente invalidada'));
  });

  test('renderResultadoScreen e ações: bloqueadas em modo somente leitura (Leitor / Aprovador)', () => {
    setPapelAtivo('leitor');

    // 1. Renderiza banner de modo consulta
    const html = renderResultadoScreen();
    assert.ok(html.includes('readonly-banner'));
    assert.ok(html.includes('Modo Somente Consulta'));

    // 2. Ações de alteração devem ser rejeitadas
    const resAdotar = adotarSugestaoSistema();
    assert.equal(resAdotar.sucesso, false);
    assert.ok(resAdotar.mensagem.includes('somente consulta'));

    const resValidar = validarConclusaoAssessor('APTO_PARA_ASSINATURA');
    assert.equal(resValidar.sucesso, false);
    assert.ok(resValidar.mensagem.includes('somente consulta'));
  });

  test('respostas das Cinco Perguntas Executivas (RN09) refletem achados e pendências reais', () => {
    // Simula achado impeditivo validado
    const achadoImpeditivo: Achado = {
      id: 'ach-imp-01',
      titulo: 'Ausência de Dotação Orçamentária Específica',
      evidencia: 'Não consta nos autos nota de pré-empenho ou declaração orçamentária.',
      regraOuMotivo: 'Art. 10 da Lei Federal 14.133/2021',
      impacto: 'Comprometimento fiscal da pasta.',
      providencia: 'Solicitar emissão de declaração orçamentária ao setor financeiro.',
      responsavel: 'Setor de Execução Orçamentária e Financeira',
      classificacaoSugerida: 'IMPEDITIVO',
      classificacao: 'IMPEDITIVO',
      classificacaoValidada: 'IMPEDITIVO',
      estadoValidacao: 'VALIDADO'
    };
    setAchadosAtivos([achadoImpeditivo]);

    const resultado = getResultadoExecutivoAtivo();
    assert.equal(resultado.conclusao, 'NAO_RECOMENDAVEL_PARA_ASSINATURA');
    assert.equal(resultado.precedenciaAplicada, 'P2');

    const html = renderResultadoScreen();
    // Pergunta 1: Não apto
    assert.ok(html.includes('Não recomendável para assinatura'));
    // Pergunta 2: Achado impeditivo listado
    assert.ok(html.includes('Solicitar emissão de declaração orçamentária ao setor financeiro.'));
    // Pergunta 3: Responsável indicado
    assert.ok(html.includes('Setor de Execução Orçamentária e Financeira'));
    // Pergunta 5: Reanálise jurídica recomendada
    assert.ok(html.includes('recomenda-se manifestação da PGE/Assessoria Jurídica'));
  });
});
