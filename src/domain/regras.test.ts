/**
 * CONFORMA GSASP — Testes Unitários do Motor de Regras (Sprint 3 — S3.2)
 *
 * Cobertura de testes:
 * - REG-01: Vigência cronológica, não aplicabilidade e tratamento de ausências.
 * - REG-02: Pertinência institucional (os 3 estados, critérios sob avaliação e divergência humana preservada).
 * - REG-03: Condicionantes pendente/em cumprimento sem providência (classificação pendente).
 * - REG-04: Condicionantes pendente/em cumprimento com providência declarada (classificação pendente, não reduz risco).
 * - REG-05: Documento a confirmar (sem suposições de gravidade).
 * - REG-06: Não aplicável sem justificativa (piso de 5 caracteres e título exato).
 * - Governança: determinismo, imutabilidade, tratamento de dados ausentes e não presunção de aprovação.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  avaliarRegra01VigenciaInconsistente,
  avaliarRegra02Pertinencia,
  avaliarRegra03CondicionanteSemProvidencia,
  avaliarRegra04CondicionanteComProvidencia,
  avaliarRegra05DocumentoAConfirmar,
  avaliarRegra06NaoAplicavelSemJustificativa,
  executarMotorRegras
} from './regras.ts';

import type {
  Processo,
  Pertinencia,
  ItemConformidade,
  Condicionante
} from './tipos.ts';

describe('S3.2 — Motor de Regras: REG-01 (Vigência Inconsistente)', () => {
  test('dispara achado FORMAL quando data de término for anterior ao início', () => {
    const processo: Partial<Processo> = {
      vigenciaInicio: '2026-03-01',
      vigenciaFim: '2026-02-01',
      vigenciaNaoAplicavel: false
    };

    const { achado, alerta } = avaliarRegra01VigenciaInconsistente(processo);

    assert.ok(achado, 'Deve produzir um achado');
    assert.equal(achado.regraId, 'REG-01-VIGENCIA-INCONSISTENTE');
    assert.equal(achado.classificacaoSugerida, 'FORMAL');
    assert.equal(achado.estadoValidacao, 'SUGESTAO_SISTEMA');
    assert.equal(achado.classificacaoValidada, null);
    assert.match(achado.evidencia, /anterior à data inicial/);
    assert.match(achado.providencia, /Conferir a fonte documental/);
    assert.equal(alerta, null);
  });

  test('não dispara achado quando vigência for cronologicamente regular', () => {
    const processo: Partial<Processo> = {
      vigenciaInicio: '2026-03-01',
      vigenciaFim: '2027-03-01',
      vigenciaNaoAplicavel: false
    };

    const { achado, alerta } = avaliarRegra01VigenciaInconsistente(processo);
    assert.equal(achado, null);
    assert.equal(alerta, null);
  });

  test('não dispara achado quando vigência estiver marcada como não aplicável', () => {
    const processo: Partial<Processo> = {
      vigenciaInicio: '2026-03-01',
      vigenciaFim: '2026-02-01', // invertido, mas não aplicável
      vigenciaNaoAplicavel: true
    };

    const { achado, alerta } = avaliarRegra01VigenciaInconsistente(processo);
    assert.equal(achado, null, 'Não deve disparar quando vigênciaNaoAplicavel for true');
    assert.equal(alerta, null);
  });

  test('gera alerta de instrução pendente se datas estiverem ausentes e não aplicável for false', () => {
    const processo: Partial<Processo> = {
      vigenciaInicio: '2026-03-01',
      vigenciaFim: null,
      vigenciaNaoAplicavel: false
    };

    const { achado, alerta } = avaliarRegra01VigenciaInconsistente(processo);
    assert.equal(achado, null);
    assert.ok(alerta);
    assert.equal(alerta.tipo, 'PENDENCIA_PREENCHIMENTO');
    assert.deepEqual(alerta.camposPendentes, ['vigenciaFim']);
  });
});

describe('S3.2 — Motor de Regras: REG-02 (Pertinência Institucional)', () => {
  test('dispara achado IMPEDITIVO quando a conclusão humana for NAO_PERTINENTE', () => {
    const pertinencia: Partial<Pertinencia> = {
      conclusao: 'NAO_PERTINENTE',
      justificativa: 'Objeto não guarda relação com competências do GSASP.',
      respostas: {
        competenciaNecessidade: false,
        vinculoPlanejamento: false,
        beneficioInteressePublico: false,
        custoProporcionalidade: false,
        economicidade: false
      }
    };

    const { achado, divergencia, alerta } = avaliarRegra02Pertinencia(pertinencia);

    assert.ok(achado);
    assert.equal(achado.regraId, 'REG-02-PERTINENCIA-NAO-DEMONSTRADA');
    assert.equal(achado.classificacaoSugerida, 'IMPEDITIVO');
    assert.equal(achado.estadoValidacao, 'SUGESTAO_SISTEMA');
    assert.equal(divergencia, null);
    assert.equal(alerta, null);
  });

  test('dispara achado RELEVANTE quando a conclusão humana for NAO_DEMONSTRADA', () => {
    const pertinencia: Partial<Pertinencia> = {
      conclusao: 'NAO_DEMONSTRADA',
      justificativa: 'Faltam estudos técnicos comprobatórios.',
      respostas: {
        competenciaNecessidade: true,
        vinculoPlanejamento: false,
        beneficioInteressePublico: null,
        custoProporcionalidade: null,
        economicidade: null
      }
    };

    const { achado, divergencia, alerta } = avaliarRegra02Pertinencia(pertinencia);

    assert.ok(achado);
    assert.equal(achado.classificacaoSugerida, 'RELEVANTE');
    assert.equal(achado.estadoValidacao, 'SUGESTAO_SISTEMA');
    assert.equal(divergencia, null);
    assert.equal(alerta, null);
  });

  test('dispara achado com classificação pendente quando conclusao for null e houver critério "Não"', () => {
    const pertinencia: Partial<Pertinencia> = {
      conclusao: null,
      respostas: {
        competenciaNecessidade: true,
        vinculoPlanejamento: false, // resposta desfavorável expressa
        beneficioInteressePublico: true,
        custoProporcionalidade: null,
        economicidade: null
      }
    };

    const { achado, divergencia, alerta } = avaliarRegra02Pertinencia(pertinencia);

    assert.ok(achado);
    assert.equal(achado.classificacaoSugerida, null, 'Classificação deve ser null (pendente de validação humana)');
    assert.equal(achado.classificacao, null);
    assert.equal(divergencia, null);
    assert.equal(alerta, null);
  });

  test('não dispara achado de recusa quando conclusao for null e critérios estiverem em aberto', () => {
    const pertinencia: Partial<Pertinencia> = {
      conclusao: null,
      respostas: {
        competenciaNecessidade: null,
        vinculoPlanejamento: null,
        beneficioInteressePublico: null,
        custoProporcionalidade: null,
        economicidade: null
      }
    };

    const { achado, divergencia, alerta } = avaliarRegra02Pertinencia(pertinencia);

    assert.equal(achado, null, 'Não deve gerar achado material sem critérios negativos');
    assert.equal(divergencia, null);
    assert.ok(alerta);
    assert.equal(alerta.tipo, 'INSTRUCAO_INCOMPLETA');
  });

  test('preserva soberanamente a decisão humana favorável divergente e emite alerta de divergência', () => {
    const pertinencia: Partial<Pertinencia> = {
      conclusao: 'PERTINENTE', // Conclusão humana favorável
      justificativa: 'Justificativa fática demonstrando conveniência excepcional.',
      respostas: {
        competenciaNecessidade: true,
        vinculoPlanejamento: false, // critério negativo divergente
        beneficioInteressePublico: true,
        custoProporcionalidade: true,
        economicidade: true
      }
    };

    const { achado, divergencia, alerta } = avaliarRegra02Pertinencia(pertinencia);

    assert.equal(achado, null, 'NÃO deve emitir achado de recusa contra a decisão humana');
    assert.equal(alerta, null);
    assert.ok(divergencia, 'Deve emitir sinalização de divergência humana');
    assert.equal(divergencia.tipo, 'PERTINENCIA_DIVERGENTE');
    assert.equal(divergencia.detalhes.conclusaoHumana, 'PERTINENTE');
    assert.deepEqual(divergencia.detalhes.criteriosDesfavoraveis, ['Vínculo ao Planejamento']);
  });
});

describe('S3.2 — Motor de Regras: REG-03 e REG-04 (Condicionantes Jurídicas)', () => {
  test('REG-03 dispara achado com classificação pendente para condicionante sem providência', () => {
    const condicionantes: Condicionante[] = [
      {
        id: 'cond-1',
        descricao: 'Comprovar dotação específica',
        referenciaParecer: 'Parecer PGE nº 10/2026',
        situacao: 'pendente',
        providencia: '' // Vazia
      },
      {
        id: 'cond-2',
        descricao: 'Apresentar certidão falimentar',
        referenciaParecer: 'Parecer PGE nº 10/2026',
        situacao: 'em_cumprimento',
        providencia: '   ' // Espaços em branco
      }
    ];

    const achados = avaliarRegra03CondicionanteSemProvidencia(condicionantes);

    assert.equal(achados.length, 2);
    assert.equal(achados[0].regraId, 'REG-03-CONDICIONANTE-SEM-PROVIDENCIA');
    assert.equal(achados[0].classificacaoSugerida, null, 'Classificação deve estar pendente de validação');
    assert.equal(achados[1].regraId, 'REG-03-CONDICIONANTE-SEM-PROVIDENCIA');
    assert.equal(achados[1].classificacaoSugerida, null);
  });

  test('REG-04 dispara achado com classificação pendente para condicionante com providência declarada', () => {
    const condicionantes: Condicionante[] = [
      {
        id: 'cond-3',
        descricao: 'Comprovar regularidade FGTS',
        referenciaParecer: 'Parecer PGE nº 12/2026',
        situacao: 'em_cumprimento',
        providencia: 'Ofício nº 44/2026 expedido à empresa',
        responsavel: 'Setor de Contratos'
      }
    ];

    const achados = avaliarRegra04CondicionanteComProvidencia(condicionantes);

    assert.equal(achados.length, 1);
    assert.equal(achados[0].regraId, 'REG-04-CONDICIONANTE-COM-PROVIDENCIA');
    assert.equal(achados[0].classificacaoSugerida, null, 'Providência declarada NÃO reduz gravidade automaticamente');
    assert.match(achados[0].evidencia, /constando providência declarada/);
    assert.match(achados[0].regraOuMotivo, /Providência declarada não comprova cumprimento/);
  });

  test('condicionante atendida NÃO dispara REG-03 nem REG-04', () => {
    const condicionantes: Condicionante[] = [
      {
        id: 'cond-4',
        descricao: 'Garantia de execução prestada',
        referenciaParecer: 'Parecer PGE nº 05/2026',
        situacao: 'atendida',
        providencia: 'Apólice juntada às fls. 120'
      }
    ];

    const achados03 = avaliarRegra03CondicionanteSemProvidencia(condicionantes);
    const achados04 = avaliarRegra04CondicionanteComProvidencia(condicionantes);

    assert.equal(achados03.length, 0);
    assert.equal(achados04.length, 0);
  });
});

describe('S3.2 — Motor de Regras: REG-05 (Documento a Confirmar)', () => {
  test('dispara achado com classificação pendente para itens com status "confirmar"', () => {
    const checklist: ItemConformidade[] = [
      {
        id: 'item-1',
        descricao: 'Certidão de Regularidade Fiscal',
        status: 'confirmar',
        observacao: 'Conferir prazo de validade'
      },
      {
        id: 'item-2',
        descricao: 'Termo de Referência',
        status: 'ok'
      }
    ];

    const achados = avaliarRegra05DocumentoAConfirmar(checklist);

    assert.equal(achados.length, 1);
    assert.equal(achados[0].regraId, 'REG-05-DOCUMENTO-A-CONFIRMAR');
    assert.equal(achados[0].classificacaoSugerida, null, 'Não deve presumir gravidade essencial ou acessória');
    assert.match(achados[0].evidencia, /Certidão de Regularidade Fiscal/);
    assert.match(achados[0].regraOuMotivo, /Não se afirma inexistência nos autos reais/);
  });
});

describe('S3.2 — Motor de Regras: REG-06 (Não Aplicável sem Justificativa)', () => {
  test('dispara com o título exato quando justificativa for vazia ou < 5 caracteres', () => {
    const checklist: ItemConformidade[] = [
      {
        id: 'item-arp',
        descricao: 'Ata de Registro de Preços',
        status: 'nao_aplicavel',
        justificativaNaoAplicavel: 'n/a' // 3 caracteres (< 5)
      },
      {
        id: 'item-garantia',
        descricao: 'Garantia Contratual',
        status: 'nao_aplicavel',
        justificativaNaoAplicavel: '' // vazia
      }
    ];

    const achados = avaliarRegra06NaoAplicavelSemJustificativa(checklist);

    assert.equal(achados.length, 2);
    assert.equal(
      achados[0].titulo,
      'Item marcado como não aplicável com justificativa ausente ou abaixo do mínimo técnico de preenchimento.'
    );
    assert.equal(achados[0].classificacaoSugerida, null);
    assert.match(achados[0].regraOuMotivo, /Menos de 5 caracteres não comprova falta de fundamento jurídico/);
  });

  test('não dispara REG-06 quando justificativa atingir o piso técnico de 5 caracteres', () => {
    const checklist: ItemConformidade[] = [
      {
        id: 'item-edital',
        descricao: 'Edital de Licitação',
        status: 'nao_aplicavel',
        justificativaNaoAplicavel: 'Inexigibilidade de licitação com base no art. 74 da Lei 14.133.'
      }
    ];

    const achados = avaliarRegra06NaoAplicavelSemJustificativa(checklist);
    assert.equal(achados.length, 0);
  });
});

describe('S3.2 — Motor Consolidado e Governança Global', () => {
  test('executarMotorRegras consolida achados, divergências e alertas sem efeitos colaterais', () => {
    const processo: Partial<Processo> = {
      vigenciaInicio: '2026-05-01',
      vigenciaFim: '2026-04-01', // REG-01
      vigenciaNaoAplicavel: false
    };

    const pertinencia: Partial<Pertinencia> = {
      conclusao: 'PERTINENTE',
      respostas: {
        competenciaNecessidade: true,
        vinculoPlanejamento: false, // Divergência
        beneficioInteressePublico: true,
        custoProporcionalidade: true,
        economicidade: true
      },
      justificativa: 'Motivação fática.'
    };

    const condicionantes: Condicionante[] = [
      {
        id: 'c1',
        descricao: 'Condicionante sem ação',
        referenciaParecer: 'PGE',
        situacao: 'pendente',
        providencia: '' // REG-03
      }
    ];

    const checklist: ItemConformidade[] = [
      {
        id: 'i1',
        descricao: 'Certidão a checar',
        status: 'confirmar' // REG-05
      }
    ];

    const entrada = { processo, pertinencia, condicionantes, checklist };

    const resultado = executarMotorRegras(entrada);

    // Verificações dos resultados
    assert.equal(resultado.achados.length, 3, 'Deve conter 3 achados (REG-01, REG-03, REG-05)');
    assert.equal(resultado.divergencias.length, 1, 'Deve conter 1 divergência humana de pertinência');
    assert.equal(resultado.resumo.totalAchados, 3);
    assert.equal(resultado.resumo.formais, 1);
    assert.equal(resultado.resumo.pendentesClassificacao, 2);

    // Imutabilidade estrita dos dados de entrada
    assert.equal(processo.vigenciaFim, '2026-04-01');
    assert.equal(pertinencia.conclusao, 'PERTINENTE');
    assert.equal(condicionantes[0].providencia, '');
    assert.equal(checklist[0].status, 'confirmar');
  });

  test('determinismo: execuções repetidas produzem exatamente a mesma saída', () => {
    const entrada = {
      processo: {
        vigenciaInicio: '2026-05-01',
        vigenciaFim: '2026-01-01',
        vigenciaNaoAplicavel: false
      }
    };

    const r1 = executarMotorRegras(entrada);
    const r2 = executarMotorRegras(entrada);

    assert.deepEqual(r1, r2, 'A saída deve ser puramente determinística');
  });

  test('ausência de dados ou de achados nunca produz aprovação automática para assinatura', () => {
    const entradaVazia = {};

    const resultado = executarMotorRegras(entradaVazia);

    assert.equal(resultado.achados.length, 0);
    // Verifica que o motor não cria conclusões executivas automáticas
    assert.equal((resultado as unknown as { conclusao?: string }).conclusao, undefined);
  });
});
