/**
 * CONFORMA GSASP — Módulo de Papéis de Usuário e Permissões Simuladas
 * Implementação da Tarefa S2.5 (Sprint 2)
 * Base: docs/contexto.md (Seção 3) e docs/sprint.md
 * 
 * ESCLARECIMENTO DE NOMENCLATURA:
 * Em docs/contexto.md (Seção 3), os quatro papéis documentados são:
 * 1. Administrador (Configurações da demonstração e dados fictícios)
 * 2. Editor/Assessor (Preencher, revisar evidências, validar achados e conclusão técnica)
 * 3. Leitor (Consultar análise demonstrativa; não altera nem valida)
 * 4. Aprovador (Consultar resultado executivo e simular encaminhamento)
 * 
 * CORRESPONDÊNCIA COM "VALIDADOR":
 * Em algumas referências rápidas e discussões técnicas da Sprint 2, o papel do
 * Secretário Adjunto / Autoridade Decisora ou do Revisor que homologa o documento
 * final foi informalmente mencionado como "Validador".
 * No sistema, o papel "Aprovador" corresponde exatamente a essa figura de
 * apreciação e validação do resultado executivo (sem assinatura eletrônica real),
 * enquanto o "Editor/Assessor" executa a validação técnica da conformidade.
 * O sistema suporta ambas as referências de forma harmonizada.
 * 
 * SALVAGUARDA DE SIMULAÇÃO (docs/contexto.md, Seção 3):
 * O seletor "Ver como" apenas simula papéis no navegador para demonstração das telas.
 * NÃO constitui autenticação institucional, autorização de segurança corporativa
 * ou assinatura eletrônica real.
 */

export type PapelUsuario = 'administrador' | 'assessor' | 'leitor' | 'aprovador';

export interface PermissoesPapel {
  /** Permite editar campos de texto, preencher formulários e alterar respostas */
  podeEditar: boolean;
  /** Permite adicionar e excluir novos itens de checklist e condicionantes */
  podeAdicionarRemoverItens: boolean;
  /** Permite carregar cenários didáticos pré-definidos */
  podeCarregarCenarios: boolean;
  /** Permite salvar rascunhos locais no IndexedDB */
  podeSalvarRascunho: boolean;
  /** Permite navegar livremente pelas etapas para visualização */
  podeNavegar: boolean;
  /** Permite validar formalmente conclusões técnicas (Pertinência/Resultado) */
  podeValidarConclusao: boolean;
}

export interface InfoPapel {
  id: PapelUsuario;
  nome: string;
  rotuloCurto: string;
  descricaoUso: string;
  limiteAtuacao: string;
  permissoes: PermissoesPapel;
}

export const AVISO_SIMULACAO_PAPEIS =
  '🎭 Simulação Didática de Papéis: este seletor apenas demonstra como a interface e as ações se comportam ' +
  'para diferentes usuários. Não constitui autenticação institucional nem controle de acesso corporativo.';

/**
 * Matriz de Permissões Oficial baseada na Seção 3 de docs/contexto.md
 */
export const MATRIZ_PAPEIS: Record<PapelUsuario, InfoPapel> = {
  administrador: {
    id: 'administrador',
    nome: 'Administrador da Demonstração',
    rotuloCurto: 'Administrador',
    descricaoUso: 'Configuração geral da demonstração, gerenciamento de dados fictícios e testes amplos.',
    limiteAtuacao: 'Ambiente didático; não recebe automaticamente competência decisória institucional.',
    permissoes: {
      podeEditar: true,
      podeAdicionarRemoverItens: true,
      podeCarregarCenarios: true,
      podeSalvarRascunho: true,
      podeNavegar: true,
      podeValidarConclusao: true
    }
  },
  assessor: {
    id: 'assessor',
    nome: 'Editor / Assessor do GSASP',
    rotuloCurto: 'Editor / Assessor',
    descricaoUso: 'Preenchimento dos elementos essenciais, avaliação da pertinência, conferência de checklist e condicionantes.',
    limiteAtuacao: 'Responsável pela instrução técnica; não substitui a autoridade competente para assinatura final.',
    permissoes: {
      podeEditar: true,
      podeAdicionarRemoverItens: true,
      podeCarregarCenarios: true,
      podeSalvarRascunho: true,
      podeNavegar: true,
      podeValidarConclusao: true
    }
  },
  aprovador: {
    id: 'aprovador',
    nome: 'Aprovador / Validador Executivo',
    rotuloCurto: 'Aprovador / Validador',
    descricaoUso: 'Apreciação executiva do processo, consulta de achados, riscos e simulação de encaminhamento.',
    limiteAtuacao: 'Consulta e simulação executiva; sem assinatura eletrônica nem aprovação real pelo protótipo.',
    permissoes: {
      podeEditar: false,
      podeAdicionarRemoverItens: false,
      podeCarregarCenarios: false,
      podeSalvarRascunho: false,
      podeNavegar: true,
      podeValidarConclusao: true
    }
  },
  leitor: {
    id: 'leitor',
    nome: 'Leitor (Somente Consulta)',
    rotuloCurto: 'Leitor',
    descricaoUso: 'Consulta livre a todas as etapas e relatórios da análise demonstrativa para auditoria ou acompanhamento.',
    limiteAtuacao: 'Modo estrito de leitura; todas as ações de edição, exclusão e alteração ficam bloqueadas.',
    permissoes: {
      podeEditar: false,
      podeAdicionarRemoverItens: false,
      podeCarregarCenarios: false,
      podeSalvarRascunho: false,
      podeNavegar: true,
      podeValidarConclusao: false
    }
  }
};

const CHAVE_STORAGE_PAPEL = 'conforma_gsasp_papel_ativo';

// Recupera papel persistido no navegador com suporte a PWA e inicialização offline
function recuperarPapelPersistido(): PapelUsuario {
  if (typeof window !== 'undefined') {
    try {
      const salvoLocal = window.localStorage?.getItem(CHAVE_STORAGE_PAPEL) as PapelUsuario | null;
      if (salvoLocal && MATRIZ_PAPEIS[salvoLocal]) {
        return salvoLocal;
      }
      const salvoSession = window.sessionStorage?.getItem(CHAVE_STORAGE_PAPEL) as PapelUsuario | null;
      if (salvoSession && MATRIZ_PAPEIS[salvoSession]) {
        return salvoSession;
      }
    } catch {
      // Ignora restrições de storage
    }
  }
  return 'assessor';
}

// Estado do papel ativo na sessão atual (inicia como Editor/Assessor, papel de trabalho padrão)
let papelAtivo: PapelUsuario = recuperarPapelPersistido();

/**
 * Retorna o papel de usuário ativo na sessão.
 */
export function getPapelAtivo(): PapelUsuario {
  return papelAtivo;
}

/**
 * Define o novo papel de usuário ativo na sessão.
 * Preserva integralmente todos os dados em memória e rascunhos.
 */
export function setPapelAtivo(novoPapel: PapelUsuario): void {
  if (MATRIZ_PAPEIS[novoPapel]) {
    papelAtivo = novoPapel;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage?.setItem(CHAVE_STORAGE_PAPEL, novoPapel);
        window.sessionStorage?.setItem(CHAVE_STORAGE_PAPEL, novoPapel);
      } catch {
        // Ignora
      }
    }
  }
}

/**
 * Retorna as informações completas do papel ativo.
 */
export function getInfoPapelAtivo(): InfoPapel {
  return MATRIZ_PAPEIS[papelAtivo];
}

/**
 * Retorna o conjunto de permissões do papel atualmente selecionado.
 */
export function getPermissoesAtivas(): PermissoesPapel {
  return MATRIZ_PAPEIS[papelAtivo].permissoes;
}

/**
 * Atalho booleano para verificar se o papel atual pode editar campos.
 */
export function podeEditar(): boolean {
  return MATRIZ_PAPEIS[papelAtivo].permissoes.podeEditar;
}

/**
 * Atalho booleano para verificar se o papel atual pode adicionar/remover itens.
 */
export function podeAdicionarRemoverItens(): boolean {
  return MATRIZ_PAPEIS[papelAtivo].permissoes.podeAdicionarRemoverItens;
}

/**
 * Atalho booleano para verificar se o papel atual pode carregar cenários didáticos.
 */
export function podeCarregarCenarios(): boolean {
  return MATRIZ_PAPEIS[papelAtivo].permissoes.podeCarregarCenarios;
}

/**
 * Atalho booleano para verificar se o papel atual pode salvar rascunhos.
 */
export function podeSalvarRascunho(): boolean {
  return MATRIZ_PAPEIS[papelAtivo].permissoes.podeSalvarRascunho;
}

/**
 * Atalho booleano para verificar se o papel atual pode validar conclusões.
 */
export function podeValidarConclusao(): boolean {
  return MATRIZ_PAPEIS[papelAtivo].permissoes.podeValidarConclusao;
}
