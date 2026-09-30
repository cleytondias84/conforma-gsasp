/**
 * Testes unitários e de regressão da Etapa 2 — Pertinência Institucional
 * Cobrindo consonância PERTINENTE === PERTINENTE, validação humana, ausência de falsa divergência,
 * persistência no armazenamento local e consumo regular pela Etapa 6.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getPertinenciaAtiva,
  setPertinenciaAtiva,
  isPertinenciaValidada,
  normalizarPertinencia,
  renderPertinenciaScreen,
  extrairDadosDoFormularioPertinencia,
  atualizarSeloValidacaoNoDOM,
  atualizarPainelSugestaoAoVivo,
  CENARIOS_PERTINENCIA_DEMO
} from './pertinencia.ts';
import {
  sugerirConclusaoPertinencia,
  validarPertinencia
} from '../domain/validacao.ts';
import {
  salvarRascunhoAtual,
  recuperarUltimoRascunho,
  definirRepositorioParaTestes,
  type IRepositorioArmazenamento,
  type DadosRascunhoCompleto,
  type ResumoRascunhoSalvo,
  type DiagnosticoArmazenamento
} from '../services/armazenamento.ts';
import { getResultadoExecutivoAtivo } from './resultado.ts';
import { setProcessoAtivo } from './identificacao.ts';
import { setChecklistAtivo, setCondicionantesAtivas } from './conformidade.ts';
import { setAchadosAtivos } from './achados.ts';
import { setRiscosAtivos } from './riscos.ts';
import type { Pertinencia, Processo, ItemConformidade, Risco } from '../domain/tipos.ts';

// Repositório em memória para testar persistência e restauração
class RepositorioMemoriaTestes implements IRepositorioArmazenamento {
  private rascunho: DadosRascunhoCompleto | null = null;

  async salvarRascunho(dados: DadosRascunhoCompleto): Promise<void> {
    this.rascunho = JSON.parse(JSON.stringify(dados));
  }

  async obterRascunho(): Promise<DadosRascunhoCompleto | null> {
    return this.rascunho ? JSON.parse(JSON.stringify(this.rascunho)) : null;
  }

  async listarRascunhos(): Promise<ResumoRascunhoSalvo[]> {
    if (!this.rascunho) return [];
    return [{
      id: this.rascunho.analiseId,
      processoId: this.rascunho.processo.id,
      numero: this.rascunho.processo.numero,
      instrumento: this.rascunho.processo.instrumento,
      objeto: this.rascunho.processo.objeto,
      estadoEdicao: this.rascunho.estadoEdicao,
      atualizadoEm: this.rascunho.salvoEm
    }];
  }

  async excluirRascunho(): Promise<void> {
    this.rascunho = null;
  }

  async limparTudo(): Promise<void> {
    this.rascunho = null;
  }

  async getDiagnostico(): Promise<DiagnosticoArmazenamento> {
    return {
      tipo: 'memoria',
      disponivel: true,
      mensagem: 'Memória de teste',
      ultimoSalvamento: this.rascunho?.salvoEm || null,
      totalSalvos: this.rascunho ? 1 : 0
    };
  }
}

describe('Etapa 2 — Pertinência Institucional: Consonância e Validação Humana (RN02)', () => {
  beforeEach(() => {
    definirRepositorioParaTestes(new RepositorioMemoriaTestes());

    // Configura processo ativo padrão
    setProcessoAtivo({
      id: 'proc-pert-test',
      numero: 'GSASP-PRC-2026/7788',
      instrumento: 'Termo de Contrato',
      contratado: 'Empresa Teste SESP',
      cnpj: '00.000.000/0001-91',
      objeto: 'Aquisição regular e justificada de sistemas operacionais',
      tipoOrigem: 'Pregão Eletrônico',
      valor: 200000,
      valorNaoAplicavel: false,
      vigenciaInicio: '2026-01-01',
      vigenciaFim: '2026-12-31',
      vigenciaNaoAplicavel: false
    });

    // Redefine pertinência ativa para o Cenário 1 (regular)
    setPertinenciaAtiva({ ...CENARIOS_PERTINENCIA_DEMO['cenario-01'] });

    setChecklistAtivo([
      { id: 'c1', descricao: 'ETP juntado', status: 'ok' },
      { id: 'c2', descricao: 'TR aprovado', status: 'ok' }
    ]);
    setCondicionantesAtivas([]);
    setAchadosAtivos([]);
    setRiscosAtivos([
      { dimensao: 'juridica', nivel: 'baixo', justificativa: 'Sem óbices jurídicos', achadosRelacionados: [] },
      { dimensao: 'financeira', nivel: 'baixo', justificativa: 'Recursos previstos', achadosRelacionados: [] },
      { dimensao: 'operacional', nivel: 'baixo', justificativa: 'Capacidade técnica comprovada', achadosRelacionados: [] },
      { dimensao: 'controle', nivel: 'baixo', justificativa: 'Ritos atendidos', achadosRelacionados: [] }
    ]);
  });

  it('A) legado completo sem metadados humanos -> campos preservados, mas PENDENTE (RN02 estrita)', async () => {
    const rascunhoLegado: DadosRascunhoCompleto = {
      analiseId: 'anl-legado-a',
      processo: {
        id: 'proc-legado-a',
        numero: 'GSASP-LEGADO-2026/01',
        instrumento: 'Termo de Contrato',
        contratado: 'Fornecedor Antigo',
        cnpj: '00.000.000/0001-00',
        objeto: 'Processo herdado sem metadados de validação',
        tipoOrigem: 'Pregão',
        valor: 50000,
        vigenciaInicio: '2026-01-01',
        vigenciaFim: '2026-12-31'
      },
      pertinencia: {
        respostas: {
          competenciaNecessidade: true,
          vinculoPlanejamento: true,
          beneficioInteressePublico: true,
          custoProporcionalidade: true,
          economicidade: true
        },
        evidencias: 'Evidências do rascunho legado registradas nos autos.',
        justificativa: 'Justificativa do assessor formalmente completa.',
        providencia: 'Avançar trâmite regular.',
        conclusao: 'PERTINENTE'
        // SEM validada e SEM validacaoHumana
      } as unknown as Pertinencia,
      checklist: [],
      condicionantes: [],
      estadoEdicao: 'rascunho',
      salvoEm: '2026-09-28T10:00:00.000Z'
    };

    const repo = new RepositorioMemoriaTestes();
    definirRepositorioParaTestes(repo);
    await repo.salvarRascunho(rascunhoLegado);

    // Restaura via caminho de inicialização (como no initRouter)
    const recuperado = await recuperarUltimoRascunho();
    assert.ok(recuperado);
    setPertinenciaAtiva(recuperado.pertinencia);

    const pert = getPertinenciaAtiva();
    // 1. Campos preservados
    assert.equal(pert.respostas.competenciaNecessidade, true);
    assert.equal(pert.respostas.vinculoPlanejamento, true);
    assert.equal(pert.conclusao, 'PERTINENTE');
    assert.equal(pert.evidencias, 'Evidências do rascunho legado registradas nos autos.');
    assert.equal(pert.justificativa, 'Justificativa do assessor formalmente completa.');

    // 2. Sugestão calculada normalmente pelo sistema
    assert.equal(sugerirConclusaoPertinencia(pert.respostas), 'PERTINENTE');

    // 3. NÃO deve inferir validação humana nem fabricar metadados
    assert.equal(pert.validada, false, 'Rascunho sem validação humana expressa deve permanecer validada: false');
    assert.equal(pert.validacaoHumana, null, 'JAMAIS fabricar metadados históricos fictícios');
    assert.equal(isPertinenciaValidada(pert), false, 'isPertinenciaValidada deve retornar false');

    // 4. Renderização exibe selo PENDENTE
    const html = renderPertinenciaScreen();
    assert.ok(html.includes('id="selo-validacao-pertinencia"'));
    assert.ok(html.includes('Pendente de Validação Humana (RN02)'), 'Deve exibir selo Pendente de Validação Humana');
    assert.ok(!html.includes('Validado / Homologado (RN02)'), 'Não deve exibir selo validado');
    // Ausência de divergência porque sugestão PERTINENTE coincide com conclusão PERTINENTE
    assert.ok(html.includes('class="divergence-box hidden"'));
    assert.ok(html.includes('display: none !important;'));
  });

  it('B) após clique explícito em Validar Critérios -> VALIDADO (cria validada: true e validacaoHumana)', () => {
    // Configura pertinência pendente com todos os campos válidos
    const pertPendente: Pertinencia = {
      respostas: {
        competenciaNecessidade: true,
        vinculoPlanejamento: true,
        beneficioInteressePublico: true,
        custoProporcionalidade: true,
        economicidade: true
      },
      evidencias: 'Documento comprobatório nº 10/2026 nos autos.',
      justificativa: 'Justificativa expressa registrada pelo assessor.',
      providencia: 'Aprovação.',
      conclusao: 'PERTINENTE',
      validada: false,
      validacaoHumana: null
    };
    setPertinenciaAtiva(pertPendente);
    assert.equal(isPertinenciaValidada(getPertinenciaAtiva()), false);

    // Simula a validação humana expressa que ocorre no acionamento de "Validar Critérios"
    const dados = getPertinenciaAtiva();
    const res = validarPertinencia(dados);
    assert.equal(res.valido, true);

    dados.validada = true;
    dados.validacaoHumana = {
      validadoPor: 'Assessor Técnico GSASP',
      dataHora: new Date().toISOString(),
      papel: 'assessor',
      observacoes: `Pertinência institucional validada e homologada como ${dados.conclusao}`
    };
    setPertinenciaAtiva(dados);

    // Confere estado homologado
    const pertValidada = getPertinenciaAtiva();
    assert.equal(pertValidada.validada, true);
    assert.ok(pertValidada.validacaoHumana);
    assert.equal(pertValidada.validacaoHumana?.validadoPor, 'Assessor Técnico GSASP');
    assert.equal(isPertinenciaValidada(pertValidada), true);

    // Confere tela
    const html = renderPertinenciaScreen();
    assert.ok(html.includes('Validado / Homologado (RN02)'));
    assert.ok(html.includes('humano-badge-validado'));
    assert.ok(!html.includes('Pendente de Validação Humana (RN02)'));
  });

  it('C) salvar -> limpar memória -> restaurar -> renderizar -> continua VALIDADO', async () => {
    // Pertinência validada expressamente
    const pertValidada: Pertinencia = {
      respostas: {
        competenciaNecessidade: true,
        vinculoPlanejamento: true,
        beneficioInteressePublico: true,
        custoProporcionalidade: true,
        economicidade: true
      },
      evidencias: 'Demonstrativo formal nº 22/2026 e ETP instruído.',
      justificativa: 'Necessidade pública justificada pelo assessor.',
      conclusao: 'PERTINENTE',
      providencia: 'Avançar para conformidade.',
      validada: true,
      validacaoHumana: {
        validadoPor: 'Assessor Validador',
        dataHora: '2026-09-30T14:15:00.000Z',
        papel: 'assessor',
        observacoes: 'Homologação regular'
      }
    };
    setPertinenciaAtiva(pertValidada);

    const proc: Processo = {
      id: 'p-roundtrip-c',
      numero: 'GSASP-2026/001',
      instrumento: 'Contrato',
      contratado: 'Empresa',
      cnpj: '00.000.000/0001-91',
      objeto: 'Objeto de teste',
      tipoOrigem: 'Pregão',
      valor: 100000,
      vigenciaInicio: '2026-01-01',
      vigenciaFim: '2026-12-31'
    };

    // Salvar rascunho
    await salvarRascunhoAtual(proc, getPertinenciaAtiva(), [], []);

    // Limpar memória (reset)
    setPertinenciaAtiva({
      respostas: {
        competenciaNecessidade: null,
        vinculoPlanejamento: null,
        beneficioInteressePublico: null,
        custoProporcionalidade: null,
        economicidade: null
      },
      evidencias: '',
      justificativa: '',
      conclusao: null,
      providencia: '',
      validada: false,
      validacaoHumana: null
    });
    assert.equal(isPertinenciaValidada(getPertinenciaAtiva()), false);

    // Restaurar
    const recuperado = await recuperarUltimoRascunho();
    assert.ok(recuperado);
    setPertinenciaAtiva(recuperado.pertinencia);

    // Confirmar integridade
    const restaurada = getPertinenciaAtiva();
    assert.equal(restaurada.respostas.competenciaNecessidade, true);
    assert.equal(restaurada.conclusao, 'PERTINENTE');
    assert.equal(restaurada.validada, true);
    assert.ok(restaurada.validacaoHumana);
    assert.equal(restaurada.validacaoHumana?.validadoPor, 'Assessor Validador');
    assert.equal(isPertinenciaValidada(restaurada), true);

    // Renderizar
    const html = renderPertinenciaScreen();
    assert.ok(html.includes('Validado / Homologado (RN02)'));
    assert.ok(!html.includes('Pendente de Validação Humana (RN02)'));
    assert.ok(html.includes('class="divergence-box hidden"'));
    assert.ok(html.includes('display: none !important;'));
  });

  it('D) PERTINENTE x PERTINENTE nunca gera divergência', () => {
    setPertinenciaAtiva({
      respostas: {
        competenciaNecessidade: true,
        vinculoPlanejamento: true,
        beneficioInteressePublico: true,
        custoProporcionalidade: true,
        economicidade: true
      },
      evidencias: 'Documentação nos autos.',
      justificativa: 'Justificativa do assessor.',
      providencia: 'Avançar.',
      conclusao: 'PERTINENTE',
      validada: true,
      validacaoHumana: {
        validadoPor: 'Assessor',
        dataHora: new Date().toISOString(),
        papel: 'assessor'
      }
    });

    const pert = getPertinenciaAtiva();
    const sugestao = sugerirConclusaoPertinencia(pert.respostas);
    assert.equal(sugestao, 'PERTINENTE');
    assert.equal(pert.conclusao, 'PERTINENTE');

    // Validação formal
    const res = validarPertinencia(pert);
    assert.equal(res.avisos.conclusao, undefined, 'Não deve emitir aviso quando sugestão === conclusão');

    // Renderização
    const html = renderPertinenciaScreen();
    assert.ok(html.includes('id="divergencia-alerta"'));
    assert.ok(html.includes('class="divergence-box hidden"'));
    assert.ok(html.includes('display: none !important;'));
  });

  it('E) Etapa 6 só considera a pertinência humanamente validada quando houver estado explícito de validação', () => {
    // Subcenário 1: Pertinência com campos preenchidos e conclusão 'PERTINENTE', porém SEM validação humana (validada: false)
    setPertinenciaAtiva({
      respostas: {
        competenciaNecessidade: true,
        vinculoPlanejamento: true,
        beneficioInteressePublico: true,
        custoProporcionalidade: true,
        economicidade: true
      },
      evidencias: 'Documentos do ETP nos autos.',
      justificativa: 'Objeto pertinente para a segurança pública.',
      conclusao: 'PERTINENTE',
      providencia: 'Avançar instrução.',
      validada: false,
      validacaoHumana: null
    });
    assert.equal(isPertinenciaValidada(getPertinenciaAtiva()), false);

    // Etapa 6 deve acusar pendência DEC-02 (MOT-SANEAMENTO-AVALIACOES-PENDENTES) -> P1
    const resSemValidacao = getResultadoExecutivoAtivo();
    assert.equal(
      resSemValidacao.conclusao,
      'RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA',
      'Sem validação humana da pertinência, a Etapa 6 deve emitir P1 (Retornar para Saneamento por Avaliações Pendentes)'
    );
    assert.equal(resSemValidacao.precedenciaAplicada, 'P1');
    assert.ok(resSemValidacao.regrasDecAplicadas.includes('DEC-02'), 'Deve acusar avaliação pendente DEC-02');
    assert.ok(
      resSemValidacao.codigosMotivo.includes('MOT-SANEAMENTO-AVALIACOES-PENDENTES'),
      'Deve emitir código de motivo de saneamento de avaliações pendentes'
    );

    // Subcenário 2: Assessor valida explicitamente a Pertinência
    const pertValidada = getPertinenciaAtiva();
    pertValidada.validada = true;
    pertValidada.validacaoHumana = {
      validadoPor: 'Assessor Técnico',
      dataHora: new Date().toISOString(),
      papel: 'assessor',
      observacoes: 'Pertinência homologada com sucesso'
    };
    setPertinenciaAtiva(pertValidada);
    assert.equal(isPertinenciaValidada(getPertinenciaAtiva()), true);

    // Agora a Etapa 6 reconhece a validação e autoriza a conclusão P5 (Apto para Assinatura)
    const resComValidacao = getResultadoExecutivoAtivo();
    assert.equal(
      resComValidacao.conclusao,
      'APTO_PARA_ASSINATURA',
      'Com pertinência humanamente validada, a Etapa 6 permite a conclusão P5'
    );
    assert.equal(resComValidacao.precedenciaAplicada, 'P5');
    assert.ok(!resComValidacao.codigosMotivo.includes('MOT-SANEAMENTO-AVALIACOES-PENDENTES'));
  });

  it('F) alteração de critério invalida temporariamente o selo até nova validação expressa', () => {
    // Inicialmente validado
    assert.equal(isPertinenciaValidada(getPertinenciaAtiva()), true);

    // Simula desvalidação por alteração manual
    const pert = getPertinenciaAtiva();
    pert.validada = false;
    pert.validacaoHumana = null;
    setPertinenciaAtiva(pert);

    assert.equal(isPertinenciaValidada(getPertinenciaAtiva()), false);
    const html = renderPertinenciaScreen();
    assert.ok(html.includes('Pendente de Validação Humana (RN02)'), 'Deve voltar para pendente quando desvalidado');

    // Simula revalidação com sucesso
    pert.validada = true;
    pert.validacaoHumana = {
      validadoPor: 'Assessor Técnico',
      dataHora: new Date().toISOString(),
      papel: 'assessor'
    };
    setPertinenciaAtiva(pert);
    assert.equal(isPertinenciaValidada(getPertinenciaAtiva()), true);
    const htmlRevalidado = renderPertinenciaScreen();
    assert.ok(htmlRevalidado.includes('Validado / Homologado (RN02)'), 'Deve voltar para validado após homologação');
  });
});
