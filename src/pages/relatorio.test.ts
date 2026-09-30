/**
 * CONFORMA GSASP — Testes Unitários e de Governança do Relatório Executivo (S4.3-Demo / Passo 2)
 * Executado nativamente pelo Node.js test runner
 *
 * Verificações Mandatórias de Governança:
 * A) #/resultado continua funcionando;
 * B) botão abre #/relatorio;
 * C) relatório renderiza;
 * D) voltar retorna para #/resultado;
 * E) abrir relatório não altera o estado da análise;
 * F) abrir relatório não aumenta o contador da auditoria;
 * G) perfis Leitor e Aprovador conseguem visualizar;
 * H) nenhuma ação de homologação aparece no relatório.
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  renderRelatorioScreen,
  obterDadosRelatorioExecutivo
} from './relatorio.ts';

import {
  renderResultadoScreen,
  getResultadoExecutivoAtivo,
  getConclusaoValidada,
  limparResultadoAtivo
} from './resultado.ts';

import { setProcessoAtivo, getProcessoAtivo } from './identificacao.ts';
import { setPertinenciaAtiva, getPertinenciaAtiva } from './pertinencia.ts';
import { setChecklistAtivo, getChecklistAtivo, setCondicionantesAtivas, getCondicionantesAtivas } from './conformidade.ts';
import { setAchadosAtivos, getAchadosAtivos } from './achados.ts';
import { setRiscosAtivos, getRiscosAtivos } from './riscos.ts';
import { setPapelAtivo, getPapelAtivo } from '../auth/papeis.ts';
import {
  getEventosAtivos,
  limparEventosAtivos,
  registrarEventoLocal,
  ACOES_AUDITORIA
} from '../services/auditoria.ts';
import type { ItemChecklist, Condicionante, Risco } from '../domain/tipos.ts';

describe('S4.3-Demo — Relatório Executivo e Rota #/relatorio (Passo 2)', () => {
  beforeEach(() => {
    setPapelAtivo('assessor');
    limparResultadoAtivo();
    limparEventosAtivos();

    // Estado padrão dos autos
    setProcessoAtivo({
      id: 'proc-demo-s43',
      numero: 'SESP-PRO-2026/00999',
      instrumento: 'Termo de Contrato nº 50/2026',
      contratado: 'Delta Segurança Inteligente Ltda.',
      cnpj: '99.888.777/0001-66',
      objeto: 'Serviços continuados de monitoramento eletrônico para o GSASP',
      tipoOrigem: 'Pregão Eletrônico nº 12/2026',
      valor: 480000,
      valorNaoAplicavel: false,
      vigenciaInicio: '2026-05-01',
      vigenciaFim: '2027-05-01',
      vigenciaNaoAplicavel: false,
      regimeJuridico: 'Lei nº 14.133/2021',
      contratadoNaoAplicavel: false
    });

    setPertinenciaAtiva({
      conclusao: 'PERTINENTE',
      justificativa: 'Atendimento integral ao plano estratégico da SESP-MT.',
      alinhamentoEstrategico: 'SIM',
      motivoAusente: 'NAO',
      acaoContinua: 'SIM',
      atendeNecessidade: 'SIM',
      riscoDescontinuidade: 'SIM',
      validada: true,
      validacaoHumana: {
        validadoPor: 'Assessor Técnico João',
        dataHora: '2026-09-30T14:00:00.000Z',
        papel: 'assessor',
        observacoes: 'Pertinência homologada'
      },
      respostas: {
        competenciaNecessidade: true,
        vinculoPlanejamento: true,
        beneficioInteressePublico: true,
        custoProporcionalidade: true,
        economicidade: true
      },
      evidencias: 'Estudo Técnico Preliminar e Despacho GSASP nº 10/2026',
      providencia: 'Prosseguir com a instrução'
    });

    const checklist: ItemChecklist[] = [
      { id: 'chk-01', categoria: 'JURIDICA', descricao: 'Estudo Técnico Preliminar', status: 'ok', obrigatorio: true },
      { id: 'chk-02', categoria: 'FISCAL', descricao: 'Certidão Negativa de Débitos', status: 'ok', obrigatorio: true }
    ];
    setChecklistAtivo(checklist);

    const condicionantes: Condicionante[] = [
      { id: 'cnd-01', descricao: 'Comprovar dotação no exercício seguinte', situacao: 'atendida', referenciaParecer: 'Parecer PGE nº 200/2026', providencia: 'Declaração orçamentária', responsavel: 'Setor de Orçamento' }
    ];
    setCondicionantesAtivas(condicionantes);

    setAchadosAtivos([]);

    const riscos: Risco[] = [
      { dimensao: 'juridica', nivel: 'baixo', justificativa: 'Minuta-padrão PGE adotada sem alterações.', achadosRelacionados: [] },
      { dimensao: 'financeira', nivel: 'baixo', justificativa: 'Recursos assegurados.', achadosRelacionados: [] },
      { dimensao: 'operacional', nivel: 'baixo', justificativa: 'Capacidade técnica comprovada.', achadosRelacionados: [] },
      { dimensao: 'controle', nivel: 'baixo', justificativa: 'Controle interno sem ressalvas.', achadosRelacionados: [] }
    ];
    setRiscosAtivos(riscos);
  });

  test('A) #/resultado continua funcionando integralmente', () => {
    const htmlResultado = renderResultadoScreen();
    assert.ok(htmlResultado.includes('6. Resultado Executivo e Encaminhamento'));
    assert.ok(htmlResultado.includes('SESP-PRO-2026/00999'));
    assert.ok(htmlResultado.includes('1. Sugestão Indicativa do Sistema (Tabela de Decisão RN08)'));
    assert.ok(htmlResultado.includes('2. Manifestação e Homologação do Parecer Técnico pelo Assessor'));
    assert.ok(htmlResultado.includes('3. As Cinco Perguntas Executivas Centrais (RN09)'));
  });

  test('B) Botão "Visualizar Relatório Executivo" está presente na Etapa 6 e aponta para #/relatorio', () => {
    const htmlResultado = renderResultadoScreen();
    assert.ok(htmlResultado.includes('href="#/relatorio"'));
    assert.ok(htmlResultado.includes('id="btn-visualizar-relatorio"'));
    assert.ok(htmlResultado.includes('Visualizar Relatório Executivo'));
  });

  test('C) Relatório Executivo renderiza com estrutura institucional e banner de protótipo', () => {
    const htmlRelatorio = renderRelatorioScreen();
    // Banner ostensivo didático e cabeçalho autorizado
    assert.ok(htmlRelatorio.includes('PROTÓTIPO DIDÁTICO — DADOS FICTÍCIOS'));
    assert.ok(htmlRelatorio.includes('AVISO DE GOVERNANÇA'));
    assert.ok(htmlRelatorio.includes('RELATÓRIO EXECUTIVO DE CONFORMIDADE E APOIO À DECISÃO'));
    assert.ok(htmlRelatorio.includes('GSASP / SESP-MT'));
    assert.ok(htmlRelatorio.includes('Sistema de Conformidade e Apoio à Decisão'));
    assert.ok(htmlRelatorio.includes('CONFORMA GSASP — Protótipo Didático — Dados Fictícios'));
    // Seções I a VIII
    assert.ok(htmlRelatorio.includes('I — IDENTIFICAÇÃO DA INSTRUÇÃO'));
    assert.ok(htmlRelatorio.includes('II — PERTINÊNCIA INSTITUCIONAL'));
    assert.ok(htmlRelatorio.includes('III — CONFORMIDADE DOCUMENTAL E JURÍDICA'));
    assert.ok(htmlRelatorio.includes('IV — APONTAMENTO DE ACHADOS'));
    assert.ok(htmlRelatorio.includes('V — MATRIZ DE AVALIAÇÃO DE RISCOS'));
    assert.ok(htmlRelatorio.includes('VI — CONCLUSÃO EXECUTIVA E ENCAMINHAMENTO'));
    assert.ok(htmlRelatorio.includes('VII — AS CINCO PERGUNTAS EXECUTIVAS CENTRAIS (RN09)'));
    assert.ok(htmlRelatorio.includes('VIII — SALVAGUARDAS NORMATIVAS E INSTITUCIONAIS DA SESP-MT'));
  });

  test('D) Controles de navegação do relatório: link para #/resultado e botão de impressão', () => {
    const htmlRelatorio = renderRelatorioScreen();
    // Botão de voltar
    assert.ok(htmlRelatorio.includes('href="#/resultado"'));
    assert.ok(htmlRelatorio.includes('id="btn-voltar-resultado"'));
    assert.ok(htmlRelatorio.includes('Voltar ao Resultado Executivo'));
    // Botão de impressão
    assert.ok(htmlRelatorio.includes('id="btn-imprimir-relatorio"'));
    assert.ok(htmlRelatorio.includes('Imprimir / Salvar como PDF'));
  });

  test('E) e F) Visualizar o relatório NÃO altera dados da análise nem aumenta o contador da auditoria local', () => {
    // Registra 2 eventos preliminares de controle
    registrarEventoLocal({
      acao: ACOES_AUDITORIA.CRIACAO_PROCESSO,
      entidade: 'Processo',
      registroId: 'SESP-PRO-2026/00999',
      descricao: 'Processo criado para teste'
    });
    registrarEventoLocal({
      acao: ACOES_AUDITORIA.AVALIACAO_PERTINENCIA,
      entidade: 'Pertinencia',
      registroId: 'SESP-PRO-2026/00999',
      descricao: 'Pertinência validada'
    });

    const totalEventosAntes = getEventosAtivos().length;
    assert.equal(totalEventosAntes, 2);

    const processoAntes = JSON.stringify(getProcessoAtivo());
    const pertinenciaAntes = JSON.stringify(getPertinenciaAtiva());
    const checklistAntes = JSON.stringify(getChecklistAtivo());
    const riscosAntes = JSON.stringify(getRiscosAtivos());
    const conclusaoAntes = getConclusaoValidada();

    // Renderiza o relatório múltiplas vezes
    renderRelatorioScreen();
    renderRelatorioScreen();
    obterDadosRelatorioExecutivo();

    // Verificação E: dados da análise permanecem rigorosamente idênticos
    assert.equal(JSON.stringify(getProcessoAtivo()), processoAntes);
    assert.equal(JSON.stringify(getPertinenciaAtiva()), pertinenciaAntes);
    assert.equal(JSON.stringify(getChecklistAtivo()), checklistAntes);
    assert.equal(JSON.stringify(getRiscosAtivos()), riscosAntes);
    assert.equal(getConclusaoValidada(), conclusaoAntes);

    // Verificação F: contador de eventos da auditoria permanece rigorosamente idêntico
    const totalEventosDepois = getEventosAtivos().length;
    assert.equal(totalEventosDepois, totalEventosAntes);
  });

  test('G) Perfis Leitor e Aprovador conseguem visualizar o relatório e o botão de acesso', () => {
    // Perfil Leitor
    setPapelAtivo('leitor');
    const htmlResultadoLeitor = renderResultadoScreen();
    assert.ok(htmlResultadoLeitor.includes('href="#/relatorio"'));
    const htmlRelatorioLeitor = renderRelatorioScreen();
    assert.ok(htmlRelatorioLeitor.includes('RELATÓRIO EXECUTIVO DE CONFORMIDADE E APOIO À DECISÃO'));

    // Perfil Aprovador
    setPapelAtivo('aprovador');
    const htmlResultadoAprovador = renderResultadoScreen();
    assert.ok(htmlResultadoAprovador.includes('href="#/relatorio"'));
    const htmlRelatorioAprovador = renderRelatorioScreen();
    assert.ok(htmlRelatorioAprovador.includes('RELATÓRIO EXECUTIVO DE CONFORMIDADE E APOIO À DECISÃO'));
  });

  test('H) Nenhuma ação ou controle de homologação de parecer aparece no relatório', () => {
    const htmlRelatorio = renderRelatorioScreen();
    // Não pode conter formulário de homologação ou botões decisórios da máquina
    assert.notEqual(htmlRelatorio.includes('id="form-homologacao-conclusao"'), true);
    assert.notEqual(htmlRelatorio.includes('id="btn-adotar-sugestao-sistema"'), true);
    assert.notEqual(htmlRelatorio.includes('id="btn-homologar-conclusao"'), true);
    assert.notEqual(htmlRelatorio.includes('id="btn-reabrir-conclusao"'), true);
    assert.notEqual(htmlRelatorio.includes('input type="radio" name="opcao-conclusao"'), true);
  });

  test('Fidelidade: 4 dimensões de risco são Jurídica, Financeira, Operacional e Controle; e 5 perguntas RN09 mantêm títulos oficiais', () => {
    const dados = obterDadosRelatorioExecutivo();
    // 4 dimensões
    const dimNomes = dados.riscos.dimensoes.map((d) => d.nome);
    assert.deepEqual(dimNomes, ['Jurídica', 'Financeira', 'Operacional', 'Controle']);

    // 5 perguntas RN09
    assert.equal(dados.perguntasRN09.pergunta1.pergunta, '1. Pode assinar?');
    assert.equal(dados.perguntasRN09.pergunta2.pergunta, '2. O que corrigir?');
    assert.equal(dados.perguntasRN09.pergunta3.pergunta, '3. Quem corrige?');
    assert.equal(dados.perguntasRN09.pergunta4.pergunta, '4. Retorna ao Gabinete?');
    assert.equal(dados.perguntasRN09.pergunta5.pergunta, '5. Exige nova análise jurídica?');

    // Ressalva formal
    const htmlRelatorio = renderRelatorioScreen();
    assert.ok(htmlRelatorio.includes('Este protótipo não realiza assinatura eletrônica nem substitui os sistemas oficiais de tramitação e subscrição.'));
  });
});
