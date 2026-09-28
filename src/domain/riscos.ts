/**
 * CONFORMA GSASP — Domínio e Regras de Avaliação de Riscos (S3.4)
 * Base: docs/contexto.md (RN11, RN12), docs/sprint.md e docs/regras-funcionais.md
 * 
 * Princípios de Governança (RN12):
 * 1. A avaliação de riscos é conduzida exclusivamente pelo juízo técnico do assessor.
 * 2. Não há atribuição automática de pesos, matrizes matemáticas ou fórmulas sem aprovação metodológica prévia.
 * 3. A ausência de achados apontados NÃO presume automaticamente risco baixo.
 * 4. Critérios e perguntas orientadoras são expressamente demonstrativos e de apoio ao raciocínio humano.
 * 5. Toda atribuição de nível exige justificativa técnica e permite vínculo formal com achados validados.
 */

import type {
  DimensaoRisco,
  NivelRisco,
  Risco,
  Achado
} from './tipos.ts';

export const DIMENSOES_RISCO: readonly DimensaoRisco[] = [
  'juridica',
  'financeira',
  'operacional',
  'controle'
] as const;

export const NIVEIS_RISCO: readonly NivelRisco[] = [
  'baixo',
  'moderado',
  'alto',
  'critico'
] as const;

export interface MetadadosDimensao {
  dimensao: DimensaoRisco;
  nome: string;
  icone: string;
  descricao: string;
  perguntasOrientadoras: string[];
}

export interface MetadadosNivel {
  nivel: NivelRisco;
  rotulo: string;
  descricao: string;
  badgeClass: string;
  corHex: string;
}

export const METADADOS_DIMENSOES: Record<DimensaoRisco, MetadadosDimensao> = {
  juridica: {
    dimensao: 'juridica',
    nome: 'Jurídica',
    icone: '⚖️',
    descricao:
      'Avalia o risco de anulação, vício formal, impugnação judicial ou descumprimento de condicionantes apontadas pela PGE ou assessoria jurídica.',
    perguntasOrientadoras: [
      'Há condicionantes jurídicas da PGE ainda pendentes ou em cumprimento?',
      'O instrumento adota a minuta-padrão e o regime jurídico correto?',
      'As datas de vigência e as cláusulas essenciais estão consistentes e sem vícios?'
    ]
  },
  financeira: {
    dimensao: 'financeira',
    nome: 'Financeira',
    icone: '💰',
    descricao:
      'Avalia o risco de insuficiência orçamentária, falha na estimativa de custos, prejuízo ao erário ou glosas em prestação de contas.',
    perguntasOrientadoras: [
      'A dotação orçamentária, nota de reserva e conformidade de empenho estão atestadas?',
      'Os valores pactuados e pesquisas de mercado apresentam consistência documental?',
      'Há previsão adequada de garantia contratual ou risco de inadimplemento?'
    ]
  },
  operacional: {
    dimensao: 'operacional',
    nome: 'Operacional',
    icone: '⚙️',
    descricao:
      'Avalia o risco de paralisação, atrasos na execução do objeto, deficiência na fiscalização ou descontinuidade das atividades de segurança pública.',
    perguntasOrientadoras: [
      'Foram formalmente designados gestor e fiscal do contrato/convênio?',
      'O cronograma físico-financeiro e os prazos são factíveis para a administração?',
      'A eventual interrupção do fornecimento afetará a rotina ou operações essenciais?'
    ]
  },
  controle: {
    dimensao: 'controle',
    nome: 'Controle',
    icone: '🔍',
    descricao:
      'Avalia o risco de auditorias desfavoráveis, determinações, sanções ou recomendações de órgãos de controle interno e externo (CGE, TCE-MT, MP).',
    perguntasOrientadoras: [
      'O procedimento observa a transparência ativa e publicações de praxe?',
      'Há reincidência de apontamentos anteriores em instrumentos congêneres?',
      'A instrução processual reúne todas as peças comprobatórias necessárias?'
    ]
  }
};

export const METADADOS_NIVEIS: Record<NivelRisco, MetadadosNivel> = {
  baixo: {
    nivel: 'baixo',
    rotulo: 'Baixo',
    descricao: 'Risco residual gerenciável pela rotina administrativa ordinária, sem óbices relevantes.',
    badgeClass: 'tag-risco-baixo',
    corHex: '#2e7d32'
  },
  moderado: {
    nivel: 'moderado',
    rotulo: 'Moderado',
    descricao: 'Exige atenção ou mitigação com acompanhamento pela fiscalização ou setor técnico.',
    badgeClass: 'tag-risco-moderado',
    corHex: '#b26a00'
  },
  alto: {
    nivel: 'alto',
    rotulo: 'Alto',
    descricao: 'Impacto significativo; demanda providência saneadora indispensável antes da conclusão.',
    badgeClass: 'tag-risco-alto',
    corHex: '#e65100'
  },
  critico: {
    nivel: 'critico',
    rotulo: 'Crítico',
    descricao: 'Vulnerabilidade grave ou impedimento legal com alto potencial de dano ou nulidade.',
    badgeClass: 'tag-risco-critico',
    corHex: '#c62828'
  }
};

/**
 * Cria a estrutura inicial com as 4 dimensões de risco em estado neutro/pendente.
 * RN11/RN12: Nenhuma dimensão nasce como "Baixo" por padrão.
 */
export function criarRiscosIniciais(): Risco[] {
  return DIMENSOES_RISCO.map((dimensao) => ({
    dimensao,
    nivel: null, // Pendente de avaliação técnica pelo assessor
    justificativa: '',
    achadosRelacionados: []
  }));
}

/**
 * Atualiza de forma imutável o nível de risco de uma dimensão específica.
 */
export function definirNivelRisco(
  riscos: Risco[],
  dimensao: DimensaoRisco,
  nivel: NivelRisco | null
): Risco[] {
  return riscos.map((item) => {
    if (item.dimensao === dimensao) {
      return {
        ...item,
        nivel
      };
    }
    return item;
  });
}

/**
 * Atualiza de forma imutável a justificativa técnica de uma dimensão de risco.
 */
export function definirJustificativaRisco(
  riscos: Risco[],
  dimensao: DimensaoRisco,
  justificativa: string
): Risco[] {
  return riscos.map((item) => {
    if (item.dimensao === dimensao) {
      return {
        ...item,
        justificativa
      };
    }
    return item;
  });
}

/**
 * Alterna a vinculação de um achado a uma dimensão de risco.
 */
export function alternarVinculoAchado(
  riscos: Risco[],
  dimensao: DimensaoRisco,
  achadoId: string
): Risco[] {
  if (!achadoId || !achadoId.trim()) return riscos;

  return riscos.map((item) => {
    if (item.dimensao === dimensao) {
      const jaVinculado = item.achadosRelacionados.includes(achadoId);
      const novosAchados = jaVinculado
        ? item.achadosRelacionados.filter((id) => id !== achadoId)
        : [...item.achadosRelacionados, achadoId];
      return {
        ...item,
        achadosRelacionados: novosAchados
      };
    }
    return item;
  });
}

/**
 * Retorna os achados vinculados a uma dimensão de risco que estão no estado VALIDADO.
 * Somente estes são considerados referências válidas de fundamentação (RN10).
 */
export function identificarVinculosValidados(
  risco: Risco,
  todosAchados: Achado[]
): Achado[] {
  const mapaAchados = new Map(todosAchados.map((a) => [a.id, a]));
  return risco.achadosRelacionados
    .map((id) => mapaAchados.get(id))
    .filter((a): a is Achado => a !== undefined && a.estadoValidacao === 'VALIDADO');
}

/**
 * Retorna os achados vinculados que retornaram para revisão (SUGESTAO_SISTEMA) ou foram rejeitados.
 * Não podem permanecer sendo considerados uma referência validada (RN10).
 */
export function identificarVinculosEmRevisao(
  risco: Risco,
  todosAchados: Achado[]
): Achado[] {
  const mapaAchados = new Map(todosAchados.map((a) => [a.id, a]));
  return risco.achadosRelacionados
    .map((id) => mapaAchados.get(id))
    .filter((a): a is Achado => a !== undefined && a.estadoValidacao !== 'VALIDADO');
}

/**
 * Retorna IDs de achados vinculados que não existem mais na lista da análise (excluídos na Etapa 4).
 */
export function identificarVinculosOrfaos(
  risco: Risco,
  todosAchados: Achado[]
): string[] {
  const idsExistentes = new Set(todosAchados.map((a) => a.id));
  return risco.achadosRelacionados.filter((id) => !idsExistentes.has(id));
}

/**
 * Remove um vínculo específico de achado de uma dimensão, preservando nível e justificativa.
 */
export function desvincularAchado(
  riscos: Risco[],
  dimensao: DimensaoRisco,
  achadoId: string
): Risco[] {
  return riscos.map((item) => {
    if (item.dimensao === dimensao) {
      return {
        ...item,
        achadosRelacionados: item.achadosRelacionados.filter((id) => id !== achadoId)
      };
    }
    return item;
  });
}

/**
 * Limpa referências a achados que tenham sido excluídos ou rejeitados na etapa anterior.
 */
export function sincronizarRiscosComAchados(
  riscos: Risco[],
  achadosValidos: Achado[]
): Risco[] {
  const idsValidos = new Set(
    achadosValidos
      .filter((a) => a.estadoValidacao === 'VALIDADO')
      .map((a) => a.id)
  );

  return riscos.map((r) => ({
    ...r,
    achadosRelacionados: r.achadosRelacionados.filter((id) => idsValidos.has(id))
  }));
}

export interface ResultadoValidacaoRiscos {
  valido: boolean;
  erros: Record<DimensaoRisco, string[]>;
  pendencias: string[];
}

/**
 * Valida se as 4 dimensões foram devidamente avaliadas e justificadas pelo assessor.
 * RN13: Problemas de preenchimento geram apontamento de instrução, sem presunção arbitrária.
 */
export function validarRiscos(riscos: Risco[]): ResultadoValidacaoRiscos {
  const erros: Record<DimensaoRisco, string[]> = {
    juridica: [],
    financeira: [],
    operacional: [],
    controle: []
  };
  const pendencias: string[] = [];

  for (const dimensao of DIMENSOES_RISCO) {
    const item = riscos.find((r) => r.dimensao === dimensao);
    const meta = METADADOS_DIMENSOES[dimensao];

    if (!item || item.nivel === null) {
      const msg = `Nível de risco da dimensão ${meta.nome} não foi selecionado.`;
      erros[dimensao].push(msg);
      pendencias.push(`Dimensão ${meta.nome}: selecione o nível de risco (Baixo, Moderado, Alto ou Crítico).`);
    }

    const justificativaLimpa = item?.justificativa?.trim() || '';
    if (!justificativaLimpa) {
      const msg = `Justificativa técnica da dimensão ${meta.nome} é obrigatória.`;
      erros[dimensao].push(msg);
      pendencias.push(`Dimensão ${meta.nome}: preencha a justificativa da avaliação técnica.`);
    } else if (justificativaLimpa.length < 5) {
      const msg = `Justificativa da dimensão ${meta.nome} muito sucinta (mínimo 5 caracteres).`;
      erros[dimensao].push(msg);
      pendencias.push(`Dimensão ${meta.nome}: a justificativa deve conter fundamentação mínima (ao menos 5 caracteres).`);
    }
  }

  const valido = pendencias.length === 0;
  return { valido, erros, pendencias };
}

export interface ResumoRiscos {
  baixo: number;
  moderado: number;
  alto: number;
  critico: number;
  pendentes: number;
  total: number;
  todasAvaliadas: boolean;
  nivelPredominante: NivelRisco | null;
}

/**
 * Calcula os contadores de cada nível de risco para exibição em KPIs executivos.
 */
export function calcularResumoRiscos(riscos: Risco[]): ResumoRiscos {
  let baixo = 0;
  let moderado = 0;
  let alto = 0;
  let critico = 0;
  let pendentes = 0;

  for (const item of riscos) {
    switch (item.nivel) {
      case 'baixo':
        baixo++;
        break;
      case 'moderado':
        moderado++;
        break;
      case 'alto':
        alto++;
        break;
      case 'critico':
        critico++;
        break;
      default:
        pendentes++;
        break;
    }
  }

  // Identifica o nível mais grave presente para fins puramente informativos
  let nivelPredominante: NivelRisco | null = null;
  if (critico > 0) nivelPredominante = 'critico';
  else if (alto > 0) nivelPredominante = 'alto';
  else if (moderado > 0) nivelPredominante = 'moderado';
  else if (baixo > 0) nivelPredominante = 'baixo';

  return {
    baixo,
    moderado,
    alto,
    critico,
    pendentes,
    total: riscos.length,
    todasAvaliadas: pendentes === 0,
    nivelPredominante
  };
}

/**
 * Formata o rótulo legível de um nível de risco.
 */
export function formatarNivelRisco(nivel: NivelRisco | null): string {
  if (!nivel) return 'Pendente de Avaliação';
  return METADADOS_NIVEIS[nivel]?.rotulo || nivel;
}

/**
 * Formata o nome legível de uma dimensão de risco.
 */
export function formatarDimensaoRisco(dimensao: DimensaoRisco): string {
  return METADADOS_DIMENSOES[dimensao]?.nome || dimensao;
}

/**
 * Exemplos de cenários didáticos fictícios de avaliação de riscos para testes rápidos.
 */
export const CENARIOS_EXEMPLO_RISCOS: Record<string, { titulo: string; riscos: Risco[] }> = {
  regular: {
    titulo: 'Cenário Fictício Regular — Riscos Baixos / Moderados',
    riscos: [
      {
        dimensao: 'juridica',
        nivel: 'baixo',
        justificativa: 'Procedimento plenamente amparado pela Lei 14.133/2021, com parecer favorável da PGE sem condicionantes obstativas.',
        achadosRelacionados: []
      },
      {
        dimensao: 'financeira',
        nivel: 'baixo',
        justificativa: 'Previsão orçamentária assegurada com emissão de nota de reserva e estimativa de preços aderente ao mercado.',
        achadosRelacionados: []
      },
      {
        dimensao: 'operacional',
        nivel: 'moderado',
        justificativa: 'Fiscalização requer acompanhamento contínuo dos marcos de entrega para prevenir descompasso nas rotinas das unidades policiais.',
        achadosRelacionados: []
      },
      {
        dimensao: 'controle',
        nivel: 'baixo',
        justificativa: 'Instrução documental completa e publicação regular em consonância com as orientações do TCE-MT.',
        achadosRelacionados: []
      }
    ]
  },
  com_condicionante: {
    titulo: 'Cenário Fictício com Condicionante — Risco Jurídico Alto',
    riscos: [
      {
        dimensao: 'juridica',
        nivel: 'alto',
        justificativa: 'Existência de condicionante jurídica da PGE exigindo comprovação prévia da regularidade fiscal antes da formalização.',
        achadosRelacionados: []
      },
      {
        dimensao: 'financeira',
        nivel: 'moderado',
        justificativa: 'Necessidade de confirmação da caução financeira para resguardo da execução.',
        achadosRelacionados: []
      },
      {
        dimensao: 'operacional',
        nivel: 'baixo',
        justificativa: 'Equipe de fiscalização designada e cronograma com margem de segurança operacional.',
        achadosRelacionados: []
      },
      {
        dimensao: 'controle',
        nivel: 'moderado',
        justificativa: 'Recomendação expressa da assessoria para atestar o saneamento das pendências aos órgãos fiscalizadores.',
        achadosRelacionados: []
      }
    ]
  },
  grave_inconsistencia: {
    titulo: 'Cenário Fictício Grave — Riscos Críticos e Altos',
    riscos: [
      {
        dimensao: 'juridica',
        nivel: 'critico',
        justificativa: 'Inconsistência insanável de vigência com término retroativo ou divergência essencial de objeto.',
        achadosRelacionados: []
      },
      {
        dimensao: 'financeira',
        nivel: 'alto',
        justificativa: 'Pesquisa de preços deficiente e ausência de ateste formal de disponibilidade orçamentária.',
        achadosRelacionados: []
      },
      {
        dimensao: 'operacional',
        nivel: 'alto',
        justificativa: 'Inexistência de fiscal designado e iminência de paralisação dos serviços.',
        achadosRelacionados: []
      },
      {
        dimensao: 'controle',
        nivel: 'critico',
        justificativa: 'Vulnerabilidade iminente a representação perante o Tribunal de Contas com risco de anulação do ato.',
        achadosRelacionados: []
      }
    ]
  }
};
