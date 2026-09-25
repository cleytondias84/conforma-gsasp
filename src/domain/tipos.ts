/**
 * CONFORMA GSASP — Sistema de Conformidade e Apoio à Decisão
 * Modelagem inicial de tipos do domínio (Sprint 1.2)
 * Base: docs/contexto.md e docs/sprint.md
 */

// ==========================================
// 1. ENUMS E TIPOS AUXILIARES
// ==========================================

/**
 * Andamento da edição da análise (separado da conclusão técnica).
 */
export type EstadoEdicao = 'rascunho' | 'em_analise' | 'concluida';

/**
 * As quatro conclusões técnicas possíveis (RN08).
 * Devem ser distinguidas da decisão final da autoridade competente.
 */
export type TipoConclusao =
  | 'APTO_PARA_ASSINATURA'
  | 'APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA'
  | 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA'
  | 'NAO_RECOMENDAVEL_PARA_ASSINATURA';

/**
 * Conclusão da etapa de pertinência institucional (RN02).
 */
export type ConclusaoPertinencia =
  | 'PERTINENTE'
  | 'PERTINENTE_COM_JUSTIFICATIVA'
  | 'NAO_DEMONSTRADA'
  | 'NAO_PERTINENTE';

/**
 * Status de conferência de um item do checklist de conformidade.
 */
export type StatusConformidade = 'ok' | 'pendente' | 'nao_aplicavel' | 'confirmar';

/**
 * Situação do atendimento de condicionante jurídica de parecer anterior.
 */
export type SituacaoCondicionante = 'atendida' | 'pendente' | 'em_cumprimento' | 'nao_aplicavel';

/**
 * Classificação de gravidade de um achado (RN04).
 */
export type ClassificacaoAchado = 'IMPEDITIVO' | 'RELEVANTE' | 'FORMAL' | 'MELHORIA';

/**
 * Estado de validação do achado pelo assessor (RN05 e RN06).
 * Todo achado sugerido automaticamente nasce como SUGESTAO_SISTEMA.
 */
export type EstadoValidacaoAchado =
  | 'SUGESTAO_SISTEMA' // "SUGESTÃO DO SISTEMA — PENDENTE DE VALIDAÇÃO HUMANA"
  | 'VALIDADO'         // "ACHADO VALIDADO"
  | 'REJEITADO';        // Rejeitado justificadamente pelo assessor

/**
 * Dimensões de risco avaliadas.
 */
export type DimensaoRisco = 'juridica' | 'financeira' | 'operacional' | 'controle';

/**
 * Níveis de risco avaliados.
 */
export type NivelRisco = 'baixo' | 'moderado' | 'alto' | 'critico';

/**
 * Papéis demonstrativos da simulação ("Ver como").
 */
export type PapelUsuario = 'Administrador' | 'Editor/Assessor' | 'Leitor' | 'Aprovador';

// ==========================================
// 2. ENTIDADES PRINCIPAIS
// ==========================================

/**
 * Processo administrativo ou instrumento jurídico submetido a análise.
 * Atenção: somente dados inteiramente fictícios.
 */
export interface Processo {
  id: string;
  numero: string;
  instrumento: string; // Ex: Contrato, Termo Aditivo, Convênio, etc.
  contratado: string;
  cnpj: string;
  objeto: string;       // Elemento essencial destacado
  tipoOrigem: string;   // Elemento essencial destacado
  valor: number | null; // Elemento essencial destacado (null se não aplicável ou a definir)
  valorNaoAplicavel?: boolean;
  vigenciaInicio: string | null; // Elemento essencial destacado (ISO: YYYY-MM-DD)
  vigenciaFim: string | null;    // Elemento essencial destacado (ISO: YYYY-MM-DD)
  vigenciaNaoAplicavel?: boolean;
  regimeJuridico?: string;
  contratadoNaoAplicavel?: boolean;
}

/**
 * Filtro prévio obrigatório de pertinência institucional.
 */
export interface Pertinencia {
  respostas: {
    competenciaNecessidade: boolean | null;
    vinculoPlanejamento: boolean | null;
    beneficioInteressePublico: boolean | null;
    custoProporcionalidade: boolean | null;
    economicidade: boolean | null;
  };
  evidencias: string;
  justificativa: string;
  conclusao: ConclusaoPertinencia | null;
  providencia: string;
}

/**
 * Item individual da lista de conformidade documental e procedimental.
 */
export interface ItemConformidade {
  id: string;
  descricao: string;
  status: StatusConformidade;
  observacao?: string;
  referenciaFonte?: string;
  justificativaNaoAplicavel?: string;
}

/**
 * Condicionante apontada em parecer da PGE ou assessoria jurídica.
 */
export interface Condicionante {
  id: string;
  descricao: string;
  referenciaParecer: string;
  situacao: SituacaoCondicionante;
  evidenciaAtendimento?: string;
  providencia?: string;
  responsavel?: string;
}

/**
 * Achado ou apontamento de não conformidade identificado.
 * Cada achado deve ligar: evidência -> regra/motivo -> impacto -> providência (RN03).
 */
export interface Achado {
  id: string;
  titulo: string;
  evidencia: string;      // Fato concreto verificado nos autos
  regraOuMotivo: string;  // Regra normativa, contratual ou editalícia
  impacto: string;        // Risco prático ou prejuízo potencial
  providencia: string;    // O que deve ser feito para corrigir
  responsavel: string;    // Setor ou autoridade responsável pelo saneamento
  classificacao: ClassificacaoAchado;
  estadoValidacao: EstadoValidacaoAchado;
  justificativaRejeicao?: string;
}

/**
 * Avaliação por dimensão de risco.
 */
export interface Risco {
  dimensao: DimensaoRisco;
  nivel: NivelRisco;
  justificativa: string;
  achadosRelacionados: string[]; // Lista de IDs de achados vinculados
}

/**
 * Resultado executivo que responde às 5 perguntas essenciais (RN09).
 */
export interface Resultado {
  // As 5 perguntas executivas:
  podeAssinar: boolean | null;                 // 1. Pode assinar?
  oQueCorrigir: string[];                     // 2. O que corrigir?
  quemCorrige: string[];                      // 3. Quem corrige?
  retornaGabinete: boolean | null;             // 4. Retorna ao Gabinete?
  exigeNovaAnaliseJuridica: boolean | null;     // 5. Exige nova análise jurídica?

  mensagemInterna?: string;
  conclusaoExecutiva: string;
  quadroSintese: string;
  pontosSemObice: string[];
  providencias: string[];
  justificativas: string;
}

/**
 * Registro de validação humana da conclusão técnica.
 */
export interface ValidacaoHumana {
  validadoPor: string;
  dataHora: string;
  papel: PapelUsuario;
  observacoes?: string;
}

/**
 * Análise de conformidade completa de um processo.
 */
export interface Analise {
  id: string;
  processoId: string;
  estadoEdicao: EstadoEdicao;                 // Separação do andamento da edição
  pertinencia: Pertinencia;
  checklist: ItemConformidade[];
  condicionantes: Condicionante[];
  achados: Achado[];
  riscos: Risco[];
  conclusaoIndicativa: TipoConclusao | null; // Sugestão algorítmica do sistema
  conclusaoValidada: TipoConclusao | null;   // Homologação pelo assessor
  validacaoHumana: ValidacaoHumana | null;
  datas: {
    criacao: string;
    atualizacao: string;
    conclusao?: string;
  };
}

/**
 * Evento de auditoria local (demonstrativo).
 */
export interface EventoLocal {
  id: string;
  dataHora: string;
  usuarioFicticio: string;
  papel: PapelUsuario;
  acao: string;
  entidade: string;
  registroId: string;
  antesDepois?: {
    antes: unknown;
    depois: unknown;
  };
}
