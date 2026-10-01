/**
 * CONFORMA GSASP — Adapter PDF.js e Leitor Real de PDF (S5.1.2B)
 * Processamento de buffers PDF página a página com extração posicional de texto,
 * carregamento estritamente lazy do PDF.js/Worker e conversão determinística em DocumentoPdfTexto.
 */

import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist';
import type { DocumentoPdfTexto } from '../domain/ingestao.ts';
import { criarDocumentoPdfTexto } from './normalizacaoPdf.ts';

let pdfJsPromise: Promise<typeof import('pdfjs-dist')> | undefined;
let workerInicializado = false;

/**
 * Carrega a biblioteca PDF.js de forma estritamente lazy com cache de Promise.
 * Não é invocado no boot da aplicação nem durante a importação deste módulo.
 */
export function carregarPdfJs(): Promise<typeof import('pdfjs-dist')> {
  pdfJsPromise ??= import('pdfjs-dist');
  return pdfJsPromise;
}

/**
 * Inicializa o Web Worker do PDF.js exclusivamente em ambiente browser (Vite PWA)
 * e somente quando o primeiro processamento de PDF for disparado.
 * Em ambiente Node.js (test runner), opera sem Web Worker, evitando dependência de DOM.
 */
export async function inicializarWorkerNavegador(pdfjs: typeof import('pdfjs-dist')): Promise<void> {
  if (workerInicializado) return;
  if (typeof window !== 'undefined' && typeof Worker !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerPort) {
    try {
      // @ts-expect-error O sufixo ?worker é resolvido pelo bundler Vite em tempo de build
      const workerModule = await import('pdfjs-dist/build/pdf.worker.min.mjs?worker');
      const WorkerConstructor = workerModule.default;
      pdfjs.GlobalWorkerOptions.workerPort = new WorkerConstructor();
      workerInicializado = true;
    } catch {
      // Fallback defensivo caso o worker não possa ser instanciado no ambiente
    }
  }
}

/**
 * Cria cópia defensiva do buffer para evitar detach no ArrayBuffer original do chamador.
 * Preserva o byteOffset e a janela de visualização lógica quando a entrada for Uint8Array.
 */
export function copiarDadosPdf(dados: ArrayBuffer | Uint8Array): Uint8Array {
  if (dados instanceof Uint8Array) {
    return dados.slice();
  }
  return new Uint8Array(dados.slice(0));
}

/**
 * Códigos padronizados de erro na ingestão e leitura de PDF
 */
export type CodigoErroLeituraPdf =
  | 'PDF_PROTEGIDO_POR_SENHA'
  | 'PDF_CORROMPIDO_OU_INVALIDO'
  | 'PDF_VAZIO'
  | 'LIMITE_PAGINAS_EXCEDIDO'
  | 'FALHA_PROCESSAMENTO_LEITURA';

/**
 * Exceção tipada para falhas ocorridas na leitura de PDF
 */
export class ErroLeituraPdf extends Error {
  readonly codigo: CodigoErroLeituraPdf;
  readonly detalhes?: unknown;

  constructor(codigo: CodigoErroLeituraPdf, mensagem: string, detalhes?: unknown) {
    super(mensagem);
    this.name = 'ErroLeituraPdf';
    this.codigo = codigo;
    this.detalhes = detalhes;
  }
}

/**
 * Opções operacionais de leitura configuráveis pelo chamador
 */
export interface OpcoesLeituraPdf {
  maxPaginasPermitidas?: number;
  minCaracteresUteis?: number;
  onProgresso?: (paginaAtual: number, totalPaginas: number) => void;
  /** Factory interna para testes controlados de ciclo de vida (destroy / cleanup) */
  _fabricaGetDocument?: (dados: Uint8Array) => PDFDocumentLoadingTask;
}

interface TextItemLike {
  str: string;
  transform: number[];
  width: number;
  height: number;
  hasEOL?: boolean;
}

/**
 * Reconstrói texto legível a partir de itens de texto do PDF.js (TextItem),
 * utilizando as posições X/Y da matriz de transformação e sinalizadores hasEOL.
 */
export function reconstruirTextoPagina(
  items: unknown[],
  toleranciaLinhaY: number = 3.0,
  toleranciaEspacoX: number = 2.0
): string {
  if (!items || items.length === 0) return '';

  const textItems: TextItemLike[] = [];
  for (const item of items) {
    if (
      item &&
      typeof item === 'object' &&
      'str' in item &&
      typeof (item as { str: unknown }).str === 'string' &&
      'transform' in item &&
      Array.isArray((item as { transform: unknown }).transform)
    ) {
      textItems.push(item as unknown as TextItemLike);
    }
  }

  if (textItems.length === 0) return '';

  const linhas: string[] = [];
  let linhaAtual = '';
  let ultimoY: number | null = null;
  let ultimoX = 0;
  let ultimoWidth = 0;
  let ultimoHasEOL = false;

  for (const item of textItems) {
    const x = item.transform[4] ?? 0;
    const y = item.transform[5] ?? 0;
    const str = item.str;
    const hasEOL = Boolean(item.hasEOL);

    // Mudança de linha detectada por hasEOL anterior ou salto vertical em Y
    const mudouLinha =
      ultimoHasEOL ||
      (ultimoY !== null && Math.abs(y - ultimoY) > toleranciaLinhaY);

    if (mudouLinha) {
      if (linhaAtual.trim().length > 0) {
        linhas.push(linhaAtual.trimEnd());
      }
      linhaAtual = str;
    } else {
      if (str.length > 0) {
        // Se ambos não contêm espaço e há lacuna horizontal considerável, adiciona espaço
        const precisaEspaco =
          linhaAtual.length > 0 &&
          !linhaAtual.endsWith(' ') &&
          !str.startsWith(' ') &&
          x - (ultimoX + ultimoWidth) > toleranciaEspacoX;

        if (precisaEspaco) {
          linhaAtual += ' ';
        }
        linhaAtual += str;
      }
    }

    ultimoY = y;
    ultimoX = x;
    ultimoWidth = item.width ?? 0;
    ultimoHasEOL = hasEOL;
  }

  if (linhaAtual.trim().length > 0) {
    linhas.push(linhaAtual.trimEnd());
  }

  return linhas.join('\n');
}

/**
 * Lê e extrai o conteúdo textual de um arquivo PDF real (ArrayBuffer ou Uint8Array),
 * gerando um DocumentoPdfTexto determinístico pronto para o extrator de identificação.
 */
export async function extrairTextoPdf(
  dados: ArrayBuffer | Uint8Array,
  nomeArquivo: string,
  opcoes: OpcoesLeituraPdf = {}
): Promise<DocumentoPdfTexto> {
  const {
    maxPaginasPermitidas = 50,
    minCaracteresUteis = 20,
    onProgresso,
    _fabricaGetDocument
  } = opcoes;

  // Validação prévia de buffer vazio
  if (!dados) {
    throw new ErroLeituraPdf('PDF_VAZIO', 'Dados do PDF não fornecidos ou nulos.');
  }

  const byteLength = dados instanceof Uint8Array ? dados.byteLength : dados.byteLength;
  if (byteLength === 0) {
    throw new ErroLeituraPdf('PDF_VAZIO', 'O arquivo PDF fornecido está vazio (0 bytes).');
  }

  // Criação obrigatória de cópia defensiva para proteger a memória do chamador contra detach
  const bufferData = copiarDadosPdf(dados);

  let loadingTask: PDFDocumentLoadingTask | null = null;
  let pdfDoc: PDFDocumentProxy | null = null;

  try {
    if (_fabricaGetDocument) {
      loadingTask = _fabricaGetDocument(bufferData);
    } else {
      const pdfjs = await carregarPdfJs();
      await inicializarWorkerNavegador(pdfjs);
      loadingTask = pdfjs.getDocument({
        data: bufferData,
        disableFontFace: true,
        disableRange: true,
        disableStream: true,
        disableAutoFetch: true
      });
    }

    pdfDoc = await loadingTask.promise;

    const totalPaginas = pdfDoc.numPages;
    if (totalPaginas === 0) {
      throw new ErroLeituraPdf('PDF_VAZIO', 'O documento PDF não possui páginas legíveis.');
    }

    // Limite operacional estrito: rejeita antes de processar, sem truncamento silencioso
    if (totalPaginas > maxPaginasPermitidas) {
      throw new ErroLeituraPdf(
        'LIMITE_PAGINAS_EXCEDIDO',
        `O documento possui ${totalPaginas} páginas, excedendo o limite operacional de ${maxPaginasPermitidas} páginas permitidas.`
      );
    }

    const paginasBrutas: { numeroPagina: number; textoBruto: string }[] = [];

    // Processamento sequencial ordenado 1-based
    for (let numPag = 1; numPag <= totalPaginas; numPag++) {
      if (onProgresso) {
        onProgresso(numPag, totalPaginas);
      }

      const page = await pdfDoc.getPage(numPag);
      try {
        const textContent = await page.getTextContent();
        const textoBruto = reconstruirTextoPagina(textContent.items);
        paginasBrutas.push({ numeroPagina: numPag, textoBruto });
      } finally {
        page.cleanup();
      }
    }

    // Libera recursos internos do documento de forma protegida
    if (typeof pdfDoc.cleanup === 'function') {
      try {
        await pdfDoc.cleanup();
      } catch {
        // Falha no cleanup do documento não corrompe a extração já concluída
      }
    }

    return criarDocumentoPdfTexto(nomeArquivo, paginasBrutas, minCaracteresUteis);
  } catch (erro: unknown) {
    if (erro instanceof ErroLeituraPdf) {
      throw erro;
    }

    let nomeErro = '';
    let msgErro = '';

    if (erro instanceof Error) {
      nomeErro = erro.name;
      msgErro = erro.message;
    } else if (erro && typeof erro === 'object') {
      if ('name' in erro && typeof (erro as { name: unknown }).name === 'string') {
        nomeErro = (erro as { name: string }).name;
      }
      if ('message' in erro && typeof (erro as { message: unknown }).message === 'string') {
        msgErro = (erro as { message: string }).message;
      } else {
        msgErro = String(erro);
      }
    } else {
      msgErro = String(erro);
    }

    if (nomeErro === 'PasswordException' || /password/i.test(msgErro)) {
      throw new ErroLeituraPdf(
        'PDF_PROTEGIDO_POR_SENHA',
        'O documento PDF está protegido por senha e não pode ser processado sem credenciais.',
        erro
      );
    }

    if (nomeErro === 'InvalidPDFException' || /invalid\s*pdf/i.test(msgErro)) {
      throw new ErroLeituraPdf(
        'PDF_CORROMPIDO_OU_INVALIDO',
        'O arquivo fornecido não é um PDF válido ou está corrompido.',
        erro
      );
    }

    throw new ErroLeituraPdf(
      'FALHA_PROCESSAMENTO_LEITURA',
      `Falha na leitura ou extração textual do PDF: ${msgErro}`,
      erro
    );
  } finally {
    // Garante que o loadingTask seja destruído tanto no sucesso quanto no erro
    if (loadingTask) {
      try {
        await loadingTask.destroy();
      } catch {
        // Encerramento defensivo
      }
    }
  }
}
