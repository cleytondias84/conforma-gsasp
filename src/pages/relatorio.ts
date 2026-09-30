/**
 * CONFORMA GSASP — Relatório Executivo de Conformidade Prévia (S4.3-Demo)
 * Base normativa: docs/contexto.md (RN08, RN09, RN10, RN11, RN12), docs/regras-funcionais.md
 *
 * Módulo read-only que consolida e extrai os dados reais da instrução processual
 * (Etapas 1 a 6) para emissão de documento executivo demonstrativo.
 *
 * Princípios de Governança e Integridade:
 * 1. Read-only puro: não muta estado em memória nem no IndexedDB.
 * 2. Não emite eventos de auditoria (sem chamadas a registrarEventoLocal).
 * 3. Não recalcula nem altera regras de decisão (consome os resultados homologados na S4.2).
 * 4. Apresenta dados reais disponíveis; ausências são explicitamente sinalizadas como "Não informado" ou "Não disponível na análise".
 * 5. As 4 dimensões de risco são estritamente Jurídica, Financeira, Operacional e Controle (RN11/RN12).
 * 6. As 5 perguntas executivas preservam integralmente os títulos oficiais homologados (RN09).
 * 7. Sem autenticidade jurídica ou chancela oficial: documento de apoio à decisão demonstrativo.
 */

import type {
  ItemConformidade,
  Condicionante,
  Achado,
  TipoConclusao,
  DimensaoRisco,
  NivelRisco
} from '../domain/tipos.ts';

import {
  formatarMoeda,
  formatarDataBR,
  calcularDuracaoVigencia,
  formatarConclusaoPertinencia,
  formatarStatusConformidade,
  formatarSituacaoCondicionante
} from '../domain/validacao.ts';

import {
  formatarConclusao,
  obterRotuloPrecedencia,
  CATÁLOGO_MOTIVOS,
  SALVAGUARDAS_CONCLUSAO,
  type PrecedenciaDecisoria,
  type CodigoMotivoConclusao
} from '../domain/conclusao.ts';

import { METADADOS_DIMENSOES, METADADOS_NIVEIS } from '../domain/riscos.ts';

import { getProcessoAtivo } from './identificacao.ts';
import { getPertinenciaAtiva, isPertinenciaValidada } from './pertinencia.ts';
import { getChecklistAtivo, getCondicionantesAtivas } from './conformidade.ts';
import { getAchadosAtivos } from './achados.ts';
import { getRiscosAtivos } from './riscos.ts';
import {
  getResultadoExecutivoAtivo,
  getConclusaoValidada,
  getValidacaoHumana,
  getJustificativaDivergencia,
  getObservacoesAssessor,
  getManifestacaoAnteriorInvalidada,
  gerarRespostasCincoPerguntas,
  type RespostasCincoPerguntas
} from './resultado.ts';
import { getPapelAtivo, getInfoPapelAtivo } from '../auth/papeis.ts';

// ==========================================
// 1. ESTRUTURA DE DADOS SOMENTE LEITURA
// ==========================================

export interface DadosRelatorioExecutivo {
  // I — Identificação da Instrução
  processo: {
    numero: string;
    instrumento: string;
    contratado: string;
    cnpj: string;
    objeto: string;
    tipoOrigem: string;
    valor: number | null | undefined;
    valorFormatado: string;
    vigenciaFormatada: string;
    duracaoVigencia: string;
    regimeJuridico: string;
  };

  // II — Pertinência Institucional
  pertinencia: {
    conclusao: string;
    conclusaoOriginal: string | null;
    isHomologada: boolean;
    statusValidacaoHumana: string;
    validadoPor: string | null;
    dataHoraValidacao: string | null;
    sinteseObjetiva: string;
    evidencias: string;
    providencia: string;
    criterios: {
      competenciaNecessidade: boolean;
      vinculoPlanejamento: boolean;
      beneficioInteressePublico: boolean;
      custoProporcionalidade: boolean;
      economicidade: boolean;
    };
  };

  // III — Conformidade Documental e Jurídica
  conformidade: {
    totalItens: number;
    itensConformes: ItemConformidade[];
    itensPendentes: ItemConformidade[];
    itensAConfirmar: ItemConformidade[];
    itensNaoAplicaveis: ItemConformidade[];
    todosItens: ItemConformidade[];
  };

  condicionantes: {
    total: number;
    atendidas: Condicionante[];
    emCumprimento: Condicionante[];
    pendentes: Condicionante[];
    todas: Condicionante[];
  };

  // IV — Achados
  achados: {
    total: number;
    validados: Achado[];
    pendentes: Achado[];
    rejeitados: Achado[];
    todos: Achado[];
  };

  // V — Matriz de Riscos (RN11 / RN12)
  riscos: {
    dimensoes: {
      dimensao: DimensaoRisco;
      nome: string;
      nivel: NivelRisco | null;
      nivelRotulo: string;
      justificativa: string;
      achadosVinculados: string[];
    }[];
    riscoConsolidado: string;
  };

  // VI — Conclusão Executiva
  conclusao: {
    sugestaoSistema: TipoConclusao;
    sugestaoFormatada: string;
    precedencia: PrecedenciaDecisoria;
    precedenciaRotulo: string;
    regrasDec: string[];
    codigosMotivo: {
      codigo: CodigoMotivoConclusao;
      denominacao: string;
      descricao: string;
    }[];
    providenciaSugerida: string;
    conclusaoHomologada: TipoConclusao | null;
    conclusaoHomologadaFormatada: string | null;
    statusHomologacao: 'HOMOLOGADO_CONSONANCIA' | 'HOMOLOGADO_DIVERGENCIA' | 'PENDENTE';
    validadoPor: string | null;
    dataHoraHomologacao: string | null;
    justificativaDivergencia: string;
    observacoesAssessor: string;
    conclusaoEfetiva: TipoConclusao;
    conclusaoEfetivaFormatada: string;
    manifestacaoAnteriorInvalidada: {
      conclusao: TipoConclusao;
      conclusaoFormatada: string;
      dataHoraInvalidacao: string;
      validadoPor: string | null;
      motivo: string;
    } | null;
  };

  // VII — Cinco Perguntas Executivas (RN09)
  perguntasRN09: RespostasCincoPerguntas;

  // VIII — Salvaguardas Institucionais
  salvaguardas: readonly string[];

  // Metadados do Relatório Demonstrativo
  metadadosRelatorio: {
    dataEmissao: string;
    responsavelEmissao: string;
    papelEmissao: string;
    sistema: string;
  };
}

// ==========================================
// 2. FUNÇÃO EXTRATORA DE DADOS (READ-ONLY)
// ==========================================

/**
 * Extrai e consolida todos os dados reais da análise ativa em uma estrutura pura e somente de leitura.
 * NÃO produz qualquer efeito colateral, alteração de estado ou eventos de auditoria.
 * Omissões são estritamente sinalizadas como "Não informado" ou "Não disponível na análise".
 */
export function obterDadosRelatorioExecutivo(): DadosRelatorioExecutivo {
  const p = getProcessoAtivo();
  const pert = getPertinenciaAtiva();
  const chk = getChecklistAtivo();
  const conds = getCondicionantesAtivas();
  const ach = getAchadosAtivos();
  const rsc = getRiscosAtivos();
  const resSugerido = getResultadoExecutivoAtivo();
  const conclusaoVal = getConclusaoValidada();
  const validacaoHum = getValidacaoHumana();
  const justDivergencia = getJustificativaDivergencia();
  const obsAssessor = getObservacoesAssessor();
  const manifestacaoAnteriorInv = getManifestacaoAnteriorInvalidada();

  const isPertHomologada = isPertinenciaValidada(pert);
  const conclusaoEfetiva = conclusaoVal || resSugerido.conclusao;
  const perguntasRN09 = gerarRespostasCincoPerguntas(conclusaoEfetiva, resSugerido);

  // Status da homologação da conclusão executiva
  let statusHomologacao: 'HOMOLOGADO_CONSONANCIA' | 'HOMOLOGADO_DIVERGENCIA' | 'PENDENTE' = 'PENDENTE';
  if (conclusaoVal) {
    statusHomologacao = conclusaoVal === resSugerido.conclusao ? 'HOMOLOGADO_CONSONANCIA' : 'HOMOLOGADO_DIVERGENCIA';
  }

  // Duração da vigência se datas forem válidas
  let duracaoVigencia = 'Não disponível na análise';
  if (p.vigenciaNaoAplicavel) {
    duracaoVigencia = 'Não aplicável';
  } else if (p.vigenciaInicio && p.vigenciaFim) {
    duracaoVigencia = calcularDuracaoVigencia(p.vigenciaInicio, p.vigenciaFim);
  }

  // Mapeamento estrito das 4 dimensões homologadas do CONFORMA GSASP (RN11/RN12): Jurídica, Financeira, Operacional, Controle
  const dimensoesOrdem: DimensaoRisco[] = ['juridica', 'financeira', 'operacional', 'controle'];
  const dimensoesMapeadas = dimensoesOrdem.map((dim) => {
    const item = rsc.find((r) => r.dimensao === dim);
    const nivel = item?.nivel ?? null;
    const nivelRotulo = nivel ? (METADADOS_NIVEIS[nivel]?.rotulo || nivel) : 'Não avaliado';
    const justificativa = item?.justificativa?.trim() || 'Não informado';
    return {
      dimensao: dim,
      nome: METADADOS_DIMENSOES[dim]?.nome || dim,
      nivel,
      nivelRotulo,
      justificativa,
      achadosVinculados: item?.achadosRelacionados || []
    };
  });

  // Mapeamento dos códigos de motivo (MOT)
  const codigosMotivo = resSugerido.codigosMotivo.map((cod) => {
    const meta = CATÁLOGO_MOTIVOS[cod];
    return {
      codigo: cod,
      denominacao: meta?.denominacao || cod,
      descricao: meta?.descricao || ''
    };
  });

  const agora = new Date();
  const dataEmissaoFormatada = `${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR')}`;

  return {
    processo: {
      numero: p.numero?.trim() || 'Não informado',
      instrumento: p.instrumento?.trim() || 'Não informado',
      contratado: p.contratadoNaoAplicavel ? 'Não aplicável' : (p.contratado?.trim() || 'Não informado'),
      cnpj: p.contratadoNaoAplicavel ? 'Não aplicável' : (p.cnpj?.trim() || 'Não informado'),
      objeto: p.objeto?.trim() || 'Não informado',
      tipoOrigem: p.tipoOrigem?.trim() || 'Não informado',
      valor: p.valor,
      valorFormatado: p.valorNaoAplicavel
        ? 'Não aplicável'
        : (p.valor !== null && p.valor !== undefined && !isNaN(p.valor) ? formatarMoeda(p.valor) : 'Não informado'),
      vigenciaFormatada: p.vigenciaNaoAplicavel
        ? 'Não aplicável'
        : (p.vigenciaInicio && p.vigenciaFim ? `${formatarDataBR(p.vigenciaInicio)} a ${formatarDataBR(p.vigenciaFim)}` : 'Não informado'),
      duracaoVigencia,
      regimeJuridico: p.regimeJuridico?.trim() || 'Não informado'
    },

    pertinencia: {
      conclusao: pert.conclusao ? formatarConclusaoPertinencia(pert.conclusao) : 'Não informado',
      conclusaoOriginal: pert.conclusao || null,
      isHomologada: isPertHomologada,
      statusValidacaoHumana: isPertHomologada
        ? 'Validado / Homologado (RN02)'
        : 'Pendente de Validação Humana (RN02)',
      validadoPor: pert.validacaoHumana?.validadoPor || null,
      dataHoraValidacao: pert.validacaoHumana?.dataHora || null,
      sinteseObjetiva: pert.justificativa?.trim() || 'Não informado',
      evidencias: pert.evidencias?.trim() || 'Não informado',
      providencia: pert.providencia?.trim() || 'Não informado',
      criterios: {
        competenciaNecessidade: Boolean(pert.respostas.competenciaNecessidade),
        vinculoPlanejamento: Boolean(pert.respostas.vinculoPlanejamento),
        beneficioInteressePublico: Boolean(pert.respostas.beneficioInteressePublico),
        custoProporcionalidade: Boolean(pert.respostas.custoProporcionalidade),
        economicidade: Boolean(pert.respostas.economicidade)
      }
    },

    conformidade: {
      totalItens: chk.length,
      itensConformes: chk.filter((c) => c.status === 'ok'),
      itensPendentes: chk.filter((c) => c.status === 'pendente'),
      itensAConfirmar: chk.filter((c) => c.status === 'confirmar'),
      itensNaoAplicaveis: chk.filter((c) => c.status === 'nao_aplicavel'),
      todosItens: [...chk]
    },

    condicionantes: {
      total: conds.length,
      atendidas: conds.filter((c) => c.situacao === 'atendida'),
      emCumprimento: conds.filter((c) => c.situacao === 'em_cumprimento'),
      pendentes: conds.filter((c) => c.situacao === 'pendente'),
      todas: [...conds]
    },

    achados: {
      total: ach.length,
      validados: ach.filter((a) => a.estadoValidacao === 'VALIDADO'),
      pendentes: ach.filter((a) => a.estadoValidacao === 'SUGESTAO_SISTEMA'),
      rejeitados: ach.filter((a) => a.estadoValidacao === 'REJEITADO'),
      todos: [...ach]
    },

    riscos: {
      dimensoes: dimensoesMapeadas,
      riscoConsolidado: resSugerido.riscoConsolidado ? resSugerido.riscoConsolidado.toUpperCase() : 'Não disponível na análise'
    },

    conclusao: {
      sugestaoSistema: resSugerido.conclusao,
      sugestaoFormatada: formatarConclusao(resSugerido.conclusao),
      precedencia: resSugerido.precedenciaAplicada,
      precedenciaRotulo: obterRotuloPrecedencia(resSugerido.precedenciaAplicada),
      regrasDec: resSugerido.regrasDecAplicadas,
      codigosMotivo,
      providenciaSugerida: resSugerido.providenciaSugerida,
      conclusaoHomologada: conclusaoVal,
      conclusaoHomologadaFormatada: conclusaoVal ? formatarConclusao(conclusaoVal) : null,
      statusHomologacao,
      validadoPor: validacaoHum?.validadoPor || null,
      dataHoraHomologacao: validacaoHum?.dataHora || null,
      justificativaDivergencia: justDivergencia,
      observacoesAssessor: obsAssessor,
      conclusaoEfetiva,
      conclusaoEfetivaFormatada: formatarConclusao(conclusaoEfetiva),
      manifestacaoAnteriorInvalidada: manifestacaoAnteriorInv
        ? {
            conclusao: manifestacaoAnteriorInv.conclusao,
            conclusaoFormatada: formatarConclusao(manifestacaoAnteriorInv.conclusao),
            dataHoraInvalidacao: manifestacaoAnteriorInv.dataHoraInvalidacao,
            validadoPor: manifestacaoAnteriorInv.validacaoHumana?.validadoPor || null,
            motivo: 'Invalidação dinâmica automática (RN10) por alteração material superveniente nas etapas anteriores.'
          }
        : null
    },

    perguntasRN09,

    salvaguardas: SALVAGUARDAS_CONCLUSAO,

    metadadosRelatorio: {
      dataEmissao: dataEmissaoFormatada,
      responsavelEmissao: getInfoPapelAtivo().nome,
      papelEmissao: getPapelAtivo(),
      sistema: 'CONFORMA GSASP — Sistema de Conformidade Regulatória (SESP-MT)'
    }
  };
}

// ==========================================
// 3. RENDERIZAÇÃO DO RELATÓRIO EXECUTIVO (HTML)
// ==========================================

function escapeHtml(texto: unknown): string {
  if (texto === null || texto === undefined) return '';
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Renderiza o documento completo do Relatório Executivo demonstrativo.
 * Formato semântico, legível em tela e preparado para impressão/PDF A4.
 */
export function renderRelatorioScreen(): string {
  const d = obterDadosRelatorioExecutivo();

  return `
    <article class="relatorio-executivo-documento" role="article" aria-label="Relatório Executivo de Conformidade — CONFORMA GSASP">
      
      <!-- BARRA DE CONTROLES DO RELATÓRIO EXECUTIVO (OCULTA NA IMPRESSÃO) -->
      <nav class="relatorio-acoes-barra no-print" aria-label="Ações de visualização e navegação do relatório">
        <a href="#/resultado" class="btn btn-secondary" id="btn-voltar-resultado" title="Retorna à tela do Resultado Executivo">
          ← Voltar ao Resultado Executivo
        </a>
        <button type="button" class="btn btn-primary" id="btn-imprimir-relatorio" title="Abrir diálogo de impressão do navegador ou salvar como PDF">
          🖨️ Imprimir / Salvar como PDF
        </button>
      </nav>

      <!-- CABEÇALHO DOCUMENTAL INSTITUCIONAL -->
      <header class="relatorio-cabecalho-institucional">
        <div class="relatorio-ente-dados">
          <div class="relatorio-sistema-nome">CONFORMA GSASP</div>
          <div class="relatorio-sistema-desc">Sistema de Conformidade e Apoio à Decisão</div>
          <div class="relatorio-orgao-nome">GSASP / SESP-MT</div>
        </div>
        <div class="relatorio-titulo-bloco">
          <h1 class="relatorio-documento-titulo">RELATÓRIO EXECUTIVO DE CONFORMIDADE E APOIO À DECISÃO</h1>
          <div class="relatorio-prototipo-tag">PROTÓTIPO DIDÁTICO — DADOS FICTÍCIOS</div>
        </div>
        <table class="relatorio-tabela-meta">
          <tbody>
            <tr>
              <td style="width: 35%;"><strong>Processo:</strong> ${escapeHtml(d.processo.numero)}</td>
              <td style="width: 35%;"><strong>Instrumento:</strong> ${escapeHtml(d.processo.instrumento)}</td>
              <td style="width: 30%;"><strong>Data/Hora de Geração:</strong> ${escapeHtml(d.metadadosRelatorio.dataEmissao)}</td>
            </tr>
          </tbody>
        </table>
      </header>

      <!-- FAIXA OSTENSIVA DE PROTÓTIPO DIDÁTICO (GOVERNANÇA) -->
      <div class="relatorio-banner-prototipo" role="note" aria-label="Aviso de protótipo didático">
        <p class="relatorio-prototipo-aviso">
          <strong>AVISO DE GOVERNANÇA:</strong> Este documento é um instrumento demonstrativo e indicativo de apoio à decisão administrativa (RN08 / RN12) gerado a partir de dados fictícios. Não possui fé pública, não constitui documento oficial, certidão ou ateste de conformidade, e não emite autorização automática para assinatura. A eficácia institucional plena e a deliberação soberana submetem-se exclusivamente à autoridade competente nos sistemas oficiais de tramitação (SIGADOC/SEI).
        </p>
      </div>

      <!-- I — IDENTIFICAÇÃO DA INSTRUÇÃO -->
      <section class="relatorio-secao" aria-labelledby="sec-identificacao">
        <h2 id="sec-identificacao" class="relatorio-secao-titulo">I — IDENTIFICAÇÃO DA INSTRUÇÃO</h2>
        <table class="relatorio-tabela">
          <colgroup>
            <col style="width: 28%;">
            <col style="width: 72%;">
          </colgroup>
          <thead>
            <tr>
              <th>Campo</th>
              <th>Informação</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Número do Processo</strong></td>
              <td><strong>${escapeHtml(d.processo.numero)}</strong></td>
            </tr>
            <tr>
              <td><strong>Instrumento Contratual</strong></td>
              <td><strong>${escapeHtml(d.processo.instrumento)}</strong></td>
            </tr>
            <tr>
              <td><strong>Contratado / Interessado</strong></td>
              <td>${escapeHtml(d.processo.contratado)}</td>
            </tr>
            <tr>
              <td><strong>CNPJ / CPF</strong></td>
              <td>${escapeHtml(d.processo.cnpj)}</td>
            </tr>
            <tr>
              <td><strong>Valor Global / Estimado</strong></td>
              <td><strong>${escapeHtml(d.processo.valorFormatado)}</strong></td>
            </tr>
            <tr>
              <td><strong>Vigência Proposta</strong></td>
              <td>${escapeHtml(d.processo.vigenciaFormatada)}${d.processo.duracaoVigencia !== 'Não disponível na análise' && d.processo.duracaoVigencia !== 'Não aplicável' ? ` • ${escapeHtml(d.processo.duracaoVigencia)}` : ''}</td>
            </tr>
            <tr>
              <td><strong>Tipo de Origem / Modalidade</strong></td>
              <td>${escapeHtml(d.processo.tipoOrigem)}</td>
            </tr>
            <tr>
              <td><strong>Objeto do Instrumento</strong></td>
              <td>${escapeHtml(d.processo.objeto)}</td>
            </tr>
            <tr>
              <td><strong>Regime Jurídico Aplicável</strong></td>
              <td>${escapeHtml(d.processo.regimeJuridico)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- II — PERTINÊNCIA INSTITUCIONAL -->
      <section class="relatorio-secao" aria-labelledby="sec-pertinencia">
        <h2 id="sec-pertinencia" class="relatorio-secao-titulo">II — PERTINÊNCIA INSTITUCIONAL</h2>
        
        <table class="relatorio-tabela" style="margin-bottom: 8px;">
          <colgroup>
            <col style="width: 28%;">
            <col style="width: 72%;">
          </colgroup>
          <thead>
            <tr>
              <th>Campo</th>
              <th>Informação</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Conclusão da Pertinência</strong></td>
              <td>
                <span class="relatorio-badge ${d.pertinencia.conclusaoOriginal === 'PERTINENTE' ? 'relatorio-badge-sucesso' : 'relatorio-badge-alerta'}">
                  ${escapeHtml(d.pertinencia.conclusao)}
                </span>
              </td>
            </tr>
            <tr>
              <td><strong>Validação Humana (RN02)</strong></td>
              <td>
                <span class="relatorio-badge ${d.pertinencia.isHomologada ? 'relatorio-badge-sucesso' : 'relatorio-badge-aviso'}">
                  ${escapeHtml(d.pertinencia.statusValidacaoHumana)}
                </span>
              </td>
            </tr>
            <tr>
              <td><strong>Assessor Responsável</strong></td>
              <td>${escapeHtml(d.pertinencia.validadoPor || 'Não informado')}</td>
            </tr>
            <tr>
              <td><strong>Data/Hora da Validação</strong></td>
              <td>${d.pertinencia.dataHoraValidacao ? escapeHtml(new Date(d.pertinencia.dataHoraValidacao).toLocaleString('pt-BR')) : 'Não informado'}</td>
            </tr>
            <tr>
              <td><strong>Síntese e Conveniência</strong></td>
              <td>${escapeHtml(d.pertinencia.sinteseObjetiva)}</td>
            </tr>
            <tr>
              <td><strong>Evidências Documentais</strong></td>
              <td>${escapeHtml(d.pertinencia.evidencias)}</td>
            </tr>
            <tr>
              <td><strong>Providência Registrada</strong></td>
              <td>${escapeHtml(d.pertinencia.providencia)}</td>
            </tr>
          </tbody>
        </table>

        <span class="relatorio-subtitulo-interno">Filtros de Conveniência e Economicidade (5 Critérios Regulamentares):</span>
        <table class="relatorio-tabela">
          <colgroup>
            <col style="width: 80%;">
            <col style="width: 20%;">
          </colgroup>
          <thead>
            <tr>
              <th>Critério Avaliado</th>
              <th class="text-center">Atendimento</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1. Competência institucional e necessidade pública demonstrada</td>
              <td class="text-center"><strong>${d.pertinencia.criterios.competenciaNecessidade ? 'SIM' : 'NÃO'}</strong></td>
            </tr>
            <tr>
              <td>2. Alinhamento com o planejamento estratégico setorial</td>
              <td class="text-center"><strong>${d.pertinencia.criterios.vinculoPlanejamento ? 'SIM' : 'NÃO'}</strong></td>
            </tr>
            <tr>
              <td>3. Benefício concreto ao interesse público e à segurança</td>
              <td class="text-center"><strong>${d.pertinencia.criterios.beneficioInteressePublico ? 'SIM' : 'NÃO'}</strong></td>
            </tr>
            <tr>
              <td>4. Razoabilidade e proporcionalidade entre custo e benefício</td>
              <td class="text-center"><strong>${d.pertinencia.criterios.custoProporcionalidade ? 'SIM' : 'NÃO'}</strong></td>
            </tr>
            <tr>
              <td>5. Economicidade comprovada frente a alternativas de execução</td>
              <td class="text-center"><strong>${d.pertinencia.criterios.economicidade ? 'SIM' : 'NÃO'}</strong></td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- III — CONFORMIDADE DOCUMENTAL E JURÍDICA -->
      <section class="relatorio-secao" aria-labelledby="sec-conformidade">
        <h2 id="sec-conformidade" class="relatorio-secao-titulo">III — CONFORMIDADE DOCUMENTAL E JURÍDICA</h2>
        
        <span class="relatorio-subtitulo-interno">Quadro Síntese de Conformidade:</span>
        <table class="relatorio-tabela" style="margin-bottom: 12px;">
          <colgroup>
            <col style="width: 50%;">
            <col style="width: 20%;">
            <col style="width: 30%;">
          </colgroup>
          <thead>
            <tr>
              <th>Indicador</th>
              <th class="text-center">Quantidade</th>
              <th>Situação</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total de Itens do Checklist de Instrução</td>
              <td class="text-center"><strong>${d.conformidade.totalItens}</strong></td>
              <td>${d.conformidade.totalItens > 0 ? 'Conferência efetuada' : 'Sem itens registrados'}</td>
            </tr>
            <tr>
              <td>Itens Conformes / Juntados aos Autos</td>
              <td class="text-center"><strong>${d.conformidade.itensConformes.length}</strong></td>
              <td>Regularidade documental</td>
            </tr>
            <tr>
              <td>Itens Pendentes de Juntada</td>
              <td class="text-center"><strong>${d.conformidade.itensPendentes.length}</strong></td>
              <td>${d.conformidade.itensPendentes.length > 0 ? '⚠️ Requer saneamento prévio' : 'Nenhuma pendência'}</td>
            </tr>
            <tr>
              <td>Itens a Confirmar / Diligência Setorial</td>
              <td class="text-center"><strong>${d.conformidade.itensAConfirmar.length}</strong></td>
              <td>${d.conformidade.itensAConfirmar.length > 0 ? '⚠️ Diligência recomendada' : 'Nenhuma pendência'}</td>
            </tr>
            <tr>
              <td>Itens Dispensados com Justificativa nos Autos</td>
              <td class="text-center"><strong>${d.conformidade.itensNaoAplicaveis.length}</strong></td>
              <td>Dispensado fundamentado</td>
            </tr>
          </tbody>
        </table>

        <span class="relatorio-subtitulo-interno">Itens do Checklist de Instrução Processual:</span>
        <table class="relatorio-tabela">
          <colgroup>
            <col style="width: 35px;">
            <col style="width: 45%;">
            <col style="width: 20%;">
            <col style="width: 30%;">
          </colgroup>
          <thead>
            <tr>
              <th class="text-center">#</th>
              <th>Requisito Documental / Procedimental</th>
              <th>Status</th>
              <th>Observações / Justificativa</th>
            </tr>
          </thead>
          <tbody>
            ${d.conformidade.todosItens.length === 0 ? `
              <tr><td colspan="4" class="text-center"><em>Nenhum item de checklist registrado na instrução.</em></td></tr>
            ` : d.conformidade.todosItens.map((item, idx) => `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td><strong>${escapeHtml(item.descricao)}</strong></td>
                <td>
                  <span class="relatorio-status-tag status-${escapeHtml(item.status)}">
                    ${escapeHtml(formatarStatusConformidade(item.status))}
                  </span>
                </td>
                <td>${escapeHtml(item.status === 'nao_aplicavel' ? (item.justificativaNaoAplicavel || 'Não informado') : (item.observacao || '—'))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- CONDICIONANTES JURÍDICAS -->
        <span class="relatorio-subtitulo-interno">Condicionantes de Pareceres Jurídicos Anteriores (${d.condicionantes.total}):</span>
        <table class="relatorio-tabela">
          <colgroup>
            <col style="width: 35px;">
            <col style="width: 35%;">
            <col style="width: 15%;">
            <col style="width: 20%;">
            <col style="width: 25%;">
          </colgroup>
          <thead>
            <tr>
              <th class="text-center">#</th>
              <th>Descrição da Condicionante</th>
              <th>Situação</th>
              <th>Responsável</th>
              <th>Providência</th>
            </tr>
          </thead>
          <tbody>
            ${d.condicionantes.total === 0 ? `
              <tr><td colspan="5" class="text-center"><em>Não constam condicionantes jurídicas registradas para este processo.</em></td></tr>
            ` : d.condicionantes.todas.map((cond, idx) => `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td>
                  ${escapeHtml(cond.descricao)}
                  ${cond.referenciaParecer && cond.referenciaParecer !== 'Não informado' ? `<br><small><strong>Origem:</strong> ${escapeHtml(cond.referenciaParecer)}</small>` : ''}
                </td>
                <td>
                  <span class="relatorio-status-tag cond-${escapeHtml(cond.situacao)}">
                    ${escapeHtml(formatarSituacaoCondicionante(cond.situacao))}
                  </span>
                </td>
                <td>${escapeHtml(cond.responsavel || 'Não informado')}</td>
                <td>${escapeHtml(cond.providencia || 'Não informado')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </section>

      <!-- IV — APONTAMENTO DE ACHADOS -->
      <section class="relatorio-secao" aria-labelledby="sec-achados">
        <h2 id="sec-achados" class="relatorio-secao-titulo">IV — APONTAMENTO DE ACHADOS</h2>
        
        <table class="relatorio-tabela">
          <colgroup>
            <col style="width: 35px;">
            <col style="width: 35%;">
            <col style="width: 15%;">
            <col style="width: 15%;">
            <col style="width: 30%;">
          </colgroup>
          <thead>
            <tr>
              <th class="text-center">#</th>
              <th>Achado</th>
              <th>Classificação</th>
              <th>Situação</th>
              <th>Providência</th>
            </tr>
          </thead>
          <tbody>
            ${d.achados.total === 0 ? `
              <tr><td colspan="5" class="text-center"><em>Nenhum achado apontado nos autos (ausência de desconformidades registradas).</em></td></tr>
            ` : d.achados.todos.map((a, idx) => {
              const gravidade = a.classificacaoValidada || a.classificacao || 'Não informado';
              return `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td>
                  <strong>${escapeHtml(a.titulo || a.regraOuMotivo || 'Não informado')}</strong><br>
                  <small><strong>Evidência:</strong> ${escapeHtml(a.evidencia || 'Não informado')}</small><br>
                  <small><strong>Regra/Impacto:</strong> ${escapeHtml(a.regraOuMotivo || 'Não informado')} — ${escapeHtml(a.impacto || 'Não informado')}</small>
                </td>
                <td>
                  <span class="relatorio-badge badge-gravidade-${escapeHtml(gravidade.toLowerCase())}">
                    ${escapeHtml(gravidade)}
                  </span>
                </td>
                <td>
                  <span class="relatorio-status-tag estado-${escapeHtml(a.estadoValidacao.toLowerCase())}">
                    ${escapeHtml(a.estadoValidacao)}
                  </span>
                </td>
                <td>
                  ${escapeHtml(a.providencia || 'Não informado')}<br>
                  <small><strong>Responsável:</strong> ${escapeHtml(a.responsavel || 'Não informado')}</small>
                </td>
              </tr>
            `;
            }).join('')}
          </tbody>
        </table>
      </section>

      <!-- V — MATRIZ DE AVALIAÇÃO DE RISCOS (RN11 / RN12) -->
      <section class="relatorio-secao" aria-labelledby="sec-riscos">
        <h2 id="sec-riscos" class="relatorio-secao-titulo">V — MATRIZ DE AVALIAÇÃO DE RISCOS</h2>
        
        <table class="relatorio-tabela">
          <colgroup>
            <col style="width: 20%;">
            <col style="width: 18%;">
            <col style="width: 42%;">
            <col style="width: 20%;">
          </colgroup>
          <thead>
            <tr>
              <th>Dimensão</th>
              <th>Nível</th>
              <th>Justificativa</th>
              <th>Achados Vinculados</th>
            </tr>
          </thead>
          <tbody>
            ${d.riscos.dimensoes.map((dim) => `
              <tr>
                <td><strong>${escapeHtml(dim.nome)}</strong></td>
                <td>
                  <span class="relatorio-badge badge-risco-${dim.nivel ? escapeHtml(dim.nivel) : 'pendente'}">
                    ${escapeHtml(dim.nivelRotulo)}
                  </span>
                </td>
                <td>${escapeHtml(dim.justificativa)}</td>
                <td>
                  ${dim.achadosVinculados.length === 0 ? '<em>Nenhum vínculo</em>' : dim.achadosVinculados.map((id) => `<code>${escapeHtml(id)}</code>`).join(', ')}
                </td>
              </tr>
            `).join('')}
            <tr>
              <td colspan="4" style="background: #f8fafc;">
                <strong>Risco Consolidado da Análise:</strong>
                <span class="relatorio-badge badge-risco-${escapeHtml(d.riscos.riscoConsolidado.toLowerCase())}" style="margin-left: 8px;">
                  ${escapeHtml(d.riscos.riscoConsolidado)}
                </span>
                <span style="margin-left: 12px; font-size: 8pt; color: #475569;">(Metodologia institucional RN12 — Avaliação técnica das 4 dimensões)</span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- VI — CONCLUSÃO EXECUTIVA E ENCAMINHAMENTO -->
      <section class="relatorio-secao" aria-labelledby="sec-conclusao">
        <h2 id="sec-conclusao" class="relatorio-secao-titulo">VI — CONCLUSÃO EXECUTIVA E ENCAMINHAMENTO</h2>
        
        <table class="relatorio-tabela relatorio-tabela-conclusao">
          <colgroup>
            <col style="width: 28%;">
            <col style="width: 72%;">
          </colgroup>
          <thead>
            <tr>
              <th>Elemento Decisório</th>
              <th>Detalhamento Técnico Institucional</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Conclusão sugerida</strong></td>
              <td><strong>[${escapeHtml(d.conclusao.sugestaoFormatada)}]</strong></td>
            </tr>
            <tr>
              <td><strong>Precedência</strong></td>
              <td>${escapeHtml(d.conclusao.precedenciaRotulo)}</td>
            </tr>
            <tr>
              <td><strong>Regra</strong></td>
              <td>Regra(s) ${escapeHtml(d.conclusao.regrasDec.join(', '))}</td>
            </tr>
            <tr>
              <td><strong>Motivo</strong></td>
              <td>
                ${d.conclusao.codigosMotivo.length > 0 ? d.conclusao.codigosMotivo.map((m) => `<strong>${escapeHtml(m.codigo)}</strong> — ${escapeHtml(m.denominacao)}: <em>${escapeHtml(m.descricao)}</em>`).join('<br>') : 'Nenhum código de motivo impeditivo vinculado'}
              </td>
            </tr>
            <tr>
              <td><strong>Providência sugerida</strong></td>
              <td>${escapeHtml(d.conclusao.providenciaSugerida)}</td>
            </tr>
            <tr>
              <td><strong>Manifestação do Assessor</strong></td>
              <td>
                ${d.conclusao.conclusaoHomologada ? `
                  <strong>[${escapeHtml(d.conclusao.conclusaoHomologadaFormatada)}]</strong> — Homologado por: <strong>${escapeHtml(d.conclusao.validadoPor || 'Não informado')}</strong> em ${d.conclusao.dataHoraHomologacao ? escapeHtml(new Date(d.conclusao.dataHoraHomologacao).toLocaleString('pt-BR')) : 'Não informado'}
                  ${d.conclusao.statusHomologacao === 'HOMOLOGADO_DIVERGENCIA' ? `<br><br><strong>Justificativa da Divergência:</strong> ${escapeHtml(d.conclusao.justificativaDivergencia)}` : ''}
                  ${d.conclusao.observacoesAssessor ? `<br><br><strong>Observações Complementares:</strong> ${escapeHtml(d.conclusao.observacoesAssessor)}` : ''}
                ` : `
                  <em>Parecer Técnico Pendente de Homologação pelo Assessor nos autos. A recomendação acima reflete a sugestão algorítmica indicativa.</em>
                `}
              </td>
            </tr>
            ${d.conclusao.manifestacaoAnteriorInvalidada ? `
              <tr class="linha-invalidação-rn10">
                <td><strong>Histórico RN10</strong></td>
                <td>
                  <strong>Manifestação anterior desconstituída nos autos:</strong> [${escapeHtml(d.conclusao.manifestacaoAnteriorInvalidada.conclusaoFormatada)}] automaticamente invalidada em ${d.conclusao.manifestacaoAnteriorInvalidada.dataHoraInvalidacao ? escapeHtml(new Date(d.conclusao.manifestacaoAnteriorInvalidada.dataHoraInvalidacao).toLocaleString('pt-BR')) : 'Não informado'} por ${escapeHtml(d.conclusao.manifestacaoAnteriorInvalidada.validadoPor || 'Não informado')} devido a alterações supervenientes nas etapas instrutórias. Nova apreciação técnica é exigida.
                </td>
              </tr>
            ` : ''}
          </tbody>
        </table>
      </section>

      <!-- VII — CINCO PERGUNTAS EXECUTIVAS (RN09) -->
      <section class="relatorio-secao" aria-labelledby="sec-perguntas">
        <h2 id="sec-perguntas" class="relatorio-secao-titulo">VII — AS CINCO PERGUNTAS EXECUTIVAS CENTRAIS (RN09)</h2>
        
        <table class="relatorio-tabela">
          <colgroup>
            <col style="width: 35px;">
            <col style="width: 32%;">
            <col style="width: 63%;">
          </colgroup>
          <thead>
            <tr>
              <th class="text-center">#</th>
              <th>Pergunta</th>
              <th>Resposta</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-center">1</td>
              <td><strong>${escapeHtml(d.perguntasRN09.pergunta1.pergunta)}</strong></td>
              <td>
                ${escapeHtml(d.perguntasRN09.pergunta1.resposta)}
                ${d.perguntasRN09.pergunta1.destaque ? `<br><span class="relatorio-badge relatorio-badge-info" style="margin-top: 4px;">${escapeHtml(d.perguntasRN09.pergunta1.destaque)}</span>` : ''}
              </td>
            </tr>
            <tr>
              <td class="text-center">2</td>
              <td><strong>${escapeHtml(d.perguntasRN09.pergunta2.pergunta)}</strong></td>
              <td>
                ${d.perguntasRN09.pergunta2.itens.length > 0 ? d.perguntasRN09.pergunta2.itens.map((i) => `• ${escapeHtml(i)}`).join('<br>') : 'Nenhuma pendência para correção.'}
              </td>
            </tr>
            <tr>
              <td class="text-center">3</td>
              <td><strong>${escapeHtml(d.perguntasRN09.pergunta3.pergunta)}</strong></td>
              <td>Responsáveis indicados: <strong>${escapeHtml(d.perguntasRN09.pergunta3.resposta)}</strong></td>
            </tr>
            <tr>
              <td class="text-center">4</td>
              <td><strong>${escapeHtml(d.perguntasRN09.pergunta4.pergunta)}</strong></td>
              <td>${escapeHtml(d.perguntasRN09.pergunta4.resposta)}</td>
            </tr>
            <tr>
              <td class="text-center">5</td>
              <td><strong>${escapeHtml(d.perguntasRN09.pergunta5.pergunta)}</strong></td>
              <td>${escapeHtml(d.perguntasRN09.pergunta5.resposta)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- VIII — SALVAGUARDAS NORMATIVAS E IDENTIFICAÇÃO DOS RESPONSÁVEIS -->
      <section class="relatorio-secao" aria-labelledby="sec-salvaguardas">
        <h2 id="sec-salvaguardas" class="relatorio-secao-titulo">VIII — SALVAGUARDAS NORMATIVAS E INSTITUCIONAIS DA SESP-MT</h2>
        
        <div class="relatorio-salvaguardas-bloco">
          <div class="relatorio-salvaguarda-item">
            <strong>RN08 — Natureza Indicativa:</strong> A recomendação é estritamente indicativa de apoio à instrução e não constitui autorização automática para assinatura nem ateste formal de legalidade.
          </div>
          <div class="relatorio-salvaguarda-item">
            <strong>RN07 — Reserva Humana e Decisão Indelegável:</strong> O juízo conclusivo cabe privativamente ao assessor técnico e a decisão final é indelegável da autoridade competente (Secretário de Estado / Ordenador de Despesas).
          </div>
          <div class="relatorio-salvaguarda-item">
            <strong>RN02 — Autonomia Técnica e Motivação:</strong> O assessor técnico pode divergir motivadamente da sugestão do sistema mediante justificativa obrigatória registrada nos autos.
          </div>
          <div class="relatorio-salvaguarda-item">
            <strong>RN10 — Invalidação Dinâmica Superveniente:</strong> Qualquer alteração superveniente em etapas anteriores invalida automaticamente a manifestação da conclusão executiva, exigindo nova conferência.
          </div>
        </div>

        <!-- IDENTIFICAÇÃO DOS RESPONSÁVEIS / ESPAÇO RESERVADO PARA FORMALIZAÇÃO -->
        <div class="relatorio-bloco-formalizacao">
          <h3 class="relatorio-subtitulo-interno">IDENTIFICAÇÃO DOS RESPONSÁVEIS / ESPAÇO RESERVADO PARA FORMALIZAÇÃO</h3>
          <p class="relatorio-ressalva-formalizacao">
            <em>Este protótipo não realiza assinatura eletrônica nem substitui os sistemas oficiais de tramitação e subscrição.</em>
          </p>

          <div class="relatorio-formalizacao-container">
            <div class="relatorio-formalizacao-box">
              <span class="relatorio-formalizacao-papel">Assessor Técnico:</span>
              <div class="relatorio-linha-assinatura"></div>
              <strong class="relatorio-responsavel-nome">${escapeHtml(d.conclusao.validadoPor || 'Não informado')}</strong>
              <span class="relatorio-responsavel-unidade">GSASP / SESP-MT</span>
            </div>

            <div class="relatorio-formalizacao-box">
              <span class="relatorio-formalizacao-papel">Autoridade Competente:</span>
              <div class="relatorio-linha-assinatura"></div>
              <strong class="relatorio-responsavel-nome">AUTORIDADE COMPETENTE</strong>
              <span class="relatorio-responsavel-unidade">Secretaria de Estado de Segurança Pública — SESP-MT</span>
            </div>
          </div>
        </div>

        <!-- RODAPÉ DOCUMENTAL SIMPLES -->
        <footer class="relatorio-rodape-aviso">
          <p>CONFORMA GSASP — Protótipo Didático — Dados Fictícios</p>
        </footer>
      </section>

      <!-- BARRA DE CONTROLES INFERIOR (OCULTA NA IMPRESSÃO) -->
      <nav class="relatorio-acoes-barra-inferior no-print" aria-label="Ações inferiores do relatório">
        <a href="#/resultado" class="btn btn-secondary" id="btn-voltar-resultado-rodape" title="Retorna à tela do Resultado Executivo">
          ← Voltar ao Resultado Executivo
        </a>
        <button type="button" class="btn btn-primary" id="btn-imprimir-relatorio-rodape" title="Abrir diálogo de impressão do navegador ou salvar como PDF">
          🖨️ Imprimir / Salvar como PDF
        </button>
      </nav>

    </article>
  `;
}

/**
 * Conecta os ouvintes de eventos da tela do Relatório Executivo.
 * Apenas navegação e impressão (window.print). Zero mutação de estado e zero auditoria.
 */
export function initRelatorioEvents(): void {
  const handlerImprimir = (): void => {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  };

  const btnImprimir = document.getElementById('btn-imprimir-relatorio');
  btnImprimir?.addEventListener('click', handlerImprimir);

  const btnImprimirRodape = document.getElementById('btn-imprimir-relatorio-rodape');
  btnImprimirRodape?.addEventListener('click', handlerImprimir);
}
