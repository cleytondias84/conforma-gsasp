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
} from './pages/identificacao.ts';
import {
  renderPertinenciaScreen,
  initPertinenciaEvents,
  getPertinenciaAtiva,
  setPertinenciaAtiva,
  sincronizarPertinenciaDoFormulario
} from './pages/pertinencia.ts';
import {
  renderConformidadeScreen,
  initConformidadeEvents,
  getChecklistAtivo,
  setChecklistAtivo,
  getCondicionantesAtivas,
  setCondicionantesAtivas,
  sincronizarConformidadeDoFormulario
} from './pages/conformidade.ts';
import {
  renderAchadosScreen,
  initAchadosEvents,
  getAchadosAtivos,
  setAchadosAtivos
} from './pages/achados.ts';
import {
  renderRiscosScreen,
  initRiscosEvents,
  getRiscosAtivos,
  setRiscosAtivos,
  sincronizarRiscosDoFormulario
} from './pages/riscos.ts';
import {
  renderResultadoScreen,
  initResultadoEvents,
  getConclusaoValidada,
  getValidacaoHumana,
  getResultadoExecutivoAtivo,
  sincronizarResultadoDoFormulario,
  exportarEstadoResultado,
  importarEstadoResultado
} from './pages/resultado.ts';
import {
  renderPainelScreen,
  initPainelEvents
} from './pages/painel.ts';
import {
  salvarRascunhoAtual,
  recuperarUltimoRascunho,
  formatarCarimboSalvamento,
  obterDiagnosticoArmazenamento,
  AVISO_PERSISTENCIA_LOCAL,
  type DiagnosticoArmazenamento
} from './services/armazenamento.ts';

/**
 * Salva o estado completo da sessão no armazenamento local,
 * preservando dados de todas as etapas e metadados de conclusão/invalidação RN10.
 */
async function salvarRascunhoSessao(): Promise<{ analiseId: string; salvoEm: string }> {
  const estadoRes = exportarEstadoResultado();
  return salvarRascunhoAtual(
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
    {
      hashDadosEtapasAnteriores: estadoRes.hashDadosEtapasAnteriores,
      necessitaNovaRevisaoConclusao: estadoRes.necessitaNovaRevisaoConclusao,
      manifestacaoAnteriorInvalidada: estadoRes.manifestacaoAnteriorInvalidada,
      justificativaDivergencia: estadoRes.justificativaDivergencia,
      observacoesAssessor: estadoRes.observacoesAssessor
    }
  );
}
import {
  getPapelAtivo,
  setPapelAtivo,
  getInfoPapelAtivo,
  podeEditar,
  podeSalvarRascunho,
  type PapelUsuario
} from './auth/papeis.ts';
import {
  getEventosAtivos,
  setEventosAtivos,
  registrarEventoLocal,
  ACOES_AUDITORIA,
  abrirModalAuditoria
} from './services/auditoria.ts';

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
          <a href="#/painel" class="brand-link" title="Acessar o Painel Executivo e Quadro Síntese">
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
          <a href="#/painel" id="btn-painel-atalho-global" class="btn btn-secondary btn-small" title="Exibe o Painel Executivo e Quadro Síntese da análise">
            📊 Painel
          </a>
          <button type="button" id="btn-ver-auditoria-global" class="btn btn-secondary btn-small" title="Exibe a trilha de auditoria e histórico de eventos local desta análise">
            📜 Auditoria Local (${getEventosAtivos().length})
          </button>
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

  const prevHash = isFirst ? '#/painel' : STAGES[currentStepNumber - 2].hash;
  const prevLabel = isFirst ? '← Painel Executivo' : '← Anterior';

  const nextHash = isLast ? '#/painel' : STAGES[currentStepNumber].hash;
  const nextLabel = isLast ? 'Concluir para o Painel →' : 'Próximo →';

  return `
    <div class="stage-actions">
      <a href="${prevHash}" class="btn btn-secondary">${prevLabel}</a>
      <span class="step-counter-text">Etapa ${currentStepNumber} de ${STAGES.length}</span>
      <a href="${nextHash}" class="btn btn-primary">${nextLabel}</a>
    </div>
  `;
}







/**
 * Garante que qualquer digitação pendente no DOM seja sincronizada para o estado da tela ativa antes de salvar.
 */
export function sincronizarEstadoDaTelaAtiva(): void {
  if (typeof document === 'undefined') return;
  sincronizarIdentificacaoDoFormulario();
  sincronizarPertinenciaDoFormulario();
  sincronizarConformidadeDoFormulario();
  sincronizarRiscosDoFormulario();
  sincronizarResultadoDoFormulario();
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

  if (!isStage || normalizedHash === '#/' || normalizedHash === '#/painel') {
    // Painel Executivo da Análise Ativa (S3.6)
    mainHtml = `
      <main class="main-content">
        ${renderBarraPersistencia()}
        ${renderPainelScreen()}
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
    const papelAnterior = getPapelAtivo();
    // Se o papel ativo anterior permitia edição, sincroniza o estado antes de mudar para preservar digitações
    if (podeEditar()) {
      sincronizarEstadoDaTelaAtiva();
    }
    setPapelAtivo(novoPapel);
    registrarEventoLocal({
      acao: ACOES_AUDITORIA.TROCA_PAPEL,
      entidade: 'Usuario',
      registroId: novoPapel,
      antesDepois: {
        antes: papelAnterior,
        depois: novoPapel
      },
      descricao: `Perfil simulado alterado de ${papelAnterior} para ${novoPapel}`
    });
    renderRoute();
  });

  // Listener para abertura do modal da Trilha de Auditoria Local (S3.5)
  const btnAuditoria = document.getElementById('btn-ver-auditoria-global');
  btnAuditoria?.addEventListener('click', () => {
    abrirModalAuditoria();
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

      // Registra evento de salvamento de rascunho na trilha de auditoria local (S3.5)
      registrarEventoLocal({
        acao: ACOES_AUDITORIA.SALVAMENTO_RASCUNHO,
        entidade: 'Analise',
        registroId: getProcessoAtivo().numero || 'anl-local',
        antesDepois: {
          antes: ultimoSalvamentoTimestamp ? { salvoEm: ultimoSalvamentoTimestamp } : null,
          depois: { salvoEm: new Date().toISOString() }
        },
        descricao: `Rascunho da análise salvo no armazenamento local (${diagnosticoArmazenamento?.tipo || 'IndexedDB'})`
      });

      const res = await salvarRascunhoSessao();
      ultimoSalvamentoTimestamp = res.salvoEm;
      try {
        diagnosticoArmazenamento = await obterDiagnosticoArmazenamento();
      } catch {
        // Ignora
      }
      const el = document.getElementById('status-ultimo-salvamento');
      if (el) el.textContent = `Último salvamento: ${formatarCarimboSalvamento(res.salvoEm)}`;
      const btnAudit = document.getElementById('btn-ver-auditoria-global');
      if (btnAudit) btnAudit.textContent = `📜 Auditoria Local (${getEventosAtivos().length})`;
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
      if (recuperado.achados) {
        setAchadosAtivos(recuperado.achados);
      }
      if (recuperado.riscos) {
        setRiscosAtivos(recuperado.riscos);
      }
      if (recuperado.eventos) {
        setEventosAtivos(recuperado.eventos);
      }
      importarEstadoResultado({
        conclusaoValidada: recuperado.conclusaoValidada || null,
        validacaoHumana: recuperado.validacaoHumana || null,
        justificativaDivergencia: recuperado.justificativaDivergencia || '',
        observacoesAssessor: recuperado.observacoesAssessor || '',
        hashDadosEtapasAnteriores: recuperado.hashDadosEtapasAnteriores || '',
        necessitaNovaRevisaoConclusao: recuperado.necessitaNovaRevisaoConclusao || false,
        manifestacaoAnteriorInvalidada: recuperado.manifestacaoAnteriorInvalidada || null
      });
      ultimoSalvamentoTimestamp = recuperado.salvoEm;
      renderRoute();
      alert(`✅ Rascunho recuperado com sucesso do armazenamento local!\n\nProcesso: ${recuperado.processo.numero || '(Sem número)'}\nSalvo em: ${formatarCarimboSalvamento(recuperado.salvoEm)}\n\nTodas as informações das etapas e histórico de auditoria foram restaurados no navegador.`);
    } catch (e) {
      alert(`Erro ao recuperar rascunho do armazenamento: ${(e as Error).message}`);
    }
  });

  if (currentStage?.id === 'identificacao') {
    initIdentificacaoEvents(async () => {
      // Salva rascunho automaticamente ao avançar se permitido
      if (podeSalvarRascunho()) {
        sincronizarEstadoDaTelaAtiva();
        await salvarRascunhoSessao();
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
          await salvarRascunhoSessao();
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
          await salvarRascunhoSessao();
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

  if (currentStage?.id === 'achados') {
    initAchadosEvents(
      async () => {
        // Salva rascunho automaticamente ao avançar se permitido
        if (podeSalvarRascunho()) {
          sincronizarEstadoDaTelaAtiva();
          await salvarRascunhoSessao();
        }
        window.location.hash = '#/riscos';
      },
      () => {
        if (podeEditar()) {
          sincronizarEstadoDaTelaAtiva();
        }
        window.location.hash = '#/conformidade';
      }
    );

    // Intercepta o botão "Próximo →" inferior para acionar o avanço para riscos
    const nextBtn = document.querySelector('.stage-actions a.btn-primary');
    if (nextBtn) {
      nextBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (podeSalvarRascunho()) {
          sincronizarEstadoDaTelaAtiva();
          await salvarRascunhoSessao();
        }
        window.location.hash = '#/riscos';
      });
    }

    const prevBtn = document.querySelector('.stage-actions a.btn-secondary');
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (podeEditar()) {
          sincronizarEstadoDaTelaAtiva();
        }
        window.location.hash = '#/conformidade';
      });
    }
  }

  if (currentStage?.id === 'riscos') {
    initRiscosEvents(
      async () => {
        // Salva rascunho automaticamente ao avançar se permitido
        if (podeSalvarRascunho()) {
          sincronizarEstadoDaTelaAtiva();
          await salvarRascunhoSessao();
        }
        window.location.hash = '#/resultado';
      },
      () => {
        if (podeEditar()) {
          sincronizarEstadoDaTelaAtiva();
        }
        window.location.hash = '#/achados';
      }
    );

    // Intercepta o botão "Próximo →" inferior para acionar a validação de riscos antes de avançar
    const nextBtn = document.querySelector('.stage-actions a.btn-primary');
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const btnAvancar = document.getElementById('btn-avancar-resultado') as HTMLButtonElement | null;
        if (btnAvancar) {
          btnAvancar.click();
        } else {
          window.location.hash = '#/resultado';
        }
      });
    }

    const prevBtn = document.querySelector('.stage-actions a.btn-secondary');
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (podeEditar()) {
          sincronizarEstadoDaTelaAtiva();
        }
        window.location.hash = '#/achados';
      });
    }
  }

  if (currentStage?.id === 'resultado') {
    initResultadoEvents();

    const prevBtn = document.querySelector('.stage-actions a.btn-secondary');
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (podeEditar()) {
          sincronizarEstadoDaTelaAtiva();
        }
        window.location.hash = '#/riscos';
      });
    }
  }

  // Inicializa eventos do Painel Executivo quando ativo
  if (!isStage || normalizedHash === '#/' || normalizedHash === '#/painel') {
    initPainelEvents();
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
        if (recuperado.achados) {
          setAchadosAtivos(recuperado.achados);
        }
        if (recuperado.riscos) {
          setRiscosAtivos(recuperado.riscos);
        }
        if (recuperado.eventos) {
          setEventosAtivos(recuperado.eventos);
        }
        importarEstadoResultado({
          conclusaoValidada: recuperado.conclusaoValidada || null,
          validacaoHumana: recuperado.validacaoHumana || null,
          justificativaDivergencia: recuperado.justificativaDivergencia || '',
          observacoesAssessor: recuperado.observacoesAssessor || '',
          hashDadosEtapasAnteriores: recuperado.hashDadosEtapasAnteriores || '',
          necessitaNovaRevisaoConclusao: recuperado.necessitaNovaRevisaoConclusao || false,
          manifestacaoAnteriorInvalidada: recuperado.manifestacaoAnteriorInvalidada || null
        });
        ultimoSalvamentoTimestamp = recuperado.salvoEm;
      }
    } catch {
      // Falha não bloqueante na inicialização
    }
  }

  // Primeira renderização
  renderRoute();
}
