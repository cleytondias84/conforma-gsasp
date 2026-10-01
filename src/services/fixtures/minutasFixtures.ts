/**
 * CONFORMA GSASP — Fixtures Sintéticas para Testes de Ingestão (S5.1.2A)
 * Massas de dados 100% fictícias representando cenários reais de minutas administrativas.
 * Nenhuma fixture contém dados reais ou confidenciais.
 */

import { criarDocumentoPdfTexto } from '../normalizacaoPdf.ts';
import type { DocumentoPdfTexto } from '../../domain/ingestao.ts';

/**
 * 1. Contrato regular completo: 4 páginas, integral, todos os 9 campos presentes.
 */
export function getFixtureContratoRegular(): DocumentoPdfTexto {
  return criarDocumentoPdfTexto('minuta_contrato_regular.pdf', [
    {
      numeroPagina: 1,
      textoBruto: `ESTADO DE MATO GROSSO
SECRETARIA DE ESTADO DE SEGURANÇA PÚBLICA FICTÍCIA
PROCESSO ADMINISTRATIVO Nº SESP-PRO-2026/00123
CONTRATO ADMINISTRATIVO Nº 01/2026

Pelo presente instrumento, o ESTADO DE MATO GROSSO, por intermédio da Secretaria,
e de outro lado a empresa TECH SOLUÇÕES INTEGRADAS LTDA, inscrita no CNPJ sob o nº 12.345.678/0001-90,
doravante denominada CONTRATADA, resolvem celebrar o presente Contrato Administrativo,
decorrente do PREGÃO ELETRÔNICO Nº 05/2026.`
    },
    {
      numeroPagina: 2,
      textoBruto: `CLÁUSULA PRIMEIRA - DO OBJETO
O presente instrumento tem por objeto a contratação de serviços especializados de sustentação de infraestrutura de tecnologia da informação e comunicação para atendimento das unidades da pasta.

CLÁUSULA SEGUNDA - DA EXECUÇÃO
Os serviços serão executados em conformidade rigorosa com o Termo de Referência.`
    },
    {
      numeroPagina: 3,
      textoBruto: `CLÁUSULA QUINTA - DO VALOR E RECURSOS ORÇAMENTÁRIOS
O valor global do presente Contrato é de R$ 360.000,00 (trezentos e sessenta mil reais), a ser pago em parcelas mensais de R$ 30.000,00.

As despesas decorrentes deste contrato correrão por conta da dotação orçamentária própria.`
    },
    {
      numeroPagina: 4,
      textoBruto: `CLÁUSULA NONA - DA VIGÊNCIA E EFICÁCIA
O presente Contrato vigorará pelo período de 12 (doze) meses, com vigência a contar de 01/05/2026 até 01/05/2027.

E por estarem justos e contratados, assinam as partes.`
    }
  ]);
}

/**
 * 2. Termo Aditivo: 3 páginas, integral, Termo Aditivo de prorrogação e valor.
 */
export function getFixtureTermoAditivo(): DocumentoPdfTexto {
  return criarDocumentoPdfTexto('minuta_termo_aditivo.pdf', [
    {
      numeroPagina: 1,
      textoBruto: `ESTADO DE MATO GROSSO
PROCESSO Nº SESP-PRO-2026/00456
1º TERMO ADITIVO AO CONTRATO Nº 05/2025

CONTRATANTE: ESTADO DE MATO GROSSO
CONTRATADA: INOVA SERVIÇOS E LOCAÇÕES EIRELI
CNPJ: 98.765.432/0001-10
ORIGEM: DISPENSA DE LICITAÇÃO Nº 02/2025`
    },
    {
      numeroPagina: 2,
      textoBruto: `CLÁUSULA PRIMEIRA - DO OBJETO
O presente Termo Aditivo tem por objeto a prorrogação de prazo e o acréscimo de quantitativo na prestação de serviços de limpeza e conservação predial.

CLÁUSULA SEGUNDA - DO VALOR ADITADO
O valor deste termo aditivo corresponde ao montante de R$ 85.000,00 (oitenta e cinco mil reais).`
    },
    {
      numeroPagina: 3,
      textoBruto: `CLÁUSULA TERCEIRA - DO PRAZO DE VIGÊNCIA
Fica prorrogada a vigência contratual por mais 6 meses, com início em 01/06/2026 e término em 01/12/2026.`
    }
  ]);
}

/**
 * 3. Valor com Múltiplas Evidências Concordantes: 3 páginas,
 * o valor de R$ 180.000,00 aparece na Cláusula de Valor e é ratificado na Cláusula de Ratificação.
 */
export function getFixtureValorMultiplasEvidencias(): DocumentoPdfTexto {
  return criarDocumentoPdfTexto('minuta_multiplas_evidencias.pdf', [
    {
      numeroPagina: 1,
      textoBruto: `PROCESSO Nº SESP-PRO-2026/00789
CONTRATO ADMINISTRATIVO Nº 15/2026
CONTRATADA: LOGÍSTICA EXPRESS LTDA
CNPJ: 22.333.444/0001-55
PREGÃO ELETRÔNICO Nº 12/2026`
    },
    {
      numeroPagina: 2,
      textoBruto: `CLÁUSULA PRIMEIRA - DO OBJETO: Transporte e distribuição de suprimentos.

CLÁUSULA QUARTA - DO PREÇO
Pela execução dos serviços, a Contratante pagará à Contratada o valor total de R$ 180.000,00 (cento e oitenta mil reais).`
    },
    {
      numeroPagina: 3,
      textoBruto: `CLÁUSULA DÉCIMA - DA RATIFICAÇÃO
Fica expressamente ratificado o valor global de R$ 180.000,00 para todos os efeitos legais.
Vigência de 01/07/2026 até 01/07/2027.`
    }
  ]);
}

/**
 * 4. Valores Conflitantes (Ambíguo): 3 páginas,
 * Cláusula 4ª fala em acréscimo de R$ 40.000,00 e Cláusula 5ª fala em valor global de R$ 240.000,00.
 * Deve gerar estadoExtracao 'ambiguo' com 2 candidatos e valorSugerido null.
 */
export function getFixtureValoresConflitantesAmbiguo(): DocumentoPdfTexto {
  return criarDocumentoPdfTexto('minuta_valores_conflitantes.pdf', [
    {
      numeroPagina: 1,
      textoBruto: `PROCESSO Nº SESP-PRO-2026/00999
2º TERMO ADITIVO AO CONTRATO Nº 08/2024
CONTRATADA: CONSTRUTORA CENTRAL LTDA
CNPJ: 33.444.555/0001-66
ORIGEM: CONCORRÊNCIA Nº 01/2024
CLÁUSULA PRIMEIRA - DO OBJETO: O presente termo tem por objeto a reforma do pavimento térreo.`
    },
    {
      numeroPagina: 2,
      textoBruto: `CLÁUSULA QUARTA - DO ACRÉSCIMO DE VALOR
Em razão das alterações de projeto, é concedido o acréscimo de valor de R$ 40.000,00 no contrato.`
    },
    {
      numeroPagina: 3,
      textoBruto: `CLÁUSULA QUINTA - DO NOVO VALOR GLOBAL
Com o acréscimo supracitado, o valor global ajustado passa a ser de R$ 240.000,00.
Vigência a contar de 10/05/2026 até 10/11/2026.`
    }
  ]);
}

/**
 * 5. Campo Ausente Factualmente (não_localizado): 2 páginas, integral,
 * cessão gratuita sem valor financeiro e sem modalidade de origem.
 */
export function getFixtureCampoAusenteNaoLocalizado(): DocumentoPdfTexto {
  return criarDocumentoPdfTexto('minuta_cessao_gratuita.pdf', [
    {
      numeroPagina: 1,
      textoBruto: `ESTADO DE MATO GROSSO
PROCESSO Nº SESP-PRO-2026/00111
TERMO DE COOPERAÇÃO TÉCNICA Nº 03/2026

INTERESSADO: ASSOCIAÇÃO BENEFICENTE FICTÍCIA
CNPJ: 55.666.777/0001-88`
    },
    {
      numeroPagina: 2,
      textoBruto: `CLÁUSULA PRIMEIRA - DO OBJETO
O presente termo tem por objeto o intercâmbio de dados técnicos institucionais a título gratuito.

CLÁUSULA SEGUNDA - DA GRATUIDADE
A presente cooperação técnica não envolve transferência de recursos financeiros entre os partícipes.

CLÁUSULA TERCEIRA - DA VIGÊNCIA
Vigência de 01/01/2026 até 31/12/2026.`
    }
  ]);
}

/**
 * 6. Documento Misto (Inconclusivo para campos ausentes): 4 páginas,
 * Páginas 1 e 2 possuem texto legível, mas páginas 3 e 4 estão vazias/digitalizadas (0 caracteres).
 * Campo 'valor' não aparece nas páginas 1 e 2 -> deve resultar em 'inconclusivo'.
 */
export function getFixtureDocumentoMistoInconclusivo(): DocumentoPdfTexto {
  return criarDocumentoPdfTexto('minuta_mista_digitalizada.pdf', [
    {
      numeroPagina: 1,
      textoBruto: `PROCESSO Nº SESP-PRO-2026/00333
CONTRATO ADMINISTRATIVO Nº 09/2026
CONTRATADA: SEGURANÇA MONITORADA LTDA
CNPJ: 77.888.999/0001-00`
    },
    {
      numeroPagina: 2,
      textoBruto: `CLÁUSULA PRIMEIRA - DO OBJETO
Prestação de serviços de monitoramento eletrônico patrimonial.`
    },
    {
      numeroPagina: 3,
      textoBruto: `   ` // Digitalizado sem camada de texto
    },
    {
      numeroPagina: 4,
      textoBruto: `` // Digitalizado sem camada de texto
    }
  ]);
}

/**
 * 7. Documento Sem Texto (todas as páginas digitalizadas/sem texto útil): 3 páginas.
 */
export function getFixtureDocumentoSemTexto(): DocumentoPdfTexto {
  return criarDocumentoPdfTexto('digitalizacao_sem_ocr.pdf', [
    { numeroPagina: 1, textoBruto: `   \n\t  ` },
    { numeroPagina: 2, textoBruto: `` },
    { numeroPagina: 3, textoBruto: `   ` }
  ]);
}

/**
 * 8. Palavras Quebradas por Linha e Hífen:
 * Testa normalização de 'CON-\nTRATADA', 'PRE-\nGÃO' e valores 'R$\n125.000,00'.
 */
export function getFixturePalavrasQuebradasLinhaHifen(): DocumentoPdfTexto {
  return criarDocumentoPdfTexto('minuta_quebras_hifen.pdf', [
    {
      numeroPagina: 1,
      textoBruto: `PROCESSO Nº SESP-PRO-2026/00888
CON-\nTRATO ADMINISTRATIVO Nº 20/2026
CON-\nTRATADA: ENGENHARIA E CONSTRUTORA SILVA S/A
CNPJ: 44.555.666/0001-77
ORIGEM: PRE-\nGÃO ELETRÔNICO Nº 08/2026`
    },
    {
      numeroPagina: 2,
      textoBruto: `CLÁUSULA PRIMEIRA - DO OBJETO:
Execução de serviços de reforma e pintura predial.

CLÁUSULA QUINTA - DO VALOR:
O valor total deste contrato é de R$\n125.000,00 (cento e vinte e cinco mil reais).
Vigência a contar de 15/08/2026 até 15/08/2027.`
    }
  ]);
}

/**
 * 9. Formatos Distintos de Datas e Valores:
 * Valores sem centavos, datas por extenso e com separador de traço.
 */
export function getFixtureFormatosDistintosDatasValores(): DocumentoPdfTexto {
  return criarDocumentoPdfTexto('minuta_formatos_distintos.pdf', [
    {
      numeroPagina: 1,
      textoBruto: `PROCESSO: SESP-PRO-2026/00777
TERMO ADITIVO Nº 04/2026
CONTRATADA: COMÉRCIO DE EQUIPAMENTOS MATO GROSSO LTDA
CNPJ: 88.999.000/0001-11
ORIGEM: DISPENSA DE LICITAÇÃO Nº 10/2026`
    },
    {
      numeroPagina: 2,
      textoBruto: `CLÁUSULA PRIMEIRA - DO OBJETO: Fornecimento de peças e acessórios para viaturas.
CLÁUSULA SEGUNDA - DO PREÇO: O valor global deste termo é de R$ 90.000,00.
CLÁUSULA TERCEIRA - DO PRAZO: Vigência com início em 01-09-2026 e término em 01-03-2027.`
    }
  ]);
}
