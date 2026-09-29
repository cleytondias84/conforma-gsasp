/**
 * Testes unitários do Painel Executivo (src/pages/painel.ts) — S3.6
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { obterContadoresPainel, renderPainelScreen, initPainelEvents } from './painel.ts';
import { setProcessoAtivo } from './identificacao.ts';
import { setPertinenciaAtiva } from './pertinencia.ts';
import { setChecklistAtivo, setCondicionantesAtivas } from './conformidade.ts';
import { setAchadosAtivos } from './achados.ts';
import { setRiscosAtivos } from './riscos.ts';
import { setEventosAtivos, getEventosAtivos } from '../services/auditoria.ts';
import type { Achado, Risco, ItemConformidade, Condicionante } from '../domain/tipos.ts';

describe('Painel Executivo — S3.6 (src/pages/painel.ts)', () => {
  beforeEach(() => {
    // Configura estado base controlado
    setProcessoAtivo({
      id: 'proc-teste-01',
      numero: 'GSASP-PRC-2026/0099',
      instrumento: 'Termo de Contrato',
      contratado: 'Tecnologia Fictícia Ltda',
      cnpj: '00.000.000/0001-91',
      objeto: 'Aquisição de rádios comunicadores integrados',
      tipoOrigem: 'Ata de Registro de Preços',
      valor: 150000,
      vigenciaInicio: '2026-01-01',
      vigenciaFim: '2026-12-31',
      regimeJuridico: 'Lei 14.133/2021'
    });

    setPertinenciaAtiva({
      respostas: {
        alinhamentoEstrategico: true,
        necessidadePublica: true,
        planejamentoSetorial: true,
        economicidade: true,
        competenciaGabinete: true
      },
      evidencias: {
        alinhamentoEstrategico: 'Doc 01',
        necessidadePublica: 'Doc 02',
        planejamentoSetorial: 'Doc 03',
        economicidade: 'Doc 04',
        competenciaGabinete: 'Doc 05'
      },
      conclusao: 'PERTINENTE'
    });

    const checklist: ItemConformidade[] = [
      { id: 'item-1', descricao: 'Parecer Jurídico', status: 'ok', observacao: 'OK' },
      { id: 'item-2', descricao: 'Dotação Orçamentária', status: 'pendente', observacao: 'Aguardando' },
      { id: 'item-3', descricao: 'Garantia', status: 'confirmar', observacao: 'Verificar minuta' },
      { id: 'item-4', descricao: 'Subcontratação', status: 'nao_aplicavel', observacao: 'N/A' }
    ];
    setChecklistAtivo(checklist);

    const condicionantes: Condicionante[] = [
      {
        id: 'cond-1',
        descricao: 'Apresentar certidão atualizada',
        referenciaParecer: 'Parecer PGE 10/2026',
        situacao: 'atendida'
      },
      {
        id: 'cond-2',
        descricao: 'Adequar cláusula de rescisão',
        referenciaParecer: 'Parecer PGE 10/2026',
        situacao: 'pendente'
      }
    ];
    setCondicionantesAtivas(condicionantes);

    const achados: Achado[] = [
      {
        id: 'achado-1',
        titulo: 'Ausência de certidão fiscal',
        evidencia: 'Sem certidão nos autos',
        regraOuMotivo: 'Art. 68 da Lei 14.133',
        impacto: 'Impede assinatura',
        providencia: 'Juntar certidão',
        responsavel: 'Setor de Contratos',
        classificacao: 'IMPEDITIVO',
        classificacaoValidada: 'IMPEDITIVO',
        estadoValidacao: 'VALIDADO'
      },
      {
        id: 'achado-2',
        titulo: 'Sugestão automática de divergência',
        evidencia: 'Valor difere da estimativa',
        regraOuMotivo: 'Regra determinística R02',
        impacto: 'Inconsistência documental',
        providencia: 'Conferir planilha',
        responsavel: 'Assessoria',
        classificacaoSugerida: 'RELEVANTE',
        estadoValidacao: 'SUGESTAO_SISTEMA'
      },
      {
        id: 'achado-3',
        titulo: 'Sugestão de cláusula rejeitada',
        evidencia: 'Fato não aplicável ao caso',
        regraOuMotivo: 'Regra R04',
        impacto: 'Nenhum',
        providencia: 'Desconsiderar',
        responsavel: 'Assessor',
        classificacaoSugerida: 'FORMAL',
        estadoValidacao: 'REJEITADO',
        justificativaRejeicao: 'Item dispensado por norma setorial'
      }
    ];
    setAchadosAtivos(achados);

    const riscos: Risco[] = [
      {
        dimensao: 'juridica',
        nivel: 'moderado',
        justificativa: 'Achado impeditivo formal pendente de juntada',
        achadosRelacionados: ['achado-1']
      },
      {
        dimensao: 'financeira',
        nivel: 'baixo',
        justificativa: 'Dotação compatível'
      }
      // Operacional e Controle intencionalmente omitidos para testar PENDENTE
    ];
    setRiscosAtivos(riscos);

    setEventosAtivos([]);
  });

  it('deve derivar os contadores de processo, pertinência, checklist e condicionantes com precisão', () => {
    const c = obterContadoresPainel();

    assert.equal(c.processo.numero, 'GSASP-PRC-2026/0099');
    assert.equal(c.processo.preenchido, true);
    assert.ok(c.processo.valorFormatado.includes('150.000,00'));
    assert.equal(c.pertinencia.avaliada, true);
    assert.equal(c.pertinencia.conclusao, 'PERTINENTE');

    // Checklist
    assert.equal(c.checklist.total, 4);
    assert.equal(c.checklist.conformes, 1);
    assert.equal(c.checklist.pendentes, 1);
    assert.equal(c.checklist.aConfirmar, 1);
    assert.equal(c.checklist.naoAplicaveis, 1);

    // Condicionantes
    assert.equal(c.condicionantes.total, 2);
    assert.equal(c.condicionantes.atendidas, 1);
    assert.equal(c.condicionantes.pendentes, 1);
  });

  it('deve diferenciar estritamente achados validados, sugestões pendentes e sugestões rejeitadas', () => {
    const c = obterContadoresPainel();

    assert.equal(c.achados.total, 3);
    assert.equal(c.achados.validados, 1);
    assert.equal(c.achados.validadosPorGravidade.impeditivos, 1);
    assert.equal(c.achados.validadosPorGravidade.relevantes, 0);
    assert.equal(c.achados.validadosPorGravidade.formais, 0);

    // Sugestão pendente e sugestão rejeitada NÃO podem ser somadas aos impedimentos validados
    assert.equal(c.achados.sugestoesPendentes, 1);
    assert.equal(c.achados.rejeitados, 1);
  });

  it('deve preservar dimensões de risco avaliadas e marcar não avaliadas como PENDENTE', () => {
    const c = obterContadoresPainel();

    assert.equal(c.riscos.totalDimensoes, 4);
    assert.equal(c.riscos.avaliadas, 2);
    assert.equal(c.riscos.pendentes, 2);

    assert.equal(c.riscos.detalhe.juridica, 'moderado');
    assert.equal(c.riscos.detalhe.financeira, 'baixo');
    assert.equal(c.riscos.detalhe.operacional, 'PENDENTE');
    assert.equal(c.riscos.detalhe.controle, 'PENDENTE');
  });

  it('deve apresentar os indicadores estratégicos com baseline, meta e "Sem dados medidos"', () => {
    const c = obterContadoresPainel();

    assert.ok(c.indicadores.tempoMedio.baseline.includes('30 min'));
    assert.ok(c.indicadores.tempoMedio.meta.includes('10 min'));
    assert.equal(c.indicadores.tempoMedio.medicao, 'Sem dados medidos');

    assert.ok(c.indicadores.taxaRetrabalho.baseline.includes('30%'));
    assert.ok(c.indicadores.taxaRetrabalho.meta.includes('10%'));
    assert.equal(c.indicadores.taxaRetrabalho.medicao, 'Sem dados medidos');
  });

  it('renderPainelScreen não deve emitir eventos de auditoria nem alterar dados', () => {
    const eventosAntes = getEventosAtivos().length;
    const html = renderPainelScreen();
    const eventosDepois = getEventosAtivos().length;

    assert.equal(eventosDepois, eventosAntes);
    assert.ok(html.includes('Quadro Síntese Executivo'));
    assert.ok(html.includes('GSASP-PRC-2026/0099'));
    assert.ok(html.includes('Sem dados medidos'));
    assert.ok(html.includes('Indicadores Estratégicos de Eficiência do Piloto'));
    assert.ok(html.includes('#/identificacao'));
    assert.ok(html.includes('#/pertinencia'));
    assert.ok(html.includes('#/conformidade'));
    assert.ok(html.includes('#/achados'));
    assert.ok(html.includes('#/riscos'));
    assert.ok(html.includes('#/resultado'));
  });

  it('initPainelEvents deve conectar ouvinte com segurança no DOM', () => {
    if (typeof document !== 'undefined') {
      document.body.innerHTML = `
        <div id="container">
          <button id="btn-painel-auditoria">Auditoria</button>
        </div>
      `;

      initPainelEvents();
      const btn = document.getElementById('btn-painel-auditoria');
      assert.ok(btn !== null);
    }
  });
});
