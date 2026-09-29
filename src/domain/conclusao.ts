/**
 * CONFORMA GSASP — Motor de Conclusão Executiva e Sugestão de Encaminhamento (RN08)
 * Implementação da Tarefa S4.2 (Sprint 4)
 * Base normativa: docs/regras-funcionais.md (Seção 7) e docs/contexto.md (RN08, RN10, RN11, RN12)
 *
 * Postulados de Domínio:
 * 1. Função determinística pura: mesma entrada produz sempre rigorosamente a mesma saída.
 * 2. Sem efeitos colaterais, sem dependência de DOM, alert, localStorage, IndexedDB ou APIs de navegador.
 * 3. Ordem estrita de precedência em cascata (P1 -> P2 -> P3 -> P4 -> P5).
 * 4. Produz estritamente uma das quatro conclusões regulamentares da RN08.
 * 5. Saída estruturada e auditável com lista de códigos MOT e salvaguardas institucionais.
 * 6. Vedação absoluta a ateste ou autorização automática para celebração/assinatura.
 */

import type {
  Processo,
  Pertinencia,
  ItemConformidade,
  Condicionante,
  Achado,
  Risco,
  TipoConclusao,
  NivelRisco,
  DimensaoRisco
} from './tipos.ts';

// ==========================================
// 1. TIPOS E CATÁLOGO DE CÓDIGOS DE MOTIVO (MOT)
// ==========================================

export type PrecedenciaDecisoria = 'P1' | 'P2' | 'P3' | 'P4' | 'P5';

export type CodigoMotivoConclusao =
  | 'MOT-SANEAMENTO-INSUFICIENCIA-DADOS'
  | 'MOT-SANEAMENTO-AVALIACOES-PENDENTES'
  | 'MOT-RECUSA-PERTINENCIA-NEGATIVA'
  | 'MOT-RECUSA-ACHADO-IMPEDITIVO'
  | 'MOT-RECUSA-RISCO-CRITICO'
  | 'MOT-SANEAMENTO-PERTINENCIA-NAO-DEMONSTRADA'
  | 'MOT-SANEAMENTO-CHECKLIST-PENDENTE'
  | 'MOT-SANEAMENTO-ACHADO-RELEVANTE'
  | 'MOT-SANEAMENTO-CONDICIONANTE-PENDENTE'
  | 'MOT-SANEAMENTO-RISCO-ALTO'
  | 'MOT-RESSALVA-ACHADO-FORMAL'
  | 'MOT-RESSALVA-MELHORIA'
  | 'MOT-RESSALVA-RISCO-MODERADO'
  | 'MOT-RESSALVA-PERTINENCIA-COM-JUSTIFICATIVA'
  | 'MOT-APTIDAO-PLENA-REGULARIDADE';

export interface MetadadosCodigoMotivo {
  codigo: CodigoMotivoConclusao;
  denominacao: string;
  conclusaoVinculada: TipoConclusao;
  descricao: string;
}

export const CATÁLOGO_MOTIVOS: Record<CodigoMotivoConclusao, MetadadosCodigoMotivo> = {
  'MOT-SANEAMENTO-INSUFICIENCIA-DADOS': {
    codigo: 'MOT-SANEAMENTO-INSUFICIENCIA-DADOS',
    denominacao: 'Insuficiência de Dados Instrutórios Essenciais',
    conclusaoVinculada: 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA',
    descricao:
      'Campos cadastrais essenciais ausentes, itens do checklist com status "confirmar" sem diligência, itens "nao_aplicavel" sem justificativa obrigatória, ou condicionantes sem situação definida (P1).'
  },
  'MOT-SANEAMENTO-AVALIACOES-PENDENTES': {
    codigo: 'MOT-SANEAMENTO-AVALIACOES-PENDENTES',
    denominacao: 'Etapas Anteriores Não Concluídas',
    conclusaoVinculada: 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA',
    descricao:
      'Sugestões de achados do motor no estado SUGESTAO_SISTEMA sem juízo humano, pertinência não concluída ou dimensões de risco em estado Pendente de avaliação (P1).'
  },
  'MOT-RECUSA-PERTINENCIA-NEGATIVA': {
    codigo: 'MOT-RECUSA-PERTINENCIA-NEGATIVA',
    denominacao: 'Pertinência Institucional Não Pertinente',
    conclusaoVinculada: 'NAO_RECOMENDAVEL_PARA_ASSINATURA',
    descricao: 'Assessor concluiu soberanamente que o objeto não é pertinente às finalidades da Pasta (P2).'
  },
  'MOT-RECUSA-ACHADO-IMPEDITIVO': {
    codigo: 'MOT-RECUSA-ACHADO-IMPEDITIVO',
    denominacao: 'Presença de Achado Validado Impeditivo',
    conclusaoVinculada: 'NAO_RECOMENDAVEL_PARA_ASSINATURA',
    descricao:
      'Existência de ao menos um achado validado com gravidade IMPEDITIVO nos autos, inviabilizando a assinatura no estado atual do processo (P2).'
  },
  'MOT-RECUSA-RISCO-CRITICO': {
    codigo: 'MOT-RECUSA-RISCO-CRITICO',
    denominacao: 'Matriz de Risco em Nível Crítico',
    conclusaoVinculada: 'NAO_RECOMENDAVEL_PARA_ASSINATURA',
    descricao: 'Ao menos uma dimensão da matriz de riscos avaliada no nível Crítico pelo assessor (P2).'
  },
  'MOT-SANEAMENTO-PERTINENCIA-NAO-DEMONSTRADA': {
    codigo: 'MOT-SANEAMENTO-PERTINENCIA-NAO-DEMONSTRADA',
    denominacao: 'Pertinência Institucional Não Demonstrada',
    conclusaoVinculada: 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA',
    descricao: 'Ausência de comprovação de benefício público ou motivação insuficiente que exige complementação instrutória (P3).'
  },
  'MOT-SANEAMENTO-CHECKLIST-PENDENTE': {
    codigo: 'MOT-SANEAMENTO-CHECKLIST-PENDENTE',
    denominacao: 'Pendência Conhecida em Item de Checklist',
    conclusaoVinculada: 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA',
    descricao:
      'Item obrigatório do checklist de conformidade documental com status "pendente", configurando deficiência instrutória conhecida que exige regularização antes da assinatura (P3).'
  },
  'MOT-SANEAMENTO-ACHADO-RELEVANTE': {
    codigo: 'MOT-SANEAMENTO-ACHADO-RELEVANTE',
    denominacao: 'Presença de Achado Validado Relevante',
    conclusaoVinculada: 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA',
    descricao:
      'Existência de achado validado como RELEVANTE que demanda saneamento prévio antes da formalização do ato (P3).'
  },
  'MOT-SANEAMENTO-CONDICIONANTE-PENDENTE': {
    codigo: 'MOT-SANEAMENTO-CONDICIONANTE-PENDENTE',
    denominacao: 'Condicionante Jurídica Pendente de Cumprimento',
    conclusaoVinculada: 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA',
    descricao:
      'Condicionante de parecer jurídico pendente ou em cumprimento que demanda providência saneadora indispensável antes da subscrição (P3).'
  },
  'MOT-SANEAMENTO-RISCO-ALTO': {
    codigo: 'MOT-SANEAMENTO-RISCO-ALTO',
    denominacao: 'Matriz de Risco em Nível Alto',
    conclusaoVinculada: 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA',
    descricao: 'Nível consolidado de risco avaliado como Alto, demandando plano de contingência ou saneamento prévio (P3).'
  },
  'MOT-RESSALVA-ACHADO-FORMAL': {
    codigo: 'MOT-RESSALVA-ACHADO-FORMAL',
    denominacao: 'Presença de Achados Validados Formais',
    conclusaoVinculada: 'APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA',
    descricao:
      'Inconsistências de forma ou cadastrais sem gravidade material que recomendam advertência ou retificação sem travar a assinatura (P4).'
  },
  'MOT-RESSALVA-MELHORIA': {
    codigo: 'MOT-RESSALVA-MELHORIA',
    denominacao: 'Recomendações de Aprimoramento e Boas Práticas',
    conclusaoVinculada: 'APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA',
    descricao: 'Sugestões de governança ou melhoria procedimental futura que não inviabilizam a celebração atual (P4).'
  },
  'MOT-RESSALVA-RISCO-MODERADO': {
    codigo: 'MOT-RESSALVA-RISCO-MODERADO',
    denominacao: 'Matriz de Risco em Nível Moderado',
    conclusaoVinculada: 'APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA',
    descricao:
      'Riscos controláveis (isolados ou concorrentes com achados formais) que exigem monitoramento setorial durante a execução contratual (P4).'
  },
  'MOT-RESSALVA-PERTINENCIA-COM-JUSTIFICATIVA': {
    codigo: 'MOT-RESSALVA-PERTINENCIA-COM-JUSTIFICATIVA',
    denominacao: 'Pertinência Atestada Mediante Justificativa',
    conclusaoVinculada: 'APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA',
    descricao:
      'Pertinência válida atestada mediante justificativa técnica extraordinária acolhida pelo assessor, cuja fundamentação deve constar destacada no relatório executivo (P4).'
  },
  'MOT-APTIDAO-PLENA-REGULARIDADE': {
    codigo: 'MOT-APTIDAO-PLENA-REGULARIDADE',
    denominacao: 'Plena Conformidade da Instrução Processual',
    conclusaoVinculada: 'APTO_PARA_ASSINATURA',
    descricao:
      'Pertinência estritamente favorável (sem ressalvas), todos os itens do checklist resolvidos (conforme ou nao_aplicavel justificado), condicionantes cumpridas, zero achados impeditivos/formais e todas as 4 dimensões de risco Baixo (P5).'
  }
};

export const ROTULOS_CONCLUSAO: Record<TipoConclusao, string> = {
  APTO_PARA_ASSINATURA: 'Apto para Assinatura',
  APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA: 'Apto para Assinatura com Ressalva Não Impeditiva',
  RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA: 'Retornar para Saneamento antes da Assinatura',
  NAO_RECOMENDAVEL_PARA_ASSINATURA: 'Não Recomendável para Assinatura'
};

export const SALVAGUARDAS_CONCLUSAO: readonly string[] = [
  'RN08: A recomendação é estritamente indicativa de apoio à instrução e não constitui autorização automática para assinatura nem ateste formal de legalidade.',
  'RN07: O juízo conclusivo cabe privativamente ao assessor técnico e a decisão final é indelegável da autoridade competente (Secretário de Estado / Ordenador de Despesas).',
  'RN02: O assessor técnico pode divergir motivadamente da sugestão do sistema mediante justificativa obrigatória registrada nos autos.',
  'RN10: Qualquer alteração superveniente em etapas anteriores invalida automaticamente a manifestação da conclusão executiva, exigindo nova conferência.'
];

// ==========================================
// 2. INTERFACES DE ENTRADA E SAÍDA
// ==========================================

export interface DadosEntradaConclusao {
  processo?: Processo | null;
  pertinencia?: Pertinencia | null;
  checklist?: ItemConformidade[] | null;
  condicionantes?: Condicionante[] | null;
  achados?: Achado[] | null;
  riscos?: Risco[] | null;
}

export interface DetalhesInstrucaoConclusao {
  itensChecklistPendentes: number;
  itensChecklistAConfirmar: number;
  itensChecklistNaoAplicavelSemJustificativa: number;
  itensChecklistResolvidos: number;
  condicionantesPendentes: number;
  achadosImpeditivos: number;
  achadosRelevantes: number;
  achadosFormais: number;
  achadosMelhoria: number;
  achadosNaoAvaliados: number;
  riscosNaoAvaliados: number;
}

export interface ResultadoConclusaoExecutiva {
  conclusao: TipoConclusao;
  codigosMotivo: CodigoMotivoConclusao[];
  providenciaSugerida: string;
  exigeSaneamento: boolean;
  precedenciaAplicada: PrecedenciaDecisoria;
  regraDecAplicada: string;
  regrasDecAplicadas: string[];
  salvaguardas: string[];
  naoConstituiAutorizacaoAutomatica: true;
  riscoConsolidado: NivelRisco | null;
  detalhes: DetalhesInstrucaoConclusao;
}

// ==========================================
// 3. CONSOLIDAÇÃO DA MATRIZ DE RISCOS (RN12)
// ==========================================

/**
 * Consolida o nível de risco a partir das 4 dimensões homologadas:
 * Crítico > Alto > Moderado > Baixo.
 *
 * Dimensão não avaliada (null/ausente) aciona a pendência instrutória (P1)
 * e NUNCA é presumida como Baixo.
 */
export function consolidarNivelRisco(riscos?: Risco[] | null): {
  riscoConsolidado: NivelRisco | null;
  pendentes: number;
  avaliadas: number;
} {
  if (!riscos || !Array.isArray(riscos) || riscos.length === 0) {
    return { riscoConsolidado: null, pendentes: 4, avaliadas: 0 };
  }

  const dimensoesObrigatorias: DimensaoRisco[] = ['juridica', 'financeira', 'operacional', 'controle'];
  let critico = 0;
  let alto = 0;
  let moderado = 0;
  let baixo = 0;
  let pendentes = 0;

  for (const dim of dimensoesObrigatorias) {
    const item = riscos.find((r) => r.dimensao === dim);
    if (!item || item.nivel === null || item.nivel === undefined) {
      pendentes++;
    } else {
      switch (item.nivel) {
        case 'critico':
          critico++;
          break;
        case 'alto':
          alto++;
          break;
        case 'moderado':
          moderado++;
          break;
        case 'baixo':
          baixo++;
          break;
        default:
          pendentes++;
          break;
      }
    }
  }

  if (pendentes > 0) {
    return { riscoConsolidado: null, pendentes, avaliadas: 4 - pendentes };
  }

  let riscoConsolidado: NivelRisco = 'baixo';
  if (critico > 0) riscoConsolidado = 'critico';
  else if (alto > 0) riscoConsolidado = 'alto';
  else if (moderado > 0) riscoConsolidado = 'moderado';

  return { riscoConsolidado, pendentes: 0, avaliadas: 4 };
}

// ==========================================
// 4. MOTOR LÓGICO DETERMINÍSTICO (RN08)
// ==========================================

/**
 * Avalia determinística e exaustivamente as entradas processuais,
 * aplicando a ordem estrita de precedência P1 -> P2 -> P3 -> P4 -> P5
 * conforme a Seção 7 de docs/regras-funcionais.md.
 */
export function avaliarConclusaoExecutiva(
  entrada: DadosEntradaConclusao
): ResultadoConclusaoExecutiva {
  const {
    processo,
    pertinencia,
    checklist = [],
    condicionantes = [],
    achados = [],
    riscos = []
  } = entrada;

  // -------------------------------------------------------------
  // Contagens e diagnósticos preliminares
  // -------------------------------------------------------------
  const itensChecklist = Array.isArray(checklist) ? checklist : [];
  const listaCondicionantes = Array.isArray(condicionantes) ? condicionantes : [];
  const listaAchados = Array.isArray(achados) ? achados : [];

  let itensChecklistPendentes = 0;
  let itensChecklistAConfirmar = 0;
  let itensChecklistNaoAplicavelSemJustificativa = 0;
  let itensChecklistResolvidos = 0;

  for (const item of itensChecklist) {
    if (item.status === 'confirmar') {
      itensChecklistAConfirmar++;
    } else if (item.status === 'pendente') {
      itensChecklistPendentes++;
    } else if (item.status === 'nao_aplicavel') {
      const just = item.justificativaNaoAplicavel?.trim() || '';
      if (just.length < 5) {
        itensChecklistNaoAplicavelSemJustificativa++;
      } else {
        itensChecklistResolvidos++;
      }
    } else if (item.status === 'ok' || (item.status as string) === 'conforme') {
      itensChecklistResolvidos++;
    }
  }

  // Condicionantes pendentes ou em cumprimento que demandam providência saneadora
  let condicionantesPendentes = 0;
  let condicionantesComSituacaoIndefinida = 0;

  for (const cond of listaCondicionantes) {
    if (!cond.situacao) {
      condicionantesComSituacaoIndefinida++;
    } else if (cond.situacao === 'pendente' || cond.situacao === 'em_cumprimento') {
      condicionantesPendentes++;
    }
  }

  // Achados separados por estado de validação humana e gravidade
  let achadosNaoAvaliados = 0;
  let achadosImpeditivos = 0;
  let achadosRelevantes = 0;
  let achadosFormais = 0;
  let achadosMelhoria = 0;

  for (const ach of listaAchados) {
    if (ach.estadoValidacao === 'SUGESTAO_SISTEMA') {
      achadosNaoAvaliados++;
    } else if (ach.estadoValidacao === 'VALIDADO') {
      const gravidade = ach.classificacaoValidada || ach.classificacao;
      if (gravidade === 'IMPEDITIVO') achadosImpeditivos++;
      else if (gravidade === 'RELEVANTE') achadosRelevantes++;
      else if (gravidade === 'FORMAL') achadosFormais++;
      else if (gravidade === 'MELHORIA') achadosMelhoria++;
    }
    // Achados no estado 'REJEITADO' são ignorados para fins de óbice ou ressalva
  }

  // Consolidação de riscos
  const resumoRiscos = consolidarNivelRisco(riscos);
  const riscosNaoAvaliados = resumoRiscos.pendentes;
  const riscoConsolidado = resumoRiscos.riscoConsolidado;

  const detalhes: DetalhesInstrucaoConclusao = {
    itensChecklistPendentes,
    itensChecklistAConfirmar,
    itensChecklistNaoAplicavelSemJustificativa,
    itensChecklistResolvidos,
    condicionantesPendentes,
    achadosImpeditivos,
    achadosRelevantes,
    achadosFormais,
    achadosMelhoria,
    achadosNaoAvaliados,
    riscosNaoAvaliados
  };

  // -------------------------------------------------------------
  // CAMADA P1 — Insuficiência de Dados ou Avaliações Pendentes
  // Precedência absoluta sobre P2 a P5
  // -------------------------------------------------------------

  // Verificação DEC-01: Dados essenciais ausentes ou conferências em aberto no checklist
  const processoIncompleto =
    !processo ||
    !processo.objeto ||
    processo.objeto.trim().length < 5 ||
    !processo.numero ||
    !processo.numero.trim() ||
    !processo.instrumento ||
    !processo.instrumento.trim() ||
    (!processo.vigenciaNaoAplicavel &&
      (!processo.vigenciaInicio ||
        !processo.vigenciaFim ||
        processo.vigenciaFim < processo.vigenciaInicio)) ||
    itensChecklist.length === 0;

  const temDec01 =
    processoIncompleto ||
    itensChecklistAConfirmar > 0 ||
    itensChecklistNaoAplicavelSemJustificativa > 0 ||
    condicionantesComSituacaoIndefinida > 0;

  // Verificação DEC-02: Avaliações humanas pendentes de conclusão
  const pertinenciaIncompleta = !pertinencia || !pertinencia.conclusao;
  const temDec02 = achadosNaoAvaliados > 0 || riscosNaoAvaliados > 0 || pertinenciaIncompleta;

  if (temDec01 || temDec02) {
    const codigosMotivo: CodigoMotivoConclusao[] = [];
    const regrasDec: string[] = [];

    if (temDec01) {
      codigosMotivo.push('MOT-SANEAMENTO-INSUFICIENCIA-DADOS');
      regrasDec.push('DEC-01');
    }
    if (temDec02) {
      codigosMotivo.push('MOT-SANEAMENTO-AVALIACOES-PENDENTES');
      regrasDec.push('DEC-02');
    }

    const providencia = temDec01
      ? 'Diligenciar ao setor demandante para completar a instrução, justificar itens dispensados e anexar documentos pendentes de conferência.'
      : 'Concluir a avaliação técnica humana dos achados e da matriz de riscos nas Etapas 4 e 5.';

    return {
      conclusao: 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA',
      codigosMotivo,
      providenciaSugerida: providencia,
      exigeSaneamento: true,
      precedenciaAplicada: 'P1',
      regraDecAplicada: regrasDec[0],
      regrasDecAplicadas: regrasDec,
      salvaguardas: [...SALVAGUARDAS_CONCLUSAO],
      naoConstituiAutorizacaoAutomatica: true,
      riscoConsolidado,
      detalhes
    };
  }

  // -------------------------------------------------------------
  // CAMADA P2 — Óbice Impeditivo no Estado Atual / Recusa
  // Avaliada APÓS a superação de P1
  // -------------------------------------------------------------

  // DEC-03: Pertinência institucional não pertinente
  if (pertinencia?.conclusao === 'NAO_PERTINENTE') {
    return {
      conclusao: 'NAO_RECOMENDAVEL_PARA_ASSINATURA',
      codigosMotivo: ['MOT-RECUSA-PERTINENCIA-NEGATIVA'],
      providenciaSugerida:
        'Arquivar o processo ou indeferir a solicitação por ausência de aderência aos objetivos institucionais da Pasta.',
      exigeSaneamento: false,
      precedenciaAplicada: 'P2',
      regraDecAplicada: 'DEC-03',
      regrasDecAplicadas: ['DEC-03'],
      salvaguardas: [...SALVAGUARDAS_CONCLUSAO],
      naoConstituiAutorizacaoAutomatica: true,
      riscoConsolidado,
      detalhes
    };
  }

  // DEC-04: Ao menos um achado validado como impeditivo
  if (achadosImpeditivos > 0) {
    return {
      conclusao: 'NAO_RECOMENDAVEL_PARA_ASSINATURA',
      codigosMotivo: ['MOT-RECUSA-ACHADO-IMPEDITIVO'],
      providenciaSugerida:
        'Não recomendar a assinatura enquanto subsistir o achado impeditivo. Se a causa admitir correção, promover o saneamento e submeter o processo a nova análise; se insanável, registrar o óbice e abster-se da subscrição.',
      exigeSaneamento: false,
      precedenciaAplicada: 'P2',
      regraDecAplicada: 'DEC-04',
      regrasDecAplicadas: ['DEC-04'],
      salvaguardas: [...SALVAGUARDAS_CONCLUSAO],
      naoConstituiAutorizacaoAutomatica: true,
      riscoConsolidado,
      detalhes
    };
  }

  // DEC-05: Nível consolidado de risco avaliado como crítico (sem achados impeditivos)
  if (riscoConsolidado === 'critico') {
    return {
      conclusao: 'NAO_RECOMENDAVEL_PARA_ASSINATURA',
      codigosMotivo: ['MOT-RECUSA-RISCO-CRITICO'],
      providenciaSugerida:
        'Submeter o quadro de riscos à autoridade competente, destacando a existência de nível consolidado CRÍTICO e os fundamentos registrados pelo assessor, com sugestão indicativa de não assinatura.',
      exigeSaneamento: false,
      precedenciaAplicada: 'P2',
      regraDecAplicada: 'DEC-05',
      regrasDecAplicadas: ['DEC-05'],
      salvaguardas: [...SALVAGUARDAS_CONCLUSAO],
      naoConstituiAutorizacaoAutomatica: true,
      riscoConsolidado,
      detalhes
    };
  }

  // -------------------------------------------------------------
  // CAMADA P3 — Necessidade de Saneamento Material / Risco Alto
  // Avaliada APÓS a superação de P1 e P2
  // -------------------------------------------------------------

  // DEC-06: Pertinência institucional não demonstrada
  if (pertinencia?.conclusao === 'NAO_DEMONSTRADA') {
    return {
      conclusao: 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA',
      codigosMotivo: ['MOT-SANEAMENTO-PERTINENCIA-NAO-DEMONSTRADA'],
      providenciaSugerida:
        'Retornar ao setor solicitante para complementar o Estudo Técnico Preliminar e justificar a necessidade pública.',
      exigeSaneamento: true,
      precedenciaAplicada: 'P3',
      regraDecAplicada: 'DEC-06',
      regrasDecAplicadas: ['DEC-06'],
      salvaguardas: [...SALVAGUARDAS_CONCLUSAO],
      naoConstituiAutorizacaoAutomatica: true,
      riscoConsolidado,
      detalhes
    };
  }

  // DEC-07A: Item de checklist com status 'pendente' (deficiência documental conhecida)
  if (itensChecklistPendentes > 0) {
    return {
      conclusao: 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA',
      codigosMotivo: ['MOT-SANEAMENTO-CHECKLIST-PENDENTE'],
      providenciaSugerida:
        'Notificar formalmente o setor demandante/gestor para providenciar a juntada do documento pendente nos autos antes da subscrição.',
      exigeSaneamento: true,
      precedenciaAplicada: 'P3',
      regraDecAplicada: 'DEC-07A',
      regrasDecAplicadas: ['DEC-07A'],
      salvaguardas: [...SALVAGUARDAS_CONCLUSAO],
      naoConstituiAutorizacaoAutomatica: true,
      riscoConsolidado,
      detalhes
    };
  }

  // DEC-07B: Achado validado como relevante OU condicionante jurídica pendente/em cumprimento
  if (achadosRelevantes > 0 || condicionantesPendentes > 0) {
    const codigosMotivo: CodigoMotivoConclusao[] = [];
    if (achadosRelevantes > 0) codigosMotivo.push('MOT-SANEAMENTO-ACHADO-RELEVANTE');
    if (condicionantesPendentes > 0) codigosMotivo.push('MOT-SANEAMENTO-CONDICIONANTE-PENDENTE');

    return {
      conclusao: 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA',
      codigosMotivo,
      providenciaSugerida:
        'Notificar o fiscal/gestor para cumprir condicionante ou sanear a impropriedade relevante antes da assinatura.',
      exigeSaneamento: true,
      precedenciaAplicada: 'P3',
      regraDecAplicada: 'DEC-07B',
      regrasDecAplicadas: ['DEC-07B'],
      salvaguardas: [...SALVAGUARDAS_CONCLUSAO],
      naoConstituiAutorizacaoAutomatica: true,
      riscoConsolidado,
      detalhes
    };
  }

  // DEC-08: Risco consolidado avaliado como alto
  if (riscoConsolidado === 'alto') {
    return {
      conclusao: 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA',
      codigosMotivo: ['MOT-SANEAMENTO-RISCO-ALTO'],
      providenciaSugerida:
        'Elaborar e juntar matriz de contingência ou mitigar os fatores que elevaram o risco antes da subscrição.',
      exigeSaneamento: true,
      precedenciaAplicada: 'P3',
      regraDecAplicada: 'DEC-08',
      regrasDecAplicadas: ['DEC-08'],
      salvaguardas: [...SALVAGUARDAS_CONCLUSAO],
      naoConstituiAutorizacaoAutomatica: true,
      riscoConsolidado,
      detalhes
    };
  }

  // -------------------------------------------------------------
  // CAMADA P4 — Regularidade com Ressalva Não Impeditiva
  // Avaliada APÓS a superação de P1, P2 e P3
  // -------------------------------------------------------------

  const temAchadoFormal = achadosFormais > 0;
  const temAchadoMelhoria = achadosMelhoria > 0;
  const temRiscoModerado = riscoConsolidado === 'moderado';
  const temPertinenciaComJustificativa = pertinencia?.conclusao === 'PERTINENTE_COM_JUSTIFICATIVA';

  if (temAchadoFormal || temAchadoMelhoria || temRiscoModerado || temPertinenciaComJustificativa) {
    const codigosMotivo: CodigoMotivoConclusao[] = [];
    const regrasDec: string[] = [];
    const providencias: string[] = [];

    if (temAchadoFormal) {
      codigosMotivo.push('MOT-RESSALVA-ACHADO-FORMAL');
      regrasDec.push('DEC-09A');
      providencias.push('Dar ciência à autoridade e registrar no termo de autorização as recomendações formais.');
    }
    if (temAchadoMelhoria) {
      codigosMotivo.push('MOT-RESSALVA-MELHORIA');
      regrasDec.push('DEC-09B');
      providencias.push('Registrar no relatório executivo as sugestões de governança e aprimoramento procedimental.');
    }
    if (temRiscoModerado) {
      codigosMotivo.push('MOT-RESSALVA-RISCO-MODERADO');
      regrasDec.push('DEC-09C');
      providencias.push('Registrar recomendações de monitoramento setorial e mitigação dos riscos operacionais/financeiros durante a execução contratual.');
    }
    if (temPertinenciaComJustificativa) {
      codigosMotivo.push('MOT-RESSALVA-PERTINENCIA-COM-JUSTIFICATIVA');
      regrasDec.push('DEC-09D');
      providencias.push('Fazer constar expressamente na conclusão executiva a motivação fática e técnica acolhida que fundamentou a pertinência do ajuste.');
    }

    return {
      conclusao: 'APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA',
      codigosMotivo,
      providenciaSugerida: providencias.join(' '),
      exigeSaneamento: false,
      precedenciaAplicada: 'P4',
      regraDecAplicada: regrasDec[0],
      regrasDecAplicadas: regrasDec,
      salvaguardas: [...SALVAGUARDAS_CONCLUSAO],
      naoConstituiAutorizacaoAutomatica: true,
      riscoConsolidado,
      detalhes
    };
  }

  // -------------------------------------------------------------
  // CAMADA P5 — Plena Regularidade Demonstrada (DEC-10)
  // Sem pendências P1, P2, P3 ou P4
  // -------------------------------------------------------------

  return {
    conclusao: 'APTO_PARA_ASSINATURA',
    codigosMotivo: ['MOT-APTIDAO-PLENA-REGULARIDADE'],
    providenciaSugerida:
      'Encaminhar os autos à autoridade competente para deliberação e subscrição do instrumento.',
    exigeSaneamento: false,
    precedenciaAplicada: 'P5',
    regraDecAplicada: 'DEC-10',
    regrasDecAplicadas: ['DEC-10'],
    salvaguardas: [...SALVAGUARDAS_CONCLUSAO],
    naoConstituiAutorizacaoAutomatica: true,
    riscoConsolidado: 'baixo',
    detalhes
  };
}

// ==========================================
// 5. FORMATADORES AUXILIARES
// ==========================================

export function formatarConclusao(conclusao: TipoConclusao): string {
  return ROTULOS_CONCLUSAO[conclusao] || conclusao;
}

export function formatarCodigoMotivo(codigo: CodigoMotivoConclusao): string {
  return CATÁLOGO_MOTIVOS[codigo]?.denominacao || codigo;
}

export function obterRotuloPrecedencia(precedencia: PrecedenciaDecisoria): string {
  switch (precedencia) {
    case 'P1':
      return 'P1 — Insuficiência de Dados ou Avaliações Pendentes';
    case 'P2':
      return 'P2 — Óbice Impeditivo no Estado Atual / Recusa';
    case 'P3':
      return 'P3 — Necessidade de Saneamento Material / Risco Alto';
    case 'P4':
      return 'P4 — Regularidade com Ressalva Não Impeditiva';
    case 'P5':
      return 'P5 — Plena Regularidade Demonstrada';
    default:
      return precedencia;
  }
}
