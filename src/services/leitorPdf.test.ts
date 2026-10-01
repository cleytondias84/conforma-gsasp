/**
 * CONFORMA GSASP — Testes Unitários do Adapter de Leitura de PDF (S5.1.2B)
 * Executado nativamente pelo Node.js test runner sem dependência de DOM.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

// Polyfill defensivo restrito ao ambiente de teste Node.js
if (typeof (Uint8Array.prototype as any).toHex !== 'function') {
  (Uint8Array.prototype as any).toHex = function (): string {
    return Array.from(this as Uint8Array)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };
}

import {
  extrairTextoPdf,
  reconstruirTextoPagina,
  copiarDadosPdf,
  carregarPdfJs,
  ErroLeituraPdf
} from './leitorPdf.ts';

/**
 * Utilitário sintético para gerar PDFs válidos de N páginas em memória sem dependência externa.
 */
function gerarPdfSintetico(textosPaginas: string[]): Uint8Array {
  const numPaginas = textosPaginas.length;
  const kids = textosPaginas.map((_, idx) => `${3 + idx * 2} 0 R`).join(' ');

  let body = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  body += `2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${numPaginas} >>\nendobj\n`;

  textosPaginas.forEach((texto, idx) => {
    const pageObjNum = 3 + idx * 2;
    const contentObjNum = 4 + idx * 2;
    const stream = texto.length > 0 ? `BT\n/F1 12 Tf\n72 712 Td\n(${texto}) Tj\nET` : '';

    body += `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents ${contentObjNum} 0 R >>\nendobj\n`;
    body += `${contentObjNum} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`;
  });

  const totalObjs = 2 + numPaginas * 2;
  body += `xref\n0 ${totalObjs + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= totalObjs; i++) {
    body += `0000000010 00000 n \n`;
  }
  body += `trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\nstartxref\n${body.length}\n%%EOF`;

  return new TextEncoder().encode(body);
}

test('S5.1.2B - reconstruirTextoPagina: formata texto horizontal com espaços e quebras verticais', () => {
  const items = [
    { str: 'CONFORMA', transform: [1, 0, 0, 1, 72, 700], width: 60, height: 12, hasEOL: false },
    { str: 'GSASP', transform: [1, 0, 0, 1, 140, 700], width: 40, height: 12, hasEOL: true },
    { str: 'CLÁUSULA PRIMEIRA', transform: [1, 0, 0, 1, 72, 680], width: 120, height: 12, hasEOL: false }
  ];

  const resultado = reconstruirTextoPagina(items);
  assert.equal(resultado, 'CONFORMA GSASP\nCLÁUSULA PRIMEIRA');
});

test('S5.1.2B - reconstruirTextoPagina: lida com itens vazios ou sem texto', () => {
  assert.equal(reconstruirTextoPagina([]), '');
  assert.equal(reconstruirTextoPagina([{ str: '' }]), '');
});

test('S5.1.2B - extrairTextoPdf: processa PDF sintético de 1 página e extrai DocumentoPdfTexto', async () => {
  const bytes = gerarPdfSintetico(['TERMO DE CONTRATO N 001/2026 - CONFORMA GSASP']);
  const doc = await extrairTextoPdf(bytes, 'contrato_01.pdf');

  assert.equal(doc.nomeArquivo, 'contrato_01.pdf');
  assert.equal(doc.totalPaginas, 1);
  assert.equal(doc.coberturaTextual, 'integral');
  assert.equal(doc.paginas.length, 1);
  assert.equal(doc.paginas[0].numeroPagina, 1);
  assert.match(doc.paginas[0].textoNormalizado, /TERMO DE CONTRATO N 001\/2026/);
});

test('S5.1.2B - extrairTextoPdf: aceita ArrayBuffer nativo além de Uint8Array', async () => {
  const bytes = gerarPdfSintetico(['CONTEUDO TESTE ARRAYBUFFER']);
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);

  const doc = await extrairTextoPdf(buffer, 'buffer.pdf');
  assert.equal(doc.totalPaginas, 1);
  assert.match(doc.paginas[0].textoNormalizado, /CONTEUDO TESTE ARRAYBUFFER/);
});

test('S5.1.2B - extrairTextoPdf: preserva correspondência estrita página -> texto e ordem 1-based', async () => {
  const textos = [
    'PAGINA UM: DISPENSA DE LICITACAO 01/2026',
    'PAGINA DOIS: VALOR TOTAL R$ 150.000,00',
    'PAGINA TRES: VIGENCIA ATE 31/12/2026'
  ];
  const bytes = gerarPdfSintetico(textos);

  const progressoRegistrado: { atual: number; total: number }[] = [];
  const doc = await extrairTextoPdf(bytes, 'processo_completo.pdf', {
    onProgresso: (atual, total) => progressoRegistrado.push({ atual, total })
  });

  assert.equal(doc.totalPaginas, 3);
  assert.equal(progressoRegistrado.length, 3);
  assert.deepEqual(progressoRegistrado, [
    { atual: 1, total: 3 },
    { atual: 2, total: 3 },
    { atual: 3, total: 3 }
  ]);

  assert.match(doc.paginas[0].textoNormalizado, /PAGINA UM/);
  assert.match(doc.paginas[1].textoNormalizado, /PAGINA DOIS/);
  assert.match(doc.paginas[2].textoNormalizado, /PAGINA TRES/);
});

test('S5.1.2B - extrairTextoPdf: classifica adequadamente documento misto e sem texto', async () => {
  // Documento misto: P1 com texto útil longo, P2 sem texto
  const bytesMisto = gerarPdfSintetico([
    'CONTRATO DE GESTAO ADMINISTRATIVA COM MAIS DE VINTE CARACTERES UTEIS',
    ''
  ]);
  const docMisto = await extrairTextoPdf(bytesMisto, 'misto.pdf');
  assert.equal(docMisto.coberturaTextual, 'misto');
  assert.deepEqual(docMisto.paginasSemTexto, [2]);

  // Documento sem texto: todas as páginas sem camada textual
  const bytesSemTexto = gerarPdfSintetico(['', '']);
  const docSemTexto = await extrairTextoPdf(bytesSemTexto, 'digitalizado.pdf');
  assert.equal(docSemTexto.coberturaTextual, 'sem_texto');
  assert.deepEqual(docSemTexto.paginasSemTexto, [1, 2]);
});

test('S5.1.2B - extrairTextoPdf: rejeita documento acima do limite operacional sem truncamento silencioso', async () => {
  const bytes = gerarPdfSintetico(['P1 COM TEXTO SUFICIENTE', 'P2 COM TEXTO SUFICIENTE', 'P3 COM TEXTO SUFICIENTE']);

  await assert.rejects(
    async () => {
      await extrairTextoPdf(bytes, 'excesso.pdf', { maxPaginasPermitidas: 2 });
    },
    (err: unknown) => {
      assert.ok(err instanceof ErroLeituraPdf);
      assert.equal(err.codigo, 'LIMITE_PAGINAS_EXCEDIDO');
      assert.match(err.message, /3 páginas/);
      assert.match(err.message, /2 páginas permitidas/);
      return true;
    }
  );
});

test('S5.1.2B - extrairTextoPdf: rejeita buffer vazio com código PDF_VAZIO', async () => {
  await assert.rejects(
    async () => {
      await extrairTextoPdf(new Uint8Array([]), 'vazio.pdf');
    },
    (err: unknown) => {
      assert.ok(err instanceof ErroLeituraPdf);
      assert.equal(err.codigo, 'PDF_VAZIO');
      return true;
    }
  );
});

test('S5.1.2B - extrairTextoPdf: rejeita arquivo inválido ou corrompido com PDF_CORROMPIDO_OU_INVALIDO', async () => {
  const lixo = new Uint8Array([0xde, 0xad, 0xbe, 0xef, 0x01, 0x02]);

  await assert.rejects(
    async () => {
      await extrairTextoPdf(lixo, 'lixo.pdf');
    },
    (err: unknown) => {
      assert.ok(err instanceof ErroLeituraPdf);
      assert.equal(err.codigo, 'PDF_CORROMPIDO_OU_INVALIDO');
      return true;
    }
  );
});

// ============================================================================
// NOVOS TESTES ESPECÍFICOS DE AUDITORIA: DETACH, LAZY LOADING E LIFECYCLE
// ============================================================================

test('S5.1.2B - cópia defensiva: impede detach e mantém buffer do chamador utilizável após sucesso e erro', async () => {
  // 1. Caso de Sucesso com Uint8Array
  const bytesOriginal = gerarPdfSintetico(['TESTE PROTECAO DETACH SUCESSO']);
  const snapshotOriginal = new Uint8Array(bytesOriginal);

  const doc = await extrairTextoPdf(bytesOriginal, 'sucesso_detach.pdf');
  assert.equal(doc.totalPaginas, 1);

  // Buffer original permanece com o mesmo tamanho, mesmos bytes e utilizável
  assert.equal(bytesOriginal.byteLength, snapshotOriginal.byteLength);
  assert.deepEqual(bytesOriginal, snapshotOriginal);
  assert.doesNotThrow(() => {
    bytesOriginal.slice(0, 10);
  }, 'Buffer original não pode ter sofrido detach');

  // 2. Caso de Sucesso com ArrayBuffer nativo
  const bufferOriginal = bytesOriginal.buffer.slice(bytesOriginal.byteOffset, bytesOriginal.byteOffset + bytesOriginal.byteLength);
  const tamanhoBuffer = bufferOriginal.byteLength;

  await extrairTextoPdf(bufferOriginal, 'buffer_detach.pdf');
  assert.equal(bufferOriginal.byteLength, tamanhoBuffer);
  assert.doesNotThrow(() => {
    new Uint8Array(bufferOriginal).slice(0, 5);
  }, 'ArrayBuffer original nativo não pode ter sofrido detach');

  // 3. Caso de Erro (limite de páginas excedido)
  const bytesMulti = gerarPdfSintetico(['P1', 'P2', 'P3']);
  const snapshotMulti = new Uint8Array(bytesMulti);

  await assert.rejects(async () => {
    await extrairTextoPdf(bytesMulti, 'erro_detach.pdf', { maxPaginasPermitidas: 1 });
  });

  assert.equal(bytesMulti.byteLength, snapshotMulti.byteLength);
  assert.deepEqual(bytesMulti, snapshotMulti);
  assert.doesNotThrow(() => {
    bytesMulti.slice();
  }, 'Buffer original não pode ter sofrido detach mesmo após erro');

  // 4. Teste unitário direto de copiarDadosPdf com view offset
  const bufferComprido = new ArrayBuffer(50);
  const viewComOffset = new Uint8Array(bufferComprido, 10, 20);
  viewComOffset.fill(0xaa);

  const copia = copiarDadosPdf(viewComOffset);
  assert.equal(copia.byteLength, 20);
  assert.equal(copia.byteOffset, 0); // nova view alinhada
  assert.equal(copia[0], 0xaa);
});

test('S5.1.2B - carregarPdfJs: carrega lazy e retorna a mesma Promise em cache', async () => {
  const p1 = carregarPdfJs();
  const p2 = carregarPdfJs();
  assert.strictEqual(p1, p2, 'Chamadas consecutivas a carregarPdfJs devem reutilizar a mesma Promise em cache');

  const modulo = await p1;
  assert.equal(typeof modulo.getDocument, 'function');
});

test('S5.1.2B - ciclo de vida: loadingTask.destroy() é chamado no caminho de sucesso', async () => {
  let destroyChamado = false;
  let cleanupDocChamado = false;

  const mockPage = {
    getTextContent: async () => ({ items: [{ str: 'TEXTO TESTE' }] }),
    cleanup: () => {}
  };

  const mockDoc = {
    numPages: 1,
    getPage: async () => mockPage,
    cleanup: async () => { cleanupDocChamado = true; }
  };

  const mockLoadingTask: any = {
    promise: Promise.resolve(mockDoc),
    destroy: async () => {
      destroyChamado = true;
    }
  };

  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // %PDF
  const doc = await extrairTextoPdf(bytes, 'lifecycle_sucesso.pdf', {
    _fabricaGetDocument: () => mockLoadingTask
  });

  assert.equal(doc.totalPaginas, 1);
  assert.equal(cleanupDocChamado, true, 'pdfDoc.cleanup deve ser chamado');
  assert.equal(destroyChamado, true, 'loadingTask.destroy DEVE ser chamado no caminho de sucesso');
});

test('S5.1.2B - ciclo de vida: loadingTask.destroy() é chamado após erro ocorrido pós-criação da tarefa', async () => {
  let destroyChamado = false;

  const mockLoadingTask: any = {
    promise: Promise.reject(new Error('Falha simulada na inicialização do PDF')),
    destroy: async () => {
      destroyChamado = true;
    }
  };

  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

  await assert.rejects(
    async () => {
      await extrairTextoPdf(bytes, 'lifecycle_erro.pdf', {
        _fabricaGetDocument: () => mockLoadingTask
      });
    },
    (err: unknown) => {
      assert.ok(err instanceof ErroLeituraPdf);
      assert.equal(err.codigo, 'FALHA_PROCESSAMENTO_LEITURA');
      return true;
    }
  );

  assert.equal(destroyChamado, true, 'loadingTask.destroy DEVE ser chamado mesmo em caminho de erro');
});

test('S5.1.2B - ciclo de vida: page.cleanup() ocorre mesmo quando getTextContent da página falha', async () => {
  let pageCleanupChamado = false;
  let destroyChamado = false;

  const mockPage = {
    getTextContent: async () => {
      throw new Error('Falha de decodificação na página');
    },
    cleanup: () => {
      pageCleanupChamado = true;
    }
  };

  const mockDoc = {
    numPages: 1,
    getPage: async () => mockPage,
    cleanup: async () => {}
  };

  const mockLoadingTask: any = {
    promise: Promise.resolve(mockDoc),
    destroy: async () => {
      destroyChamado = true;
    }
  };

  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

  await assert.rejects(
    async () => {
      await extrairTextoPdf(bytes, 'page_error.pdf', {
        _fabricaGetDocument: () => mockLoadingTask
      });
    },
    (err: unknown) => {
      assert.ok(err instanceof ErroLeituraPdf);
      assert.equal(err.codigo, 'FALHA_PROCESSAMENTO_LEITURA');
      return true;
    }
  );

  assert.equal(pageCleanupChamado, true, 'page.cleanup() DEVE ser invocado em bloco finally da página');
  assert.equal(destroyChamado, true, 'loadingTask.destroy() DEVE ser invocado após a falha da página');
});

test('S5.1.2B - ciclo de vida: falha em pdfDoc.cleanup() não impede a execução de loadingTask.destroy()', async () => {
  let destroyChamado = false;

  const mockPage = {
    getTextContent: async () => ({ items: [{ str: 'CONTEUDO OK' }] }),
    cleanup: () => {}
  };

  const mockDoc = {
    numPages: 1,
    getPage: async () => mockPage,
    cleanup: async () => {
      throw new Error('Falha forçada no cleanup do pdfDoc');
    }
  };

  const mockLoadingTask: any = {
    promise: Promise.resolve(mockDoc),
    destroy: async () => {
      destroyChamado = true;
    }
  };

  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
  const doc = await extrairTextoPdf(bytes, 'doc_cleanup_fail.pdf', {
    _fabricaGetDocument: () => mockLoadingTask
  });

  assert.equal(doc.totalPaginas, 1);
  assert.equal(destroyChamado, true, 'loadingTask.destroy() DEVE ser chamado mesmo se pdfDoc.cleanup falhar');
});
