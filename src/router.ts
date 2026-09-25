/**
 * CONFORMA GSASP — Sistema de Roteamento por Hash e Telas das Etapas
 * Implementação da tarefa S1.3 e S2.1
 */

import { renderIdentificacaoScreen, initIdentificacaoEvents } from './pages/identificacao';

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
  return `
    <header class="header">
      <div class="header-inner">
        <div>
          <a href="#/" class="brand-link" title="Voltar à tela inicial">
            <h1 class="brand-title">CONFORMA GSASP</h1>
          </a>
          <p class="brand-subtitle">Sistema de Conformidade e Apoio à Decisão &bull; GSASP/SESP-MT</p>
        </div>
        <div class="header-badge-container">
          <span class="badge-didatico">Protótipo didático — somente dados fictícios</span>
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
 * Renderiza a Etapa 2: Pertinência Institucional.
 */
function renderPertinenciaScreen(): string {
  return `
    <div class="stage-header">
      <h2 class="stage-title">2. Pertinência Institucional</h2>
      <p class="stage-description">
        Filtro prévio obrigatório (RN02). A simples conformidade jurídica ou disponibilidade financeira não comprovam, isoladamente, a pertinência do gasto público.
      </p>
    </div>

    <div class="preview-card">
      <h3 class="preview-title">Critérios avaliados nesta etapa:</h3>
      <ul class="preview-list">
        <li><strong>Competência e Necessidade:</strong> O objeto é de competência do órgão e estritamente necessário às suas finalidades?</li>
        <li><strong>Vínculo e Planejamento:</strong> A despesa está alinhada ao Plano Estratégico e às metas da SESP-MT?</li>
        <li><strong>Benefício ao Interesse Público:</strong> Os resultados esperados atendem concretamente à segurança pública?</li>
        <li><strong>Proporcionalidade e Economicidade:</strong> O custo estimado é proporcional ao benefício gerado?</li>
      </ul>
      <p class="preview-status">Status da visualização: Estrutura navegável preparada para receber os controles de validação na Sprint 2.</p>
    </div>
  `;
}

/**
 * Renderiza a Etapa 3: Conformidade Documental.
 */
function renderConformidadeScreen(): string {
  return `
    <div class="stage-header">
      <h2 class="stage-title">3. Conformidade Documental e Jurídica</h2>
      <p class="stage-description">
        Verificação do checklist instrucional do processo e conferência individualizada do atendimento de condicionantes estabelecidas pela PGE ou assessoria jurídica.
      </p>
    </div>

    <div class="preview-card">
      <h3 class="preview-title">Itens do checklist e condicionantes:</h3>
      <ul class="preview-list">
        <li><strong>Parecer Jurídico:</strong> Existência de parecer referencial ou específico aprovado.</li>
        <li><strong>Condicionantes:</strong> Verificação explícita de cumprimento de cada recomendação jurídica antes do envio para assinatura.</li>
        <li><strong>Instrução Formal:</strong> Dotação orçamentária, nota de empenho, garantia contratual e designação de fiscal e gestor.</li>
      </ul>
      <p class="preview-status">Status da visualização: Estrutura navegável preparada para receber a lista interativa de itens na Sprint 2.</p>
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

  // Inicializa eventos específicos da etapa
  if (currentStage?.id === 'identificacao') {
    initIdentificacaoEvents(() => {
      window.location.hash = '#/pertinencia';
    });

    // Intercepta o botão "Próximo →" inferior para acionar a validação antes de avançar
    const nextBtn = document.querySelector('.stage-actions a.btn-primary');
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const form = document.getElementById('form-identificacao') as HTMLFormElement | null;
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
 * Inicializa os ouvintes do roteador.
 */
export function initRouter(): void {
  window.addEventListener('hashchange', renderRoute);
  // Primeira renderização
  renderRoute();
}
