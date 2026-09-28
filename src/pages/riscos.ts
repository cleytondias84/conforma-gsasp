/**
 * CONFORMA GSASP — Tela da Etapa 5: Avaliação de Riscos (Sprint 3 — S3.4)
 * 
 * Base: docs/contexto.md (RN11, RN12, RN13), docs/sprint.md (S3.4) e docs/regras-funcionais.md
 * 
 * Princípios de Governança (RN12):
 * 1. Avaliação de riscos explicável e conduzida pelo juízo técnico do assessor.
 * 2. As 4 dimensões (Jurídica, Financeira, Operacional, Controle) e 4 níveis (Baixo, Moderado, Alto, Crítico).
 * 3. Não há pesos arbitrários nem fórmulas automáticas sem aprovação metodológica prévia.
 * 4. A ausência de achados NÃO presume automaticamente risco baixo.
 * 5. Todo nível atribuído exige justificativa fática e permite vínculo com achados validados.
 * 6. Critérios demonstrativos de apoio ao raciocínio humano.
 * 7. Perfis de acesso: Leitor e Aprovador em modo somente consulta (bloqueio de edição).
 */

import type {
  Risco,
  DimensaoRisco,
  NivelRisco
} from '../domain/tipos.ts';

import {
  DIMENSOES_RISCO,
  NIVEIS_RISCO,
  METADADOS_DIMENSOES,
  METADADOS_NIVEIS,
  criarRiscosIniciais,
  definirNivelRisco,
  definirJustificativaRisco,
  alternarVinculoAchado,
  identificarVinculosEmRevisao,
  identificarVinculosOrfaos,
  desvincularAchado,
  validarRiscos,
  calcularResumoRiscos,
  CENARIOS_EXEMPLO_RISCOS
} from '../domain/riscos.ts';

import { getProcessoAtivo } from './identificacao.ts';
import { getAchadosAtivos } from './achados.ts';
import { formatarMoeda, formatarDataBR } from '../domain/validacao.ts';
import { podeEditar } from '../auth/papeis.ts';

// Estado em memória dos riscos e pendências de validação
let riscosAtivos: Risco[] = criarRiscosIniciais();
let pendenciasValidacao: string[] = [];

// ==========================================
// 1. GETTERS E SETTERS DE ESTADO
// ==========================================

export function getRiscosAtivos(): Risco[] {
  return riscosAtivos;
}

export function setRiscosAtivos(novosRiscos: Risco[]): void {
  if (!novosRiscos || novosRiscos.length === 0) {
    riscosAtivos = criarRiscosIniciais();
    return;
  }

  // Assegura que todas as 4 dimensões estejam presentes
  const mapa = new Map<DimensaoRisco, Risco>();
  for (const r of novosRiscos) {
    mapa.set(r.dimensao, r);
  }

  riscosAtivos = DIMENSOES_RISCO.map((dimensao) => {
    const existente = mapa.get(dimensao);
    if (existente) {
      return {
        dimensao,
        nivel: existente.nivel ?? null,
        justificativa: existente.justificativa || '',
        achadosRelacionados: Array.isArray(existente.achadosRelacionados)
          ? [...existente.achadosRelacionados]
          : []
      };
    }
    return {
      dimensao,
      nivel: null,
      justificativa: '',
      achadosRelacionados: []
    };
  });
}

/**
 * Lê os campos abertos no DOM para garantir que a digitação seja persistida imediatamente.
 */
export function sincronizarRiscosDoFormulario(): void {
  if (typeof document === 'undefined') return;

  for (const dimensao of DIMENSOES_RISCO) {
    const txtArea = document.getElementById(`justificativa-risco-${dimensao}`) as HTMLTextAreaElement | null;
    if (txtArea) {
      riscosAtivos = definirJustificativaRisco(riscosAtivos, dimensao, txtArea.value);
    }
  }
}

// ==========================================
// 2. RENDERIZAÇÃO DA INTERFACE
// ==========================================

/**
 * Renderiza o cartão de contexto do processo e síntese dos achados da Etapa 4.
 */
function renderContextoProcessoEAchados(): string {
  const proc = getProcessoAtivo();
  const todosAchados = getAchadosAtivos();
  const achadosValidados = todosAchados.filter((a) => a.estadoValidacao === 'VALIDADO');
  const achadosPendentes = todosAchados.filter((a) => a.estadoValidacao === 'SUGESTAO_SISTEMA');

  // Contagem por gravidade dos achados validados
  const impeditivos = achadosValidados.filter((a) => a.classificacao === 'IMPEDITIVO').length;
  const relevantes = achadosValidados.filter((a) => a.classificacao === 'RELEVANTE').length;
  const formais = achadosValidados.filter((a) => a.classificacao === 'FORMAL').length;
  const melhorias = achadosValidados.filter((a) => a.classificacao === 'MELHORIA').length;

  return `
    <div class="card-processo-contexto">
      <div class="contexto-grid">
        <div class="contexto-item">
          <span class="contexto-label">Processo:</span>
          <span class="contexto-valor">${proc.numero || '(Não informado)'}</span>
        </div>
        <div class="contexto-item">
          <span class="contexto-label">Instrumento:</span>
          <span class="contexto-valor">${proc.instrumento || '(Não informado)'}</span>
        </div>
        <div class="contexto-item">
          <span class="contexto-label">Contratado / Parceiro:</span>
          <span class="contexto-valor">${proc.contratado || (proc.contratadoNaoAplicavel ? 'Não aplicável' : '(Não informado)')}</span>
        </div>
        <div class="contexto-item">
          <span class="contexto-label">Valor:</span>
          <span class="contexto-valor">${proc.valorNaoAplicavel ? 'Não aplicável' : formatarMoeda(proc.valor)}</span>
        </div>
        <div class="contexto-item">
          <span class="contexto-label">Vigência:</span>
          <span class="contexto-valor">
            ${proc.vigenciaNaoAplicavel
              ? 'Não se aplica'
              : `${formatarDataBR(proc.vigenciaInicio)} a ${formatarDataBR(proc.vigenciaFim)}`}
          </span>
        </div>
        <div class="contexto-item full-width">
          <span class="contexto-label">Objeto:</span>
          <span class="contexto-valor">${proc.objeto || '(Não informado)'}</span>
        </div>
      </div>

      <div class="contexto-achados-resumo">
        <span class="contexto-achados-titulo">🔍 Achados Validados da Etapa Anterior:</span>
        <div class="contexto-achados-pills">
          <span class="badge ${achadosValidados.length > 0 ? 'badge-info' : 'badge-neutral'}">
            Total Validados: <strong>${achadosValidados.length}</strong>
          </span>
          ${impeditivos > 0 ? `<span class="badge badge-danger">Impeditivos: ${impeditivos}</span>` : ''}
          ${relevantes > 0 ? `<span class="badge badge-warning">Relevantes: ${relevantes}</span>` : ''}
          ${formais > 0 ? `<span class="badge badge-info">Formais: ${formais}</span>` : ''}
          ${melhorias > 0 ? `<span class="badge badge-neutral">Melhorias: ${melhorias}</span>` : ''}
        </div>
      </div>

      ${achadosPendentes.length > 0 ? `
        <div class="contexto-alerta-pendentes" role="alert">
          <span class="alerta-icone">⚠️</span>
          <span>
            Existem <strong>${achadosPendentes.length} sugestão(ões) de achado</strong> na Etapa 4 ainda pendente(s) de validação humana. Recomenda-se validar ou rejeitar os achados antes de consolidar os riscos.
          </span>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Renderiza o painel de KPIs de risco.
 */
function renderPainelKPIsRiscos(): string {
  const resumo = calcularResumoRiscos(riscosAtivos);

  return `
    <div class="riscos-kpis">
      <div class="kpi-card ${resumo.critico > 0 ? 'kpi-critico' : ''}">
        <span class="kpi-numero">${resumo.critico}</span>
        <span class="kpi-rotulo">Crítico</span>
      </div>
      <div class="kpi-card ${resumo.alto > 0 ? 'kpi-alto' : ''}">
        <span class="kpi-numero">${resumo.alto}</span>
        <span class="kpi-rotulo">Alto</span>
      </div>
      <div class="kpi-card ${resumo.moderado > 0 ? 'kpi-moderado' : ''}">
        <span class="kpi-numero">${resumo.moderado}</span>
        <span class="kpi-rotulo">Moderado</span>
      </div>
      <div class="kpi-card ${resumo.baixo > 0 ? 'kpi-baixo' : ''}">
        <span class="kpi-numero">${resumo.baixo}</span>
        <span class="kpi-rotulo">Baixo</span>
      </div>
      <div class="kpi-card ${resumo.pendentes > 0 ? 'kpi-pendente' : 'kpi-completo'}">
        <span class="kpi-numero">${resumo.pendentes}</span>
        <span class="kpi-rotulo">${resumo.pendentes === 0 ? 'Todas Avaliadas' : 'Pendentes'}</span>
      </div>
    </div>
  `;
}

/**
 * Renderiza o card individual de uma dimensão de risco.
 */
function renderCardDimensaoRisco(dimensao: DimensaoRisco): string {
  const meta = METADADOS_DIMENSOES[dimensao];
  const item = riscosAtivos.find((r) => r.dimensao === dimensao) || {
    dimensao,
    nivel: null,
    justificativa: '',
    achadosRelacionados: []
  };

  const edicaoHabilitada = podeEditar();
  const todosAchados = getAchadosAtivos();
  const achadosValidados = todosAchados.filter((a) => a.estadoValidacao === 'VALIDADO');
  const achadosEmRevisao = identificarVinculosEmRevisao(item, todosAchados);
  const achadosOrfaos = identificarVinculosOrfaos(item, todosAchados);

  const metaNivel = item.nivel ? METADADOS_NIVEIS[item.nivel] : null;
  const tagClasse = metaNivel ? metaNivel.badgeClass : 'tag-risco-pendente';
  const tagRotulo = metaNivel ? metaNivel.rotulo : 'Pendente de Avaliação';

  return `
    <div class="card risco-dimensao-card ${item.nivel ? `risco-card-${item.nivel}` : 'risco-card-pendente'}" id="card-risco-${dimensao}">
      <div class="risco-card-header">
        <div class="risco-card-title-group">
          <span class="risco-card-icone">${meta.icone}</span>
          <div>
            <h3 class="risco-card-title">Dimensão ${meta.nome}</h3>
            <p class="risco-card-desc">${meta.descricao}</p>
          </div>
        </div>
        <div class="risco-card-badge-container">
          <span class="badge ${tagClasse}" id="badge-status-${dimensao}">
            ${tagRotulo}
          </span>
        </div>
      </div>

      <!-- Perguntas orientadoras demonstrativas -->
      <details class="perguntas-orientadoras-box">
        <summary class="perguntas-orientadoras-toggle">
          💡 Perguntas orientadoras para o assessor (Demonstrativo)
        </summary>
        <ul class="perguntas-orientadoras-lista">
          ${meta.perguntasOrientadoras.map((p) => `<li>${p}</li>`).join('')}
        </ul>
      </details>

      <!-- Seletor de Nível de Risco -->
      <div class="risco-seletor-nivel-container">
        <span class="risco-campo-label">
          <strong>Nível de Risco Atribuído pelo Assessor:</strong>
          <span class="campo-obrigatorio">*</span>
        </span>
        <div class="risco-niveis-opcoes" role="radiogroup" aria-label="Nível de risco da dimensão ${meta.nome}">
          ${NIVEIS_RISCO.map((nivel) => {
            const infoNivel = METADADOS_NIVEIS[nivel];
            const selecionado = item.nivel === nivel;
            return `
              <button
                type="button"
                class="btn-nivel-risco ${infoNivel.badgeClass} ${selecionado ? 'ativo' : ''}"
                data-dimensao="${dimensao}"
                data-nivel="${nivel}"
                ${!edicaoHabilitada ? 'disabled' : ''}
                title="${infoNivel.descricao}"
              >
                ${selecionado ? '✓ ' : ''}${infoNivel.rotulo}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Vínculo com Achados Validados -->
      <div class="risco-vinculo-achados-container">
        <span class="risco-campo-label">
          <strong>Vínculo a Achados Validados da Análise:</strong>
          <span class="campo-opcional">(Opcional — selecione os achados que fundamentam esta dimensão)</span>
        </span>

        ${achadosEmRevisao.map((ach) => `
          <div class="alerta-vinculo-revisao" role="alert">
            <span class="alerta-icone">⚠️</span>
            <div class="alerta-conteudo">
              <strong>Aviso de Governança (RN10) — Achado vinculado retornou para revisão:</strong>
              <p>
                O achado <strong>"${ach.titulo}"</strong> (<code>${ach.id}</code>) retornou para revisão na Etapa 4 e <strong>não é mais considerado uma referência validada</strong>.
              </p>
              <p class="alerta-subtexto">
                O nível (<strong>${tagRotulo}</strong>) e a justificativa foram preservados sem reclassificação automática. A avaliação desta dimensão deve ser revista pelo assessor.
              </p>
              ${edicaoHabilitada ? `
                <button
                  type="button"
                  class="btn btn-sm btn-secondary btn-desvincular-achado"
                  data-dimensao="${dimensao}"
                  data-achado-id="${ach.id}"
                  title="Desvincular este achado da dimensão"
                >
                  Desvincular achado em revisão
                </button>
              ` : ''}
            </div>
          </div>
        `).join('')}

        ${achadosOrfaos.map((orfaoId) => `
          <div class="alerta-vinculo-revisao" role="alert">
            <span class="alerta-icone">⚠️</span>
            <div class="alerta-conteudo">
              <strong>Aviso de Governança (RN10) — Achado vinculado excluído:</strong>
              <p>
                O achado anteriormente vinculado (<code>${orfaoId}</code>) foi excluído na Etapa 4 e não consta mais dos autos.
              </p>
              <p class="alerta-subtexto">
                O nível (<strong>${tagRotulo}</strong>) e a justificativa foram preservados sem reclassificação automática. A avaliação desta dimensão deve ser revista pelo assessor.
              </p>
              ${edicaoHabilitada ? `
                <button
                  type="button"
                  class="btn btn-sm btn-secondary btn-desvincular-achado"
                  data-dimensao="${dimensao}"
                  data-achado-id="${orfaoId}"
                  title="Remover vínculo órfão"
                >
                  Remover vínculo órfão
                </button>
              ` : ''}
            </div>
          </div>
        `).join('')}

        ${achadosValidados.length > 0 ? `
          <div class="risco-achados-checklist">
            ${achadosValidados.map((ach) => {
              const vinculado = item.achadosRelacionados.includes(ach.id);
              const tagAchado = ach.classificacao
                ? `tag-${ach.classificacao.toLowerCase()}`
                : 'tag-pendente';
              return `
                <label class="risco-achado-item ${vinculado ? 'vinculado' : ''}">
                  <input
                    type="checkbox"
                    class="checkbox-vinculo-achado"
                    data-dimensao="${dimensao}"
                    data-achado-id="${ach.id}"
                    ${vinculado ? 'checked' : ''}
                    ${!edicaoHabilitada ? 'disabled' : ''}
                  />
                  <span class="badge ${tagAchado} badge-sm">${ach.classificacao || 'S/ Class.'}</span>
                  <span class="risco-achado-titulo">${ach.titulo}</span>
                  <span class="risco-achado-id">(${ach.id})</span>
                </label>
              `;
            }).join('')}
          </div>
        ` : `
          <p class="risco-sem-achados-aviso">
            ℹ️ Nenhum achado validado disponível no momento para vinculação nesta análise. A ausência de achados não impede a análise fundamentada do risco.
          </p>
        `}
      </div>

      <!-- Justificativa Técnica Obrigatória -->
      <div class="risco-justificativa-container">
        <label for="justificativa-risco-${dimensao}" class="risco-campo-label">
          <strong>Justificativa da Avaliação Técnica:</strong>
          <span class="campo-obrigatorio">*</span>
        </label>
        <textarea
          id="justificativa-risco-${dimensao}"
          class="form-textarea risco-textarea"
          data-dimensao="${dimensao}"
          rows="3"
          placeholder="Fundamente o nível de risco atribuído a esta dimensão com base nos elementos concretos dos autos..."
          ${!edicaoHabilitada ? 'readonly' : ''}
        >${item.justificativa}</textarea>
        <div class="risco-textarea-footer">
          <span class="risco-contador-chars" id="contador-chars-${dimensao}">
            ${item.justificativa.length} caracteres (mínimo 5)
          </span>
          <span class="risco-aviso-substancial">
            O preenchimento de caracteres é requisito formal e não atesta a suficiência substancial da justificativa.
          </span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza o quadro de pendências de validação.
 */
function renderQuadroPendencias(): string {
  if (pendenciasValidacao.length === 0) return '';

  return `
    <div class="alert-box alert-danger" id="quadro-pendencias-riscos" role="alert">
      <strong>⚠️ Pendências de Avaliação de Riscos (RN12/RN13):</strong>
      <p>Todas as 4 dimensões de risco exigem seleção expressa de nível e justificativa técnica fundamentada para prosseguir:</p>
      <ul class="pendencias-lista">
        ${pendenciasValidacao.map((p) => `<li>${p}</li>`).join('')}
      </ul>
    </div>
  `;
}

/**
 * Renderiza a tela completa da Etapa 5: Avaliação de Riscos.
 */
export function renderRiscosScreen(): string {
  const edicaoHabilitada = podeEditar();

  return `
    <div class="stage-header">
      <h2 class="stage-title">5. Avaliação de Riscos</h2>
      <p class="stage-description">
        Mapeamento explicável dos riscos do processo nas dimensões jurídica, financeira, operacional e de controle, com fundamentação humana e vínculo formal aos achados validados (RN12).
      </p>
    </div>

    ${!edicaoHabilitada ? `
      <div class="readonly-banner" role="status">
        <span class="readonly-icon">🔒</span>
        <div>
          <strong>Modo de Consulta Ativo:</strong>
          <span>O perfil atual está em modo somente leitura. Os níveis, vínculos e justificativas de risco estão bloqueados para alteração.</span>
        </div>
      </div>
    ` : ''}

    ${renderContextoProcessoEAchados()}

    <!-- Banner de Governança e Metodologia (RN12) -->
    <div class="governance-card">
      <div class="governance-header">
        <span class="governance-icon">🛡️</span>
        <div>
          <h3 class="governance-title">Critérios Demonstrativos de Avaliação de Riscos (RN12)</h3>
          <p class="governance-subtitle">Diretrizes de Governança e Transparência do CONFORMA GSASP</p>
        </div>
      </div>
      <div class="governance-body">
        <p>
          Até a aprovação formal da metodologia institucional pela SESP-MT, a avaliação de riscos é <strong>estritamente orientada pelo juízo técnico do assessor</strong>. O sistema não aplica fórmulas ocultas, pesos arbitrários ou rebaixamento algorítmico de riscos.
        </p>
        <p>
          <strong>Salvaguarda Mandatória (RN11/RN12):</strong> A ausência de achados apontados nas etapas anteriores <em>não presume automaticamente risco baixo</em>. Cada dimensão deve ser analisada e fundamentada nos autos.
        </p>
      </div>
    </div>

    <!-- Painel de KPIs de Riscos -->
    ${renderPainelKPIsRiscos()}

    <!-- Seletor de Carga Rápida de Cenários Didáticos -->
    <div class="scenario-selector-container">
      <label for="select-cenario-riscos" class="scenario-label">
        <span class="scenario-icon">🧪</span> Carregar Exemplo de Avaliação de Riscos (Cenário Fictício):
      </label>
      <select id="select-cenario-riscos" class="scenario-select" ${!edicaoHabilitada ? 'disabled' : ''}>
        <option value="">-- Selecione um exemplo didático para testes rápidos --</option>
        <option value="regular">Cenário Regular — Riscos Baixos / Moderados</option>
        <option value="com_condicionante">Cenário com Condicionante — Risco Jurídico Alto</option>
        <option value="grave_inconsistencia">Cenário Grave — Riscos Críticos e Altos</option>
        <option value="limpar">Limpar / Redefinir Avaliação (Todos Pendentes)</option>
      </select>
    </div>

    <!-- Quadro de Pendências (quando aplicável) -->
    ${renderQuadroPendencias()}

    <!-- Cards das 4 Dimensões -->
    <div class="riscos-dimensoes-container">
      ${DIMENSOES_RISCO.map((dim) => renderCardDimensaoRisco(dim)).join('')}
    </div>

    <!-- Ações de Navegação -->
    <div class="stage-footer-nav">
      <button type="button" id="btn-voltar-achados" class="btn btn-secondary">
        &larr; Voltar aos Achados
      </button>
      <button type="button" id="btn-avancar-resultado" class="btn btn-primary">
        Avançar para Resultado &rarr;
      </button>
    </div>
  `;
}

// ==========================================
// 3. INICIALIZAÇÃO DE EVENTOS
// ==========================================

/**
 * Inicializa todos os ouvintes interativos da tela de Riscos.
 */
export function initRiscosEvents(
  onNavegarResultado: () => void,
  onVoltarAchados: () => void
): void {
  const edicaoHabilitada = podeEditar();

  // 1. Ouvintes de seleção de nível de risco
  if (edicaoHabilitada) {
    document.querySelectorAll('.btn-nivel-risco').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const dimensao = target.dataset.dimensao as DimensaoRisco;
        const nivel = target.dataset.nivel as NivelRisco;

        if (dimensao && nivel) {
          sincronizarRiscosDoFormulario();
          riscosAtivos = definirNivelRisco(riscosAtivos, dimensao, nivel);
          // Limpa pendências se houverem
          pendenciasValidacao = [];
          reRender();
        }
      });
    });
  }

  // 2. Ouvintes de vínculo com achados
  if (edicaoHabilitada) {
    document.querySelectorAll('.checkbox-vinculo-achado').forEach((chk) => {
      chk.addEventListener('change', (e) => {
        const target = e.currentTarget as HTMLInputElement;
        const dimensao = target.dataset.dimensao as DimensaoRisco;
        const achadoId = target.dataset.achadoId;

        if (dimensao && achadoId) {
          sincronizarRiscosDoFormulario();
          riscosAtivos = alternarVinculoAchado(riscosAtivos, dimensao, achadoId);
          reRender();
        }
      });
    });

    // Ouvinte para desvincular achados em revisão ou órfãos
    document.querySelectorAll('.btn-desvincular-achado').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const dimensao = target.dataset.dimensao as DimensaoRisco;
        const achadoId = target.dataset.achadoId;

        if (dimensao && achadoId) {
          sincronizarRiscosDoFormulario();
          riscosAtivos = desvincularAchado(riscosAtivos, dimensao, achadoId);
          reRender();
        }
      });
    });
  }

  // 3. Ouvintes de justificativa (digitação contínua)
  for (const dimensao of DIMENSOES_RISCO) {
    const txtArea = document.getElementById(`justificativa-risco-${dimensao}`) as HTMLTextAreaElement | null;
    const contador = document.getElementById(`contador-chars-${dimensao}`);

    if (txtArea && contador) {
      txtArea.addEventListener('input', () => {
        const val = txtArea.value;
        contador.textContent = `${val.length} caracteres (mínimo 5)`;
        riscosAtivos = definirJustificativaRisco(riscosAtivos, dimensao, val);
      });
    }
  }

  // 4. Ouvinte do seletor didático de cenários
  const selectCenario = document.getElementById('select-cenario-riscos') as HTMLSelectElement | null;
  selectCenario?.addEventListener('change', () => {
    const valor = selectCenario.value;
    if (!valor) return;

    if (valor === 'limpar') {
      riscosAtivos = criarRiscosIniciais();
      pendenciasValidacao = [];
      reRender();
      return;
    }

    const cenario = CENARIOS_EXEMPLO_RISCOS[valor];
    if (cenario) {
      // Vincula ao primeiro achado validado disponível caso exista
      const achadosValidados = getAchadosAtivos().filter((a) => a.estadoValidacao === 'VALIDADO');
      const primeiroAchadoId = achadosValidados.length > 0 ? achadosValidados[0].id : null;

      riscosAtivos = cenario.riscos.map((r) => ({
        ...r,
        achadosRelacionados: (r.dimensao === 'juridica' && primeiroAchadoId)
          ? [primeiroAchadoId]
          : []
      }));

      pendenciasValidacao = [];
      reRender();
    }
  });

  // 5. Navegação Voltar
  const btnVoltar = document.getElementById('btn-voltar-achados');
  btnVoltar?.addEventListener('click', () => {
    sincronizarRiscosDoFormulario();
    onVoltarAchados();
  });

  // 6. Navegação Avançar
  const btnAvancar = document.getElementById('btn-avancar-resultado');
  btnAvancar?.addEventListener('click', () => {
    sincronizarRiscosDoFormulario();

    // Se estiver em modo consulta (Leitor ou Aprovador), permite navegar livremente
    if (!podeEditar()) {
      onNavegarResultado();
      return;
    }

    // Valida os riscos
    const res = validarRiscos(riscosAtivos);
    if (!res.valido) {
      pendenciasValidacao = res.pendencias;
      reRender();
      // Rola até o quadro de pendências
      const quadro = document.getElementById('quadro-pendencias-riscos');
      quadro?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    pendenciasValidacao = [];
    onNavegarResultado();
  });

  function reRender() {
    const card = document.querySelector('.stage-card');
    if (card) {
      const navButtons = card.querySelector('.stage-actions')?.outerHTML || '';
      card.innerHTML = renderRiscosScreen() + navButtons;
      initRiscosEvents(onNavegarResultado, onVoltarAchados);
    }
  }
}
