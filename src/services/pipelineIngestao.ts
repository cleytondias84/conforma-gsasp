/**
 * CONFORMA GSASP — Orquestrador do Pipeline de Ingestão Documental (S5.1.2B)
 * Conecta o Leitor Real de PDF ao Extrator Heurístico de Identificação,
 * gerando o Dossiê de Ingestão em memória pronto para conferência humana.
 */

import type {
  DossieIngestaoIdentificacao,
  DocumentoPdfTexto
} from '../domain/ingestao.ts';
import { extrairTextoPdf, type OpcoesLeituraPdf } from './leitorPdf.ts';
import { extrairCamposIdentificacao } from './extratorIdentificacao.ts';

/**
 * Parâmetros de entrada para o pipeline de ingestão
 */
export interface ParametrosPipelineIngestao {
  arquivo: ArrayBuffer | Uint8Array;
  nomeArquivo: string;
  opcoesLeitura?: OpcoesLeituraPdf;
}

/**
 * Resultado completo do pipeline de ingestão
 */
export interface ResultadoPipelineIngestao {
  dossie: DossieIngestaoIdentificacao;
  documentoTexto: DocumentoPdfTexto;
}

/**
 * Executa o ciclo completo de ingestão documental em memória:
 * 1. Gera executionId único e auditável;
 * 2. Realiza leitura e extração textual via adapter PDF.js;
 * 3. Submete o documento estruturado ao extrator determinístico da Identificação;
 * 4. Monta o Dossiê transitório com todos os campos em estado 'pendente' de revisão;
 * 5. Não persiste dados nem dispara eventos de auditoria externa nesta etapa.
 */
export async function executarPipelineIngestao(
  parametros: ParametrosPipelineIngestao
): Promise<ResultadoPipelineIngestao> {
  const { arquivo, nomeArquivo, opcoesLeitura } = parametros;

  // 1. Identificador de execução único para rastreabilidade
  const executionId = crypto.randomUUID();
  const tamanhoBytes = arquivo instanceof Uint8Array ? arquivo.byteLength : arquivo.byteLength;

  // 2. Extração de texto página a página via PDF.js
  const documentoTexto = await extrairTextoPdf(arquivo, nomeArquivo, opcoesLeitura);

  // 3. Extração dos nove campos através do motor heurístico homologado (S5.1.2A)
  const campos = extrairCamposIdentificacao(documentoTexto, executionId);

  // 4. Montagem do Dossiê de Ingestão transitório (em memória)
  const dossie: DossieIngestaoIdentificacao = {
    id: `dossie-${executionId}`,
    executionId,
    aiRunId: undefined, // Ausente: sem acoplamento a modelo de IA nesta fase
    nomeArquivo,
    tamanhoBytes,
    totalPaginas: documentoTexto.totalPaginas,
    timestampCriacao: new Date().toISOString(),
    coberturaTextual: documentoTexto.coberturaTextual,
    paginasSemTexto: [...documentoTexto.paginasSemTexto],
    campos
  };

  return {
    dossie,
    documentoTexto
  };
}
