/**
 * CONFORMA GSASP — Testes Unitários dos Tipos e Contratos de Ingestão (S5.1.1)
 * Executado nativamente pelo Node.js test runner
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  confirmarCampo,
  editarCampo,
  rejeitarCampo,
  isRevisaoConcluida,
  converterMapaParaProcesso,
  criarCampoExtraido,
  criarCampoNaoLocalizado,
  type EvidenciaCampo,
  type CampoExtraido,
  type MapaCamposIdentificacao,
  type DossieIngestaoIdentificacao
} from './ingestao.ts';

function criarMapaExemplo(): MapaCamposIdentificacao {
  const evidencia1: EvidenciaCampo = {
    arquivoOrigem: 'minuta_aditivo.pdf',
    pagina: 1,
    trechoEvidencia: 'CLÁUSULA PRIMEIRA - DO OBJETO: Prestação de serviços de TI...'
  };

  const evidenciaValor: EvidenciaCampo = {
    arquivoOrigem: 'minuta_aditivo.pdf',
    pagina: 2,
    trechoEvidencia: 'CLÁUSULA QUINTA - DO VALOR: O valor global deste termo é de R$ 150.000,00'
  };

  return {
    numeroProcesso: criarCampoExtraido('numeroProcesso', 'Número do Processo', 'SESP-PRO-2026/00123', [evidencia1]),
    tipoInstrumento: criarCampoExtraido('tipoInstrumento', 'Tipo / Instrumento', 'Termo Aditivo', [evidencia1]),
    contratadoInteressado: criarCampoExtraido('contratadoInteressado', 'Contratado / Interessado', 'Tech Soluções Ltda', [evidencia1]),
    cnpjCpf: criarCampoExtraido('cnpjCpf', 'CNPJ / CPF', '12.345.678/0001-90', [evidencia1]),
    objeto: criarCampoExtraido('objeto', 'Objeto da Contratação', 'Prestação de serviços de suporte em TI', [evidencia1]),
    valor: criarCampoExtraido('valor', 'Valor Global', 150000, [evidenciaValor]),
    vigenciaInicio: criarCampoExtraido('vigenciaInicio', 'Vigência Inicial', '2026-04-01', [evidencia1]),
    vigenciaFim: criarCampoExtraido('vigenciaFim', 'Vigência Final', '2027-04-01', [evidencia1]),
    modalidadeOrigem: criarCampoExtraido('modalidadeOrigem', 'Modalidade / Origem', 'Pregão Eletrônico nº 05/2026', [evidencia1])
  };
}

test('1. confirmação sem mutação: deve gerar novo objeto e preservar original inalterado', () => {
  const original: CampoExtraido<string> = {
    campoId: 'objeto',
    rotulo: 'Objeto',
    valorSugerido: 'Reforma do telhado',
    estadoExtracao: 'localizado',
    estadoRevisao: 'pendente',
    evidencias: [{ arquivoOrigem: 'doc.pdf', pagina: 1, trechoEvidencia: 'Objeto: Reforma' }]
  };

  const resultado = confirmarCampo(original);

  assert.notStrictEqual(resultado, original, 'Deve retornar uma nova referência de objeto');
  assert.strictEqual(original.estadoRevisao, 'pendente', 'Original deve permanecer inalterado');
  assert.strictEqual(original.valorConfirmado, undefined, 'Original não deve ter valorConfirmado');
  assert.strictEqual(resultado.estadoRevisao, 'confirmado');
  assert.strictEqual(resultado.valorConfirmado, 'Reforma do telhado');
});

test('2. edição sem mutação: deve gerar novo objeto com novo valor e manter original', () => {
  const original: CampoExtraido<number | null> = {
    campoId: 'valor',
    rotulo: 'Valor',
    valorSugerido: 100000,
    estadoExtracao: 'localizado',
    estadoRevisao: 'pendente',
    evidencias: [{ arquivoOrigem: 'doc.pdf', pagina: 2, trechoEvidencia: 'R$ 100.000,00' }]
  };

  const resultado = editarCampo(original, 120000, 'Ajuste conforme aditamento');

  assert.notStrictEqual(resultado, original);
  assert.strictEqual(original.estadoRevisao, 'pendente');
  assert.strictEqual(original.valorConfirmado, undefined);
  assert.strictEqual(resultado.estadoRevisao, 'editado');
  assert.strictEqual(resultado.valorSugerido, 100000);
  assert.strictEqual(resultado.valorConfirmado, 120000);
  assert.strictEqual(resultado.justificativaEdicao, 'Ajuste conforme aditamento');
});

test('3. rejeição sem mutação: deve marcar rejeitado e não mutar original', () => {
  const original: CampoExtraido<string | null> = {
    campoId: 'cnpjCpf',
    rotulo: 'CNPJ',
    valorSugerido: '00.000.000/0000-00',
    estadoExtracao: 'localizado',
    estadoRevisao: 'pendente',
    evidencias: [{ arquivoOrigem: 'doc.pdf', pagina: 1, trechoEvidencia: 'CNPJ de teste' }]
  };

  const resultado = rejeitarCampo(original, 'CNPJ incorreto extraído de rodapé');

  assert.notStrictEqual(resultado, original);
  assert.strictEqual(original.estadoRevisao, 'pendente');
  assert.strictEqual(resultado.estadoRevisao, 'rejeitado');
  assert.strictEqual(resultado.valorConfirmado, undefined);
  assert.strictEqual(resultado.justificativaEdicao, 'CNPJ incorreto extraído de rodapé');
});

test('4. preservação de valorSugerido: confirmar, editar e rejeitar mantêm valorSugerido intacto', () => {
  const campo: CampoExtraido<string> = {
    campoId: 'numeroProcesso',
    rotulo: 'Processo',
    valorSugerido: 'SESP-2026/999',
    estadoExtracao: 'localizado',
    estadoRevisao: 'pendente',
    evidencias: []
  };

  const conf = confirmarCampo(campo);
  const edit = editarCampo(campo, 'SESP-2026/888');
  const rej = rejeitarCampo(campo);

  assert.strictEqual(conf.valorSugerido, 'SESP-2026/999');
  assert.strictEqual(edit.valorSugerido, 'SESP-2026/999');
  assert.strictEqual(rej.valorSugerido, 'SESP-2026/999');
});

test('5. preservação de múltiplas evidências: todas as evidências permanecem intactas', () => {
  const evidenciasMultiplas: EvidenciaCampo[] = [
    { arquivoOrigem: 'minuta.pdf', pagina: 1, trechoEvidencia: 'Cláusula 1.1: Trecho inicial' },
    { arquivoOrigem: 'minuta.pdf', pagina: 4, trechoEvidencia: 'Cláusula 9.2: Ratificação do termo' }
  ];

  const campo = criarCampoExtraido('objeto', 'Objeto', 'Serviço de Nuvem', evidenciasMultiplas);

  assert.strictEqual(campo.evidencias.length, 2);
  assert.strictEqual(campo.evidencias[0].pagina, 1);
  assert.strictEqual(campo.evidencias[1].pagina, 4);

  const editado = editarCampo(campo, 'Serviço de Nuvem Híbrida');
  assert.strictEqual(editado.evidencias.length, 2);
  assert.deepStrictEqual(editado.evidencias, evidenciasMultiplas);
  assert.notStrictEqual(editado.evidencias, campo.evidencias, 'Array de evidências deve ser nova referência');
});

test('6. aiRunId ausente em execução sem IA: pipeline determinístico não define aiRunId', () => {
  const dossieSemIA: DossieIngestaoIdentificacao = {
    id: 'dossie-01',
    executionId: 'exec-deterministic-100',
    nomeArquivo: 'minuta.pdf',
    tamanhoBytes: 204800,
    totalPaginas: 3,
    timestampCriacao: '2026-10-01T12:00:00Z',
    campos: criarMapaExemplo()
  };

  assert.strictEqual(dossieSemIA.aiRunId, undefined, 'aiRunId deve ser undefined em execução sem IA');
  assert.strictEqual(dossieSemIA.executionId, 'exec-deterministic-100');
});

test('7. executionId presente: obrigatório em qualquer dossiê de ingestão', () => {
  const dossieComIA: DossieIngestaoIdentificacao = {
    id: 'dossie-02',
    executionId: 'exec-ai-200',
    aiRunId: 'run-gemini-flash-01',
    nomeArquivo: 'minuta_complexa.pdf',
    tamanhoBytes: 512000,
    totalPaginas: 10,
    timestampCriacao: '2026-10-01T12:05:00Z',
    campos: criarMapaExemplo()
  };

  assert.ok(dossieComIA.executionId.length > 0);
  assert.strictEqual(dossieComIA.aiRunId, 'run-gemini-flash-01');
});

test('8. nao_localizado com evidências vazias: aceita valorSugerido null e array vazio', () => {
  const campo = criarCampoNaoLocalizado('cnpjCpf', 'CNPJ / CPF');

  assert.strictEqual(campo.estadoExtracao, 'nao_localizado');
  assert.strictEqual(campo.valorSugerido, null);
  assert.deepStrictEqual(campo.evidencias, []);
  assert.strictEqual(campo.estadoRevisao, 'pendente');
});

test('9. nao_localizado ainda pendente até deliberação humana: não assume conclusão automática', () => {
  const mapa = criarMapaExemplo();
  mapa.cnpjCpf = criarCampoNaoLocalizado('cnpjCpf', 'CNPJ / CPF');

  // Confirma todos os outros campos, mantendo cnpjCpf pendente
  mapa.numeroProcesso = confirmarCampo(mapa.numeroProcesso);
  mapa.tipoInstrumento = confirmarCampo(mapa.tipoInstrumento);
  mapa.contratadoInteressado = confirmarCampo(mapa.contratadoInteressado);
  mapa.objeto = confirmarCampo(mapa.objeto);
  mapa.valor = confirmarCampo(mapa.valor);
  mapa.vigenciaInicio = confirmarCampo(mapa.vigenciaInicio);
  mapa.vigenciaFim = confirmarCampo(mapa.vigenciaFim);
  mapa.modalidadeOrigem = confirmarCampo(mapa.modalidadeOrigem);

  assert.strictEqual(mapa.cnpjCpf.estadoExtracao, 'nao_localizado');
  assert.strictEqual(mapa.cnpjCpf.estadoRevisao, 'pendente');
  assert.strictEqual(isRevisaoConcluida(mapa), false, 'Revisão NÃO pode estar concluída se campo nao_localizado está pendente');
});

test('10. revisão concluída somente quando não existir campo pendente', () => {
  const mapa = criarMapaExemplo();

  // Inicialmente todos estão pendentes
  assert.strictEqual(isRevisaoConcluida(mapa), false);

  // Delibera sobre todos os campos com combinações de confirmado, editado e rejeitado
  mapa.numeroProcesso = confirmarCampo(mapa.numeroProcesso);
  mapa.tipoInstrumento = confirmarCampo(mapa.tipoInstrumento);
  mapa.contratadoInteressado = confirmarCampo(mapa.contratadoInteressado);
  mapa.cnpjCpf = rejeitarCampo(mapa.cnpjCpf, 'Sem CNPJ nesta minuta');
  mapa.objeto = editarCampo(mapa.objeto, 'Objeto corrigido pelo assessor');
  mapa.valor = confirmarCampo(mapa.valor);
  mapa.vigenciaInicio = confirmarCampo(mapa.vigenciaInicio);
  mapa.vigenciaFim = confirmarCampo(mapa.vigenciaFim);
  mapa.modalidadeOrigem = confirmarCampo(mapa.modalidadeOrigem);

  assert.strictEqual(isRevisaoConcluida(mapa), true, 'Revisão deve estar concluída quando nenhum campo for pendente');
});

test('11. campo rejeitado não sendo convertido para Processo', () => {
  const mapa = criarMapaExemplo();
  mapa.numeroProcesso = confirmarCampo(mapa.numeroProcesso);
  mapa.cnpjCpf = rejeitarCampo(mapa.cnpjCpf, 'Dado inconsistente descartado');

  const parcial = converterMapaParaProcesso(mapa);

  assert.strictEqual(parcial.numero, 'SESP-PRO-2026/00123');
  assert.strictEqual('cnpj' in parcial, false, 'Chave cnpj não deve constar em Processo quando rejeitada');
  assert.strictEqual(parcial.cnpj, undefined);
});

test('12. campo editado usando o valor humano na conversão', () => {
  const mapa = criarMapaExemplo();
  mapa.objeto = editarCampo(mapa.objeto, 'Manutenção preventiva e corretiva de datacenter');

  const parcial = converterMapaParaProcesso(mapa);

  assert.strictEqual(parcial.objeto, 'Manutenção preventiva e corretiva de datacenter');
  assert.notStrictEqual(parcial.objeto, mapa.objeto.valorSugerido);
});

test('13. campo confirmado usando o valor confirmado', () => {
  const mapa = criarMapaExemplo();
  mapa.valor = confirmarCampo(mapa.valor);

  const parcial = converterMapaParaProcesso(mapa);

  assert.strictEqual(parcial.valor, 150000);
});

test('14. serialização JSON sem perda dos dados essenciais', () => {
  const dossie: DossieIngestaoIdentificacao = {
    id: 'dos-123',
    executionId: 'exec-456',
    aiRunId: 'airun-789',
    nomeArquivo: 'minuta.pdf',
    tamanhoBytes: 1024,
    totalPaginas: 2,
    timestampCriacao: '2026-10-01T15:00:00.000Z',
    campos: criarMapaExemplo()
  };

  // Edita um campo e confirma outro antes de serializar
  dossie.campos.objeto = editarCampo(dossie.campos.objeto, 'Objeto revisado', 'Justificativa do assessor');
  dossie.campos.valor = confirmarCampo(dossie.campos.valor);

  const jsonString = JSON.stringify(dossie);
  const deserializado = JSON.parse(jsonString) as DossieIngestaoIdentificacao;

  assert.strictEqual(deserializado.id, 'dos-123');
  assert.strictEqual(deserializado.executionId, 'exec-456');
  assert.strictEqual(deserializado.aiRunId, 'airun-789');
  assert.strictEqual(deserializado.campos.objeto.estadoRevisao, 'editado');
  assert.strictEqual(deserializado.campos.objeto.valorConfirmado, 'Objeto revisado');
  assert.strictEqual(deserializado.campos.objeto.justificativaEdicao, 'Justificativa do assessor');
  assert.strictEqual(deserializado.campos.valor.estadoRevisao, 'confirmado');
  assert.strictEqual(deserializado.campos.valor.valorConfirmado, 150000);
  assert.strictEqual(deserializado.campos.numeroProcesso.evidencias[0].pagina, 1);
});
