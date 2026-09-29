/**
 * CONFORMA GSASP — Trilha de Auditoria Local e Histórico de Eventos (S3.5)
 * Base: docs/contexto.md (Seção 5 - EventoLocal, Seção 10), docs/sprint.md e docs/regras-funcionais.md
 * 
 * Princípios de Governança:
 * 1. O histórico é estritamente local e demonstrativo (associado ao rascunho da análise no IndexedDB).
 * 2. Transparência explícita: não há garantia de inviolabilidade criptográfica, fé pública ou validade institucional corporativa (SIGADOC/SEI).
 * 3. Imutabilidade na interface: a interface NÃO oferece edição, exclusão individual ou adulteração de eventos.
 * 4. Não duplicação em carregamentos: renderizações e inicializações de tela (F5) não geram eventos espúrios.
 * 5. Registros rastreiam criação, edição, validações, alterações de papéis, riscos e diffs de antes/depois relevantes.
 */

import type { EventoLocal, PapelUsuario } from '../domain/tipos.ts';
import { getPapelAtivo, getInfoPapelAtivo } from '../auth/papeis.ts';

/**
 * Aviso mandatório de governança sobre a natureza local e demonstrativa da auditoria.
 */
export const AVISO_AUDITORIA_LOCAL =
  '📜 Histórico de eventos local e demonstrativo: os registros desta trilha são mantidos exclusivamente no armazenamento ' +
  'deste navegador (IndexedDB) para fins didáticos de conferência e transparência processual. Não possuem garantia de ' +
  'inviolabilidade criptográfica, fé pública ou validade como trilha de auditoria corporativa institucional (SIGADOC/SEI).';

/**
 * Catálogo de ações rastreadas pela auditoria local.
 */
export const ACOES_AUDITORIA = {
  CRIACAO_ANALISE: 'CRIACAO_ANALISE',
  SALVAMENTO_RASCUNHO: 'SALVAMENTO_RASCUNHO',
  VALIDACAO_ACHADO: 'VALIDACAO_ACHADO',
  ALTERACAO_CLASSIFICACAO_ACHADO: 'ALTERACAO_CLASSIFICACAO_ACHADO',
  REJEICAO_ACHADO: 'REJEICAO_ACHADO',
  REABERTURA_ACHADO: 'REABERTURA_ACHADO',
  INCLUSAO_ACHADO_MANUAL: 'INCLUSAO_ACHADO_MANUAL',
  EXCLUSAO_ACHADO_MANUAL: 'EXCLUSAO_ACHADO_MANUAL',
  ATRIBUICAO_NIVEL_RISCO: 'ATRIBUICAO_NIVEL_RISCO',
  VINCULACAO_ACHADO_RISCO: 'VINCULACAO_ACHADO_RISCO',
  DESVINCULACAO_ACHADO_RISCO: 'DESVINCULACAO_ACHADO_RISCO',
  CARGA_CENARIO_RISCOS: 'CARGA_CENARIO_RISCOS',
  TROCA_PAPEL: 'TROCA_PAPEL',
  VALIDACAO_CONCLUSAO: 'VALIDACAO_CONCLUSAO',
  DIVERGENCIA_CONCLUSAO: 'DIVERGENCIA_CONCLUSAO',
  REABERTURA_CONCLUSAO: 'REABERTURA_CONCLUSAO'
} as const;

export type TipoAcaoAuditoria = typeof ACOES_AUDITORIA[keyof typeof ACOES_AUDITORIA] | string;

/**
 * Estrutura de parâmetros para registrar um evento de auditoria local.
 */
export interface ParametrosRegistroEvento {
  acao: TipoAcaoAuditoria;
  entidade: string;
  registroId: string;
  antesDepois?: {
    antes: unknown;
    depois: unknown;
  };
  descricao?: string;
  usuarioFicticio?: string;
  papel?: PapelUsuario;
  dataHora?: string;
  id?: string;
}

// Estado em memória dos eventos associados à análise ativa
let eventosAtivos: EventoLocal[] = [];

/**
 * Retorna uma cópia dos eventos de auditoria registrados na análise ativa.
 */
export function getEventosAtivos(): EventoLocal[] {
  return [...eventosAtivos];
}

/**
 * Define ou restaura a lista de eventos de auditoria da análise ativa.
 */
export function setEventosAtivos(eventos: EventoLocal[]): void {
  if (Array.isArray(eventos)) {
    eventosAtivos = [...eventos];
  } else {
    eventosAtivos = [];
  }
}

/**
 * Limpa todos os eventos em memória (utilizado em reinicializações de teste ou novas análises).
 */
export function limparEventosAtivos(): void {
  eventosAtivos = [];
}

/**
 * Cria um objeto EventoLocal de forma pura (sem efeitos colaterais na lista ativa).
 */
export function criarEventoLocal(params: ParametrosRegistroEvento): EventoLocal {
  const papel = params.papel || getPapelAtivo();
  const infoPapel = getInfoPapelAtivo();
  const usuario = params.usuarioFicticio || infoPapel.nome;
  const agoraIso = params.dataHora || new Date().toISOString();
  const id = params.id || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  return {
    id,
    dataHora: agoraIso,
    usuarioFicticio: usuario,
    papel,
    acao: params.acao,
    entidade: params.entidade,
    registroId: params.registroId,
    antesDepois: params.antesDepois,
    descricao: params.descricao
  };
}

/**
 * Registra um novo evento na trilha de auditoria local da análise ativa.
 * Retorna o evento recém-criado.
 */
export function registrarEventoLocal(params: ParametrosRegistroEvento): EventoLocal {
  const novoEvento = criarEventoLocal(params);
  eventosAtivos.push(novoEvento);
  return novoEvento;
}

/**
 * Formata um timestamp ISO em data e hora legíveis no formato brasileiro.
 */
export function formatarDataHoraEvento(isoDate: string): string {
  if (!isoDate) return 'Data não informada';
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const seg = String(d.getSeconds()).padStart(2, '0');
    return `${dia}/${mes}/${ano} às ${hora}:${min}:${seg}`;
  } catch {
    return isoDate;
  }
}

/**
 * Retorna metadados visuais para cada ação de auditoria (título amigável, ícone e classe CSS de badge).
 */
export function obterMetadadosAcao(acao: string): { titulo: string; icone: string; classeBadge: string } {
  switch (acao) {
    case ACOES_AUDITORIA.SALVAMENTO_RASCUNHO:
      return { titulo: 'Salvamento de Rascunho', icone: '💾', classeBadge: 'badge-audit-save' };
    case ACOES_AUDITORIA.VALIDACAO_ACHADO:
      return { titulo: 'Validação de Achado', icone: '✅', classeBadge: 'badge-audit-validate' };
    case ACOES_AUDITORIA.ALTERACAO_CLASSIFICACAO_ACHADO:
      return { titulo: 'Alteração de Gravidade', icone: '🔄', classeBadge: 'badge-audit-modify' };
    case ACOES_AUDITORIA.REJEICAO_ACHADO:
      return { titulo: 'Rejeição de Achado', icone: '❌', classeBadge: 'badge-audit-reject' };
    case ACOES_AUDITORIA.REABERTURA_ACHADO:
      return { titulo: 'Reabertura para Revisão', icone: '↩️', classeBadge: 'badge-audit-reopen' };
    case ACOES_AUDITORIA.INCLUSAO_ACHADO_MANUAL:
      return { titulo: 'Inclusão de Achado Manual', icone: '➕', classeBadge: 'badge-audit-add' };
    case ACOES_AUDITORIA.EXCLUSAO_ACHADO_MANUAL:
      return { titulo: 'Exclusão de Achado Manual', icone: '🗑️', classeBadge: 'badge-audit-remove' };
    case ACOES_AUDITORIA.ATRIBUICAO_NIVEL_RISCO:
      return { titulo: 'Avaliação de Risco', icone: '🎯', classeBadge: 'badge-audit-risk' };
    case ACOES_AUDITORIA.VINCULACAO_ACHADO_RISCO:
      return { titulo: 'Vínculo de Achado a Risco', icone: '🔗', classeBadge: 'badge-audit-link' };
    case ACOES_AUDITORIA.DESVINCULACAO_ACHADO_RISCO:
      return { titulo: 'Desvinculação de Achado', icone: '⛓️‍💥', classeBadge: 'badge-audit-unlink' };
    case ACOES_AUDITORIA.CARGA_CENARIO_RISCOS:
      return { titulo: 'Carga de Cenário de Riscos', icone: '📋', classeBadge: 'badge-audit-scenario' };
    case ACOES_AUDITORIA.TROCA_PAPEL:
      return { titulo: 'Alternância de Perfil Didático', icone: '👤', classeBadge: 'badge-audit-role' };
    case ACOES_AUDITORIA.CRIACAO_ANALISE:
      return { titulo: 'Criação da Análise', icone: '📄', classeBadge: 'badge-audit-create' };
    case ACOES_AUDITORIA.VALIDACAO_CONCLUSAO:
      return { titulo: 'Validação da Conclusão Executiva', icone: '⚖️', classeBadge: 'badge-audit-validate' };
    case ACOES_AUDITORIA.DIVERGENCIA_CONCLUSAO:
      return { titulo: 'Divergência Registrada pelo Assessor', icone: '⚠️', classeBadge: 'badge-audit-modify' };
    case ACOES_AUDITORIA.REABERTURA_CONCLUSAO:
      return { titulo: 'Reabertura da Conclusão para Revisão', icone: '↩️', classeBadge: 'badge-audit-reopen' };
    default:
      return { titulo: acao, icone: '📌', classeBadge: 'badge-audit-default' };
  }
}

/**
 * Formata os detalhes de antes/depois para exibição amigável e inspecionável.
 */
export function formatarAntesDepois(antesDepois?: { antes: unknown; depois: unknown }): string {
  if (!antesDepois) return '';
  const { antes, depois } = antesDepois;

  const serializar = (val: unknown): string => {
    if (val === null || val === undefined) return '<em>(nenhum / não definido)</em>';
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
      return `<code>${escapeHtml(String(val))}</code>`;
    }
    try {
      return `<pre class="audit-diff-pre">${escapeHtml(JSON.stringify(val, null, 2))}</pre>`;
    } catch {
      return `<code>${escapeHtml(String(val))}</code>`;
    }
  };

  return `
    <div class="audit-diff-container">
      <div class="audit-diff-col">
        <span class="audit-diff-label">Estado Anterior:</span>
        <div class="audit-diff-val">${serializar(antes)}</div>
      </div>
      <div class="audit-diff-col">
        <span class="audit-diff-label">Novo Estado:</span>
        <div class="audit-diff-val">${serializar(depois)}</div>
      </div>
    </div>
  `;
}

/**
 * Escapa strings para renderização segura em HTML.
 */
function escapeHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Renderiza o card individual de um evento na trilha de auditoria.
 * NOTA DE SEGURANÇA: Não contém botões para edição ou exclusão do registro.
 */
export function renderCardEvento(evento: EventoLocal, index: number): string {
  const meta = obterMetadadosAcao(evento.acao);
  const dataFormatada = formatarDataHoraEvento(evento.dataHora);
  const temDiff = Boolean(evento.antesDepois);

  return `
    <article class="audit-card" data-event-id="${escapeHtml(evento.id)}" aria-label="Evento ${index + 1}: ${escapeHtml(meta.titulo)}">
      <header class="audit-card-header">
        <div class="audit-card-badge-row">
          <span class="audit-badge ${meta.classeBadge}">
            <span class="audit-icon">${meta.icone}</span>
            <strong>${escapeHtml(meta.titulo)}</strong>
          </span>
          <time class="audit-timestamp" datetime="${escapeHtml(evento.dataHora)}">
            🕒 ${escapeHtml(dataFormatada)}
          </time>
        </div>
        <div class="audit-meta-row">
          <span class="audit-meta-item">
            <strong>Entidade:</strong> ${escapeHtml(evento.entidade)} [<code>${escapeHtml(evento.registroId)}</code>]
          </span>
          <span class="audit-meta-item">
            <strong>Usuário:</strong> ${escapeHtml(evento.usuarioFicticio)} (${escapeHtml(evento.papel)})
          </span>
        </div>
      </header>

      ${evento.descricao ? `
        <div class="audit-card-body">
          <p class="audit-description">${escapeHtml(evento.descricao)}</p>
        </div>
      ` : ''}

      ${temDiff ? `
        <details class="audit-diff-details">
          <summary class="audit-diff-summary">🔍 Inspecionar detalhes da alteração (Antes / Depois)</summary>
          ${formatarAntesDepois(evento.antesDepois)}
        </details>
      ` : ''}
    </article>
  `;
}

/**
 * Renderiza o modal completo da Trilha de Auditoria Local com o aviso de governança e a lista imutável de eventos.
 */
export function renderModalAuditoria(eventosCustom?: EventoLocal[]): string {
  const lista = eventosCustom || getEventosAtivos();
  // Ordena cronologicamente inverso (mais recente no topo)
  const eventosInversos = [...lista].reverse();

  return `
    <div id="modal-auditoria-backdrop" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-auditoria-title">
      <div class="modal-dialog modal-dialog-auditoria">
        <header class="modal-header">
          <div class="modal-title-group">
            <h2 id="modal-auditoria-title" class="modal-title">
              📜 Trilha de Auditoria e Histórico Local
            </h2>
            <span class="badge badge-info">${lista.length} evento(s) registrado(s)</span>
          </div>
          <button type="button" id="btn-fechar-modal-auditoria" class="modal-btn-close" aria-label="Fechar janela de auditoria">
            ✕ Fechar
          </button>
        </header>

        <div class="modal-body">
          <div class="audit-disclaimer-banner" role="alert">
            <div class="audit-disclaimer-icon">⚠️</div>
            <div class="audit-disclaimer-content">
              <strong>Aviso de Governança — Trilha Local Demonstrativa:</strong>
              <p>${AVISO_AUDITORIA_LOCAL}</p>
            </div>
          </div>

          <div class="audit-summary-bar">
            <span><strong>Análise Local Ativa</strong></span>
            <span>Registros ordenados do mais recente para o mais antigo.</span>
            <span class="audit-immutable-notice">🔒 Registros protegidos contra edição individual.</span>
          </div>

          <div class="audit-stream" role="feed" aria-label="Lista de eventos de auditoria local">
            ${eventosInversos.length === 0 ? `
              <div class="audit-empty-state">
                <span class="audit-empty-icon">📭</span>
                <p><strong>Nenhum evento registrado até o momento.</strong></p>
                <p class="text-muted">Ações de validação, alteração de gravidade, rejeição de achados, riscos e salvamento de rascunhos serão registradas automaticamente aqui.</p>
              </div>
            ` : `
              ${eventosInversos.map((evt, idx) => renderCardEvento(evt, idx)).join('')}
            `}
          </div>
        </div>

        <footer class="modal-footer">
          <p class="modal-footer-hint">Para preservar o histórico em sua sessão, salve o rascunho através da barra de persistência.</p>
          <button type="button" id="btn-fechar-modal-auditoria-footer" class="btn btn-primary">
            Concluir Consulta
          </button>
        </footer>
      </div>
    </div>
  `;
}

/**
 * Abre o modal de auditoria na tela atual.
 */
export function abrirModalAuditoria(): void {
  const containerId = 'container-modal-auditoria-global';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }

  container.innerHTML = renderModalAuditoria();

  // Configura ouvintes para fechamento
  const fechar = () => {
    fecharModalAuditoria();
  };

  document.getElementById('btn-fechar-modal-auditoria')?.addEventListener('click', fechar);
  document.getElementById('btn-fechar-modal-auditoria-footer')?.addEventListener('click', fechar);

  // Fecha ao clicar fora do diálogo
  const backdrop = document.getElementById('modal-auditoria-backdrop');
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      fechar();
    }
  });

  // Fecha com a tecla Escape
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      fechar();
      window.removeEventListener('keydown', onKeyDown);
    }
  };
  window.addEventListener('keydown', onKeyDown);
}

/**
 * Fecha o modal de auditoria se estiver aberto.
 */
export function fecharModalAuditoria(): void {
  const container = document.getElementById('container-modal-auditoria-global');
  if (container) {
    container.innerHTML = '';
  }
}
