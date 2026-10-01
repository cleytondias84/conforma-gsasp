/**
 * CONFORMA GSASP — Normalização Textual de PDFs (S5.1.2A)
 * Funções puras para saneamento, unificação de caracteres e estruturação intermediária de páginas.
 */

import type {
  PaginaPdfTexto,
  DocumentoPdfTexto,
  CoberturaTextualDocumento
} from '../domain/ingestao.ts';

/**
 * Remove caracteres de controle ASCII e Unicode não imprimíveis,
 * preservando estritamente tabulações e quebras de linha (\n, \r, \t).
 */
export function removerCaracteresControle(texto: string): string {
  if (!texto) return '';
  return texto.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\uFEFF]/g, '');
}

/**
 * Normaliza caracteres Unicode via compatibilidade canônica (NFKC),
 * decompondo ligaduras (ex.: 'fi', 'fl') e uniformizando ordinais e símbolos.
 */
export function normalizarUnicode(texto: string): string {
  if (!texto) return '';
  return texto
    .replace(/\uFB01/g, 'fi')
    .replace(/\uFB02/g, 'fl')
    .normalize('NFC');
}

/**
 * Remove soft hyphens (hífen invisível / \u00AD) comumente inseridos por editores de texto.
 */
export function removerSoftHyphen(texto: string): string {
  if (!texto) return '';
  return texto.replace(/\u00AD/g, '');
}

/**
 * Corrige quebras de linha com hífen de separação silábica no final de linha,
 * juntando as sílabas sem alterar o vocábulo.
 * Exemplo: 'CON-\nTRATADA' -> 'CONTRATADA'
 */
export function corrigirHifenQuebraLinha(texto: string): string {
  if (!texto) return '';
  return texto.replace(/([a-zA-ZÀ-ÿ])-[\r\n]+\s*([a-zA-ZÀ-ÿ])/g, '$1$2');
}

/**
 * Unifica múltiplos espaços consecutivos horizontais em um único espaço,
 * aparando espaços em branco residuais no início e fim de linhas.
 */
export function unificarEspacos(texto: string): string {
  if (!texto) return '';
  return texto
    .replace(/[^\S\r\n]+/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .trim();
}

/**
 * Padroniza fins de linha para \n e colapsa quebras consecutivas excessivas.
 */
export function normalizarQuebras(texto: string): string {
  if (!texto) return '';
  return texto
    .replace(/\r\n|\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}

/**
 * Pipeline completo de normalização textual pura para leitura e localização de dados em PDF.
 */
export function normalizarTextoPdf(textoBruto: string): string {
  if (!textoBruto) return '';
  let texto = removerCaracteresControle(textoBruto);
  texto = removerSoftHyphen(texto);
  texto = normalizarQuebras(texto);
  texto = corrigirHifenQuebraLinha(texto);
  texto = normalizarUnicode(texto);
  texto = unificarEspacos(texto);
  return texto;
}

/**
 * Conta a quantidade de caracteres úteis (não-espaço) em uma string.
 */
export function contarCaracteresUteis(texto: string): number {
  if (!texto) return 0;
  return texto.replace(/\s/g, '').length;
}

/**
 * Cria uma representação intermediária pura de página de PDF.
 * O limiar mínimo de caracteres úteis é parametrizável (default: 20 caracteres).
 */
export function criarPaginaPdfTexto(
  numeroPagina: number,
  textoBruto: string,
  minCaracteresUteis: number = 20
): PaginaPdfTexto {
  const textoNormalizado = normalizarTextoPdf(textoBruto);
  const contagemCaracteresUteis = contarCaracteresUteis(textoNormalizado);
  const temTextoUtil = contagemCaracteresUteis >= minCaracteresUteis;

  return {
    numeroPagina,
    textoBruto,
    textoNormalizado,
    contagemCaracteresUteis,
    temTextoUtil
  };
}

/**
 * Cria uma representação de DocumentoPdfTexto a partir de páginas brutas,
 * derivando a cobertura textual ('integral' | 'misto' | 'sem_texto') e a lista de páginas sem texto.
 */
export function criarDocumentoPdfTexto(
  nomeArquivo: string,
  paginasBrutas: { numeroPagina: number; textoBruto: string }[],
  minCaracteresUteis: number = 20
): DocumentoPdfTexto {
  const paginas = paginasBrutas.map((p) =>
    criarPaginaPdfTexto(p.numeroPagina, p.textoBruto, minCaracteresUteis)
  );

  const paginasSemTexto = paginas
    .filter((p) => !p.temTextoUtil)
    .map((p) => p.numeroPagina);

  let coberturaTextual: CoberturaTextualDocumento;
  if (paginas.length === 0 || paginasSemTexto.length === paginas.length) {
    coberturaTextual = 'sem_texto';
  } else if (paginasSemTexto.length === 0) {
    coberturaTextual = 'integral';
  } else {
    coberturaTextual = 'misto';
  }

  return {
    nomeArquivo,
    totalPaginas: paginas.length,
    paginas,
    coberturaTextual,
    paginasSemTexto
  };
}

/**
 * Extrai um trecho legível para servir de evidência documental,
 * preservando a redação original do texto sem alteração arbitrária.
 */
export function extrairTrechoEvidencia(
  textoOriginal: string,
  posicaoInicio: number,
  posicaoFim: number,
  margemContexto: number = 30
): string {
  if (!textoOriginal) return '';
  const inicio = Math.max(0, posicaoInicio - margemContexto);
  const fim = Math.min(textoOriginal.length, posicaoFim + margemContexto);
  const trecho = textoOriginal.slice(inicio, fim).replace(/\s+/g, ' ').trim();
  const prefixo = inicio > 0 ? '... ' : '';
  const sufixo = fim < textoOriginal.length ? ' ...' : '';
  return `${prefixo}${trecho}${sufixo}`;
}
