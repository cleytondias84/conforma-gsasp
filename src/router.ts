/**
 * CONFORMA GSASP — Sistema de Roteamento por Hash e Telas das Etapas
 * Implementação da tarefa S1.3 e S2.1
 */

import {
  renderIdentificacaoScreen,
  initIdentificacaoEvents,
  getProcessoAtivo,
  setProcessoAtivo,
  sincronizarIdentificacaoDoFormulario
} from './pages/identificacao';
import {
  renderPertinenciaScreen,
  initPertinenciaEvents,
  getPertinenciaAtiva,
  setPertinenciaAtiva,
  sincronizarPertinenciaDoFormulario
} from './pages/pertinencia';
import {
  renderConformidadeScreen,
  initConformidadeEvents,
  getChecklistAtivo,
  setChecklistAtivo,
  getCondicionantesAtivas,
  setCondicionantesAtivas,
  sincronizarConformidadeDoFormulario
} from './pages/conformidade';
import {
  salvarRascunhoAtual,
  recuperarUltimoRascunho,
  formatarCarimboSalvamento,
  obterDiagnosticoArmazenamento,
  AVISO_PERSISTENCIA_LOCAL,
  type DiagnosticoArmazenamento
} from './services/armazenamento';
import {
  getPapelAtivo,
  setPapelAtivo,
  getInfoPapelAtivo,
  podeEditar,
  podeSalvarRascunho,
  type PapelUsuario
} from './auth/papeis';

export interface StageInfo {
  id: string;
  stepNumber: number;
  hash: string;
  title: string;
  shortTitle: string;
  description: string;
}

export const STAGES: StageInfo[] = [
  {
    id: 'identificacao',
    stepNumber: 1,
    hash: '#/identificacao',
    title: '1. Identificação do Instrumento',
    shortTitle: 'Identificação',
    description: 'Registro e conferência preliminar dos elementos essenciais do processo.'
  },
  {
    id: 'pertinencia',
    stepNumber: 2,
    hash: '#/pertinencia',
    title: '2. Pertinência Institucional',
    shortTitle: 'Pertinência',
    description: 'Filtro prévio obrigatório de conveniência, planejamento, economicidade e competência pública.'
  },
  {
    id: 'conformidade',
    stepNumber: 3,
    hash: '#/conformidade',
    title: '3. Conformidade Documental',
    shortTitle: 'Conformidade',
    description: 'Conferência do checklist de instrução processual e atendimento às condicionantes jurídicas.'
  },
  {
    id: 'achados',
    stepNumber: 4,
    hash: '#/achados',
    title: '4. Apontamento de Achados',
    shortTitle: 'Achados',
    description: 'Registro, classificação de impacto e revisão humana de inconsistências encontradas.'
  },
  {
    id: 'riscos',
    stepNumber: 5,
    hash: '#/riscos',
    title: '5. Avaliação de Riscos',
    shortTitle: 'Riscos',
    description: 'Análise fundamentada dos riscos nas dimensões jurídica, financeira, operacional e de controle.'
  },
  {
    id: 'resultado',
    stepNumber: 6,
    hash: '#/resultado',
    title: '6. Resultado e Encaminhamento',
    shortTitle: 'Resultado',
    description: 'Consolidação executiva para apoio à decisão da autoridade, respondendo às cinco perguntas centrais.'
  }
];

/**
 * Renderiza o cabeçalho fixo com identidade institucional e aviso de protótipo.
 */
function renderHeader(): string {
  const papelAtivo = getPapelAtivo();
  const infoPapel = getInfoPapelAtivo();

  return `
    <header class="header">
      <div class="header-inner">
        <div>
          <a href="#/" class="brand-link" title="Voltar à tela inicial">
            <h1 class="brand-title">CONFORMA GSASP</h1>
          </a>
          <p class="brand-subtitle">Sistema de Conformidade e Apoio à Decisão &bull; GSASP/SESP-MT</p>
        </div>
        <div class="header-controls">
          <div class="role-selector-container">
            <label for="select-papel-usuario" class="role-label">
              <span class="role-icon">👤</span> Ver como:
            </label>
            <select id="select-papel-usuario" class="role-select" aria-label="Simulação de papel de usuário (didático)">
              <option value="assessor" ${papelAtivo === 'assessor' ? 'selected' : ''}>Editor / Assessor (GSASP)</option>
              <option value="administrador" ${papelAtivo === 'administrador' ? 'selected' : ''}>Administrador (Demonstração)</option>
              <option value="aprovador" ${papelAtivo === 'aprovador' ? 'selected' : ''}>Aprovador / Validador Executivo</option>
              <option value="leitor" ${papelAtivo === 'leitor' ? 'selected' : ''}>Leitor (Somente Consulta)</option>
            </select>
          </div>
          <div class="header-badge-container">
            <span class="badge-didatico">Protótipo didático — somente dados fictícios</span>
          </div>
        </div>
      </div>
      <div class="role-banner" role="status" aria-label="Papel ativo na demonstração">
        <div class="role-banner-content">
          <span class="role-pill role-pill-${infoPapel.id}">${infoPapel.rotuloCurto}</span>
          <span class="role-desc"><strong>${infoPapel.nome}:</strong> ${infoPapel.descricaoUso}</span>
          <span class="role-limite"><em>(${infoPapel.limiteAtuacao})</em></span>
        </div>
      </div>
    </header>
  `;
}

/**
 * Renderiza o rodapé institucional.
 */
function renderFooter(): string {
  return `
    <footer class="footer">
      <p>GSASP / SESP-MT &bull; Camada de Conformidade e Apoio à Decisão &bull; Ambiente Demonstrativo</p>
    </footer>
  `;
}

/**
 * Renderiza a barra de progresso / indicador de etapas (Stepper).
 */
function renderStepper(currentStepNumber: number): string {
  return `
    <nav class="stepper-nav" aria-label="Progresso das etapas da análise">
      <ol class="stepper-list">
        ${STAGES.map((s) => {
          const isCurrent = s.stepNumber === currentStepNumber;
          const isPast = s.stepNumber < currentStepNumber;
          const statusClass = isCurrent ? 'step-current' : isPast ? 'step-past' : 'step-upcoming';
          return `
            <li class="stepper-item ${statusClass}" ${isCurrent ? 'aria-current="step"' : ''}>
              <a href="${s.hash}" class="stepper-link">
                <span class="step-badge">${s.stepNumber}</span>
                <span class="step-label">${s.shortTitle}</span>
              </a>
            </li>
          `;
        }).join('')}
      </ol>
    </nav>
  `;
}

let ultimoSalvamentoTimestamp: string | null = null;
let rascunhoInicializado: boolean = false;
let diagnosticoArmazenamento: DiagnosticoArmazenamento | null = null;
let statusConexaoOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
let ouvintesConexaoRegistrados: boolean = false;

/**
 * Renderiza a barra executiva de persistência local no topo de cada etapa.
 */
function renderBarraPersistencia(): string {
  const podeSalvar = podeSalvarRascunho();
  const tipoStorage = diagnosticoArmazenamento?.tipo || 'indexedDB';
  const isMemoria = tipoStorage === 'memoria';
  const isLocalStorage = tipoStorage === 'localStorage';

  const tituloStorage = isMemoria
    ? 'Armazenamento em Memória Volátil'
    : isLocalStorage
    ? 'Persistência Local (localStorage)'
    : 'Persistência Local (IndexedDB)';

  const iconeStorage = isMemoria ? '⚠️' : '💾';

  return `
    <div class="storage-bar ${isMemoria ? 'storage-bar-warning' : ''}" role="region" aria-label="Status do salvamento local no navegador">
      <div class="storage-bar-main">
        <div class="storage-info">
          <span class="storage-icon">${iconeStorage}</span>
          <div>
            <div class="storage-title-row">
              <strong class="storage-title">${tituloStorage}</strong>
              <span class="connection-pill ${statusConexaoOnline ? 'connection-online' : 'connection-offline'}" title="${statusConexaoOnline ? 'Conexão de rede ativa' : 'Navegador operando offline com telas e dados servidos pelo cache do Service Worker'}">
                ${statusConexaoOnline ? '🌐 Online' : '📡 Modo Offline (Cache Local Ativo)'}
              </span>
            </div>
            <span class="storage-time" id="status-ultimo-salvamento">
              Último salvamento: ${formatarCarimboSalvamento(ultimoSalvamentoTimestamp)}
            </span>
          </div>
        </div>
        <div class="storage-actions">
          <button type="button" id="btn-salvar-rascunho-global" class="btn btn-secondary btn-small" title="${podeSalvar ? (isMemoria ? 'Salva temporariamente em memória nesta sessão' : 'Salva o rascunho de todas as etapas no armazenamento deste navegador') : 'Desabilitado no perfil atual (somente consulta)'}" ${!podeSalvar ? 'disabled' : ''}>
            ${isMemoria ? '⚠️ Salvar na Sessão' : '💾 Salvar Rascunho'}
          </button>
          <button type="button" id="btn-recuperar-rascunho-global" class="btn btn-secondary btn-small" title="Recupera o último rascunho salvo do armazenamento">
            📂 Retomar Rascunho Salvo
          </button>
        </div>
      </div>

      ${isMemoria ? `
      <div class="storage-memory-alert" role="alert">
        <strong>⚠️ Atenção — Armazenamento apenas em memória:</strong> os dados NÃO persistirão após fechar ou recarregar esta página. Para persistência de longa duração de suas análises, utilize um navegador compatível com IndexedDB ou localStorage sem restrições de armazenamento local.
      </div>
      ` : ''}

      <p class="storage-disclaimer">
        ${AVISO_PERSISTENCIA_LOCAL}
      </p>
    </div>
  `;
}

/**
 * Renderiza os botões "Anterior" e "Próximo".
 */
function renderNavigationButtons(currentStepNumber: number): string {
  const isFirst = currentStepNumber === 1;
  const isLast = currentStepNumber === STAGES.length;

  const prevHash = isFirst ? '#/' : STAGES[currentStepNumber - 2].hash;
  const prevLabel = isFirst ? '← Voltar ao Início' : '← Anterior';

  const nextHash = isLast ? '#/' : STAGES[currentStepNumber].hash;
  const nextLabel = isLast ? 'Concluir Demonstração →' : 'Próximo →';

  return `
    <div class="stage-actions">
      <a href="${prevHash}" class="btn btn-secondary">${prevLabel}</a>
      <span class="step-counter-text">Etapa ${currentStepNumber} de ${STAGES.length}</span>
      <a href="${nextHash}" class="btn btn-primary">${nextLabel}</a>
    </div>
  `;
}

/**
 * Renderiza a Tela Inicial.
 */
function renderHomeScreen(): string {
  return `
    <div class="card hero-card">
      <div class="hero-header">
        <h2 class="hero-title">Revisão e Apoio à Decisão</h2>
        <p class="hero-subtitle">
          Padronização e conferência prévia de processos submetidos à assinatura do Secretário Adjunto.
        </p>
      </div>

      <div class="info-box">
        <strong>Como funciona o fluxo de conferência:</strong>
        <p>A análise é estruturada em 6 etapas sequenciais, garantindo que nenhum item essencial seja omitido antes do encaminhamento à autoridade.</p>
        <ul class="home-stages-preview">
          <li><strong>1. Identificação:</strong> Destaque imediato de objeto, tipo/origem, valor e vigência.</li>
          <li><strong>2. Pertinência:</strong> Avaliação obrigatória de competência, necessidade e benefício público.</li>
          <li><strong>3. Conformidade:</strong> Conferência de checklist documental e atendimento a condicionantes jurídicas.</li>
          <li><strong>4. Achados:</strong> Apontamento e classificação de inconsistências com validação humana.</li>
          <li><strong>5. Riscos:</strong> Dimensões jurídica, financeira, operacional e controle.</li>
          <li><strong>6. Resultado:</strong> Resposta executiva às 5 perguntas essenciais para suporte à decisão.</li>
        </ul>
      </div>

      <div class="home-cta-container">
        <a href="#/identificacao" class="btn btn-primary btn-large">Iniciar análise →</a>
      </div>
    </div>
  `;
}




/**
 * Renderiza a Etapa 4: Apontamento de Achados.
 */
function renderAchadosScreen(): string {
  return `
    <div class="stage-header">
      <h2 class="stage-title">4. Apontamento e Validação de Achados</h2>
      <p class="stage-description">
        Identificação de inconsistências ou pendências. Conforme as regras funcionais (RN05 e RN06), sugestões automáticas dependem de confirmação expressa do assessor antes de compor o relatório.
      </p>
    </div>

    <div class="preview-card">
      <h3 class="preview-title">Classificações de Achados (RN04):</h3>
      <div class="tags-row">
        <span class="tag-badge tag-impeditivo">IMPEDITIVO</span>
        <span class="tag-badge tag-relevante">RELEVANTE</span>
        <span class="tag-badge tag-formal">FORMAL</span>
        <span class="tag-badge tag-melhoria">MELHORIA</span>
      </div>
      <p class="preview-text">
        Todo achado liga: <strong>Evidência</strong> &rarr; <strong>Regra/Motivo</strong> &rarr; <strong>Impacto</strong> &rarr; <strong>Providência</strong> &rarr; <strong>Responsável</strong>.
      </p>
      <p class="preview-status">Status da visualização: Estrutura navegável preparada para receber a interface de revisão de achados na Sprint 3.</p>
    </div>
  `;
}

/**
 * Renderiza a Etapa 5: Avaliação de Riscos.
 */
function renderRiscosScreen(): string {
  return `
    <div class="stage-header">
      <h2 class="stage-title">5. Avaliação de Riscos</h2>
      <p class="stage-description">
        Mapeamento dos riscos do processo nas dimensões institucional, com fundamentação humana obrigatória para cada nível atribuído.
      </p>
    </div>

    <div class="preview-card">
      <h3 class="preview-title">Dimensões analisadas:</h3>
      <ul class="preview-list">
        <li><strong>Jurídica:</strong> Risco de anulação, questionamento por órgãos de controle ou insegurança normativa.</li>
        <li><strong>Financeira:</strong> Risco de glosa orçamentária, sobrepreço ou indisponibilidade de crédito.</li>
        <li><strong>Operacional:</strong> Risco de descontinuidade do serviço público ou atrasos de execução.</li>
        <li><strong>Controle:</strong> Histórico de apontamentos pelo Tribunal de Contas ou auditorias internas.</li>
      </ul>
      <p class="preview-status">Status da visualização: Estrutura navegável preparada para o catálogo de riscos na Sprint 3.</p>
    </div>
  `;
}

/**
 * Renderiza a Etapa 6: Resultado e Encaminhamento.
 */
function renderResultadoScreen(): string {
  return `
    <div class="stage-header">
      <h2 class="stage-title">6. Resultado Executivo e Encaminhamento</h2>
      <p class="stage-description">
        Documento executivo padronizado para subsidiar a autoridade decisora, consolidando a análise de conformidade em respostas objetivas (RN09).
      </p>
    </div>

    <div class="preview-card">
      <h3 class="preview-title">As Cinco Perguntas Executivas:</h3>
      <ol class="executive-questions-list">
        <li><strong>Pode assinar?</strong> (Conclusão indicativa submetida à homologação do assessor).</li>
        <li><strong>O que corrigir?</strong> (Relação clara das providências necessárias).</li>
        <li><strong>Quem corrige?</strong> (Identificação dos setores ou servidores responsáveis).</li>
        <li><strong>Retorna ao Gabinete?</strong> (Necessidade de reapreciação após saneamento).</li>
        <li><strong>Exige nova análise jurídica?</strong> (Reanálise pela PGE ou assessoria).</li>
      </ol>
      <p class="preview-status">Status da visualização: Modelo estrutural preparado para geração de documento imprimível na Sprint 4.</p>
    </div>
  `;
}

/**
 * Garante que qualquer digitação pendente no DOM seja sincronizada para o estado da tela ativa antes de salvar.
 */
export function sincronizarEstadoDaTelaAtiva(): void {
  sincronizarIdentificacaoDoFormulario();
  sincronizarPertinenciaDoFormulario();
  sincronizarConformidadeDoFormulario();
}

/**
 * Função principal do roteador que lê a hash da URL e renderiza a tela correspondente.
 */
export function renderRoute(): void {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  const rawHash = window.location.hash || '#/';
  const normalizedHash = rawHash.startsWith('#') ? rawHash : `#${rawHash}`;

  const currentStageIndex = STAGES.findIndex((s) => s.hash === normalizedHash);
  const isStage = currentStageIndex !== -1;
  const currentStage = isStage ? STAGES[currentStageIndex] : null;

  let mainHtml = '';

  if (!isStage || normalizedHash === '#/') {
    // Tela Inicial
    mainHtml = `
      <main class="main-content">
        ${renderHomeScreen()}
      </main>
    `;
  } else if (currentStage) {
    // Telas das Etapas 1 a 6
    let stageContentHtml = '';
    switch (currentStage.id) {
      case 'identificacao':
        stageContentHtml = renderIdentificacaoScreen();
        break;
      case 'pertinencia':
        stageContentHtml = renderPertinenciaScreen();
        break;
      case 'conformidade':
        stageContentHtml = renderConformidadeScreen();
        break;
      case 'achados':
        stageContentHtml = renderAchadosScreen();
        break;
      case 'riscos':
        stageContentHtml = renderRiscosScreen();
        break;
      case 'resultado':
        stageContentHtml = renderResultadoScreen();
        break;
    }

    mainHtml = `
      <main class="main-content">
        ${renderStepper(currentStage.stepNumber)}
        ${renderBarraPersistencia()}
        <div class="card stage-card">
          ${stageContentHtml}
          ${renderNavigationButtons(currentStage.stepNumber)}
        </div>
      </main>
    `;
  }

  app.innerHTML = `
    ${renderHeader()}
    ${mainHtml}
    ${renderFooter()}
  `;

  // Listener do Seletor de Papéis de Usuário (Simulação Didática - S2.5)
  const selectPapel = document.getElementById('select-papel-usuario') as HTMLSelectElement | null;
  selectPapel?.addEventListener('change', () => {
    const novoPapel = selectPapel.value as PapelUsuario;
    // Se o papel ativo anterior permitia edição, sincroniza o estado antes de mudar para preservar digitações
    if (podeEditar()) {
      sincronizarEstadoDaTelaAtiva();
    }
    setPapelAtivo(novoPapel);
    renderRoute();
  });

  // Listeners da Barra de Persistência Local (IndexedDB)
  const btnSalvar = document.getElementById('btn-salvar-rascunho-global');
  btnSalvar?.addEventListener('click', async () => {
    if (!podeSalvarRascunho()) {
      alert('ℹ️ O perfil ativo está em modo somente consulta e não possui permissão para salvar rascunhos.');
      return;
    }

    btnSalvar.textContent = 'Salvando...';
    try {
      // Sincroniza imediatamente o estado a partir do formulário aberto no DOM
      sincronizarEstadoDaTelaAtiva();
      const res = await salvarRascunhoAtual(
        getProcessoAtivo(),
        getPertinenciaAtiva(),
        getChecklistAtivo(),
        getCondicionantesAtivas(),
        'rascunho'
      );
      ultimoSalvamentoTimestamp = res.salvoEm;
      try {
        diagnosticoArmazenamento = await obterDiagnosticoArmazenamento();
      } catch {
        // Ignora
      }
      const el = document.getElementById('status-ultimo-salvamento');
      if (el) el.textContent = `Último salvamento: ${formatarCarimboSalvamento(res.salvoEm)}`;
      const tipoMsg = diagnosticoArmazenamento?.tipo === 'memoria' ? 'em memória volátil desta sessão' : 'no armazenamento local deste navegador';
      alert(`✅ Rascunho salvo com sucesso ${tipoMsg}!\n\nSalvo em: ${formatarCarimboSalvamento(res.salvoEm)}\nProcesso: ${getProcessoAtivo().numero || '(Em preenchimento)'}\n\nAtenção: O salvamento do rascunho preserva as edições locais e não se confunde com aprovação jurídica da análise.`);
    } catch (e) {
      alert(`Erro ao salvar rascunho localmente: ${(e as Error).message}`);
    } finally {
      btnSalvar.textContent = '💾 Salvar Rascunho';
    }
  });

  const btnRecuperar = document.getElementById('btn-recuperar-rascunho-global');
  btnRecuperar?.addEventListener('click', async () => {
    try {
      const recuperado = await recuperarUltimoRascunho();
      try {
        diagnosticoArmazenamento = await obterDiagnosticoArmazenamento();
      } catch {
        // Ignora
      }
      if (!recuperado) {
        alert('ℹ️ Nenhum rascunho salvo anteriormente foi encontrado no armazenamento deste navegador.');
        return;
      }
      setProcessoAtivo(recuperado.processo);
      setPertinenciaAtiva(recuperado.pertinencia);
      setChecklistAtivo(recuperado.checklist);
      setCondicionantesAtivas(recuperado.condicionantes);
      ultimoSalvamentoTimestamp = recuperado.salvoEm;
      renderRoute();
      alert(`✅ Rascunho recuperado com sucesso do armazenamento local!\n\nProcesso: ${recuperado.processo.numero || '(Sem número)'}\nSalvo em: ${formatarCarimboSalvamento(recuperado.salvoEm)}\n\nTodas as informações das etapas foram restauradas no navegador.`);
    } catch (e) {
      alert(`Erro ao recuperar rascunho do armazenamento: ${(e as Error).message}`);
    }
  });

  if (currentStage?.id === 'identificacao') {
    initIdentificacaoEvents(async () => {
      // Salva rascunho automaticamente ao avançar se permitido
      if (podeSalvarRascunho()) {
        sincronizarEstadoDaTelaAtiva();
        await salvarRascunhoAtual(getProcessoAtivo(), getPertinenciaAtiva(), getChecklistAtivo(), getCondicionantesAtivas(), 'rascunho');
      }
      window.location.hash = '#/pertinencia';
    });

    // Intercepta o botão "Próximo →" inferior para acionar a validação antes de avançar
    const nextBtn = document.querySelector('.stage-actions a.btn-primary');
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        if (!podeEditar()) {
          // Perfil somente leitura (Leitor / Aprovador): navega livremente sem acionar validação impeditiva
          return;
        }
        e.preventDefault();
        const form = document.getElementById('form-identificacao') as HTMLFormElement | null;
        if (form) {
          form.requestSubmit();
        }
      });
    }
  }

  if (currentStage?.id === 'pertinencia') {
    initPertinenciaEvents(
      async () => {
        // Salva rascunho automaticamente ao avançar se permitido
        if (podeSalvarRascunho()) {
          sincronizarEstadoDaTelaAtiva();
          await salvarRascunhoAtual(getProcessoAtivo(), getPertinenciaAtiva(), getChecklistAtivo(), getCondicionantesAtivas(), 'rascunho');
        }
        window.location.hash = '#/conformidade';
      },
      () => {
        if (podeEditar()) {
          sincronizarEstadoDaTelaAtiva();
        }
        window.location.hash = '#/identificacao';
      }
    );

    // Intercepta o botão "Próximo →" inferior para acionar a validação de pertinência antes de avançar
    const nextBtn = document.querySelector('.stage-actions a.btn-primary');
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        if (!podeEditar()) {
          return;
        }
        e.preventDefault();
        const form = document.getElementById('form-pertinencia') as HTMLFormElement | null;
        if (form) {
          form.requestSubmit();
        }
      });
    }
  }

  if (currentStage?.id === 'conformidade') {
    initConformidadeEvents(
      async () => {
        // Salva rascunho automaticamente ao avançar se permitido
        if (podeSalvarRascunho()) {
          sincronizarEstadoDaTelaAtiva();
          await salvarRascunhoAtual(getProcessoAtivo(), getPertinenciaAtiva(), getChecklistAtivo(), getCondicionantesAtivas(), 'rascunho');
        }
        window.location.hash = '#/achados';
      },
      () => {
        if (podeEditar()) {
          sincronizarEstadoDaTelaAtiva();
        }
        window.location.hash = '#/pertinencia';
      }
    );

    // Intercepta o botão "Próximo →" inferior para acionar a validação de conformidade antes de avançar
    const nextBtn = document.querySelector('.stage-actions a.btn-primary');
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        if (!podeEditar()) {
          return;
        }
        e.preventDefault();
        const form = document.getElementById('form-conformidade') as HTMLFormElement | null;
        if (form) {
          form.requestSubmit();
        }
      });
    }
  }

  // Assegura rolagem suave ao topo ao mudar de rota
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Inicializa os ouvintes do roteador e retoma rascunho persistido.
 */
export async function initRouter(): Promise<void> {
  window.addEventListener('hashchange', renderRoute);

  // Registra ouvintes para acompanhar o status de conectividade em tempo real (PWA Offline)
  if (!ouvintesConexaoRegistrados && typeof window !== 'undefined') {
    ouvintesConexaoRegistrados = true;
    window.addEventListener('online', () => {
      statusConexaoOnline = true;
      renderRoute();
    });
    window.addEventListener('offline', () => {
      statusConexaoOnline = false;
      renderRoute();
    });
  }

  // Na inicialização, obtém diagnóstico da camada de armazenamento e retoma rascunho se disponível
  if (!rascunhoInicializado) {
    rascunhoInicializado = true;
    try {
      diagnosticoArmazenamento = await obterDiagnosticoArmazenamento();
    } catch {
      // Falha não bloqueante
    }

    try {
      const recuperado = await recuperarUltimoRascunho();
      if (recuperado) {
        setProcessoAtivo(recuperado.processo);
        setPertinenciaAtiva(recuperado.pertinencia);
        setChecklistAtivo(recuperado.checklist);
        setCondicionantesAtivas(recuperado.condicionantes);
        ultimoSalvamentoTimestamp = recuperado.salvoEm;
      }
    } catch {
      // Falha não bloqueante na inicialização
    }
  }

  // Primeira renderização
  renderRoute();
}
