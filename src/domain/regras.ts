/**
 * CONFORMA GSASP — Motor de Regras e Análise de Conformidade (Sprint 3 — S3.2)
 *
 * Princípios de Governança e Regras de Negócio:
 * 1. O sistema confere e organiza; o assessor valida e a autoridade decide (RN02, RN07).
 * 2. Puramente determinístico, sem integração com IA externa (RN08, Seção 8 de docs/contexto.md).
 * 3. Mesma entrada produz estritamente a mesma saída (funções puras, idempotentes).
 * 4. Imutabilidade: não altera dados recebidos nem sobrescreve decisões humanas.
 * 5. Não converte ausência de dados ou ausência de achados em aprovação para assinatura (RN11).
 * 6. "Classificação pendente" é um estado de avaliação do apontamento (classificacaoSugerida === null),
 *    e não uma quinta categoria de gravidade. As quatro categorias oficiais são da RN04:
 *    IMPEDITIVO, RELEVANTE, FORMAL e MELHORIA.
 * 7. "Não se aplica" dispensa somente a checagem correspondente no protótipo, sujeita à revisão humana.
 * 8. Não afirma que um documento inexiste nos autos reais por ausência de registro no formulário.
 */

import type {
  Processo,
  Pertinencia,
  ItemConformidade,
  Condicionante,
  Achado
} from './tipos.ts';

// ==========================================
// ESTRUTURAS DE SAÍDA DO MOTOR
// ==========================================

export interface DivergenciaHumana {
  regraId: string;
  tipo: 'PERTINENCIA_DIVERGENTE';
  mensagem: string;
  detalhes: {
    conclusaoHumana: string;
    sugestaoSistema: string;
    criteriosDesfavoraveis: string[];
  };
}

export interface AlertaInstrucao {
  regraId: string;
  tipo: 'INSTRUCAO_INCOMPLETA' | 'PENDENCIA_PREENCHIMENTO';
  mensagem: string;
  camposPendentes: string[];
}

export interface EntradaAnaliseRegras {
  processo?: Processo | null | Partial<Processo>;
  pertinencia?: Pertinencia | null | Partial<Pertinencia>;
  checklist?: ItemConformidade[] | null;
  condicionantes?: Condicionante[] | null;
}

export interface ResumoAchados {
  totalAchados: number;
  impeditivos: number;
  relevantes: number;
  formais: number;
  melhorias: number;
  pendentesClassificacao: number;
}

export interface ResultadoMotorRegras {
  achados: Achado[];
  divergencias: DivergenciaHumana[];
  alertasInstrucao: AlertaInstrucao[];
  resumo: ResumoAchados;
}

// ==========================================
// 1. REG-01 — VIGÊNCIA INCONSISTENTE
// ==========================================

/**
 * Avalia inconsistência cronológica nas datas de vigência (REG-01).
 *
 * Dispara se vigência for aplicável, ambas as datas constarem cadastradas
 * e a data de término for anterior à data de início.
 */
export function avaliarRegra01VigenciaInconsistente(
  processo?: Partial<Processo> | null
): { achado: Achado | null; alerta: AlertaInstrucao | null } {
  if (!processo) {
    return { achado: null, alerta: null };
  }

  // Se vigência foi marcada como não aplicável, a checagem é dispensada no protótipo (sujeito à revisão humana)
  if (processo.vigenciaNaoAplicavel === true) {
    return { achado: null, alerta: null };
  }

  const inicio = processo.vigenciaInicio?.trim();
  const fim = processo.vigenciaFim?.trim();

  // Tratamento de ausência: se faltar uma ou ambas as datas
  if (!inicio || !fim) {
    const camposPendentes: string[] = [];
    if (!inicio) camposPendentes.push('vigenciaInicio');
    if (!fim) camposPendentes.push('vigenciaFim');

    return {
      achado: null,
      alerta: {
        regraId: 'REG-01-VIGENCIA-INCONSISTENTE',
        tipo: 'PENDENCIA_PREENCHIMENTO',
        mensagem: 'Vigência do processo ainda não informada integralmente.',
        camposPendentes
      }
    };
  }

  // Condição de disparo: término anterior ao início
  if (fim < inicio) {
    const achado: Achado = {
      id: 'achado-reg01-vigencia-inconsistente',
      regraId: 'REG-01-VIGENCIA-INCONSISTENTE',
      titulo: 'Inconsistência Cronológica de Datas de Vigência a Conferir',
      evidencia: `Data final de vigência cadastrada (${fim}) anterior à data inicial de vigência (${inicio}).`,
      regraOuMotivo:
        'Princípio da continuidade dos ajustes contratuais, segurança jurídica e coerência temporal dos atos administrativos (Lei nº 14.133/2021, art. 105). O período de vigência delimita temporalmente a eficácia dos direitos e obrigações.',
      impacto:
        'Inconsistência no cômputo do prazo do instrumento, risco de execução sem respaldo temporal regular ou necessidade de retificação formal do termo.',
      providencia:
        'Conferir a fonte documental, corrigir eventual erro de cadastro na interface ou, caso a divergência conste no documento original autuado, solicitar a retificação adequada ao setor responsável antes da subscrição.',
      responsavel: 'Assessor do GSASP / Setor Demandante',
      classificacaoSugerida: 'FORMAL', // Sugestão preliminar demonstrativa como inconsistência a conferir
      classificacao: 'FORMAL',
      classificacaoValidada: null,
      estadoValidacao: 'SUGESTAO_SISTEMA'
    };

    return { achado, alerta: null };
  }

  return { achado: null, alerta: null };
}

// ==========================================
// 2. REG-02 — PERTINÊNCIA INSTITUCIONAL
// ==========================================

const ROTULOS_CRITERIOS_PERTINENCIA: Record<string, string> = {
  competenciaNecessidade: 'Competência / Necessidade',
  vinculoPlanejamento: 'Vínculo ao Planejamento',
  beneficioInteressePublico: 'Benefício ao Interesse Público',
  custoProporcionalidade: 'Custo / Proporcionalidade',
  economicidade: 'Economicidade'
};

/**
 * Avalia a pertinência institucional (REG-02), distinguindo os três estados:
 * 1. Não pertinente (IMPEDITIVO sugerido)
 * 2. Pertinência não demonstrada (RELEVANTE sugerido)
 * 3. Avaliação ainda não concluída (Classificação pendente se houver 'Não', ou Alerta de instrução incompleta)
 *
 * Preserva soberanamente conclusões humanas favoráveis divergentes, sinalizando a divergência para revisão.
 */
export function avaliarRegra02Pertinencia(
  pertinencia?: Partial<Pertinencia> | null
): {
  achado: Achado | null;
  divergencia: DivergenciaHumana | null;
  alerta: AlertaInstrucao | null;
} {
  if (!pertinencia) {
    return {
      achado: null,
      divergencia: null,
      alerta: {
        regraId: 'REG-02-PERTINENCIA-NAO-DEMONSTRADA',
        tipo: 'INSTRUCAO_INCOMPLETA',
        mensagem: 'Etapa de pertinência institucional não informada na análise.',
        camposPendentes: ['pertinencia']
      }
    };
  }

  const respostas = pertinencia.respostas || {
    competenciaNecessidade: null,
    vinculoPlanejamento: null,
    beneficioInteressePublico: null,
    custoProporcionalidade: null,
    economicidade: null
  };

  // Identifica critérios desfavoráveis explícitos ("Não" / false)
  const criteriosDesfavoraveis: string[] = [];
  for (const [chave, valor] of Object.entries(respostas)) {
    if (valor === false) {
      criteriosDesfavoraveis.push(ROTULOS_CRITERIOS_PERTINENCIA[chave] || chave);
    }
  }

  const conclusao = pertinencia.conclusao;

  // ESTADO 1: Conclusão humana expressa 'NAO_PERTINENTE'
  if (conclusao === 'NAO_PERTINENTE') {
    const achado: Achado = {
      id: 'achado-reg02-nao-pertinente',
      regraId: 'REG-02-PERTINENCIA-NAO-DEMONSTRADA',
      titulo: 'Pertinência Institucional Não Demonstrada',
      evidencia:
        'Conclusão técnica do assessor registrando que o objeto é NÃO PERTINENTE às finalidades ou competências do órgão.',
      regraOuMotivo:
        'A conformidade jurídica e orçamentária depende do vínculo entre o objeto e os objetivos estratégicos, competências e conveniência do órgão público (RN02). A contratação deve atender ao interesse público comprovado.',
      impacto:
        'Risco de despesa pública desprovida de motivação fática suficiente, vulnerabilidade a questionamentos por órgãos de controle e potencial antieconomicidade.',
      providencia:
        'Restituir os autos ao setor demandante para juntada de justificativas complementares, ou emitir manifestação técnica circunstanciada fundamentando a decisão a ser submetida à autoridade superior.',
      responsavel: 'Assessor do GSASP / Setor Demandante',
      classificacaoSugerida: 'IMPEDITIVO',
      classificacao: 'IMPEDITIVO',
      classificacaoValidada: null,
      estadoValidacao: 'SUGESTAO_SISTEMA'
    };

    return { achado, divergencia: null, alerta: null };
  }

  // ESTADO 2: Conclusão humana expressa 'NAO_DEMONSTRADA'
  if (conclusao === 'NAO_DEMONSTRADA') {
    const achado: Achado = {
      id: 'achado-reg02-pertinencia-nao-demonstrada',
      regraId: 'REG-02-PERTINENCIA-NAO-DEMONSTRADA',
      titulo: 'Pertinência Institucional Não Demonstrada',
      evidencia:
        'Conclusão técnica do assessor registrando que a pertinência NÃO RESTOU DEMONSTRADA na instrução processual atual.',
      regraOuMotivo:
        'A conformidade jurídica e orçamentária depende do vínculo entre o objeto e os objetivos estratégicos, competências e conveniência do órgão público (RN02). A contratação deve atender ao interesse público comprovado.',
      impacto:
        'Risco de despesa pública sem motivação fática suficiente, vulnerabilidade a questionamentos por órgãos de controle e potencial antieconomicidade.',
      providencia:
        'Restituir os autos ao setor demandante para juntada de documentação complementar justificando a pertinência, ou emitir manifestação técnica fundamentada para subsidiar a decisão superior.',
      responsavel: 'Assessor do GSASP / Setor Demandante',
      classificacaoSugerida: 'RELEVANTE',
      classificacao: 'RELEVANTE',
      classificacaoValidada: null,
      estadoValidacao: 'SUGESTAO_SISTEMA'
    };

    return { achado, divergencia: null, alerta: null };
  }

  // DIVERGÊNCIA HUMANA: Conclusão favorável pelo assessor, mas com critério desfavorável
  if (conclusao === 'PERTINENTE' || conclusao === 'PERTINENTE_COM_JUSTIFICATIVA') {
    if (criteriosDesfavoraveis.length > 0) {
      // PRESERVAÇÃO INTEGRAL DA DECISÃO HUMANA:
      // O motor não gera achado de recusa material, apenas emite divergência para conferência e revisão
      const divergencia: DivergenciaHumana = {
        regraId: 'REG-02-PERTINENCIA-NAO-DEMONSTRADA',
        tipo: 'PERTINENCIA_DIVERGENTE',
        mensagem: `A conclusão humana favorável (${conclusao}) diverge de critério(s) preliminar(es) assinalado(s) como desfavorável(is) (${criteriosDesfavoraveis.join(', ')}). A decisão humana é soberana, mas exige justificativa técnica robusta nos autos.`,
        detalhes: {
          conclusaoHumana: conclusao,
          sugestaoSistema: 'NAO_DEMONSTRADA',
          criteriosDesfavoraveis
        }
      };

      return { achado: null, divergencia, alerta: null };
    }

    // Processo regular completo em pertinência
    return { achado: null, divergencia: null, alerta: null };
  }

  // ESTADO 3: Avaliação ainda não concluída (conclusao == null)
  if (!conclusao) {
    if (criteriosDesfavoraveis.length > 0) {
      // Há critério desfavorável marcado sem que o assessor tenha firmado a conclusão técnica
      const achado: Achado = {
        id: 'achado-reg02-criterio-sob-avaliacao',
        regraId: 'REG-02-PERTINENCIA-NAO-DEMONSTRADA',
        titulo: 'Pertinência Institucional com Critérios sob Avaliação',
        evidencia: `Critério(s) de pertinência com resposta preliminar desfavorável (${criteriosDesfavoraveis.join(', ')}) sem conclusão humana firmada no formulário.`,
        regraOuMotivo:
          'A conformidade prévia exige a análise conclusiva de pertinência pelo assessor antes do fechamento da instrução (RN02/RN11). Respostas negativas não decidem sozinhas sem conclusão do assessor.',
        impacto:
          'Pendência de instrução na definição da conveniência e pertinência institucional da contratação.',
        providencia:
          'O assessor deve analisar as justificativas nos autos e registrar formalmente a conclusão técnica de pertinência.',
        responsavel: 'Assessor do GSASP',
        classificacaoSugerida: null, // "Classificação pendente de validação humana" (estado de avaliação)
        classificacao: null,
        classificacaoValidada: null,
        estadoValidacao: 'SUGESTAO_SISTEMA'
      };

      return { achado, divergencia: null, alerta: null };
    }

    // Sem conclusão e sem critério 'false' (critérios em null, vazios ou Sim sem conclusão)
    return {
      achado: null,
      divergencia: null,
      alerta: {
        regraId: 'REG-02-PERTINENCIA-NAO-DEMONSTRADA',
        tipo: 'INSTRUCAO_INCOMPLETA',
        mensagem: 'Etapa de pertinência institucional com avaliação em aberto (conclusão técnica não selecionada).',
        camposPendentes: ['conclusao']
      }
    };
  }

  return { achado: null, divergencia: null, alerta: null };
}

// ==========================================
// 3. REG-03 — CONDICIONANTE SEM PROVIDÊNCIA
// ==========================================

/**
 * Avalia condicionantes em estado "pendente" ou "em cumprimento" que NÃO possuem
 * providência declarada no formulário (REG-03).
 *
 * Mantém a classificação pendente de validação humana, sem associar automaticamente
 * gravidade impeditiva.
 */
export function avaliarRegra03CondicionanteSemProvidencia(
  condicionantes?: Condicionante[] | null
): Achado[] {
  if (!condicionantes || !Array.isArray(condicionantes)) {
    return [];
  }

  const achados: Achado[] = [];

  for (const c of condicionantes) {
    const situacaoAtiva = c.situacao === 'pendente' || c.situacao === 'em_cumprimento';
    const providenciaVazia = !c.providencia || c.providencia.trim() === '';

    if (situacaoAtiva && providenciaVazia) {
      achados.push({
        id: `achado-reg03-condicionante-${c.id}`,
        regraId: 'REG-03-CONDICIONANTE-SEM-PROVIDENCIA',
        titulo: 'Condicionante Jurídica Pendente ou em Cumprimento sem Providência Declarada',
        evidencia: `Condicionante jurídica do parecer (${c.referenciaParecer?.trim() || 'ref. não informada'}) em situação "${c.situacao}": "${c.descricao}", sem registro de providência de saneamento no formulário.`,
        regraOuMotivo:
          'Manifestações jurídicas com ressalvas ou condicionantes requerem tratamento administrativo para atendimento das orientações fixadas pelo órgão consultivo.',
        impacto:
          'Risco de celebração ou prosseguimento da contratação sem encaminhamento das recomendações expedidas pela consultoria jurídica.',
        providencia:
          'Examinar o parecer jurídico para identificar a ação saneadora necessária, definindo a providência administrativa, o setor responsável e o cronograma de atendimento.',
        responsavel: c.responsavel?.trim() || 'Assessor do GSASP / Setor Demandante',
        classificacaoSugerida: null, // "Classificação pendente de validação humana" (estado de avaliação)
        classificacao: null,
        classificacaoValidada: null,
        estadoValidacao: 'SUGESTAO_SISTEMA'
      });
    }
  }

  return achados;
}

// ==========================================
// 4. REG-04 — CONDICIONANTE COM PROVIDÊNCIA
// ==========================================

/**
 * Avalia condicionantes em estado "pendente" ou "em cumprimento" que possuem
 * providência declarada no formulário (REG-04).
 *
 * Registra que providência planejada NÃO comprova cumprimento da condicionante e
 * não reduz a classificação de risco. Mantém a classificação pendente de validação humana.
 */
export function avaliarRegra04CondicionanteComProvidencia(
  condicionantes?: Condicionante[] | null
): Achado[] {
  if (!condicionantes || !Array.isArray(condicionantes)) {
    return [];
  }

  const achados: Achado[] = [];

  for (const c of condicionantes) {
    const situacaoAtiva = c.situacao === 'pendente' || c.situacao === 'em_cumprimento';
    const providenciaPreenchida = Boolean(c.providencia && c.providencia.trim() !== '');

    if (situacaoAtiva && providenciaPreenchida) {
      achados.push({
        id: `achado-reg04-condicionante-${c.id}`,
        regraId: 'REG-04-CONDICIONANTE-COM-PROVIDENCIA',
        titulo: 'Condicionante Jurídica Pendente ou em Cumprimento com Providência Declarada',
        evidencia: `Condicionante jurídica do parecer (${c.referenciaParecer?.trim() || 'ref. não informada'}) em situação "${c.situacao}": "${c.descricao}", constando providência declarada: "${c.providencia}".`,
        regraOuMotivo:
          'A conformidade com a manifestação jurídica requer a comprovação documental do saneamento das condicionantes antes da prática do ato ou a gestão rigorosa de suas ressalvas durante a execução. Providência declarada não comprova cumprimento.',
        impacto:
          'Risco de celebração ou prosseguimento contratual amparado em plano de ação sem a efetiva constatação do cumprimento nos autos processuais.',
        providencia:
          'Verificar se a providência informada atende integralmente ao parecer jurídico e acompanhar a efetiva juntada da respectiva comprovação documental aos autos.',
        responsavel: c.responsavel?.trim() || 'Assessor do GSASP / Fiscal do Contrato',
        classificacaoSugerida: null, // "Classificação pendente de validação humana" (estado de avaliação)
        classificacao: null,
        classificacaoValidada: null,
        estadoValidacao: 'SUGESTAO_SISTEMA'
      });
    }
  }

  return achados;
}

// ==========================================
// 5. REG-05 — DOCUMENTO A CONFIRMAR
// ==========================================

/**
 * Avalia itens de checklist assinalados com o status "A confirmar" (REG-05).
 *
 * Não afirma inexistência nos autos reais (apenas pendência no formulário) e mantém
 * a classificação pendente de validação humana, sem presumir essencialidade do documento.
 */
export function avaliarRegra05DocumentoAConfirmar(
  checklist?: ItemConformidade[] | null
): Achado[] {
  if (!checklist || !Array.isArray(checklist)) {
    return [];
  }

  const achados: Achado[] = [];

  for (const item of checklist) {
    if (item.status === 'confirmar') {
      const obsTexto = item.observacao?.trim() ? ` (Observação: ${item.observacao.trim()})` : '';

      achados.push({
        id: `achado-reg05-item-${item.id}`,
        regraId: 'REG-05-DOCUMENTO-A-CONFIRMAR',
        titulo: 'Item da Instrução Processual com Conferência em Aberto ("A Confirmar")',
        evidencia: `Item do checklist "${item.descricao}" assinalado com status "A confirmar"${obsTexto}.`,
        regraOuMotivo:
          'A instrução processual deve assegurar a higidez das peças obrigatórias. A existência de dúvida não suprida no formulário impede o ateste seguro de regularidade (RN11). Não se afirma inexistência nos autos reais, apenas pendência de conferência no formulário.',
        impacto:
          'Risco de prosseguimento da análise com peça documental não localizada ou em dúvida no formulário.',
        providencia:
          'Realizar diligência no processo para verificar a existência, validade e adequação do documento ou certidão, atualizando o status para "ok" após constatação ou registrando a pendência formal.',
        responsavel: 'Assessor do GSASP / Setor Demandante',
        classificacaoSugerida: null, // "Classificação pendente de validação humana" (estado de avaliação)
        classificacao: null,
        classificacaoValidada: null,
        estadoValidacao: 'SUGESTAO_SISTEMA'
      });
    }
  }

  return achados;
}

// ==========================================
// 6. REG-06 — NÃO APLICÁVEL SEM JUSTIFICATIVA
// ==========================================

/**
 * Avalia itens dispensados no checklist ("Não aplicável") com justificativa ausente
 * ou abaixo do mínimo técnico de 5 caracteres (REG-06).
 *
 * Registra que menos de 5 caracteres não comprova falta de fundamento jurídico,
 * e 5 ou mais caracteres também não comprovam justificativa adequada.
 */
export function avaliarRegra06NaoAplicavelSemJustificativa(
  checklist?: ItemConformidade[] | null
): Achado[] {
  if (!checklist || !Array.isArray(checklist)) {
    return [];
  }

  const achados: Achado[] = [];

  for (const item of checklist) {
    if (item.status === 'nao_aplicavel') {
      const just = item.justificativaNaoAplicavel?.trim() || '';

      if (just.length < 5) {
        const textoJust = just.length > 0 ? ` ("${just}")` : '';

        achados.push({
          id: `achado-reg06-item-${item.id}`,
          regraId: 'REG-06-NAO-APLICABILIDADE-SEM-JUSTIFICATIVA',
          titulo:
            'Item marcado como não aplicável com justificativa ausente ou abaixo do mínimo técnico de preenchimento.',
          evidencia: `Item "${item.descricao}" assinalado como não aplicável com justificativa ausente ou inferior ao piso técnico de 5 caracteres${textoJust}.`,
          regraOuMotivo:
            'Princípio da motivação dos atos administrativos (Lei nº 14.133/2021). A dispensa de exigência padrão requer motivação expressa demonstrando a incompatibilidade com o objeto. Menos de 5 caracteres não comprova falta de fundamento jurídico; 5 ou mais caracteres também não comprovam justificativa adequada.',
          impacto:
            'Risco de dispensa de item da instrução sem o registro da justificativa cabível no formulário.',
          providencia:
            'Registrar justificativa circunstanciada indicando as razões fáticas ou jurídicas que justificam o afastamento do item no caso concreto, ou reintegrar o item à conferência.',
          responsavel: 'Assessor do GSASP',
          classificacaoSugerida: null, // "Classificação pendente de validação humana" (estado de avaliação)
          classificacao: null,
          classificacaoValidada: null,
          estadoValidacao: 'SUGESTAO_SISTEMA'
        });
      }
    }
  }

  return achados;
}

// ==========================================
// 7. MOTOR CONSOLIDADO (S3.2)
// ==========================================

/**
 * Executa todas as regras funcionais do catálogo (REG-01 a REG-06) sobre a análise consolidada.
 *
 * Propriedades fundamentais:
 * - Determinístico e puro: mesma entrada produz rigorosamente a mesma saída.
 * - Imutável: não altera os objetos de entrada.
 * - Não converte ausência de dados ou ausência de achados em aprovação para assinatura.
 * - Não substitui conclusões humanas nem gera conclusões executivas automáticas.
 */
export function executarMotorRegras(entrada: EntradaAnaliseRegras): ResultadoMotorRegras {
  const achados: Achado[] = [];
  const divergencias: DivergenciaHumana[] = [];
  const alertasInstrucao: AlertaInstrucao[] = [];

  // REG-01: Vigência
  const r01 = avaliarRegra01VigenciaInconsistente(entrada.processo);
  if (r01.achado) achados.push(r01.achado);
  if (r01.alerta) alertasInstrucao.push(r01.alerta);

  // REG-02: Pertinência
  const r02 = avaliarRegra02Pertinencia(entrada.pertinencia);
  if (r02.achado) achados.push(r02.achado);
  if (r02.divergencia) divergencias.push(r02.divergencia);
  if (r02.alerta) alertasInstrucao.push(r02.alerta);

  // REG-03: Condicionantes sem providência
  const r03 = avaliarRegra03CondicionanteSemProvidencia(entrada.condicionantes);
  achados.push(...r03);

  // REG-04: Condicionantes com providência
  const r04 = avaliarRegra04CondicionanteComProvidencia(entrada.condicionantes);
  achados.push(...r04);

  // REG-05: Documento a confirmar
  const r05 = avaliarRegra05DocumentoAConfirmar(entrada.checklist);
  achados.push(...r05);

  // REG-06: Não aplicável sem justificativa
  const r06 = avaliarRegra06NaoAplicavelSemJustificativa(entrada.checklist);
  achados.push(...r06);

  // Consolidação de contadores do resumo
  let impeditivos = 0;
  let relevantes = 0;
  let formais = 0;
  let melhorias = 0;
  let pendentesClassificacao = 0;

  for (const a of achados) {
    if (a.classificacaoSugerida === 'IMPEDITIVO') impeditivos++;
    else if (a.classificacaoSugerida === 'RELEVANTE') relevantes++;
    else if (a.classificacaoSugerida === 'FORMAL') formais++;
    else if (a.classificacaoSugerida === 'MELHORIA') melhorias++;
    else if (a.classificacaoSugerida === null) pendentesClassificacao++;
  }

  const resumo: ResumoAchados = {
    totalAchados: achados.length,
    impeditivos,
    relevantes,
    formais,
    melhorias,
    pendentesClassificacao
  };

  return {
    achados,
    divergencias,
    alertasInstrucao,
    resumo
  };
}
