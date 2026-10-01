/**
 * CONFORMA GSASP — Spike de Compatibilidade PDF.js (S5.1.2B.0)
 * Validação de importação, leitura de PDF sintético, extração de TextItem,
 * ciclo de vida, tipagens de segurança e compatibilidade com o runner de testes e Vite.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

// Node.js v24 ainda mantém Uint8Array.prototype.toHex sob a flag --js-base-64.
// Garantir polyfill defensivo caso o ambiente runtime não o exponha nativamente.
if (typeof (Uint8Array.prototype as any).toHex !== 'function') {
  (Uint8Array.prototype as any).toHex = function (): string {
    return Array.from(this as Uint8Array)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };
}

import * as pdfjsLib from 'pdfjs-dist';

/**
 * Gera um PDF 1.4 sintético válido de 1 página em memória (100% fictício).
 */
function criarPdfSinteticoMinimo(texto: string = 'CONFORMA GSASP TESTE'): Uint8Array {
  const streamContent = `BT\n/F1 12 Tf\n72 712 Td\n(${texto}) Tj\nET`;
  const streamLength = streamContent.length;

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 612 792]
  /Resources <<
    /Font <<
      /F1 <<
        /Type /Font
        /Subtype /Type1
        /BaseFont /Helvetica
      >>
    >>
  >>
  /Contents 4 0 R
>>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000304 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
390
%%EOF`;

  return new TextEncoder().encode(pdf);
}

/**
 * Gera um PDF 1.4 sintético válido de 2 páginas em memória.
 */
function criarPdfSinteticoDuasPaginas(textoPagina1: string, textoPagina2: string): Uint8Array {
  const stream1 = `BT\n/F1 12 Tf\n72 712 Td\n(${textoPagina1}) Tj\nET`;
  const stream2 = `BT\n/F1 12 Tf\n72 712 Td\n(${textoPagina2}) Tj\nET`;

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R 5 0 R] /Count 2 >>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 612 792]
  /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
  /Contents 4 0 R
>>
endobj
4 0 obj
<< /Length ${stream1.length} >>
stream
${stream1}
endstream
endobj
5 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 612 792]
  /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
  /Contents 6 0 R
>>
endobj
6 0 obj
<< /Length ${stream2.length} >>
stream
${stream2}
endstream
endobj
xref
0 7
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000122 00000 n
0000000302 00000 n
0000000363 00000 n
0000000543 00000 n
trailer
<< /Size 7 /Root 1 0 R >>
startxref
610
%%EOF`;

  return new TextEncoder().encode(pdf);
}

test('S5.1.2B.0 - Spike: pdfjs-dist deve exportar getDocument e versão válida', () => {
  assert.ok(pdfjsLib, 'pdfjsLib deve estar definido');
  assert.equal(typeof pdfjsLib.getDocument, 'function', 'getDocument deve ser uma função');
  assert.equal(pdfjsLib.version, '6.3.289', 'A versão instalada deve ser 6.3.289');
});

test('S5.1.2B.0 - Spike: leitor deve processar PDF sintético mínimo a partir de Uint8Array', async () => {
  const bytes = criarPdfSinteticoMinimo('CONFORMA GSASP TESTE');
  assert.ok(bytes instanceof Uint8Array, 'Deve ser Uint8Array');
  assert.ok(bytes.byteLength > 0, 'Buffer não pode ser vazio');

  const loadingTask = pdfjsLib.getDocument({
    data: bytes,
    disableFontFace: true,
    disableRange: true,
    disableStream: true,
    disableAutoFetch: true
  });

  const pdfDoc = await loadingTask.promise;
  assert.ok(pdfDoc, 'pdfDoc deve ser resolvido');
  assert.equal(pdfDoc.numPages, 1, 'PDF sintético deve ter exatamente 1 página');

  const page = await pdfDoc.getPage(1);
  assert.ok(page, 'Página 1 deve ser acessível');
  assert.equal(page.pageNumber, 1, 'Número da página deve ser 1');

  const textContent = await page.getTextContent();
  assert.ok(textContent, 'textContent deve ser retornado');
  assert.ok(Array.isArray(textContent.items), 'textContent.items deve ser um array');
  assert.ok(textContent.items.length > 0, 'Deve conter pelo menos um TextItem');

  const primeiroItem = textContent.items[0] as { str?: string };
  assert.ok('str' in primeiroItem, 'Item deve possuir a propriedade str');
  assert.equal(primeiroItem.str, 'CONFORMA GSASP TESTE', 'Texto extraído deve ser idêntico ao sintético');

  // Validação de encerramento do ciclo de vida:
  // No PDF.js 6.x, pdfDoc não possui mais destroy() diretamente (retorna undefined),
  // e o encerramento é orquestrado via page.cleanup(), pdfDoc.cleanup() e loadingTask.destroy().
  assert.equal(typeof (pdfDoc as any).destroy, 'undefined', 'pdfDoc.destroy não existe mais na v6');
  assert.equal(typeof pdfDoc.cleanup, 'function', 'pdfDoc.cleanup deve ser uma função');
  assert.equal(typeof loadingTask.destroy, 'function', 'loadingTask.destroy deve ser uma função');

  page.cleanup();
  await pdfDoc.cleanup();
  await loadingTask.destroy();
});

test('S5.1.2B.0 - Spike: leitor deve processar PDF sintético a partir de ArrayBuffer', async () => {
  const bytes = criarPdfSinteticoMinimo('CONFORMA ARRAYBUFFER');
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  assert.ok(buffer instanceof ArrayBuffer, 'Deve ser instância de ArrayBuffer');

  const loadingTask = pdfjsLib.getDocument({
    data: buffer,
    disableFontFace: true
  });

  const pdfDoc = await loadingTask.promise;
  assert.equal(pdfDoc.numPages, 1);

  const page = await pdfDoc.getPage(1);
  const textContent = await page.getTextContent();
  const primeiroItem = textContent.items[0] as { str?: string };
  assert.equal(primeiroItem.str, 'CONFORMA ARRAYBUFFER');

  page.cleanup();
  await pdfDoc.cleanup();
  await loadingTask.destroy();
});

test('S5.1.2B.0 - Spike: leitor multipáginas preserva ordem e correspondência página -> texto', async () => {
  const bytes = criarPdfSinteticoDuasPaginas('TEXTO DA PAGINA UM', 'TEXTO DA PAGINA DOIS');

  const loadingTask = pdfjsLib.getDocument({
    data: bytes,
    disableFontFace: true
  });

  const pdfDoc = await loadingTask.promise;
  assert.equal(pdfDoc.numPages, 2, 'Deve identificar exatamente 2 páginas');

  const pag1 = await pdfDoc.getPage(1);
  const cont1 = await pag1.getTextContent();
  const str1 = cont1.items.map((i: any) => i.str).join(' ');
  assert.match(str1, /TEXTO DA PAGINA UM/);
  pag1.cleanup();

  const pag2 = await pdfDoc.getPage(2);
  const cont2 = await pag2.getTextContent();
  const str2 = cont2.items.map((i: any) => i.str).join(' ');
  assert.match(str2, /TEXTO DA PAGINA DOIS/);
  pag2.cleanup();

  await pdfDoc.cleanup();
  await loadingTask.destroy();
});

test('S5.1.2B.0 - Spike: rejeição controlada de PDF corrompido com InvalidPDFException', async () => {
  const dadosCorrompidos = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04]);

  const loadingTask = pdfjsLib.getDocument({
    data: dadosCorrompidos,
    disableFontFace: true
  });

  await assert.rejects(
    async () => {
      await loadingTask.promise;
    },
    (err: any) => {
      assert.ok(err, 'Erro deve ser lançado');
      assert.ok(
        err.name === 'InvalidPDFException' || /PDF/i.test(err.message),
        'Erro deve indicar PDF inválido ou corrompido'
      );
      return true;
    }
  );
});

test('S5.1.2B.0 - Spike: GlobalWorkerOptions e parâmetros de segurança verificados', () => {
  assert.ok(pdfjsLib.GlobalWorkerOptions, 'GlobalWorkerOptions deve existir');
  assert.equal(typeof pdfjsLib.GlobalWorkerOptions.workerPort, 'object');
  assert.equal(typeof pdfjsLib.GlobalWorkerOptions.workerSrc, 'string');

  // Verificação de parâmetros de segurança em DocumentInitParameters:
  // Parâmetros existentes no PDF.js 6.3.289:
  // - disableFontFace: boolean (presente)
  // - disableRange: boolean (presente)
  // - disableStream: boolean (presente)
  // - disableAutoFetch: boolean (presente)
  // - cMapUrl: string (presente)
  // - cMapPacked: boolean (presente)
  // - wasmUrl: string (presente)
  // - useWorkerFetch: boolean (presente)
  //
  // Parâmetros inexistentes no PDF.js 6.3.289:
  // - isEvalSupported (não existe)
  // - disableScripting (não existe em DocumentInitParameters)
  const parametrosValidos: pdfjsLib.DocumentInitParameters = {
    data: new Uint8Array([1, 2, 3]),
    disableFontFace: true,
    disableRange: true,
    disableStream: true,
    disableAutoFetch: true,
    cMapPacked: true
  };
  assert.ok(parametrosValidos.data, 'Tipagens compilam validamente');
});
