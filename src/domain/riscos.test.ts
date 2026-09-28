/**
 * CONFORMA GSASP — Testes Unitários de Avaliação de Riscos (S3.4)
 * Executado nativamente pelo Node.js test runner
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DIMENSOES_RISCO,
  NIVEIS_RISCO,
  criarRiscosIniciais,
  definirNivelRisco,
  definirJustificativaRisco,
  alternarVinculoAchado,
  identificarVinculosValidados,
  identificarVinculosEmRevisao,
  identificarVinculosOrfaos,
  desvincularAchado,
  sincronizarRiscosComAchados,
  validarRiscos,
  calcularResumoRiscos,
  formatarNivelRisco,
  formatarDimensaoRisco,
  CENARIOS_EXEMPLO_RISCOS
} from './riscos.ts';
import type { Achado, Risco } from './tipos.ts';

test('S3.4 — Riscos: estrutura inicial e conformidade com governança (RN12)', async (t) => {
  await t.test('contém as 4 dimensões regulamentares', () => {
    assert.deepEqual([...DIMENSOES_RISCO], ['juridica', 'financeira', 'operacional', 'controle']);
  });

  await t.test('contém os 4 níveis de risco', () => {
    assert.deepEqual([...NIVEIS_RISCO], ['baixo', 'moderado', 'alto', 'critico']);
  });

  await t.test('criarRiscosIniciais: inicializa todas as 4 dimensões em estado pendente (null), sem presumir Baixo', () => {
    const iniciais = criarRiscosIniciais();
    assert.equal(iniciais.length, 4);

    for (const r of iniciais) {
      assert.equal(r.nivel, null, `Dimensão ${r.dimensao} não deve nascer como 'baixo' sem decisão humana (RN12)`);
      assert.equal(r.justificativa, '');
      assert.deepEqual(r.achadosRelacionados, []);
    }
  });
});

test('S3.4 — Riscos: atualização imutável de nível, justificativa e vínculos', async (t) => {
  await t.test('definirNivelRisco: altera o nível da dimensão indicada sem mutar as demais', () => {
    const base = criarRiscosIniciais();
    const atualizado = definirNivelRisco(base, 'juridica', 'alto');

    assert.notEqual(base, atualizado);
    assert.equal(base.find((r) => r.dimensao === 'juridica')?.nivel, null);
    assert.equal(atualizado.find((r) => r.dimensao === 'juridica')?.nivel, 'alto');
    assert.equal(atualizado.find((r) => r.dimensao === 'financeira')?.nivel, null);
  });

  await t.test('definirJustificativaRisco: altera a justificativa da dimensão indicada', () => {
    const base = criarRiscosIniciais();
    const atualizado = definirJustificativaRisco(base, 'financeira', 'Previsão orçamentária atestada.');

    assert.equal(atualizado.find((r) => r.dimensao === 'financeira')?.justificativa, 'Previsão orçamentária atestada.');
    assert.equal(atualizado.find((r) => r.dimensao === 'juridica')?.justificativa, '');
  });

  await t.test('alternarVinculoAchado: inclui e remove achado da lista de vínculos', () => {
    const base = criarRiscosIniciais();
    const comVinculo = alternarVinculoAchado(base, 'juridica', 'ach-01');
    assert.deepEqual(comVinculo.find((r) => r.dimensao === 'juridica')?.achadosRelacionados, ['ach-01']);

    const comSegundo = alternarVinculoAchado(comVinculo, 'juridica', 'ach-02');
    assert.deepEqual(comSegundo.find((r) => r.dimensao === 'juridica')?.achadosRelacionados, ['ach-01', 'ach-02']);

    const desvinculado = alternarVinculoAchado(comSegundo, 'juridica', 'ach-01');
    assert.deepEqual(desvinculado.find((r) => r.dimensao === 'juridica')?.achadosRelacionados, ['ach-02']);
  });

  await t.test('identificarVinculosValidados e identificarVinculosEmRevisao (RN10)', () => {
    const risco: Risco = {
      dimensao: 'juridica',
      nivel: 'alto',
      justificativa: 'Motivo fundamentado',
      achadosRelacionados: ['ach-valido', 'ach-reaberto', 'ach-rejeitado', 'ach-inexistente']
    };

    const achados: Achado[] = [
      {
        id: 'ach-valido',
        titulo: 'Achado Atestado',
        evidencia: 'Evidência A',
        regraOuMotivo: 'Motivo A',
        impacto: 'Impacto A',
        providencia: 'Providência A',
        responsavel: 'Setor A',
        classificacaoSugerida: 'RELEVANTE',
        classificacao: 'RELEVANTE',
        classificacaoValidada: 'RELEVANTE',
        estadoValidacao: 'VALIDADO'
      },
      {
        id: 'ach-reaberto',
        titulo: 'Achado que voltou para revisão',
        evidencia: 'Evidência B',
        regraOuMotivo: 'Motivo B',
        impacto: 'Impacto B',
        providencia: 'Providência B',
        responsavel: 'Setor B',
        classificacaoSugerida: 'FORMAL',
        classificacao: 'FORMAL',
        estadoValidacao: 'SUGESTAO_SISTEMA'
      },
      {
        id: 'ach-rejeitado',
        titulo: 'Achado rejeitado',
        evidencia: 'Evidência C',
        regraOuMotivo: 'Motivo C',
        impacto: 'Impacto C',
        providencia: 'Providência C',
        responsavel: 'Setor C',
        classificacaoSugerida: 'MELHORIA',
        classificacao: 'MELHORIA',
        estadoValidacao: 'REJEITADO',
        justificativaRejeicao: 'Não se aplica'
      }
    ];

    // Somente ach-valido é considerado referência validada
    const validados = identificarVinculosValidados(risco, achados);
    assert.equal(validados.length, 1);
    assert.equal(validados[0].id, 'ach-valido');

    // ach-reaberto e ach-rejeitado são identificados como não validados / em revisão
    const emRevisao = identificarVinculosEmRevisao(risco, achados);
    assert.equal(emRevisao.length, 2);
    assert.deepEqual(emRevisao.map((a) => a.id), ['ach-reaberto', 'ach-rejeitado']);

    // ach-inexistente é órfão
    const orfaos = identificarVinculosOrfaos(risco, achados);
    assert.deepEqual(orfaos, ['ach-inexistente']);
  });

  await t.test('desvincularAchado: remove vínculo específico preservando nível e justificativa', () => {
    const base: Risco[] = [
      {
        dimensao: 'juridica',
        nivel: 'alto',
        justificativa: 'Justificativa mantida',
        achadosRelacionados: ['ach-01', 'ach-02']
      }
    ];

    const atualizado = desvincularAchado(base, 'juridica', 'ach-01');
    assert.deepEqual(atualizado[0].achadosRelacionados, ['ach-02']);
    assert.equal(atualizado[0].nivel, 'alto');
    assert.equal(atualizado[0].justificativa, 'Justificativa mantida');
  });

  await t.test('sincronizarRiscosComAchados: limpa referências a achados não validados ou excluídos quando invocado', () => {
    const base: Risco[] = [
      {
        dimensao: 'juridica',
        nivel: 'alto',
        justificativa: 'Motivo',
        achadosRelacionados: ['ach-valido', 'ach-rejeitado', 'ach-inexistente']
      },
      {
        dimensao: 'financeira',
        nivel: 'baixo',
        justificativa: 'Motivo',
        achadosRelacionados: ['ach-valido']
      },
      {
        dimensao: 'operacional',
        nivel: 'baixo',
        justificativa: 'Motivo',
        achadosRelacionados: []
      },
      {
        dimensao: 'controle',
        nivel: 'baixo',
        justificativa: 'Motivo',
        achadosRelacionados: []
      }
    ];

    const achados: Achado[] = [
      {
        id: 'ach-valido',
        titulo: 'Achado Atestado',
        evidencia: 'Evidência A',
        regraOuMotivo: 'Motivo A',
        impacto: 'Impacto A',
        providencia: 'Providência A',
        responsavel: 'Setor A',
        classificacaoSugerida: 'RELEVANTE',
        classificacao: 'RELEVANTE',
        classificacaoValidada: 'RELEVANTE',
        estadoValidacao: 'VALIDADO'
      },
      {
        id: 'ach-rejeitado',
        titulo: 'Achado Descartado',
        evidencia: 'Evidência B',
        regraOuMotivo: 'Motivo B',
        impacto: 'Impacto B',
        providencia: 'Providência B',
        responsavel: 'Setor B',
        classificacaoSugerida: 'FORMAL',
        classificacao: 'FORMAL',
        estadoValidacao: 'REJEITADO',
        justificativaRejeicao: 'Item saneado'
      }
    ];

    const limpo = sincronizarRiscosComAchados(base, achados);
    assert.deepEqual(limpo.find((r) => r.dimensao === 'juridica')?.achadosRelacionados, ['ach-valido']);
    assert.deepEqual(limpo.find((r) => r.dimensao === 'financeira')?.achadosRelacionados, ['ach-valido']);
  });
});

test('S3.4 — Riscos: validação de preenchimento e pendências formais (RN13)', async (t) => {
  await t.test('rejeita riscos vazios ou parcialmente preenchidos apontando pendências claras', () => {
    const vazios = criarRiscosIniciais();
    const res = validarRiscos(vazios);

    assert.equal(res.valido, false);
    assert.equal(res.pendencias.length, 8); // 4 níveis ausentes + 4 justificativas ausentes
    assert.ok(res.erros.juridica.length >= 2);
  });

  await t.test('rejeita justificativa excessivamente curta (< 5 caracteres)', () => {
    let riscos = criarRiscosIniciais();
    riscos = definirNivelRisco(riscos, 'juridica', 'baixo');
    riscos = definirJustificativaRisco(riscos, 'juridica', 'ok'); // 2 chars
    riscos = definirNivelRisco(riscos, 'financeira', 'baixo');
    riscos = definirJustificativaRisco(riscos, 'financeira', 'Justificativa financeira válida');
    riscos = definirNivelRisco(riscos, 'operacional', 'baixo');
    riscos = definirJustificativaRisco(riscos, 'operacional', 'Justificativa operacional válida');
    riscos = definirNivelRisco(riscos, 'controle', 'baixo');
    riscos = definirJustificativaRisco(riscos, 'controle', 'Justificativa de controle válida');

    const res = validarRiscos(riscos);
    assert.equal(res.valido, false);
    assert.ok(res.erros.juridica.some((e) => e.includes('muito sucinta')));
  });

  await t.test('aprova avaliação completa com todas as dimensões justificadas', () => {
    const cenario = CENARIOS_EXEMPLO_RISCOS.regular.riscos;
    const res = validarRiscos(cenario);

    assert.equal(res.valido, true);
    assert.equal(res.pendencias.length, 0);
  });
});

test('S3.4 — Riscos: resumo estatístico e contadores de KPIs', async (t) => {
  await t.test('calcula contadores e identifica predominância sem inventar pontuação', () => {
    const riscos: Risco[] = [
      { dimensao: 'juridica', nivel: 'critico', justificativa: 'J1', achadosRelacionados: [] },
      { dimensao: 'financeira', nivel: 'alto', justificativa: 'J2', achadosRelacionados: [] },
      { dimensao: 'operacional', nivel: 'baixo', justificativa: 'J3', achadosRelacionados: [] },
      { dimensao: 'controle', nivel: null, justificativa: '', achadosRelacionados: [] }
    ];

    const resumo = calcularResumoRiscos(riscos);
    assert.equal(resumo.critico, 1);
    assert.equal(resumo.alto, 1);
    assert.equal(resumo.baixo, 1);
    assert.equal(resumo.moderado, 0);
    assert.equal(resumo.pendentes, 1);
    assert.equal(resumo.todasAvaliadas, false);
    assert.equal(resumo.nivelPredominante, 'critico');
  });

  await t.test('formata rótulos e dimensões legíveis', () => {
    assert.equal(formatarNivelRisco('critico'), 'Crítico');
    assert.equal(formatarNivelRisco(null), 'Pendente de Avaliação');
    assert.equal(formatarDimensaoRisco('juridica'), 'Jurídica');
  });
});
