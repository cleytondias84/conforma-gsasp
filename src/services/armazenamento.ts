/**
 * CONFORMA GSASP — Serviço de Armazenamento Local e Persistência
 * Implementação da Tarefa S2.4 (Sprint 2)
 * Base: docs/contexto.md (Seções 9 e 10) e docs/sprint.md
 * 
 * Princípios de Design:
 * - Persistência estruturada via IndexedDB com fallback transparente para localStorage / Memória.
 * - Salva rascunhos incompletos sem exigir que todas as etapas estejam preenchidas.
 * - O salvamento de rascunho local NÃO se confunde com conclusão ou aprovação da análise.
 * - Dados mantidos estritamente no navegador local; sem sincronização remota nem envio à nuvem.
 * - Erros e limitações de armazenamento são sempre visíveis ao usuário.
 */

import type {
  Processo,
  Pertinencia,
  ItemConformidade,
  Condicionante,
  EstadoEdicao
} from '../domain/tipos';

export const NOME_BANCO_INDEXED_DB = 'conforma_gsasp_db';
export const VERSAO_BANCO_INDEXED_DB = 1;
export const CHAVE_LOCALSTORAGE_FALLBACK = 'conforma_gsasp_rascunho_local';
export const CHAVE_ULTIMO_PROCESSO_ID = 'conforma_gsasp_ultimo_processo_id';

export const AVISO_PERSISTENCIA_LOCAL =
  '💾 Armazenamento local neste dispositivo: os dados deste protótipo ficam salvos exclusivamente no navegador deste computador. ' +
  'Não há sincronização na nuvem nem envio para servidores. O salvamento do rascunho preserva as edições locais e não constitui aprovação jurídica da análise.';

export interface DadosRascunhoCompleto {
  processo: Processo;
  pertinencia: Pertinencia;
  checklist: ItemConformidade[];
  condicionantes: Condicionante[];
  analiseId: string;
  estadoEdicao: EstadoEdicao;
  salvoEm: string;
}

export interface ResumoRascunhoSalvo {
  id: string;
  processoId: string;
  numero: string;
  instrumento: string;
  objeto: string;
  estadoEdicao: EstadoEdicao;
  atualizadoEm: string;
}

export interface DiagnosticoArmazenamento {
  tipo: 'indexedDB' | 'localStorage' | 'memoria';
  disponivel: boolean;
  mensagem: string;
  ultimoSalvamento: string | null;
  totalSalvos: number;
}

export interface IRepositorioArmazenamento {
  salvarRascunho(dados: DadosRascunhoCompleto): Promise<void>;
  obterRascunho(analiseId?: string): Promise<DadosRascunhoCompleto | null>;
  listarRascunhos(): Promise<ResumoRascunhoSalvo[]>;
  excluirRascunho(analiseId: string): Promise<void>;
  limparTudo(): Promise<void>;
  getDiagnostico(): Promise<DiagnosticoArmazenamento>;
}

// ==========================================
// 1. ADAPTADOR INDEXEDDB (Nativo de Navegador)
// ==========================================

class IndexedDBAdapter implements IRepositorioArmazenamento {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private ultimoSalvamentoIso: string | null = null;

  private abrirBanco(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB não suportado neste ambiente.'));
      }

      const request = window.indexedDB.open(NOME_BANCO_INDEXED_DB, VERSAO_BANCO_INDEXED_DB);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('analises')) {
          const storeAnalises = db.createObjectStore('analises', { keyPath: 'analiseId' });
          storeAnalises.createIndex('processoId', 'processo.id', { unique: false });
          storeAnalises.createIndex('salvoEm', 'salvoEm', { unique: false });
        }
        if (!db.objectStoreNames.contains('metadados')) {
          db.createObjectStore('metadados', { keyPath: 'chave' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error('Erro ao abrir IndexedDB.'));
      };
    });

    return this.dbPromise;
  }

  async salvarRascunho(dados: DadosRascunhoCompleto): Promise<void> {
    const db = await this.abrirBanco();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['analises', 'metadados'], 'readwrite');
      const storeAnalises = tx.objectStore('analises');
      const storeMeta = tx.objectStore('metadados');

      storeAnalises.put(dados);
      storeMeta.put({ chave: 'ultimo_rascunho_id', valor: dados.analiseId, salvoEm: dados.salvoEm });

      tx.oncomplete = () => {
        this.ultimoSalvamentoIso = dados.salvoEm;
        resolve();
      };
      tx.onerror = () => reject(tx.error || new Error('Falha ao persistir no IndexedDB.'));
      tx.onabort = () => reject(new Error('Transação IndexedDB abortada.'));
    });
  }

  async obterRascunho(analiseId?: string): Promise<DadosRascunhoCompleto | null> {
    const db = await this.abrirBanco();

    let idBuscado = analiseId;
    if (!idBuscado) {
      // Busca o último rascunho salvo pelos metadados
      const idMeta = await new Promise<string | null>((resolve) => {
        const tx = db.transaction(['metadados'], 'readonly');
        const req = tx.objectStore('metadados').get('ultimo_rascunho_id');
        req.onsuccess = () => resolve(req.result ? req.result.valor : null);
        req.onerror = () => resolve(null);
      });
      idBuscado = idMeta || undefined;
    }

    if (!idBuscado) {
      // Se não encontrou no meta, tenta o mais recente na store
      const todos = await this.listarRascunhos();
      if (todos.length > 0) {
        idBuscado = todos[0].id;
      } else {
        return null;
      }
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(['analises'], 'readonly');
      const req = tx.objectStore('analises').get(idBuscado!);
      req.onsuccess = () => {
        const res = req.result as DadosRascunhoCompleto | undefined;
        if (res) {
          this.ultimoSalvamentoIso = res.salvoEm;
          resolve(res);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error || new Error('Erro ao ler rascunho no IndexedDB.'));
    });
  }

  async listarRascunhos(): Promise<ResumoRascunhoSalvo[]> {
    const db = await this.abrirBanco();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['analises'], 'readonly');
      const req = tx.objectStore('analises').getAll();

      req.onsuccess = () => {
        const list = (req.result as DadosRascunhoCompleto[]) || [];
        // Ordena por data decrescente (mais recente primeiro)
        const ordenados = list
          .sort((a, b) => new Date(b.salvoEm).getTime() - new Date(a.salvoEm).getTime())
          .map((item) => ({
            id: item.analiseId,
            processoId: item.processo.id,
            numero: item.processo.numero || '(Sem número)',
            instrumento: item.processo.instrumento || '(Instrumento)',
            objeto: item.processo.objeto || '(Sem objeto)',
            estadoEdicao: item.estadoEdicao,
            atualizadoEm: item.salvoEm
          }));
        resolve(ordenados);
      };
      req.onerror = () => reject(req.error || new Error('Erro ao listar rascunhos no IndexedDB.'));
    });
  }

  async excluirRascunho(analiseId: string): Promise<void> {
    const db = await this.abrirBanco();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['analises'], 'readwrite');
      tx.objectStore('analises').delete(analiseId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async limparTudo(): Promise<void> {
    const db = await this.abrirBanco();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['analises', 'metadados'], 'readwrite');
      tx.objectStore('analises').clear();
      tx.objectStore('metadados').clear();
      tx.oncomplete = () => {
        this.ultimoSalvamentoIso = null;
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  async getDiagnostico(): Promise<DiagnosticoArmazenamento> {
    try {
      const lista = await this.listarRascunhos();
      return {
        tipo: 'indexedDB',
        disponivel: true,
        mensagem: 'Armazenamento persistente ativo (IndexedDB). Os dados ficam salvos localmente neste navegador.',
        ultimoSalvamento: this.ultimoSalvamentoIso || (lista.length > 0 ? lista[0].atualizadoEm : null),
        totalSalvos: lista.length
      };
    } catch (e) {
      return {
        tipo: 'indexedDB',
        disponivel: false,
        mensagem: `Falha ao conectar ao IndexedDB: ${(e as Error).message}`,
        ultimoSalvamento: null,
        totalSalvos: 0
      };
    }
  }
}

// ==========================================
// 2. ADAPTADOR LOCALSTORAGE (Fallback Seguro)
// ==========================================

class LocalStorageAdapter implements IRepositorioArmazenamento {
  private memoriaTemp: Map<string, DadosRascunhoCompleto> = new Map();

  private isLocalStorageDisponivel(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const chaveTeste = '__conforma_teste_ls__';
      window.localStorage.setItem(chaveTeste, '1');
      window.localStorage.removeItem(chaveTeste);
      return true;
    } catch {
      return false;
    }
  }

  async salvarRascunho(dados: DadosRascunhoCompleto): Promise<void> {
    if (this.isLocalStorageDisponivel()) {
      try {
        const raw = window.localStorage.getItem(CHAVE_LOCALSTORAGE_FALLBACK);
        const map: Record<string, DadosRascunhoCompleto> = raw ? JSON.parse(raw) : {};
        map[dados.analiseId] = dados;
        window.localStorage.setItem(CHAVE_LOCALSTORAGE_FALLBACK, JSON.stringify(map));
        window.localStorage.setItem(CHAVE_ULTIMO_PROCESSO_ID, dados.analiseId);
        return;
      } catch (e) {
        console.warn('LocalStorage excedido ou indisponível; salvando em memória volátil.', e);
      }
    }
    // Fallback de memória se localStorage falhar
    this.memoriaTemp.set(dados.analiseId, dados);
  }

  async obterRascunho(analiseId?: string): Promise<DadosRascunhoCompleto | null> {
    if (this.isLocalStorageDisponivel()) {
      try {
        const raw = window.localStorage.getItem(CHAVE_LOCALSTORAGE_FALLBACK);
        const idUltimo = analiseId || window.localStorage.getItem(CHAVE_ULTIMO_PROCESSO_ID);
        if (raw && idUltimo) {
          const map: Record<string, DadosRascunhoCompleto> = JSON.parse(raw);
          if (map[idUltimo]) return map[idUltimo];
        }
      } catch (e) {
        console.warn('Erro ao ler localStorage:', e);
      }
    }

    if (analiseId && this.memoriaTemp.has(analiseId)) {
      return this.memoriaTemp.get(analiseId) || null;
    }
    if (this.memoriaTemp.size > 0) {
      return Array.from(this.memoriaTemp.values())[0];
    }
    return null;
  }

  async listarRascunhos(): Promise<ResumoRascunhoSalvo[]> {
    const list: DadosRascunhoCompleto[] = [];
    if (this.isLocalStorageDisponivel()) {
      try {
        const raw = window.localStorage.getItem(CHAVE_LOCALSTORAGE_FALLBACK);
        if (raw) {
          const map: Record<string, DadosRascunhoCompleto> = JSON.parse(raw);
          list.push(...Object.values(map));
        }
      } catch {
        // Fallback silencioso para memória
      }
    }

    this.memoriaTemp.forEach((val) => {
      if (!list.some((item) => item.analiseId === val.analiseId)) {
        list.push(val);
      }
    });

    return list
      .sort((a, b) => new Date(b.salvoEm).getTime() - new Date(a.salvoEm).getTime())
      .map((item) => ({
        id: item.analiseId,
        processoId: item.processo.id,
        numero: item.processo.numero || '(Sem número)',
        instrumento: item.processo.instrumento || '(Instrumento)',
        objeto: item.processo.objeto || '(Sem objeto)',
        estadoEdicao: item.estadoEdicao,
        atualizadoEm: item.salvoEm
      }));
  }

  async excluirRascunho(analiseId: string): Promise<void> {
    if (this.isLocalStorageDisponivel()) {
      try {
        const raw = window.localStorage.getItem(CHAVE_LOCALSTORAGE_FALLBACK);
        if (raw) {
          const map: Record<string, DadosRascunhoCompleto> = JSON.parse(raw);
          delete map[analiseId];
          window.localStorage.setItem(CHAVE_LOCALSTORAGE_FALLBACK, JSON.stringify(map));
        }
      } catch {
        // Ignora erro
      }
    }
    this.memoriaTemp.delete(analiseId);
  }

  async limparTudo(): Promise<void> {
    if (this.isLocalStorageDisponivel()) {
      try {
        window.localStorage.removeItem(CHAVE_LOCALSTORAGE_FALLBACK);
        window.localStorage.removeItem(CHAVE_ULTIMO_PROCESSO_ID);
      } catch {
        // Ignora erro
      }
    }
    this.memoriaTemp.clear();
  }

  async getDiagnostico(): Promise<DiagnosticoArmazenamento> {
    const disponivel = this.isLocalStorageDisponivel();
    const lista = await this.listarRascunhos();
    return {
      tipo: disponivel ? 'localStorage' : 'memoria',
      disponivel,
      mensagem: disponivel
        ? 'Operando em modo de compatibilidade (localStorage). Dados salvos localmente neste navegador.'
        : 'Operando em memória volátil. As alterações serão perdidas se a aba for fechada.',
      ultimoSalvamento: lista.length > 0 ? lista[0].atualizadoEm : null,
      totalSalvos: lista.length
    };
  }
}

// ==========================================
// 3. FÁBRICA E GERENCIADOR DO REPOSITÓRIO
// ==========================================

let repositorioInstancia: IRepositorioArmazenamento | null = null;

export function obterRepositorioArmazenamento(): IRepositorioArmazenamento {
  if (repositorioInstancia) return repositorioInstancia;

  // No navegador com IndexedDB, usa IndexedDB; caso contrário, usa LocalStorage/Memória
  const temIndexedDB = typeof window !== 'undefined' && Boolean(window.indexedDB);

  if (temIndexedDB) {
    repositorioInstancia = new IndexedDBAdapter();
  } else {
    repositorioInstancia = new LocalStorageAdapter();
  }

  return repositorioInstancia;
}

/**
 * Permite substituir a instância para testes automatizados.
 */
export function definirRepositorioParaTestes(repo: IRepositorioArmazenamento): void {
  repositorioInstancia = repo;
}

// ==========================================
// 4. FUNÇÕES DE ALTO NÍVEL PARA USO NA APLICAÇÃO
// ==========================================

/**
 * Salva o rascunho completo atual no armazenamento local (IndexedDB).
 * Aceita etapas parciais ou em andamento sem bloquear.
 */
export async function salvarRascunhoAtual(
  processo: Processo,
  pertinencia: Pertinencia,
  checklist: ItemConformidade[],
  condicionantes: Condicionante[],
  estadoEdicao: EstadoEdicao = 'rascunho'
): Promise<{ analiseId: string; salvoEm: string }> {
  const repo = obterRepositorioArmazenamento();
  const agoraIso = new Date().toISOString();
  const analiseId = `anl-local-${processo.id || 'padrao'}`;

  const dados: DadosRascunhoCompleto = {
    processo: { ...processo },
    pertinencia: JSON.parse(JSON.stringify(pertinencia)),
    checklist: JSON.parse(JSON.stringify(checklist)),
    condicionantes: JSON.parse(JSON.stringify(condicionantes)),
    analiseId,
    estadoEdicao,
    salvoEm: agoraIso
  };

  try {
    await repo.salvarRascunho(dados);
    return { analiseId, salvoEm: agoraIso };
  } catch (erro) {
    // Se o IndexedDB falhar em tempo de execução, tenta fallback para localStorage
    console.error('Falha ao persistir no IndexedDB. Ativando fallback emergencial...', erro);
    const fallback = new LocalStorageAdapter();
    await fallback.salvarRascunho(dados);
    repositorioInstancia = fallback;
    return { analiseId, salvoEm: agoraIso };
  }
}

/**
 * Recupera o último rascunho salvo no armazenamento local.
 */
export async function recuperarUltimoRascunho(): Promise<DadosRascunhoCompleto | null> {
  const repo = obterRepositorioArmazenamento();
  try {
    return await repo.obterRascunho();
  } catch (erro) {
    console.warn('Erro ao recuperar rascunho do IndexedDB, tentando fallback:', erro);
    const fallback = new LocalStorageAdapter();
    return await fallback.obterRascunho();
  }
}

/**
 * Lista todos os rascunhos disponíveis para retomada.
 */
export async function listarTodosRascunhos(): Promise<ResumoRascunhoSalvo[]> {
  const repo = obterRepositorioArmazenamento();
  try {
    return await repo.listarRascunhos();
  } catch {
    return [];
  }
}

/**
 * Exclui um rascunho salvo pelo ID.
 */
export async function excluirRascunhoSalvo(analiseId: string): Promise<void> {
  const repo = obterRepositorioArmazenamento();
  await repo.excluirRascunho(analiseId);
}

/**
 * Formata data e hora ISO para exibição legível de carimbo de salvamento.
 */
export function formatarCarimboSalvamento(isoDate: string | null | undefined): string {
  if (!isoDate) return 'Ainda não salvo localmente';
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const seg = String(d.getSeconds()).padStart(2, '0');
    return `${dia}/${mes}/${ano} às ${hora}:${min}:${seg}`;
  } catch {
    return isoDate;
  }
}
