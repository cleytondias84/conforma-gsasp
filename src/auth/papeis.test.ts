/**
 * CONFORMA GSASP — Testes Unitários de Papéis e Permissões Simuladas (S2.5)
 * Executado nativamente pelo Node.js test runner
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MATRIZ_PAPEIS,
  getPapelAtivo,
  setPapelAtivo,
  getInfoPapelAtivo,
  getPermissoesAtivas,
  podeEditar,
  podeAdicionarRemoverItens,
  podeCarregarCenarios,
  podeSalvarRascunho,
  podeValidarConclusao,
  AVISO_SIMULACAO_PAPEIS
} from './papeis.ts';

test('papeis: matriz contém os 4 perfis documentados em docs/contexto.md', () => {
  const chaves = Object.keys(MATRIZ_PAPEIS);
  assert.equal(chaves.length, 4);
  assert.ok(MATRIZ_PAPEIS.administrador, 'Deve conter Administrador');
  assert.ok(MATRIZ_PAPEIS.assessor, 'Deve conter Editor/Assessor');
  assert.ok(MATRIZ_PAPEIS.aprovador, 'Deve conter Aprovador / Validador');
  assert.ok(MATRIZ_PAPEIS.leitor, 'Deve conter Leitor');

  // Verifica que todos têm descrições e limites explícitos
  chaves.forEach((k) => {
    const papel = MATRIZ_PAPEIS[k as keyof typeof MATRIZ_PAPEIS];
    assert.ok(papel.nome);
    assert.ok(papel.descricaoUso);
    assert.ok(papel.limiteAtuacao);
  });
});

test('papeis: perfil Leitor deve ter todas as ações de alteração bloqueadas', () => {
  setPapelAtivo('leitor');
  assert.equal(getPapelAtivo(), 'leitor');

  const perm = getPermissoesAtivas();
  assert.equal(perm.podeEditar, false, 'Leitor não pode editar campos');
  assert.equal(perm.podeAdicionarRemoverItens, false, 'Leitor não pode adicionar/remover itens');
  assert.equal(perm.podeCarregarCenarios, false, 'Leitor não pode carregar cenários');
  assert.equal(perm.podeSalvarRascunho, false, 'Leitor não pode salvar rascunhos');
  assert.equal(perm.podeValidarConclusao, false, 'Leitor não pode validar conclusões');
  assert.equal(perm.podeNavegar, true, 'Leitor deve poder navegar livremente para consultar');

  // Testando atalhos
  assert.equal(podeEditar(), false);
  assert.equal(podeAdicionarRemoverItens(), false);
  assert.equal(podeCarregarCenarios(), false);
  assert.equal(podeSalvarRascunho(), false);
  assert.equal(podeValidarConclusao(), false);
});

test('papeis: perfil Editor/Assessor tem permissões completas de edição e validação técnica', () => {
  setPapelAtivo('assessor');
  assert.equal(getPapelAtivo(), 'assessor');

  const perm = getPermissoesAtivas();
  assert.equal(perm.podeEditar, true);
  assert.equal(perm.podeAdicionarRemoverItens, true);
  assert.equal(perm.podeCarregarCenarios, true);
  assert.equal(perm.podeSalvarRascunho, true);
  assert.equal(perm.podeNavegar, true);
  assert.equal(perm.podeValidarConclusao, true);

  assert.equal(podeEditar(), true);
  assert.equal(podeSalvarRascunho(), true);
});

test('papeis: perfil Aprovador/Validador tem permissão de validação executiva e navegação sem edição direta', () => {
  setPapelAtivo('aprovador');
  assert.equal(getPapelAtivo(), 'aprovador');

  const perm = getPermissoesAtivas();
  assert.equal(perm.podeEditar, false, 'Aprovador não edita itens instrucionais');
  assert.equal(perm.podeAdicionarRemoverItens, false);
  assert.equal(perm.podeCarregarCenarios, false);
  assert.equal(perm.podeSalvarRascunho, false);
  assert.equal(perm.podeNavegar, true);
  assert.equal(perm.podeValidarConclusao, true, 'Aprovador pode validar ou simular encaminhamento executivo');
});

test('papeis: perfil Administrador possui permissões operacionais e de configuração', () => {
  setPapelAtivo('administrador');
  assert.equal(getPapelAtivo(), 'administrador');

  const perm = getPermissoesAtivas();
  assert.equal(perm.podeEditar, true);
  assert.equal(perm.podeCarregarCenarios, true);
  assert.equal(perm.podeSalvarRascunho, true);
  assert.equal(perm.podeNavegar, true);
});

test('papeis: troca de perfil preserva consistência e integridade das permissões', () => {
  // Começa como assessor
  setPapelAtivo('assessor');
  assert.equal(podeEditar(), true);

  // Troca para leitor
  setPapelAtivo('leitor');
  assert.equal(podeEditar(), false);
  assert.equal(getInfoPapelAtivo().rotuloCurto, 'Leitor');

  // Troca de volta para assessor
  setPapelAtivo('assessor');
  assert.equal(podeEditar(), true);
  assert.equal(getInfoPapelAtivo().rotuloCurto, 'Editor / Assessor');
});

test('papeis: aviso de simulação didática alerta ausência de controle real', () => {
  assert.ok(AVISO_SIMULACAO_PAPEIS.includes('Simulação Didática de Papéis'));
  assert.ok(AVISO_SIMULACAO_PAPEIS.includes('Não constitui autenticação institucional'));
});
