/**
 * CONFORMA GSASP — Tipos e Contratos de Ingestão Documental (S5.1.1 + S5.1.2A)
 * Módulo de domínio para representação de dados extraídos de minutas em PDF,
 * evidências textuais, candidatos estruturados, estados de revisão humana e conversão para Processo.
 */

import type { Processo } from './tipos.ts';

/**
 * Estado da extração factual documental (IA / Pipeline de Ingestão)
 * - localizado: candidato suficientemente determinado
 * - nao_localizado: documento integralmente analisável e nenhum suporte factual encontrado
 * - ambiguo: dois ou mais candidatos plausíveis conflitantes
 * - inconclusivo: documento com páginas não analisáveis (ex.: misto) que podem conter o dado
 */
export type EstadoExtracao =
  | 'localizado'
  | 'nao_localizado'
  | 'ambiguo'
  | 'inconclusivo';

/**
 * Estado da deliberação da revisão humana técnica
 */
export type EstadoRevisaoHumana = 'pendente' | 'confirmado' | 'editado' | 'rejeitado';

/**
 * Cobertura da camada de texto do documento PDF
 */
export type CoberturaTextualDocumento = 'integral' | 'misto' | 'sem_texto';

/**
 * Evidência documental textual extraída da minuta em PDF.
 * Permite múltiplas evidências por campo e rastreabilidade da página.
 */
export interface EvidenciaCampo {
  arquivoOrigem: string;
  pagina: number;
  trechoEvidencia: string;
  indiceInicio?: number;
  indiceFim?: number;
}

/**
 * Candidato de extração vinculando explicitamente o valor às suas evidências de suporte
 */
export interface CandidatoExtracao<T> {
  valor: T;
  evidencias: EvidenciaCampo[];
}

/**
 * Diagnóstico técnico e factual produzido pelo pipeline de extração documental.
 * Representa exclusivamente fatos e limitações da extração/SISTEMA,
 * nunca deliberações ou justificativas humanas.
 */
export interface DiagnosticoExtracao {
  motivo?: string;
  paginasNaoAnalisaveis?: number[];
}

/**
 * Representação intermediária pura de página de PDF com texto extraído
 */
export interface PaginaPdfTexto {
  numeroPagina: number;        // 1-based (1, 2, 3...)
  textoBruto: string;
  textoNormalizado: string;
  contagemCaracteresUteis: number;
  temTextoUtil: boolean;
}

/**
 * Representação intermediária pura de documento PDF composto por páginas textuais
 */
export interface DocumentoPdfTexto {
  nomeArquivo: string;
  totalPaginas: number;
  paginas: PaginaPdfTexto[];
  coberturaTextual: CoberturaTextualDocumento;
  paginasSemTexto: number[];   // números de página 1-based sem camada textual útil
}

/**
 * Chaves canônicas dos campos da Etapa 1 — Identificação do Processo
 */
export type CampoIdentificacaoKey =
  | 'numeroProcesso'
  | 'tipoInstrumento'
  | 'contratadoInteressado'
  | 'cnpjCpf'
  | 'objeto'
  | 'valor'
  | 'vigenciaInicio'
  | 'vigenciaFim'
  | 'modalidadeOrigem';

/**
 * Representação de um campo extraído com histórico de sugestão, deliberação humana,
 * candidatos explícitos e evidências.
 */
export interface CampoExtraido<T = string | number | null> {
  campoId: CampoIdentificacaoKey;
  rotulo: string;
  valorSugerido: T;
  valorConfirmado?: T;
  estadoExtracao: EstadoExtracao;
  estadoRevisao: EstadoRevisaoHumana;
  evidencias: EvidenciaCampo[];
  candidatos?: CandidatoExtracao<T>[];
  diagnosticoExtracao?: DiagnosticoExtracao;
  justificativaEdicao?: string;
}

/**
 * Mapa fortemente tipado e serializável dos campos da Etapa 1.
 * Não utiliza any e garante segurança estrita de tipos primitivos.
 */
export interface MapaCamposIdentificacao {
  numeroProcesso: CampoExtraido<string | null>;
  tipoInstrumento: CampoExtraido<string | null>;
  contratadoInteressado: CampoExtraido<string | null>;
  cnpjCpf: CampoExtraido<string | null>;
  objeto: CampoExtraido<string | null>;
  valor: CampoExtraido<number | null>;
  vigenciaInicio: CampoExtraido<string | null>;
  vigenciaFim: CampoExtraido<string | null>;
  modalidadeOrigem: CampoExtraido<string | null>;
}

/**
 * Dossiê de ingestão transitório em memória.
 * executionId é obrigatório em toda execução.
 * aiRunId é opcional e existe somente quando houver chamada a modelo de IA.
 */
export interface DossieIngestaoIdentificacao {
  id: string;
  executionId: string;
  aiRunId?: string;
  nomeArquivo: string;
  tamanhoBytes: number;
  totalPaginas: number;
  timestampCriacao: string; // Padrão técnico ISO-8601
  coberturaTextual?: CoberturaTextualDocumento;
  paginasSemTexto?: number[];
  campos: MapaCamposIdentificacao;
}

/**
 * Função pura para criar um campo extraído com extração factual localizada.
 */
export function criarCampoExtraido<T>(
  campoId: CampoIdentificacaoKey,
  rotulo: string,
  valorSugerido: T,
  evidencias: EvidenciaCampo[],
  candidatos?: CandidatoExtracao<T>[]
): CampoExtraido<T> {
  return {
    campoId,
    rotulo,
    valorSugerido,
    estadoExtracao: 'localizado',
    estadoRevisao: 'pendente',
    evidencias: [...evidencias],
    candidatos: candidatos ? [...candidatos] : [{ valor: valorSugerido, evidencias: [...evidencias] }]
  };
}

/**
 * Função pura para criar um campo não localizado no documento.
 * Não inventa valores e aceita null e evidências vazias [].
 */
export function criarCampoNaoLocalizado<T = string | null>(
  campoId: CampoIdentificacaoKey,
  rotulo: string
): CampoExtraido<T | null> {
  return {
    campoId,
    rotulo,
    valorSugerido: null,
    estadoExtracao: 'nao_localizado',
    estadoRevisao: 'pendente',
    evidencias: [],
    candidatos: []
  };
}

/**
 * Função pura para criar um campo com múltiplos candidatos concorrentes (ambíguo).
 * Não decide arbitrariamente entre candidatos conflitantes e preserva todas as evidências.
 */
export function criarCampoAmbiguo<T>(
  campoId: CampoIdentificacaoKey,
  rotulo: string,
  candidatos: CandidatoExtracao<T>[],
  valorSugerido: T = null as unknown as T
): CampoExtraido<T> {
  const todasEvidencias = candidatos.flatMap((c) => c.evidencias);
  return {
    campoId,
    rotulo,
    valorSugerido,
    estadoExtracao: 'ambiguo',
    estadoRevisao: 'pendente',
    evidencias: todasEvidencias,
    candidatos: [...candidatos]
  };
}

/**
 * Função pura para criar um campo inconclusivo decorrente de páginas não analisáveis.
 * Nunca converte automaticamente ausência em nao_localizado quando há páginas sem camada textual.
 * Registra diagnóstico técnico exclusivo do pipeline sem contaminar justificativaEdicao.
 */
export function criarCampoInconclusivo<T = string | null>(
  campoId: CampoIdentificacaoKey,
  rotulo: string,
  diagnostico?: DiagnosticoExtracao
): CampoExtraido<T | null> {
  return {
    campoId,
    rotulo,
    valorSugerido: null,
    estadoExtracao: 'inconclusivo',
    estadoRevisao: 'pendente',
    evidencias: [],
    candidatos: [],
    diagnosticoExtracao: diagnostico
      ? {
          motivo: diagnostico.motivo,
          paginasNaoAnalisaveis: diagnostico.paginasNaoAnalisaveis
            ? [...diagnostico.paginasNaoAnalisaveis]
            : undefined
        }
      : undefined,
    justificativaEdicao: undefined
  };
}

/**
 * Confirma o valor sugerido pela extração.
 * Pura, imutável: define estadoRevisao como 'confirmado' e define valorConfirmado = valorSugerido.
 */
export function confirmarCampo<T>(campo: CampoExtraido<T>): CampoExtraido<T> {
  return {
    ...campo,
    estadoRevisao: 'confirmado',
    valorConfirmado: campo.valorSugerido,
    evidencias: [...campo.evidencias],
    candidatos: campo.candidatos ? [...campo.candidatos] : undefined,
    diagnosticoExtracao: campo.diagnosticoExtracao
      ? {
          motivo: campo.diagnosticoExtracao.motivo,
          paginasNaoAnalisaveis: campo.diagnosticoExtracao.paginasNaoAnalisaveis
            ? [...campo.diagnosticoExtracao.paginasNaoAnalisaveis]
            : undefined
        }
      : undefined
  };
}

/**
 * Registra a edição humana de um campo.
 * Pura, imutável: preserva valorSugerido, evidências originárias e diagnosticoExtracao,
 * definindo valorConfirmado com o novo valor humano e registrando justificativaEdicao exclusiva humana.
 */
export function editarCampo<T>(
  campo: CampoExtraido<T>,
  novoValorHumano: T,
  justificativa?: string
): CampoExtraido<T> {
  return {
    ...campo,
    estadoRevisao: 'editado',
    valorConfirmado: novoValorHumano,
    justificativaEdicao: justificativa !== undefined ? justificativa : campo.justificativaEdicao,
    evidencias: [...campo.evidencias],
    candidatos: campo.candidatos ? [...campo.candidatos] : undefined,
    diagnosticoExtracao: campo.diagnosticoExtracao
      ? {
          motivo: campo.diagnosticoExtracao.motivo,
          paginasNaoAnalisaveis: campo.diagnosticoExtracao.paginasNaoAnalisaveis
            ? [...campo.diagnosticoExtracao.paginasNaoAnalisaveis]
            : undefined
        }
      : undefined
  };
}

/**
 * Registra a rejeição humana do campo sugerido.
 * Pura, imutável: preserva valorSugerido para auditoria e diagnosticoExtracao,
 * desassocia valorConfirmado para não levar a Processo e registra justificativaEdicao exclusiva humana.
 */
export function rejeitarCampo<T>(
  campo: CampoExtraido<T>,
  justificativa?: string
): CampoExtraido<T> {
  return {
    ...campo,
    estadoRevisao: 'rejeitado',
    valorConfirmado: undefined,
    justificativaEdicao: justificativa !== undefined ? justificativa : campo.justificativaEdicao,
    evidencias: [...campo.evidencias],
    candidatos: campo.candidatos ? [...campo.candidatos] : undefined,
    diagnosticoExtracao: campo.diagnosticoExtracao
      ? {
          motivo: campo.diagnosticoExtracao.motivo,
          paginasNaoAnalisaveis: campo.diagnosticoExtracao.paginasNaoAnalisaveis
            ? [...campo.diagnosticoExtracao.paginasNaoAnalisaveis]
            : undefined
        }
      : undefined
  };
}

/**
 * Avalia se todos os campos da identificação tiveram sua deliberação humana concluída.
 * Não utiliza booleano mutável; deriva o resultado exclusivamente dos estados de revisão dos campos.
 * Um campo deixa de estar pendente quando estiver em 'confirmado', 'editado' ou 'rejeitado'.
 * Campos com estadoExtracao 'nao_localizado', 'ambiguo' ou 'inconclusivo' necessitam de deliberação se estiverem 'pendente'.
 */
export function isRevisaoConcluida(campos: MapaCamposIdentificacao): boolean {
  const listaCampos: CampoExtraido<unknown>[] = [
    campos.numeroProcesso,
    campos.tipoInstrumento,
    campos.contratadoInteressado,
    campos.cnpjCpf,
    campos.objeto,
    campos.valor,
    campos.vigenciaInicio,
    campos.vigenciaFim,
    campos.modalidadeOrigem
  ];

  return listaCampos.every((c) => c.estadoRevisao !== 'pendente');
}

/**
 * Converte o mapa de campos deliberados para um objeto parcial de Processo.
 * Função pura que não muta os campos recebidos.
 * Regras:
 * - Campos rejeitados ou pendentes NÃO são transferidos para o Processo.
 * - Campos confirmados utilizam o valor confirmado (igual ao sugerido).
 * - Campos editados utilizam o valor confirmado (definido pelo humano).
 */
export function converterMapaParaProcesso(campos: MapaCamposIdentificacao): Partial<Processo> {
  const resultado: Partial<Processo> = {};

  // 1. numeroProcesso -> numero
  if (campos.numeroProcesso.estadoRevisao === 'confirmado' || campos.numeroProcesso.estadoRevisao === 'editado') {
    if (campos.numeroProcesso.valorConfirmado !== undefined && campos.numeroProcesso.valorConfirmado !== null) {
      resultado.numero = campos.numeroProcesso.valorConfirmado;
    }
  }

  // 2. tipoInstrumento -> instrumento
  if (campos.tipoInstrumento.estadoRevisao === 'confirmado' || campos.tipoInstrumento.estadoRevisao === 'editado') {
    if (campos.tipoInstrumento.valorConfirmado !== undefined && campos.tipoInstrumento.valorConfirmado !== null) {
      resultado.instrumento = campos.tipoInstrumento.valorConfirmado;
    }
  }

  // 3. contratadoInteressado -> contratado
  if (campos.contratadoInteressado.estadoRevisao === 'confirmado' || campos.contratadoInteressado.estadoRevisao === 'editado') {
    if (campos.contratadoInteressado.valorConfirmado !== undefined && campos.contratadoInteressado.valorConfirmado !== null) {
      resultado.contratado = campos.contratadoInteressado.valorConfirmado;
    }
  }

  // 4. cnpjCpf -> cnpj
  if (campos.cnpjCpf.estadoRevisao === 'confirmado' || campos.cnpjCpf.estadoRevisao === 'editado') {
    if (campos.cnpjCpf.valorConfirmado !== undefined && campos.cnpjCpf.valorConfirmado !== null) {
      resultado.cnpj = campos.cnpjCpf.valorConfirmado;
    }
  }

  // 5. objeto -> objeto
  if (campos.objeto.estadoRevisao === 'confirmado' || campos.objeto.estadoRevisao === 'editado') {
    if (campos.objeto.valorConfirmado !== undefined && campos.objeto.valorConfirmado !== null) {
      resultado.objeto = campos.objeto.valorConfirmado;
    }
  }

  // 6. valor -> valor (number | null)
  if (campos.valor.estadoRevisao === 'confirmado' || campos.valor.estadoRevisao === 'editado') {
    if (campos.valor.valorConfirmado !== undefined) {
      resultado.valor = campos.valor.valorConfirmado;
    }
  }

  // 7. vigenciaInicio -> vigenciaInicio (string | null)
  if (campos.vigenciaInicio.estadoRevisao === 'confirmado' || campos.vigenciaInicio.estadoRevisao === 'editado') {
    if (campos.vigenciaInicio.valorConfirmado !== undefined) {
      resultado.vigenciaInicio = campos.vigenciaInicio.valorConfirmado;
    }
  }

  // 8. vigenciaFim -> vigenciaFim (string | null)
  if (campos.vigenciaFim.estadoRevisao === 'confirmado' || campos.vigenciaFim.estadoRevisao === 'editado') {
    if (campos.vigenciaFim.valorConfirmado !== undefined) {
      resultado.vigenciaFim = campos.vigenciaFim.valorConfirmado;
    }
  }

  // 9. modalidadeOrigem -> tipoOrigem
  if (campos.modalidadeOrigem.estadoRevisao === 'confirmado' || campos.modalidadeOrigem.estadoRevisao === 'editado') {
    if (campos.modalidadeOrigem.valorConfirmado !== undefined && campos.modalidadeOrigem.valorConfirmado !== null) {
      resultado.tipoOrigem = campos.modalidadeOrigem.valorConfirmado;
    }
  }

  return resultado;
}
