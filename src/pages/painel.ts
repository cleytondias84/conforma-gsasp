/**
 * CONFORMA GSASP — Painel Executivo e Quadro Síntese
 * Implementação da Tarefa S3.6 (Sprint 3)
 * 
 * Visão consolidada da análise ativa, contadores derivados dos dados vigentes,
 * distinção estrita entre sugestões/achados validados e indicadores de produtividade
 * estruturados com salvaguardas de governança (metas vs. medições).
 */

import { getProcessoAtivo } from './identificacao.ts';
import { getPertinenciaAtiva } from './pertinencia.ts';
import { getChecklistAtivo, getCondicionantesAtivas } from './conformidade.ts';
import { getAchadosAtivos } from './achados.ts';
import { getRiscosAtivos } from './riscos.ts';
import { getEventosAtivos, abrirModalAuditoria } from '../services/auditoria.ts';
import { getInfoPapelAtivo } from '../auth/papeis.ts';
import type { NivelRisco, DimensaoRisco, ConclusaoPertinencia } from '../domain/tipos.ts';

export interface ContadoresPainel {
  processo: {
    numero: string;
    instrumento: string;
    objeto: string;
    contratado: string;
    cnpj: string;
    valorFormatado: string;
    vigenciaFormatada: string;
    preenchido: boolean;
  };
  pertinencia: {
    avaliada: boolean;
    conclusao?: ConclusaoPertinencia | null;
    rotuloConclusao: string;
  };
  checklist: {
    total: number;
    conformes: number;
    pendentes: number;
    aConfirmar: number;
    naoAplicaveis: number;
  };
  condicionantes: {
    total: number;
    atendidas: number;
    emCumprimento: number;
    pendentes: number;
    naoAplicavel: number;
  };
  achados: {
    total: number;
    validados: number;
    validadosPorGravidade: {
      impeditivos: number;
      relevantes: number;
      formais: number;
      melhorias: number;
    };
    sugestoesPendentes: number;
    rejeitados: number;
    manuais: number;
  };
  riscos: {
    totalDimensoes: number;
    avaliadas: number;
    pendentes: number;
    detalhe: Record<DimensaoRisco, NivelRisco | 'PENDENTE'>;
  };
  auditoria: {
    totalEventos: number;
  };
  indicadores: {
    tempoMedio: {
      nome: string;
      baseline: string;
      meta: string;
      medicao: string;
      formula: string;
    };
    taxaRetrabalho: {
      nome: string;
      baseline: string;
      meta: string;
      medicao: string;
      formula: string;
    };
  };
}

/**
 * Obtém os contadores consolidados derivados estritamente do estado ativo da análise.
 * Operação puramente de leitura: NÃO altera dados nem gera eventos de auditoria.
 */
export function obterContadoresPainel(): ContadoresPainel {
  const processo = getProcessoAtivo();
  const pertinencia = getPertinenciaAtiva();
  const checklist = getChecklistAtivo();
  const condicionantes = getCondicionantesAtivas();
  const achados = getAchadosAtivos();
  const riscos = getRiscosAtivos();
  const eventos = getEventosAtivos();

  // 1. Processo / Identificação
  const valorFormatado = processo.valor !== undefined && processo.valor !== null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(processo.valor)
    : 'Não informado';

  let vigenciaFormatada = 'Não informada';
  if (processo.vigenciaInicio && processo.vigenciaFim) {
    vigenciaFormatada = `${processo.vigenciaInicio} a ${processo.vigenciaFim}`;
  } else if (processo.vigenciaInicio) {
    vigenciaFormatada = `A partir de ${processo.vigenciaInicio}`;
  }

  const processoPreenchido = Boolean(
    processo.numero && processo.objeto && processo.contratado && processo.vigenciaInicio
  );

  // 2. Pertinência
  let rotuloPertinencia = 'Pendente de avaliação';
  switch (pertinencia.conclusao) {
    case 'PERTINENTE':
      rotuloPertinencia = 'Demonstrada (Sem ressalvas)';
      break;
    case 'PERTINENTE_COM_JUSTIFICATIVA':
      rotuloPertinencia = 'Demonstrada com justificativa';
      break;
    case 'NAO_DEMONSTRADA':
      rotuloPertinencia = 'Não demonstrada nos autos';
      break;
    case 'NAO_PERTINENTE':
      rotuloPertinencia = 'Incompatível com objetivos do órgão';
      break;
  }

  // 3. Checklist
  const conformes = checklist.filter((item) => item.status === 'ok').length;
  const pendentesChecklist = checklist.filter((item) => item.status === 'pendente').length;
  const aConfirmar = checklist.filter((item) => item.status === 'confirmar').length;
  const naoAplicaveis = checklist.filter((item) => item.status === 'nao_aplicavel').length;

  // 4. Condicionantes
  const atendidas = condicionantes.filter((c) => c.situacao === 'atendida').length;
  const emCumprimento = condicionantes.filter((c) => c.situacao === 'em_cumprimento').length;
  const pendentesCond = condicionantes.filter((c) => c.situacao === 'pendente').length;
  const naoAplicavelCond = condicionantes.filter((c) => c.situacao === 'nao_aplicavel').length;

  // 5. Achados — Diferenciação estrita entre Validados, Sugestões e Rejeitados
  let impeditivosValidados = 0;
  let relevantesValidados = 0;
  let formaisValidados = 0;
  let melhoriasValidadas = 0;
  let validadosCount = 0;
  let sugestoesPendentesCount = 0;
  let rejeitadosCount = 0;
  let manuaisCount = 0;

  for (const achado of achados) {
    if (achado.origemManual) {
      manuaisCount++;
    }

    if (achado.estadoValidacao === 'VALIDADO') {
      validadosCount++;
      const grav = achado.classificacaoValidada || achado.classificacao;
      if (grav === 'IMPEDITIVO') impeditivosValidados++;
      else if (grav === 'RELEVANTE') relevantesValidados++;
      else if (grav === 'FORMAL') formaisValidados++;
      else if (grav === 'MELHORIA') melhoriasValidadas++;
    } else if (achado.estadoValidacao === 'SUGESTAO_SISTEMA') {
      sugestoesPendentesCount++;
    } else if (achado.estadoValidacao === 'REJEITADO') {
      rejeitadosCount++;
    }
  }

  // 6. Riscos — Preserva níveis humanos sem defaults artificiais
  const dimensoes: DimensaoRisco[] = ['juridica', 'financeira', 'operacional', 'controle'];
  const detalheRiscos: Record<DimensaoRisco, NivelRisco | 'PENDENTE'> = {
    juridica: 'PENDENTE',
    financeira: 'PENDENTE',
    operacional: 'PENDENTE',
    controle: 'PENDENTE'
  };

  let avaliadasRiscosCount = 0;
  for (const dim of dimensoes) {
    const itemRisco = riscos.find((r) => r.dimensao === dim);
    if (itemRisco && itemRisco.nivel) {
      detalheRiscos[dim] = itemRisco.nivel;
      avaliadasRiscosCount++;
    }
  }

  return {
    processo: {
      numero: processo.numero || 'Sem número registrado',
      instrumento: processo.instrumento || 'Não informado',
      objeto: processo.objeto || 'Objeto ainda não preenchido na Etapa 1',
      contratado: processo.contratado || 'Não informado',
      cnpj: processo.cnpj || 'Não informado',
      valorFormatado,
      vigenciaFormatada,
      preenchido: processoPreenchido
    },
    pertinencia: {
      avaliada: Boolean(pertinencia.conclusao),
      conclusao: pertinencia.conclusao,
      rotuloConclusao: rotuloPertinencia
    },
    checklist: {
      total: checklist.length,
      conformes,
      pendentes: pendentesChecklist,
      aConfirmar,
      naoAplicaveis
    },
    condicionantes: {
      total: condicionantes.length,
      atendidas,
      emCumprimento,
      pendentes: pendentesCond,
      naoAplicavel: naoAplicavelCond
    },
    achados: {
      total: achados.length,
      validados: validadosCount,
      validadosPorGravidade: {
        impeditivos: impeditivosValidados,
        relevantes: relevantesValidados,
        formais: formaisValidados,
        melhorias: melhoriasValidadas
      },
      sugestoesPendentes: sugestoesPendentesCount,
      rejeitados: rejeitadosCount,
      manuais: manuaisCount
    },
    riscos: {
      totalDimensoes: 4,
      avaliadas: avaliadasRiscosCount,
      pendentes: 4 - avaliadasRiscosCount,
      detalhe: detalheRiscos
    },
    auditoria: {
      totalEventos: eventos.length
    },
    indicadores: {
      tempoMedio: {
        nome: 'Tempo Médio de Análise',
        baseline: '30 min/processo (Estimado)',
        meta: 'Até 10 min/processo (~67% de redução)',
        medicao: 'Sem dados medidos',
        formula: 'Soma do tempo ativo de análises concluídas ÷ número de análises concluídas'
      },
      taxaRetrabalho: {
        nome: 'Taxa de Retrabalho após 1ª Análise',
        baseline: '30% (Estimado)',
        meta: 'Até 10% (~67% de redução)',
        medicao: 'Sem dados medidos',
        formula: '(Processos com retrabalho após 1ª análise ÷ total de 1ª análises concluídas) × 100'
      }
    }
  };
}

/**
 * Renderiza o Painel Executivo completo da análise ativa.
 */
export function renderPainelScreen(): string {
  const c = obterContadoresPainel();
  const infoPapel = getInfoPapelAtivo();

  // Status visual dos riscos
  const renderBadgeRisco = (nivel: NivelRisco | 'PENDENTE') => {
    switch (nivel) {
      case 'critico':
        return '<span class="tag-badge tag-impeditivo">Crítico</span>';
      case 'alto':
        return '<span class="tag-badge tag-relevante">Alto</span>';
      case 'moderado':
        return '<span class="tag-badge tag-formal">Moderado</span>';
      case 'baixo':
        return '<span class="tag-badge tag-melhoria">Baixo</span>';
      default:
        return '<span class="tag-badge tag-aguardando">Pendente</span>';
    }
  };

  return `
    <div class="painel-container">
      
      <!-- 1. Cabeçalho Executivo do Processo em Análise -->
      <section class="card painel-hero-card" aria-labelledby="painel-titulo-processo">
        <div class="painel-hero-header">
          <div>
            <div class="painel-badges-top">
              <span class="badge-didatico">Quadro Síntese Executivo</span>
              <span class="painel-status-pill">${c.processo.preenchido ? 'Em Instrução / Revisão' : 'Rascunho Inicial'}</span>
            </div>
            <h2 id="painel-titulo-processo" class="painel-hero-title">
              ${c.processo.numero}
            </h2>
            <p class="painel-hero-instrumento">
              <strong>${c.processo.instrumento}</strong> &bull; Contratado: <em>${c.processo.contratado}</em>
            </p>
          </div>
          <div class="painel-hero-actions">
            <a href="#/identificacao" class="btn btn-primary" title="Iniciar ou prosseguir com o fluxo de conferência">
              Continuar Análise →
            </a>
          </div>
        </div>

        <!-- Metadados Essenciais em Destaque (RN01) -->
        <div class="painel-meta-grid">
          <div class="painel-meta-item">
            <span class="painel-meta-label">Objeto:</span>
            <span class="painel-meta-val" title="${c.processo.objeto}">${c.processo.objeto}</span>
          </div>
          <div class="painel-meta-item">
            <span class="painel-meta-label">Valor Estimado:</span>
            <span class="painel-meta-val"><strong>${c.processo.valorFormatado}</strong></span>
          </div>
          <div class="painel-meta-item">
            <span class="painel-meta-label">Vigência:</span>
            <span class="painel-meta-val">${c.processo.vigenciaFormatada}</span>
          </div>
          <div class="painel-meta-item">
            <span class="painel-meta-label">CNPJ:</span>
            <span class="painel-meta-val">${c.processo.cnpj}</span>
          </div>
        </div>
      </section>

      <!-- 2. Grade de Cards das 6 Etapas com Contadores Reais -->
      <section class="painel-section" aria-labelledby="titulo-etapas-fluxo">
        <div class="painel-section-header">
          <h3 id="titulo-etapas-fluxo" class="section-subtitle">
            Situação das Etapas de Análise e Apoio à Decisão
          </h3>
          <span class="painel-perfil-aviso">
            Perfil ativo: <strong>${infoPapel.nome}</strong>
          </span>
        </div>

        <div class="painel-stages-grid">
          
          <!-- Card Etapa 1: Identificação -->
          <div class="card painel-stage-card">
            <div class="painel-card-header">
              <span class="stage-number-badge">1</span>
              <h4 class="painel-card-title">Identificação</h4>
            </div>
            <p class="painel-card-desc">Conferência dos elementos essenciais de identificação do instrumento (RN01).</p>
            <div class="painel-card-stat">
              <span class="stat-label">Situação:</span>
              <span class="stat-value ${c.processo.preenchido ? 'stat-ok' : 'stat-alert'}">
                ${c.processo.preenchido ? '✅ Dados Preenchidos' : '⚠️ Pendente de Preenchimento'}
              </span>
            </div>
            <div class="painel-card-footer">
              <a href="#/identificacao" class="btn btn-secondary btn-sm">Acessar Etapa 1 →</a>
            </div>
          </div>

          <!-- Card Etapa 2: Pertinência Institucional -->
          <div class="card painel-stage-card">
            <div class="painel-card-header">
              <span class="stage-number-badge">2</span>
              <h4 class="painel-card-title">Pertinência</h4>
            </div>
            <p class="painel-card-desc">Filtro obrigatório de conveniência, planejamento e competência pública (RN02).</p>
            <div class="painel-card-stat">
              <span class="stat-label">Conclusão:</span>
              <span class="stat-value ${c.pertinencia.avaliada ? 'stat-ok' : 'stat-alert'}">
                ${c.pertinencia.rotuloConclusao}
              </span>
            </div>
            <div class="painel-card-footer">
              <a href="#/pertinencia" class="btn btn-secondary btn-sm">Acessar Etapa 2 →</a>
            </div>
          </div>

          <!-- Card Etapa 3: Conformidade Documental -->
          <div class="card painel-stage-card">
            <div class="painel-card-header">
              <span class="stage-number-badge">3</span>
              <h4 class="painel-card-title">Conformidade</h4>
            </div>
            <p class="painel-card-desc">Checklist de instrução processual e atendimento a condicionantes jurídicas.</p>
            <div class="painel-counts-row">
              <div class="count-pill pill-ok" title="Itens conformes no checklist">
                <strong>${c.checklist.conformes}</strong> Conformes
              </div>
              <div class="count-pill pill-pendente" title="Itens pendentes no checklist">
                <strong>${c.checklist.pendentes}</strong> Pendentes
              </div>
              <div class="count-pill pill-condicionante" title="Condicionantes jurídicas">
                <strong>${c.condicionantes.total}</strong> Condicionantes (${c.condicionantes.pendentes} pend.)
              </div>
            </div>
            <p class="painel-card-salvaguarda">
              <em>* Pendências instrutórias e condicionantes não configuram impedimento automático (RN11/RN13).</em>
            </p>
            <div class="painel-card-footer">
              <a href="#/conformidade" class="btn btn-secondary btn-sm">Acessar Etapa 3 →</a>
            </div>
          </div>

          <!-- Card Etapa 4: Apontamento de Achados -->
          <div class="card painel-stage-card painel-card-destaque">
            <div class="painel-card-header">
              <span class="stage-number-badge">4</span>
              <h4 class="painel-card-title">Achados e Sugestões</h4>
            </div>
            <p class="painel-card-desc">Inconsistências identificadas com distinção entre sugestão e validação (RN05/RN06).</p>
            
            <div class="painel-achados-breakdown">
              <div class="achado-breakdown-item">
                <span class="breakdown-title">Achados Validados (${c.achados.validados}):</span>
                <div class="badges-inline-group">
                  <span class="tag-badge tag-impeditivo" title="Impeditivos validados">${c.achados.validadosPorGravidade.impeditivos} Impeditivo(s)</span>
                  <span class="tag-badge tag-relevante" title="Relevantes validados">${c.achados.validadosPorGravidade.relevantes} Relevante(s)</span>
                  <span class="tag-badge tag-formal" title="Formais validados">${c.achados.validadosPorGravidade.formais} Formal(is)</span>
                  <span class="tag-badge tag-melhoria" title="Melhorias validadas">${c.achados.validadosPorGravidade.melhorias} Melhoria(s)</span>
                </div>
              </div>
              
              <div class="achado-breakdown-item">
                <span class="breakdown-title">Sugestões e Rejeições:</span>
                <div class="badges-inline-group">
                  <span class="tag-badge tag-aguardando" title="Sugestões do motor pendentes de validação">${c.achados.sugestoesPendentes} Sugestão(ões) Pendente(s)</span>
                  <span class="tag-badge tag-secundaria" title="Apontamentos rejeitados fundamentadamente">${c.achados.rejeitados} Rejeitado(s)</span>
                </div>
              </div>
            </div>

            <p class="painel-card-salvaguarda">
              <em>* Sugestões do sistema não são contadas como impedimentos até validação formal do assessor.</em>
            </p>
            <div class="painel-card-footer">
              <a href="#/achados" class="btn btn-secondary btn-sm">Acessar Etapa 4 →</a>
            </div>
          </div>

          <!-- Card Etapa 5: Avaliação de Riscos -->
          <div class="card painel-stage-card">
            <div class="painel-card-header">
              <span class="stage-number-badge">5</span>
              <h4 class="painel-card-title">Avaliação de Riscos</h4>
            </div>
            <p class="painel-card-desc">Quadro multidimensional de riscos sob juízo e fundamentação humana (RN12).</p>
            
            <div class="painel-riscos-grid">
              <div class="risco-row">
                <span class="risco-dim-name">Jurídica:</span>
                ${renderBadgeRisco(c.riscos.detalhe.juridica)}
              </div>
              <div class="risco-row">
                <span class="risco-dim-name">Financeira:</span>
                ${renderBadgeRisco(c.riscos.detalhe.financeira)}
              </div>
              <div class="risco-row">
                <span class="risco-dim-name">Operacional:</span>
                ${renderBadgeRisco(c.riscos.detalhe.operacional)}
              </div>
              <div class="risco-row">
                <span class="risco-dim-name">Controle:</span>
                ${renderBadgeRisco(c.riscos.detalhe.controle)}
              </div>
            </div>

            <p class="painel-card-salvaguarda">
              <em>* Dimensões não avaliadas permanecem pendentes, sem atribuição de risco baixo artificial.</em>
            </p>
            <div class="painel-card-footer">
              <a href="#/riscos" class="btn btn-secondary btn-sm">Acessar Etapa 5 →</a>
            </div>
          </div>

          <!-- Card Etapa 6: Resultado & Encaminhamento -->
          <div class="card painel-stage-card">
            <div class="painel-card-header">
              <span class="stage-number-badge">6</span>
              <h4 class="painel-card-title">Resultado e Encaminhamento</h4>
            </div>
            <p class="painel-card-desc">Consolidação executiva para apoio à decisão da autoridade (RN08 e RN09).</p>
            
            <div class="painel-card-stat">
              <span class="stat-label">Minuta Executiva:</span>
              <span class="stat-value">Modelo das 5 Perguntas Preparado</span>
            </div>
            <p class="painel-card-salvaguarda">
              <em>* Estrutura de geração de relatório e impressão final (Sprint 4).</em>
            </p>
            <div class="painel-card-footer">
              <a href="#/resultado" class="btn btn-secondary btn-sm">Acessar Etapa 6 →</a>
            </div>
          </div>

        </div>
      </section>

      <!-- 3. Seção de Indicadores de Produtividade & Governança (Metas vs. Medições) -->
      <section class="card painel-kpi-section" aria-labelledby="titulo-indicadores-kpi">
        <div class="painel-kpi-header">
          <div>
            <h3 id="titulo-indicadores-kpi" class="painel-kpi-title">
              📈 Indicadores Estratégicos de Eficiência do Piloto
            </h3>
            <p class="painel-kpi-desc">
              Estrutura de acompanhamento do impacto do CONFORMA GSASP na produtividade e redução de retrabalho.
            </p>
          </div>
          <div class="painel-kpi-badge-wrap">
            <span class="badge-didatico">Governança Ética das Métricas</span>
          </div>
        </div>

        <div class="painel-kpi-grid">
          
          <!-- KPI 1: Tempo Médio de Análise -->
          <div class="kpi-card">
            <div class="kpi-card-header">
              <h4 class="kpi-title">${c.indicadores.tempoMedio.nome}</h4>
              <span class="kpi-tag">Eficiência Temporal</span>
            </div>
            <div class="kpi-body">
              <div class="kpi-row">
                <span class="kpi-label">Baseline Inicial Estimado:</span>
                <span class="kpi-val-baseline">${c.indicadores.tempoMedio.baseline}</span>
              </div>
              <div class="kpi-row">
                <span class="kpi-label">Meta do Piloto:</span>
                <span class="kpi-val-meta"><strong>${c.indicadores.tempoMedio.meta}</strong></span>
              </div>
              <div class="kpi-row kpi-row-medicao">
                <span class="kpi-label">Medição Atual da Amostra:</span>
                <span class="kpi-val-medicao">${c.indicadores.tempoMedio.medicao}</span>
              </div>
            </div>
            <div class="kpi-formula">
              <strong>Fórmula:</strong> ${c.indicadores.tempoMedio.formula}
            </div>
          </div>

          <!-- KPI 2: Taxa de Retrabalho -->
          <div class="kpi-card">
            <div class="kpi-card-header">
              <h4 class="kpi-title">${c.indicadores.taxaRetrabalho.nome}</h4>
              <span class="kpi-tag">Qualidade Instrutória</span>
            </div>
            <div class="kpi-body">
              <div class="kpi-row">
                <span class="kpi-label">Baseline Inicial Estimado:</span>
                <span class="kpi-val-baseline">${c.indicadores.taxaRetrabalho.baseline}</span>
              </div>
              <div class="kpi-row">
                <span class="kpi-label">Meta do Piloto:</span>
                <span class="kpi-val-meta"><strong>${c.indicadores.taxaRetrabalho.meta}</strong></span>
              </div>
              <div class="kpi-row kpi-row-medicao">
                <span class="kpi-label">Medição Atual da Amostra:</span>
                <span class="kpi-val-medicao">${c.indicadores.taxaRetrabalho.medicao}</span>
              </div>
            </div>
            <div class="kpi-formula">
              <strong>Fórmula:</strong> ${c.indicadores.taxaRetrabalho.formula}
            </div>
          </div>

        </div>

        <!-- Alerta Obrigatório de Governança Institucional (docs/contexto.md - Seção 2) -->
        <div class="painel-kpi-salvaguarda" role="note">
          <div class="kpi-salvaguarda-icon">⚖️</div>
          <div class="kpi-salvaguarda-text">
            <strong>Salvaguarda Institucional sobre Indicadores (docs/contexto.md — Seção 2 e 10):</strong>
            <p>
              Os baselines iniciais (30 min/processo e 30% de retrabalho) são estimativas referenciais de trabalho 
              sujeitas à aferição empírica no piloto com processos reais do GSASP. As metas estabelecidas representam 
              uma redução aproximada de 66,7% (arredondada para 67%), não constituindo alegação de ganho institucional 
              previamente comprovado.
            </p>
            <p>
              Na ausência de piloto com ciclo completo e medições ativas de processos concluídos, o sistema registra 
              rigorosamente <strong>"Sem dados medidos"</strong>, vedando a exibição de 0% ou a simulação artificial 
              de indicadores antes da validação da metodologia na Sprint 4 (S4.4).
            </p>
          </div>
        </div>

      </section>

      <!-- 4. Barra Inferior de Acesso Rápido e Trilha de Auditoria -->
      <section class="painel-actions-bar" aria-label="Ações rápidas da análise">
        <div class="painel-actions-left">
          <button type="button" id="btn-painel-auditoria" class="btn btn-secondary">
            📜 Trilha de Auditoria Local (${c.auditoria.totalEventos})
          </button>
        </div>
        <div class="painel-actions-right">
          <a href="#/identificacao" class="btn btn-primary btn-large">
            ${c.processo.preenchido ? 'Prosseguir Conferência Sequencial →' : 'Iniciar Conferência da Análise →'}
          </a>
        </div>
      </section>

    </div>
  `;
}

/**
 * Inicializa os ouvintes de eventos da tela do Painel Executivo.
 * Não altera dados nem emite eventos de auditoria.
 */
export function initPainelEvents(): void {
  const btnAuditoria = document.getElementById('btn-painel-auditoria');
  btnAuditoria?.addEventListener('click', () => {
    abrirModalAuditoria();
  });
}
