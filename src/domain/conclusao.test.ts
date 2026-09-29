/**
 * CONFORMA GSASP — Testes Unitários do Motor de Conclusão Executiva (S4.2)
 * Validação rigorosa dos 17 cenários representativos de docs/regras-funcionais.md
 * e testes de precedência estrita entre camadas (P1 -> P2 -> P3 -> P4 -> P5).
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import type {
  Processo,
  Pertinencia,
  ItemConformidade,
  Condicionante,
  Achado,
  Risco
} from './tipos.ts';
import {
  avaliarConclusaoExecutiva,
  consolidarNivelRisco,
  formatarConclusao,
  formatarCodigoMotivo,
  obterRotuloPrecedencia,
  type DadosEntradaConclusao
} from './conclusao.ts';

// Helper para criar processo regular padrão
function criarProcessoValido(): Processo {
  return {
    id: 'proc-teste-01',
    numero: 'SESP-PRC-2026/00100',
    instrumento: 'Contrato de Prestação de Serviços',
    contratado: 'Empresa Fictícia de Segurança e Tecnologia Ltda.',
    cnpj: '00.123.456/0001-00',
    objeto: 'Aquisição e manutenção preventiva de equipamentos e sistemas eletrônicos integrados',
    tipoOrigem: 'Pregão Eletrônico',
    valor: 450000.0,
    vigenciaInicio: '2026-10-01',
    vigenciaFim: '2027-10-01',
    regimeJuridico: 'Lei nº 14.133/2021'
  };
}

// Helper para criar pertinência regular padrão
function criarPertinenciaValida(): Pertinencia {
  return {
    respostas: {
      competenciaNecessidade: true,
      vinculoPlanejamento: true,
      beneficioInteressePublico: true,
      custoProporcionalidade: true,
      economicidade: true
    },
    evidencias: 'Estudo Técnico Preliminar ETP-01/2026 e Termo de Referência devidamente aprovados.',
    justificativa: 'Contratação essencial para a manutenção operacional das atividades finalísticas da Pasta.',
    conclusao: 'PERTINENTE',
    providencia: 'Prosseguir com a instrução e formalização do instrumento contratual.'
  };
}

// Helper para criar checklist padrão com itens conformes
function criarChecklistConforme(): ItemConformidade[] {
  return [
    { id: 'chk-1', descricao: 'Parecer Jurídico PGE', status: 'ok' },
    { id: 'chk-2', descricao: 'Dotação Orçamentária', status: 'ok' },
    { id: 'chk-3', descricao: 'Garantia Contratual', status: 'ok' },
    { id: 'chk-4', descricao: 'Certidões de Regularidade Fiscal', status: 'ok' },
    { id: 'chk-5', descricao: 'Designação de Gestor e Fiscal', status: 'ok' }
  ];
}

// Helper para criar condicionantes atendidas
function criarCondicionantesAtendidas(): Condicionante[] {
  return [
    {
      id: 'cond-1',
      descricao: 'Atestar adequação da planilha de custos',
      referenciaParecer: 'Parecer PGE 100/2026',
      situacao: 'atendida',
      providencia: 'Planilha conferida e anexada na Peça 15'
    }
  ];
}

// Helper para criar matriz de riscos 4x Baixo
function criarRiscosBaixos(): Risco[] {
  return [
    { dimensao: 'juridica', nivel: 'baixo', justificativa: 'Sem condicionantes pendentes.', achadosRelacionados: [] },
    { dimensao: 'financeira', nivel: 'baixo', justificativa: 'Dotação comprovada nos autos.', achadosRelacionados: [] },
    { dimensao: 'operacional', nivel: 'baixo', justificativa: 'Fiscalização estruturada.', achadosRelacionados: [] },
    { dimensao: 'controle', nivel: 'baixo', justificativa: 'Instrução documental completa.', achadosRelacionados: [] }
  ];
}

describe('S4.2 — Consolidação da Matriz de Riscos (RN12)', () => {
  test('4x Baixo resulta em risco consolidado Baixo', () => {
    const res = consolidarNivelRisco(criarRiscosBaixos());
    assert.equal(res.riscoConsolidado, 'baixo');
    assert.equal(res.pendentes, 0);
    assert.equal(res.avaliadas, 4);
  });

  test('3x Baixo e 1x Moderado resulta em Moderado', () => {
    const riscos = criarRiscosBaixos();
    riscos[2].nivel = 'moderado';
    const res = consolidarNivelRisco(riscos);
    assert.equal(res.riscoConsolidado, 'moderado');
  });

  test('2x Baixo, 1x Moderado e 1x Alto resulta em Alto', () => {
    const riscos = criarRiscosBaixos();
    riscos[1].nivel = 'alto';
    riscos[2].nivel = 'moderado';
    const res = consolidarNivelRisco(riscos);
    assert.equal(res.riscoConsolidado, 'alto');
  });

  test('Presença de ao menos 1 Crítico resulta sempre em Crítico', () => {
    const riscos = criarRiscosBaixos();
    riscos[0].nivel = 'baixo';
    riscos[1].nivel = 'alto';
    riscos[2].nivel = 'moderado';
    riscos[3].nivel = 'critico';
    const res = consolidarNivelRisco(riscos);
    assert.equal(res.riscoConsolidado, 'critico');
  });

  test('Dimensão não avaliada (null) resulta em riscoConsolidado null e contabiliza pendentes', () => {
    const riscos = criarRiscosBaixos();
    riscos[0].nivel = null;
    const res = consolidarNivelRisco(riscos);
    assert.equal(res.riscoConsolidado, null);
    assert.equal(res.pendentes, 1);
  });

  test('Array vazio ou nulo contabiliza 4 pendentes e nunca presume Baixo', () => {
    const res1 = consolidarNivelRisco([]);
    assert.equal(res1.riscoConsolidado, null);
    assert.equal(res1.pendentes, 4);

    const res2 = consolidarNivelRisco(null);
    assert.equal(res2.riscoConsolidado, null);
    assert.equal(res2.pendentes, 4);
  });
});

describe('S4.2 — Validação dos 17 Cenários Homologados da S4.1', () => {
  test('Cenário 1 — Aquisição Regular Plena (DEC-10 / P5)', () => {
    const entrada: DadosEntradaConclusao = {
      processo: criarProcessoValido(),
      pertinencia: criarPertinenciaValida(),
      checklist: criarChecklistConforme(),
      condicionantes: criarCondicionantesAtendidas(),
      achados: [],
      riscos: criarRiscosBaixos()
    };

    const res = avaliarConclusaoExecutiva(entrada);
    assert.equal(res.conclusao, 'APTO_PARA_ASSINATURA');
    assert.equal(res.precedenciaAplicada, 'P5');
    assert.equal(res.regraDecAplicada, 'DEC-10');
    assert.deepEqual(res.codigosMotivo, ['MOT-APTIDAO-PLENA-REGULARIDADE']);
    assert.equal(res.exigeSaneamento, false);
    assert.equal(res.naoConstituiAutorizacaoAutomatica, true);
  });

  test('Cenário 2 — Aquisição Regular com Item Dispensado Justificado (DEC-10 / P5)', () => {
    const chk = criarChecklistConforme();
    chk.push({
      id: 'chk-dispensa',
      descricao: 'Comprovação de Exclusividade Comercial',
      status: 'nao_aplicavel',
      justificativaNaoAplicavel: 'Inaplicável por se tratar de certame competitivo na modalidade Pregão Eletrônico.'
    });

    const entrada: DadosEntradaConclusao = {
      processo: criarProcessoValido(),
      pertinencia: criarPertinenciaValida(),
      checklist: chk,
      condicionantes: criarCondicionantesAtendidas(),
      achados: [],
      riscos: criarRiscosBaixos()
    };

    const res = avaliarConclusaoExecutiva(entrada);
    assert.equal(res.conclusao, 'APTO_PARA_ASSINATURA');
    assert.equal(res.precedenciaAplicada, 'P5');
    assert.equal(res.regraDecAplicada, 'DEC-10');
    assert.deepEqual(res.codigosMotivo, ['MOT-APTIDAO-PLENA-REGULARIDADE']);
    assert.equal(res.detalhes.itensChecklistNaoAplicavelSemJustificativa, 0);
  });

  test('Cenário 3 — Aditivo de Prazo com Item Formal Secundário (DEC-09A / P4)', () => {
    const achados: Achado[] = [
      {
        id: 'ach-formal',
        titulo: 'Erro material secundário na minuta',
        evidencia: 'Numeração repetida de parágrafo na minuta.',
        regraOuMotivo: 'Padronização redacional.',
        impacto: 'Sem impacto financeiro.',
        providencia: 'Ajustar numeração antes da assinatura.',
        responsavel: 'Setor de Contratos',
        classificacaoSugerida: 'FORMAL',
        classificacao: 'FORMAL',
        classificacaoValidada: 'FORMAL',
        estadoValidacao: 'VALIDADO'
      }
    ];

    const entrada: DadosEntradaConclusao = {
      processo: criarProcessoValido(),
      pertinencia: criarPertinenciaValida(),
      checklist: criarChecklistConforme(),
      condicionantes: criarCondicionantesAtendidas(),
      achados,
      riscos: criarRiscosBaixos()
    };

    const res = avaliarConclusaoExecutiva(entrada);
    assert.equal(res.conclusao, 'APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA');
    assert.equal(res.precedenciaAplicada, 'P4');
    assert.equal(res.regraDecAplicada, 'DEC-09A');
    assert.ok(res.codigosMotivo.includes('MOT-RESSALVA-ACHADO-FORMAL'));
    assert.equal(res.exigeSaneamento, false);
  });

  test('Cenário 4 — Recomendação de Melhoria Procedimental Isolada (DEC-09B / P4)', () => {
    const achados: Achado[] = [
      {
        id: 'ach-melhoria',
        titulo: 'Recomendação de aprimoramento de governança',
        evidencia: 'Fluxo interno de conferência pode ser otimizado.',
        regraOuMotivo: 'Boas práticas de gestão.',
        impacto: 'Ganho potencial de eficiência futura.',
        providencia: 'Revisar checklist no próximo ciclo anual.',
        responsavel: 'Comissão de Governança',
        classificacaoSugerida: 'MELHORIA',
        classificacao: 'MELHORIA',
        classificacaoValidada: 'MELHORIA',
        estadoValidacao: 'VALIDADO'
      }
    ];

    const entrada: DadosEntradaConclusao = {
      processo: criarProcessoValido(),
      pertinencia: criarPertinenciaValida(),
      checklist: criarChecklistConforme(),
      condicionantes: criarCondicionantesAtendidas(),
      achados,
      riscos: criarRiscosBaixos()
    };

    const res = avaliarConclusaoExecutiva(entrada);
    assert.equal(res.conclusao, 'APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA');
    assert.equal(res.precedenciaAplicada, 'P4');
    assert.equal(res.regraDecAplicada, 'DEC-09B');
    assert.deepEqual(res.codigosMotivo, ['MOT-RESSALVA-MELHORIA']);
  });

  test('Cenário 5 — Contratação com Risco Operacional Moderado Isolado (DEC-09C / P4)', () => {
    const riscos = criarRiscosBaixos();
    riscos[2].nivel = 'moderado'; // Operacional moderado

    const entrada: DadosEntradaConclusao = {
      processo: criarProcessoValido(),
      pertinencia: criarPertinenciaValida(),
      checklist: criarChecklistConforme(),
      condicionantes: criarCondicionantesAtendidas(),
      achados: [],
      riscos
    };

    const res = avaliarConclusaoExecutiva(entrada);
    assert.equal(res.conclusao, 'APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA');
    assert.equal(res.precedenciaAplicada, 'P4');
    assert.equal(res.regraDecAplicada, 'DEC-09C');
    assert.deepEqual(res.codigosMotivo, ['MOT-RESSALVA-RISCO-MODERADO']);
  });

  test('Cenário 6 — Pertinência Atestada Mediante Justificativa Isolada (DEC-09D / P4)', () => {
    const pert = criarPertinenciaValida();
    pert.conclusao = 'PERTINENTE_COM_JUSTIFICATIVA';

    const entrada: DadosEntradaConclusao = {
      processo: criarProcessoValido(),
      pertinencia: pert,
      checklist: criarChecklistConforme(),
      condicionantes: criarCondicionantesAtendidas(),
      achados: [],
      riscos: criarRiscosBaixos()
    };

    const res = avaliarConclusaoExecutiva(entrada);
    assert.equal(res.conclusao, 'APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA');
    assert.equal(res.precedenciaAplicada, 'P4');
    assert.equal(res.regraDecAplicada, 'DEC-09D');
    assert.deepEqual(res.codigosMotivo, ['MOT-RESSALVA-PERTINENCIA-COM-JUSTIFICATIVA']);
  });

  test('Cenário 7 — Coexistência de Múltiplas Ressalvas P4 (DEC-09A, DEC-09C e DEC-09D)', () => {
    const pert = criarPertinenciaValida();
    pert.conclusao = 'PERTINENTE_COM_JUSTIFICATIVA';

    const riscos = criarRiscosBaixos();
    riscos[1].nivel = 'moderado'; // Financeiro moderado

    const achados: Achado[] = [
      {
        id: 'ach-formal',
        titulo: 'Inconsistência cadastral secundária',
        evidencia: 'Sigla de setor incompleta.',
        regraOuMotivo: 'Padrão documental.',
        impacto: 'Sem reflexo financeiro.',
        providencia: 'Ajustar no sistema.',
        responsavel: 'Setor de Cadastro',
        classificacaoSugerida: 'FORMAL',
        classificacao: 'FORMAL',
        classificacaoValidada: 'FORMAL',
        estadoValidacao: 'VALIDADO'
      }
    ];

    const entrada: DadosEntradaConclusao = {
      processo: criarProcessoValido(),
      pertinencia: pert,
      checklist: criarChecklistConforme(),
      condicionantes: criarCondicionantesAtendidas(),
      achados,
      riscos
    };

    const res = avaliarConclusaoExecutiva(entrada);
    assert.equal(res.conclusao, 'APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA');
    assert.equal(res.precedenciaAplicada, 'P4');
    assert.ok(res.codigosMotivo.includes('MOT-RESSALVA-ACHADO-FORMAL'));
    assert.ok(res.codigosMotivo.includes('MOT-RESSALVA-RISCO-MODERADO'));
    assert.ok(res.codigosMotivo.includes('MOT-RESSALVA-PERTINENCIA-COM-JUSTIFICATIVA'));
    assert.equal(res.codigosMotivo.length, 3);
    assert.ok(res.regrasDecAplicadas.includes('DEC-09A'));
    assert.ok(res.regrasDecAplicadas.includes('DEC-09C'));
    assert.ok(res.regrasDecAplicadas.includes('DEC-09D'));
  });

  test('Cenário 8 — Checklist com Item Pendente Conhecido (DEC-07A / P3)', () => {
    const chk = criarChecklistConforme();
    chk[3].status = 'pendente'; // Falta Certidão de Regularidade

    const entrada: DadosEntradaConclusao = {
      processo: criarProcessoValido(),
      pertinencia: criarPertinenciaValida(),
      checklist: chk,
      condicionantes: criarCondicionantesAtendidas(),
      achados: [],
      riscos: criarRiscosBaixos()
    };

    const res = avaliarConclusaoExecutiva(entrada);
    assert.equal(res.conclusao, 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA');
    assert.equal(res.precedenciaAplicada, 'P3');
    assert.equal(res.regraDecAplicada, 'DEC-07A');
    assert.deepEqual(res.codigosMotivo, ['MOT-SANEAMENTO-CHECKLIST-PENDENTE']);
    assert.equal(res.exigeSaneamento, true);
  });

  test('Cenário 9 — Pendência de Caução / Condicionante Jurídica Pendente (DEC-07B / P3)', () => {
    const conds: Condicionante[] = [
      {
        id: 'cond-pendente',
        descricao: 'Apresentação de caução de garantia de 5%',
        referenciaParecer: 'Parecer PGE 45/2026',
        situacao: 'pendente',
        providencia: 'Aguardando comprovante bancário da contratada'
      }
    ];

    const entrada: DadosEntradaConclusao = {
      processo: criarProcessoValido(),
      pertinencia: criarPertinenciaValida(),
      checklist: criarChecklistConforme(),
      condicionantes: conds,
      achados: [],
      riscos: criarRiscosBaixos()
    };

    const res = avaliarConclusaoExecutiva(entrada);
    assert.equal(res.conclusao, 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA');
    assert.equal(res.precedenciaAplicada, 'P3');
    assert.equal(res.regraDecAplicada, 'DEC-07B');
    assert.ok(res.codigosMotivo.includes('MOT-SANEAMENTO-CONDICIONANTE-PENDENTE'));
    assert.equal(res.exigeSaneamento, true);
  });

  test('Cenário 10 — Estudo Técnico Preliminar Insuficiente / Pertinência Não Demonstrada (DEC-06 / P3)', () => {
    const pert = criarPertinenciaValida();
    pert.conclusao = 'NAO_DEMONSTRADA';

    const entrada: DadosEntradaConclusao = {
      processo: criarProcessoValido(),
      pertinencia: pert,
      checklist: criarChecklistConforme(),
      condicionantes: criarCondicionantesAtendidas(),
      achados: [],
      riscos: criarRiscosBaixos()
    };

    const res = avaliarConclusaoExecutiva(entrada);
    assert.equal(res.conclusao, 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA');
    assert.equal(res.precedenciaAplicada, 'P3');
    assert.equal(res.regraDecAplicada, 'DEC-06');
    assert.deepEqual(res.codigosMotivo, ['MOT-SANEAMENTO-PERTINENCIA-NAO-DEMONSTRADA']);
    assert.equal(res.exigeSaneamento, true);
  });

  test('Cenário 11 — Risco Consolidado Alto sem Achados Relevantes (DEC-08 / P3)', () => {
    const riscos = criarRiscosBaixos();
    riscos[1].nivel = 'alto'; // Financeiro Alto

    const entrada: DadosEntradaConclusao = {
      processo: criarProcessoValido(),
      pertinencia: criarPertinenciaValida(),
      checklist: criarChecklistConforme(),
      condicionantes: criarCondicionantesAtendidas(),
      achados: [],
      riscos
    };

    const res = avaliarConclusaoExecutiva(entrada);
    assert.equal(res.conclusao, 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA');
    assert.equal(res.precedenciaAplicada, 'P3');
    assert.equal(res.regraDecAplicada, 'DEC-08');
    assert.deepEqual(res.codigosMotivo, ['MOT-SANEAMENTO-RISCO-ALTO']);
    assert.equal(res.exigeSaneamento, true);
  });

  test('Cenário 12 — Checklist com Item "confirmar" ou "nao_aplicavel" sem Justificativa (DEC-01 / P1)', () => {
    const chk = criarChecklistConforme();
    chk[0].status = 'confirmar'; // Item pendente de diligência

    const entrada: DadosEntradaConclusao = {
      processo: criarProcessoValido(),
      pertinencia: criarPertinenciaValida(),
      checklist: chk,
      condicionantes: criarCondicionantesAtendidas(),
      achados: [],
      riscos: criarRiscosBaixos()
    };

    const res = avaliarConclusaoExecutiva(entrada);
    assert.equal(res.conclusao, 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA');
    assert.equal(res.precedenciaAplicada, 'P1');
    assert.equal(res.regraDecAplicada, 'DEC-01');
    assert.ok(res.codigosMotivo.includes('MOT-SANEAMENTO-INSUFICIENCIA-DADOS'));
  });

  test('Cenário 13 — Precedência P1 com Dados Faltantes em Processo com Achado Impeditivo (DEC-01 / P1)', () => {
    // Processo com vigência incompleta (dado essencial faltando) e achado impeditivo validado
    const proc = criarProcessoValido();
    proc.vigenciaInicio = '';

    const achados: Achado[] = [
      {
        id: 'ach-imp',
        titulo: 'Vício insanável de contratação',
        evidencia: 'Objeto licitado sem amparo legal.',
        regraOuMotivo: 'Art. 14 da Lei 14.133/2021.',
        impacto: 'Nulidade absoluta.',
        providencia: 'Indeferimento.',
        responsavel: 'GSASP',
        classificacaoSugerida: 'IMPEDITIVO',
        classificacao: 'IMPEDITIVO',
        classificacaoValidada: 'IMPEDITIVO',
        estadoValidacao: 'VALIDADO'
      }
    ];

    const entrada: DadosEntradaConclusao = {
      processo: proc,
      pertinencia: criarPertinenciaValida(),
      checklist: criarChecklistConforme(),
      condicionantes: criarCondicionantesAtendidas(),
      achados,
      riscos: criarRiscosBaixos()
    };

    const res = avaliarConclusaoExecutiva(entrada);
    // P1 tem precedência absoluta sobre P2
    assert.equal(res.conclusao, 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA');
    assert.equal(res.precedenciaAplicada, 'P1');
    assert.equal(res.regraDecAplicada, 'DEC-01');
    assert.ok(res.codigosMotivo.includes('MOT-SANEAMENTO-INSUFICIENCIA-DADOS'));
  });

  test('Cenário 14 — Avaliações Humanas Incompletas (DEC-02 / P1)', () => {
    // Sugestão de achado não avaliada pelo assessor (SUGESTAO_SISTEMA)
    const achados: Achado[] = [
      {
        id: 'ach-sugestao',
        titulo: 'Sugestão automática pendente',
        evidencia: 'Divergência cronológica.',
        regraOuMotivo: 'Regra REG-01.',
        impacto: 'A conferir.',
        providencia: 'Analisar.',
        responsavel: 'Assessor',
        classificacaoSugerida: 'FORMAL',
        classificacao: null,
        classificacaoValidada: null,
        estadoValidacao: 'SUGESTAO_SISTEMA'
      }
    ];

    const entrada: DadosEntradaConclusao = {
      processo: criarProcessoValido(),
      pertinencia: criarPertinenciaValida(),
      checklist: criarChecklistConforme(),
      condicionantes: criarCondicionantesAtendidas(),
      achados,
      riscos: criarRiscosBaixos()
    };

    const res = avaliarConclusaoExecutiva(entrada);
    assert.equal(res.conclusao, 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA');
    assert.equal(res.precedenciaAplicada, 'P1');
    assert.equal(res.regraDecAplicada, 'DEC-02');
    assert.ok(res.codigosMotivo.includes('MOT-SANEAMENTO-AVALIACOES-PENDENTES'));
  });

  test('Cenário 15 — Objeto Estranho às Competências com P1 Superada (DEC-03 / P2)', () => {
    const pert = criarPertinenciaValida();
    pert.conclusao = 'NAO_PERTINENTE';

    const entrada: DadosEntradaConclusao = {
      processo: criarProcessoValido(),
      pertinencia: pert,
      checklist: criarChecklistConforme(),
      condicionantes: criarCondicionantesAtendidas(),
      achados: [],
      riscos: criarRiscosBaixos()
    };

    const res = avaliarConclusaoExecutiva(entrada);
    assert.equal(res.conclusao, 'NAO_RECOMENDAVEL_PARA_ASSINATURA');
    assert.equal(res.precedenciaAplicada, 'P2');
    assert.equal(res.regraDecAplicada, 'DEC-03');
    assert.deepEqual(res.codigosMotivo, ['MOT-RECUSA-PERTINENCIA-NEGATIVA']);
    assert.equal(res.exigeSaneamento, false);
  });

  test('Cenário 16 — Licitação com Achado Impeditivo com P1 Superada (DEC-04 / P2)', () => {
    const achados: Achado[] = [
      {
        id: 'ach-imp',
        titulo: 'Vício insanável no certame licitatório',
        evidencia: 'Fracionamento ilegal de despesa constatado.',
        regraOuMotivo: 'Art. 75, § 1º da Lei 14.133/2021.',
        impacto: 'Nulidade da dispensa e risco de responsabilização.',
        providencia: 'Abster-se da subscrição.',
        responsavel: 'Ordenador de Despesas',
        classificacaoSugerida: 'IMPEDITIVO',
        classificacao: 'IMPEDITIVO',
        classificacaoValidada: 'IMPEDITIVO',
        estadoValidacao: 'VALIDADO'
      }
    ];

    const entrada: DadosEntradaConclusao = {
      processo: criarProcessoValido(),
      pertinencia: criarPertinenciaValida(),
      checklist: criarChecklistConforme(),
      condicionantes: criarCondicionantesAtendidas(),
      achados,
      riscos: criarRiscosBaixos()
    };

    const res = avaliarConclusaoExecutiva(entrada);
    assert.equal(res.conclusao, 'NAO_RECOMENDAVEL_PARA_ASSINATURA');
    assert.equal(res.precedenciaAplicada, 'P2');
    assert.equal(res.regraDecAplicada, 'DEC-04');
    assert.deepEqual(res.codigosMotivo, ['MOT-RECUSA-ACHADO-IMPEDITIVO']);
    assert.equal(res.exigeSaneamento, false);
  });

  test('Cenário 17 — Risco Crítico Isolado em Matriz Heterogênea (DEC-05 / P2)', () => {
    const riscos = criarRiscosBaixos();
    riscos[1].nivel = 'critico'; // Financeiro Crítico

    const entrada: DadosEntradaConclusao = {
      processo: criarProcessoValido(),
      pertinencia: criarPertinenciaValida(),
      checklist: criarChecklistConforme(),
      condicionantes: criarCondicionantesAtendidas(),
      achados: [],
      riscos
    };

    const res = avaliarConclusaoExecutiva(entrada);
    assert.equal(res.conclusao, 'NAO_RECOMENDAVEL_PARA_ASSINATURA');
    assert.equal(res.precedenciaAplicada, 'P2');
    assert.equal(res.regraDecAplicada, 'DEC-05');
    assert.deepEqual(res.codigosMotivo, ['MOT-RECUSA-RISCO-CRITICO']);
    assert.equal(res.exigeSaneamento, false);
  });
});

describe('S4.2 — Testes de Precedência Estrita entre Camadas (P1 > P2 > P3 > P4 > P5)', () => {
  test('P1 prevalece sobre P2 quando há risco crítico mas avaliação humana está incompleta', () => {
    const riscos = criarRiscosBaixos();
    riscos[0].nivel = 'critico';
    riscos[3].nivel = null; // Dimensão de Controle pendente

    const entrada: DadosEntradaConclusao = {
      processo: criarProcessoValido(),
      pertinencia: criarPertinenciaValida(),
      checklist: criarChecklistConforme(),
      condicionantes: criarCondicionantesAtendidas(),
      achados: [],
      riscos
    };

    const res = avaliarConclusaoExecutiva(entrada);
    assert.equal(res.precedenciaAplicada, 'P1');
    assert.equal(res.conclusao, 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA');
    assert.ok(res.codigosMotivo.includes('MOT-SANEAMENTO-AVALIACOES-PENDENTES'));
  });

  test('P1 prevalece sobre P3 quando há item pendente e checklist tem item a confirmar', () => {
    const chk = criarChecklistConforme();
    chk[0].status = 'confirmar'; // P1
    chk[1].status = 'pendente';  // P3

    const entrada: DadosEntradaConclusao = {
      processo: criarProcessoValido(),
      pertinencia: criarPertinenciaValida(),
      checklist: chk,
      condicionantes: criarCondicionantesAtendidas(),
      achados: [],
      riscos: criarRiscosBaixos()
    };

    const res = avaliarConclusaoExecutiva(entrada);
    assert.equal(res.precedenciaAplicada, 'P1');
    assert.equal(res.regraDecAplicada, 'DEC-01');
    assert.ok(res.codigosMotivo.includes('MOT-SANEAMENTO-INSUFICIENCIA-DADOS'));
  });

  test('P2 prevalece sobre P3 quando há achado impeditivo e condicionante pendente', () => {
    const achados: Achado[] = [
      {
        id: 'ach-imp',
        titulo: 'Achado Impeditivo',
        evidencia: 'Evidência.',
        regraOuMotivo: 'Motivo.',
        impacto: 'Impacto.',
        providencia: 'Providência.',
        responsavel: 'GSASP',
        classificacaoSugerida: 'IMPEDITIVO',
        classificacao: 'IMPEDITIVO',
        classificacaoValidada: 'IMPEDITIVO',
        estadoValidacao: 'VALIDADO'
      }
    ];

    const conds: Condicionante[] = [
      {
        id: 'cond-pend',
        descricao: 'Condicionante pendente de ato',
        referenciaParecer: 'Ref',
        situacao: 'pendente'
      }
    ];

    const entrada: DadosEntradaConclusao = {
      processo: criarProcessoValido(),
      pertinencia: criarPertinenciaValida(),
      checklist: criarChecklistConforme(),
      condicionantes: conds,
      achados,
      riscos: criarRiscosBaixos()
    };

    const res = avaliarConclusaoExecutiva(entrada);
    assert.equal(res.precedenciaAplicada, 'P2');
    assert.equal(res.conclusao, 'NAO_RECOMENDAVEL_PARA_ASSINATURA');
    assert.equal(res.regraDecAplicada, 'DEC-04');
  });

  test('P3 prevalece sobre P4 quando há achado relevante e achado formal concomitantes', () => {
    const achados: Achado[] = [
      {
        id: 'ach-rel',
        titulo: 'Achado Relevante',
        evidencia: 'Evidência.',
        regraOuMotivo: 'Motivo.',
        impacto: 'Impacto.',
        providencia: 'Providência.',
        responsavel: 'Fiscal',
        classificacaoSugerida: 'RELEVANTE',
        classificacao: 'RELEVANTE',
        classificacaoValidada: 'RELEVANTE',
        estadoValidacao: 'VALIDADO'
      },
      {
        id: 'ach-form',
        titulo: 'Achado Formal',
        evidencia: 'Evidência.',
        regraOuMotivo: 'Motivo.',
        impacto: 'Impacto.',
        providencia: 'Providência.',
        responsavel: 'Assessor',
        classificacaoSugerida: 'FORMAL',
        classificacao: 'FORMAL',
        classificacaoValidada: 'FORMAL',
        estadoValidacao: 'VALIDADO'
      }
    ];

    const entrada: DadosEntradaConclusao = {
      processo: criarProcessoValido(),
      pertinencia: criarPertinenciaValida(),
      checklist: criarChecklistConforme(),
      condicionantes: criarCondicionantesAtendidas(),
      achados,
      riscos: criarRiscosBaixos()
    };

    const res = avaliarConclusaoExecutiva(entrada);
    assert.equal(res.precedenciaAplicada, 'P3');
    assert.equal(res.conclusao, 'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA');
    assert.equal(res.regraDecAplicada, 'DEC-07B');
  });

  test('P4 prevalece sobre P5 quando há apenas achado formal validado', () => {
    const achados: Achado[] = [
      {
        id: 'ach-form',
        titulo: 'Achado Formal',
        evidencia: 'Evidência.',
        regraOuMotivo: 'Motivo.',
        impacto: 'Impacto.',
        providencia: 'Providência.',
        responsavel: 'Assessor',
        classificacaoSugerida: 'FORMAL',
        classificacao: 'FORMAL',
        classificacaoValidada: 'FORMAL',
        estadoValidacao: 'VALIDADO'
      }
    ];

    const entrada: DadosEntradaConclusao = {
      processo: criarProcessoValido(),
      pertinencia: criarPertinenciaValida(),
      checklist: criarChecklistConforme(),
      condicionantes: criarCondicionantesAtendidas(),
      achados,
      riscos: criarRiscosBaixos()
    };

    const res = avaliarConclusaoExecutiva(entrada);
    assert.equal(res.precedenciaAplicada, 'P4');
    assert.equal(res.conclusao, 'APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA');
  });

  test('Achados rejeitados não impactam a conclusão executiva (são desconsiderados)', () => {
    const achados: Achado[] = [
      {
        id: 'ach-rejeitado',
        titulo: 'Sugestão Rejeitada Justificadamente',
        evidencia: 'Evidência superada.',
        regraOuMotivo: 'Motivo.',
        impacto: 'Nenhum.',
        providencia: 'Nenhuma.',
        responsavel: 'Assessor',
        classificacaoSugerida: 'IMPEDITIVO',
        classificacao: 'IMPEDITIVO',
        classificacaoValidada: null,
        estadoValidacao: 'REJEITADO',
        justificativaRejeicao: 'Apontamento inconsistente com a certidão comprovada na Peça 40.'
      }
    ];

    const entrada: DadosEntradaConclusao = {
      processo: criarProcessoValido(),
      pertinencia: criarPertinenciaValida(),
      checklist: criarChecklistConforme(),
      condicionantes: criarCondicionantesAtendidas(),
      achados,
      riscos: criarRiscosBaixos()
    };

    const res = avaliarConclusaoExecutiva(entrada);
    // Como o impeditivo foi rejeitado, alcança P5 plena regularidade
    assert.equal(res.conclusao, 'APTO_PARA_ASSINATURA');
    assert.equal(res.precedenciaAplicada, 'P5');
    assert.equal(res.regraDecAplicada, 'DEC-10');
  });
});

describe('S4.2 — Formatadores e Utilitários de Domínio', () => {
  test('formatarConclusao formata corretamente todos os rótulos', () => {
    assert.equal(formatarConclusao('APTO_PARA_ASSINATURA'), 'Apto para Assinatura');
    assert.equal(
      formatarConclusao('APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA'),
      'Apto para Assinatura com Ressalva Não Impeditiva'
    );
    assert.equal(
      formatarConclusao('RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA'),
      'Retornar para Saneamento antes da Assinatura'
    );
    assert.equal(
      formatarConclusao('NAO_RECOMENDAVEL_PARA_ASSINATURA'),
      'Não Recomendável para Assinatura'
    );
  });

  test('formatarCodigoMotivo retorna denominação oficial de todos os códigos', () => {
    assert.equal(
      formatarCodigoMotivo('MOT-APTIDAO-PLENA-REGULARIDADE'),
      'Plena Conformidade da Instrução Processual'
    );
    assert.equal(
      formatarCodigoMotivo('MOT-RECUSA-ACHADO-IMPEDITIVO'),
      'Presença de Achado Validado Impeditivo'
    );
    assert.equal(
      formatarCodigoMotivo('MOT-SANEAMENTO-CHECKLIST-PENDENTE'),
      'Pendência Conhecida em Item de Checklist'
    );
  });

  test('obterRotuloPrecedencia retorna nome das camadas P1 a P5', () => {
    assert.ok(obterRotuloPrecedencia('P1').includes('P1'));
    assert.ok(obterRotuloPrecedencia('P2').includes('P2'));
    assert.ok(obterRotuloPrecedencia('P3').includes('P3'));
    assert.ok(obterRotuloPrecedencia('P4').includes('P4'));
    assert.ok(obterRotuloPrecedencia('P5').includes('P5'));
  });
});
