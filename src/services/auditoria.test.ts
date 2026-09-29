import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  AVISO_AUDITORIA_LOCAL,
  ACOES_AUDITORIA,
  getEventosAtivos,
  setEventosAtivos,
  limparEventosAtivos,
  criarEventoLocal,
  registrarEventoLocal,
  formatarDataHoraEvento,
  obterMetadadosAcao,
  formatarAntesDepois,
  renderCardEvento,
  renderModalAuditoria
} from './auditoria.ts';
import { setPapelAtivo } from '../auth/papeis.ts';

describe('S3.5 — Trilha de Auditoria Local: Governança e Transparência', () => {
  it('contém aviso mandatório de governança sobre escopo local e ausência de inviolabilidade', () => {
    assert.ok(AVISO_AUDITORIA_LOCAL.includes('Histórico de eventos local e demonstrativo'));
    assert.ok(AVISO_AUDITORIA_LOCAL.includes('IndexedDB'));
    assert.ok(AVISO_AUDITORIA_LOCAL.includes('Não possuem garantia de inviolabilidade criptográfica'));
    assert.ok(AVISO_AUDITORIA_LOCAL.includes('SIGADOC/SEI'));
  });

  it('catálogo de ações padronizadas cobre ciclo de vida completo', () => {
    assert.equal(ACOES_AUDITORIA.SALVAMENTO_RASCUNHO, 'SALVAMENTO_RASCUNHO');
    assert.equal(ACOES_AUDITORIA.VALIDACAO_ACHADO, 'VALIDACAO_ACHADO');
    assert.equal(ACOES_AUDITORIA.ALTERACAO_CLASSIFICACAO_ACHADO, 'ALTERACAO_CLASSIFICACAO_ACHADO');
    assert.equal(ACOES_AUDITORIA.REJEICAO_ACHADO, 'REJEICAO_ACHADO');
    assert.equal(ACOES_AUDITORIA.REABERTURA_ACHADO, 'REABERTURA_ACHADO');
    assert.equal(ACOES_AUDITORIA.INCLUSAO_ACHADO_MANUAL, 'INCLUSAO_ACHADO_MANUAL');
    assert.equal(ACOES_AUDITORIA.EXCLUSAO_ACHADO_MANUAL, 'EXCLUSAO_ACHADO_MANUAL');
    assert.equal(ACOES_AUDITORIA.ATRIBUICAO_NIVEL_RISCO, 'ATRIBUICAO_NIVEL_RISCO');
    assert.equal(ACOES_AUDITORIA.VINCULACAO_ACHADO_RISCO, 'VINCULACAO_ACHADO_RISCO');
    assert.equal(ACOES_AUDITORIA.DESVINCULACAO_ACHADO_RISCO, 'DESVINCULACAO_ACHADO_RISCO');
    assert.equal(ACOES_AUDITORIA.TROCA_PAPEL, 'TROCA_PAPEL');
  });
});

describe('S3.5 — Trilha de Auditoria Local: Criação e Registro de Eventos', () => {
  beforeEach(() => {
    limparEventosAtivos();
    setPapelAtivo('assessor');
  });

  it('criarEventoLocal: constrói evento válido sem efeitos colaterais na lista ativa', () => {
    const evento = criarEventoLocal({
      acao: ACOES_AUDITORIA.VALIDACAO_ACHADO,
      entidade: 'Achado',
      registroId: 'achado-01',
      antesDepois: {
        antes: { estadoValidacao: 'SUGESTAO_SISTEMA' },
        depois: { estadoValidacao: 'VALIDADO', classificacao: 'FORMAL' }
      },
      descricao: 'Achado validado como FORMAL'
    });

    assert.ok(evento.id.startsWith('evt-'));
    assert.ok(evento.dataHora);
    assert.equal(evento.acao, ACOES_AUDITORIA.VALIDACAO_ACHADO);
    assert.equal(evento.entidade, 'Achado');
    assert.equal(evento.registroId, 'achado-01');
    assert.equal(evento.papel, 'assessor');
    assert.ok(evento.usuarioFicticio.includes('Assessor'));
    assert.deepEqual(evento.antesDepois, {
      antes: { estadoValidacao: 'SUGESTAO_SISTEMA' },
      depois: { estadoValidacao: 'VALIDADO', classificacao: 'FORMAL' }
    });

    // A lista ativa deve permanecer intocada
    assert.equal(getEventosAtivos().length, 0);
  });

  it('registrarEventoLocal: registra e acumula eventos na memória da análise', () => {
    assert.equal(getEventosAtivos().length, 0);

    const evt1 = registrarEventoLocal({
      acao: ACOES_AUDITORIA.VALIDACAO_ACHADO,
      entidade: 'Achado',
      registroId: 'reg-01',
      descricao: 'Validação 1'
    });

    const evt2 = registrarEventoLocal({
      acao: ACOES_AUDITORIA.ATRIBUICAO_NIVEL_RISCO,
      entidade: 'Risco',
      registroId: 'juridica',
      descricao: 'Risco Jurídico Moderado'
    });

    const lista = getEventosAtivos();
    assert.equal(lista.length, 2);
    assert.equal(lista[0].id, evt1.id);
    assert.equal(lista[1].id, evt2.id);
  });

  it('getEventosAtivos retorna cópia defensiva imutável', () => {
    registrarEventoLocal({
      acao: ACOES_AUDITORIA.SALVAMENTO_RASCUNHO,
      entidade: 'Analise',
      registroId: 'anl-01'
    });

    const lista1 = getEventosAtivos();
    lista1.pop(); // Altera cópia

    const lista2 = getEventosAtivos();
    assert.equal(lista2.length, 1);
  });

  it('setEventosAtivos e limparEventosAtivos restauram e redefinem o estado', () => {
    const eventosMock = [
      criarEventoLocal({ acao: 'TESTE_1', entidade: 'X', registroId: '1' }),
      criarEventoLocal({ acao: 'TESTE_2', entidade: 'Y', registroId: '2' })
    ];

    setEventosAtivos(eventosMock);
    assert.equal(getEventosAtivos().length, 2);

    limparEventosAtivos();
    assert.equal(getEventosAtivos().length, 0);
  });
});

describe('S3.5 — Trilha de Auditoria Local: Formatação e Apresentação', () => {
  it('formatarDataHoraEvento formata adequadamente timestamp ISO', () => {
    const formatada = formatarDataHoraEvento('2026-09-28T14:30:15.000Z');
    assert.ok(formatada.includes('28/09/2026'));
    assert.ok(formatada.includes('às'));

    // Resiliência para valores nulos ou inválidos
    assert.equal(formatarDataHoraEvento(''), 'Data não informada');
  });

  it('obterMetadadosAcao mapeia corretamente ações e provê fallback', () => {
    const metaValidacao = obterMetadadosAcao(ACOES_AUDITORIA.VALIDACAO_ACHADO);
    assert.equal(metaValidacao.titulo, 'Validação de Achado');
    assert.equal(metaValidacao.icone, '✅');
    assert.equal(metaValidacao.classeBadge, 'badge-audit-validate');

    const metaSalvar = obterMetadadosAcao(ACOES_AUDITORIA.SALVAMENTO_RASCUNHO);
    assert.equal(metaSalvar.titulo, 'Salvamento de Rascunho');
    assert.equal(metaSalvar.icone, '💾');

    const metaDesconhecido = obterMetadadosAcao('ACAO_CUSTOM_TESTE');
    assert.equal(metaDesconhecido.titulo, 'ACAO_CUSTOM_TESTE');
    assert.equal(metaDesconhecido.icone, '📌');
  });

  it('formatarAntesDepois serializa strings, primitivos e objetos JSON de forma legível', () => {
    const diff = formatarAntesDepois({
      antes: { nivel: 'baixo' },
      depois: { nivel: 'alto' }
    });

    assert.ok(diff.includes('Estado Anterior:'));
    assert.ok(diff.includes('Novo Estado:'));
    assert.ok(diff.includes('baixo'));
    assert.ok(diff.includes('alto'));

    // Quando não houver antesDepois
    assert.equal(formatarAntesDepois(undefined), '');
  });
});

describe('S3.5 — Trilha de Auditoria Local: Imutabilidade e Governança da Interface', () => {
  beforeEach(() => {
    limparEventosAtivos();
  });

  it('renderCardEvento: exibe metadados completos e NÃO possui botões de edição ou exclusão', () => {
    const evt = criarEventoLocal({
      acao: ACOES_AUDITORIA.REJEICAO_ACHADO,
      entidade: 'Achado',
      registroId: 'achado-03',
      antesDepois: {
        antes: { estadoValidacao: 'SUGESTAO_SISTEMA' },
        depois: { estadoValidacao: 'REJEITADO', justificativa: 'Condicionante já atendida em apenso' }
      },
      descricao: 'Achado rejeitado com justificativa do assessor'
    });

    const html = renderCardEvento(evt, 0);

    assert.ok(html.includes('Rejeição de Achado'));
    assert.ok(html.includes('achado-03'));
    assert.ok(html.includes('Achado rejeitado com justificativa do assessor'));
    assert.ok(html.includes('Inspecionar detalhes da alteração'));

    // CRITÉRIO DE ACEITE MANDATÓRIO: A interface NÃO oferece botões para apagar ou editar eventos
    assert.ok(!html.includes('btn-excluir'));
    assert.ok(!html.includes('btn-editar'));
    assert.ok(!html.includes('Excluir evento'));
    assert.ok(!html.includes('Apagar evento'));
    assert.ok(!html.includes('Remover evento'));
  });

  it('renderModalAuditoria: exibe aviso de governança, ordem mais recente no topo e bloqueio de edição', () => {
    const evt1 = criarEventoLocal({
      id: 'evt-1',
      acao: ACOES_AUDITORIA.SALVAMENTO_RASCUNHO,
      entidade: 'Analise',
      registroId: 'anl-1',
      descricao: 'Primeiro salvamento',
      dataHora: '2026-09-28T10:00:00.000Z'
    });

    const evt2 = criarEventoLocal({
      id: 'evt-2',
      acao: ACOES_AUDITORIA.VALIDACAO_ACHADO,
      entidade: 'Achado',
      registroId: 'reg-05',
      descricao: 'Validação posterior',
      dataHora: '2026-09-28T11:00:00.000Z'
    });

    setEventosAtivos([evt1, evt2]);

    const modalHtml = renderModalAuditoria();

    // 1. Exibição ostensiva do aviso de governança
    assert.ok(modalHtml.includes('Aviso de Governança — Trilha Local Demonstrativa'));
    assert.ok(modalHtml.includes(AVISO_AUDITORIA_LOCAL));

    // 2. Contador de eventos
    assert.ok(modalHtml.includes('2 evento(s) registrado(s)'));

    // 3. Ordem: o evento mais recente (evt2) deve aparecer ANTES do mais antigo (evt1)
    const posEvt2 = modalHtml.indexOf('evt-2');
    const posEvt1 = modalHtml.indexOf('evt-1');
    assert.ok(posEvt2 !== -1);
    assert.ok(posEvt1 !== -1);
    assert.ok(posEvt2 < posEvt1, 'O evento mais recente deve ser renderizado antes do mais antigo no feed');

    // 4. Sem controles para exclusão de eventos
    assert.ok(!modalHtml.includes('Excluir'));
    assert.ok(!modalHtml.includes('Apagar todos'));
    assert.ok(!modalHtml.includes('Limpar trilha'));
  });

  it('renderModalAuditoria: exibe estado vazio educativo quando nenhum evento foi registrado', () => {
    limparEventosAtivos();
    const modalHtml = renderModalAuditoria();
    assert.ok(modalHtml.includes('Nenhum evento registrado até o momento'));
    assert.ok(modalHtml.includes('0 evento(s) registrado(s)'));
  });
});
