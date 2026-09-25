/**
 * CONFORMA GSASP — Tela da Etapa 3: Conformidade Documental e Jurídica
 * Implementação da Tarefa S2.3 (Sprint 2)
 * Base: docs/contexto.md (RN02, RN03, RN07, RN11, RN13) e docs/sprint.md
 */

import type { ItemConformidade, Condicionante, StatusConformidade, SituacaoCondicionante } from '../domain/tipos';
import {
  validarConformidade,
  formatarMoeda,
  type ResultadoValidacaoConformidade
} from '../domain/validacao';
import { getProcessoAtivo } from './identificacao';
import { getPertinenciaAtiva } from './pertinencia';
import { podeEditar, podeAdicionarRemoverItens, podeCarregarCenarios } from '../auth/papeis';

// Cenários didáticos determinísticos com dados estritamente fictícios
export const CENARIOS_CONFORMIDADE_DEMO: Record<string, { checklist: ItemConformidade[]; condicionantes: Condicionante[] }> = {
  'cenario-01': {
    checklist: [
      {
        id: 'chk-01-01',
        descricao: 'Parecer Jurídico Conclusivo ou Referencial',
        status: 'ok',
        observacao: 'Parecer PGE Fictício nº 101/2026 favorável com recomendações formais.',
        referenciaFonte: 'Peça 45'
      },
      {
        id: 'chk-01-02',
        descricao: 'Declaração de Dotação e Adequação Orçamentária',
        status: 'ok',
        observacao: 'Nota de Reserva Orçamentária nº 2026/001 anexada e atestada.',
        referenciaFonte: 'Peça 12'
      },
      {
        id: 'chk-01-03',
        descricao: 'Garantia Contratual da Execução',
        status: 'ok',
        observacao: 'Apólice de seguro-garantia devidamente apresentada e conferida.',
        referenciaFonte: 'Peça 50'
      },
      {
        id: 'chk-01-04',
        descricao: 'Certidões de Regularidade Fiscal e Trabalhista (CNDT)',
        status: 'ok',
        observacao: 'Todas as certidões com prazo de validade vigente na data da instrução.',
        referenciaFonte: 'Peça 30'
      },
      {
        id: 'chk-01-05',
        descricao: 'Designação Formal de Gestor e Fiscal do Contrato',
        status: 'ok',
        observacao: 'Portaria de designação de fiscal titular e substituto juntada aos autos.',
        referenciaFonte: 'Peça 55'
      },
      {
        id: 'chk-01-06',
        descricao: 'Estudo Técnico Preliminar e Termo de Referência',
        status: 'ok',
        observacao: 'ETP nº 04/2026 e TR devidamente aprovados pela autoridade competente.',
        referenciaFonte: 'Peça 05'
      }
    ],
    condicionantes: [
      {
        id: 'cond-01-01',
        descricao: 'Exigência de comprovação de seguro garantia no ato de assinatura.',
        referenciaParecer: 'Parecer PGE nº 101/2026, item 14',
        situacao: 'atendida',
        evidenciaAtendimento: 'Apólice de seguro-garantia anexada à Peça 50.',
        providencia: 'Atestar a conformidade da apólice no termo de recebimento.',
        responsavel: 'Setor de Contratos'
      },
      {
        id: 'cond-01-02',
        descricao: 'Certificação de disponibilidade de crédito orçamentário.',
        referenciaParecer: 'Parecer PGE nº 101/2026, item 18',
        situacao: 'atendida',
        evidenciaAtendimento: 'Nota de reserva orçamentária ratificada à Peça 12.',
        providencia: 'Proceder à emissão da nota de empenho ordinário após assinatura.',
        responsavel: 'Coordenadoria Financeira'
      }
    ]
  },
  'cenario-02': {
    checklist: [
      {
        id: 'chk-02-01',
        descricao: 'Parecer Jurídico Prévio da Prorrogação',
        status: 'ok',
        observacao: 'Parecer PGE Fictício nº 102/2026 aprovando a minuta do aditivo de prazo.',
        referenciaFonte: 'Peça 22'
      },
      {
        id: 'chk-02-02',
        descricao: 'Comprovação de Vantajosidade Econômica da Prorrogação',
        status: 'ok',
        observacao: 'Pesquisa de mercado demonstrando manutenção de preços vantajosos.',
        referenciaFonte: 'Peça 18'
      },
      {
        id: 'chk-02-03',
        descricao: 'Adequação Orçamentária Imediata',
        status: 'nao_aplicavel',
        justificativaNaoAplicavel: 'Termo aditivo restrito à dilatação temporal; dotação orçamentária referente ao exercício já empenhada.',
        observacao: 'Não gera impacto orçamentário novo neste exercício.',
        referenciaFonte: 'Despacho Financeiro Peça 20'
      },
      {
        id: 'chk-02-04',
        descricao: 'Regularidade Fiscal e Trabalhista da Contratada',
        status: 'ok',
        observacao: 'Certidões vigentes na data da instrução.',
        referenciaFonte: 'Peça 25'
      },
      {
        id: 'chk-02-05',
        descricao: 'Relatório de Desempenho e Fiscalização Contratual',
        status: 'ok',
        observacao: 'Parecer do fiscal atestando a regular execução dos serviços prestados.',
        referenciaFonte: 'Peça 16'
      }
    ],
    condicionantes: [
      {
        id: 'cond-02-01',
        descricao: 'Verificação de manutenção da regularidade fiscal e trabalhista na data exata da assinatura.',
        referenciaParecer: 'Parecer PGE nº 102/2026, item 9',
        situacao: 'em_cumprimento',
        evidenciaAtendimento: 'Certidões consultadas na emissão da minuta; nova extração programada para o ato de subscrição.',
        providencia: 'Fiscal deve juntar certidões atualizadas até 24h antes da assinatura.',
        responsavel: 'Gestor do Contrato'
      }
    ]
  },
  'cenario-03': {
    checklist: [
      {
        id: 'chk-03-01',
        descricao: 'Parecer Jurídico Referencial',
        status: 'ok',
        observacao: 'Parecer PGE Fictício nº 103/2026 com 2 condicionantes expressas.',
        referenciaFonte: 'Peça 34'
      },
      {
        id: 'chk-03-02',
        descricao: 'Comprovante de Prestação de Garantia Contratual Prévia',
        status: 'pendente',
        observacao: 'Comprovante de caução ou apólice de seguro não localizado no dossiê de contratação.',
        referenciaFonte: 'Peça 40 (Ausente)'
      },
      {
        id: 'chk-03-03',
        descricao: 'Certidão Negativa de Débitos Trabalhistas (CNDT)',
        status: 'confirmar',
        observacao: 'Certidão juntada venceu há 2 dias da data da montagem do processo.',
        referenciaFonte: 'Peça 29'
      },
      {
        id: 'chk-03-04',
        descricao: 'Designação de Fiscal e Gestor',
        status: 'ok',
        observacao: 'Designação indicada no corpo da minuta contratual.',
        referenciaFonte: 'Cláusula 15ª'
      },
      {
        id: 'chk-03-05',
        descricao: 'Declaração de Dotação e Adequação Orçamentária',
        status: 'ok',
        observacao: 'Reserva confirmada na dotação de serviços terceirizados.',
        referenciaFonte: 'Peça 20'
      }
    ],
    condicionantes: [
      {
        id: 'cond-03-01',
        descricao: 'Apresentação da garantia da execução contratual no percentual de 5% antes da formalização da assinatura.',
        referenciaParecer: 'Parecer PGE nº 103/2026, item 21',
        situacao: 'pendente',
        evidenciaAtendimento: 'Empresa ainda não protocolou o instrumento de garantia.',
        providencia: 'Intimar o fornecedor para apresentar o comprovante de garantia em até 3 dias úteis.',
        responsavel: 'Setor de Contratos'
      },
      {
        id: 'cond-03-02',
        descricao: 'Atualização das certidões de regularidade com validade expirada.',
        referenciaParecer: 'Parecer PGE nº 103/2026, item 23',
        situacao: 'pendente',
        evidenciaAtendimento: 'CNDT vencida no processo virtual.',
        providencia: 'Emitir CNDT atualizada via sítio do TST e anexar aos autos.',
        responsavel: 'Setor de Licitações'
      }
    ]
  },
  'cenario-04': {
    checklist: [
      {
        id: 'chk-04-01',
        descricao: 'Estudo Técnico Preliminar e Demonstração da Vantajosidade da Adesão',
        status: 'pendente',
        observacao: 'Falta justificativa da vantagem econômica da adesão frente à contratação própria.',
        referenciaFonte: 'Peça 10 (Ausente)'
      },
      {
        id: 'chk-04-02',
        descricao: 'Declaração de Dotação e Adequação Orçamentária',
        status: 'pendente',
        observacao: 'Certidão orçamentária ainda não ratificada pela área de planejamento e orçamento.',
        referenciaFonte: 'Peça 15'
      },
      {
        id: 'chk-04-03',
        descricao: 'Autorização do Órgão Gerenciador da Ata',
        status: 'ok',
        observacao: 'Ofício de anuência do órgão gerenciador anexado.',
        referenciaFonte: 'Peça 08'
      },
      {
        id: 'chk-04-04',
        descricao: 'Parecer Jurídico Específico de Adesão à Ata',
        status: 'confirmar',
        observacao: 'Parecer condicionado à juntada de pesquisa prévia de preços de mercado.',
        referenciaFonte: 'Peça 22'
      }
    ],
    condicionantes: [
      {
        id: 'cond-04-01',
        descricao: 'Comprovação da vantajosidade dos preços registrados frente ao mercado regional.',
        referenciaParecer: 'Parecer PGE nº 104/2026, item 12',
        situacao: 'pendente',
        evidenciaAtendimento: 'Inexistência de mapa de cotação comparativo nos autos.',
        providencia: 'Juntar cotações de preços de fornecedores locais.',
        responsavel: 'Área Demandante'
      }
    ]
  },
  'cenario-05': {
    checklist: [
      {
        id: 'chk-05-01',
        descricao: 'Caracterização da Situação Emergencial Concreta',
        status: 'pendente',
        observacao: 'Justificativa de urgência genérica, sem comprovação documental de risco iminente.',
        referenciaFonte: 'Peça 02'
      },
      {
        id: 'chk-05-02',
        descricao: 'Parecer Jurídico Específico de Dispensa',
        status: 'confirmar',
        observacao: 'Parecer jurídico alertou sobre necessidade de demonstração fática da emergência.',
        referenciaFonte: 'Peça 18'
      },
      {
        id: 'chk-05-03',
        descricao: 'Reserva Orçamentária para a Despesa Emergencial',
        status: 'pendente',
        observacao: 'Indicação de dotação sem saldo suficiente para o valor total estimado.',
        referenciaFonte: 'Peça 06'
      }
    ],
    condicionantes: [
      {
        id: 'cond-05-01',
        descricao: 'Justificativa circunstanciada da inviabilidade de realização de contratação regular.',
        referenciaParecer: 'Parecer Jurídico nº 99/2026, item 5',
        situacao: 'pendente',
        evidenciaAtendimento: 'Ausência de elementos que comprovem a impossibilidade de licitação.',
        providencia: 'Elaborar nota técnica circunstanciada justificando a emergência.',
        responsavel: 'Gabinete'
      }
    ]
  }
};

// Estado da conformidade em memória na sessão
let checklistAtivo: ItemConformidade[] = JSON.parse(JSON.stringify(CENARIOS_CONFORMIDADE_DEMO['cenario-01'].checklist));
let condicionantesAtivas: Condicionante[] = JSON.parse(JSON.stringify(CENARIOS_CONFORMIDADE_DEMO['cenario-01'].condicionantes));
let ultimoResultadoConformidade: ResultadoValidacaoConformidade | null = null;
let cenarioConformidadeSelecionadoId: string = 'cenario-01';

export function getChecklistAtivo(): ItemConformidade[] {
  return checklistAtivo;
}

export function setChecklistAtivo(items: ItemConformidade[]): void {
  checklistAtivo = JSON.parse(JSON.stringify(items));
}

export function getCondicionantesAtivas(): Condicionante[] {
  return condicionantesAtivas;
}

export function setCondicionantesAtivas(conds: Condicionante[]): void {
  condicionantesAtivas = JSON.parse(JSON.stringify(conds));
}

/**
 * Renderiza o resumo do processo ativo e a pertinência institucional.
 */
function renderContextoProcessoEPertinencia(): string {
  const p = getProcessoAtivo();
  const pert = getPertinenciaAtiva();

  let textoValor = '';
  if (p.valorNaoAplicavel) {
    textoValor = 'Não se aplica / Sem valor financeiro';
  } else if (p.valor !== null && p.valor !== undefined && !isNaN(p.valor)) {
    textoValor = formatarMoeda(p.valor);
  } else {
    textoValor = '(Valor não informado)';
  }

  let badgePertinencia = '';
  switch (pert.conclusao) {
    case 'PERTINENTE':
      badgePertinencia = '<span class="status-badge badge-ok">PERTINENTE</span>';
      break;
    case 'PERTINENTE_COM_JUSTIFICATIVA':
      badgePertinencia = '<span class="status-badge badge-warning">PERTINENTE COM JUSTIFICATIVA</span>';
      break;
    case 'NAO_DEMONSTRADA':
      badgePertinencia = '<span class="status-badge badge-danger">PERTINÊNCIA NÃO DEMONSTRADA</span>';
      break;
    case 'NAO_PERTINENTE':
      badgePertinencia = '<span class="status-badge badge-danger">NÃO PERTINENTE</span>';
      break;
    default:
      badgePertinencia = '<span class="status-badge badge-neutral">PENDENTE DE VALIDAÇÃO</span>';
  }

  return `
    <div class="processo-context-card" aria-label="Contexto do processo e pertinência">
      <div class="processo-context-header">
        <span class="processo-context-tag">Processo em Análise</span>
        <strong class="processo-context-numero">${p.numero || 'SESP-PRO-2026/00001'}</strong>
        <span class="processo-context-instrumento">${p.instrumento || 'Contrato'}</span>
        <div style="margin-left: auto;">
          <span style="font-size: 0.8rem; color: var(--text-muted); margin-right: 0.4rem;">Pertinência (Etapa 2):</span>
          ${badgePertinencia}
        </div>
      </div>
      <div class="processo-context-body">
        <div class="processo-context-row">
          <span class="context-label">Objeto:</span>
          <span class="context-value">${p.objeto || '(Objeto não preenchido)'}</span>
        </div>
        <div class="processo-context-grid">
          <div>
            <span class="context-label">Valor:</span>
            <span class="context-value highlight-value">${textoValor}</span>
          </div>
          <div>
            <span class="context-label">Regime:</span>
            <span class="context-value">${p.regimeJuridico || 'Lei nº 14.133/2021'}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza o painel executivo com as contagens estatísticas da conformidade.
 */
function renderQuadroEstatisticas(res: ResultadoValidacaoConformidade): string {
  const { estatisticas: s } = res;
  return `
    <div class="conformidade-kpi-grid" aria-label="Resumo dos itens de conformidade e condicionantes">
      <div class="conformidade-kpi-card kpi-ok">
        <span class="kpi-num">${s.itensOk}</span>
        <span class="kpi-label">Itens Conformes</span>
      </div>
      <div class="conformidade-kpi-card kpi-pendente">
        <span class="kpi-num">${s.itensPendentes}</span>
        <span class="kpi-label">Itens Pendentes</span>
      </div>
      <div class="conformidade-kpi-card kpi-confirmar">
        <span class="kpi-num">${s.itensConfirmar}</span>
        <span class="kpi-label">A Confirmar / Diligência</span>
      </div>
      <div class="conformidade-kpi-card kpi-nao-aplicavel">
        <span class="kpi-num">${s.itensNaoAplicaveis}</span>
        <span class="kpi-label">Não Aplicáveis</span>
      </div>
      <div class="conformidade-kpi-card kpi-condicionantes">
        <span class="kpi-num">${s.condicionantesPendentes} / ${s.totalCondicionantes}</span>
        <span class="kpi-label">Condicionantes Pendentes</span>
      </div>
    </div>
  `;
}

/**
 * Renderiza um item individual do checklist de instrução processual.
 */
function renderItemChecklistHtml(item: ItemConformidade, index: number, res: ResultadoValidacaoConformidade): string {
  const editable = podeEditar();
  const canAddRemove = podeAdicionarRemoverItens();
  const num = index + 1;
  const erroJustificativa = res.erros[`chk_${item.id}_justificativa`];
  const erroDescricao = res.erros[`chk_${item.id}_descricao`];
  const isNaoAplicavel = item.status === 'nao_aplicavel';

  return `
    <div class="checklist-item-card ${isNaoAplicavel ? 'is-nao-aplicavel' : ''}" id="card-item-${item.id}">
      <div class="checklist-item-header">
        <span class="checklist-item-num">${num}</span>
        <div class="checklist-item-title-group">
          <input 
            type="text" 
            name="chk_desc_${item.id}" 
            class="form-input item-desc-input" 
            value="${item.descricao}" 
            placeholder="Descrição do requisito ou documento..." 
            aria-label="Descrição do item ${num}"
            ${!editable ? 'disabled' : ''}
          />
          ${erroDescricao ? `<span class="field-error-text">${erroDescricao}</span>` : ''}
        </div>
        <button type="button" class="btn-remove-item" data-remove-chk="${item.id}" title="Remover este item do checklist" ${!canAddRemove ? 'disabled' : ''}>
          🗑️
        </button>
      </div>

      <div class="checklist-item-controls">
        <div class="status-selector-group" role="radiogroup" aria-label="Status do item ${num}">
          <label class="status-option-label ${item.status === 'ok' ? 'is-selected status-ok' : ''}">
            <input type="radio" name="chk_status_${item.id}" value="ok" ${item.status === 'ok' ? 'checked' : ''} ${!editable ? 'disabled' : ''} class="status-radio" />
            <span>✓ Conforme (OK)</span>
          </label>
          <label class="status-option-label ${item.status === 'pendente' ? 'is-selected status-pendente' : ''}">
            <input type="radio" name="chk_status_${item.id}" value="pendente" ${item.status === 'pendente' ? 'checked' : ''} ${!editable ? 'disabled' : ''} class="status-radio" />
            <span>✕ Pendente</span>
          </label>
          <label class="status-option-label ${item.status === 'confirmar' ? 'is-selected status-confirmar' : ''}">
            <input type="radio" name="chk_status_${item.id}" value="confirmar" ${item.status === 'confirmar' ? 'checked' : ''} ${!editable ? 'disabled' : ''} class="status-radio" />
            <span>? A Confirmar</span>
          </label>
          <label class="status-option-label ${item.status === 'nao_aplicavel' ? 'is-selected status-nao-aplicavel' : ''}">
            <input type="radio" name="chk_status_${item.id}" value="nao_aplicavel" ${item.status === 'nao_aplicavel' ? 'checked' : ''} ${!editable ? 'disabled' : ''} class="status-radio" />
            <span>⊘ Não Aplicável</span>
          </label>
        </div>

        <div class="checklist-item-fields">
          <div class="form-group flex-1">
            <label for="chk-fonte-${item.id}" class="form-label-small">Referência / Peça nos autos:</label>
            <input 
              type="text" 
              id="chk-fonte-${item.id}" 
              name="chk_fonte_${item.id}" 
              class="form-input form-input-small" 
              value="${item.referenciaFonte || ''}" 
              placeholder="Ex: Peça 12, Fls. 45-50..." 
              ${!editable ? 'disabled' : ''}
            />
          </div>

          <div class="form-group flex-2">
            <label for="chk-obs-${item.id}" class="form-label-small">Anotação / Observação do assessor:</label>
            <input 
              type="text" 
              id="chk-obs-${item.id}" 
              name="chk_obs_${item.id}" 
              class="form-input form-input-small" 
              value="${item.observacao || ''}" 
              placeholder="Ex: Parecer favorável com recomendações formais..." 
              ${!editable ? 'disabled' : ''}
            />
          </div>
        </div>

        <!-- Campo Obrigatório Condicional: Justificativa de Não Aplicabilidade (S2.3) -->
        <div class="justificativa-nao-aplicavel-box ${isNaoAplicavel ? '' : 'hidden'}" id="box-just-${item.id}">
          <label for="chk-just-${item.id}" class="form-label-small">
            <strong>Justificativa da Não Aplicabilidade <span class="required-indicator">*</span></strong> 
            (Obrigatória conforme critério de aceite da S2.3):
          </label>
          <textarea 
            id="chk-just-${item.id}" 
            name="chk_just_${item.id}" 
            class="form-textarea form-input-small ${erroJustificativa ? 'has-error' : ''}" 
            rows="2" 
            placeholder="Fundamente por que este requisito não se aplica a este processo específico..."
            ${!editable ? 'disabled' : ''}
          >${item.justificativaNaoAplicavel || ''}</textarea>
          ${erroJustificativa ? `<span class="field-error-text">${erroJustificativa}</span>` : ''}
        </div>

      </div>
    </div>
  `;
}

/**
 * Renderiza um item individual de Condicionante Jurídica.
 */
function renderItemCondicionanteHtml(cond: Condicionante, index: number, res: ResultadoValidacaoConformidade): string {
  const editable = podeEditar();
  const canAddRemove = podeAdicionarRemoverItens();
  const num = index + 1;
  const erroDescricao = res.erros[`cond_${cond.id}_descricao`];
  const erroReferencia = res.erros[`cond_${cond.id}_referencia`];
  const erroProvidencia = res.erros[`cond_${cond.id}_providencia`];

  return `
    <div class="condicionante-item-card" id="card-cond-${cond.id}">
      <div class="condicionante-item-header">
        <span class="condicionante-badge-num">Condicionante ${num}</span>
        <button type="button" class="btn-remove-item" data-remove-cond="${cond.id}" title="Remover esta condicionante" ${!canAddRemove ? 'disabled' : ''}>
          🗑️
        </button>
      </div>

      <div class="condicionante-body">
        <div class="form-group ${erroDescricao ? 'has-error' : ''}">
          <label for="cond-desc-${cond.id}" class="form-label-small">
            Descrição da Recomendação / Condicionante Jurídica <span class="required-indicator">*</span>:
          </label>
          <textarea 
            id="cond-desc-${cond.id}" 
            name="cond_desc_${cond.id}" 
            class="form-textarea form-input-small" 
            rows="2" 
            placeholder="Transcreva ou resuma a condicionante apontada no parecer jurídico..."
            ${!editable ? 'disabled' : ''}
          >${cond.descricao || ''}</textarea>
          ${erroDescricao ? `<span class="field-error-text">${erroDescricao}</span>` : ''}
        </div>

        <div class="form-row">
          <div class="form-group flex-1 ${erroReferencia ? 'has-error' : ''}">
            <label for="cond-ref-${cond.id}" class="form-label-small">
              Referência do Parecer <span class="required-indicator">*</span>:
            </label>
            <input 
              type="text" 
              id="cond-ref-${cond.id}" 
              name="cond_ref_${cond.id}" 
              class="form-input form-input-small" 
              value="${cond.referenciaParecer || ''}" 
              placeholder="Ex: Parecer PGE nº 101/2026, item 14" 
              ${!editable ? 'disabled' : ''}
            />
            ${erroReferencia ? `<span class="field-error-text">${erroReferencia}</span>` : ''}
          </div>

          <div class="form-group flex-1">
            <label for="cond-sit-${cond.id}" class="form-label-small">
              Situação do Atendimento <span class="required-indicator">*</span>:
            </label>
            <select id="cond-sit-${cond.id}" name="cond_sit_${cond.id}" class="form-select form-input-small cond-situacao-select" ${!editable ? 'disabled' : ''}>
              <option value="atendida" ${cond.situacao === 'atendida' ? 'selected' : ''}>Atendida / Cumprida</option>
              <option value="pendente" ${cond.situacao === 'pendente' ? 'selected' : ''}>Pendente de cumprimento</option>
              <option value="em_cumprimento" ${cond.situacao === 'em_cumprimento' ? 'selected' : ''}>Em cumprimento / Acompanhamento</option>
              <option value="nao_aplicavel" ${cond.situacao === 'nao_aplicavel' ? 'selected' : ''}>Não aplicável superveniente</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="cond-evid-${cond.id}" class="form-label-small">Evidência do Atendimento (Fato verificado nos autos):</label>
          <input 
            type="text" 
            id="cond-evid-${cond.id}" 
            name="cond_evid_${cond.id}" 
            class="form-input form-input-small" 
            value="${cond.evidenciaAtendimento || ''}" 
            placeholder="Ex: Apólice de seguro-garantia anexada à Peça 50 / Falta comprovante..." 
            ${!editable ? 'disabled' : ''}
          />
        </div>

        <div class="form-row">
          <div class="form-group flex-2 ${erroProvidencia ? 'has-error' : ''}">
            <label for="cond-prov-${cond.id}" class="form-label-small">
              Providência / Encaminhamento Necessário:
            </label>
            <input 
              type="text" 
              id="cond-prov-${cond.id}" 
              name="cond_prov_${cond.id}" 
              class="form-input form-input-small" 
              value="${cond.providencia || ''}" 
              placeholder="Ex: Intimar o fornecedor para apresentar comprovante em 48h..." 
              ${!editable ? 'disabled' : ''}
            />
            ${erroProvidencia ? `<span class="field-error-text">${erroProvidencia}</span>` : ''}
          </div>

          <div class="form-group flex-1">
            <label for="cond-resp-${cond.id}" class="form-label-small">Setor Responsável:</label>
            <input 
              type="text" 
              id="cond-resp-${cond.id}" 
              name="cond_resp_${cond.id}" 
              class="form-input form-input-small" 
              value="${cond.responsavel || ''}" 
              placeholder="Ex: Setor de Contratos / Licitações" 
              ${!editable ? 'disabled' : ''}
            />
          </div>
        </div>

      </div>
    </div>
  `;
}

/**
 * Renderiza a tela completa da Etapa 3: Conformidade Documental.
 */
export function renderConformidadeScreen(): string {
  const chk = checklistAtivo;
  const conds = condicionantesAtivas;
  const res = ultimoResultadoConformidade || validarConformidade(chk, conds);
  const editable = podeEditar();
  const canLoadScenarios = podeCarregarCenarios();
  const canAddRemove = podeAdicionarRemoverItens();

  return `
    <div class="stage-header">
      <h2 class="stage-title">3. Conformidade Documental e Jurídica</h2>
      <p class="stage-description">
        Conferência individualizada da instrução processual e verificação do atendimento às condicionantes jurídicas. 
        As pendências aqui identificadas fornecem subsídios estruturados para a caracterização de achados e riscos nas próximas etapas.
      </p>
    </div>

    ${!editable ? `
    <div class="readonly-banner" role="status" aria-label="Aviso de modo somente leitura">
      <span class="readonly-icon">🔒</span>
      <div>
        <strong>Modo de Consulta (Somente Leitura):</strong>
        <span>Os itens de checklist, condicionantes e apontamentos desta etapa estão desabilitados para o perfil ativo. Alterne para o perfil Editor/Assessor ou Administrador para preencher ou modificar itens.</span>
      </div>
    </div>
    ` : ''}

    <!-- Contexto do Processo e Pertinência -->
    ${renderContextoProcessoEPertinencia()}

    <!-- Aviso Metodológico Sem Presunção Jurídica -->
    <div class="info-callout" role="note">
      <span class="info-callout-icon">⚖️</span>
      <div>
        <strong>Aviso orientador (RN02 / RN07):</strong>
        <p>
          O checklist de instrução e as verificações aqui listadas possuem caráter demonstrativo e de apoio ao assessor. 
          A lista não afirma obrigação jurídica universal e o sistema <strong>não presume a conclusão jurídica definitiva</strong>, 
          a qual é de juízo privativo da autoridade competente e dos pareceres jurídicos dos autos.
        </p>
      </div>
    </div>

    <!-- Carga Rápida de Cenários Fictícios de Conformidade -->
    <div class="scenario-selector-box">
      <div class="scenario-selector-header">
        <div>
          <strong class="scenario-selector-title">Carga Rápida de Cenários Didáticos de Conformidade</strong>
          <p class="scenario-selector-desc">Teste processos regulares, com itens não aplicáveis justificados ou com condicionantes pendentes:</p>
        </div>
      </div>
      <div class="scenario-selector-controls">
        <select id="select-cenario-conformidade" class="form-select" aria-label="Selecione um cenário didático de conformidade" ${!canLoadScenarios ? 'disabled' : ''}>
          <option value="cenario-01" ${cenarioConformidadeSelecionadoId === 'cenario-01' ? 'selected' : ''}>
            Cenário 1 — Aquisição Regular (Todos os itens Conformes • Condicionantes atendidas)
          </option>
          <option value="cenario-02" ${cenarioConformidadeSelecionadoId === 'cenario-02' ? 'selected' : ''}>
            Cenário 2 — Aditivo de Prazo (Item orçamentário Não Aplicável com Justificativa)
          </option>
          <option value="cenario-03" ${cenarioConformidadeSelecionadoId === 'cenario-03' ? 'selected' : ''}>
            Cenário 3 — Pendência de Garantia e CNDT (2 Condicionantes pendentes de cumprimento)
          </option>
          <option value="cenario-04" ${cenarioConformidadeSelecionadoId === 'cenario-04' ? 'selected' : ''}>
            Cenário 4 — Adesão a Ata / Carona (ETP e dotação pendentes)
          </option>
          <option value="cenario-05" ${cenarioConformidadeSelecionadoId === 'cenario-05' ? 'selected' : ''}>
            Cenário 5 — Emergencial Inconsistente (Motivação e reserva orçamentária pendentes)
          </option>
          <option value="personalizado" ${cenarioConformidadeSelecionadoId === 'personalizado' ? 'selected' : ''}>
            [Personalizado] Limpar campos para preenchimento manual
          </option>
        </select>
        <button type="button" id="btn-carregar-cenario-conf" class="btn btn-secondary" ${!canLoadScenarios ? 'disabled' : ''}>Carregar Cenário</button>
      </div>
    </div>

    <!-- Painel de Indicadores de Conformidade -->
    ${renderQuadroEstatisticas(res)}

    <!-- Alerta Global de Erros de Preenchimento (RN13) -->
    <div id="alerta-conformidade-global" class="validation-summary-box ${res.valido ? 'hidden' : ''}" role="alert" aria-live="polite">
      <div class="validation-summary-header">
        <span class="validation-summary-icon">⚠️</span>
        <strong>Pendências de preenchimento nos itens de conformidade (RN13):</strong>
      </div>
      <ul class="validation-summary-list" id="lista-erros-conformidade">
        ${Object.entries(res.erros).map(([_, msg]) => `<li>${msg}</li>`).join('')}
      </ul>
    </div>

    <!-- Formulário Principal de Conformidade -->
    <form id="form-conformidade" class="form-identificacao" novalidate>

      <!-- Seção 1: Checklist de Instrução Processual -->
      <fieldset class="form-section">
        <div class="section-header-row">
          <div>
            <legend class="form-section-legend">1. Checklist de Instrução Processual</legend>
            <p class="form-section-intro">
              Verifique os documentos e requisitos formais. A não aplicabilidade deve ser expressamente justificada.
            </p>
          </div>
          <button type="button" id="btn-adicionar-item-chk" class="btn btn-secondary btn-small" ${!canAddRemove ? 'disabled' : ''}>
            + Adicionar Item
          </button>
        </div>

        <div class="checklist-items-container" id="checklist-container">
          ${chk.map((item, idx) => renderItemChecklistHtml(item, idx, res)).join('')}
        </div>
      </fieldset>

      <!-- Seção 2: Condicionantes Jurídicas de Pareceres Anteriores -->
      <fieldset class="form-section">
        <div class="section-header-row">
          <div>
            <legend class="form-section-legend">2. Condicionantes e Recomendações Jurídicas</legend>
            <p class="form-section-intro">
              Acompanhamento individualizado das condicionantes fixadas pela PGE ou assessoria jurídica antes da subscrição.
            </p>
          </div>
          <button type="button" id="btn-adicionar-condicionante" class="btn btn-secondary btn-small" ${!canAddRemove ? 'disabled' : ''}>
            + Adicionar Condicionante
          </button>
        </div>

        <div class="condicionantes-container" id="condicionantes-container">
          ${conds.length === 0 ? '<p class="empty-state-text">Nenhuma condicionante jurídica cadastrada neste processo.</p>' : ''}
          ${conds.map((cond, idx) => renderItemCondicionanteHtml(cond, idx, res)).join('')}
        </div>
      </fieldset>

      <!-- Barra de Ações -->
      <div class="form-actions-bar">
        <button type="button" id="btn-revalidar-conf" class="btn btn-secondary" title="Revalida regras de preenchimento">
          🔍 Validar Conformidade
        </button>
        <button type="button" id="btn-voltar-pertinencia" class="btn btn-secondary">
          ← Voltar à Pertinência
        </button>
        <button type="submit" id="btn-avancar-achados" class="btn btn-primary">
          Avançar para Achados →
        </button>
      </div>

    </form>
  `;
}

/**
 * Extrai os dados do checklist e condicionantes do DOM.
 */
export function extrairDadosDoFormularioConformidade(): { checklist: ItemConformidade[]; condicionantes: Condicionante[] } {
  if (!podeEditar()) {
    return { checklist: checklistAtivo, condicionantes: condicionantesAtivas };
  }

  const form = document.getElementById('form-conformidade') as HTMLFormElement | null;
  if (!form) return { checklist: checklistAtivo, condicionantes: condicionantesAtivas };

  const novosItens: ItemConformidade[] = [];
  checklistAtivo.forEach((item) => {
    const inputDesc = form.querySelector<HTMLInputElement>(`input[name="chk_desc_${item.id}"]`);
    const radioStatus = form.querySelector<HTMLInputElement>(`input[name="chk_status_${item.id}"]:checked`);
    const inputFonte = form.querySelector<HTMLInputElement>(`input[name="chk_fonte_${item.id}"]`);
    const inputObs = form.querySelector<HTMLInputElement>(`input[name="chk_obs_${item.id}"]`);
    const textareaJust = form.querySelector<HTMLTextAreaElement>(`textarea[name="chk_just_${item.id}"]`);

    const status = (radioStatus?.value as StatusConformidade) || item.status;

    novosItens.push({
      id: item.id,
      descricao: inputDesc ? inputDesc.value.trim() : (item.descricao || ''),
      status,
      referenciaFonte: inputFonte ? inputFonte.value.trim() : (item.referenciaFonte || ''),
      observacao: inputObs ? inputObs.value.trim() : (item.observacao || ''),
      justificativaNaoAplicavel: textareaJust ? textareaJust.value.trim() : (item.justificativaNaoAplicavel || '')
    });
  });

  const novasCondicionantes: Condicionante[] = [];
  condicionantesAtivas.forEach((cond) => {
    const textareaDesc = form.querySelector<HTMLTextAreaElement>(`textarea[name="cond_desc_${cond.id}"]`);
    const inputRef = form.querySelector<HTMLInputElement>(`input[name="cond_ref_${cond.id}"]`);
    const selectSit = form.querySelector<HTMLSelectElement>(`select[name="cond_sit_${cond.id}"]`);
    const inputEvid = form.querySelector<HTMLInputElement>(`input[name="cond_evid_${cond.id}"]`);
    const inputProv = form.querySelector<HTMLInputElement>(`input[name="cond_prov_${cond.id}"]`);
    const inputResp = form.querySelector<HTMLInputElement>(`input[name="cond_resp_${cond.id}"]`);

    const situacao = (selectSit?.value as SituacaoCondicionante) || cond.situacao;

    novasCondicionantes.push({
      id: cond.id,
      descricao: textareaDesc ? textareaDesc.value.trim() : (cond.descricao || ''),
      referenciaParecer: inputRef ? inputRef.value.trim() : (cond.referenciaParecer || ''),
      situacao,
      evidenciaAtendimento: inputEvid ? inputEvid.value.trim() : (cond.evidenciaAtendimento || ''),
      providencia: inputProv ? inputProv.value.trim() : (cond.providencia || ''),
      responsavel: inputResp ? inputResp.value.trim() : (cond.responsavel || '')
    });
  });

  return { checklist: novosItens, condicionantes: novasCondicionantes };
}

/**
 * Sincroniza o estado em memória da Conformidade com os valores presentes no formulário do DOM.
 */
export function sincronizarConformidadeDoFormulario(): { checklist: ItemConformidade[]; condicionantes: Condicionante[] } {
  const { checklist, condicionantes } = extrairDadosDoFormularioConformidade();
  checklistAtivo = checklist;
  condicionantesAtivas = condicionantes;
  return { checklist, condicionantes };
}

/**
 * Atualiza classes visuais e contagens dinâmicas no DOM sem recarregar a tela toda.
 */
function atualizarVisualConformidadeNoDom(): void {
  const { checklist, condicionantes } = extrairDadosDoFormularioConformidade();
  checklistAtivo = checklist;
  condicionantesAtivas = condicionantes;

  const res = validarConformidade(checklist, condicionantes);
  ultimoResultadoConformidade = res;

  // Atualiza caixas de justificativa de não aplicabilidade
  checklist.forEach((item) => {
    const boxJust = document.getElementById(`box-just-${item.id}`);
    const card = document.getElementById(`card-item-${item.id}`);
    if (boxJust) {
      if (item.status === 'nao_aplicavel') {
        boxJust.classList.remove('hidden');
        card?.classList.add('is-nao-aplicavel');
      } else {
        boxJust.classList.add('hidden');
        card?.classList.remove('is-nao-aplicavel');
      }
    }

    // Atualiza rótulo selecionado do rádio
    const form = document.getElementById('form-conformidade');
    const radios = form?.querySelectorAll<HTMLInputElement>(`input[name="chk_status_${item.id}"]`);
    radios?.forEach((r) => {
      const lbl = r.closest('.status-option-label');
      lbl?.classList.remove('is-selected', 'status-ok', 'status-pendente', 'status-confirmar', 'status-nao-aplicavel');
      if (r.checked) {
        lbl?.classList.add('is-selected');
        if (r.value === 'ok') lbl?.classList.add('status-ok');
        if (r.value === 'pendente') lbl?.classList.add('status-pendente');
        if (r.value === 'confirmar') lbl?.classList.add('status-confirmar');
        if (r.value === 'nao_aplicavel') lbl?.classList.add('status-nao-aplicavel');
      }
    });
  });

  // Atualiza KPIs
  const { estatisticas: s } = res;
  const setKpi = (cls: string, val: string | number) => {
    const el = document.querySelector(`.conformidade-kpi-card.${cls} .kpi-num`);
    if (el) el.textContent = String(val);
  };
  setKpi('kpi-ok', s.itensOk);
  setKpi('kpi-pendente', s.itensPendentes);
  setKpi('kpi-confirmar', s.itensConfirmar);
  setKpi('kpi-nao-aplicavel', s.itensNaoAplicaveis);
  setKpi('kpi-condicionantes', `${s.condicionantesPendentes} / ${s.totalCondicionantes}`);

  // Atualiza Alerta Global
  const alertaGlobal = document.getElementById('alerta-conformidade-global');
  const listaErros = document.getElementById('lista-erros-conformidade');
  if (alertaGlobal && listaErros) {
    if (res.valido) {
      alertaGlobal.classList.add('hidden');
      listaErros.innerHTML = '';
    } else {
      alertaGlobal.classList.remove('hidden');
      listaErros.innerHTML = Object.entries(res.erros).map(([_, msg]) => `<li>${msg}</li>`).join('');
    }
  }
}

/**
 * Inicializa os ouvintes de eventos da tela de Conformidade Documental.
 */
export function initConformidadeEvents(
  onNavegarAchados: () => void,
  onVoltarPertinencia: () => void
): void {
  const form = document.getElementById('form-conformidade') as HTMLFormElement | null;
  if (!form) return;

  // Sincronização em tempo real de digitação em qualquer campo (itens do checklist e condicionantes)
  form.addEventListener('input', () => {
    const { checklist, condicionantes } = extrairDadosDoFormularioConformidade();
    checklistAtivo = checklist;
    condicionantesAtivas = condicionantes;
  });

  // Ouvinte de alteração nos status do checklist e situações de condicionantes
  form.addEventListener('change', (e) => {
    const target = e.target as HTMLElement | null;
    if (target?.classList.contains('status-radio') || target?.classList.contains('cond-situacao-select')) {
      atualizarVisualConformidadeNoDom();
    }
  });

  // Seletor de Carga Rápida de Cenários
  const selectCenario = document.getElementById('select-cenario-conformidade') as HTMLSelectElement | null;
  const btnCarregar = document.getElementById('btn-carregar-cenario-conf');

  const aplicarCenario = () => {
    if (!podeCarregarCenarios()) {
      alert('ℹ️ O carregamento de cenários didáticos está desabilitado para o perfil ativo (somente consulta).');
      return;
    }

    const cenarioKey = selectCenario?.value || 'cenario-01';
    cenarioConformidadeSelecionadoId = cenarioKey;

    if (cenarioKey === 'personalizado') {
      checklistAtivo = [
        {
          id: 'chk-custom-01',
          descricao: 'Parecer Jurídico do Processo',
          status: 'confirmar',
          referenciaFonte: '',
          observacao: ''
        },
        {
          id: 'chk-custom-02',
          descricao: 'Dotação e Adequação Orçamentária',
          status: 'confirmar',
          referenciaFonte: '',
          observacao: ''
        }
      ];
      condicionantesAtivas = [];
    } else if (CENARIOS_CONFORMIDADE_DEMO[cenarioKey]) {
      const demo = CENARIOS_CONFORMIDADE_DEMO[cenarioKey];
      checklistAtivo = JSON.parse(JSON.stringify(demo.checklist));
      condicionantesAtivas = JSON.parse(JSON.stringify(demo.condicionantes));
    }

    ultimoResultadoConformidade = validarConformidade(checklistAtivo, condicionantesAtivas);

    // Re-renderiza o conteúdo da tela de conformidade
    const stageCard = document.querySelector('.stage-card');
    if (stageCard) {
      // Preserva os botões de navegação inferiores
      const navButtons = stageCard.querySelector('.stage-actions')?.outerHTML || '';
      stageCard.innerHTML = renderConformidadeScreen() + navButtons;
      initConformidadeEvents(onNavegarAchados, onVoltarPertinencia);
    }
  };

  selectCenario?.addEventListener('change', aplicarCenario);
  btnCarregar?.addEventListener('click', aplicarCenario);

  // Adicionar novo item ao checklist
  const btnAddChk = document.getElementById('btn-adicionar-item-chk');
  btnAddChk?.addEventListener('click', () => {
    if (!podeAdicionarRemoverItens()) {
      alert('ℹ️ A inclusão de novos itens está desabilitada para o perfil ativo.');
      return;
    }

    const { checklist, condicionantes } = extrairDadosDoFormularioConformidade();
    const novoId = `chk-${Date.now()}`;
    checklist.push({
      id: novoId,
      descricao: '',
      status: 'confirmar',
      referenciaFonte: '',
      observacao: ''
    });
    checklistAtivo = checklist;
    condicionantesAtivas = condicionantes;

    const stageCard = document.querySelector('.stage-card');
    if (stageCard) {
      const navButtons = stageCard.querySelector('.stage-actions')?.outerHTML || '';
      stageCard.innerHTML = renderConformidadeScreen() + navButtons;
      initConformidadeEvents(onNavegarAchados, onVoltarPertinencia);
    }
  });

  // Adicionar nova condicionante jurídica
  const btnAddCond = document.getElementById('btn-adicionar-condicionante');
  btnAddCond?.addEventListener('click', () => {
    if (!podeAdicionarRemoverItens()) {
      alert('ℹ️ A inclusão de novas condicionantes está desabilitada para o perfil ativo.');
      return;
    }

    const { checklist, condicionantes } = extrairDadosDoFormularioConformidade();
    const novoId = `cond-${Date.now()}`;
    condicionantes.push({
      id: novoId,
      descricao: '',
      referenciaParecer: '',
      situacao: 'pendente',
      evidenciaAtendimento: '',
      providencia: '',
      responsavel: ''
    });
    checklistAtivo = checklist;
    condicionantesAtivas = condicionantes;

    const stageCard = document.querySelector('.stage-card');
    if (stageCard) {
      const navButtons = stageCard.querySelector('.stage-actions')?.outerHTML || '';
      stageCard.innerHTML = renderConformidadeScreen() + navButtons;
      initConformidadeEvents(onNavegarAchados, onVoltarPertinencia);
    }
  });

  // Remover item do checklist ou condicionante
  form.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    const btnRemoveChk = target?.closest<HTMLButtonElement>('[data-remove-chk]');
    if (btnRemoveChk) {
      if (!podeAdicionarRemoverItens()) {
        alert('ℹ️ A exclusão de itens está desabilitada para o perfil ativo.');
        return;
      }

      const id = btnRemoveChk.getAttribute('data-remove-chk');
      const { checklist, condicionantes } = extrairDadosDoFormularioConformidade();
      checklistAtivo = checklist.filter((i) => i.id !== id);
      condicionantesAtivas = condicionantes;

      const stageCard = document.querySelector('.stage-card');
      if (stageCard) {
        const navButtons = stageCard.querySelector('.stage-actions')?.outerHTML || '';
        stageCard.innerHTML = renderConformidadeScreen() + navButtons;
        initConformidadeEvents(onNavegarAchados, onVoltarPertinencia);
      }
      return;
    }

    const btnRemoveCond = target?.closest<HTMLButtonElement>('[data-remove-cond]');
    if (btnRemoveCond) {
      if (!podeAdicionarRemoverItens()) {
        alert('ℹ️ A exclusão de condicionantes está desabilitada para o perfil ativo.');
        return;
      }

      const id = btnRemoveCond.getAttribute('data-remove-cond');
      const { checklist, condicionantes } = extrairDadosDoFormularioConformidade();
      checklistAtivo = checklist;
      condicionantesAtivas = condicionantes.filter((c) => c.id !== id);

      const stageCard = document.querySelector('.stage-card');
      if (stageCard) {
        const navButtons = stageCard.querySelector('.stage-actions')?.outerHTML || '';
        stageCard.innerHTML = renderConformidadeScreen() + navButtons;
        initConformidadeEvents(onNavegarAchados, onVoltarPertinencia);
      }
      return;
    }
  });

  // Botão "Validar Conformidade"
  const btnRevalidar = document.getElementById('btn-revalidar-conf');
  btnRevalidar?.addEventListener('click', () => {
    const { checklist, condicionantes } = extrairDadosDoFormularioConformidade();
    checklistAtivo = checklist;
    condicionantesAtivas = condicionantes;

    const res = validarConformidade(checklist, condicionantes);
    ultimoResultadoConformidade = res;
    atualizarVisualConformidadeNoDom();

    if (res.valido) {
      alert(`✅ Conformidade Documental validada!\n• ${res.estatisticas.itensOk} itens conformes\n• ${res.estatisticas.itensPendentes} pendentes\n• ${res.estatisticas.itensConfirmar} a confirmar\n• ${res.estatisticas.condicionantesPendentes} condicionantes pendentes`);
    }
  });

  // Botão "Voltar à Pertinência"
  const btnVoltar = document.getElementById('btn-voltar-pertinencia');
  btnVoltar?.addEventListener('click', () => {
    const { checklist, condicionantes } = extrairDadosDoFormularioConformidade();
    checklistAtivo = checklist;
    condicionantesAtivas = condicionantes;
    onVoltarPertinencia();
  });

  // Submissão do Formulário e Avanço para a Etapa 4 (Achados)
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!podeEditar()) {
      // Perfil somente leitura: navega diretamente sem validação de bloqueio
      onNavegarAchados();
      return;
    }

    const { checklist, condicionantes } = extrairDadosDoFormularioConformidade();
    checklistAtivo = checklist;
    condicionantesAtivas = condicionantes;

    const res = validarConformidade(checklist, condicionantes);
    ultimoResultadoConformidade = res;
    atualizarVisualConformidadeNoDom();

    if (!res.valido) {
      const alerta = document.getElementById('alerta-conformidade-global');
      alerta?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    onNavegarAchados();
  });
}
