/**
 * CONFORMA GSASP — Regras de Validação de Processo e Instrumento
 * Implementação da Tarefa S2.1 (Sprint 2)
 * Base: docs/contexto.md (RN01, RN13) e docs/sprint.md
 */

import type { Processo } from './tipos';

export interface ErroValidacaoCampo {
  campo: string;
  mensagem: string;
}

export interface ResultadoValidacaoProcesso {
  valido: boolean;
  erros: Record<string, string>;
  avisos: Record<string, string>;
}

/**
 * Formata um valor numérico em Reais (R$ 0.000,00).
 */
export function formatarMoeda(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return 'Não se aplica / Sem valor financeiro';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

/**
 * Formata uma data no formato ISO (YYYY-MM-DD) para exibição brasileira (DD/MM/AAAA).
 */
export function formatarDataBR(dataIso: string | null | undefined): string {
  if (!dataIso || !dataIso.trim()) return 'Não informada';
  const partes = dataIso.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataIso;
}

/**
 * Calcula aproximadamente a duração em dias e meses entre duas datas ISO.
 */
export function calcularDuracaoVigencia(inicio: string | null | undefined, fim: string | null | undefined): string {
  if (!inicio || !fim) return '';
  const dInicio = new Date(`${inicio}T00:00:00`);
  const dFim = new Date(`${fim}T00:00:00`);

  if (isNaN(dInicio.getTime()) || isNaN(dFim.getTime())) return '';
  if (dFim < dInicio) return '(Período cronologicamente invertido)';

  const diffMs = dFim.getTime() - dInicio.getTime();
  const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const mesesAprox = Math.round(diffDias / 30.4375);

  if (mesesAprox <= 1) {
    return `${diffDias} dia(s)`;
  }
  return `Aprox. ${mesesAprox} mês(es) (${diffDias} dias)`;
}

/**
 * Validação básica de formato de CNPJ fictício ou real.
 */
export function validarFormatoCNPJ(cnpj: string): boolean {
  if (!cnpj) return false;
  const limpo = cnpj.replace(/\D/g, '');
  return limpo.length === 14;
}

/**
 * Valida o preenchimento de um objeto Processo segundo as regras funcionais.
 * - RN01: Destacar e exigir elementos essenciais (objeto, tipoOrigem, valor, vigência).
 * - RN13: Problemas de preenchimento geram erro claro de formulário.
 * - Não aplicabilidade de valor e vigência tratadas explicitamente sem bloquear indevidamente.
 */
export function validarProcesso(processo: Partial<Processo>): ResultadoValidacaoProcesso {
  const erros: Record<string, string> = {};
  const avisos: Record<string, string> = {};

  // 1. Número do Processo (Obrigatório)
  if (!processo.numero || !processo.numero.trim()) {
    erros.numero = 'O número do processo é obrigatório (ex.: SESP-PRO-2026/00001).';
  }

  // 2. Instrumento Jurídico (Obrigatório)
  if (!processo.instrumento || !processo.instrumento.trim()) {
    erros.instrumento = 'O tipo de instrumento é obrigatório (ex.: Contrato Administrativo, Termo Aditivo).';
  }

  // 3. Objeto da Contratação (Elemento Essencial - RN01)
  if (!processo.objeto || !processo.objeto.trim()) {
    erros.objeto = 'O objeto da contratação é obrigatório (Elemento Essencial - RN01).';
  } else if (processo.objeto.trim().length < 10) {
    erros.objeto = 'O objeto deve ser descrito com clareza suficiente (mínimo de 10 caracteres).';
  }

  // 4. Tipo / Origem da Contratação (Elemento Essencial - RN01)
  if (!processo.tipoOrigem || !processo.tipoOrigem.trim()) {
    erros.tipoOrigem = 'O tipo/origem da contratação é obrigatório (Elemento Essencial - RN01).';
  }

  // 5. Regime Jurídico
  if (!processo.regimeJuridico || !processo.regimeJuridico.trim()) {
    erros.regimeJuridico = 'Selecione o regime jurídico aplicável (ex.: Lei nº 14.133/2021).';
  }

  // 6. Contratado / Parceiro e CNPJ
  const contratadoNaoAplicavel = Boolean(processo.contratadoNaoAplicavel);
  if (!contratadoNaoAplicavel) {
    if (!processo.contratado || !processo.contratado.trim()) {
      erros.contratado = 'Informe a razão social do contratado ou marque "Não aplicável".';
    }
    if (!processo.cnpj || !processo.cnpj.trim()) {
      erros.cnpj = 'Informe o CNPJ fictício do contratado ou marque "Não aplicável".';
    } else if (!validarFormatoCNPJ(processo.cnpj)) {
      erros.cnpj = 'CNPJ com formato incompleto (deve conter 14 dígitos, ex.: 00.000.000/0001-00).';
    }
  }

  // 7. Valor Financeiro (Elemento Essencial - RN01)
  const valorNaoAplicavel = Boolean(processo.valorNaoAplicavel);
  if (!valorNaoAplicavel) {
    if (processo.valor === null || processo.valor === undefined || isNaN(processo.valor)) {
      erros.valor = 'Informe o valor financeiro do instrumento ou marque "Não se aplica a este instrumento".';
    } else if (processo.valor < 0) {
      erros.valor = 'O valor financeiro não pode ser negativo.';
    } else if (processo.valor === 0) {
      // Conforme docs/contexto.md: valor zero é permitido mas gera aviso para confirmação
      avisos.valor = 'Instrumento registrado com valor financeiro zero (R$ 0,00).';
    }
  }

  // 8. Vigência e Prazos (Elemento Essencial - RN01 / RN13)
  const vigenciaNaoAplicavel = Boolean(processo.vigenciaNaoAplicavel);
  if (!vigenciaNaoAplicavel) {
    if (!processo.vigenciaInicio || !processo.vigenciaInicio.trim()) {
      erros.vigenciaInicio = 'A data de início da vigência é obrigatória ou marque "Não se aplica".';
    }
    if (!processo.vigenciaFim || !processo.vigenciaFim.trim()) {
      erros.vigenciaFim = 'A data de término da vigência é obrigatória ou marque "Não se aplica".';
    }

    // Validação de consistência cronológica (RN13)
    if (processo.vigenciaInicio && processo.vigenciaFim) {
      const dInicio = new Date(`${processo.vigenciaInicio}T00:00:00`);
      const dFim = new Date(`${processo.vigenciaFim}T00:00:00`);

      if (isNaN(dInicio.getTime())) {
        erros.vigenciaInicio = 'Data de início inválida.';
      }
      if (isNaN(dFim.getTime())) {
        erros.vigenciaFim = 'Data de término inválida.';
      }
      if (!isNaN(dInicio.getTime()) && !isNaN(dFim.getTime())) {
        if (dFim < dInicio) {
          erros.vigenciaFim = 'A data de término não pode ser anterior à data de início da vigência (RN13).';
        }
      }
    }
  }

  return {
    valido: Object.keys(erros).length === 0,
    erros,
    avisos
  };
}
