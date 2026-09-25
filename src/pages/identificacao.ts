/**
 * CONFORMA GSASP — Tela da Etapa 1: Identificação do Instrumento
 * Implementação da Tarefa S2.1 (Sprint 2)
 * Base: docs/contexto.md (RN01, RN13) e docs/sprint.md
 */

import type { Processo } from '../domain/tipos';
import {
  validarProcesso,
  formatarMoeda,
  formatarDataBR,
  calcularDuracaoVigencia,
  type ResultadoValidacaoProcesso
} from '../domain/validacao';

// Cenários didáticos determinísticos com dados estritamente fictícios
export const CENARIOS_DEMO: Record<string, Processo> = {
  'cenario-01': {
    id: 'proc-ficticio-01',
    numero: 'SESP-PRO-2026/00001',
    instrumento: 'Contrato Administrativo nº 01/2026',
    contratado: 'Alpha Tecnologia e Infraestrutura Fictícia Ltda.',
    cnpj: '11.111.111/0001-11',
    objeto: 'Aquisição fictícia de estações de trabalho e equipamentos de rede para unidades de segurança pública.',
    tipoOrigem: 'Pregão Eletrônico nº 10/2026',
    valor: 350000.0,
    valorNaoAplicavel: false,
    vigenciaInicio: '2026-03-01',
    vigenciaFim: '2027-03-01',
    vigenciaNaoAplicavel: false,
    regimeJuridico: 'Lei nº 14.133/2021',
    contratadoNaoAplicavel: false
  },
  'cenario-02': {
    id: 'proc-ficticio-02',
    numero: 'SESP-PRO-2026/00002',
    instrumento: '1º Termo Aditivo ao Contrato nº 12/2025',
    contratado: 'Beta Serviços e Manutenção Predial Fictícia Ltda.',
    cnpj: '22.222.222/0001-22',
    objeto: 'Prorrogação da vigência por 12 meses do contrato de manutenção preventiva e corretiva predial continuada.',
    tipoOrigem: 'Termo Aditivo / Prorrogação de Serviço Contínuo',
    valor: null,
    valorNaoAplicavel: true,
    vigenciaInicio: '2026-04-01',
    vigenciaFim: '2027-04-01',
    vigenciaNaoAplicavel: false,
    regimeJuridico: 'Lei nº 14.133/2021',
    contratadoNaoAplicavel: false
  },
  'cenario-03': {
    id: 'proc-ficticio-03',
    numero: 'SESP-PRO-2026/00003',
    instrumento: 'Contrato Administrativo nº 03/2026',
    contratado: 'Gama Conservação e Limpeza Fictícia EIRELI',
    cnpj: '33.333.333/0001-33',
    objeto: 'Prestação fictícia de serviços contínuos de limpeza, asseio e conservação predial nas dependências da SESP.',
    tipoOrigem: 'Pregão Eletrônico nº 05/2026',
    valor: 520000.0,
    valorNaoAplicavel: false,
    vigenciaInicio: '2026-05-01',
    vigenciaFim: '2027-05-01',
    vigenciaNaoAplicavel: false,
    regimeJuridico: 'Lei nº 14.133/2021',
    contratadoNaoAplicavel: false
  },
  'cenario-04': {
    id: 'proc-ficticio-04',
    numero: 'SESP-PRO-2026/00004',
    instrumento: 'Termo de Adesão à Ata de Registro de Preços nº 08/2026',
    contratado: 'Delta Softwares e Soluções Fictícias S/A',
    cnpj: '44.444.444/0001-44',
    objeto: 'Adesão fictícia à ata de registro de preços para fornecimento de licenças de software de análise forense.',
    tipoOrigem: 'Adesão a Ata (Carona)',
    valor: 890000.0,
    valorNaoAplicavel: false,
    vigenciaInicio: '2026-06-01',
    vigenciaFim: '2027-06-01',
    vigenciaNaoAplicavel: false,
    regimeJuridico: 'Lei nº 14.133/2021',
    contratadoNaoAplicavel: false
  },
  'cenario-05': {
    id: 'proc-ficticio-05',
    numero: 'SESP-PRO-2026/00005',
    instrumento: 'Contrato Administrativo nº 99/2026',
    contratado: 'Omega Equipamentos e Sistemas Fictícios ME',
    cnpj: '55.555.555/0001-55',
    objeto: 'Locação fictícia emergencial de sistemas de monitoramento eletrônico.',
    tipoOrigem: 'Dispensa de Licitação Emergencial nº 02/2026',
    valor: 1250000.0,
    valorNaoAplicavel: false,
    vigenciaInicio: '2026-08-01',
    vigenciaFim: '2026-02-01', // Data invertida intencionalmente para teste da RN13
    vigenciaNaoAplicavel: false,
    regimeJuridico: 'Lei nº 14.133/2021',
    contratadoNaoAplicavel: false
  }
};

// Estado do processo ativo em memória na sessão
let processoAtivo: Processo = { ...CENARIOS_DEMO['cenario-01'] };
let ultimoResultadoValidacao: ResultadoValidacaoProcesso | null = null;
let cenarioSelecionadoId: string = 'cenario-01';

export function getProcessoAtivo(): Processo {
  return processoAtivo;
}

export function setProcessoAtivo(processo: Processo): void {
  processoAtivo = { ...processo };
}

/**
 * Renderiza o bloco de destaque imediato dos 4 elementos essenciais (RN01).
 */
export function renderQuatroElementosEssenciais(processo: Processo): string {
  const textoObjeto = processo.objeto?.trim() || '(Objeto pendente de preenchimento)';
  const textoOrigem = processo.tipoOrigem?.trim() || '(Tipo/Origem pendente)';
  
  let textoValor = '';
  if (processo.valorNaoAplicavel) {
    textoValor = 'Não se aplica / Sem valor financeiro';
  } else if (processo.valor !== null && processo.valor !== undefined && !isNaN(processo.valor)) {
    textoValor = formatarMoeda(processo.valor);
  } else {
    textoValor = '(Valor pendente de preenchimento)';
  }

  let textoVigencia = '';
  if (processo.vigenciaNaoAplicavel) {
    textoVigencia = 'Não se aplica / Prazo indeterminado';
  } else if (processo.vigenciaInicio && processo.vigenciaFim) {
    const duracao = calcularDuracaoVigencia(processo.vigenciaInicio, processo.vigenciaFim);
    textoVigencia = `${formatarDataBR(processo.vigenciaInicio)} a ${formatarDataBR(processo.vigenciaFim)} ${duracao ? `• ${duracao}` : ''}`;
  } else if (processo.vigenciaInicio || processo.vigenciaFim) {
    textoVigencia = `Início: ${formatarDataBR(processo.vigenciaInicio)} | Fim: ${formatarDataBR(processo.vigenciaFim)}`;
  } else {
    textoVigencia = '(Vigência pendente de preenchimento)';
  }

  return `
    <div class="essentials-grid" id="quatro-elementos-container" aria-label="Quatro elementos essenciais do processo (RN01)">
      <div class="essential-card" id="card-objeto">
        <div class="essential-tag">Elemento 1 • RN01</div>
        <div class="essential-label">Objeto da Contratação</div>
        <div class="essential-value" id="disp-objeto">${textoObjeto}</div>
        <p class="essential-hint">Finalidade e necessidade pública atendida.</p>
      </div>

      <div class="essential-card" id="card-origem">
        <div class="essential-tag">Elemento 2 • RN01</div>
        <div class="essential-label">Tipo / Origem</div>
        <div class="essential-value" id="disp-origem">${textoOrigem}</div>
        <p class="essential-hint">Instrumento convocatório e fundamento legal.</p>
      </div>

      <div class="essential-card" id="card-valor">
        <div class="essential-tag">Elemento 3 • RN01</div>
        <div class="essential-label">Valor Global</div>
        <div class="essential-value" id="disp-valor">${textoValor}</div>
        <p class="essential-hint">Compromisso orçamentário e financeiro do Estado.</p>
      </div>

      <div class="essential-card" id="card-vigencia">
        <div class="essential-tag">Elemento 4 • RN01</div>
        <div class="essential-label">Vigência e Prazos</div>
        <div class="essential-value" id="disp-vigencia">${textoVigencia}</div>
        <p class="essential-hint">Prazos de início, término e prorrogação.</p>
      </div>
    </div>
  `;
}

/**
 * Renderiza a tela completa da Etapa 1: Identificação com o formulário interativo.
 */
export function renderIdentificacaoScreen(): string {
  const p = processoAtivo;
  const res = ultimoResultadoValidacao || validarProcesso(p);

  return `
    <div class="stage-header">
      <h2 class="stage-title">1. Identificação do Instrumento</h2>
      <p class="stage-description">
        Registro preliminar dos dados do processo. Conforme a regra funcional (<strong>RN01</strong>), os 
        <strong>quatro elementos essenciais</strong> mantêm destaque visual permanente e em tempo real para orientar a análise.
      </p>
    </div>

    <!-- Seção de Destaque dos 4 Elementos Essenciais (RN01) -->
    ${renderQuatroElementosEssenciais(p)}

    <!-- Painel Didático de Carga de Cenários Fictícios -->
    <div class="scenario-selector-box">
      <div class="scenario-selector-header">
        <div>
          <strong class="scenario-selector-title">Carga Rápida de Cenários Didáticos (Dados Fictícios)</strong>
          <p class="scenario-selector-desc">Selecione um cenário pré-configurado para testar casos regulares, com valor não aplicável ou inconsistências cronológicas (RN13):</p>
        </div>
      </div>
      <div class="scenario-selector-controls">
        <select id="select-cenario-ficticio" class="form-select" aria-label="Selecione um cenário didático">
          <option value="cenario-01" ${cenarioSelecionadoId === 'cenario-01' ? 'selected' : ''}>Cenário 1 — Aquisição Regular (Pregão Eletrônico • R$ 350.000,00)</option>
          <option value="cenario-02" ${cenarioSelecionadoId === 'cenario-02' ? 'selected' : ''}>Cenário 2 — Aditivo de Prorrogação (Valor Não Aplicável • 12 meses)</option>
          <option value="cenario-03" ${cenarioSelecionadoId === 'cenario-03' ? 'selected' : ''}>Cenário 3 — Prestação de Serviços Contínuos (Limpeza • R$ 520.000,00)</option>
          <option value="cenario-04" ${cenarioSelecionadoId === 'cenario-04' ? 'selected' : ''}>Cenário 4 — Adesão a Ata de Registro de Preços (Carona • R$ 890.000,00)</option>
          <option value="cenario-05" ${cenarioSelecionadoId === 'cenario-05' ? 'selected' : ''}>Cenário 5 — Inconsistência Grave (Vigência Invertida para teste da RN13)</option>
          <option value="personalizado" ${cenarioSelecionadoId === 'personalizado' ? 'selected' : ''}>[Personalizado] Limpar campos para preenchimento manual</option>
        </select>
        <button type="button" id="btn-carregar-cenario" class="btn btn-secondary">Carregar Cenário</button>
      </div>
    </div>

    <!-- Alerta Global de Validação se houver erros pendentes -->
    <div id="alerta-validacao-global" class="validation-summary-box ${res.valido ? 'hidden' : ''}" role="alert" aria-live="polite">
      <div class="validation-summary-header">
        <span class="validation-summary-icon">⚠️</span>
        <strong>Existem pendências de preenchimento no formulário (RN13):</strong>
      </div>
      <ul class="validation-summary-list" id="lista-erros-validacao">
        ${Object.entries(res.erros).map(([campo, msg]) => `<li><a href="#campo-${campo}" class="error-link">${msg}</a></li>`).join('')}
      </ul>
    </div>

    <!-- Formulário Principal de Identificação (S2.1) -->
    <form id="form-identificacao" class="form-identificacao" novalidate>
      
      <!-- Grupo 1: Instrumento e Autuação -->
      <fieldset class="form-section">
        <legend class="form-section-legend">1. Informações Processuais e Regime Jurídico</legend>
        
        <div class="form-row">
          <div class="form-group flex-1 ${res.erros.numero ? 'has-error' : ''}">
            <label for="campo-numero" class="form-label">
              Número do Processo <span class="required-indicator">*</span>
            </label>
            <input 
              type="text" 
              id="campo-numero" 
              name="numero" 
              class="form-input" 
              value="${p.numero || ''}" 
              placeholder="Ex: SESP-PRO-2026/00001"
              required 
              aria-describedby="err-numero"
            />
            <span id="err-numero" class="field-error-text">${res.erros.numero || ''}</span>
          </div>

          <div class="form-group flex-1 ${res.erros.instrumento ? 'has-error' : ''}">
            <label for="campo-instrumento" class="form-label">
              Instrumento Jurídico Convocatório <span class="required-indicator">*</span>
            </label>
            <input 
              type="text" 
              id="campo-instrumento" 
              name="instrumento" 
              class="form-input" 
              value="${p.instrumento || ''}" 
              placeholder="Ex: Contrato Administrativo nº 01/2026"
              required 
              aria-describedby="err-instrumento"
            />
            <span id="err-instrumento" class="field-error-text">${res.erros.instrumento || ''}</span>
          </div>

          <div class="form-group flex-1 ${res.erros.regimeJuridico ? 'has-error' : ''}">
            <label for="campo-regimeJuridico" class="form-label">
              Regime Jurídico Aplicável <span class="required-indicator">*</span>
            </label>
            <select id="campo-regimeJuridico" name="regimeJuridico" class="form-select" required aria-describedby="err-regime">
              <option value="Lei nº 14.133/2021" ${p.regimeJuridico === 'Lei nº 14.133/2021' ? 'selected' : ''}>Lei nº 14.133/2021 (Nova Lei de Licitações)</option>
              <option value="Lei nº 8.666/1993" ${p.regimeJuridico === 'Lei nº 8.666/1993' ? 'selected' : ''}>Lei nº 8.666/1993 (Regime Anterior)</option>
              <option value="Lei nº 13.019/2014" ${p.regimeJuridico === 'Lei nº 13.019/2014' ? 'selected' : ''}>Lei nº 13.019/2014 (MROSC / Parcerias)</option>
              <option value="Decreto Estadual" ${p.regimeJuridico === 'Decreto Estadual' ? 'selected' : ''}>Decreto Estadual / Regulamento</option>
              <option value="Outro Regime" ${p.regimeJuridico === 'Outro Regime' ? 'selected' : ''}>Outro Regime Específico</option>
            </select>
            <span id="err-regime" class="field-error-text">${res.erros.regimeJuridico || ''}</span>
          </div>
        </div>
      </fieldset>

      <!-- Grupo 2: Elementos Essenciais (Objeto e Tipo/Origem) - RN01 -->
      <fieldset class="form-section highlight-section">
        <legend class="form-section-legend">2. Objeto e Tipo/Origem da Contratação (Elementos Essenciais • RN01)</legend>
        
        <div class="form-group ${res.erros.objeto ? 'has-error' : ''}">
          <label for="campo-objeto" class="form-label">
            Objeto Sucinto e Preciso <span class="required-indicator">*</span>
          </label>
          <textarea 
            id="campo-objeto" 
            name="objeto" 
            class="form-textarea" 
            rows="3" 
            placeholder="Descreva claramente o objeto da contratação ou pactuação..."
            required
            aria-describedby="err-objeto desc-objeto"
          >${p.objeto || ''}</textarea>
          <div class="form-hint" id="desc-objeto">Conforme RN01, o objeto deve ser claro e específico, evidenciando a necessidade pública atendida.</div>
          <span id="err-objeto" class="field-error-text">${res.erros.objeto || ''}</span>
        </div>

        <div class="form-group ${res.erros.tipoOrigem ? 'has-error' : ''}">
          <label for="campo-tipoOrigem" class="form-label">
            Tipo / Origem do Procedimento <span class="required-indicator">*</span>
          </label>
          <input 
            type="text" 
            id="campo-tipoOrigem" 
            name="tipoOrigem" 
            class="form-input" 
            value="${p.tipoOrigem || ''}" 
            placeholder="Ex: Pregão Eletrônico nº 10/2026, Dispensa de Licitação, Termo Aditivo, etc."
            required 
            aria-describedby="err-tipoOrigem"
          />
          <span id="err-tipoOrigem" class="field-error-text">${res.erros.tipoOrigem || ''}</span>
        </div>
      </fieldset>

      <!-- Grupo 3: Contratado ou Parceiro -->
      <fieldset class="form-section">
        <legend class="form-section-legend">3. Contratado / Fornecedor / Parceiro</legend>

        <div class="form-checkbox-container">
          <label class="form-checkbox-label">
            <input 
              type="checkbox" 
              id="chk-contratadoNaoAplicavel" 
              name="contratadoNaoAplicavel" 
              ${p.contratadoNaoAplicavel ? 'checked' : ''}
            />
            <span>Não aplicável a este instrumento (ex.: ato unilateral, portaria interna ou instrumento sem contratado formal)</span>
          </label>
        </div>

        <div class="form-row" id="container-campos-contratado" style="${p.contratadoNaoAplicavel ? 'display: none;' : ''}">
          <div class="form-group flex-2 ${res.erros.contratado ? 'has-error' : ''}">
            <label for="campo-contratado" class="form-label">
              Razão Social / Denominação do Contratado <span class="required-indicator">*</span>
            </label>
            <input 
              type="text" 
              id="campo-contratado" 
              name="contratado" 
              class="form-input" 
              value="${p.contratado || ''}" 
              placeholder="Ex: Alpha Tecnologia Fictícia Ltda."
              ${p.contratadoNaoAplicavel ? 'disabled' : ''}
              aria-describedby="err-contratado"
            />
            <span id="err-contratado" class="field-error-text">${res.erros.contratado || ''}</span>
          </div>

          <div class="form-group flex-1 ${res.erros.cnpj ? 'has-error' : ''}">
            <label for="campo-cnpj" class="form-label">
              CNPJ (Fictício) <span class="required-indicator">*</span>
            </label>
            <input 
              type="text" 
              id="campo-cnpj" 
              name="cnpj" 
              class="form-input" 
              value="${p.cnpj || ''}" 
              placeholder="00.000.000/0001-00"
              maxlength="18"
              ${p.contratadoNaoAplicavel ? 'disabled' : ''}
              aria-describedby="err-cnpj"
            />
            <span id="err-cnpj" class="field-error-text">${res.erros.cnpj || ''}</span>
          </div>
        </div>
      </fieldset>

      <!-- Grupo 4: Valor e Dotação Orçamentária (Elemento Essencial - RN01) -->
      <fieldset class="form-section highlight-section">
        <legend class="form-section-legend">4. Valor da Contratação (Elemento Essencial • RN01)</legend>

        <div class="form-checkbox-container">
          <label class="form-checkbox-label">
            <input 
              type="checkbox" 
              id="chk-valorNaoAplicavel" 
              name="valorNaoAplicavel" 
              ${p.valorNaoAplicavel ? 'checked' : ''}
            />
            <span><strong>Não se aplica a este instrumento</strong> (sem repasse financeiro, cooperação mútua ou aditivo de mera prorrogação)</span>
          </label>
        </div>

        <div class="form-row" id="container-campo-valor" style="${p.valorNaoAplicavel ? 'opacity: 0.6;' : ''}">
          <div class="form-group flex-1 ${res.erros.valor ? 'has-error' : ''}">
            <label for="campo-valor" class="form-label">
              Valor Financeiro Global (R$) <span class="required-indicator">*</span>
            </label>
            <input 
              type="number" 
              id="campo-valor" 
              name="valor" 
              class="form-input" 
              step="0.01" 
              min="0"
              value="${p.valor !== null && p.valor !== undefined ? p.valor : ''}" 
              placeholder="0,00"
              ${p.valorNaoAplicavel ? 'disabled' : ''}
              aria-describedby="err-valor hint-valor"
            />
            <div id="hint-valor" class="form-hint">
              ${p.valorNaoAplicavel ? 'Opção marcada: Instrumento sem impacto financeiro.' : 'Informe o valor total expresso em moeda corrente.'}
            </div>
            <span id="err-valor" class="field-error-text">${res.erros.valor || ''}</span>
            ${res.avisos.valor ? `<span class="field-warning-text">ℹ️ ${res.avisos.valor}</span>` : ''}
          </div>
        </div>
      </fieldset>

      <!-- Grupo 5: Vigência e Prazos (Elemento Essencial - RN01 / RN13) -->
      <fieldset class="form-section highlight-section">
        <legend class="form-section-legend">5. Vigência e Prazos (Elemento Essencial • RN01 e RN13)</legend>

        <div class="form-checkbox-container">
          <label class="form-checkbox-label">
            <input 
              type="checkbox" 
              id="chk-vigenciaNaoAplicavel" 
              name="vigenciaNaoAplicavel" 
              ${p.vigenciaNaoAplicavel ? 'checked' : ''}
            />
            <span><strong>Não se aplica data término</strong> (vigência por prazo indeterminado quando admitida ou não aplicável)</span>
          </label>
        </div>

        <div class="form-row" id="container-campos-vigencia" style="${p.vigenciaNaoAplicavel ? 'opacity: 0.6;' : ''}">
          <div class="form-group flex-1 ${res.erros.vigenciaInicio ? 'has-error' : ''}">
            <label for="campo-vigenciaInicio" class="form-label">
              Início da Vigência <span class="required-indicator">*</span>
            </label>
            <input 
              type="date" 
              id="campo-vigenciaInicio" 
              name="vigenciaInicio" 
              class="form-input" 
              value="${p.vigenciaInicio || ''}" 
              ${p.vigenciaNaoAplicavel ? 'disabled' : ''}
              aria-describedby="err-vigenciaInicio"
            />
            <span id="err-vigenciaInicio" class="field-error-text">${res.erros.vigenciaInicio || ''}</span>
          </div>

          <div class="form-group flex-1 ${res.erros.vigenciaFim ? 'has-error' : ''}">
            <label for="campo-vigenciaFim" class="form-label">
              Término da Vigência <span class="required-indicator">*</span>
            </label>
            <input 
              type="date" 
              id="campo-vigenciaFim" 
              name="vigenciaFim" 
              class="form-input" 
              value="${p.vigenciaFim || ''}" 
              ${p.vigenciaNaoAplicavel ? 'disabled' : ''}
              aria-describedby="err-vigenciaFim hint-vigencia"
            />
            <div id="hint-vigencia" class="form-hint">
              Validação cronológica ativa (RN13): O término deve ser igual ou posterior ao início.
            </div>
            <span id="err-vigenciaFim" class="field-error-text">${res.erros.vigenciaFim || ''}</span>
          </div>
        </div>
      </fieldset>

      <!-- Barra de Ações do Formulário -->
      <div class="form-actions-bar">
        <button type="button" id="btn-revalidar" class="btn btn-secondary">
          🔍 Validar Campos
        </button>
        <button type="submit" id="btn-salvar-avancar" class="btn btn-primary btn-large">
          Salvar e Avançar para Pertinência →
        </button>
      </div>

    </form>
  `;
}

/**
 * Atualiza os valores nos 4 cartões de destaque dos elementos essenciais em tempo real.
 */
function atualizarQuatroElementosAoVivo(p: Processo): void {
  const dispObjeto = document.getElementById('disp-objeto');
  if (dispObjeto) {
    dispObjeto.textContent = p.objeto?.trim() || '(Objeto pendente de preenchimento)';
  }

  const dispOrigem = document.getElementById('disp-origem');
  if (dispOrigem) {
    dispOrigem.textContent = p.tipoOrigem?.trim() || '(Tipo/Origem pendente)';
  }

  const dispValor = document.getElementById('disp-valor');
  if (dispValor) {
    if (p.valorNaoAplicavel) {
      dispValor.textContent = 'Não se aplica / Sem valor financeiro';
    } else if (p.valor !== null && p.valor !== undefined && !isNaN(p.valor)) {
      dispValor.textContent = formatarMoeda(p.valor);
    } else {
      dispValor.textContent = '(Valor pendente de preenchimento)';
    }
  }

  const dispVigencia = document.getElementById('disp-vigencia');
  if (dispVigencia) {
    if (p.vigenciaNaoAplicavel) {
      dispVigencia.textContent = 'Não se aplica / Prazo indeterminado';
    } else if (p.vigenciaInicio && p.vigenciaFim) {
      const duracao = calcularDuracaoVigencia(p.vigenciaInicio, p.vigenciaFim);
      dispVigencia.textContent = `${formatarDataBR(p.vigenciaInicio)} a ${formatarDataBR(p.vigenciaFim)} ${duracao ? `• ${duracao}` : ''}`;
    } else if (p.vigenciaInicio || p.vigenciaFim) {
      dispVigencia.textContent = `Início: ${formatarDataBR(p.vigenciaInicio)} | Fim: ${formatarDataBR(p.vigenciaFim)}`;
    } else {
      dispVigencia.textContent = '(Vigência pendente de preenchimento)';
    }
  }
}

/**
 * Lê os dados atuais do formulário do DOM e monta o objeto Processo.
 */
function extrairDadosDoFormulario(): Processo {
  const f = document.getElementById('form-identificacao') as HTMLFormElement | null;
  if (!f) return processoAtivo;

  const getVal = (id: string): string => (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)?.value || '';
  const getChecked = (id: string): boolean => (document.getElementById(id) as HTMLInputElement)?.checked || false;

  const valorNaoAplicavel = getChecked('chk-valorNaoAplicavel');
  const rawValor = getVal('campo-valor');
  const valor = valorNaoAplicavel ? null : (rawValor ? parseFloat(rawValor) : null);

  const vigenciaNaoAplicavel = getChecked('chk-vigenciaNaoAplicavel');
  const vigenciaInicio = vigenciaNaoAplicavel ? null : (getVal('campo-vigenciaInicio') || null);
  const vigenciaFim = vigenciaNaoAplicavel ? null : (getVal('campo-vigenciaFim') || null);

  const contratadoNaoAplicavel = getChecked('chk-contratadoNaoAplicavel');

  return {
    id: processoAtivo.id || 'proc-ficticio-01',
    numero: getVal('campo-numero'),
    instrumento: getVal('campo-instrumento'),
    regimeJuridico: getVal('campo-regimeJuridico'),
    objeto: getVal('campo-objeto'),
    tipoOrigem: getVal('campo-tipoOrigem'),
    contratado: contratadoNaoAplicavel ? '' : getVal('campo-contratado'),
    cnpj: contratadoNaoAplicavel ? '' : getVal('campo-cnpj'),
    valor,
    valorNaoAplicavel,
    vigenciaInicio,
    vigenciaFim,
    vigenciaNaoAplicavel,
    contratadoNaoAplicavel
  };
}

/**
 * Exibe ou remove as mensagens de erro nos campos do formulário.
 */
function renderizarErrosNoFormulario(resultado: ResultadoValidacaoProcesso): void {
  const campos = ['numero', 'instrumento', 'regimeJuridico', 'objeto', 'tipoOrigem', 'contratado', 'cnpj', 'valor', 'vigenciaInicio', 'vigenciaFim'];

  campos.forEach((c) => {
    const input = document.getElementById(`campo-${c}`);
    const erroSpan = document.getElementById(`err-${c}`);
    const grupo = input?.closest('.form-group');

    if (resultado.erros[c]) {
      grupo?.classList.add('has-error');
      input?.setAttribute('aria-invalid', 'true');
      if (erroSpan) erroSpan.textContent = resultado.erros[c];
    } else {
      grupo?.classList.remove('has-error');
      input?.removeAttribute('aria-invalid');
      if (erroSpan) erroSpan.textContent = '';
    }
  });

  const alertaGlobal = document.getElementById('alerta-validacao-global');
  const listaErros = document.getElementById('lista-erros-validacao');
  if (alertaGlobal && listaErros) {
    if (!resultado.valido) {
      alertaGlobal.classList.remove('hidden');
      listaErros.innerHTML = Object.entries(resultado.erros)
        .map(([campo, msg]) => `<li><a href="#campo-${campo}" class="error-link">${msg}</a></li>`)
        .join('');
    } else {
      alertaGlobal.classList.add('hidden');
      listaErros.innerHTML = '';
    }
  }
}

/**
 * Inicializa todos os ouvintes de evento da página de identificação.
 */
export function initIdentificacaoEvents(onNavegarPertinencia: () => void): void {
  const form = document.getElementById('form-identificacao') as HTMLFormElement | null;
  if (!form) return;

  // Atualização em tempo real nos 4 elementos essenciais ao digitar
  form.addEventListener('input', () => {
    const dados = extrairDadosDoFormulario();
    processoAtivo = dados;
    atualizarQuatroElementosAoVivo(dados);
  });

  // Checkbox de Valor Não Aplicável
  const chkValor = document.getElementById('chk-valorNaoAplicavel') as HTMLInputElement | null;
  const inputValor = document.getElementById('campo-valor') as HTMLInputElement | null;
  const containerValor = document.getElementById('container-campo-valor');
  const hintValor = document.getElementById('hint-valor');

  chkValor?.addEventListener('change', () => {
    const checked = chkValor.checked;
    if (inputValor) {
      inputValor.disabled = checked;
      if (checked) inputValor.value = '';
    }
    if (containerValor) containerValor.style.opacity = checked ? '0.6' : '1';
    if (hintValor) {
      hintValor.textContent = checked ? 'Opção marcada: Instrumento sem impacto financeiro.' : 'Informe o valor total expresso em moeda corrente.';
    }
    const dados = extrairDadosDoFormulario();
    processoAtivo = dados;
    atualizarQuatroElementosAoVivo(dados);
    const validacao = validarProcesso(dados);
    ultimoResultadoValidacao = validacao;
    renderizarErrosNoFormulario(validacao);
  });

  // Checkbox de Vigência Não Aplicável
  const chkVigencia = document.getElementById('chk-vigenciaNaoAplicavel') as HTMLInputElement | null;
  const inputInicio = document.getElementById('campo-vigenciaInicio') as HTMLInputElement | null;
  const inputFim = document.getElementById('campo-vigenciaFim') as HTMLInputElement | null;
  const containerVigencia = document.getElementById('container-campos-vigencia');

  chkVigencia?.addEventListener('change', () => {
    const checked = chkVigencia.checked;
    if (inputInicio) {
      inputInicio.disabled = checked;
      if (checked) inputInicio.value = '';
    }
    if (inputFim) {
      inputFim.disabled = checked;
      if (checked) inputFim.value = '';
    }
    if (containerVigencia) containerVigencia.style.opacity = checked ? '0.6' : '1';
    const dados = extrairDadosDoFormulario();
    processoAtivo = dados;
    atualizarQuatroElementosAoVivo(dados);
    const validacao = validarProcesso(dados);
    ultimoResultadoValidacao = validacao;
    renderizarErrosNoFormulario(validacao);
  });

  // Checkbox de Contratado Não Aplicável
  const chkContratado = document.getElementById('chk-contratadoNaoAplicavel') as HTMLInputElement | null;
  const inputContratado = document.getElementById('campo-contratado') as HTMLInputElement | null;
  const inputCnpj = document.getElementById('campo-cnpj') as HTMLInputElement | null;
  const containerContratado = document.getElementById('container-campos-contratado');

  chkContratado?.addEventListener('change', () => {
    const checked = chkContratado.checked;
    if (inputContratado) inputContratado.disabled = checked;
    if (inputCnpj) inputCnpj.disabled = checked;
    if (containerContratado) containerContratado.style.display = checked ? 'none' : 'flex';
    const dados = extrairDadosDoFormulario();
    processoAtivo = dados;
    const validacao = validarProcesso(dados);
    ultimoResultadoValidacao = validacao;
    renderizarErrosNoFormulario(validacao);
  });

  // Carga de Cenários Didáticos Fictícios
  const selectCenario = document.getElementById('select-cenario-ficticio') as HTMLSelectElement | null;
  const btnCarregar = document.getElementById('btn-carregar-cenario');

  const aplicarCenario = () => {
    const cenarioKey = selectCenario?.value || 'cenario-01';
    cenarioSelecionadoId = cenarioKey;

    if (cenarioKey === 'personalizado') {
      processoAtivo = {
        id: 'proc-ficticio-novo',
        numero: '',
        instrumento: '',
        contratado: '',
        cnpj: '',
        objeto: '',
        tipoOrigem: '',
        valor: null,
        valorNaoAplicavel: false,
        vigenciaInicio: '',
        vigenciaFim: '',
        vigenciaNaoAplicavel: false,
        regimeJuridico: 'Lei nº 14.133/2021',
        contratadoNaoAplicavel: false
      };
    } else if (CENARIOS_DEMO[cenarioKey]) {
      processoAtivo = { ...CENARIOS_DEMO[cenarioKey] };
    }

    ultimoResultadoValidacao = validarProcesso(processoAtivo);

    // Repopula o formulário no DOM
    const setVal = (id: string, val: string) => {
      const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
      if (el) el.value = val;
    };
    const setChk = (id: string, chk: boolean) => {
      const el = document.getElementById(id) as HTMLInputElement | null;
      if (el) el.checked = chk;
    };

    setVal('campo-numero', processoAtivo.numero || '');
    setVal('campo-instrumento', processoAtivo.instrumento || '');
    setVal('campo-regimeJuridico', processoAtivo.regimeJuridico || 'Lei nº 14.133/2021');
    setVal('campo-objeto', processoAtivo.objeto || '');
    setVal('campo-tipoOrigem', processoAtivo.tipoOrigem || '');
    setVal('campo-contratado', processoAtivo.contratado || '');
    setVal('campo-cnpj', processoAtivo.cnpj || '');
    setVal('campo-valor', processoAtivo.valor !== null && processoAtivo.valor !== undefined ? String(processoAtivo.valor) : '');
    setVal('campo-vigenciaInicio', processoAtivo.vigenciaInicio || '');
    setVal('campo-vigenciaFim', processoAtivo.vigenciaFim || '');

    setChk('chk-valorNaoAplicavel', Boolean(processoAtivo.valorNaoAplicavel));
    setChk('chk-vigenciaNaoAplicavel', Boolean(processoAtivo.vigenciaNaoAplicavel));
    setChk('chk-contratadoNaoAplicavel', Boolean(processoAtivo.contratadoNaoAplicavel));

    if (inputValor) inputValor.disabled = Boolean(processoAtivo.valorNaoAplicavel);
    if (containerValor) containerValor.style.opacity = processoAtivo.valorNaoAplicavel ? '0.6' : '1';
    if (inputInicio) inputInicio.disabled = Boolean(processoAtivo.vigenciaNaoAplicavel);
    if (inputFim) inputFim.disabled = Boolean(processoAtivo.vigenciaNaoAplicavel);
    if (containerVigencia) containerVigencia.style.opacity = processoAtivo.vigenciaNaoAplicavel ? '0.6' : '1';
    if (containerContratado) containerContratado.style.display = processoAtivo.contratadoNaoAplicavel ? 'none' : 'flex';

    atualizarQuatroElementosAoVivo(processoAtivo);
    renderizarErrosNoFormulario(ultimoResultadoValidacao);
  };

  selectCenario?.addEventListener('change', aplicarCenario);
  btnCarregar?.addEventListener('click', aplicarCenario);

  // Botão "Validar Campos"
  const btnRevalidar = document.getElementById('btn-revalidar');
  btnRevalidar?.addEventListener('click', () => {
    const dados = extrairDadosDoFormulario();
    processoAtivo = dados;
    const res = validarProcesso(dados);
    ultimoResultadoValidacao = res;
    renderizarErrosNoFormulario(res);

    if (res.valido) {
      alert('✅ Todos os campos obrigatórios e regras de preenchimento foram validados com sucesso!');
    }
  });

  // Submissão do Formulário e Avanço para a Etapa 2 (Pertinência)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const dados = extrairDadosDoFormulario();
    processoAtivo = dados;
    const res = validarProcesso(dados);
    ultimoResultadoValidacao = res;
    renderizarErrosNoFormulario(res);

    if (!res.valido) {
      // Foca no primeiro campo com erro
      const primeiroCampoComErro = Object.keys(res.erros)[0];
      const el = document.getElementById(`campo-${primeiroCampoComErro}`);
      el?.focus();
      const alertaGlobal = document.getElementById('alerta-validacao-global');
      alertaGlobal?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Formulário válido: avança para a próxima etapa
    onNavegarPertinencia();
  });
}
