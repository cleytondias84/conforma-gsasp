/**
 * CONFORMA GSASP — Testes Unitários da Tela da Etapa 5: Avaliação de Riscos (S3.4)
 * Executado nativamente pelo Node.js test runner
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  getRiscosAtivos,
  setRiscosAtivos,
  renderRiscosScreen
} from './riscos.ts';

import { setProcessoAtivo } from './identificacao.ts';
import { setAchadosAtivos } from './achados.ts';
import { setPapelAtivo } from '../auth/papeis.ts';
import type { Achado, Risco } from '../domain/tipos.ts';

describe('S3.4 — Tela de Avaliação de Riscos', () => {
  beforeEach(() => {
    setPapelAtivo('assessor');
    setRiscosAtivos([]);
    setAchadosAtivos([]);
    setProcessoAtivo({
      id: 'proc-riscos-t1',
      numero: 'SESP-PRO-2026/00777',
      instrumento: 'Termo Aditivo nº 01/2026',
      contratado: 'Empresa Teste Fictícia',
      cnpj: '00.000.000/0001-99',
      objeto: 'Prorrogação de prazo contratual para manutenção de radiocomunicação',
      tipoOrigem: 'Pregão',
      valor: 120000,
      valorNaoAplicavel: false,
      vigenciaInicio: '2026-05-01',
      vigenciaFim: '2027-05-01',
      vigenciaNaoAplicavel: false
    });
  });

  test('getRiscosAtivos / setRiscosAtivos: inicializa e preserva as 4 dimensões', () => {
    const riscos = getRiscosAtivos();
    assert.equal(riscos.length, 4);
    assert.deepEqual(
      riscos.map((r) => r.dimensao),
      ['juridica', 'financeira', 'operacional', 'controle']
    );

    // Inicialmente todas estão pendentes de avaliação humana (RN12)
    for (const r of riscos) {
      assert.equal(r.nivel, null);
      assert.equal(r.justificativa, '');
    }
  });

  test('vínculo em revisão (RN10): exibe aviso na dimensão afetada, não considera referência validada e preserva nível e justificativa', () => {
    const achados: Achado[] = [
      {
        id: 'ach-01',
        titulo: 'Achado 1 Validado',
        evidencia: 'Evidência 1',
        regraOuMotivo: 'Motivo 1',
        impacto: 'Impacto 1',
        providencia: 'Providência 1',
        responsavel: 'Setor 1',
        classificacaoSugerida: 'RELEVANTE',
        classificacao: 'RELEVANTE',
        classificacaoValidada: 'RELEVANTE',
        estadoValidacao: 'VALIDADO'
      },
      {
        id: 'ach-02',
        titulo: 'Achado 2 em Revisão',
        evidencia: 'Evidência 2',
        regraOuMotivo: 'Motivo 2',
        impacto: 'Impacto 2',
        providencia: 'Providência 2',
        responsavel: 'Setor 2',
        classificacaoSugerida: 'FORMAL',
        classificacao: 'FORMAL',
        estadoValidacao: 'SUGESTAO_SISTEMA' // Retornou para revisão na Etapa 4
      }
    ];

    setAchadosAtivos(achados);

    const riscosCustom: Risco[] = [
      {
        dimensao: 'juridica',
        nivel: 'alto',
        justificativa: 'Justificativa jurídica preservada pelo assessor.',
        achadosRelacionados: ['ach-01', 'ach-02']
      },
      {
        dimensao: 'financeira',
        nivel: 'baixo',
        justificativa: 'Sem achados',
        achadosRelacionados: []
      },
      {
        dimensao: 'operacional',
        nivel: 'baixo',
        justificativa: 'Sem achados',
        achadosRelacionados: []
      },
      {
        dimensao: 'controle',
        nivel: 'baixo',
        justificativa: 'Sem achados',
        achadosRelacionados: []
      }
    ];

    setRiscosAtivos(riscosCustom);

    // 1. Renderiza a tela
    const html = renderRiscosScreen();

    // 2. Verifica a presença do alerta específico de governança (RN10)
    assert.ok(html.includes('alerta-vinculo-revisao'), 'Deve exibir o cartão de alerta de vínculo em revisão');
    assert.ok(html.includes('Achado 2 em Revisão'), 'Deve identificar o título do achado em revisão');
    assert.ok(html.includes('não é mais considerado uma referência validada'), 'Deve alertar que não é referência validada');

    // 3. Verifica que o nível e a justificativa foram preservados sem reclassificação automática
    const riscos = getRiscosAtivos();
    const riscoJuridico = riscos.find((r) => r.dimensao === 'juridica');
    assert.equal(riscoJuridico?.nivel, 'alto', 'Nível de risco deve ser preservado');
    assert.equal(
      riscoJuridico?.justificativa,
      'Justificativa jurídica preservada pelo assessor.',
      'Justificativa deve ser rigorosamente preservada'
    );

    // 4. No checklist de achados validados, somente ach-01 (VALIDADO) é renderizado como opção
    assert.ok(html.includes('Achado 1 Validado'));
    // ach-02 não pode estar na lista de checkboxes de achados validados
    assert.ok(
      !html.includes('checkbox-vinculo-achado" data-dimensao="juridica" data-achado-id="ach-02"'),
      'Achado em revisão não deve constar como checkbox de achado validado'
    );
  });

  test('renderRiscosScreen: renderiza elementos obrigatórios de governança e dimensões', () => {
    const html = renderRiscosScreen();

    // Título e identificação da etapa
    assert.ok(html.includes('5. Avaliação de Riscos'));
    assert.ok(html.includes('SESP-PRO-2026/00777'));

    // As 4 dimensões
    assert.ok(html.includes('Dimensão Jurídica'));
    assert.ok(html.includes('Dimensão Financeira'));
    assert.ok(html.includes('Dimensão Operacional'));
    assert.ok(html.includes('Dimensão Controle'));

    // Banner de Governança RN12
    assert.ok(html.includes('Critérios Demonstrativos de Avaliação de Riscos (RN12)'));
    assert.ok(html.includes('A ausência de achados apontados nas etapas anteriores'));

    // Botões de navegação
    assert.ok(html.includes('btn-voltar-achados'));
    assert.ok(html.includes('btn-avancar-resultado'));
  });

  test('renderRiscosScreen: em modo somente leitura (Leitor / Aprovador) exibe readonly-banner e desabilita controles', () => {
    setPapelAtivo('leitor');
    const html = renderRiscosScreen();

    assert.ok(html.includes('readonly-banner'));
    assert.ok(html.includes('Modo de Consulta Ativo'));
    assert.ok(html.includes('disabled'));
    assert.ok(html.includes('readonly'));
  });
});
