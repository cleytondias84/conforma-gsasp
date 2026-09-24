"""
CONFORMA GSASP — Gerador de Dados Sintéticos e Cenários de Teste (S1.4)
Base: docs/contexto.md, docs/sprint.md e src/domain/tipos.ts

Este script gera dados 100% determinísticos e fictícios para testes e demonstração do protótipo.
Nenhum dado pessoal real, processo real, segredo ou fundamentação jurídica inventada é utilizado.
Nenhuma validação humana fictícia é pré-registrada (conclusaoValidada=None, validacaoHumana=None,
achados como SUGESTAO_SISTEMA).
"""

import json
from pathlib import Path
from typing import Any, Dict, List


def criar_cenario_1_regular_aquisicao() -> Dict[str, Any]:
    """
    Cenário 1 (Regular): Aquisição padrão de equipamentos de tecnologia da informação.
    Processo com requisitos documentais atendidos, pertinência demonstrada e condicionantes cumpridas.
    """
    processo = {
        "id": "proc-ficticio-01",
        "numero": "SESP-PRO-2026/00001",
        "instrumento": "Contrato Administrativo nº 01/2026",
        "contratado": "Alpha Tecnologia e Infraestrutura Fictícia Ltda.",
        "cnpj": "11.111.111/0001-11",
        "objeto": "Aquisição fictícia de estações de trabalho e equipamentos de rede para unidades de segurança pública.",
        "tipoOrigem": "Pregão Eletrônico nº 10/2026",
        "valor": 350000.00,
        "valorNaoAplicavel": False,
        "vigenciaInicio": "2026-03-01",
        "vigenciaFim": "2027-03-01",
        "vigenciaNaoAplicavel": False,
        "regimeJuridico": "Lei nº 14.133/2021",
    }

    pertinencia = {
        "respostas": {
            "competenciaNecessidade": True,
            "vinculoPlanejamento": True,
            "beneficioInteressePublico": True,
            "custoProporcionalidade": True,
            "economicidade": True,
        },
        "evidencias": "Documento Demonstrativo nº 01/2026: renovação do parque tecnológico das unidades operacionais prevista no plano de modernização setorial.",
        "justificativa": "Necessidade plenamente aderente aos objetivos estratégicos de modernização e aparelhamento institucional.",
        "conclusao": "PERTINENTE",
        "providencia": "Prosseguir com o trâmite regular para assinatura após conferência final.",
    }

    checklist = [
        {
            "id": "chk-01-01",
            "descricao": "Parecer Jurídico Conclusivo",
            "status": "ok",
            "observacao": "Parecer PGE Fictício nº 101/2026 favorável com recomendações formais.",
            "referenciaFonte": "Processo virtual - Peça 45",
        },
        {
            "id": "chk-01-02",
            "descricao": "Declaração de Dotação e Adequação Orçamentária",
            "status": "ok",
            "observacao": "Nota de Reserva Orçamentária nº 2026/001 anexada e atestada.",
            "referenciaFonte": "Peça 12",
        },
        {
            "id": "chk-01-03",
            "descricao": "Garantia Contratual",
            "status": "ok",
            "observacao": "Apólice de seguro-garantia devidamente apresentada e conferida.",
            "referenciaFonte": "Peça 50",
        },
        {
            "id": "chk-01-04",
            "descricao": "Designação de Gestor e Fiscal de Contrato",
            "status": "ok",
            "observacao": "Portaria Fictícia SESP nº 05/2026 publicada.",
            "referenciaFonte": "Peça 52",
        },
        {
            "id": "chk-01-05",
            "descricao": "Regularidade Fiscal, Trabalhista e Cadastral",
            "status": "ok",
            "observacao": "Certidões negativas válidas anexadas.",
            "referenciaFonte": "Peça 54",
        },
    ]

    condicionantes = [
        {
            "id": "cond-01-01",
            "descricao": "Juntada do comprovante de publicação do extrato editalício no Diário Oficial e portal de compras.",
            "referenciaParecer": "Parecer PGE nº 101/2026, item 14",
            "situacao": "atendida",
            "evidenciaAtendimento": "Comprovante de publicação anexado na folha 88.",
            "providencia": "Registrado nos autos.",
            "responsavel": "Comissão de Contratação",
        }
    ]

    achados = [
        {
            "id": "ach-01-01",
            "titulo": "Oportunidade de melhoria no fluxo de comunicação com o fornecedor",
            "evidencia": "Canal formal de comunicação não especificado de forma explícita na cláusula de notificações da minuta.",
            "regraOuMotivo": "Boas práticas de gestão e governança contratual.",
            "impacto": "Eventual atraso em intimações operacionais ou notificações rotineiras.",
            "providencia": "Recomendar inclusão de endereço eletrônico oficial da contratada no termo de ciência do fiscal.",
            "responsavel": "Fiscal do Contrato",
            "classificacao": "MELHORIA",
            "estadoValidacao": "SUGESTAO_SISTEMA",
        }
    ]

    riscos = [
        {
            "dimensao": "juridica",
            "nivel": "baixo",
            "justificativa": "Procedimento licitatório regular com respaldo integral do parecer jurídico.",
            "achadosRelacionados": [],
        },
        {
            "dimensao": "financeira",
            "nivel": "baixo",
            "justificativa": "Disponibilidade orçamentária atestada e garantia idônea aportada.",
            "achadosRelacionados": [],
        },
        {
            "dimensao": "operacional",
            "nivel": "baixo",
            "justificativa": "Fiscal e gestor designados com experiência prévia na fiscalização.",
            "achadosRelacionados": ["ach-01-01"],
        },
        {
            "dimensao": "controle",
            "nivel": "baixo",
            "justificativa": "Documentação completa e checklist 100% conferido.",
            "achadosRelacionados": [],
        },
    ]

    analise = {
        "id": "anl-ficticia-01",
        "processoId": "proc-ficticio-01",
        "estadoEdicao": "em_analise",
        "pertinencia": pertinencia,
        "checklist": checklist,
        "condicionantes": condicionantes,
        "achados": achados,
        "riscos": riscos,
        "conclusaoIndicativa": "APTO_PARA_ASSINATURA",
        "conclusaoValidada": None,
        "validacaoHumana": None,
        "datas": {
            "criacao": "2026-09-24T10:00:00Z",
            "atualizacao": "2026-09-24T10:30:00Z",
        },
    }

    return {
        "id": "cenario_01_regular_aquisicao",
        "nome": "Cenário 1 — Aquisição Regular de TI (Pregão)",
        "categoria": "regular",
        "descricao": "Processo de aquisição de equipamentos de TI com checklist integralmente conferido, pertinência confirmada e condicionantes do parecer jurídico atendidas.",
        "inconsistenciasIntencionais": [],
        "conclusaoEsperada": "APTO_PARA_ASSINATURA",
        "processo": processo,
        "analise": analise,
    }


def criar_cenario_2_regular_aditivo() -> Dict[str, Any]:
    """
    Cenário 2 (Regular com ressalva): Termo aditivo de prorrogação de prazo contratual de serviço contínuo sem acréscimo de valor.
    Valor não aplicável (apenas prorrogação temporal), apontamento formal não impeditivo registrado.
    """
    processo = {
        "id": "proc-ficticio-02",
        "numero": "SESP-PRO-2026/00002",
        "instrumento": "1º Termo Aditivo ao Contrato nº 12/2025",
        "contratado": "Beta Serviços e Manutenção Predial Fictícia Ltda.",
        "cnpj": "22.222.222/0001-22",
        "objeto": "Prorrogação da vigência por 12 meses do contrato de manutenção preventiva e corretiva predial continuada.",
        "tipoOrigem": "Termo Aditivo / Prorrogação de Serviço Contínuo",
        "valor": None,
        "valorNaoAplicavel": True,
        "vigenciaInicio": "2026-04-01",
        "vigenciaFim": "2027-04-01",
        "vigenciaNaoAplicavel": False,
        "regimeJuridico": "Lei nº 14.133/2021",
    }

    pertinencia = {
        "respostas": {
            "competenciaNecessidade": True,
            "vinculoPlanejamento": True,
            "beneficioInteressePublico": True,
            "custoProporcionalidade": True,
            "economicidade": True,
        },
        "evidencias": "Relatório de Fiscalização nº 08/2026 atestando vantajusidade da prorrogação e manutenção das condições contratuais favoráveis.",
        "justificativa": "Serviço essencial continuado com vantajosidade comprovada para a administração pública.",
        "conclusao": "PERTINENTE_COM_JUSTIFICATIVA",
        "providencia": "Submeter à assinatura com registro de ressalva quanto à revalidação de certidão anexa.",
    }

    checklist = [
        {
            "id": "chk-02-01",
            "descricao": "Parecer Jurídico Prévio da Prorrogação",
            "status": "ok",
            "observacao": "Parecer PGE Fictício nº 102/2026 aprovando a minuta do aditivo de prazo.",
            "referenciaFonte": "Peça 22",
        },
        {
            "id": "chk-02-02",
            "descricao": "Comprovação de Vantajosidade Econômica da Prorrogação",
            "status": "ok",
            "observacao": "Pesquisa de mercado demonstrando manutenção de preços vantajosos.",
            "referenciaFonte": "Peça 18",
        },
        {
            "id": "chk-02-03",
            "descricao": "Adequação Orçamentária Imediata",
            "status": "nao_aplicavel",
            "justificativaNaoAplicavel": "Termo aditivo restrito à dilatação temporal; dotação específica referente ao exercício já empenhada.",
            "referenciaFonte": "Despacho Financeiro Peça 20",
        },
        {
            "id": "chk-02-04",
            "descricao": "Regularidade Fiscal da Contratada",
            "status": "ok",
            "observacao": "Certidões vigentes na data da instrução.",
            "referenciaFonte": "Peça 25",
        },
    ]

    condicionantes = [
        {
            "id": "cond-02-01",
            "descricao": "Verificação de manutenção da regularidade fiscal e trabalhista na data exata da assinatura.",
            "referenciaParecer": "Parecer PGE nº 102/2026, item 9",
            "situacao": "em_cumprimento",
            "evidenciaAtendimento": "Certidões consultadas na emissão da minuta; nova extração programada para o ato de subscrição.",
            "providencia": "Fiscal deve juntar certidões atualizadas até 24h antes da assinatura.",
            "responsavel": "Gestor do Contrato",
        }
    ]

    achados = [
        {
            "id": "ach-02-01",
            "titulo": "Necessidade de atualização da apólice de seguro-garantia prorrogando o prazo de cobertura",
            "evidencia": "Endosso da garantia referente ao período estendido ainda não anexado (prazo de entrega previsto para até 10 dias após assinatura).",
            "regraOuMotivo": "Cláusula 12ª do Contrato Original nº 12/2025.",
            "impacto": "Garantia atual cobre até o término do período anterior; necessária juntada do endosso.",
            "providencia": "Condicionar o início da nova vigência à entrega do endosso da garantia pelo contratado.",
            "responsavel": "Fiscal de Contrato",
            "classificacao": "FORMAL",
            "estadoValidacao": "SUGESTAO_SISTEMA",
        }
    ]

    riscos = [
        {
            "dimensao": "juridica",
            "nivel": "baixo",
            "justificativa": "Prorrogação tempestiva dentro do prazo legal de vigência do contrato original.",
            "achadosRelacionados": [],
        },
        {
            "dimensao": "financeira",
            "nivel": "baixo",
            "justificativa": "Sem impacto de acréscimo orçamentário nesta prorrogação temporal.",
            "achadosRelacionados": [],
        },
        {
            "dimensao": "operacional",
            "nivel": "moderado",
            "justificativa": "Acompanhamento do endosso da apólice de garantia a ser juntado após a formalização.",
            "achadosRelacionados": ["ach-02-01"],
        },
        {
            "dimensao": "controle",
            "nivel": "baixo",
            "justificativa": "Processo instruído com antecedência de 60 dias ao vencimento original.",
            "achadosRelacionados": [],
        },
    ]

    analise = {
        "id": "anl-ficticia-02",
        "processoId": "proc-ficticio-02",
        "estadoEdicao": "em_analise",
        "pertinencia": pertinencia,
        "checklist": checklist,
        "condicionantes": condicionantes,
        "achados": achados,
        "riscos": riscos,
        "conclusaoIndicativa": "APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA",
        "conclusaoValidada": None,
        "validacaoHumana": None,
        "datas": {
            "criacao": "2026-09-24T11:00:00Z",
            "atualizacao": "2026-09-24T11:20:00Z",
        },
    }

    return {
        "id": "cenario_02_regular_aditivo",
        "nome": "Cenário 2 — Termo Aditivo de Prorrogação (Regular com Ressalva)",
        "categoria": "regular",
        "descricao": "Termo aditivo de dilatação de prazo contratual continuado sem acréscimo de valor, com valorNaoAplicavel=True e apontamento formal de endosso da garantia.",
        "inconsistenciasIntencionais": [],
        "conclusaoEsperada": "APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA",
        "processo": processo,
        "analise": analise,
    }


def criar_cenario_3_pendencia_condicionante() -> Dict[str, Any]:
    """
    Cenário 3 (Com pendências): Contratação com condicionante obrigatória de parecer pendente de atendimento e certidão com status 'confirmar'.
    Exige retorno para saneamento antes da assinatura.
    """
    processo = {
        "id": "proc-ficticio-03",
        "numero": "SESP-PRO-2026/00003",
        "instrumento": "Contrato Administrativo nº 03/2026",
        "contratado": "Gama Conservação e Limpeza Fictícia EIRELI",
        "cnpj": "33.333.333/0001-33",
        "objeto": "Prestação fictícia de serviços contínuos de limpeza, asseio e conservação predial nas dependências da SESP.",
        "tipoOrigem": "Pregão Eletrônico nº 05/2026",
        "valor": 520000.00,
        "valorNaoAplicavel": False,
        "vigenciaInicio": "2026-05-01",
        "vigenciaFim": "2027-05-01",
        "vigenciaNaoAplicavel": False,
        "regimeJuridico": "Lei nº 14.133/2021",
    }

    pertinencia = {
        "respostas": {
            "competenciaNecessidade": True,
            "vinculoPlanejamento": True,
            "beneficioInteressePublico": True,
            "custoProporcionalidade": True,
            "economicidade": True,
        },
        "evidencias": "Estudo Técnico Preliminar e mapa comparativo de preços anexados aos autos.",
        "justificativa": "Serviço de limpeza é indispensável à salubridade dos prédios administrativos e operacionais.",
        "conclusao": "PERTINENTE",
        "providencia": "Sanear pendências documentais antes de submeter ao Gabinete.",
    }

    checklist = [
        {
            "id": "chk-03-01",
            "descricao": "Parecer Jurídico Referencial",
            "status": "ok",
            "observacao": "Parecer PGE Fictício nº 103/2026 com 2 condicionantes expressas.",
            "referenciaFonte": "Peça 34",
        },
        {
            "id": "chk-03-02",
            "descricao": "Comprovante de Prestação de Garantia Contratual Prévia",
            "status": "pendente",
            "observacao": "Comprovante de caução ou apólice de seguro não localizado no dossiê de contratação.",
            "referenciaFonte": "Peça 40 (Ausente)",
        },
        {
            "id": "chk-03-03",
            "descricao": "Certidão Negativa de Débitos Trabalhistas (CNDT)",
            "status": "confirmar",
            "observacao": "Certidão juntada venceu há 2 dias da data da montagem do processo.",
            "referenciaFonte": "Peça 29",
        },
        {
            "id": "chk-03-04",
            "descricao": "Designação de Fiscal e Gestor",
            "status": "ok",
            "observacao": "Designação indicada no corpo da minuta contratual.",
            "referenciaFonte": "Cláusula 15ª",
        },
    ]

    condicionantes = [
        {
            "id": "cond-03-01",
            "descricao": "Apresentação da garantia da execução contratual no percentual de 5% antes da formalização da assinatura.",
            "referenciaParecer": "Parecer PGE nº 103/2026, item 21",
            "situacao": "pendente",
            "evidenciaAtendimento": "Empresa ainda não protocolou o instrumento de garantia.",
            "providencia": "Intimar o fornecedor para apresentar o comprovante de garantia em até 3 dias úteis.",
            "responsavel": "Setor de Contratos",
        },
        {
            "id": "cond-03-02",
            "descricao": "Atualização das certidões de regularidade com validade expirada.",
            "referenciaParecer": "Parecer PGE nº 103/2026, item 23",
            "situacao": "pendente",
            "evidenciaAtendimento": "CNDT vencida no processo virtual.",
            "providencia": "Emitir CNDT atualizada via sítio do TST e anexar aos autos.",
            "responsavel": "Setor de Licitações",
        },
    ]

    achados = [
        {
            "id": "ach-03-01",
            "titulo": "Garantia contratual indispensável ausente dos autos",
            "evidencia": "Parecer PGE nº 103/2026 fixou a prestação de garantia como condicionante prévia à assinatura; autos sem comprovante.",
            "regraOuMotivo": "Art. 96 da Lei nº 14.133/2021 e Parecer Jurídico PGE nº 103/2026.",
            "impacto": "Risco de desproteção do erário em caso de inadimplemento dos encargos contratuais e trabalhistas.",
            "providencia": "Retornar os autos ao Setor de Contratos para exigir e juntar o comprovante de garantia.",
            "responsavel": "Setor de Contratos",
            "classificacao": "RELEVANTE",
            "estadoValidacao": "SUGESTAO_SISTEMA",
        },
        {
            "id": "ach-03-02",
            "titulo": "Certidão de débitos trabalhistas com prazo de validade expirado",
            "evidencia": "CNDT anexada à Peça 29 expirou antes da fase de homologação final.",
            "regraOuMotivo": "Art. 68 da Lei nº 14.133/2021 (habilitação trabalhista obrigatória).",
            "impacto": "Impossibilidade de celebração de contrato com pessoa jurídica em débito trabalhista.",
            "providencia": "Extrair certidão atualizada e certificar nos autos.",
            "responsavel": "Setor de Licitações",
            "classificacao": "RELEVANTE",
            "estadoValidacao": "SUGESTAO_SISTEMA",
        },
    ]

    riscos = [
        {
            "dimensao": "juridica",
            "nivel": "alto",
            "justificativa": "Descumprimento de condicionantes expressas formuladas pelo órgão de assessoramento jurídico.",
            "achadosRelacionados": ["ach-03-01", "ach-03-02"],
        },
        {
            "dimensao": "financeira",
            "nivel": "moderado",
            "justificativa": "Risco financeiro mitigável após o aporte efetivo da caução contratual.",
            "achadosRelacionados": ["ach-03-01"],
        },
        {
            "dimensao": "operacional",
            "nivel": "baixo",
            "justificativa": "Objeto padronizado de rotina administrativa.",
            "achadosRelacionados": [],
        },
        {
            "dimensao": "controle",
            "nivel": "moderado",
            "justificativa": "Pendência de conformidade documental sujeita a apontamento pelos órgãos de controle.",
            "achadosRelacionados": ["ach-03-02"],
        },
    ]

    analise = {
        "id": "anl-ficticia-03",
        "processoId": "proc-ficticio-03",
        "estadoEdicao": "em_analise",
        "pertinencia": pertinencia,
        "checklist": checklist,
        "condicionantes": condicionantes,
        "achados": achados,
        "riscos": riscos,
        "conclusaoIndicativa": "RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA",
        "conclusaoValidada": None,
        "validacaoHumana": None,
        "datas": {
            "criacao": "2026-09-24T12:00:00Z",
            "atualizacao": "2026-09-24T12:45:00Z",
        },
    }

    return {
        "id": "cenario_03_pendencia_condicionante",
        "nome": "Cenário 3 — Pendência de Condicionante e Garantia Contratual",
        "categoria": "pendencia",
        "descricao": "Processo de serviços continuados com condicionante jurídica pendente (garantia ausente) e certidão vencida, inviabilizando assinatura antes de saneamento.",
        "inconsistenciasIntencionais": [
            "Condicionante cond-03-01 está com situação 'pendente'",
            "Item de checklist chk-03-02 (garantia) está com status 'pendente'",
            "Item de checklist chk-03-03 (CNDT) está com status 'confirmar'",
            "Dois achados classificados como 'RELEVANTE' pendentes de validação",
        ],
        "conclusaoEsperada": "RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA",
        "processo": processo,
        "analise": analise,
    }


def criar_cenario_4_pendencia_pertinencia() -> Dict[str, Any]:
    """
    Cenário 4 (Com pendências): Adesão a ata de registro de preços com pertinência institucional NÃO DEMONSTRADA e dotação orçamentária pendente de ateste.
    """
    processo = {
        "id": "proc-ficticio-04",
        "numero": "SESP-PRO-2026/00004",
        "instrumento": "Termo de Adesão à Ata de Registro de Preços nº 08/2026",
        "contratado": "Delta Softwares e Soluções Fictícias S/A",
        "cnpj": "44.444.444/0001-44",
        "objeto": "Adesão fictícia à ata de registro de preços para fornecimento de licenças de software de análise forense.",
        "tipoOrigem": "Adesão a Ata (Carona)",
        "valor": 890000.00,
        "valorNaoAplicavel": False,
        "vigenciaInicio": "2026-06-01",
        "vigenciaFim": "2027-06-01",
        "vigenciaNaoAplicavel": False,
        "regimeJuridico": "Lei nº 14.133/2021",
    }

    pertinencia = {
        "respostas": {
            "competenciaNecessidade": True,
            "vinculoPlanejamento": False,  # Inconsistência intencional
            "beneficioInteressePublico": None,  # Não avaliado
            "custoProporcionalidade": False,  # Inconsistência intencional
            "economicidade": None,
        },
        "evidencias": "Documentação enviada pela unidade demandante não correlaciona a quantidade solicitada às metas do plano anual.",
        "justificativa": "Não consta dos autos a demonstração de benefício institucional e compatibilidade de custos para a quantidade pleiteada.",
        "conclusao": "NAO_DEMONSTRADA",
        "providencia": "Requerer estudo de viabilidade e alinhamento com as metas operacionais da perícia técnica.",
    }

    checklist = [
        {
            "id": "chk-04-01",
            "descricao": "Estudo Técnico Preliminar e Demonstração da Vantajosidade da Adesão",
            "status": "pendente",
            "observacao": "Falta justificativa da vantagem econômica da adesão frente à contratação própria.",
            "referenciaFonte": "Peça 10 (Ausente)",
        },
        {
            "id": "chk-04-02",
            "descricao": "Declaração de Dotação e Adequação Orçamentária",
            "status": "pendente",
            "observacao": "Certidão orçamentária ainda não ratificada pela área de planejamento e orçamento.",
            "referenciaFonte": "Peça 15",
        },
        {
            "id": "chk-04-03",
            "descricao": "Autorização do Órgão Gerenciador da Ata",
            "status": "ok",
            "observacao": "Ofício de anuência do órgão gerenciador juntado.",
            "referenciaFonte": "Peça 18",
        },
    ]

    condicionantes = []

    achados = [
        {
            "id": "ach-04-01",
            "titulo": "Pertinência institucional não demonstrada nos autos",
            "evidencia": "Unidade solicitante não fundamentou a correlação entre as 50 licenças pedidas e o número de peritos ativos.",
            "regraOuMotivo": "RN02 (Conformidade GSASP) e princípios da economicidade e motivação dos atos administrativos.",
            "impacto": "Risco de aquisição ociosa ou sobredimensionada sem aproveitamento institucional correspondente.",
            "providencia": "Devolver à unidade técnica para dimensionar a real demanda e comprovar pertinência.",
            "responsavel": "Unidade Técnica Demandante",
            "classificacao": "RELEVANTE",
            "estadoValidacao": "SUGESTAO_SISTEMA",
        },
        {
            "id": "ach-04-02",
            "titulo": "Ausência de ateste de dotação orçamentária suficiente para o exercício",
            "evidencia": "Certidão da Secretaria de Fazenda/Orçamento com campo de saldo em aberto.",
            "regraOuMotivo": "Art. 16 da Lei Complementar nº 101/2000 (LRF).",
            "impacto": "Geração de obrigação financeira sem disponibilidade de crédito orçamentário.",
            "providencia": "Obter manifestação expressa da Unidade Setorial de Orçamento.",
            "responsavel": "Setor Orçamentário",
            "classificacao": "RELEVANTE",
            "estadoValidacao": "SUGESTAO_SISTEMA",
        },
    ]

    riscos = [
        {
            "dimensao": "juridica",
            "nivel": "moderado",
            "justificativa": "Falta de motivação suficiente do ato administrativo de adesão.",
            "achadosRelacionados": ["ach-04-01"],
        },
        {
            "dimensao": "financeira",
            "nivel": "alto",
            "justificativa": "Ausência de confirmação de dotação orçamentária regular e risco de comprometimento fiscal.",
            "achadosRelacionados": ["ach-04-02"],
        },
        {
            "dimensao": "operacional",
            "nivel": "alto",
            "justificativa": "Incerteza sobre a aplicabilidade prática das licenças adquiridas.",
            "achadosRelacionados": ["ach-04-01"],
        },
        {
            "dimensao": "controle",
            "nivel": "alto",
            "justificativa": "Adesões sem planejamento fundamentado configuram vulnerabilidade em auditorias.",
            "achadosRelacionados": ["ach-04-01", "ach-04-02"],
        },
    ]

    analise = {
        "id": "anl-ficticia-04",
        "processoId": "proc-ficticio-04",
        "estadoEdicao": "em_analise",
        "pertinencia": pertinencia,
        "checklist": checklist,
        "condicionantes": condicionantes,
        "achados": achados,
        "riscos": riscos,
        "conclusaoIndicativa": "RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA",
        "conclusaoValidada": None,
        "validacaoHumana": None,
        "datas": {
            "criacao": "2026-09-24T13:00:00Z",
            "atualizacao": "2026-09-24T13:30:00Z",
        },
    }

    return {
        "id": "cenario_04_pendencia_pertinencia",
        "nome": "Cenário 4 — Adesão a Ata com Pertinência Não Demonstrada",
        "categoria": "pendencia",
        "descricao": "Processo de adesão a ata de registro de preços com pertinência institucional 'NAO_DEMONSTRADA' e carência de reserva orçamentária atestada.",
        "inconsistenciasIntencionais": [
            "Pertinência com conclusao 'NAO_DEMONSTRADA'",
            "Respostas de pertinência com respostas falsas e nulas",
            "Checklist de dotação orçamentária chk-04-02 está com status 'pendente'",
            "Dois achados 'RELEVANTE' apontando falta de motivação e carência orçamentária",
        ],
        "conclusaoEsperada": "RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA",
        "processo": processo,
        "analise": analise,
    }


def criar_cenario_5_grave_vigencia_invalida() -> Dict[str, Any]:
    """
    Cenário 5 (Inconsistência grave): Processo com datas de vigência cronologicamente invertidas (fim anterior ao início),
    pertinência não pertinente e parecer jurídico contrário. Conclusão indicativa: NÃO RECOMENDÁVEL PARA ASSINATURA.
    """
    processo = {
        "id": "proc-ficticio-05",
        "numero": "SESP-PRO-2026/00005",
        "instrumento": "Contrato Administrativo nº 99/2026",
        "contratado": "Omega Equipamentos e Sistemas Fictícios ME",
        "cnpj": "55.555.555/0001-55",
        "objeto": "Locação fictícia emergencial de sistemas de monitoramento eletrônico.",
        "tipoOrigem": "Dispensa de Licitação Emergencial nº 02/2026",
        "valor": 1250000.00,
        "valorNaoAplicavel": False,
        "vigenciaInicio": "2026-08-01",  # Inconsistência grave: data posterior ao término
        "vigenciaFim": "2026-02-01",     # Inconsistência grave: término ANTERIOR ao início!
        "vigenciaNaoAplicavel": False,
        "regimeJuridico": "Lei nº 14.133/2021",
    }

    pertinencia = {
        "respostas": {
            "competenciaNecessidade": False,
            "vinculoPlanejamento": False,
            "beneficioInteressePublico": False,
            "custoProporcionalidade": False,
            "economicidade": False,
        },
        "evidencias": "Contratação emergencial solicitada sem comprovação de situação de calamidade pública ou emergência concreta no momento da instrução.",
        "justificativa": "Ausência manifesta dos pressupostos fáticos e jurídicos para contratação direta por dispensa emergencial.",
        "conclusao": "NAO_PERTINENTE",
        "providencia": "Recomendar à autoridade o não acolhimento da minuta de contrato.",
    }

    checklist = [
        {
            "id": "chk-05-01",
            "descricao": "Cronologia e Consistência da Vigência Contratual",
            "status": "pendente",
            "observacao": "Erro material grosseiro: término contratual fixado para 01/02/2026, anterior ao início previsto para 01/08/2026.",
            "referenciaFonte": "Cláusula 5ª da Minuta Contratual",
        },
        {
            "id": "chk-05-02",
            "descricao": "Parecer Jurídico Conclusivo",
            "status": "confirmar",
            "observacao": "Parecer PGE Fictício nº 999/2026 opinou contrariamente à celebração nos termos apresentados.",
            "referenciaFonte": "Peça 60",
        },
        {
            "id": "chk-05-03",
            "descricao": "Justificativa da Situação Emergencial",
            "status": "pendente",
            "observacao": "Não caracterizada a urgência que não decorra de desídia da unidade administrativa demandante.",
            "referenciaFonte": "Peça 15",
        },
    ]

    condicionantes = [
        {
            "id": "cond-05-01",
            "descricao": "Reformulação integral da minuta corrigindo datas e comprovando emergência sob pena de nulidade.",
            "referenciaParecer": "Parecer PGE nº 999/2026, item 35",
            "situacao": "pendente",
            "evidenciaAtendimento": "Minuta submetida com os mesmos vícios apontados.",
            "providencia": "Rejeitar a assinatura.",
            "responsavel": "Gabinete do Secretário",
        }
    ]

    achados = [
        {
            "id": "ach-05-01",
            "titulo": "Vigência cronologicamente invertida e ineficácia jurídica do instrumento",
            "evidencia": "Minuta contratual estipula vigênciaInicio em 01/08/2026 e vigenciaFim em 01/02/2026, sendo o término anterior ao início.",
            "regraOuMotivo": "Princípio da lógica temporal e eficácia dos negócios jurídicos (Código Civil e Lei nº 14.133/2021).",
            "impacto": "Nulidade do termo contratual por inviabilidade material de execução e retroatividade indevida.",
            "providencia": "Impedir a assinatura do instrumento na forma atual.",
            "responsavel": "Gabinete / Assessoria",
            "classificacao": "IMPEDITIVO",
            "estadoValidacao": "SUGESTAO_SISTEMA",
        },
        {
            "id": "ach-05-02",
            "titulo": "Parecer jurídico contrário à contratação emergencial",
            "evidencia": "Manifestação jurídica conclusiva pela não caracterização dos requisitos do art. 75, VIII, da Lei 14.133/2021.",
            "regraOuMotivo": "Art. 75, VIII, da Lei nº 14.133/2021 e Parecer PGE nº 999/2026.",
            "impacto": "Responsabilização pessoal da autoridade signatária perante o Tribunal de Contas por contratação direta indevida.",
            "providencia": "Encaminhar à autoridade recomendando expressamente a não assinatura.",
            "responsavel": "Secretário Adjunto",
            "classificacao": "IMPEDITIVO",
            "estadoValidacao": "SUGESTAO_SISTEMA",
        },
    ]

    riscos = [
        {
            "dimensao": "juridica",
            "nivel": "critico",
            "justificativa": "Vício insanável de temporariedade cumulado com parecer jurídico estritamente desfavorável.",
            "achadosRelacionados": ["ach-05-01", "ach-05-02"],
        },
        {
            "dimensao": "financeira",
            "nivel": "critico",
            "justificativa": "Comprometimento de R$ 1.250.000,00 sem respaldo da emergência alegada.",
            "achadosRelacionados": ["ach-05-02"],
        },
        {
            "dimensao": "operacional",
            "nivel": "alto",
            "justificativa": "Risco de paralisação e anulação do procedimento.",
            "achadosRelacionados": ["ach-05-01"],
        },
        {
            "dimensao": "controle",
            "nivel": "critico",
            "justificativa": "Apontamento sumário de irregularidade grave com potencial determinação de ressarcimento.",
            "achadosRelacionados": ["ach-05-01", "ach-05-02"],
        },
    ]

    analise = {
        "id": "anl-ficticia-05",
        "processoId": "proc-ficticio-05",
        "estadoEdicao": "em_analise",
        "pertinencia": pertinencia,
        "checklist": checklist,
        "condicionantes": condicionantes,
        "achados": achados,
        "riscos": riscos,
        "conclusaoIndicativa": "NAO_RECOMENDAVEL_PARA_ASSINATURA",
        "conclusaoValidada": None,
        "validacaoHumana": None,
        "datas": {
            "criacao": "2026-09-24T14:00:00Z",
            "atualizacao": "2026-09-24T14:40:00Z",
        },
    }

    return {
        "id": "cenario_05_grave_vigencia_invalida",
        "nome": "Cenário 5 — Inconsistência Grave (Vigência Invertida e Parecer Contrário)",
        "categoria": "grave",
        "descricao": "Processo com inconsistência cronológica grave na vigência (término anterior ao início), dispensa emergencial sem respaldo, pertinência 'NAO_PERTINENTE' e dois achados 'IMPEDITIVO'.",
        "inconsistenciasIntencionais": [
            "Vigência invertida: vigenciaFim ('2026-02-01') é anterior a vigenciaInicio ('2026-08-01')",
            "Pertinência com conclusao 'NAO_PERTINENTE' e todas respostas falsas",
            "Dois achados com classificacao 'IMPEDITIVO' (ach-05-01 e ach-05-02)",
            "Riscos jurídico, financeiro e de controle em nível 'critico'",
            "Conclusão indicativa 'NAO_RECOMENDAVEL_PARA_ASSINATURA'",
        ],
        "conclusaoEsperada": "NAO_RECOMENDAVEL_PARA_ASSINATURA",
        "processo": processo,
        "analise": analise,
    }


def obter_todos_os_cenarios() -> List[Dict[str, Any]]:
    """Retorna os 5 cenários sintéticos determinísticos ordenados."""
    return [
        criar_cenario_1_regular_aquisicao(),
        criar_cenario_2_regular_aditivo(),
        criar_cenario_3_pendencia_condicionante(),
        criar_cenario_4_pendencia_pertinencia(),
        criar_cenario_5_grave_vigencia_invalida(),
    ]


def exportar_arquivos_dados(diretorio_saida: Path) -> List[Path]:
    """
    Grava os cenários sintéticos no diretório public/data em formato JSON estruturado.
    Gera:
    - cenarios.json (todos os 5 cenários com metadados)
    - processos.json (índice dos processos para listagem rápida)
    - arquivos individuais para cada cenário
    """
    diretorio_saida.mkdir(parents=True, exist_ok=True)
    cenarios = obter_todos_os_cenarios()
    arquivos_gerados: List[Path] = []

    # 1. Arquivo principal com todos os cenários
    caminho_cenarios = diretorio_saida / "cenarios.json"
    with open(caminho_cenarios, "w", encoding="utf-8") as f:
        json.dump(cenarios, f, ensure_ascii=False, indent=2)
    arquivos_gerados.append(caminho_cenarios)

    # 2. Índice dos processos para consultas rápidas
    processos = [c["processo"] for c in cenarios]
    caminho_processos = diretorio_saida / "processos.json"
    with open(caminho_processos, "w", encoding="utf-8") as f:
        json.dump(processos, f, ensure_ascii=False, indent=2)
    arquivos_gerados.append(caminho_processos)

    # 3. Arquivo individual para cada cenário
    for cenario in cenarios:
        caminho_individual = diretorio_saida / f"{cenario['id']}.json"
        with open(caminho_individual, "w", encoding="utf-8") as f:
            json.dump(cenario, f, ensure_ascii=False, indent=2)
        arquivos_gerados.append(caminho_individual)

    return arquivos_gerados


def main() -> None:
    raiz_projeto = Path(__file__).resolve().parent.parent
    diretorio_dados = raiz_projeto / "public" / "data"

    print(f"Gerando dados sintéticos em: {diretorio_dados}")
    arquivos = exportar_arquivos_dados(diretorio_dados)

    print(f"Sucesso: {len(arquivos)} arquivos JSON gerados:")
    for arq in arquivos:
        print(f"  - {arq.name} ({arq.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
