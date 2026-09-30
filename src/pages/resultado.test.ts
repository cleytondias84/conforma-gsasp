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
  verificarAlteracaoMaterialPosterior,
  getManifestacaoAnteriorInvalidada,
  exportarEstadoResultado,
  importarEstadoResultado
} from './resultado.ts';

import { setProcessoAtivo, getProcessoAtivo } from './identificacao.ts';
import { setPertinenciaAtiva, getPertinenciaAtiva, sincronizarPertinenciaDoFormulario } from './pertinencia.ts';
import { setChecklistAtivo, getChecklistAtivo, setCondicionantesAtivas, getCondicionantesAtivas } from './conformidade.ts';
import { setAchadosAtivos, getAchadosAtivos } from './achados.ts';
import { getRiscosAtivos, setRiscosAtivos } from './riscos.ts';
import { sincronizarEstadoDaTelaAtiva } from '../router.ts';
import { setPapelAtivo } from '../auth/papeis.ts';
import { getEventosAtivos, setEventosAtivos, limparEventosAtivos, ACOES_AUDITORIA } from '../services/auditoria.ts';
import { salvarRascunhoAtual, recuperarUltimoRascunho } from '../services/armazenamento.ts';
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

  test('Regressão TM-S4.2-03 (a, d): homologação P5 → alteração de risco → homologação anterior invalidada (preservada apenas no histórico/auditoria)', () => {
    // 1. Homologação inicial P5 em consonância com o sistema
    const resAdotar = adotarSugestaoSistema();
    assert.equal(resAdotar.sucesso, true);
    assert.equal(getConclusaoValidada(), 'APTO_PARA_ASSINATURA');
    assert.ok(getValidacaoHumana());
    assert.equal(getManifestacaoAnteriorInvalidada(), null);

    // 2. Alteração superveniente executada na Etapa 5: risco Operacional alterado para MODERADO
    const riscos = getRiscosAtivos();
    const riscoOp = riscos.find((r) => r.dimensao === 'operacional')!;
    riscoOp.nivel = 'moderado';
    setRiscosAtivos([...riscos]);

    // 3. RN10: Detecção de alteração material e invalidação dinâmica automática
    assert.equal(verificarAlteracaoMaterialPosterior(), true);

    // 4. Invalidação efetiva no estado ativo
    assert.equal(getConclusaoValidada(), null, 'A homologação anterior deve ter sua validade ativa retirada');
    assert.equal(getValidacaoHumana(), null, 'A validação humana ativa deve ser anulada');

    // 5. Preservação no histórico e na auditoria local
    const hist = getManifestacaoAnteriorInvalidada();
    assert.ok(hist, 'Deve preservar os metadados da manifestação anterior');
    assert.equal(hist?.conclusao, 'APTO_PARA_ASSINATURA');
    assert.ok(hist?.validacaoHumana?.validadoPor);

    const eventos = getEventosAtivos();
    const eventoInval = eventos.find((e) => e.acao === ACOES_AUDITORIA.INVALIDACAO_CONCLUSAO_RN10);
    assert.ok(eventoInval, 'Deve registrar evento INVALIDACAO_CONCLUSAO_RN10 na auditoria local');
    assert.equal(eventoInval?.entidade, 'ConclusaoExecutiva');

    // 6. Verificação da interface renderizada
    const html = renderResultadoScreen();
    // Banner RN10 ostensivo presente
    assert.ok(html.includes('material-invalidation-alert'));
    assert.ok(html.includes('Alteração Material Detectada nos Autos (RN10)'));
    assert.ok(html.includes('automaticamente invalidada'));

    // NÃO pode mais exibir o parecer anterior como homologado vigente no Bloco 2
    assert.ok(!html.includes('PARECER HOMOLOGADO COM DIVERGÊNCIA MOTIVADA'));
    assert.ok(!html.includes('PARECER HOMOLOGADO EM CONSONÂNCIA'));
    assert.ok(!html.includes('btn-reabrir-conclusao'));

    // Deve exibir o registro histórico desconstituído e instrução de nova apreciação
    assert.ok(html.includes('historico-manifestacao-invalidada-box'));
    assert.ok(html.includes('Histórico: Manifestação Anterior Automaticamente Invalidada (RN10)'));
    assert.ok(html.includes('Nova Apreciação Necessária'));

    // Deve permitir nova manifestação/homologação
    assert.ok(html.includes('btn-adotar-sugestao-sistema'));
    assert.ok(html.includes('btn-homologar-conclusao'));
  });

  test('Regressão TM-S4.2-03 (b): pertinência PERTINENTE permanece preservada após alteração exclusivamente na Etapa 5', () => {
    // 1. Garante Pertinência homologada como PERTINENTE
    setPertinenciaAtiva({
      conclusao: 'PERTINENTE',
      justificativa: 'Objeto plenamente pertinente e de interesse público comprovado.',
      respostas: {
        competenciaNecessidade: true,
        vinculoPlanejamento: true,
        beneficioInteressePublico: true,
        custoProporcionalidade: true,
        economicidade: true
      },
      evidencias: 'Documentação comprobatória nos autos.',
      providencia: 'Prosseguir com a instrução.'
    });
    assert.equal(getPertinenciaAtiva().conclusao, 'PERTINENTE');

    // 2. Modifica exclusivamente a Etapa 5 (Riscos)
    const riscos = getRiscosAtivos();
    const riscoOp = riscos.find((r) => r.dimensao === 'operacional')!;
    riscoOp.nivel = 'moderado';
    setRiscosAtivos([...riscos]);

    // 3. Executa sincronização de formulários (como ocorreria no salvamento de rascunho ou avanço de tela)
    sincronizarPertinenciaDoFormulario();
    sincronizarEstadoDaTelaAtiva();

    // 4. Pertinência DEVE permanecer intacta como PERTINENTE
    assert.equal(
      getPertinenciaAtiva().conclusao,
      'PERTINENTE',
      'A alteração de risco na Etapa 5 não pode apagar nem reverter a pertinência da Etapa 2 para Pendente/null'
    );
  });

  test('Regressão TM-S4.2-03 (c): risco Operacional BAIXO→MODERADO com demais dados regulares produz P4 / DEC-09C', () => {
    // 1. Processo plenamente regular, Pertinência PERTINENTE, Checklist resolvido, Condicionantes atendidas
    setPertinenciaAtiva({
      conclusao: 'PERTINENTE',
      justificativa: 'Objeto de interesse da segurança pública.',
      respostas: {
        competenciaNecessidade: true,
        vinculoPlanejamento: true,
        beneficioInteressePublico: true,
        custoProporcionalidade: true,
        economicidade: true
      },
      evidencias: 'Estudos técnicos preliminares.',
      providencia: 'Aprovação.'
    });
    setAchadosAtivos([]);

    // 2. Riscos: Operacional MODERADO, demais BAIXO
    const riscos: Risco[] = [
      { dimensao: 'juridica', nivel: 'baixo', justificativa: 'Sem apontamentos.', achadosRelacionados: [] },
      { dimensao: 'financeira', nivel: 'baixo', justificativa: 'Recurso garantido.', achadosRelacionados: [] },
      { dimensao: 'operacional', nivel: 'moderado', justificativa: 'Transição tecnológica requer atenção da equipe.', achadosRelacionados: [] },
      { dimensao: 'controle', nivel: 'baixo', justificativa: 'Controle interno favorável.', achadosRelacionados: [] }
    ];
    setRiscosAtivos(riscos);

    // 3. Avaliação pelo motor executivo
    const res = getResultadoExecutivoAtivo();

    // 4. O resultado esperado é P4 / DEC-09C / APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA
    assert.equal(res.conclusao, 'APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA');
    assert.equal(res.precedenciaAplicada, 'P4');
    assert.equal(res.regraDecAplicada, 'DEC-09C');
    assert.ok(res.codigosMotivo.includes('MOT-RESSALVA-RISCO-MODERADO'));
    assert.equal(res.exigeSaneamento, false);
    assert.equal(res.riscoConsolidado, 'moderado');
  });

  test('Regressão TM-S4.2-03: ciclo completo de invalidação RN10 e nova manifestação do assessor', () => {
    // 1. Estado inicial: Regular, P5, Homologado
    adotarSugestaoSistema();
    assert.equal(getConclusaoValidada(), 'APTO_PARA_ASSINATURA');

    // 2. Altera risco Operacional para MODERADO
    const riscos = getRiscosAtivos();
    riscos.find((r) => r.dimensao === 'operacional')!.nivel = 'moderado';
    setRiscosAtivos([...riscos]);

    // 3. Renderiza tela da Etapa 6: detecta invalidação RN10 e exibe nova sugestão P4
    const htmlPosInval = renderResultadoScreen();
    assert.ok(htmlPosInval.includes('material-invalidation-alert'));
    assert.ok(htmlPosInval.includes('Apto para Assinatura com Ressalva Não Impeditiva'));
    assert.equal(getConclusaoValidada(), null);

    // 4. Assessor adota a nova sugestão do sistema (P4 / DEC-09C)
    const resNovaAdocao = adotarSugestaoSistema();
    assert.equal(resNovaAdocao.sucesso, true);
    assert.equal(getConclusaoValidada(), 'APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA');

    // 5. Após a nova homologação humana, o alerta RN10 deve sumir e o novo parecer fica vigente
    assert.equal(verificarAlteracaoMaterialPosterior(), false);
    const htmlFinal = renderResultadoScreen();
    assert.ok(!htmlFinal.includes('material-invalidation-alert'));
    assert.ok(htmlFinal.includes('PARECER HOMOLOGADO EM CONSONÂNCIA'));
    assert.ok(htmlFinal.includes('Apto para Assinatura com Ressalva Não Impeditiva'));
    assert.ok(htmlFinal.includes('btn-reabrir-conclusao'));
  });

  test('Regressão Completa TM-S4.2-03 (A até G): Ciclo de alteração de risco, persistência, re-renderização, reload e auditoria RN10', async () => {
    // -------------------------------------------------------------
    // A) Estado Inicial
    // -------------------------------------------------------------
    // Pertinência PERTINENTE
    setPertinenciaAtiva({
      conclusao: 'PERTINENTE',
      justificativa: 'Instrução atende plenamente ao interesse público e competências da SESP-MT.',
      evidencias: 'Estudo Técnico Preliminar nº 01/2026.',
      providencia: 'Prosseguir.',
      respostas: {
        competenciaNecessidade: true,
        vinculoPlanejamento: true,
        beneficioInteressePublico: true,
        custoProporcionalidade: true,
        economicidade: true
      }
    });
    // Checklist resolvido
    setChecklistAtivo([
      { id: 'chk-01', categoria: 'JURIDICA', descricao: 'TR aprovado', status: 'conforme', obrigatorio: true },
      { id: 'chk-02', categoria: 'FISCAL', descricao: 'CND regular', status: 'conforme', obrigatorio: true }
    ]);
    // Condicionantes atendidas
    setCondicionantesAtivas([
      { id: 'cnd-01', descricao: 'Apresentar certidão', situacao: 'cumprida' }
    ]);
    // 4 riscos BAIXO
    setRiscosAtivos([
      { dimensao: 'juridica', nivel: 'baixo', justificativa: 'Sem apontamentos.', achadosRelacionados: [] },
      { dimensao: 'financeira', nivel: 'baixo', justificativa: 'Dotação reservada.', achadosRelacionados: [] },
      { dimensao: 'operacional', nivel: 'baixo', justificativa: 'Equipe pronta.', achadosRelacionados: [] },
      { dimensao: 'controle', nivel: 'baixo', justificativa: 'Sem apontamentos.', achadosRelacionados: [] }
    ]);
    setAchadosAtivos([]);

    // Motor no estado inicial deve sugerir P5 / DEC-10
    const sugInicial = getResultadoExecutivoAtivo();
    assert.equal(sugInicial.conclusao, 'APTO_PARA_ASSINATURA');
    assert.equal(sugInicial.precedenciaAplicada, 'P5');
    assert.equal(sugInicial.regraDecAplicada, 'DEC-10');

    // Homologa parecer P5/DEC-10
    const resHomologacao = adotarSugestaoSistema();
    assert.equal(resHomologacao.sucesso, true);
    assert.equal(getConclusaoValidada(), 'APTO_PARA_ASSINATURA');

    // Salva rascunho com o estado inicial homologado
    const estadoResInicial = exportarEstadoResultado();
    await salvarRascunhoAtual(
      getProcessoAtivo(),
      getPertinenciaAtiva(),
      getChecklistAtivo(),
      getCondicionantesAtivas(),
      'rascunho',
      getAchadosAtivos(),
      getRiscosAtivos(),
      getEventosAtivos(),
      sugInicial.conclusao,
      getConclusaoValidada(),
      getValidacaoHumana(),
      estadoResInicial
    );

    // -------------------------------------------------------------
    // B) Alterar SOMENTE risco Operacional BAIXO -> MODERADO
    // -------------------------------------------------------------
    const riscos = getRiscosAtivos();
    riscos.find((r) => r.dimensao === 'operacional')!.nivel = 'moderado';
    setRiscosAtivos([...riscos]);

    // Salva o rascunho com a alteração superveniente na etapa de riscos
    const estadoResAposAltera = exportarEstadoResultado();
    await salvarRascunhoAtual(
      getProcessoAtivo(),
      getPertinenciaAtiva(),
      getChecklistAtivo(),
      getCondicionantesAtivas(),
      'rascunho',
      getAchadosAtivos(),
      getRiscosAtivos(),
      getEventosAtivos(),
      getResultadoExecutivoAtivo().conclusao,
      getConclusaoValidada(),
      getValidacaoHumana(),
      estadoResAposAltera
    );

    // -------------------------------------------------------------
    // C) Após a alteração
    // -------------------------------------------------------------
    // 1. Renderiza a Etapa 6
    const htmlPosAlteracao = renderResultadoScreen();

    // 2. Pertinência continua PERTINENTE
    assert.equal(getPertinenciaAtiva().conclusao, 'PERTINENTE');
    assert.ok(htmlPosAlteracao.includes('Pertinência: <strong>PERTINENTE</strong>'));

    // 3. Risco consolidado MODERADO
    const resPosAlteracao = getResultadoExecutivoAtivo();
    assert.equal(resPosAlteracao.riscoConsolidado, 'moderado');
    assert.ok(htmlPosAlteracao.includes('Risco Consolidado: <strong>MODERADO</strong>'));

    // 4. Motor retorna P4 / DEC-09C / APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA
    assert.equal(resPosAlteracao.conclusao, 'APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA');
    assert.equal(resPosAlteracao.precedenciaAplicada, 'P4');
    assert.equal(resPosAlteracao.regraDecAplicada, 'DEC-09C');
    assert.ok(resPosAlteracao.codigosMotivo.includes('MOT-RESSALVA-RISCO-MODERADO'));

    // 5. Parecer anterior NÃO permanece ativo
    assert.equal(getConclusaoValidada(), null);
    assert.ok(!htmlPosAlteracao.includes('PARECER HOMOLOGADO COM DIVERGÊNCIA MOTIVADA'));
    assert.ok(!htmlPosAlteracao.includes('PARECER HOMOLOGADO EM CONSONÂNCIA'));
    assert.ok(!htmlPosAlteracao.includes('btn-reabrir-conclusao'));

    // 6. Estado exige nova apreciação
    assert.equal(verificarAlteracaoMaterialPosterior(), true);
    assert.ok(htmlPosAlteracao.includes('Nova Apreciação Necessária'));
    assert.ok(htmlPosAlteracao.includes('Histórico: Manifestação Anterior Automaticamente Invalidada (RN10)'));
    assert.ok(htmlPosAlteracao.includes('btn-adotar-sugestao-sistema'));
    assert.ok(htmlPosAlteracao.includes('form-homologacao-conclusao'));

    // -------------------------------------------------------------
    // D) Executar nova renderização da Etapa 6 e confirmar estabilidade
    // -------------------------------------------------------------
    const htmlSegundaRender = renderResultadoScreen();
    assert.equal(getPertinenciaAtiva().conclusao, 'PERTINENTE');
    assert.ok(htmlSegundaRender.includes('Pertinência: <strong>PERTINENTE</strong>'));
    assert.equal(getResultadoExecutivoAtivo().conclusao, 'APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA');
    assert.equal(getResultadoExecutivoAtivo().precedenciaAplicada, 'P4');
    assert.equal(getResultadoExecutivoAtivo().regraDecAplicada, 'DEC-09C');
    assert.equal(getConclusaoValidada(), null);
    assert.ok(!htmlSegundaRender.includes('PARECER HOMOLOGADO COM DIVERGÊNCIA MOTIVADA'));
    assert.ok(htmlSegundaRender.includes('Nova Apreciação Necessária'));

    const htmlTerceiraRender = renderResultadoScreen();
    assert.equal(getPertinenciaAtiva().conclusao, 'PERTINENTE');
    assert.equal(getConclusaoValidada(), null);

    // -------------------------------------------------------------
    // E) Recarregar a página e confirmar novamente os mesmos resultados
    // -------------------------------------------------------------
    // Simula salvamento atual antes de recarregar (como ocorre no navegador)
    const estadoResAntesReload = exportarEstadoResultado();
    await salvarRascunhoAtual(
      getProcessoAtivo(),
      getPertinenciaAtiva(),
      getChecklistAtivo(),
      getCondicionantesAtivas(),
      'rascunho',
      getAchadosAtivos(),
      getRiscosAtivos(),
      getEventosAtivos(),
      getResultadoExecutivoAtivo().conclusao,
      getConclusaoValidada(),
      getValidacaoHumana(),
      estadoResAntesReload
    );

    // Limpa a memória volátil como aconteceria em um refresh / reload F5
    limparResultadoAtivo();

    // Executa a restauração completa a partir do rascunho recuperado
    const rascunhoRecuperado = await recuperarUltimoRascunho();
    assert.ok(rascunhoRecuperado);
    setProcessoAtivo(rascunhoRecuperado.processo);
    setPertinenciaAtiva(rascunhoRecuperado.pertinencia);
    setChecklistAtivo(rascunhoRecuperado.checklist);
    setCondicionantesAtivas(rascunhoRecuperado.condicionantes);
    if (rascunhoRecuperado.achados) setAchadosAtivos(rascunhoRecuperado.achados);
    if (rascunhoRecuperado.riscos) setRiscosAtivos(rascunhoRecuperado.riscos);
    if (rascunhoRecuperado.eventos) setEventosAtivos(rascunhoRecuperado.eventos);
    importarEstadoResultado({
      conclusaoValidada: rascunhoRecuperado.conclusaoValidada || null,
      validacaoHumana: rascunhoRecuperado.validacaoHumana || null,
      justificativaDivergencia: rascunhoRecuperado.justificativaDivergencia || '',
      observacoesAssessor: rascunhoRecuperado.observacoesAssessor || '',
      hashDadosEtapasAnteriores: rascunhoRecuperado.hashDadosEtapasAnteriores || '',
      necessitaNovaRevisaoConclusao: rascunhoRecuperado.necessitaNovaRevisaoConclusao || false,
      manifestacaoAnteriorInvalidada: rascunhoRecuperado.manifestacaoAnteriorInvalidada || null
    });

    // Renderiza a Etapa 6 após o reload
    const htmlPosReload = renderResultadoScreen();
    // Confirma que pertinência continua PERTINENTE após reload
    assert.equal(getPertinenciaAtiva().conclusao, 'PERTINENTE');
    assert.ok(htmlPosReload.includes('Pertinência: <strong>PERTINENTE</strong>'));
    // Confirma P4 / DEC-09C estável após reload
    const resPosReload = getResultadoExecutivoAtivo();
    assert.equal(resPosReload.conclusao, 'APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA');
    assert.equal(resPosReload.precedenciaAplicada, 'P4');
    assert.equal(resPosReload.regraDecAplicada, 'DEC-09C');
    assert.equal(resPosReload.riscoConsolidado, 'moderado');
    // Confirma que parecer anterior NÃO permanece ativo
    assert.equal(getConclusaoValidada(), null);
    assert.ok(!htmlPosReload.includes('PARECER HOMOLOGADO COM DIVERGÊNCIA MOTIVADA'));
    assert.ok(htmlPosReload.includes('Nova Apreciação Necessária'));

    // -------------------------------------------------------------
    // F) Auditoria
    // -------------------------------------------------------------
    const eventosAuditoria = getEventosAtivos();
    const eventosInvalidacao = eventosAuditoria.filter(
      (e) => e.acao === ACOES_AUDITORIA.INVALIDACAO_CONCLUSAO_RN10
    );
    // Registrado UMA ÚNICA VEZ
    assert.equal(
      eventosInvalidacao.length,
      1,
      'O evento INVALIDACAO_CONCLUSAO_RN10 deve ser registrado exatamente uma vez, sem duplicações a cada renderização'
    );
    // Preserva histórico do parecer anterior nos dados do evento
    const eventoInval = eventosInvalidacao[0];
    assert.ok(eventoInval.antesDepois?.antes);
    assert.equal(
      (eventoInval.antesDepois.antes as { conclusaoValidada?: string }).conclusaoValidada,
      'APTO_PARA_ASSINATURA'
    );
    assert.equal(
      (eventoInval.antesDepois.depois as { status?: string }).status,
      'INVALIDADA_POR_ALTERACAO_SUPERVENIENTE_RN10'
    );

    // -------------------------------------------------------------
    // G) Confirmar que nenhuma função RN10 limpou ou resetou etapas anteriores
    // -------------------------------------------------------------
    assert.equal(getPertinenciaAtiva().conclusao, 'PERTINENTE');
    assert.equal(getPertinenciaAtiva().respostas.competenciaNecessidade, true);
    assert.equal(getChecklistAtivo().length, 2);
    assert.equal(getCondicionantesAtivas().length, 1);
    assert.equal(getRiscosAtivos().length, 4);
    assert.equal(getRiscosAtivos().find((r) => r.dimensao === 'operacional')?.nivel, 'moderado');
    assert.equal(getProcessoAtivo().id, 'proc-resultado-t1');
  });
});
