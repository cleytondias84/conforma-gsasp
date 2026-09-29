/**
 * CONFORMA GSASP — Tela da Etapa 6: Resultado Executivo e Encaminhamento (S4.2)
 * Base normativa: docs/regras-funcionais.md (Seção 7), docs/contexto.md (RN08, RN09, RN10, RN11, RN12)
 *
 * Princípios de Governança e Interface:
 * 1. Apresenta claramente a sugestão indicativa do motor determinístico puro (S4.1/S4.2).
 * 2. Alerta visual ostensivo de que a conclusão é indicativa e não substitui a decisão da autoridade competente.
 * 3. Garante a soberania técnica do assessor: divergência facultada mediante justificativa registrada (RN02/RN07).
 * 4. Preserva o princípio da invalidação dinâmica (RN10) por alterações supervenientes nos autos.
 * 5. Não cria mecanismo de assinatura, chancela eletrônica ou autorização automática para celebração.
 * 6. Responde estruturadamente às cinco perguntas executivas centrais (RN09).
 */

import type {
  TipoConclusao,
  ValidacaoHumana
} from '../domain/tipos.ts';
import {
  avaliarConclusaoExecutiva,
  formatarConclusao,
  obterRotuloPrecedencia,
  CATÁLOGO_MOTIVOS,
  SALVAGUARDAS_CONCLUSAO,
  type ResultadoConclusaoExecutiva,
  type DadosEntradaConclusao
} from '../domain/conclusao.ts';
import { getProcessoAtivo } from './identificacao.ts';
import { getPertinenciaAtiva } from './pertinencia.ts';
import { getChecklistAtivo, getCondicionantesAtivas } from './conformidade.ts';
import { getAchadosAtivos } from './achados.ts';
import { getRiscosAtivos } from './riscos.ts';
import { podeEditar, getPapelAtivo } from '../auth/papeis.ts';
import {
  registrarEventoLocal,
  ACOES_AUDITORIA
} from '../services/auditoria.ts';

// ==========================================
// 1. ESTADO DA ETAPA 6 (EM MEMÓRIA)
// ==========================================

let conclusaoValidadaAtiva: TipoConclusao | null = null;
let validacaoHumanaAtiva: ValidacaoHumana | null = null;
let justificativaDivergenciaAtiva: string = '';
let observacoesAssessorAtiva: string = '';

// Hash dos dados anteriores para detecção de alterações supervenientes (RN10)
let hashDadosEtapasAnteriores: string = '';
let necessitaNovaRevisaoConclusao: boolean = false;

export function necessitaRevisaoConclusao(): boolean {
  return necessitaNovaRevisaoConclusao;
}

function calcularHashEtapasAnteriores(): string {
  const p = getProcessoAtivo();
  const pert = getPertinenciaAtiva();
  const chk = getChecklistAtivo();
  const conds = getCondicionantesAtivas();
  const ach = getAchadosAtivos();
  const rsc = getRiscosAtivos();

  return JSON.stringify({
    proc: {
      numero: p.numero,
      objeto: p.objeto,
      instrumento: p.instrumento,
      valor: p.valor,
      vigenciaInicio: p.vigenciaInicio,
      vigenciaFim: p.vigenciaFim
    },
    pertConclusao: pert.conclusao,
    chk: chk.map((c) => ({ id: c.id, status: c.status, just: c.justificativaNaoAplicavel })),
    conds: conds.map((c) => ({ id: c.id, situacao: c.situacao })),
    ach: ach.map((a) => ({
      id: a.id,
      estadoValidacao: a.estadoValidacao,
      classificacao: a.classificacaoValidada || a.classificacao
    })),
    rsc: rsc.map((r) => ({ dimensao: r.dimensao, nivel: r.nivel }))
  });
}

// ==========================================
// 2. GETTERS E SETTERS DE ESTADO
// ==========================================

export function getConclusaoValidada(): TipoConclusao | null {
  return conclusaoValidadaAtiva;
}

export function getValidacaoHumana(): ValidacaoHumana | null {
  return validacaoHumanaAtiva ? { ...validacaoHumanaAtiva } : null;
}

export function getJustificativaDivergencia(): string {
  return justificativaDivergenciaAtiva;
}

export function getObservacoesAssessor(): string {
  return observacoesAssessorAtiva;
}

export function setConclusaoValidada(
  conclusao: TipoConclusao | null,
  validacao?: ValidacaoHumana | null,
  justificativaDivergencia: string = ''
): void {
  conclusaoValidadaAtiva = conclusao;
  validacaoHumanaAtiva = validacao ? { ...validacao } : null;
  justificativaDivergenciaAtiva = justificativaDivergencia;
  hashDadosEtapasAnteriores = calcularHashEtapasAnteriores();
  necessitaNovaRevisaoConclusao = false;
}

export function limparResultadoAtivo(): void {
  conclusaoValidadaAtiva = null;
  validacaoHumanaAtiva = null;
  justificativaDivergenciaAtiva = '';
  observacoesAssessorAtiva = '';
  hashDadosEtapasAnteriores = '';
  necessitaNovaRevisaoConclusao = false;
}

/**
 * Obtém a avaliação executiva sugerida pelo motor determinístico a partir dos dados atuais.
 */
export function getResultadoExecutivoAtivo(): ResultadoConclusaoExecutiva {
  const entrada: DadosEntradaConclusao = {
    processo: getProcessoAtivo(),
    pertinencia: getPertinenciaAtiva(),
    checklist: getChecklistAtivo(),
    condicionantes: getCondicionantesAtivas(),
    achados: getAchadosAtivos(),
    riscos: getRiscosAtivos()
  };

  return avaliarConclusaoExecutiva(entrada);
}

/**
 * Verifica se os dados das etapas anteriores foram alterados após a última validação humana (RN10).
 */
export function verificarAlteracaoMaterialPosterior(): boolean {
  if (!conclusaoValidadaAtiva) return false;
  if (!hashDadosEtapasAnteriores) return false;

  const hashAtual = calcularHashEtapasAnteriores();
  if (hashAtual !== hashDadosEtapasAnteriores) {
    necessitaNovaRevisaoConclusao = true;
    return true;
  }
  return false;
}

// ==========================================
// 3. AÇÕES DE HOMOLOGAÇÃO E REVISÃO HUMANA
// ==========================================

export function adotarSugestaoSistema(): { sucesso: boolean; mensagem: string } {
  if (!podeEditar()) {
    return {
      sucesso: false,
      mensagem: 'O perfil ativo está em modo somente consulta e não pode validar a conclusão.'
    };
  }

  const sugestao = getResultadoExecutivoAtivo();
  return validarConclusaoAssessor(
    sugestao.conclusao,
    '',
    observacoesAssessorAtiva
  );
}

export function validarConclusaoAssessor(
  conclusaoEscolhida: TipoConclusao,
  justificativaDivergencia?: string,
  observacoes?: string
): { sucesso: boolean; mensagem: string } {
  if (!podeEditar()) {
    return {
      sucesso: false,
      mensagem: 'O perfil ativo está em modo somente consulta e não pode homologar conclusões.'
    };
  }

  const sugestao = getResultadoExecutivoAtivo();
  const haDivergencia = conclusaoEscolhida !== sugestao.conclusao;

  if (haDivergencia) {
    const justLimpa = (justificativaDivergencia || '').trim();
    if (justLimpa.length < 10) {
      return {
        sucesso: false,
        mensagem:
          'A conclusão escolhida diverge da sugestão do sistema. É obrigatório registrar justificativa técnica detalhada (mínimo de 10 caracteres) para fundamentar a divergência (RN02/RN07).'
      };
    }
  }

  const estadoAnterior = {
    conclusaoValidada: conclusaoValidadaAtiva,
    validacaoHumana: validacaoHumanaAtiva ? { ...validacaoHumanaAtiva } : null
  };

  const papel = getPapelAtivo();
  const agoraIso = new Date().toISOString();

  const validacao: ValidacaoHumana = {
    validadoPor: `Assessor GSASP (${papel})`,
    dataHora: agoraIso,
    papel,
    observacoes: observacoes?.trim() || undefined
  };

  conclusaoValidadaAtiva = conclusaoEscolhida;
  validacaoHumanaAtiva = validacao;
  justificativaDivergenciaAtiva = haDivergencia ? (justificativaDivergencia || '').trim() : '';
  observacoesAssessorAtiva = observacoes?.trim() || '';
  hashDadosEtapasAnteriores = calcularHashEtapasAnteriores();
  necessitaNovaRevisaoConclusao = false;

  const acaoAuditoria = haDivergencia
    ? ACOES_AUDITORIA.DIVERGENCIA_CONCLUSAO
    : ACOES_AUDITORIA.VALIDACAO_CONCLUSAO;

  registrarEventoLocal({
    acao: acaoAuditoria,
    entidade: 'ConclusaoExecutiva',
    registroId: getProcessoAtivo().numero || 'conclusao-ativa',
    antesDepois: {
      antes: estadoAnterior,
      depois: {
        conclusaoValidada: conclusaoValidadaAtiva,
        haDivergencia,
        sugestaoSistema: sugestao.conclusao,
        justificativaDivergencia: justificativaDivergenciaAtiva || null,
        validadoPor: validacao.validadoPor,
        dataHora: validacao.dataHora
      }
    },
    descricao: haDivergencia
      ? `Parecer divergente homologado pelo assessor: ${formatarConclusao(conclusaoEscolhida)} (Sugestão do sistema: ${formatarConclusao(sugestao.conclusao)}). Justificativa técnica registrada nos autos.`
      : `Conclusão executiva homologada em consonância com o sistema: ${formatarConclusao(conclusaoEscolhida)}.`
  });

  return {
    sucesso: true,
    mensagem: haDivergencia
      ? 'Divergência técnica fundamentada com sucesso. Prevalece o juízo soberano do assessor (RN02/RN07).'
      : 'Conclusão executiva homologada com sucesso pelo assessor.'
  };
}

export function reabrirConclusaoParaRevisao(): void {
  if (!podeEditar()) return;

  const estadoAnterior = {
    conclusaoValidada: conclusaoValidadaAtiva,
    validadoPor: validacaoHumanaAtiva?.validadoPor,
    dataHora: validacaoHumanaAtiva?.dataHora
  };

  conclusaoValidadaAtiva = null;
  validacaoHumanaAtiva = null;
  justificativaDivergenciaAtiva = '';
  necessitaNovaRevisaoConclusao = false;

  registrarEventoLocal({
    acao: ACOES_AUDITORIA.REABERTURA_CONCLUSAO,
    entidade: 'ConclusaoExecutiva',
    registroId: getProcessoAtivo().numero || 'conclusao-ativa',
    antesDepois: {
      antes: estadoAnterior,
      depois: { conclusaoValidada: null, validadoPor: null }
    },
    descricao: 'Conclusão executiva reaberta pelo assessor para nova revisão e manifestação técnica.'
  });
}

export function sincronizarResultadoDoFormulario(): void {
  if (!podeEditar()) return;
  const justEl = document.getElementById('textarea-justificativa-divergencia') as HTMLTextAreaElement | null;
  if (justEl) {
    justificativaDivergenciaAtiva = justEl.value;
  }
  const obsEl = document.getElementById('textarea-observacoes-assessor') as HTMLTextAreaElement | null;
  if (obsEl) {
    observacoesAssessorAtiva = obsEl.value;
  }
}

// ==========================================
// 4. RENDERIZAÇÃO DA INTERFACE (HTML)
// ==========================================

function obterClasseBadgeConclusao(conclusao: TipoConclusao): string {
  switch (conclusao) {
    case 'APTO_PARA_ASSINATURA':
      return 'badge-conclusao-apto';
    case 'APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA':
      return 'badge-conclusao-ressalva';
    case 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA':
      return 'badge-conclusao-saneamento';
    case 'NAO_RECOMENDAVEL_PARA_ASSINATURA':
      return 'badge-conclusao-recusa';
    default:
      return 'badge-conclusao-default';
  }
}

function obterIconeConclusao(conclusao: TipoConclusao): string {
  switch (conclusao) {
    case 'APTO_PARA_ASSINATURA':
      return '✅';
    case 'APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA':
      return '⚠️';
    case 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA':
      return '🔄';
    case 'NAO_RECOMENDAVEL_PARA_ASSINATURA':
      return '🛑';
    default:
      return '📌';
  }
}

/**
 * Respostas às cinco perguntas executivas (RN09) baseadas na análise.
 */
function gerarRespostasCincoPerguntas(
  conclusaoEfetiva: TipoConclusao,
  resultado: ResultadoConclusaoExecutiva
): {
  pergunta1: { pergunta: string; resposta: string; destaque: string };
  pergunta2: { pergunta: string; resposta: string; itens: string[] };
  pergunta3: { pergunta: string; resposta: string; responsaveis: string[] };
  pergunta4: { pergunta: string; resposta: string };
  pergunta5: { pergunta: string; resposta: string };
} {
  const achados = getAchadosAtivos().filter((a) => a.estadoValidacao === 'VALIDADO');
  const chk = getChecklistAtivo();
  const conds = getCondicionantesAtivas();

  // 1. Pode assinar?
  let p1Resp = '';
  let p1Destaque = '';
  switch (conclusaoEfetiva) {
    case 'APTO_PARA_ASSINATURA':
      p1Resp =
        'Sim, a instrução processual reúne os elementos de conformidade necessários no estado atual dos autos, submetendo-se à deliberação soberana da autoridade competente.';
      p1Destaque = 'APTO (Submetido à Autoridade)';
      break;
    case 'APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA':
      p1Resp =
        'Sim, porém com ressalvas formais ou recomendações de monitoramento não impeditivas que devem ser registradas na autorização e acompanhadas durante a execução.';
      p1Destaque = 'APTO COM RESSALVA';
      break;
    case 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA':
      p1Resp =
        'Não no estado atual dos autos. O processo requer saneamento documental, cumprimento prévio de condicionantes jurídicas ou mitigação de riscos antes da subscrição.';
      p1Destaque = 'RETORNAR PARA SANEAMENTO';
      break;
    case 'NAO_RECOMENDAVEL_PARA_ASSINATURA':
      p1Resp =
        'Não recomendável para assinatura. Foram identificados óbices impeditivos, desconformidade institucional do objeto ou nível de risco crítico.';
      p1Destaque = 'NÃO RECOMENDÁVEL';
      break;
  }

  // 2. O que corrigir?
  const itensCorrigir: string[] = [];
  chk
    .filter((i) => i.status === 'pendente')
    .forEach((i) => itensCorrigir.push(`Juntar documento pendente: "${i.descricao}"`));
  chk
    .filter((i) => i.status === 'confirmar')
    .forEach((i) => itensCorrigir.push(`Realizar diligência no item a confirmar: "${i.descricao}"`));
  chk
    .filter((i) => i.status === 'nao_aplicavel' && (!i.justificativaNaoAplicavel || i.justificativaNaoAplicavel.trim().length < 5))
    .forEach((i) => itensCorrigir.push(`Justificar documentalmente dispensa do item: "${i.descricao}"`));
  conds
    .filter((c) => c.situacao === 'pendente' || c.situacao === 'em_cumprimento')
    .forEach((c) => itensCorrigir.push(`Comprovar atendimento da condicionante jurídica: "${c.descricao}"`));
  achados.forEach((a) => {
    itensCorrigir.push(`[${a.classificacaoValidada || a.classificacao}] ${a.providencia}`);
  });

  if (itensCorrigir.length === 0) {
    if (conclusaoEfetiva === 'APTO_PARA_ASSINATURA') {
      itensCorrigir.push('Nenhuma pendência material ou documental identificada nos autos.');
    } else {
      itensCorrigir.push(resultado.providenciaSugerida);
    }
  }

  // 3. Quem corrige?
  const responsaveisSet: Set<string> = new Set();
  conds
    .filter((c) => c.situacao === 'pendente' || c.situacao === 'em_cumprimento')
    .forEach((c) => responsaveisSet.add(c.responsavel?.trim() || 'Fiscal do Contrato / Setor Demandante'));
  achados.forEach((a) => responsaveisSet.add(a.responsavel));

  if (responsaveisSet.size === 0) {
    responsaveisSet.add('Setor Demandante / Fiscal do Instrumento');
  }

  // 4. Retorna ao Gabinete?
  const p4Resp =
    conclusaoEfetiva === 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA'
      ? 'Sim, os autos devem retornar ao Gabinete após o saneamento das pendências para nova apreciação antes da subscrição.'
      : 'Não se aplica retorno imediato para saneamento; processo em condições de deliberação pela autoridade ou de arquivamento.';

  // 5. Exige nova análise jurídica?
  const temCondJuridica = conds.some((c) => c.situacao === 'pendente' || c.situacao === 'em_cumprimento');
  const temAchadoJuridico = achados.some((a) => {
    const grav = a.classificacaoValidada || a.classificacao;
    return grav === 'IMPEDITIVO' || grav === 'RELEVANTE';
  });
  const p5Resp =
    temCondJuridica || temAchadoJuridico
      ? 'Sim, recomenda-se manifestação da PGE/Assessoria Jurídica antes de qualquer deliberação ou após o saneamento das pendências jurídicas.'
      : 'Não se vislumbra necessidade de reanálise jurídica formal, ressalvada eventual modificação substancial no termo.';

  return {
    pergunta1: { pergunta: '1. Pode assinar?', resposta: p1Resp, destaque: p1Destaque },
    pergunta2: {
      pergunta: '2. O que corrigir?',
      resposta: itensCorrigir.join('; '),
      itens: itensCorrigir
    },
    pergunta3: {
      pergunta: '3. Quem corrige?',
      resposta: Array.from(responsaveisSet).join(', '),
      responsaveis: Array.from(responsaveisSet)
    },
    pergunta4: { pergunta: '4. Retorna ao Gabinete?', resposta: p4Resp },
    pergunta5: { pergunta: '5. Exige nova análise jurídica?', resposta: p5Resp }
  };
}

/**
 * Renderiza a tela completa da Etapa 6.
 */
export function renderResultadoScreen(): string {
  const resultadoSugerido = getResultadoExecutivoAtivo();
  const alteracaoPosterior = verificarAlteracaoMaterialPosterior();
  const edicaoHabilitada = podeEditar();
  const conclusaoEfetiva = conclusaoValidadaAtiva || resultadoSugerido.conclusao;
  const cincoPerguntas = gerarRespostasCincoPerguntas(conclusaoEfetiva, resultadoSugerido);

  const haDivergencia =
    conclusaoValidadaAtiva !== null && conclusaoValidadaAtiva !== resultadoSugerido.conclusao;
  const processo = getProcessoAtivo();

  return `
    <div class="stage-header">
      <h2 class="stage-title">6. Resultado Executivo e Encaminhamento</h2>
      <p class="stage-description">
        Consolidação executiva da instrução para apoio à decisão da autoridade subscritora, regida pela RN08 e pelas salvaguardas institucionais da SESP-MT.
      </p>
    </div>

    <!-- Cartão Contextual do Processo Ativo -->
    <div class="processo-context-card">
      <div class="context-grid">
        <div class="context-item">
          <span class="context-label">Processo:</span>
          <span class="context-value">${processo.numero || '(Não informado)'}</span>
        </div>
        <div class="context-item">
          <span class="context-label">Instrumento:</span>
          <span class="context-value">${processo.instrumento || '(Não informado)'}</span>
        </div>
        <div class="context-item">
          <span class="context-label">Contratado:</span>
          <span class="context-value">${processo.contratado || '(Não informado)'}</span>
        </div>
        <div class="context-item">
          <span class="context-label">Objeto:</span>
          <span class="context-value">${processo.objeto || '(Não informado)'}</span>
        </div>
      </div>
    </div>

    <!-- BANNER MANDATÓRIO DE GOVERNANÇA (RN08 / RN12 / RN02 / RN07) -->
    <div class="governance-banner">
      <div class="governance-banner-icon">🏛️</div>
      <div class="governance-banner-content">
        <h3 class="governance-banner-title">Salvaguarda Institucional de Apoio à Decisão (RN08 / RN12)</h3>
        <p class="governance-banner-text">
          A recomendação do sistema é <strong>estritamente indicativa</strong> e destina-se a subsidiar a instrução processual.
          <strong>Não substitui a deliberação soberana e indelegável da autoridade competente</strong> (Secretário de Estado / Ordenador de Despesas).
          O assessor técnico possui autonomia funcional para divergir fundamentadamente da máquina mediante justificativa registrada nos autos (RN02/RN07).
          <strong>Nenhum ateste automático de conformidade nem autorização automática para assinatura são emitidos pelo sistema.</strong>
        </p>
      </div>
    </div>

    ${
      alteracaoPosterior
        ? `
      <div class="alert alert-warning material-invalidation-alert">
        <div class="alert-icon">⚠️</div>
        <div class="alert-body">
          <strong>Alteração Material Detectada nos Autos (RN10):</strong>
          <p>Dados cadastrais, checklist, condicionantes, achados ou matriz de riscos foram alterados após a manifestação anterior do assessor. A manifestação anterior foi <strong>automaticamente invalidada</strong>, exigindo nova apreciação e homologação humana.</p>
        </div>
      </div>
    `
        : ''
    }

    ${
      !edicaoHabilitada
        ? `
      <div class="readonly-banner">
        <span class="readonly-icon">🔒</span>
        <div>
          <strong>Modo Somente Consulta:</strong> O perfil ativo (${getPapelAtivo()}) permite visualizar as recomendações executivas e respostas analíticas, mas não possui permissão para homologar pareceres ou alterar a conclusão.
        </div>
      </div>
    `
        : ''
    }

    <!-- BLOCO 1: SUGESTÃO INDICATIVA DO MOTOR DETERMINÍSTICO (RN08) -->
    <section class="resultado-secao">
      <div class="secao-badge-header">
        <span class="secao-tag">Motor Lógico Puro</span>
        <h3 class="secao-titulo">1. Sugestão Indicativa do Sistema (Tabela de Decisão RN08)</h3>
      </div>

      <div class="card conclusao-sugestao-card ${obterClasseBadgeConclusao(resultadoSugerido.conclusao)}">
        <div class="conclusao-card-topo">
          <div class="conclusao-status-group">
            <span class="conclusao-icone-principal">${obterIconeConclusao(resultadoSugerido.conclusao)}</span>
            <div>
              <span class="conclusao-rotulo-subtitulo">Recomendação Sugerida pelo Sistema:</span>
              <h2 class="conclusao-titulo-destaque">${formatarConclusao(resultadoSugerido.conclusao)}</h2>
            </div>
          </div>
          <div class="conclusao-tags-meta">
            <span class="badge-precedencia" title="Ordem estrita de avaliação em cascata">${obterRotuloPrecedencia(resultadoSugerido.precedenciaAplicada)}</span>
            <span class="badge-regra-dec" title="Regra da tabela de decisão aplicada">Regra ${resultadoSugerido.regrasDecAplicadas.join(', ')}</span>
            <span class="badge-saneamento ${resultadoSugerido.exigeSaneamento ? 'badge-saneamento-sim' : 'badge-saneamento-nao'}">
              ${resultadoSugerido.exigeSaneamento ? '⚠️ Exige Saneamento Prévio' : 'ℹ️ Sem Saneamento Prévio'}
            </span>
          </div>
        </div>

        <div class="conclusao-providencia-box">
          <strong>Providência Sugerida na Saída Executiva:</strong>
          <p>${resultadoSugerido.providenciaSugerida}</p>
        </div>

        <!-- Códigos de Motivo (MOT) -->
        <div class="conclusao-motivos-box">
          <span class="motivos-box-titulo">Fundamentação e Códigos de Motivo Vinculados (${resultadoSugerido.codigosMotivo.length}):</span>
          <div class="motivos-grid">
            ${resultadoSugerido.codigosMotivo
              .map((cod) => {
                const metaMot = CATÁLOGO_MOTIVOS[cod];
                return `
                <div class="mot-item-card">
                  <div class="mot-item-header">
                    <span class="mot-code-badge">${cod}</span>
                    <span class="mot-nome">${metaMot?.denominacao || cod}</span>
                  </div>
                  <p class="mot-desc">${metaMot?.descricao || ''}</p>
                </div>
              `;
              })
              .join('')}
          </div>
        </div>

        <!-- Diagnóstico Sintético da Instrução -->
        <div class="instrucao-diagnostico-resumo">
          <span class="diagnostico-resumo-titulo">Síntese dos Elementos de Entrada Processual:</span>
          <div class="diagnostico-pills">
            <span class="diag-pill">Pertinência: <strong>${getPertinenciaAtiva().conclusao || 'Pendente'}</strong></span>
            <span class="diag-pill">Checklist Resolvidos: <strong>${resultadoSugerido.detalhes.itensChecklistResolvidos}</strong></span>
            <span class="diag-pill ${resultadoSugerido.detalhes.itensChecklistPendentes > 0 ? 'diag-pill-alerta' : ''}">
              Checklist Pendentes: <strong>${resultadoSugerido.detalhes.itensChecklistPendentes}</strong>
            </span>
            <span class="diag-pill ${resultadoSugerido.detalhes.itensChecklistAConfirmar > 0 ? 'diag-pill-alerta' : ''}">
              A Confirmar: <strong>${resultadoSugerido.detalhes.itensChecklistAConfirmar}</strong>
            </span>
            <span class="diag-pill">Condicionantes: <strong>${getCondicionantesAtivas().length} (${resultadoSugerido.detalhes.condicionantesPendentes} pendentes)</strong></span>
            <span class="diag-pill">Achados Validados: <strong>${getAchadosAtivos().filter((a) => a.estadoValidacao === 'VALIDADO').length}</strong></span>
            <span class="diag-pill">Risco Consolidado: <strong>${resultadoSugerido.riscoConsolidado ? resultadoSugerido.riscoConsolidado.toUpperCase() : 'PENDENTE'}</strong></span>
          </div>
        </div>
      </div>
    </section>

    <!-- BLOCO 2: MANIFESTAÇÃO E HOMOLOGAÇÃO HUMANA DO ASSESSOR (RN02 / RN07) -->
    <section class="resultado-secao">
      <div class="secao-badge-header">
        <span class="secao-tag secao-tag-human">Juízo Humano Soberano</span>
        <h3 class="secao-titulo">2. Manifestação e Homologação do Parecer Técnico pelo Assessor</h3>
      </div>

      <div class="card homologacao-card ${conclusaoValidadaAtiva ? 'homologacao-fechada' : 'homologacao-aberta'}">
        ${
          conclusaoValidadaAtiva
            ? `
          <!-- ESTADO HOMOLOGADO PELO ASSESSOR -->
          <div class="homologacao-status-header ${haDivergencia ? 'status-divergencia' : 'status-consonancia'}">
            <span class="homologacao-stamp-icon">${haDivergencia ? '⚠️' : '✅'}</span>
            <div>
              <span class="homologacao-tipo-texto">
                ${haDivergencia ? 'PARECER HOMOLOGADO COM DIVERGÊNCIA MOTIVADA' : 'PARECER HOMOLOGADO EM CONSONÂNCIA'}
              </span>
              <h3 class="homologacao-conclusao-final">${formatarConclusao(conclusaoValidadaAtiva)}</h3>
            </div>
            ${
              haDivergencia
                ? `<span class="badge badge-warning" style="margin-left:auto;">Prevalece Decisão Humana (RN02/RN07)</span>`
                : `<span class="badge badge-success" style="margin-left:auto;">Em Consonância com o Sistema</span>`
            }
          </div>

          <div class="homologacao-metadados">
            <div><strong>Homologado por:</strong> ${validacaoHumanaAtiva?.validadoPor || 'Assessor Técnico'}</div>
            <div><strong>Data/Hora:</strong> ${validacaoHumanaAtiva?.dataHora ? new Date(validacaoHumanaAtiva.dataHora).toLocaleString('pt-BR') : 'Não informada'}</div>
            <div><strong>Perfil Ativo:</strong> ${validacaoHumanaAtiva?.papel || getPapelAtivo()}</div>
          </div>

          ${
            haDivergencia && justificativaDivergenciaAtiva
              ? `
            <div class="homologacao-divergencia-box">
              <strong>Motivação Técnica da Divergência (Registrada nos Autos):</strong>
              <p class="divergencia-texto-registrado">${justificativaDivergenciaAtiva}</p>
            </div>
          `
              : ''
          }

          ${
            observacoesAssessorAtiva
              ? `
            <div class="homologacao-obs-box">
              <strong>Observações Complementares do Assessor:</strong>
              <p>${observacoesAssessorAtiva}</p>
            </div>
          `
              : ''
          }

          ${
            edicaoHabilitada
              ? `
            <div class="homologacao-acoes-rodape">
              <button type="button" class="btn btn-secondary" id="btn-reabrir-conclusao">
                ↩️ Reabrir Parecer para Revisão
              </button>
            </div>
          `
              : ''
          }
        `
            : `
          <!-- ESTADO EM REVISÃO HUMANA (PENDENTE DE HOMOLOGAÇÃO) -->
          <div class="homologacao-instrucoes-box">
            <p>
              O sistema sugere a conclusão indicativa acima. Avalie se as condições fáticas e documentais dos autos sustentam essa recomendação ou se cabe registrar juízo técnico divergente fundamentado.
            </p>
          </div>

          ${
            edicaoHabilitada
              ? `
            <div class="homologacao-quick-actions">
              <button type="button" class="btn btn-primary" id="btn-adotar-sugestao-sistema">
                ✨ Adotar Conclusão Sugerida pelo Sistema (${formatarConclusao(resultadoSugerido.conclusao)})
              </button>
              <span class="quick-actions-ou">ou selecione manualmente abaixo:</span>
            </div>

            <form id="form-homologacao-conclusao" class="form-homologacao">
              <div class="form-group">
                <label class="form-label"><strong>Conclusão Técnica a Homologar pelo Assessor (RN08):</strong></label>
                <div class="opcoes-conclusao-grid">
                  <label class="opcao-conclusao-card ${conclusaoValidadaAtiva === 'APTO_PARA_ASSINATURA' ? 'opcao-ativa' : ''}">
                    <input type="radio" name="opcao-conclusao" value="APTO_PARA_ASSINATURA" />
                    <div>
                      <strong class="opcao-titulo">Apto para Assinatura</strong>
                      <p class="opcao-desc">Plena conformidade documental, 4x riscos baixos e zero óbices materiais nos autos.</p>
                    </div>
                  </label>

                  <label class="opcao-conclusao-card ${conclusaoValidadaAtiva === 'APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA' ? 'opcao-ativa' : ''}">
                    <input type="radio" name="opcao-conclusao" value="APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA" />
                    <div>
                      <strong class="opcao-titulo">Apto para Assinatura com Ressalva Não Impeditiva</strong>
                      <p class="opcao-desc">Instrução apta, porém acompanhada de recomendações formais ou de monitoramento.</p>
                    </div>
                  </label>

                  <label class="opcao-conclusao-card ${conclusaoValidadaAtiva === 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA' ? 'opcao-ativa' : ''}">
                    <input type="radio" name="opcao-conclusao" value="RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA" />
                    <div>
                      <strong class="opcao-titulo">Retornar para Saneamento antes da Assinatura</strong>
                      <p class="opcao-desc">Pendências documentais, condicionantes jurídicas ou riscos que demandam saneamento prévio.</p>
                    </div>
                  </label>

                  <label class="opcao-conclusao-card ${conclusaoValidadaAtiva === 'NAO_RECOMENDAVEL_PARA_ASSINATURA' ? 'opcao-ativa' : ''}">
                    <input type="radio" name="opcao-conclusao" value="NAO_RECOMENDAVEL_PARA_ASSINATURA" />
                    <div>
                      <strong class="opcao-titulo">Não Recomendável para Assinatura</strong>
                      <p class="opcao-desc">Presença de óbice impeditivo nos autos, pertinência negativa ou matriz de risco crítica.</p>
                    </div>
                  </label>
                </div>
              </div>

              <!-- CAMPO DINÂMICO DE JUSTIFICATIVA DA DIVERGÊNCIA -->
              <div class="form-group campo-divergencia-container" id="campo-divergencia-container" style="display: none;">
                <div class="alert alert-warning">
                  <strong>⚠️ Divergência Técnica com o Sistema (RN02/RN07):</strong>
                  <p>A conclusão selecionada diverge da sugestão algorítmica. Prevalece soberanamente o juízo do assessor, sendo <strong>obrigatória justificativa técnica detalhada</strong> registrada para auditoria.</p>
                </div>
                <label for="textarea-justificativa-divergencia" class="form-label">
                  <strong>Justificativa Técnica da Divergência (Obrigatória — mínimo de 10 caracteres):</strong>
                </label>
                <textarea
                  id="textarea-justificativa-divergencia"
                  class="form-control"
                  rows="3"
                  placeholder="Fundamente os motivos de fato e de direito que justificam a divergência em relação à sugestão do sistema..."
                >${justificativaDivergenciaAtiva}</textarea>
                <small class="form-hint">A justificativa do assessor constará do relatório executivo e da trilha de auditoria.</small>
              </div>

              <div class="form-group">
                <label for="textarea-observacoes-assessor" class="form-label">
                  <strong>Observações Complementares do Parecerista (Opcional):</strong>
                </label>
                <textarea
                  id="textarea-observacoes-assessor"
                  class="form-control"
                  rows="2"
                  placeholder="Observações adicionais para a autoridade competente ou equipe de fiscalização..."
                >${observacoesAssessorAtiva}</textarea>
              </div>

              <div class="form-actions-bar">
                <button type="button" class="btn btn-primary" id="btn-homologar-conclusao">
                  ⚖️ Homologar Parecer Técnico do Assessor
                </button>
              </div>
            </form>
          `
              : `
            <div class="alert alert-info">
              A manifestação técnica do assessor está pendente de homologação. Controles de edição desabilitados neste perfil.
            </div>
          `
          }
        `
        }
      </div>
    </section>

    <!-- BLOCO 3: AS CINCO PERGUNTAS EXECUTIVAS ESSENCIAIS (RN09) -->
    <section class="resultado-secao">
      <div class="secao-badge-header">
        <span class="secao-tag">Apoio Executivo</span>
        <h3 class="secao-titulo">3. As Cinco Perguntas Executivas Centrais (RN09)</h3>
      </div>

      <div class="card cinco-perguntas-card">
        <div class="pergunta-executiva-item">
          <div class="pergunta-item-header">
            <span class="pergunta-num">1</span>
            <strong class="pergunta-titulo">${cincoPerguntas.pergunta1.pergunta}</strong>
            <span class="pergunta-destaque-badge ${obterClasseBadgeConclusao(conclusaoEfetiva)}">
              ${cincoPerguntas.pergunta1.destaque}
            </span>
          </div>
          <p class="pergunta-resposta">${cincoPerguntas.pergunta1.resposta}</p>
        </div>

        <div class="pergunta-executiva-item">
          <div class="pergunta-item-header">
            <span class="pergunta-num">2</span>
            <strong class="pergunta-titulo">${cincoPerguntas.pergunta2.pergunta}</strong>
          </div>
          <ul class="pergunta-itens-lista">
            ${cincoPerguntas.pergunta2.itens.map((item) => `<li>${item}</li>`).join('')}
          </ul>
        </div>

        <div class="pergunta-executiva-item">
          <div class="pergunta-item-header">
            <span class="pergunta-num">3</span>
            <strong class="pergunta-titulo">${cincoPerguntas.pergunta3.pergunta}</strong>
          </div>
          <p class="pergunta-resposta">
            Responsáveis indicados: <strong>${cincoPerguntas.pergunta3.resposta}</strong>
          </p>
        </div>

        <div class="pergunta-executiva-item">
          <div class="pergunta-item-header">
            <span class="pergunta-num">4</span>
            <strong class="pergunta-titulo">${cincoPerguntas.pergunta4.pergunta}</strong>
          </div>
          <p class="pergunta-resposta">${cincoPerguntas.pergunta4.resposta}</p>
        </div>

        <div class="pergunta-executiva-item">
          <div class="pergunta-item-header">
            <span class="pergunta-num">5</span>
            <strong class="pergunta-titulo">${cincoPerguntas.pergunta5.pergunta}</strong>
          </div>
          <p class="pergunta-resposta">${cincoPerguntas.pergunta5.resposta}</p>
        </div>
      </div>
    </section>

    <!-- BLOCO 4: SALVAGUARDAS NORMATIVAS DA SESP-MT -->
    <section class="resultado-secao">
      <div class="card salvaguardas-card">
        <h4 class="salvaguardas-titulo">🛡️ Salvaguardas Normativas e Institucionais da Análise:</h4>
        <ul class="salvaguardas-lista">
          ${SALVAGUARDAS_CONCLUSAO.map((s) => `<li>${s}</li>`).join('')}
        </ul>
      </div>
    </section>
  `;
}

// ==========================================
// 5. INICIALIZAÇÃO DE EVENTOS DO DOM
// ==========================================

export function initResultadoEvents(): void {
  // 1. Botão de Adotar Sugestão do Sistema
  const btnAdotar = document.getElementById('btn-adotar-sugestao-sistema');
  btnAdotar?.addEventListener('click', () => {
    sincronizarResultadoDoFormulario();
    const res = adotarSugestaoSistema();
    alert(res.mensagem);
    // Força re-render da tela através de evento de hash ou renderRoute
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });

  // 2. Monitoramento de seleção manual da conclusão para exibir campo de divergência
  const radioInputs = document.querySelectorAll<HTMLInputElement>('input[name="opcao-conclusao"]');
  const campoDivergencia = document.getElementById('campo-divergencia-container');
  const sugestao = getResultadoExecutivoAtivo();

  radioInputs.forEach((radio) => {
    radio.addEventListener('change', () => {
      const valorSelecionado = radio.value as TipoConclusao;
      if (campoDivergencia) {
        if (valorSelecionado !== sugestao.conclusao) {
          campoDivergencia.style.display = 'block';
        } else {
          campoDivergencia.style.display = 'none';
        }
      }
    });
  });

  // 3. Botão de Homologação Manual
  const btnHomologar = document.getElementById('btn-homologar-conclusao');
  btnHomologar?.addEventListener('click', () => {
    const selecionado = document.querySelector<HTMLInputElement>(
      'input[name="opcao-conclusao"]:checked'
    );
    if (!selecionado) {
      alert('Selecione uma das quatro opções de conclusão regulamentar antes de homologar.');
      return;
    }

    const valorConclusao = selecionado.value as TipoConclusao;
    const justEl = document.getElementById('textarea-justificativa-divergencia') as HTMLTextAreaElement | null;
    const obsEl = document.getElementById('textarea-observacoes-assessor') as HTMLTextAreaElement | null;

    const res = validarConclusaoAssessor(
      valorConclusao,
      justEl?.value || '',
      obsEl?.value || ''
    );

    alert(res.mensagem);
    if (res.sucesso) {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
  });

  // 4. Botão de Reabertura do Parecer
  const btnReabrir = document.getElementById('btn-reabrir-conclusao');
  btnReabrir?.addEventListener('click', () => {
    if (confirm('Deseja reabrir a conclusão executiva para nova revisão pelo assessor?')) {
      reabrirConclusaoParaRevisao();
      alert('Conclusão reaberta para revisão.');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
  });
}
