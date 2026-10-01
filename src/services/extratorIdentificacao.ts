/**
 * CONFORMA GSASP — Extrator Determinístico dos Campos da Identificação (S5.1.2A)
 * Motor heurístico puro baseado em âncoras temáticas, padrões regulares e regras de integridade factual.
 * Não inventa dados e classifica estritamente entre 'localizado', 'nao_localizado', 'ambiguo' e 'inconclusivo'.
 */

import {
  criarCampoExtraido,
  criarCampoNaoLocalizado,
  criarCampoAmbiguo,
  criarCampoInconclusivo,
  type CampoIdentificacaoKey,
  type CampoExtraido,
  type CandidatoExtracao,
  type EvidenciaCampo,
  type DocumentoPdfTexto,
  type MapaCamposIdentificacao
} from '../domain/ingestao.ts';
import { extrairTrechoEvidencia } from './normalizacaoPdf.ts';


/**
 * Normaliza valores monetários para número float
 * Ex.: '360.000,00' -> 360000 | '85.000' -> 85000
 */
function converterStringParaMoeda(valorStr: string): number | null {
  const limpo = valorStr.replace(/\./g, '').replace(',', '.').trim();
  const num = parseFloat(limpo);
  return isNaN(num) ? null : num;
}

/**
 * Converte data DD/MM/AAAA ou DD-MM-AAAA para formato canônico ISO AAAA-MM-DD
 */
function converterParaDataIso(dataStr: string): string | null {
  const match = dataStr.match(/(\d{2})[\/\.-](\d{2})[\/\.-](\d{4})/);
  if (!match) return null;
  const [, dia, mes, ano] = match;
  return `${ano}-${mes}-${dia}`;
}

/**
 * Consolida uma lista de candidatos em um CampoExtraido tipado,
 * respeitando estritamente a cobertura documental e a ocorrência de ambiguidade.
 */
function consolidarCampo<T>(
  campoId: CampoIdentificacaoKey,
  rotulo: string,
  candidatosBrutos: CandidatoExtracao<T>[],
  documento: DocumentoPdfTexto
): CampoExtraido<T> {
  // Se o documento é puramente sem texto, retorna não localizado (ou inconclusivo se sem OCR)
  if (documento.coberturaTextual === 'sem_texto') {
    return criarCampoNaoLocalizado<T>(campoId, rotulo) as CampoExtraido<T>;
  }

  // Agrupa candidatos por valor (comparação estrita por string JSON ou primitivo)
  const mapaValores = new Map<string, { valor: T; evidencias: EvidenciaCampo[] }>();
  for (const c of candidatosBrutos) {
    const chave = JSON.stringify(c.valor);
    const existente = mapaValores.get(chave);
    if (existente) {
      existente.evidencias.push(...c.evidencias);
    } else {
      mapaValores.set(chave, { valor: c.valor, evidencias: [...c.evidencias] });
    }
  }

  const candidatosUnicos = Array.from(mapaValores.values());

  // Cenário 1: Nenhum candidato encontrado
  if (candidatosUnicos.length === 0) {
    if (documento.coberturaTextual === 'misto') {
      return criarCampoInconclusivo<T>(campoId, rotulo, {
        motivo: 'Páginas sem camada textual no documento misto',
        paginasNaoAnalisaveis: [...documento.paginasSemTexto]
      }) as CampoExtraido<T>;
    }
    return criarCampoNaoLocalizado<T>(campoId, rotulo) as CampoExtraido<T>;
  }

  // Cenário 2: Exatamente 1 candidato unificado (pode conter múltiplas evidências concordantes)
  if (candidatosUnicos.length === 1) {
    const unico = candidatosUnicos[0];
    return criarCampoExtraido<T>(
      campoId,
      rotulo,
      unico.valor,
      unico.evidencias,
      [unico]
    );
  }

  // Cenário 3: Múltiplos candidatos conflitantes -> Campo Ambíguo
  return criarCampoAmbiguo<T>(
    campoId,
    rotulo,
    candidatosUnicos,
    null as unknown as T
  );
}

/**
 * Unifica menções e variações do mesmo tipo de instrumento contratual.
 * Se todas as menções pertencerem à mesma família (ex.: 'Termo Aditivo'),
 * adota a especificação formal do título/página 1 e agrega as evidências.
 * Se pertencerem a famílias distintas (ex.: Rescisão vs Contrato), preserva o conflito.
 */
function unificarInstrumentos(candidatos: CandidatoExtracao<string>[]): CandidatoExtracao<string>[] {
  if (candidatos.length <= 1) return candidatos;

  const tiposBase = [
    'TERMO ADITIVO',
    'CONTRATO ADMINISTRATIVO',
    'TERMO DE RESCISÃO',
    'TERMO DE COOPERAÇÃO',
    'CONVÊNIO',
    'ATA DE REGISTRO DE PREÇOS'
  ];

  for (const base of tiposBase) {
    const todosPertencem = candidatos.every((c) => c.valor.toUpperCase().includes(base));
    if (todosPertencem) {
      const daPagina1 = candidatos.find((c) => c.evidencias.some((e) => e.pagina === 1));
      const maisEspecifico = daPagina1 && daPagina1.valor.toUpperCase().includes(base)
        ? daPagina1
        : candidatos.reduce((prev, curr) => (curr.valor.length > prev.valor.length ? curr : prev));

      const todasEvidencias = candidatos.flatMap((c) => c.evidencias);
      return [{
        valor: maisEspecifico.valor,
        evidencias: todasEvidencias
      }];
    }
  }

  return candidatos;
}

/**
 * Motor heurístico puro de extração dos nove campos da Identificação
 */
export function extrairCamposIdentificacao(
  documento: DocumentoPdfTexto,
  _executionId: string
): MapaCamposIdentificacao {
  const candidatosProcesso: CandidatoExtracao<string>[] = [];
  const candidatosInstrumento: CandidatoExtracao<string>[] = [];
  const candidatosContratado: CandidatoExtracao<string>[] = [];
  const candidatosCnpjCpf: CandidatoExtracao<string>[] = [];
  const candidatosObjeto: CandidatoExtracao<string>[] = [];
  const candidatosValor: CandidatoExtracao<number>[] = [];
  const candidatosVigenciaInicio: CandidatoExtracao<string>[] = [];
  const candidatosVigenciaFim: CandidatoExtracao<string>[] = [];
  const candidatosModalidade: CandidatoExtracao<string>[] = [];

  for (const pagina of documento.paginas) {
    if (!pagina.temTextoUtil) continue;
    const texto = pagina.textoNormalizado;
    const numPag = pagina.numeroPagina;

    // 1. Número do Processo
    const regexProcMt = /\b(?:[A-Z]{3,5}-(?:PRO|PGE|SESP|CGE|SEPLAN|SEDUC|SAD)-\d{4}\/\d{4,6})\b/g;
    let matchProc: RegExpExecArray | null;
    while ((matchProc = regexProcMt.exec(texto)) !== null) {
      candidatosProcesso.push({
        valor: matchProc[0],
        evidencias: [{
          arquivoOrigem: documento.nomeArquivo,
          pagina: numPag,
          trechoEvidencia: extrairTrechoEvidencia(texto, matchProc.index, regexProcMt.lastIndex),
          indiceInicio: matchProc.index,
          indiceFim: regexProcMt.lastIndex
        }]
      });
    }

    // 2. Tipo / Instrumento
    const regexInst = /(?:\d+º?\s*)?(?:TERMO ADITIVO|CONTRATO ADMINISTRATIVO|TERMO DE RESCISÃO|TERMO DE COOPERAÇÃO(?: TÉCNICA)?|CONVÊNIO|ATA DE REGISTRO DE PREÇOS)(?:\s+(?:N[ºo\.]?|AO CONTRATO N[ºo\.]?)\s*[\d\/\-]+)?/gi;
    let matchInst: RegExpExecArray | null;
    while ((matchInst = regexInst.exec(texto)) !== null) {
      const valor = matchInst[0].trim();
      candidatosInstrumento.push({
        valor,
        evidencias: [{
          arquivoOrigem: documento.nomeArquivo,
          pagina: numPag,
          trechoEvidencia: extrairTrechoEvidencia(texto, matchInst.index, regexInst.lastIndex),
          indiceInicio: matchInst.index,
          indiceFim: regexInst.lastIndex
        }]
      });
    }

    // 3. Contratado / Interessado
    // Padrão A: Âncora com separador direto (ex.: "CONTRATADA: Tech Soluções")
    const regexContratadoAncora = /(?:CONTRATAD[AO]|INTERESSAD[AO])\s*[:–—]\s*([A-Z0-9À-Ú\s\.,&/-]{4,80}?)(?:,|\.|\n|CNPJ|CPF|com sede|inscrita)/gi;
    let matchContr: RegExpExecArray | null;
    while ((matchContr = regexContratadoAncora.exec(texto)) !== null) {
      const valor = matchContr[1].trim().replace(/^[:–—\s]+|[,;\.\s]+$/g, '');
      if (valor.length >= 4 && !/\b(?:resolvem|celebrar|pagará|ajustam|firmam|SECRETARIA|ESTADO DE|CLÁUSULA|DO OBJETO)\b/i.test(valor)) {
        candidatosContratado.push({
          valor,
          evidencias: [{
            arquivoOrigem: documento.nomeArquivo,
            pagina: numPag,
            trechoEvidencia: extrairTrechoEvidencia(texto, matchContr.index, regexContratadoAncora.lastIndex),
            indiceInicio: matchContr.index,
            indiceFim: regexContratadoAncora.lastIndex
          }]
        });
      }
    }

    // Padrão B: Preâmbulo qualificatório (ex.: "a empresa TECH SOLUÇÕES LTDA, inscrita no CNPJ..., denominada CONTRATADA")
    const regexContratadoPreambulo = /(?:a\s+empresa|a\s+sociedade)\s+([A-Z0-9À-Ú\s\.,&/-]{4,80}?)(?:,|\s+inscrita|\s+portadora|\s+com\s+sede|\s+CNPJ)[\s\S]{0,120}?(?:denominad[ao]\s+CONTRATAD[AO]|CONTRATADA\b)/gi;
    let matchPreamb: RegExpExecArray | null;
    while ((matchPreamb = regexContratadoPreambulo.exec(texto)) !== null) {
      const valor = matchPreamb[1].trim().replace(/^[:–—\s]+|[,;\.\s]+$/g, '');
      if (valor.length >= 4 && !/\b(?:resolvem|celebrar|pagará|ajustam|firmam|SECRETARIA|ESTADO DE|CLÁUSULA|DO OBJETO)\b/i.test(valor)) {
        candidatosContratado.push({
          valor,
          evidencias: [{
            arquivoOrigem: documento.nomeArquivo,
            pagina: numPag,
            trechoEvidencia: extrairTrechoEvidencia(texto, matchPreamb.index, regexContratadoPreambulo.lastIndex),
            indiceInicio: matchPreamb.index,
            indiceFim: regexContratadoPreambulo.lastIndex
          }]
        });
      }
    }

    // 4. CNPJ / CPF
    const regexCnpj = /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g;
    let matchCnpj: RegExpExecArray | null;
    while ((matchCnpj = regexCnpj.exec(texto)) !== null) {
      candidatosCnpjCpf.push({
        valor: matchCnpj[0],
        evidencias: [{
          arquivoOrigem: documento.nomeArquivo,
          pagina: numPag,
          trechoEvidencia: extrairTrechoEvidencia(texto, matchCnpj.index, regexCnpj.lastIndex),
          indiceInicio: matchCnpj.index,
          indiceFim: regexCnpj.lastIndex
        }]
      });
    }

    const regexCpf = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g;
    let matchCpf: RegExpExecArray | null;
    while ((matchCpf = regexCpf.exec(texto)) !== null) {
      candidatosCnpjCpf.push({
        valor: matchCpf[0],
        evidencias: [{
          arquivoOrigem: documento.nomeArquivo,
          pagina: numPag,
          trechoEvidencia: extrairTrechoEvidencia(texto, matchCpf.index, regexCpf.lastIndex),
          indiceInicio: matchCpf.index,
          indiceFim: regexCpf.lastIndex
        }]
      });
    }

    // 5. Objeto
    const regexObjeto = /(?:CLÁUSULA\s+[A-Z0-9ªº\s-–—]*DO OBJETO|OBJETO:?)[:\s-–—]+([^\n]+(?:\n[^\n]+){0,4})/gi;
    let matchObj: RegExpExecArray | null;
    while ((matchObj = regexObjeto.exec(texto)) !== null) {
      const valor = matchObj[1].trim();
      if (valor.length >= 10) {
        candidatosObjeto.push({
          valor,
          evidencias: [{
            arquivoOrigem: documento.nomeArquivo,
            pagina: numPag,
            trechoEvidencia: extrairTrechoEvidencia(texto, matchObj.index, regexObjeto.lastIndex),
            indiceInicio: matchObj.index,
            indiceFim: regexObjeto.lastIndex
          }]
        });
      }
    }

    // 6. Valor
    const regexSecaoValor = /(?:CLÁUSULA\s+[A-Z0-9ªº\s-–—]*(?:DO VALOR|DO PREÇO|DO ACRÉSCIMO)|VALOR GLOBAL|VALOR TOTAL|PREÇO)[:\s-–—]+([^\n]+(?:\n[^\n]+){0,2})/gi;
    let matchSecaoValor: RegExpExecArray | null;
    while ((matchSecaoValor = regexSecaoValor.exec(texto)) !== null) {
      const trechoSecao = matchSecaoValor[1];
      const regexCifra = /R\$\s*([\d\.,]+)/g;
      let matchCifra: RegExpExecArray | null;
      while ((matchCifra = regexCifra.exec(trechoSecao)) !== null) {
        const contextoAnterior = trechoSecao.slice(Math.max(0, matchCifra.index - 35), matchCifra.index);
        if (/\b(?:parcelas?\s+mensa(?:l|is)|mensalmente)\s+(?:de\s+)?$/i.test(contextoAnterior)) {
          continue;
        }

        const num = converterStringParaMoeda(matchCifra[1]);
        if (num !== null && num > 0) {
          const absIndex = matchSecaoValor.index + matchCifra.index;
          candidatosValor.push({
            valor: num,
            evidencias: [{
              arquivoOrigem: documento.nomeArquivo,
              pagina: numPag,
              trechoEvidencia: extrairTrechoEvidencia(texto, absIndex, absIndex + matchCifra[0].length),
              indiceInicio: absIndex,
              indiceFim: absIndex + matchCifra[0].length
            }]
          });
        }
      }
    }

    // 7. Vigência Inicial e Final
    const regexVigencia = /(?:CLÁUSULA\s+[A-Z0-9ªº\s-–—]*(?:DA VIGÊNCIA|DO PRAZO)|VIGÊNCIA)[:\s-–—]+([^\n]+(?:\n[^\n]+){0,3})/gi;
    let matchVig: RegExpExecArray | null;
    while ((matchVig = regexVigencia.exec(texto)) !== null) {
      const trechoVig = matchVig[1];

      // Busca início: a contar de / início em / de [data]
      const regexIni = /(?:a contar de|início em|vigência de|período de)\s*(\d{2}[\/\.-]\d{2}[\/\.-]\d{4})/i;
      const matchIni = regexIni.exec(trechoVig);
      if (matchIni) {
        const dataIso = converterParaDataIso(matchIni[1]);
        if (dataIso) {
          const absIndex = matchVig.index + matchIni.index;
          candidatosVigenciaInicio.push({
            valor: dataIso,
            evidencias: [{
              arquivoOrigem: documento.nomeArquivo,
              pagina: numPag,
              trechoEvidencia: extrairTrechoEvidencia(texto, absIndex, absIndex + matchIni[0].length),
              indiceInicio: absIndex,
              indiceFim: absIndex + matchIni[0].length
            }]
          });
        }
      }

      // Busca fim: até / término em / a [data]
      const regexFim = /(?:até|término em|vencimento em|a)\s*(\d{2}[\/\.-]\d{2}[\/\.-]\d{4})/i;
      const matchFim = regexFim.exec(trechoVig);
      if (matchFim) {
        const dataIso = converterParaDataIso(matchFim[1]);
        if (dataIso) {
          const absIndex = matchVig.index + matchFim.index;
          candidatosVigenciaFim.push({
            valor: dataIso,
            evidencias: [{
              arquivoOrigem: documento.nomeArquivo,
              pagina: numPag,
              trechoEvidencia: extrairTrechoEvidencia(texto, absIndex, absIndex + matchFim[0].length),
              indiceInicio: absIndex,
              indiceFim: absIndex + matchFim[0].length
            }]
          });
        }
      }
    }

    // 8. Modalidade / Origem
    const regexModalidade = /(?:PREGÃO ELETRÔNICO|DISPENSA DE LICITAÇÃO|INEXIGIBILIDADE(?: DE LICITAÇÃO)?|CONCORRÊNCIA|ADESÃO À ATA DE REGISTRO DE PREÇOS)(?:\s+(?:N[ºo\.]?|ELETRÔNICA\s+N[ºo\.]?)\s*[\d\/\-]+)?/gi;
    let matchMod: RegExpExecArray | null;
    while ((matchMod = regexModalidade.exec(texto)) !== null) {
      const valor = matchMod[0].trim();
      candidatosModalidade.push({
        valor,
        evidencias: [{
          arquivoOrigem: documento.nomeArquivo,
          pagina: numPag,
          trechoEvidencia: extrairTrechoEvidencia(texto, matchMod.index, regexModalidade.lastIndex),
          indiceInicio: matchMod.index,
          indiceFim: regexModalidade.lastIndex
        }]
      });
    }
  }

  return {
    numeroProcesso: consolidarCampo<string | null>('numeroProcesso', 'Número do Processo', candidatosProcesso, documento),
    tipoInstrumento: consolidarCampo<string | null>('tipoInstrumento', 'Tipo / Instrumento', unificarInstrumentos(candidatosInstrumento), documento),
    contratadoInteressado: consolidarCampo<string | null>('contratadoInteressado', 'Contratado / Interessado', candidatosContratado, documento),
    cnpjCpf: consolidarCampo<string | null>('cnpjCpf', 'CNPJ / CPF', candidatosCnpjCpf, documento),
    objeto: consolidarCampo<string | null>('objeto', 'Objeto da Contratação', candidatosObjeto, documento),
    valor: consolidarCampo<number | null>('valor', 'Valor Global', candidatosValor, documento),
    vigenciaInicio: consolidarCampo<string | null>('vigenciaInicio', 'Vigência Inicial', candidatosVigenciaInicio, documento),
    vigenciaFim: consolidarCampo<string | null>('vigenciaFim', 'Vigência Final', candidatosVigenciaFim, documento),
    modalidadeOrigem: consolidarCampo<string | null>('modalidadeOrigem', 'Modalidade / Origem', candidatosModalidade, documento)
  };
}
