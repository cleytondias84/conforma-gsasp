/**
 * CONFORMA GSASP — Regras de Validação de Processo e Instrumento
 * Implementação da Tarefa S2.1 (Sprint 2)
 * Base: docs/contexto.md (RN01, RN13) e docs/sprint.md
 */

import type {
  Processo,
  Pertinencia,
  ConclusaoPertinencia,
  ItemConformidade,
  StatusConformidade,
  Condicionante,
  SituacaoCondicionante
} from './tipos';

export interface ErroValidacaoCampo {
  campo: string;
  mensagem: string;
}

export interface ResultadoValidacaoProcesso {
  valido: boolean;
  erros: Record<string, string>;
  avisos: Record<string, string>;
}

/**
 * Formata um valor numérico em Reais (R$ 0.000,00).
 */
export function formatarMoeda(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return 'Não se aplica / Sem valor financeiro';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

/**
 * Formata uma data no formato ISO (YYYY-MM-DD) para exibição brasileira (DD/MM/AAAA).
 */
export function formatarDataBR(dataIso: string | null | undefined): string {
  if (!dataIso || !dataIso.trim()) return 'Não informada';
  const partes = dataIso.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataIso;
}

/**
 * Calcula aproximadamente a duração em dias e meses entre duas datas ISO.
 */
export function calcularDuracaoVigencia(inicio: string | null | undefined, fim: string | null | undefined): string {
  if (!inicio || !fim) return '';
  const dInicio = new Date(`${inicio}T00:00:00`);
  const dFim = new Date(`${fim}T00:00:00`);

  if (isNaN(dInicio.getTime()) || isNaN(dFim.getTime())) return '';
  if (dFim < dInicio) return '(Período cronologicamente invertido)';

  const diffMs = dFim.getTime() - dInicio.getTime();
  const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const mesesAprox = Math.round(diffDias / 30.4375);

  if (mesesAprox <= 1) {
    return `${diffDias} dia(s)`;
  }
  return `Aprox. ${mesesAprox} mês(es) (${diffDias} dias)`;
}

/**
 * Validação básica de formato de CNPJ fictício ou real.
 */
export function validarFormatoCNPJ(cnpj: string): boolean {
  if (!cnpj) return false;
  const limpo = cnpj.replace(/\D/g, '');
  return limpo.length === 14;
}

/**
 * Valida o preenchimento de um objeto Processo segundo as regras funcionais.
 * - RN01: Destacar e exigir elementos essenciais (objeto, tipoOrigem, valor, vigência).
 * - RN13: Problemas de preenchimento geram erro claro de formulário.
 * - Não aplicabilidade de valor e vigência tratadas explicitamente sem bloquear indevidamente.
 */
export function validarProcesso(processo: Partial<Processo>): ResultadoValidacaoProcesso {
  const erros: Record<string, string> = {};
  const avisos: Record<string, string> = {};

  // 1. Número do Processo (Obrigatório)
  if (!processo.numero || !processo.numero.trim()) {
    erros.numero = 'O número do processo é obrigatório (ex.: SESP-PRO-2026/00001).';
  }

  // 2. Instrumento Jurídico (Obrigatório)
  if (!processo.instrumento || !processo.instrumento.trim()) {
    erros.instrumento = 'O tipo de instrumento é obrigatório (ex.: Contrato Administrativo, Termo Aditivo).';
  }

  // 3. Objeto da Contratação (Elemento Essencial - RN01)
  if (!processo.objeto || !processo.objeto.trim()) {
    erros.objeto = 'O objeto da contratação é obrigatório (Elemento Essencial - RN01).';
  } else if (processo.objeto.trim().length < 10) {
    erros.objeto = 'O objeto deve ser descrito com clareza suficiente (mínimo de 10 caracteres).';
  }

  // 4. Tipo / Origem da Contratação (Elemento Essencial - RN01)
  if (!processo.tipoOrigem || !processo.tipoOrigem.trim()) {
    erros.tipoOrigem = 'O tipo/origem da contratação é obrigatório (Elemento Essencial - RN01).';
  }

  // 5. Regime Jurídico
  if (!processo.regimeJuridico || !processo.regimeJuridico.trim()) {
    erros.regimeJuridico = 'Selecione o regime jurídico aplicável (ex.: Lei nº 14.133/2021).';
  }

  // 6. Contratado / Parceiro e CNPJ
  const contratadoNaoAplicavel = Boolean(processo.contratadoNaoAplicavel);
  if (!contratadoNaoAplicavel) {
    if (!processo.contratado || !processo.contratado.trim()) {
      erros.contratado = 'Informe a razão social do contratado ou marque "Não aplicável".';
    }
    if (!processo.cnpj || !processo.cnpj.trim()) {
      erros.cnpj = 'Informe o CNPJ fictício do contratado ou marque "Não aplicável".';
    } else if (!validarFormatoCNPJ(processo.cnpj)) {
      erros.cnpj = 'CNPJ com formato incompleto (deve conter 14 dígitos, ex.: 00.000.000/0001-00).';
    }
  }

  // 7. Valor Financeiro (Elemento Essencial - RN01)
  const valorNaoAplicavel = Boolean(processo.valorNaoAplicavel);
  if (!valorNaoAplicavel) {
    if (processo.valor === null || processo.valor === undefined || isNaN(processo.valor)) {
      erros.valor = 'Informe o valor financeiro do instrumento ou marque "Não se aplica a este instrumento".';
    } else if (processo.valor < 0) {
      erros.valor = 'O valor financeiro não pode ser negativo.';
    } else if (processo.valor === 0) {
      // Conforme docs/contexto.md: valor zero é permitido mas gera aviso para confirmação
      avisos.valor = 'Instrumento registrado com valor financeiro zero (R$ 0,00).';
    }
  }

  // 8. Vigência e Prazos (Elemento Essencial - RN01 / RN13)
  const vigenciaNaoAplicavel = Boolean(processo.vigenciaNaoAplicavel);
  if (!vigenciaNaoAplicavel) {
    if (!processo.vigenciaInicio || !processo.vigenciaInicio.trim()) {
      erros.vigenciaInicio = 'A data de início da vigência é obrigatória ou marque "Não se aplica".';
    }
    if (!processo.vigenciaFim || !processo.vigenciaFim.trim()) {
      erros.vigenciaFim = 'A data de término da vigência é obrigatória ou marque "Não se aplica".';
    }

    // Validação de consistência cronológica (RN13)
    if (processo.vigenciaInicio && processo.vigenciaFim) {
      const dInicio = new Date(`${processo.vigenciaInicio}T00:00:00`);
      const dFim = new Date(`${processo.vigenciaFim}T00:00:00`);

      if (isNaN(dInicio.getTime())) {
        erros.vigenciaInicio = 'Data de início inválida.';
      }
      if (isNaN(dFim.getTime())) {
        erros.vigenciaFim = 'Data de término inválida.';
      }
      if (!isNaN(dInicio.getTime()) && !isNaN(dFim.getTime())) {
        if (dFim < dInicio) {
          erros.vigenciaFim = 'A data de término não pode ser anterior à data de início da vigência (RN13).';
        }
      }
    }
  }

  return {
    valido: Object.keys(erros).length === 0,
    erros,
    avisos
  };
}

// ==========================================
// 2. VALIDAÇÃO DE PERTINÊNCIA INSTITUCIONAL (S2.2)
// ==========================================

export interface ResultadoValidacaoPertinencia {
  valido: boolean;
  erros: Record<string, string>;
  avisos: Record<string, string>;
  sugestaoIndicativa: ConclusaoPertinencia;
}

/**
 * Traduz o enum de ConclusaoPertinencia para exibição legível com formatação executiva.
 */
export function formatarConclusaoPertinencia(conclusao: ConclusaoPertinencia | null | undefined): string {
  switch (conclusao) {
    case 'PERTINENTE':
      return 'PERTINENTE — Interesse público e necessidade demonstrados';
    case 'PERTINENTE_COM_JUSTIFICATIVA':
      return 'PERTINENTE COM JUSTIFICATIVA — Admissível mediante fundamentação complementar';
    case 'NAO_DEMONSTRADA':
      return 'PERTINÊNCIA NÃO DEMONSTRADA — Ausência de motivação fática suficiente nos autos';
    case 'NAO_PERTINENTE':
      return 'NÃO PERTINENTE — Objeto estranho às atribuições ou em desacordo com o interesse público';
    default:
      return 'Conclusão pendente de validação humana (RN02)';
  }
}

/**
 * Gera a sugestão indicativa do sistema com base nas 5 respostas dos critérios.
 * Conforme RN02 e visão funcional:
 * - A sugestão do sistema é apenas indicativa.
 * - A conclusão técnica definitiva é SEMPRE de responsabilidade humana do assessor.
 */
export function sugerirConclusaoPertinencia(respostas: Pertinencia['respostas']): ConclusaoPertinencia {
  const vals = Object.values(respostas);
  const temFalso = vals.some((v) => v === false);
  const temNulo = vals.some((v) => v === null);
  const todosVerdadeiros = vals.every((v) => v === true);

  if (todosVerdadeiros) {
    return 'PERTINENTE';
  }
  // Se competência ou benefício forem expressamente falsos: não pertinente
  if (respostas.competenciaNecessidade === false || respostas.beneficioInteressePublico === false) {
    return 'NAO_PERTINENTE';
  }
  // Se houver respostas negativas ou nulas (pendentes de comprovação): não demonstrada
  if (temFalso || temNulo) {
    return 'NAO_DEMONSTRADA';
  }
  return 'PERTINENTE_COM_JUSTIFICATIVA';
}

/**
 * Valida o preenchimento da etapa de Pertinência Institucional (S2.2).
 * - RN02: Pertinência avaliada com evidência, justificativa e providência.
 * - Validação humana obrigatória: conclusão deve ser explicitamente selecionada.
 */
export function validarPertinencia(pertinencia: Partial<Pertinencia>): ResultadoValidacaoPertinencia {
  const erros: Record<string, string> = {};
  const avisos: Record<string, string> = {};

  const respostas = pertinencia.respostas || {
    competenciaNecessidade: null,
    vinculoPlanejamento: null,
    beneficioInteressePublico: null,
    custoProporcionalidade: null,
    economicidade: null
  };

  // 1. Verificação se ao menos uma pergunta foi avaliada
  const totalRespondidos = Object.values(respostas).filter((v) => v !== null).length;
  if (totalRespondidos === 0) {
    erros.respostas = 'Avalie ao menos um dos cinco critérios da pertinência institucional (Sim/Não).';
  }

  // 2. Conclusão da Pertinência (Obrigatória - Validação Humana RN02)
  if (!pertinencia.conclusao) {
    erros.conclusao = 'A conclusão sobre a pertinência institucional é obrigatória (RN02).';
  }

  // 3. Evidências dos autos (Obrigatório)
  if (!pertinencia.evidencias || !pertinencia.evidencias.trim()) {
    erros.evidencias = 'Indique as peças ou evidências dos autos que sustentam o juízo de pertinência (ex.: ETP, TR, Nota Técnica).';
  } else if (pertinencia.evidencias.trim().length < 5) {
    erros.evidencias = 'Descreva a evidência com clareza suficiente (mínimo de 5 caracteres).';
  }

  // 4. Justificativa do assessor (Obrigatório)
  if (!pertinencia.justificativa || !pertinencia.justificativa.trim()) {
    erros.justificativa = 'A justificativa técnica fundamentada do assessor é obrigatória.';
  } else if (pertinencia.justificativa.trim().length < 10) {
    erros.justificativa = 'A justificativa deve ser detalhada e fundamentada (mínimo de 10 caracteres).';
  }

  // 5. Providência recomendada (Obrigatório)
  if (!pertinencia.providencia || !pertinencia.providencia.trim()) {
    erros.providencia = 'Informe a providência ou encaminhamento recomendado pelo assessor.';
  }

  const sugestaoIndicativa = sugerirConclusaoPertinencia(respostas);

  // Alerta humano se houver divergência entre a sugestão do sistema e a validação do assessor
  if (pertinencia.conclusao && pertinencia.conclusao !== sugestaoIndicativa) {
    avisos.conclusao = `A conclusão validada (${pertinencia.conclusao}) diverge da sugestão do sistema (${sugestaoIndicativa}). A avaliação humana prevalece mediante a justificativa registrada (RN02).`;
  }

  return {
    valido: Object.keys(erros).length === 0,
    erros,
    avisos,
    sugestaoIndicativa
  };
}

// ==========================================
// 3. CONFORMIDADE DOCUMENTAL E CONDICIONANTES (S2.3)
// ==========================================

export interface EstatisticasConformidade {
  totalItens: number;
  itensOk: number;
  itensPendentes: number;
  itensNaoAplicaveis: number;
  itensConfirmar: number;
  totalCondicionantes: number;
  condicionantesAtendidas: number;
  condicionantesPendentes: number;
  condicionantesEmCumprimento: number;
  condicionantesNaoAplicaveis: number;
}

export interface ResultadoValidacaoConformidade {
  valido: boolean;
  erros: Record<string, string>;
  avisos: Record<string, string>;
  estatisticas: EstatisticasConformidade;
}

/**
 * Traduz o status do checklist para exibição em português.
 */
export function formatarStatusConformidade(status: StatusConformidade): string {
  switch (status) {
    case 'ok':
      return 'Conforme / Juntado aos autos';
    case 'pendente':
      return 'Pendente / Não localizado';
    case 'nao_aplicavel':
      return 'Não se aplica a este processo';
    case 'confirmar':
      return 'A confirmar / Exige diligência';
    default:
      return status;
  }
}

/**
 * Traduz a situação da condicionante jurídica para exibição em português.
 */
export function formatarSituacaoCondicionante(situacao: SituacaoCondicionante): string {
  switch (situacao) {
    case 'atendida':
      return 'Atendida / Cumprida';
    case 'pendente':
      return 'Pendente de cumprimento';
    case 'em_cumprimento':
      return 'Em cumprimento / Acompanhamento';
    case 'nao_aplicavel':
      return 'Não aplicável superveniente';
    default:
      return situacao;
  }
}

/**
 * Valida o preenchimento da etapa de Conformidade Documental e Condicionantes (S2.3).
 * Critérios essenciais:
 * - Deve haver ao menos um item de checklist instrucional.
 * - Justificar obrigatoriamente quando o status for 'nao_aplicavel' (mínimo 5 caracteres).
 * - Condicionantes pendentes ou em cumprimento devem registrar providência saneadora.
 * - Não presume conclusão jurídica definitiva: pendências documentais geram avisos/quadro informativo
 *   para embasamento de achados (Etapa 4) e riscos (Etapa 5), sem inventar presunções legais.
 */
export function validarConformidade(
  checklist: ItemConformidade[],
  condicionantes: Condicionante[]
): ResultadoValidacaoConformidade {
  const erros: Record<string, string> = {};
  const avisos: Record<string, string> = {};

  // 1. Verificação da existência de itens no checklist
  if (!checklist || checklist.length === 0) {
    erros.checklist = 'O checklist de conformidade deve conter ao menos um item de instrução.';
  }

  // 2. Validação individual de cada item do checklist
  checklist.forEach((item, index) => {
    const num = index + 1;
    if (!item.descricao || !item.descricao.trim()) {
      erros[`chk_${item.id}_descricao`] = `Item ${num}: A descrição do documento ou requisito é obrigatória.`;
    }

    // Regra explícita da S2.3: "justificar não aplicabilidade"
    if (item.status === 'nao_aplicavel') {
      if (!item.justificativaNaoAplicavel || !item.justificativaNaoAplicavel.trim()) {
        erros[`chk_${item.id}_justificativa`] = `Item "${item.descricao}": Informe a justificativa da não aplicabilidade (obrigatória).`;
      } else if (item.justificativaNaoAplicavel.trim().length < 5) {
        erros[`chk_${item.id}_justificativa`] = `Item "${item.descricao}": A justificativa da não aplicabilidade deve ter ao menos 5 caracteres.`;
      }
    }
  });

  // 3. Validação individual de cada condicionante jurídica
  condicionantes.forEach((cond, index) => {
    const num = index + 1;
    if (!cond.descricao || !cond.descricao.trim()) {
      erros[`cond_${cond.id}_descricao`] = `Condicionante ${num}: A descrição da condicionante jurídica é obrigatória.`;
    }
    if (!cond.referenciaParecer || !cond.referenciaParecer.trim()) {
      erros[`cond_${cond.id}_referencia`] = `Condicionante ${num}: Indique a referência do parecer jurídico (ex.: Parecer PGE nº XX/2026, item YY).`;
    }

    // Se pendente ou em cumprimento, exige providência recomendada
    if (cond.situacao === 'pendente' || cond.situacao === 'em_cumprimento') {
      if (!cond.providencia || !cond.providencia.trim()) {
        erros[`cond_${cond.id}_providencia`] = `Condicionante ${num}: Informe a providência ou ação necessária para saneamento.`;
      }
    }
  });

  // 4. Estatísticas consolidadas
  const estatisticas: EstatisticasConformidade = {
    totalItens: checklist.length,
    itensOk: checklist.filter((i) => i.status === 'ok').length,
    itensPendentes: checklist.filter((i) => i.status === 'pendente').length,
    itensNaoAplicaveis: checklist.filter((i) => i.status === 'nao_aplicavel').length,
    itensConfirmar: checklist.filter((i) => i.status === 'confirmar').length,
    totalCondicionantes: condicionantes.length,
    condicionantesAtendidas: condicionantes.filter((c) => c.situacao === 'atendida').length,
    condicionantesPendentes: condicionantes.filter((c) => c.situacao === 'pendente').length,
    condicionantesEmCumprimento: condicionantes.filter((c) => c.situacao === 'em_cumprimento').length,
    condicionantesNaoAplicaveis: condicionantes.filter((c) => c.situacao === 'nao_aplicavel').length
  };

  // 5. Avisos informativos (sem bloquear a navegação, pois pendências alimentam as etapas 4 e 5)
  if (estatisticas.itensPendentes > 0) {
    avisos.checklistPendencias = `Constam ${estatisticas.itensPendentes} item(ns) de instrução com status "Pendente / Não localizado".`;
  }
  if (estatisticas.itensConfirmar > 0) {
    avisos.checklistConfirmar = `Constam ${estatisticas.itensConfirmar} item(ns) com status "A confirmar / Exige diligência".`;
  }
  if (estatisticas.condicionantesPendentes > 0) {
    avisos.condicionantesPendentes = `Constam ${estatisticas.condicionantesPendentes} condicionante(s) jurídica(s) pendente(s) de cumprimento.`;
  }

  return {
    valido: Object.keys(erros).length === 0,
    erros,
    avisos,
    estatisticas
  };
}
