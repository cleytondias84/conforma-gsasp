/**
 * CONFORMA GSASP — Tela da Etapa 4: Apontamento e Validação de Achados (Sprint 3 — S3.3)
 *
 * Base: docs/contexto.md (RN03, RN04, RN05, RN06, RN07, RN10, RN11),
 *       docs/sprint.md (S3.3) e docs/regras-funcionais.md
 *
 * Princípios de Governança:
 * 1. O sistema confere e organiza; o assessor valida e a autoridade decide (RN02, RN07).
 * 2. Toda sugestão nasce como 'SUGESTAO_SISTEMA' rotulada ostensivamente:
 *    "SUGESTÃO DO SISTEMA — PENDENTE DE VALIDAÇÃO HUMANA" (RN05).
 * 3. Validação humana explícita gera o rótulo "ACHADO VALIDADO" (RN06).
 * 4. Permite rejeição fundamentada com justificativa obrigatória e registro local (RN06).
 * 5. Ao reexecutar o motor, evita duplicidades e preserva revisões humanas anteriores.
 * 6. Se os dados de origem mudarem após a validação, sinaliza necessidade de nova revisão (RN10).
 * 7. Separação visual estrita entre:
 *    - Alertas de Instrução / Preenchimento Incompleto (RN11)
 *    - Divergências com Juízo Humano da Pertinência (RN02/RN07)
 *    - Apontamentos e Sugestões de Achados de Conformidade (RN03/RN04)
 * 8. Ausência de achados pelo motor NÃO significa aptidão automática para assinatura (RN11).
 * 9. Perfis em modo somente leitura (Leitor / Aprovador) consultam sem permissão de alteração.
 */

import type {
  Achado,
  ClassificacaoAchado,
  EstadoValidacaoAchado
} from '../domain/tipos.ts';

import {
  executarMotorRegras,
  type ResultadoMotorRegras,
  type DivergenciaHumana,
  type AlertaInstrucao
} from '../domain/regras.ts';

import { formatarMoeda, formatarDataBR } from '../domain/validacao.ts';

import { getProcessoAtivo } from './identificacao.ts';
import { getPertinenciaAtiva } from './pertinencia.ts';
import { getChecklistAtivo, getCondicionantesAtivas } from './conformidade.ts';
import { podeEditar } from '../auth/papeis.ts';
import { registrarEventoLocal, ACOES_AUDITORIA } from '../services/auditoria.ts';

// Estendemos o Achado para fins de controle de governança da interface
export interface AchadoComMetadados extends Achado {
  necessitaNovaRevisao?: boolean;
  origemManual?: boolean;
  evidenciaAoValidar?: string;
}

// Estado em memória dos achados e diagnóstico
let achadosAtivos: AchadoComMetadados[] = [];
let divergenciasAtivas: DivergenciaHumana[] = [];
let alertasInstrucaoAtivos: AlertaInstrucao[] = [];
let formularioManualAberto = false;
let itemEmEdicaoClassificacaoId: string | null = null;
let itemEmRejeicaoId: string | null = null;

// ==========================================
// 1. GETTERS E SETTERS DE ESTADO
// ==========================================

export function getAchadosAtivos(): AchadoComMetadados[] {
  return achadosAtivos;
}

export function setAchadosAtivos(achados: Achado[]): void {
  achadosAtivos = achados.map((a) => ({
    ...a,
    classificacaoSugerida: a.classificacaoSugerida ?? null,
    classificacao: a.classificacao ?? null,
    classificacaoValidada: a.classificacaoValidada ?? null
  }));
}

export function getDivergenciasAtivas(): DivergenciaHumana[] {
  return divergenciasAtivas;
}

export function getAlertasInstrucaoAtivos(): AlertaInstrucao[] {
  return alertasInstrucaoAtivos;
}

// ==========================================
// 2. SINCRONIZAÇÃO COM O MOTOR DE REGRAS (S3.2)
// ==========================================

/**
 * Executa o motor sobre o estado consolidado das etapas 1, 2 e 3,
 * mesclando achados novos com revisões humanas já existentes (sem duplicidades).
 */
export function sincronizarAchadosComMotor(): ResultadoMotorRegras {
  const processo = getProcessoAtivo();
  const pertinencia = getPertinenciaAtiva();
  const checklist = getChecklistAtivo();
  const condicionantes = getCondicionantesAtivas();

  const resultado = executarMotorRegras({
    processo,
    pertinencia,
    checklist,
    condicionantes
  });

  divergenciasAtivas = [...resultado.divergencias];
  alertasInstrucaoAtivos = [...resultado.alertasInstrucao];

  // Mapa de achados anteriores indexados por regraId ou id
  const mapaExistentes = new Map<string, AchadoComMetadados>();
  const manuais: AchadoComMetadados[] = [];

  for (const a of achadosAtivos) {
    if (a.origemManual || a.regraId === 'MANUAL') {
      manuais.push(a);
    } else {
      const chave = a.regraId || a.id;
      mapaExistentes.set(chave, a);
    }
  }

  const novosConsolidados: AchadoComMetadados[] = [];

  // Itera sobre as sugestões geradas pelo motor da S3.2
  for (const gerado of resultado.achados) {
    const chave = gerado.regraId || gerado.id;
    const existente = mapaExistentes.get(chave);

    if (existente) {
      // PRESERVAÇÃO DA REVISÃO HUMANA ANTERIOR (Diretiva 5)
      let necessitaNovaRevisao = existente.necessitaNovaRevisao || false;

      // Se o assessor já havia validado, mas os dados de origem nos autos mudaram (RN10)
      if (
        existente.estadoValidacao === 'VALIDADO' &&
        existente.evidenciaAoValidar &&
        existente.evidenciaAoValidar !== gerado.evidencia
      ) {
        necessitaNovaRevisao = true;
      }

      novosConsolidados.push({
        ...gerado,
        id: existente.id,
        estadoValidacao: existente.estadoValidacao,
        classificacaoValidada: existente.classificacaoValidada ?? null,
        classificacao: existente.classificacaoValidada ?? existente.classificacao ?? gerado.classificacaoSugerida,
        justificativaRejeicao: existente.justificativaRejeicao,
        evidenciaAoValidar: existente.evidenciaAoValidar,
        necessitaNovaRevisao
      });
      mapaExistentes.delete(chave);
    } else {
      // Nova sugestão identificada pelo motor
      novosConsolidados.push({
        ...gerado,
        estadoValidacao: 'SUGESTAO_SISTEMA',
        classificacaoValidada: null,
        necessitaNovaRevisao: false
      });
    }
  }

  // Preserva os achados manuais criados pelo assessor
  novosConsolidados.push(...manuais);

  achadosAtivos = novosConsolidados;

  return resultado;
}

// ==========================================
// 3. AÇÕES DE REVISÃO HUMANA (RN05, RN06, RN10)
// ==========================================

export function validarAchado(id: string, classificacaoEscolhida?: ClassificacaoAchado): boolean {
  const item = achadosAtivos.find((a) => a.id === id);
  if (!item) return false;

  const estadoAnterior = {
    estadoValidacao: item.estadoValidacao,
    classificacao: item.classificacao
  };

  const gravidadeFinal =
    classificacaoEscolhida || item.classificacaoValidada || item.classificacaoSugerida;

  if (!gravidadeFinal) {
    // Se a regra não sugeriu gravidade e o assessor não escolheu uma, requer seleção explícita
    return false;
  }

  item.estadoValidacao = 'VALIDADO';
  item.classificacaoValidada = gravidadeFinal;
  item.classificacao = gravidadeFinal;
  item.evidenciaAoValidar = item.evidencia;
  item.necessitaNovaRevisao = false;
  item.justificativaRejeicao = undefined;

  registrarEventoLocal({
    acao: ACOES_AUDITORIA.VALIDACAO_ACHADO,
    entidade: 'Achado',
    registroId: item.id,
    antesDepois: {
      antes: estadoAnterior,
      depois: {
        estadoValidacao: 'VALIDADO',
        classificacao: gravidadeFinal
      }
    },
    descricao: `Achado "${item.titulo}" validado como ${gravidadeFinal}`
  });

  return true;
}

export function alterarClassificacaoAchado(
  id: string,
  novaClassificacao: ClassificacaoAchado
): boolean {
  const item = achadosAtivos.find((a) => a.id === id);
  if (!item) return false;

  const gravidadeAnterior = item.classificacao;

  item.classificacaoValidada = novaClassificacao;
  item.classificacao = novaClassificacao;
  item.estadoValidacao = 'VALIDADO';
  item.necessitaNovaRevisao = false;

  registrarEventoLocal({
    acao: ACOES_AUDITORIA.ALTERACAO_CLASSIFICACAO_ACHADO,
    entidade: 'Achado',
    registroId: item.id,
    antesDepois: {
      antes: { classificacao: gravidadeAnterior },
      depois: { classificacao: novaClassificacao }
    },
    descricao: `Gravidade do achado "${item.titulo}" alterada de ${gravidadeAnterior || 'Pendente'} para ${novaClassificacao}`
  });

  return true;
}

export function rejeitarAchado(id: string, justificativa: string): boolean {
  const item = achadosAtivos.find((a) => a.id === id);
  if (!item) return false;

  const just = justificativa.trim();
  if (just.length === 0) {
    // Rejeição exige justificativa obrigatória registrada (RN06)
    return false;
  }

  const estadoAnterior = {
    estadoValidacao: item.estadoValidacao,
    justificativaRejeicao: item.justificativaRejeicao
  };

  item.estadoValidacao = 'REJEITADO';
  item.justificativaRejeicao = just;
  item.necessitaNovaRevisao = false;

  registrarEventoLocal({
    acao: ACOES_AUDITORIA.REJEICAO_ACHADO,
    entidade: 'Achado',
    registroId: item.id,
    antesDepois: {
      antes: estadoAnterior,
      depois: {
        estadoValidacao: 'REJEITADO',
        justificativaRejeicao: just
      }
    },
    descricao: `Achado "${item.titulo}" rejeitado com justificativa: "${just}"`
  });

  return true;
}

export function reabrirAchadoParaRevisao(id: string): boolean {
  const item = achadosAtivos.find((a) => a.id === id);
  if (!item) return false;

  const estadoAnterior = {
    estadoValidacao: item.estadoValidacao,
    classificacao: item.classificacao
  };

  item.estadoValidacao = 'SUGESTAO_SISTEMA';
  item.classificacaoValidada = null;
  item.classificacao = item.classificacaoSugerida;
  item.justificativaRejeicao = undefined;
  item.necessitaNovaRevisao = false;

  registrarEventoLocal({
    acao: ACOES_AUDITORIA.REABERTURA_ACHADO,
    entidade: 'Achado',
    registroId: item.id,
    antesDepois: {
      antes: estadoAnterior,
      depois: {
        estadoValidacao: 'SUGESTAO_SISTEMA',
        classificacao: item.classificacaoSugerida
      }
    },
    descricao: `Achado "${item.titulo}" reaberto para nova revisão do assessor`
  });

  return true;
}

export function adicionarAchadoManual(dados: {
  titulo: string;
  evidencia: string;
  regraOuMotivo: string;
  impacto: string;
  providencia: string;
  responsavel: string;
  classificacao: ClassificacaoAchado;
}): AchadoComMetadados | null {
  if (
    !dados.titulo.trim() ||
    !dados.evidencia.trim() ||
    !dados.regraOuMotivo.trim() ||
    !dados.impacto.trim() ||
    !dados.providencia.trim() ||
    !dados.classificacao
  ) {
    return null;
  }

  const novo: AchadoComMetadados = {
    id: `achado-manual-${Date.now()}`,
    regraId: 'MANUAL',
    titulo: dados.titulo.trim(),
    evidencia: dados.evidencia.trim(),
    regraOuMotivo: dados.regraOuMotivo.trim(),
    impacto: dados.impacto.trim(),
    providencia: dados.providencia.trim(),
    responsavel: dados.responsavel.trim() || 'Assessor do GSASP',
    classificacaoSugerida: null,
    classificacao: dados.classificacao,
    classificacaoValidada: dados.classificacao,
    estadoValidacao: 'VALIDADO',
    origemManual: true,
    evidenciaAoValidar: dados.evidencia.trim()
  };

  achadosAtivos.push(novo);

  registrarEventoLocal({
    acao: ACOES_AUDITORIA.INCLUSAO_ACHADO_MANUAL,
    entidade: 'Achado',
    registroId: novo.id,
    antesDepois: {
      antes: null,
      depois: {
        titulo: novo.titulo,
        classificacao: novo.classificacao,
        providencia: novo.providencia
      }
    },
    descricao: `Achado manual incluído: "${novo.titulo}" com gravidade ${novo.classificacao}`
  });

  return novo;
}

export function removerAchadoManual(id: string): boolean {
  const index = achadosAtivos.findIndex((a) => a.id === id && (a.origemManual || a.regraId === 'MANUAL'));
  if (index === -1) return false;

  const achadoRemovido = achadosAtivos[index];
  achadosAtivos.splice(index, 1);

  registrarEventoLocal({
    acao: ACOES_AUDITORIA.EXCLUSAO_ACHADO_MANUAL,
    entidade: 'Achado',
    registroId: id,
    antesDepois: {
      antes: {
        titulo: achadoRemovido.titulo,
        classificacao: achadoRemovido.classificacao
      },
      depois: null
    },
    descricao: `Achado manual excluído: "${achadoRemovido.titulo}"`
  });

  return true;
}

// ==========================================
// 4. RENDERIZAÇÃO DA INTERFACE (HTML)
// ==========================================

function getBadgeClassificacaoHtml(classificacao: ClassificacaoAchado | null): string {
  if (!classificacao) {
    return `<span class="tag-badge tag-pendente">Classificação pendente de validação humana</span>`;
  }
  switch (classificacao) {
    case 'IMPEDITIVO':
      return `<span class="tag-badge tag-impeditivo">IMPEDITIVO</span>`;
    case 'RELEVANTE':
      return `<span class="tag-badge tag-relevante">RELEVANTE</span>`;
    case 'FORMAL':
      return `<span class="tag-badge tag-formal">FORMAL</span>`;
    case 'MELHORIA':
      return `<span class="tag-badge tag-melhoria">MELHORIA</span>`;
  }
}

function getBadgeEstadoValidacaoHtml(estado: EstadoValidacaoAchado): string {
  switch (estado) {
    case 'SUGESTAO_SISTEMA':
      return `<span class="status-badge badge-sugestao">🤖 SUGESTÃO DO SISTEMA — PENDENTE DE VALIDAÇÃO HUMANA</span>`;
    case 'VALIDADO':
      return `<span class="status-badge badge-validado">👤 ACHADO VALIDADO</span>`;
    case 'REJEITADO':
      return `<span class="status-badge badge-rejeitado">❌ SUGESTÃO REJEITADA PELO ASSESSOR</span>`;
  }
}

export function renderAchadosScreen(): string {
  // Sincroniza com as etapas anteriores antes de renderizar
  sincronizarAchadosComMotor();

  const processo = getProcessoAtivo();
  const podeModificar = podeEditar();

  // Contadores
  const total = achadosAtivos.length;
  const validados = achadosAtivos.filter((a) => a.estadoValidacao === 'VALIDADO').length;
  const pendentesValidacao = achadosAtivos.filter((a) => a.estadoValidacao === 'SUGESTAO_SISTEMA').length;
  const rejeitados = achadosAtivos.filter((a) => a.estadoValidacao === 'REJEITADO').length;

  const impeditivos = achadosAtivos.filter((a) => (a.classificacaoValidada || a.classificacaoSugerida) === 'IMPEDITIVO' && a.estadoValidacao !== 'REJEITADO').length;
  const relevantes = achadosAtivos.filter((a) => (a.classificacaoValidada || a.classificacaoSugerida) === 'RELEVANTE' && a.estadoValidacao !== 'REJEITADO').length;
  const formais = achadosAtivos.filter((a) => (a.classificacaoValidada || a.classificacaoSugerida) === 'FORMAL' && a.estadoValidacao !== 'REJEITADO').length;
  const melhorias = achadosAtivos.filter((a) => (a.classificacaoValidada || a.classificacaoSugerida) === 'MELHORIA' && a.estadoValidacao !== 'REJEITADO').length;
  const pendentesClassificacao = achadosAtivos.filter((a) => !a.classificacaoValidada && !a.classificacaoSugerida && a.estadoValidacao !== 'REJEITADO').length;

  return `
    <div class="stage-header">
      <h2 class="stage-title">4. Apontamento e Validação de Achados</h2>
      <p class="stage-description">
        Consolidação determinística de inconsistências identificadas nas etapas anteriores e revisão humana obrigatória.
        Conforme as regras funcionais (RN02, RN05, RN06 e RN10), <strong>a IA/Sistema sugere e organiza; o assessor valida e a autoridade decide</strong>.
      </p>
    </div>

    <!-- 1. Cartão Contextual do Processo Ativo -->
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
        <div class="context-item full-width">
          <span class="context-label">Objeto:</span>
          <span class="context-value">${processo.objeto || '(Não informado)'}</span>
        </div>
        <div class="context-item">
          <span class="context-label">Valor:</span>
          <span class="context-value">${processo.valorNaoAplicavel ? 'Não aplicável' : formatarMoeda(processo.valor)}</span>
        </div>
        <div class="context-item">
          <span class="context-label">Vigência:</span>
          <span class="context-value">${processo.vigenciaNaoAplicavel ? 'Não aplicável' : `${formatarDataBR(processo.vigenciaInicio)} até ${formatarDataBR(processo.vigenciaFim)}`}</span>
        </div>
      </div>
    </div>

    <!-- 2. Painel Resumo e KPIs de Achados -->
    <div class="achados-kpi-panel">
      <div class="kpi-card">
        <span class="kpi-number">${total}</span>
        <span class="kpi-label">Total de Apontamentos</span>
      </div>
      <div class="kpi-card kpi-validados">
        <span class="kpi-number">${validados}</span>
        <span class="kpi-label">Validados pelo Assessor</span>
      </div>
      <div class="kpi-card kpi-pendentes">
        <span class="kpi-number">${pendentesValidacao}</span>
        <span class="kpi-label">Pendentes de Validação</span>
      </div>
      <div class="kpi-card kpi-rejeitados">
        <span class="kpi-number">${rejeitados}</span>
        <span class="kpi-label">Sugestões Rejeitadas</span>
      </div>
    </div>

    <div class="achados-gravidade-bar">
      <span class="gravidade-item tag-impeditivo"><strong>${impeditivos}</strong> Impeditivo(s)</span>
      <span class="gravidade-item tag-relevante"><strong>${relevantes}</strong> Relevante(s)</span>
      <span class="gravidade-item tag-formal"><strong>${formais}</strong> Formal(is)</span>
      <span class="gravidade-item tag-melhoria"><strong>${melhorias}</strong> Melhoria(s)</span>
      ${
        pendentesClassificacao > 0
          ? `<span class="gravidade-item tag-pendente"><strong>${pendentesClassificacao}</strong> Pendente(s) de Classificação</span>`
          : ''
      }
    </div>

    <!-- 3. Seção de Alertas de Instrução / Preenchimento Incompleto (RN11) -->
    ${
      alertasInstrucaoAtivos.length > 0
        ? `
        <div class="alerta-instrucao-box">
          <div class="alerta-instrucao-header">
            <span class="alerta-icon">ℹ️</span>
            <strong>Alertas de Instrução e Preenchimento Pendente (RN11):</strong>
          </div>
          <p class="alerta-instrucao-desc">
            Os apontamentos abaixo indicam campos não preenchidos ou incompletos na instrução. 
            Não constituem achados de desconformidade material nem autorizam aprovação automática.
          </p>
          <ul class="alerta-instrucao-list">
            ${alertasInstrucaoAtivos
              .map(
                (al) => `
              <li>
                <strong>[${al.regraId}]:</strong> ${al.mensagem} 
                <span class="alerta-campos">(Campos: ${al.camposPendentes.join(', ')})</span>
              </li>
            `
              )
              .join('')}
          </ul>
        </div>
      `
        : ''
    }

    <!-- 4. Seção de Divergências com Juízo Humano da Pertinência (RN02/RN07) -->
    ${
      divergenciasAtivas.length > 0
        ? `
        <div class="divergencia-humana-box">
          <div class="divergencia-header">
            <span class="divergencia-icon">⚖️</span>
            <strong>Soberania da Validação Humana — Divergência Identificada (RN02 e RN07):</strong>
          </div>
          <p class="divergencia-desc">
            A conclusão técnica favorável firmada pelo assessor foi integralmente preservada pelo sistema. 
            Contudo, foram detectadas divergências com critérios preliminares desfavoráveis que requerem justificativa robusta nos autos:
          </p>
          <ul class="divergencia-list">
            ${divergenciasAtivas
              .map(
                (div) => `
              <li>${div.mensagem}</li>
            `
              )
              .join('')}
          </ul>
        </div>
      `
        : ''
    }

    <!-- 5. Lista de Achados e Sugestões do Sistema -->
    <div class="achados-section-header">
      <h3 class="section-subtitle">Apontamentos para Revisão do Assessor</h3>
      ${
        podeModificar
          ? `
          <button type="button" id="btn-toggle-novo-achado" class="btn btn-secondary btn-sm">
            ${formularioManualAberto ? '✕ Fechar Formulário' : '+ Adicionar Achado Manual'}
          </button>
        `
          : ''
      }
    </div>

    <!-- Formulário para Inclusão de Achado Manual -->
    ${
      formularioManualAberto && podeModificar
        ? `
        <div class="card card-novo-achado">
          <h4 class="card-novo-titulo">Cadastrar Novo Achado Manual (Instrução do Assessor)</h4>
          <p class="card-novo-sub">Adiciona um apontamento de não conformidade identificado diretamente pelo assessor nos autos processuais.</p>
          
          <form id="form-novo-achado" class="form-novo-achado">
            <div class="form-group">
              <label class="form-label" for="novo-titulo">Título do Achado: *</label>
              <input type="text" id="novo-titulo" class="form-input" required placeholder="Ex.: Ausência de Certidão de Regularidade Fiscal">
            </div>

            <div class="form-group">
              <label class="form-label" for="novo-evidencia">Evidência Documental (Fato verificado nos autos): *</label>
              <textarea id="novo-evidencia" class="form-textarea" rows="2" required placeholder="Descreva a peça ou a ausência factual comprovada nos autos..."></textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="novo-regra">Regra / Motivo (Fundamento legal ou contratual): *</label>
              <textarea id="novo-regra" class="form-textarea" rows="2" required placeholder="Ex.: Art. 68 da Lei nº 14.133/2021..."></textarea>
            </div>

            <div class="form-row">
              <div class="form-group col-half">
                <label class="form-label" for="novo-impacto">Impacto Potencial: *</label>
                <input type="text" id="novo-impacto" class="form-input" required placeholder="Ex.: Risco de nulidade da contratação...">
              </div>
              <div class="form-group col-half">
                <label class="form-label" for="novo-providencia">Providência Recomendada: *</label>
                <input type="text" id="novo-providencia" class="form-input" required placeholder="Ex.: Notificar o setor demandante para juntada...">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-half">
                <label class="form-label" for="novo-responsavel">Setor Responsável: *</label>
                <input type="text" id="novo-responsavel" class="form-input" required value="Assessor do GSASP" placeholder="Ex.: Setor de Contratos">
              </div>
              <div class="form-group col-half">
                <label class="form-label" for="novo-classificacao">Classificação do Achado (RN04): *</label>
                <select id="novo-classificacao" class="form-select" required>
                  <option value="">Selecione a classificação...</option>
                  <option value="IMPEDITIVO">IMPEDITIVO</option>
                  <option value="RELEVANTE">RELEVANTE</option>
                  <option value="FORMAL">FORMAL</option>
                  <option value="MELHORIA">MELHORIA</option>
                </select>
              </div>
            </div>

            <div class="form-actions-novo">
              <button type="submit" class="btn btn-primary btn-sm">💾 Salvar Achado Manual</button>
              <button type="button" id="btn-cancelar-novo-achado" class="btn btn-secondary btn-sm">Cancelar</button>
            </div>
          </form>
        </div>
      `
        : ''
    }

    <!-- Listagem dos Achados -->
    ${
      achadosAtivos.length === 0
        ? `
        <div class="achados-vazio-card">
          <div class="achados-vazio-icon">✅</div>
          <h4>Nenhum achado de desconformidade identificado</h4>
          <p>O motor determinístico não identificou inconsistências com base nas regras vigentes.</p>
          <div class="salvaguarda-box">
            <strong>Salvaguarda de Governança (RN11):</strong>
            <span>A ausência de achados pelo motor não significa aprovação ou aptidão automática para assinatura. O juízo de legalidade e oportunidade é privativo do assessor e da autoridade competente.</span>
          </div>
        </div>
      `
        : `
        <div class="achados-cards-list">
          ${achadosAtivos
            .map((achado) => {
              const isEditandoClassificacao = itemEmEdicaoClassificacaoId === achado.id;
              const isRejeitando = itemEmRejeicaoId === achado.id;

              return `
              <div class="achado-card ${achado.estadoValidacao === 'REJEITADO' ? 'achado-rejeitado' : ''} ${achado.necessitaNovaRevisao ? 'achado-desatualizado' : ''}" id="card-${achado.id}">
                
                <!-- Cabeçalho do Card -->
                <div class="achado-card-header">
                  <div class="achado-meta">
                    <span class="achado-regra-id">[${achado.regraId || 'MANUAL'}]</span>
                    <h4 class="achado-titulo">${achado.titulo}</h4>
                  </div>
                  <div class="achado-badges-col">
                    ${getBadgeEstadoValidacaoHtml(achado.estadoValidacao)}
                  </div>
                </div>

                <!-- Alerta RN10 de Dados Alterados após Validação -->
                ${
                  achado.necessitaNovaRevisao
                    ? `
                  <div class="alerta-rn10-box">
                    ⚠️ <strong>Atenção (RN10):</strong> Os dados de origem nos autos foram alterados após a validação anterior deste achado. 
                    Requer nova revisão do assessor para confirmar ou readequar a gravidade.
                  </div>
                `
                    : ''
                }

                <!-- Linha de Classificações (Sugerida vs. Validada) -->
                <div class="achado-classificacoes-bar">
                  <div class="classificacao-col">
                    <span class="meta-label">Classificação Sugerida:</span>
                    ${getBadgeClassificacaoHtml(achado.classificacaoSugerida)}
                  </div>
                  <div class="classificacao-col">
                    <span class="meta-label">Classificação do Assessor:</span>
                    ${
                      achado.classificacaoValidada
                        ? getBadgeClassificacaoHtml(achado.classificacaoValidada)
                        : `<span class="tag-badge tag-aguardando">Aguardando validação humana</span>`
                    }
                  </div>
                </div>

                <!-- Corpo Estruturado (RN03) -->
                <div class="achado-corpo">
                  <div class="achado-linha">
                    <span class="achado-label">Evidência Factual:</span>
                    <span class="achado-texto">${achado.evidencia}</span>
                  </div>

                  <div class="achado-linha">
                    <span class="achado-label">Regra / Motivo:</span>
                    <span class="achado-texto">${achado.regraOuMotivo}</span>
                  </div>

                  <div class="achado-linha">
                    <span class="achado-label">Impacto Potencial:</span>
                    <span class="achado-texto">${achado.impacto}</span>
                  </div>

                  <div class="achado-linha">
                    <span class="achado-label">Providência Recomendada:</span>
                    <span class="achado-texto">${achado.providencia}</span>
                  </div>

                  <div class="achado-linha">
                    <span class="achado-label">Responsável pelo Saneamento:</span>
                    <span class="achado-texto"><strong>${achado.responsavel}</strong></span>
                  </div>

                  ${
                    achado.estadoValidacao === 'REJEITADO' && achado.justificativaRejeicao
                      ? `
                    <div class="achado-linha justificativa-rejeicao-box">
                      <span class="achado-label">Justificativa da Rejeição:</span>
                      <span class="achado-texto">${achado.justificativaRejeicao}</span>
                    </div>
                  `
                      : ''
                  }
                </div>

                <!-- Rodapé de Ações de Validação Humana -->
                <div class="achado-acoes-bar">
                  ${
                    !podeModificar
                      ? `
                      <span class="somente-leitura-aviso">🔒 Modo somente leitura: ações de validação desabilitadas.</span>
                    `
                      : `
                      ${
                        isRejeitando
                          ? `
                          <div class="rejeicao-form-inline">
                            <label class="form-label" for="justificativa-rejeicao-${achado.id}">Justificativa obrigatória da rejeição (RN06): *</label>
                            <textarea id="justificativa-rejeicao-${achado.id}" class="form-textarea" rows="2" placeholder="Explique fundamentadamente por que a sugestão não é aplicável..."></textarea>
                            <div class="rejeicao-btn-row">
                              <button type="button" class="btn btn-danger btn-sm btn-confirmar-rejeicao" data-id="${achado.id}">Confirmar Rejeição</button>
                              <button type="button" class="btn btn-secondary btn-sm btn-cancelar-rejeicao" data-id="${achado.id}">Cancelar</button>
                            </div>
                          </div>
                        `
                          : isEditandoClassificacao
                          ? `
                          <div class="edicao-classificacao-inline">
                            <label class="form-label" for="sel-nova-class-${achado.id}">Alterar classificação para:</label>
                            <select id="sel-nova-class-${achado.id}" class="form-select form-select-sm">
                              <option value="IMPEDITIVO" ${achado.classificacao === 'IMPEDITIVO' ? 'selected' : ''}>IMPEDITIVO</option>
                              <option value="RELEVANTE" ${achado.classificacao === 'RELEVANTE' ? 'selected' : ''}>RELEVANTE</option>
                              <option value="FORMAL" ${achado.classificacao === 'FORMAL' ? 'selected' : ''}>FORMAL</option>
                              <option value="MELHORIA" ${achado.classificacao === 'MELHORIA' ? 'selected' : ''}>MELHORIA</option>
                            </select>
                            <button type="button" class="btn btn-primary btn-sm btn-salvar-nova-class" data-id="${achado.id}">Salvar</button>
                            <button type="button" class="btn btn-secondary btn-sm btn-cancelar-nova-class" data-id="${achado.id}">Cancelar</button>
                          </div>
                        `
                          : `
                          ${
                            achado.estadoValidacao === 'SUGESTAO_SISTEMA'
                              ? `
                              <div class="acoes-sugestao-row">
                                ${
                                  !achado.classificacaoSugerida
                                    ? `
                                    <div class="seletor-class-obrigatorio">
                                      <label class="sr-only" for="sel-class-${achado.id}">Classificação:</label>
                                      <select id="sel-class-${achado.id}" class="form-select form-select-sm">
                                        <option value="">Defina a classificação...</option>
                                        <option value="IMPEDITIVO">IMPEDITIVO</option>
                                        <option value="RELEVANTE">RELEVANTE</option>
                                        <option value="FORMAL">FORMAL</option>
                                        <option value="MELHORIA">MELHORIA</option>
                                      </select>
                                    </div>
                                  `
                                    : ''
                                }
                                <button type="button" class="btn btn-success btn-sm btn-validar" data-id="${achado.id}" title="Confirma o achado para o relatório">
                                  ✓ Validar Achado
                                </button>
                                <button type="button" class="btn btn-secondary btn-sm btn-iniciar-rejeicao" data-id="${achado.id}" title="Rejeita a sugestão com justificativa">
                                  ✕ Rejeitar
                                </button>
                              </div>
                            `
                              : achado.estadoValidacao === 'VALIDADO'
                              ? `
                              <div class="acoes-validado-row">
                                <span class="validado-check">✅ Validado</span>
                                <button type="button" class="btn btn-secondary btn-sm btn-abrir-edicao-class" data-id="${achado.id}">
                                  ✏️ Alterar Gravidade
                                </button>
                                <button type="button" class="btn btn-secondary btn-sm btn-desfazer" data-id="${achado.id}">
                                  ↩️ Reabrir Sugestão
                                </button>
                                ${
                                  achado.origemManual
                                    ? `
                                  <button type="button" class="btn btn-danger btn-sm btn-excluir-manual" data-id="${achado.id}">
                                    🗑️ Excluir
                                  </button>
                                `
                                    : ''
                                }
                              </div>
                            `
                              : `
                              <div class="acoes-rejeitado-row">
                                <span class="rejeitado-flag">❌ Rejeitado</span>
                                <button type="button" class="btn btn-secondary btn-sm btn-desfazer" data-id="${achado.id}">
                                  ↩️ Reabrir para Revisão
                                </button>
                              </div>
                            `
                          }
                        `
                      }
                    `
                  }
                </div>

              </div>
            `;
            })
            .join('')}
        </div>
      `
    }

    <!-- 6. Navegação Inferior -->
    <div class="stage-nav-footer">
      <button type="button" id="btn-voltar-conformidade" class="btn btn-secondary">
        &larr; Voltar para Conformidade
      </button>
      <button type="button" id="btn-avancar-riscos" class="btn btn-primary">
        Avançar para Avaliação de Riscos &rarr;
      </button>
    </div>
  `;
}

// ==========================================
// 5. INICIALIZAÇÃO DE EVENTOS
// ==========================================

export function initAchadosEvents(
  onNavegarRiscos: () => void,
  onVoltarConformidade: () => void
): void {
  // Toggle do formulário manual
  const btnToggleManual = document.getElementById('btn-toggle-novo-achado');
  btnToggleManual?.addEventListener('click', () => {
    formularioManualAberto = !formularioManualAberto;
    reRender();
  });

  const btnCancelarManual = document.getElementById('btn-cancelar-novo-achado');
  btnCancelarManual?.addEventListener('click', () => {
    formularioManualAberto = false;
    reRender();
  });

  // Submissão do formulário manual
  const formManual = document.getElementById('form-novo-achado') as HTMLFormElement | null;
  formManual?.addEventListener('submit', (e) => {
    e.preventDefault();
    const titulo = (document.getElementById('novo-titulo') as HTMLInputElement)?.value;
    const evidencia = (document.getElementById('novo-evidencia') as HTMLTextAreaElement)?.value;
    const regraOuMotivo = (document.getElementById('novo-regra') as HTMLTextAreaElement)?.value;
    const impacto = (document.getElementById('novo-impacto') as HTMLInputElement)?.value;
    const providencia = (document.getElementById('novo-providencia') as HTMLInputElement)?.value;
    const responsavel = (document.getElementById('novo-responsavel') as HTMLInputElement)?.value;
    const classificacao = (document.getElementById('novo-classificacao') as HTMLSelectElement)?.value as ClassificacaoAchado;

    const criado = adicionarAchadoManual({
      titulo,
      evidencia,
      regraOuMotivo,
      impacto,
      providencia,
      responsavel,
      classificacao
    });

    if (criado) {
      formularioManualAberto = false;
      reRender();
    } else {
      alert('Preencha todos os campos obrigatórios para cadastrar o achado manual.');
    }
  });

  // Botões de Validação Direta
  document.querySelectorAll('.btn-validar').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.id;
      if (!id) return;

      const sel = document.getElementById(`sel-class-${id}`) as HTMLSelectElement | null;
      const classEscolhida = (sel?.value as ClassificacaoAchado) || undefined;

      const ok = validarAchado(id, classEscolhida);
      if (!ok) {
        alert('Por favor, selecione uma classificação de gravidade antes de validar este achado.');
        return;
      }
      reRender();
    });
  });

  // Iniciar Rejeição (Abre o campo de justificativa)
  document.querySelectorAll('.btn-iniciar-rejeicao').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.id;
      if (!id) return;
      itemEmRejeicaoId = id;
      itemEmEdicaoClassificacaoId = null;
      reRender();
    });
  });

  // Cancelar Rejeição
  document.querySelectorAll('.btn-cancelar-rejeicao').forEach((btn) => {
    btn.addEventListener('click', () => {
      itemEmRejeicaoId = null;
      reRender();
    });
  });

  // Confirmar Rejeição
  document.querySelectorAll('.btn-confirmar-rejeicao').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.id;
      if (!id) return;

      const txt = document.getElementById(`justificativa-rejeicao-${id}`) as HTMLTextAreaElement | null;
      const just = txt?.value || '';

      if (!just.trim()) {
        alert('A rejeição de uma sugestão do sistema exige justificativa fundamentada obrigatória (RN06).');
        return;
      }

      rejeitarAchado(id, just);
      itemEmRejeicaoId = null;
      reRender();
    });
  });

  // Abrir Edição de Classificação
  document.querySelectorAll('.btn-abrir-edicao-class').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.id;
      if (!id) return;
      itemEmEdicaoClassificacaoId = id;
      itemEmRejeicaoId = null;
      reRender();
    });
  });

  // Cancelar Edição de Classificação
  document.querySelectorAll('.btn-cancelar-nova-class').forEach((btn) => {
    btn.addEventListener('click', () => {
      itemEmEdicaoClassificacaoId = null;
      reRender();
    });
  });

  // Salvar Nova Classificação
  document.querySelectorAll('.btn-salvar-nova-class').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.id;
      if (!id) return;

      const sel = document.getElementById(`sel-nova-class-${id}`) as HTMLSelectElement | null;
      const nova = sel?.value as ClassificacaoAchado;

      if (nova) {
        alterarClassificacaoAchado(id, nova);
        itemEmEdicaoClassificacaoId = null;
        reRender();
      }
    });
  });

  // Desfazer / Reabrir
  document.querySelectorAll('.btn-desfazer').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.id;
      if (!id) return;
      reabrirAchadoParaRevisao(id);
      reRender();
    });
  });

  // Excluir Achado Manual
  document.querySelectorAll('.btn-excluir-manual').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.id;
      if (!id) return;
      if (confirm('Deseja realmente excluir este achado manual?')) {
        removerAchadoManual(id);
        reRender();
      }
    });
  });

  // Navegação
  const btnVoltar = document.getElementById('btn-voltar-conformidade');
  btnVoltar?.addEventListener('click', () => {
    onVoltarConformidade();
  });

  const btnAvancar = document.getElementById('btn-avancar-riscos');
  btnAvancar?.addEventListener('click', () => {
    onNavegarRiscos();
  });

  function reRender() {
    const card = document.querySelector('.stage-card');
    if (card) {
      const navButtons = card.querySelector('.stage-actions')?.outerHTML || '';
      card.innerHTML = renderAchadosScreen() + navButtons;
      initAchadosEvents(onNavegarRiscos, onVoltarConformidade);
    }
  }
}
