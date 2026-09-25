/**
 * CONFORMA GSASP — Tela da Etapa 2: Pertinência Institucional
 * Implementação da Tarefa S2.2 (Sprint 2)
 * Base: docs/contexto.md (RN02, RN07, RN13) e docs/sprint.md
 */

import type { Pertinencia, ConclusaoPertinencia } from '../domain/tipos';
import {
  validarPertinencia,
  sugerirConclusaoPertinencia,
  formatarConclusaoPertinencia,
  formatarMoeda,
  formatarDataBR,
  calcularDuracaoVigencia,
  type ResultadoValidacaoPertinencia
} from '../domain/validacao';
import { getProcessoAtivo } from './identificacao';

// Cenários didáticos determinísticos de Pertinência Institucional com dados estritamente fictícios
export const CENARIOS_PERTINENCIA_DEMO: Record<string, Pertinencia> = {
  'cenario-01': {
    respostas: {
      competenciaNecessidade: true,
      vinculoPlanejamento: true,
      beneficioInteressePublico: true,
      custoProporcionalidade: true,
      economicidade: true
    },
    evidencias: 'Documento Demonstrativo nº 01/2026 e ETP nº 04/2026: renovação do parque tecnológico das unidades operacionais prevista no plano de modernização setorial.',
    justificativa: 'Necessidade plenamente aderente às competências institucionais da pasta e aos objetivos estratégicos de modernização e aparelhamento da segurança pública.',
    conclusao: 'PERTINENTE',
    providencia: 'Prosseguir com o trâmite regular para verificação de conformidade documental e jurídica.'
  },
  'cenario-02': {
    respostas: {
      competenciaNecessidade: true,
      vinculoPlanejamento: true,
      beneficioInteressePublico: true,
      custoProporcionalidade: true,
      economicidade: true
    },
    evidencias: 'Relatório Técnico de Manutenção Predial nº 12/2025 e Certidão de Regularidade Operacional.',
    justificativa: 'Serviço de manutenção essencial e continuado. A prorrogação garante a conservação do patrimônio público com vantajosidade comprovada.',
    conclusao: 'PERTINENTE',
    providencia: 'Avançar para verificação dos requisitos formais de prorrogação e vantajosidade de preços.'
  },
  'cenario-03': {
    respostas: {
      competenciaNecessidade: true,
      vinculoPlanejamento: true,
      beneficioInteressePublico: true,
      custoProporcionalidade: true,
      economicidade: true
    },
    evidencias: 'Estudo Técnico Preliminar nº 08/2026 e Mapa Comparativo de Preços das unidades prediais.',
    justificativa: 'Serviço de apoio operacional indispensável ao funcionamento diário das unidades policiais e administrativas da SESP.',
    conclusao: 'PERTINENTE',
    providencia: 'Prosseguir para conformidade documental e conferência de dotação orçamentária.'
  },
  'cenario-04': {
    respostas: {
      competenciaNecessidade: true,
      vinculoPlanejamento: false,
      beneficioInteressePublico: null,
      custoProporcionalidade: false,
      economicidade: null
    },
    evidencias: 'Documentação enviada pela unidade demandante não correlaciona a quantidade solicitada às metas do plano anual.',
    justificativa: 'Não consta dos autos a demonstração inequívoca de benefício institucional direto e compatibilidade de custos para a quantidade pleiteada.',
    conclusao: 'NAO_DEMONSTRADA',
    providencia: 'Requerer estudo técnico complementar e justificativa de alinhamento com as metas operacionais antes de autorizar a adesão.'
  },
  'cenario-05': {
    respostas: {
      competenciaNecessidade: false,
      vinculoPlanejamento: false,
      beneficioInteressePublico: false,
      custoProporcionalidade: false,
      economicidade: false
    },
    evidencias: 'Inexistência de justificativa fática plausível e ausência de correlação com planos de segurança em vigor.',
    justificativa: 'Objeto em desvio de finalidade institucional evidente, sem demonstração de necessidade pública ou interesse coletivo.',
    conclusao: 'NAO_PERTINENTE',
    providencia: 'Sugerir indeferimento do prosseguimento e devolução imediata à origem para esclarecimentos circunstanciados.'
  }
};

// Estado da pertinência ativa em memória na sessão
let pertinenciaAtiva: Pertinencia = { ...CENARIOS_PERTINENCIA_DEMO['cenario-01'] };
let ultimoResultadoValidacaoPertinencia: ResultadoValidacaoPertinencia | null = null;
let cenarioPertinenciaSelecionadoId: string = 'cenario-01';

export function getPertinenciaAtiva(): Pertinencia {
  return pertinenciaAtiva;
}

export function setPertinenciaAtiva(pertinencia: Pertinencia): void {
  pertinenciaAtiva = { ...pertinencia };
}

/**
 * Renderiza o cartão de contexto do processo ativo registrado na Etapa 1.
 */
function renderContextoProcessoAtivo(): string {
  const p = getProcessoAtivo();

  let textoValor = '';
  if (p.valorNaoAplicavel) {
    textoValor = 'Não se aplica / Sem valor financeiro';
  } else if (p.valor !== null && p.valor !== undefined && !isNaN(p.valor)) {
    textoValor = formatarMoeda(p.valor);
  } else {
    textoValor = '(Valor não informado)';
  }

  let textoVigencia = '';
  if (p.vigenciaNaoAplicavel) {
    textoVigencia = 'Não se aplica / Indeterminado';
  } else if (p.vigenciaInicio && p.vigenciaFim) {
    const duracao = calcularDuracaoVigencia(p.vigenciaInicio, p.vigenciaFim);
    textoVigencia = `${formatarDataBR(p.vigenciaInicio)} a ${formatarDataBR(p.vigenciaFim)} ${duracao ? `(${duracao})` : ''}`;
  } else if (p.vigenciaInicio || p.vigenciaFim) {
    textoVigencia = `${formatarDataBR(p.vigenciaInicio)} até ${formatarDataBR(p.vigenciaFim)}`;
  } else {
    textoVigencia = '(Vigência não informada)';
  }

  return `
    <div class="processo-context-card" aria-label="Dados do processo ativo em análise">
      <div class="processo-context-header">
        <span class="processo-context-tag">Processo em Análise</span>
        <strong class="processo-context-numero">${p.numero || 'Processo Sem Número'}</strong>
        <span class="processo-context-instrumento">${p.instrumento || 'Instrumento não definido'}</span>
      </div>
      <div class="processo-context-body">
        <div class="processo-context-row">
          <span class="context-label">Objeto:</span>
          <span class="context-value">${p.objeto || '(Objeto não preenchido)'}</span>
        </div>
        <div class="processo-context-grid">
          <div>
            <span class="context-label">Tipo/Origem:</span>
            <span class="context-value">${p.tipoOrigem || 'Não informado'}</span>
          </div>
          <div>
            <span class="context-label">Valor Global:</span>
            <span class="context-value highlight-value">${textoValor}</span>
          </div>
          <div>
            <span class="context-label">Vigência:</span>
            <span class="context-value">${textoVigencia}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza um item de critério de pertinência com 3 opções acessíveis: Sim, Não ou A avaliar.
 */
function renderItemCriterio(
  id: keyof Pertinencia['respostas'],
  numero: number,
  titulo: string,
  pergunta: string,
  valorAtual: boolean | null
): string {
  const name = `criterio-${id}`;
  const strValor = valorAtual === true ? 'sim' : valorAtual === false ? 'nao' : 'a_avaliar';

  return `
    <div class="criterio-card" id="criterio-box-${id}">
      <div class="criterio-header">
        <span class="criterio-num">${numero}</span>
        <div>
          <h4 class="criterio-title">${titulo}</h4>
          <p class="criterio-question">${pergunta}</p>
        </div>
      </div>

      <div class="criterio-options-group" role="radiogroup" aria-label="Avaliação do critério: ${titulo}">
        <label class="criterio-option-label ${strValor === 'sim' ? 'is-selected is-sim' : ''}">
          <input 
            type="radio" 
            name="${name}" 
            value="sim" 
            ${strValor === 'sim' ? 'checked' : ''} 
            class="criterio-radio"
          />
          <span class="option-icon">✓</span>
          <span class="option-text">Sim (Atendido)</span>
        </label>

        <label class="criterio-option-label ${strValor === 'nao' ? 'is-selected is-nao' : ''}">
          <input 
            type="radio" 
            name="${name}" 
            value="nao" 
            ${strValor === 'nao' ? 'checked' : ''} 
            class="criterio-radio"
          />
          <span class="option-icon">✕</span>
          <span class="option-text">Não (Não atendido)</span>
        </label>

        <label class="criterio-option-label ${strValor === 'a_avaliar' ? 'is-selected is-avaliar' : ''}">
          <input 
            type="radio" 
            name="${name}" 
            value="a_avaliar" 
            ${strValor === 'a_avaliar' ? 'checked' : ''} 
            class="criterio-radio"
          />
          <span class="option-icon">?</span>
          <span class="option-text">A avaliar / Parcial</span>
        </label>
      </div>
    </div>
  `;
}

/**
 * Renderiza o painel de sugestão do sistema e validação humana (RN02).
 */
function renderPainelConclusao(pert: Pertinencia): string {
  const sugestao = sugerirConclusaoPertinencia(pert.respostas);
  const conclusaoValidada = pert.conclusao;
  const haDivergencia = Boolean(conclusaoValidada && conclusaoValidada !== sugestao);

  return `
    <div class="conclusao-pertinencia-panel" id="conclusao-panel">
      
      <!-- Bloco 1: Sugestão Algorítmica do Sistema (RN02 / RN07) -->
      <div class="sugestao-sistema-box" id="box-sugestao-sistema">
        <div class="sugestao-header">
          <span class="sugestao-badge">Sugestão Indicativa do Sistema</span>
          <span class="humano-badge" title="A IA confere e organiza; o assessor valida e decide">Pendente de Validação Humana (RN02)</span>
        </div>
        <div class="sugestao-resultado" id="disp-sugestao-texto">
          <strong>${formatarConclusaoPertinencia(sugestao)}</strong>
        </div>
        <p class="sugestao-hint">
          * A sugestão algorítmica acima é gerada com base estrita nas 5 respostas dos critérios. Ela não substitui o juízo discricionário do assessor técnico.
        </p>
      </div>

      <!-- Bloco 2: Conclusão Técnica do Assessor (Validação Humana Soberana) -->
      <div class="validacao-humana-box">
        <label for="campo-conclusao-pertinencia" class="form-label">
          <strong>Conclusão Técnica do Assessor (Validação Humana Obrigatória • RN02) <span class="required-indicator">*</span></strong>
        </label>
        <select id="campo-conclusao-pertinencia" name="conclusao" class="form-select" required aria-describedby="divergencia-alerta">
          <option value="" ${!conclusaoValidada ? 'selected' : ''}>-- Selecione a Conclusão Técnica Homologada --</option>
          <option value="PERTINENTE" ${conclusaoValidada === 'PERTINENTE' ? 'selected' : ''}>
            PERTINENTE — Interesse público, competência e necessidade demonstrados
          </option>
          <option value="PERTINENTE_COM_JUSTIFICATIVA" ${conclusaoValidada === 'PERTINENTE_COM_JUSTIFICATIVA' ? 'selected' : ''}>
            PERTINENTE COM JUSTIFICATIVA — Admissível mediante fundamentação complementar
          </option>
          <option value="NAO_DEMONSTRADA" ${conclusaoValidada === 'NAO_DEMONSTRADA' ? 'selected' : ''}>
            PERTINÊNCIA NÃO DEMONSTRADA — Ausência de motivação fática suficiente nos autos
          </option>
          <option value="NAO_PERTINENTE" ${conclusaoValidada === 'NAO_PERTINENTE' ? 'selected' : ''}>
            NÃO PERTINENTE — Objeto estranho às competências ou em descompasso com o interesse público
          </option>
        </select>

        <!-- Alerta de divergência entre a sugestão do sistema e a validação humana -->
        <div 
          id="divergencia-alerta" 
          class="divergence-box ${haDivergencia ? '' : 'hidden'}" 
          role="status" 
          aria-live="polite"
        >
          <span class="divergence-icon">ℹ️</span>
          <div>
            <strong>Validação humana soberana (RN02):</strong>
            <p id="divergencia-texto">
              A conclusão homologada (<span id="span-conclusao-humana">${conclusaoValidada || ''}</span>) 
              difere da sugestão do sistema (<span id="span-sugestao-sistema">${sugestao}</span>). 
              A avaliação humana prevalece mediante a fundamentação técnica registrada nesta tela.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza a tela completa da Etapa 2: Pertinência Institucional.
 */
export function renderPertinenciaScreen(): string {
  const pert = pertinenciaAtiva;
  const res = ultimoResultadoValidacaoPertinencia || validarPertinencia(pert);

  return `
    <div class="stage-header">
      <h2 class="stage-title">2. Pertinência Institucional</h2>
      <p class="stage-description">
        Filtro prévio obrigatório (<strong>RN02</strong>). A simples legalidade procedimental ou existência de saldo orçamentário não comprovam, isoladamente, a pertinência do gasto público. A avaliação deve ser fundamentada e validada pelo assessor.
      </p>
    </div>

    <!-- Contexto do Processo em Análise -->
    ${renderContextoProcessoAtivo()}

    <!-- Painel Didático de Carga Rápida de Cenários Fictícios de Pertinência -->
    <div class="scenario-selector-box">
      <div class="scenario-selector-header">
        <div>
          <strong class="scenario-selector-title">Carga Rápida de Cenários Didáticos de Pertinência</strong>
          <p class="scenario-selector-desc">Teste como o sistema calcula sugestões e como a validação humana opera sobre casos regulares, duvidosos ou desconformes:</p>
        </div>
      </div>
      <div class="scenario-selector-controls">
        <select id="select-cenario-pertinencia" class="form-select" aria-label="Selecione um cenário didático de pertinência">
          <option value="cenario-01" ${cenarioPertinenciaSelecionadoId === 'cenario-01' ? 'selected' : ''}>
            Cenário 1 — Pertinência Regular (Todos os critérios Sim • PERTINENTE)
          </option>
          <option value="cenario-02" ${cenarioPertinenciaSelecionadoId === 'cenario-02' ? 'selected' : ''}>
            Cenário 2 — Aditivo de Manutenção (Continuidade do serviço • PERTINENTE)
          </option>
          <option value="cenario-03" ${cenarioPertinenciaSelecionadoId === 'cenario-03' ? 'selected' : ''}>
            Cenário 3 — Limpeza e Asseio (Apoio operacional essencial • PERTINENTE)
          </option>
          <option value="cenario-04" ${cenarioPertinenciaSelecionadoId === 'cenario-04' ? 'selected' : ''}>
            Cenário 4 — Adesão a Ata / Carona (Falta vínculo ao planejamento • NÃO DEMONSTRADA)
          </option>
          <option value="cenario-05" ${cenarioPertinenciaSelecionadoId === 'cenario-05' ? 'selected' : ''}>
            Cenário 5 — Emergencial Inconsistente (Sem benefício público • NÃO PERTINENTE)
          </option>
          <option value="personalizado" ${cenarioPertinenciaSelecionadoId === 'personalizado' ? 'selected' : ''}>
            [Personalizado] Limpar campos para avaliação manual
          </option>
        </select>
        <button type="button" id="btn-carregar-cenario-pert" class="btn btn-secondary">Carregar Cenário</button>
      </div>
    </div>

    <!-- Alerta Global de Pendências / Erros (RN13) -->
    <div id="alerta-pertinencia-global" class="validation-summary-box ${res.valido ? 'hidden' : ''}" role="alert" aria-live="polite">
      <div class="validation-summary-header">
        <span class="validation-summary-icon">⚠️</span>
        <strong>Pendências de preenchimento na etapa de pertinência (RN02 / RN13):</strong>
      </div>
      <ul class="validation-summary-list" id="lista-erros-pertinencia">
        ${Object.entries(res.erros).map(([campo, msg]) => `<li><a href="#campo-pert-${campo}" class="error-link">${msg}</a></li>`).join('')}
      </ul>
    </div>

    <!-- Formulário Interativo de Pertinência -->
    <form id="form-pertinencia" class="form-identificacao" novalidate>
      
      <!-- Seção 1: Critérios de Avaliação dos 5 Pilares -->
      <fieldset class="form-section">
        <legend class="form-section-legend">1. Critérios de Avaliação da Pertinência Institucional</legend>
        <p class="form-section-intro">Avalie os cinco eixos fundamentais que justificam o interesse público e a conveniência da despesa:</p>
        
        <div class="criterios-grid" id="criterios-container">
          ${renderItemCriterio(
            'competenciaNecessidade',
            1,
            'Competência e Necessidade Institucional',
            'O objeto se insere formalmente nas competências da SESP-MT e atende a uma necessidade administrativa real e justificada?',
            pert.respostas.competenciaNecessidade
          )}

          ${renderItemCriterio(
            'vinculoPlanejamento',
            2,
            'Vínculo ao Planejamento Estratégico',
            'A contratação está formalmente alinhada ao Plano Estratégico, Plano de Contratações Anual (PCA) ou metas setoriais?',
            pert.respostas.vinculoPlanejamento
          )}

          ${renderItemCriterio(
            'beneficioInteressePublico',
            3,
            'Benefício Concreto ao Interesse Público',
            'Os resultados e entregas esperados beneficiam diretamente a prestação de serviços à segurança pública e à sociedade?',
            pert.respostas.beneficioInteressePublico
          )}

          ${renderItemCriterio(
            'custoProporcionalidade',
            4,
            'Proporcionalidade e Razoabilidade dos Custos',
            'O quantitativo demandado e o investimento financeiro estimado guardam justa proporção com a necessidade identificada?',
            pert.respostas.custoProporcionalidade
          )}

          ${renderItemCriterio(
            'economicidade',
            5,
            'Economicidade e Vantajosidade da Solução',
            'Há demonstração técnica de que a solução adotada é a mais eficiente e econômica entre as alternativas possíveis?',
            pert.respostas.economicidade
          )}
        </div>
      </fieldset>

      <!-- Seção 2: Evidências, Justificativa e Providência (RN02) -->
      <fieldset class="form-section highlight-section">
        <legend class="form-section-legend">2. Fundamentação Técnica e Evidências dos Autos (RN02)</legend>
        
        <div class="form-group ${res.erros.evidencias ? 'has-error' : ''}">
          <label for="campo-pert-evidencias" class="form-label">
            Evidências Documentais dos Autos <span class="required-indicator">*</span>
          </label>
          <textarea 
            id="campo-pert-evidencias" 
            name="evidencias" 
            class="form-textarea" 
            rows="3" 
            placeholder="Ex.: Documento de Formalização da Demanda (DFD), ETP nº 04/2026 (fls. 12/28), Nota Técnica nº 02/2026..."
            required
            aria-describedby="err-pert-evidencias hint-pert-evidencias"
          >${pert.evidencias || ''}</textarea>
          <div class="form-hint" id="hint-pert-evidencias">Indique com precisão as peças processuais e relatórios que sustentam a análise fática (RN02).</div>
          <span id="err-pert-evidencias" class="field-error-text">${res.erros.evidencias || ''}</span>
        </div>

        <div class="form-group ${res.erros.justificativa ? 'has-error' : ''}">
          <label for="campo-pert-justificativa" class="form-label">
            Justificativa Técnica do Assessor <span class="required-indicator">*</span>
          </label>
          <textarea 
            id="campo-pert-justificativa" 
            name="justificativa" 
            class="form-textarea" 
            rows="3" 
            placeholder="Registre a motivação detalhada e conclusiva do assessor sobre a oportunidade e pertinência pública..."
            required
            aria-describedby="err-pert-justificativa hint-pert-justificativa"
          >${pert.justificativa || ''}</textarea>
          <div class="form-hint" id="hint-pert-justificativa">A justificativa do assessor expressa a convicção técnica motivada exigida pela governança pública.</div>
          <span id="err-pert-justificativa" class="field-error-text">${res.erros.justificativa || ''}</span>
        </div>

        <div class="form-group ${res.erros.providencia ? 'has-error' : ''}">
          <label for="campo-pert-providencia" class="form-label">
            Providência Recomendada <span class="required-indicator">*</span>
          </label>
          <input 
            type="text" 
            id="campo-pert-providencia" 
            name="providencia" 
            class="form-input" 
            value="${pert.providencia || ''}" 
            placeholder="Ex.: Prosseguir com a verificação de conformidade jurídica / Notificar área demandante para saneamento..."
            required
            aria-describedby="err-pert-providencia"
          />
          <span id="err-pert-providencia" class="field-error-text">${res.erros.providencia || ''}</span>
        </div>
      </fieldset>

      <!-- Seção 3: Conclusão Técnica e Validação Humana Soberana (RN02 / RN07) -->
      <fieldset class="form-section">
        <legend class="form-section-legend">3. Conclusão da Pertinência e Validação Humana (RN02)</legend>
        ${renderPainelConclusao(pert)}
      </fieldset>

      <!-- Barra de Ações do Formulário -->
      <div class="form-actions-bar">
        <button type="button" id="btn-revalidar-pert" class="btn btn-secondary" title="Revalida as regras de preenchimento">
          🔍 Validar Critérios
        </button>
        <button type="button" id="btn-voltar-identificacao" class="btn btn-secondary">
          ← Voltar à Identificação
        </button>
        <button type="submit" id="btn-avancar-conformidade" class="btn btn-primary">
          Avançar para Conformidade →
        </button>
      </div>

    </form>
  `;
}

/**
 * Extrai os dados do formulário de pertinência diretamente do DOM.
 */
export function extrairDadosDoFormularioPertinencia(): Pertinencia {
  const getRadioVal = (id: string): boolean | null => {
    const checked = document.querySelector(`input[name="criterio-${id}"]:checked`) as HTMLInputElement | null;
    if (!checked) return null;
    if (checked.value === 'sim') return true;
    if (checked.value === 'nao') return false;
    return null;
  };

  const respostas: Pertinencia['respostas'] = {
    competenciaNecessidade: getRadioVal('competenciaNecessidade'),
    vinculoPlanejamento: getRadioVal('vinculoPlanejamento'),
    beneficioInteressePublico: getRadioVal('beneficioInteressePublico'),
    custoProporcionalidade: getRadioVal('custoProporcionalidade'),
    economicidade: getRadioVal('economicidade')
  };

  const getVal = (id: string): string => {
    const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    return el?.value.trim() || '';
  };

  const conclusaoStr = getVal('campo-conclusao-pertinencia') as ConclusaoPertinencia | '';
  const conclusao = conclusaoStr ? conclusaoStr : null;

  return {
    respostas,
    evidencias: getVal('campo-pert-evidencias'),
    justificativa: getVal('campo-pert-justificativa'),
    providencia: getVal('campo-pert-providencia'),
    conclusao
  };
}

/**
 * Sincroniza o estado em memória da Pertinência com os valores presentes no formulário do DOM.
 */
export function sincronizarPertinenciaDoFormulario(): Pertinencia {
  const dados = extrairDadosDoFormularioPertinencia();
  pertinenciaAtiva = dados;
  return dados;
}

/**
 * Atualiza o painel de sugestão e aviso de divergência no DOM.
 */
function atualizarPainelSugestaoAoVivo(dados: Pertinencia): void {
  const sugestao = sugerirConclusaoPertinencia(dados.respostas);
  const dispSugestao = document.getElementById('disp-sugestao-texto');
  if (dispSugestao) {
    dispSugestao.innerHTML = `<strong>${formatarConclusaoPertinencia(sugestao)}</strong>`;
  }

  const spanSugestao = document.getElementById('span-sugestao-sistema');
  if (spanSugestao) {
    spanSugestao.textContent = sugestao;
  }

  const spanHumana = document.getElementById('span-conclusao-humana');
  if (spanHumana) {
    spanHumana.textContent = dados.conclusao || '(Ainda não selecionada)';
  }

  const divergenciaBox = document.getElementById('divergencia-alerta');
  if (divergenciaBox) {
    const haDivergencia = Boolean(dados.conclusao && dados.conclusao !== sugestao);
    if (haDivergencia) {
      divergenciaBox.classList.remove('hidden');
    } else {
      divergenciaBox.classList.add('hidden');
    }
  }
}

/**
 * Renderiza as mensagens de erro nos campos correspondentes.
 */
function renderizarErrosNoFormularioPertinencia(resultado: ResultadoValidacaoPertinencia): void {
  const alertaGlobal = document.getElementById('alerta-pertinencia-global');
  const listaErros = document.getElementById('lista-erros-pertinencia');

  if (alertaGlobal && listaErros) {
    if (resultado.valido) {
      alertaGlobal.classList.add('hidden');
      listaErros.innerHTML = '';
    } else {
      alertaGlobal.classList.remove('hidden');
      listaErros.innerHTML = Object.entries(resultado.erros)
        .map(([campo, msg]) => `<li><a href="#campo-pert-${campo}" class="error-link">${msg}</a></li>`)
        .join('');
    }
  }

  const camposTexto = ['evidencias', 'justificativa', 'providencia'];
  camposTexto.forEach((campo) => {
    const input = document.getElementById(`campo-pert-${campo}`);
    const erroSpan = document.getElementById(`err-pert-${campo}`);
    const parent = input?.closest('.form-group');

    const msgErro = resultado.erros[campo];
    if (msgErro) {
      parent?.classList.add('has-error');
      if (erroSpan) erroSpan.textContent = msgErro;
    } else {
      parent?.classList.remove('has-error');
      if (erroSpan) erroSpan.textContent = '';
    }
  });

  // Campo conclusão
  const selectConclusao = document.getElementById('campo-conclusao-pertinencia');
  const parentConclusao = selectConclusao?.closest('.validacao-humana-box');
  if (resultado.erros.conclusao) {
    parentConclusao?.classList.add('has-error');
  } else {
    parentConclusao?.classList.remove('has-error');
  }
}

/**
 * Inicializa ouvintes de eventos e interações do formulário de Pertinência.
 */
export function initPertinenciaEvents(
  onNavegarConformidade: () => void,
  onVoltarIdentificacao: () => void
): void {
  const form = document.getElementById('form-pertinencia') as HTMLFormElement | null;
  if (!form) return;

  // Sincronização em tempo real de campos de texto ao digitar
  form.addEventListener('input', () => {
    const dados = extrairDadosDoFormularioPertinencia();
    pertinenciaAtiva = dados;
  });

  // Ouvinte de rádio dos 5 critérios
  const radios = form.querySelectorAll<HTMLInputElement>('.criterio-radio');
  radios.forEach((radio) => {
    radio.addEventListener('change', () => {
      // Atualiza visual dos rótulos selecionados
      const name = radio.name;
      const groupRadios = form.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`);
      groupRadios.forEach((r) => {
        const lbl = r.closest('.criterio-option-label');
        if (r.checked) {
          lbl?.classList.add('is-selected');
          lbl?.classList.remove('is-sim', 'is-nao', 'is-avaliar');
          if (r.value === 'sim') lbl?.classList.add('is-sim');
          if (r.value === 'nao') lbl?.classList.add('is-nao');
          if (r.value === 'a_avaliar') lbl?.classList.add('is-avaliar');
        } else {
          lbl?.classList.remove('is-selected', 'is-sim', 'is-nao', 'is-avaliar');
        }
      });

      const dados = extrairDadosDoFormularioPertinencia();
      pertinenciaAtiva = dados;
      atualizarPainelSugestaoAoVivo(dados);
    });
  });

  // Ouvinte para a mudança na conclusão validada pelo assessor
  const selectConclusao = document.getElementById('campo-conclusao-pertinencia') as HTMLSelectElement | null;
  selectConclusao?.addEventListener('change', () => {
    const dados = extrairDadosDoFormularioPertinencia();
    pertinenciaAtiva = dados;
    atualizarPainelSugestaoAoVivo(dados);
  });

  // Carga de Cenários Didáticos
  const selectCenario = document.getElementById('select-cenario-pertinencia') as HTMLSelectElement | null;
  const btnCarregar = document.getElementById('btn-carregar-cenario-pert');

  const aplicarCenario = () => {
    const cenarioKey = selectCenario?.value || 'cenario-01';
    cenarioPertinenciaSelecionadoId = cenarioKey;

    if (cenarioKey === 'personalizado') {
      pertinenciaAtiva = {
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
    } else if (CENARIOS_PERTINENCIA_DEMO[cenarioKey]) {
      pertinenciaAtiva = { ...CENARIOS_PERTINENCIA_DEMO[cenarioKey] };
    }

    ultimoResultadoValidacaoPertinencia = validarPertinencia(pertinenciaAtiva);

    // Popula o DOM
    const ids: (keyof Pertinencia['respostas'])[] = [
      'competenciaNecessidade',
      'vinculoPlanejamento',
      'beneficioInteressePublico',
      'custoProporcionalidade',
      'economicidade'
    ];

    ids.forEach((id) => {
      const val = pertinenciaAtiva.respostas[id];
      const valStr = val === true ? 'sim' : val === false ? 'nao' : 'a_avaliar';
      const r = form.querySelector<HTMLInputElement>(`input[name="criterio-${id}"][value="${valStr}"]`);
      if (r) {
        r.checked = true;
      }
      // Atualiza classes dos rótulos
      const allR = form.querySelectorAll<HTMLInputElement>(`input[name="criterio-${id}"]`);
      allR.forEach((opt) => {
        const lbl = opt.closest('.criterio-option-label');
        lbl?.classList.remove('is-selected', 'is-sim', 'is-nao', 'is-avaliar');
        if (opt.checked) {
          lbl?.classList.add('is-selected');
          if (opt.value === 'sim') lbl?.classList.add('is-sim');
          if (opt.value === 'nao') lbl?.classList.add('is-nao');
          if (opt.value === 'a_avaliar') lbl?.classList.add('is-avaliar');
        }
      });
    });

    const setVal = (id: string, v: string) => {
      const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
      if (el) el.value = v;
    };

    setVal('campo-pert-evidencias', pertinenciaAtiva.evidencias);
    setVal('campo-pert-justificativa', pertinenciaAtiva.justificativa);
    setVal('campo-pert-providencia', pertinenciaAtiva.providencia);
    setVal('campo-conclusao-pertinencia', pertinenciaAtiva.conclusao || '');

    atualizarPainelSugestaoAoVivo(pertinenciaAtiva);
    renderizarErrosNoFormularioPertinencia(ultimoResultadoValidacaoPertinencia);
  };

  selectCenario?.addEventListener('change', aplicarCenario);
  btnCarregar?.addEventListener('click', aplicarCenario);

  // Botão "Validar Critérios"
  const btnRevalidar = document.getElementById('btn-revalidar-pert');
  btnRevalidar?.addEventListener('click', () => {
    const dados = extrairDadosDoFormularioPertinencia();
    pertinenciaAtiva = dados;
    const res = validarPertinencia(dados);
    ultimoResultadoValidacaoPertinencia = res;
    renderizarErrosNoFormularioPertinencia(res);

    if (res.valido) {
      alert('✅ Todos os critérios e campos da Pertinência Institucional foram validados com sucesso!');
    }
  });

  // Botão "Voltar à Identificação"
  const btnVoltar = document.getElementById('btn-voltar-identificacao');
  btnVoltar?.addEventListener('click', () => {
    const dados = extrairDadosDoFormularioPertinencia();
    pertinenciaAtiva = dados;
    onVoltarIdentificacao();
  });

  // Submissão do Formulário e Avanço para a Etapa 3 (Conformidade)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const dados = extrairDadosDoFormularioPertinencia();
    pertinenciaAtiva = dados;
    const res = validarPertinencia(dados);
    ultimoResultadoValidacaoPertinencia = res;
    renderizarErrosNoFormularioPertinencia(res);

    if (!res.valido) {
      const primeiroErro = Object.keys(res.erros)[0];
      const el = document.getElementById(`campo-pert-${primeiroErro}`) || document.getElementById('campo-conclusao-pertinencia');
      el?.focus();
      const alerta = document.getElementById('alerta-pertinencia-global');
      alerta?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    onNavegarConformidade();
  });
}
