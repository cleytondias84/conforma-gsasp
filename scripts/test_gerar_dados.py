"""
CONFORMA GSASP — Testes Unitários dos Dados Sintéticos (S1.4)
Base: docs/contexto.md, docs/sprint.md e src/domain/tipos.ts

Testa:
1. Determinismo e repetibilidade da geração.
2. Contagem e categorias dos cenários (2 regulares, 2 com pendências, 1 grave).
3. Unicidade de todos os identificadores (IDs de processos, análises, checklist, achados, condicionantes).
4. Integridade das referências cruzadas (processoId, achadosRelacionados).
5. Conformidade estrita com os tipos e enums modelados em src/domain/tipos.ts.
6. Ausência de dados reais e ausência de validação humana prévia (validacaoHumana=None, conclusaoValidada=None).
7. Verificação das inconsistências intencionais de cada cenário.
8. Geração e validação dos arquivos JSON em public/data/.
"""

import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Set
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from scripts.gerar_dados import (
    obter_todos_os_cenarios,
    exportar_arquivos_dados,
)

# Enums do domínio (espelhados estritamente de src/domain/tipos.ts)
ESTADOS_EDICAO = {"rascunho", "em_analise", "concluida"}
CONCLUSOES_TECNICAS = {
    "APTO_PARA_ASSINATURA",
    "APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA",
    "RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA",
    "NAO_RECOMENDAVEL_PARA_ASSINATURA",
}
CONCLUSOES_PERTINENCIA = {
    "PERTINENTE",
    "PERTINENTE_COM_JUSTIFICATIVA",
    "NAO_DEMONSTRADA",
    "NAO_PERTINENTE",
}
STATUS_CONFORMIDADE = {"ok", "pendente", "nao_aplicavel", "confirmar"}
SITUACOES_CONDICIONANTE = {"atendida", "pendente", "em_cumprimento", "nao_aplicavel"}
CLASSIFICACOES_ACHADO = {"IMPEDITIVO", "RELEVANTE", "FORMAL", "MELHORIA"}
ESTADOS_VALIDACAO_ACHADO = {"SUGESTAO_SISTEMA", "VALIDADO", "REJEITADO"}
DIMENSOES_RISCO = {"juridica", "financeira", "operacional", "controle"}
NIVEIS_RISCO = {"baixo", "moderado", "alto", "critico"}


@pytest.fixture
def cenarios() -> List[Dict[str, Any]]:
    return obter_todos_os_cenarios()


def test_determinismo_geracao():
    """Garante que sucessivas invocações produzem exatamente os mesmos dados byte a byte."""
    execucao_1 = obter_todos_os_cenarios()
    execucao_2 = obter_todos_os_cenarios()
    assert json.dumps(execucao_1, sort_keys=True) == json.dumps(execucao_2, sort_keys=True)


def test_cinco_cenarios_e_distribuicao_de_categorias(cenarios: List[Dict[str, Any]]):
    """Garante exatamente 5 cenários: 2 regulares, 2 com pendências e 1 com inconsistência grave."""
    assert len(cenarios) == 5

    categorias = [c["categoria"] for c in cenarios]
    assert categorias.count("regular") == 2
    assert categorias.count("pendencia") == 2
    assert categorias.count("grave") == 1


def test_unicidade_de_todos_os_identificadores(cenarios: List[Dict[str, Any]]):
    """Garante IDs únicos para processos, análises, itens de checklist, condicionantes e achados."""
    ids_cenarios: Set[str] = set()
    ids_processos: Set[str] = set()
    numeros_processos: Set[str] = set()
    ids_analises: Set[str] = set()
    ids_checklist: Set[str] = set()
    ids_condicionantes: Set[str] = set()
    ids_achados: Set[str] = set()

    for c in cenarios:
        assert c["id"] not in ids_cenarios, f"ID de cenário duplicado: {c['id']}"
        ids_cenarios.add(c["id"])

        proc = c["processo"]
        assert proc["id"] not in ids_processos, f"ID de processo duplicado: {proc['id']}"
        ids_processos.add(proc["id"])

        assert proc["numero"] not in numeros_processos, f"Número de processo duplicado: {proc['numero']}"
        numeros_processos.add(proc["numero"])

        anl = c["analise"]
        assert anl["id"] not in ids_analises, f"ID de análise duplicado: {anl['id']}"
        ids_analises.add(anl["id"])

        for item in anl["checklist"]:
            assert item["id"] not in ids_checklist, f"ID de checklist duplicado: {item['id']}"
            ids_checklist.add(item["id"])

        for cond in anl["condicionantes"]:
            assert cond["id"] not in ids_condicionantes, f"ID de condicionante duplicado: {cond['id']}"
            ids_condicionantes.add(cond["id"])

        for ach in anl["achados"]:
            assert ach["id"] not in ids_achados, f"ID de achado duplicado: {ach['id']}"
            ids_achados.add(ach["id"])


def test_integridade_das_referencias_cruzadas(cenarios: List[Dict[str, Any]]):
    """Garante que processoId aponta para o processo correto e que achadosRelacionados existem."""
    for c in cenarios:
        proc = c["processo"]
        anl = c["analise"]

        assert anl["processoId"] == proc["id"], (
            f"Na análise {anl['id']}, processoId '{anl['processoId']}' não coincide com '{proc['id']}'"
        )

        achados_ids_validos = {ach["id"] for ach in anl["achados"]}
        for r in anl["riscos"]:
            for ach_id in r["achadosRelacionados"]:
                assert ach_id in achados_ids_validos, (
                    f"Risco {r['dimensao']} na análise {anl['id']} referencia achado inexistente '{ach_id}'"
                )


def test_conformidade_com_enums_do_dominio(cenarios: List[Dict[str, Any]]):
    """Valida se todos os campos preenchidos pertencem estritamente aos tipos em src/domain/tipos.ts."""
    for c in cenarios:
        anl = c["analise"]

        assert anl["estadoEdicao"] in ESTADOS_EDICAO
        if anl["conclusaoIndicativa"] is not None:
            assert anl["conclusaoIndicativa"] in CONCLUSOES_TECNICAS

        pert = anl["pertinencia"]
        if pert["conclusao"] is not None:
            assert pert["conclusao"] in CONCLUSOES_PERTINENCIA

        for item in anl["checklist"]:
            assert item["status"] in STATUS_CONFORMIDADE

        for cond in anl["condicionantes"]:
            assert cond["situacao"] in SITUACOES_CONDICIONANTE

        for ach in anl["achados"]:
            assert ach["classificacao"] in CLASSIFICACOES_ACHADO
            assert ach["estadoValidacao"] in ESTADOS_VALIDACAO_ACHADO
            # Estrutura obrigatória RN03: evidência, regra, impacto, providência, responsável
            assert len(ach["evidencia"].strip()) > 0
            assert len(ach["regraOuMotivo"].strip()) > 0
            assert len(ach["impacto"].strip()) > 0
            assert len(ach["providencia"].strip()) > 0
            assert len(ach["responsavel"].strip()) > 0

        for r in anl["riscos"]:
            assert r["dimensao"] in DIMENSOES_RISCO
            assert r["nivel"] in NIVEIS_RISCO


def test_ausencia_de_validacao_humana_previa(cenarios: List[Dict[str, Any]]):
    """Garante que nenhum cenário presuma homologação ou validação humana não realizada."""
    for c in cenarios:
        anl = c["analise"]
        assert anl["conclusaoValidada"] is None, "conclusaoValidada deve ser None antes da revisão do assessor"
        assert anl["validacaoHumana"] is None, "validacaoHumana deve ser None antes da homologação real"

        for ach in anl["achados"]:
            assert ach["estadoValidacao"] == "SUGESTAO_SISTEMA", (
                f"Achado {ach['id']} deve ser 'SUGESTAO_SISTEMA' conforme RN05"
            )


def test_ausencia_de_dados_pessoais_reais_e_identificadores_ficticios(cenarios: List[Dict[str, Any]]):
    """Garante identificadores fictícios explícitos e ausência de CPFs ou documentos reais."""
    cpf_pattern = re.compile(r"\b\d{3}\.\d{3}\.\d{3}-\d{2}\b")

    for c in cenarios:
        dump = json.dumps(c, ensure_ascii=False)
        assert not cpf_pattern.search(dump), "Nenhum CPF deve estar presente nos dados sintéticos"

        proc = c["processo"]
        assert "Fictícia" in proc["contratado"] or "Fictício" in proc["contratado"], (
            f"Nome do contratado '{proc['contratado']}' deve conter indicação explícita de fictício"
        )
        assert proc["id"].startswith("proc-ficticio-")
        assert proc["numero"].startswith("SESP-PRO-2026/")


def test_inconsistencias_intencionais_cenario_3_pendencia(cenarios: List[Dict[str, Any]]):
    """Valida inconsistências documentadas no Cenário 3 (condicionante pendente de garantia)."""
    c3 = next(c for c in cenarios if c["id"] == "cenario_03_pendencia_condicionante")
    anl = c3["analise"]

    # Condicionante obrigatória pendente
    cond_pendentes = [cond for cond in anl["condicionantes"] if cond["situacao"] == "pendente"]
    assert len(cond_pendentes) >= 1
    assert any("garantia" in cond["descricao"].lower() for cond in cond_pendentes)

    # Checklist com pendência e confirmação
    status_checklist = {item["status"] for item in anl["checklist"]}
    assert "pendente" in status_checklist
    assert "confirmar" in status_checklist

    # Achados relevantes
    achados_relevantes = [a for a in anl["achados"] if a["classificacao"] == "RELEVANTE"]
    assert len(achados_relevantes) >= 1
    assert anl["conclusaoIndicativa"] == "RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA"


def test_inconsistencias_intencionais_cenario_4_pertinencia(cenarios: List[Dict[str, Any]]):
    """Valida inconsistências documentadas no Cenário 4 (pertinência institucional não demonstrada)."""
    c4 = next(c for c in cenarios if c["id"] == "cenario_04_pendencia_pertinencia")
    anl = c4["analise"]

    assert anl["pertinencia"]["conclusao"] == "NAO_DEMONSTRADA"
    assert anl["pertinencia"]["respostas"]["vinculoPlanejamento"] is False
    assert any(item["status"] == "pendente" for item in anl["checklist"])
    assert anl["conclusaoIndicativa"] == "RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA"


def test_inconsistencias_intencionais_cenario_5_grave(cenarios: List[Dict[str, Any]]):
    """Valida inconsistências graves documentadas no Cenário 5 (vigência invertida e parecer contrário)."""
    c5 = next(c for c in cenarios if c["id"] == "cenario_05_grave_vigencia_invalida")
    proc = c5["processo"]
    anl = c5["analise"]

    # Vigência cronologicamente invertida (fim anterior ao início)
    assert proc["vigenciaInicio"] is not None and proc["vigenciaFim"] is not None
    assert proc["vigenciaFim"] < proc["vigenciaInicio"], "No cenário grave, vigenciaFim deve ser anterior a vigenciaInicio"

    # Pertinência não pertinente
    assert anl["pertinencia"]["conclusao"] == "NAO_PERTINENTE"

    # Achados impeditivos
    achados_impeditivos = [a for a in anl["achados"] if a["classificacao"] == "IMPEDITIVO"]
    assert len(achados_impeditivos) >= 2

    # Riscos críticos
    riscos_criticos = [r for r in anl["riscos"] if r["nivel"] == "critico"]
    assert len(riscos_criticos) >= 2

    assert anl["conclusaoIndicativa"] == "NAO_RECOMENDAVEL_PARA_ASSINATURA"


def test_cenario_2_regular_com_valor_nao_aplicavel(cenarios: List[Dict[str, Any]]):
    """Valida o caso regular de termo aditivo com valor não aplicável e ressalva formal."""
    c2 = next(c for c in cenarios if c["id"] == "cenario_02_regular_aditivo")
    proc = c2["processo"]
    anl = c2["analise"]

    assert proc["valor"] is None
    assert proc["valorNaoAplicavel"] is True
    assert anl["conclusaoIndicativa"] == "APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA"
    assert any(a["classificacao"] == "FORMAL" for a in anl["achados"])


def test_exportacao_e_leitura_arquivos_json(tmp_path: Path):
    """Valida que a exportação gera todos os arquivos previstos e que são JSONs válidos."""
    arquivos = exportar_arquivos_dados(tmp_path)
    assert len(arquivos) == 7

    nomes_esperados = {
        "cenarios.json",
        "processos.json",
        "cenario_01_regular_aquisicao.json",
        "cenario_02_regular_aditivo.json",
        "cenario_03_pendencia_condicionante.json",
        "cenario_04_pendencia_pertinencia.json",
        "cenario_05_grave_vigencia_invalida.json",
    }
    assert {a.name for a in arquivos} == nomes_esperados

    for arq in arquivos:
        assert arq.exists()
        assert arq.stat().st_size > 0
        with open(arq, "r", encoding="utf-8") as f:
            conteudo = json.load(f)
            assert conteudo is not None
