# -*- coding: utf-8 -*-
import sys

content = """# CONFORMA GSASP — Catálogo de Regras Funcionais do Motor de Conformidade

Documento de especificação técnica e funcional para o futuro Motor de Regras (Sprint 3 — S3.1).  
**Base normativa e conceitual:** [docs/contexto.md](file:///c:/Users/cleyt/OneDrive/Documentos/Projetos/conforma-gsasp-retomada/docs/contexto.md) (Seções 4, 5, 6, 8 e 11) e [docs/sprint.md](file:///c:/Users/cleyt/OneDrive/Documentos/Projetos/conforma-gsasp-retomada/docs/sprint.md).  
**Data de revisão documental:** 25/09/2026 (Revisão da S3.1).  
**Situação:** Catálogo técnico revisado e em alinhamento conceitual; regras materiais, fontes normativas e classificações preliminares mantidas em caráter estritamente demonstrativo, **pendentes de validação humana e revisão da assessoria técnica/jurídica**.

---

## 1. Princípios de Governança do Motor de Regras

O motor de regras do CONFORMA GSASP é um componente de conferência lógica, estruturação de evidências e apoio à decisão, operando sob as seguintes diretrizes fundamentais:

1. **A IA/Sistema confere e organiza; o assessor valida e a autoridade decide (RN02, RN07):**
   Nenhuma regra algorítmica produz conclusão jurídica definitiva, presunção de legalidade ou substitui o juízo discricionário e a responsabilidade da autoridade competente. Todas as saídas e achados automáticos são emitidos sob o rótulo **`SUGESTÃO DO SISTEMA — PENDENTE DE VALIDAÇÃO HUMANA`** (RN05).
2. **Diferenciação rigorosa entre tipos de apontamentos:**
   - **Inconsistência de preenchimento na interface (RN13):** Divergência formal ou digitação incompleta nos campos do formulário (ex.: data final anterior à inicial). Deve ser tratada prioritariamente na interface para evitar dados inconsistentes, sendo tratada inicialmente pelo motor como inconsistência de datas a conferir, sem presumir erro de digitação do operador nem vício material no documento original autuado.
   - **Informação insuficiente ou campo não avaliado (RN11):** Ausência de documento, ausência de resposta fática ou critérios assinalados como pendentes ("A avaliar"). Gera alerta de instrução deficitária ou pendência de preenchimento, nunca autorizando presunção de resposta negativa nem ateste automático de conformidade.
   - **Achado de desconformidade material (RN03, RN04):** Apontamento substantivo fundamentado decorrente de divergência concreta entre os fatos documentados nos autos e as exigências normativas, pareceres jurídicos vinculantes ou diretrizes institucionais.
3. **Separação rigorosa das quatro dimensões das Condicionantes Jurídicas (RN03, RN04):**
   O tratamento de condicionantes jurídicas de pareceres anteriores exige distinguir com clareza analítica:
   - **(a) Situação do cumprimento:** Estado formal da condicionante (`atendida`, `pendente`, `em_cumprimento`, `nao_aplicavel`).
   - **(b) Providência planejada:** Ação descrita ou declarada no formulário pelo usuário para buscar o saneamento.
   - **(c) Evidência de cumprimento:** Peça documental concretamente autuada no processo que comprove que a condicionante foi satisfeita.
   - **(d) Classificação validada pelo assessor:** Avaliação humana de gravidade (`IMPEDITIVO`, `RELEVANTE`, `FORMAL`, `MELHORIA`), atribuída soberanamente pelo assessor segundo a natureza da exigência.
   *Diretriz mandatória:* O mero registro de uma providência planejada ou declarada **não significa condicionante cumprida** e **não reduz automaticamente a classificação de risco**. Da mesma forma, **não se deve classificar automaticamente toda condicionante sem providência como IMPEDITIVA**, cabendo indicar "classificação pendente de validação humana" na ausência de dados estruturados sobre a natureza e o efeito da condicionante.
4. **Sem pesos numéricos inventados (RN12):**
   O sistema não utiliza cálculos quantitativos artificiais ou fórmulas de "score de risco" desprovidas de respaldo normativo. Adota-se exclusivamente a tipologia qualitativa de quatro níveis da RN04 (`IMPEDITIVO`, `RELEVANTE`, `FORMAL`, `MELHORIA`).
5. **Transparência sobre limitações do formulário e dados ausentes:**
   Quando a escolha entre classificações alternativas (ex.: `FORMAL` vs. `RELEVANTE`) depender de dados que ainda não existem nos formulários do protótipo (ex.: essencialidade do documento, efeito suspensivo da condicionante, conferência de original autuado), o sistema registra expressamente essa limitação estrutural e mantém a classificação como pendente de validação humana, sem inventar valores fictícios nem ampliar o formulário nesta etapa.

---

## 2. Estrutura Padrão de Especificação das Regras

Cada regra deste catálogo segue a anatomia obrigatória da RN03 e as diretrizes de governança revisadas:
- **Identificador e Nome:** Código único e denominação semântica precisa.
- **Regras de Negócio Vinculadas:** Mapeamento cruzado com [docs/contexto.md](file:///c:/Users/cleyt/OneDrive/Documentos/Projetos/conforma-gsasp-retomada/docs/contexto.md).
- **Dados Necessários e Condição de Disparo:** Variáveis de entrada existentes e expressão lógica determinística.
- **Tratamento de Dados Ausentes e Não Aplicabilidade:** Comportamento diante de campos nulos, não avaliados ou dispensados.
- **Estrutura do Achado Sugerido:** Evidência → Regra/Motivo → Impacto → Providência Recomendada (linguagem demonstrativa, evitando expressões absolutistas como "óbice intransponível").
- **Classificação Preliminar Sugerida:** Indicação da classificação ou indicação explícita de "Pendente de validação humana".
- **Critérios para Classificações Alternativas e Limitações do Formulário:** Detalhamento dos dados requeridos para diferenciar alternativas e registro das limitações do modelo de dados atual.
- **Interação com a Interface:** Relação com bloqueios de formulário e persistência de rascunhos.
- **Fonte Normativa e Situação da Validação:** Base legal e situação da revisão humana.
- **Exemplos Fictícios:** Cenário de disparo vs. cenário regular.

---

## 3. Catálogo Detalhado de Regras

### REG-01 — Inconsistência Cronológica de Datas de Vigência a Conferir

| Campo | Especificação |
|---|---|
| **Identificador** | `REG-01-VIGENCIA-INCONSISTENTE` |
| **Nome** | Inconsistência Cronológica de Datas de Vigência a Conferir |
| **Regras Vinculadas** | **RN01** (Destaque da vigência), **RN03** (Estrutura do achado), **RN13** (Diferenciação de erro de interface). |
| **Dados Necessários** | `processo.vigenciaInicio`, `processo.vigenciaFim`, `processo.vigenciaNaoAplicavel`. |
| **Condição de Disparo** | `processo.vigenciaNaoAplicavel == false` **E** (`processo.vigenciaInicio != null` e `processo.vigenciaFim != null`) **E** `processo.vigenciaFim < processo.vigenciaInicio`. |
| **Tratamento de Ausências** | Se `vigenciaNaoAplicavel == true`, a regra é **dispensada** (não dispara). Se uma ou ambas as datas forem nulas/vazias, não dispara esta regra, gerando alerta de instrução pendente de preenchimento. |
| **Interação com a Interface** | Na Etapa 1 (Identificação), o formulário sinaliza a inconsistência e impede o avanço do perfil Editor/Assessor para proteger a higiene dos dados. Em rascunhos retomados ou na navegação como Leitor, o motor identifica as datas cadastradas e gera o apontamento analítico. |
| **Evidência Registrada** | Data final de vigência cadastrada (`processo.vigenciaFim`) anterior à data inicial de vigência (`processo.vigenciaInicio`). |
| **Regra / Motivo** | Princípio da continuidade dos ajustes contratuais, segurança jurídica e coerência temporal dos atos administrativos (Lei nº 14.133/2021, art. 105). O período de vigência delimita temporalmente a eficácia dos direitos e obrigações. |
| **Impacto Potencial** | Inconsistência no cômputo do prazo do instrumento, risco de execução financeira sem respaldo temporal regular ou necessidade de retificação formal do termo. |
| **Providência Recomendada** | Conferir se a discrepância decorre de transcrição das datas para o sistema ou se reflete exatamente o texto da minuta autuada no processo físico/digital. Sendo divergência na inserção dos dados, retificar no sistema; se o texto da minuta autuada contiver a divergência temporal, submeter ao setor demandante para juntada de certidão saneadora ou errata formal antes da subscrição. |
| **Classificação Sugerida** | **Sugestão demonstrativa preliminar: `FORMAL` (como inconsistência de datas a conferir)**, nunca conclusão automática. A definição final de gravidade requer conferência pelo assessor. |
| **Dados para Alternativas e Limitações** | *Alternativas:* `FORMAL` (quando a minuta física for regular e apenas a digitação no sistema divergir) vs. `RELEVANTE` (quando a minuta anexada aos autos contiver a cláusula defeituosa).<br>*Limitação do formulário:* O sistema atualmente não dispõe de campo estruturado para atestar "conferido no documento autuado". Logo, o sistema não presume a causa, sugerindo `FORMAL` de modo meramente indicativo e confiando a classificação ao assessor humano. |
| **Fonte e Situação** | *Fonte:* Prática administrativa de conformidade e art. 105 da Lei nº 14.133/2021. *Situação:* **Proposta demonstrativa pendente de validação humana.** |
| **Exemplo que Dispara** | `vigenciaInicio: "2026-03-01"`, `vigenciaFim: "2026-02-01"` (Cenário 5). |
| **Exemplo que Não Dispara**| `vigenciaInicio: "2026-03-01"`, `vigenciaFim: "2027-03-01"` ou `vigenciaNaoAplicavel: true`. |

---

### REG-02 — Pertinência Institucional Não Demonstrada ou em Avaliação

| Campo | Especificação |
|---|---|
| **Identificador** | `REG-02-PERTINENCIA-NAO-DEMONSTRADA` |
| **Nome** | Pertinência Institucional Não Demonstrada ou com Critérios sob Avaliação |
| **Regras Vinculadas** | **RN02** (Filtro obrigatório de pertinência), **RN03** (Estrutura do achado), **RN04** (Classificação), **RN08** (Conclusão técnica), **RN11** (Dados incompletos). |
| **Dados Necessários** | `pertinencia.conclusao`, `pertinencia.respostas`, `pertinencia.justificativa`. |
| **Tratamento Diferenciado das Respostas** | - **Resposta expressa "Não" (`false`):** Indica manifestação técnica desfavorável ao critério avaliado.<br>- **Resposta "A avaliar" / Não informada (`null`):** Indica que o critério ainda não foi analisado ou que faltam peças nos autos para firmar convicção. **Não deve ser presumida como resposta negativa ("Não")**.<br>- **Campo não preenchido:** Trata-se de análise incompleta que demanda complemento de instrução, não autorizando juízo de recusa substantiva automática. |
| **Condição de Disparo** | `pertinencia.conclusao == 'NAO_DEMONSTRADA'` **OU** `pertinencia.conclusao == 'NAO_PERTINENTE'` **OU** (`pertinencia.conclusao == null` **E** qualquer resposta dos 5 critérios for expressamente `false`). |
| **Tratamento de Critérios "A avaliar"** | Se `pertinencia.conclusao == null` e os critérios estiverem sem preenchimento ou em `null` ("A avaliar"), o motor **não gera achado de recusa material**, mas sim alerta de instrução pendente de conclusão humana (RN02/RN11). |
| **Interação com a Interface** | Na Etapa 2, a conclusão humana do assessor é campo obrigatório para o fechamento regular. A sugestão indicativa do sistema orienta a triagem, mas **a conclusão selecionada pelo usuário prevalece sempre** sobre o cálculo algorítmico, registrando aviso informativo se houver divergência. |
| **Evidência Registrada** | Conclusão humana indicando que a pertinência não restou demonstrada nos autos ou registro de resposta expressamente negativa em critérios de conveniência/competência. |
| **Regra / Motivo** | A conformidade jurídica e orçamentária depende do vínculo entre o objeto e os objetivos estratégicos, competências e conveniência do órgão público (RN02). A contratação deve atender ao interesse público comprovado. |
| **Impacto Potencial** | Risco de realização de despesa pública desprovida de motivação fática suficiente, vulnerabilidade a questionamentos por órgãos de controle e potencial antieconomicidade. |
| **Providência Recomendada** | Devolver os autos ao setor demandante para juntada de documentação complementar justificando a pertinência, ou emitir manifestação técnica fundamentada para subsidiar a decisão superior. |
| **Classificação Sugerida** | **`IMPEDITIVO`** (se `conclusao == 'NAO_PERTINENTE'`) ou **`RELEVANTE`** (se `conclusao == 'NAO_DEMONSTRADA'`, cabendo complementação da instrução). |
| **Dados para Alternativas e Limitações** | *Alternativas:* A escolha entre `IMPEDITIVO` e `RELEVANTE` baseia-se na seleção explícita da conclusão pelo assessor (`NAO_PERTINENTE` vs `NAO_DEMONSTRADA`) e no teor da sua justificativa técnica.<br>*Limitação do formulário:* Não há classificação automática sobre a gravidade da ausência de cada critério isolado; a ponderação decorre estritamente da avaliação humana do assessor. |
| **Fonte e Situação** | *Fonte:* Práticas de governança de contratações públicas e RN02 de `docs/contexto.md`. *Situação:* **Aprovada para o protótipo com prevalência humana.** |
| **Exemplo que Dispara** | `conclusao: "NAO_DEMONSTRADA"`, `respostas: { vinculoPlanejamento: false, ... }` (Cenário 4). |
| **Exemplo que Não Dispara**| `conclusao: "PERTINENTE"`, respostas validadas e justificativa registrada nos autos. |

---

### REG-03 — Condicionante Jurídica Pendente sem Registro de Providência

| Campo | Especificação |
|---|---|
| **Identificador** | `REG-03-CONDICIONANTE-PENDENTE-SEM-PROVIDENCIA` |
| **Nome** | Condicionante Jurídica Pendente sem Registro de Providência no Formulário |
| **Regras Vinculadas** | **RN03** (Estrutura do achado), **RN04** (Classificação), **RN07** (Apoio à decisão), **RN11** (Instrução pendente). |
| **Dados Necessários** | `condicionante.descricao`, `condicionante.referenciaParecer`, `condicionante.situacao`, `condicionante.providencia`. |
| **Separação das 4 Dimensões** | 1. **Situação do cumprimento:** Declarada como `pendente`.<br>2. **Providência planejada:** Não informada no formulário (`providencia == null` ou em branco).<br>3. **Evidência de cumprimento:** Não juntada aos autos.<br>4. **Classificação validada pelo assessor:** **Pendente de validação humana**. |
| **Condição de Disparo** | `condicionante.situacao == 'pendente'` **E** (`condicionante.providencia == null` ou `condicionante.providencia.trim() == ""`). |
| **Diretriz de Classificação** | **Não classificar automaticamente como IMPEDITIVA.** O sistema não dispõe de dados para presumir a natureza da condicionante (se suspensiva/precedente à assinatura ou resolutiva/de acompanhamento durante a execução). O apontamento alerta a ausência de plano de providência, mas sua gravidade depende da valoração do assessor. |
| **Interação com a Interface** | Na Etapa 3 (Conformidade), a interface exige o registro de providência para avanço no perfil Editor. Em rascunhos retomados ou importações onde a condicionante figure sem ação descrita, o motor gera este apontamento informativo. |
| **Evidência Registrada** | Condicionante consignada em manifestação jurídica (`referenciaParecer`) classificada como pendente, sem que conste ação de saneamento declarada no formulário. |
| **Regra / Motivo** | Manifestações jurídicas com ressalvas ou condicionantes requerem tratamento administrativo para atendimento das orientações fixadas pelo órgão consultivo. |
| **Impacto Potencial** | Risco de celebração ou prosseguimento da contratação sem observância das recomendações expedidas pela consultoria jurídica. |
| **Providência Recomendada** | Avaliar o teor do parecer jurídico para identificar se a exigência é condicionante prévia e indispensável à assinatura do ajuste ou providência mitigatória a ser executada durante a vigência, definindo a ação e o setor responsável. |
| **Classificação Sugerida** | **`Classificação pendente de validação humana`** (com sugestão indicativa de que condicionantes prévias de eficácia jurídica costumam ser avaliadas como `IMPEDITIVO` ou `RELEVANTE`, a critério do assessor). |
| **Dados para Alternativas e Limitações** | *Alternativas:* Para classificar com precisão como `IMPEDITIVO`, `RELEVANTE` ou `FORMAL`, é indispensável avaliar o conteúdo jurídico da exigência (efeito suspensivo, prazo fatal, impacto na legalidade da despesa).<br>*Limitação do formulário:* O formulário atual não possui campos para "tipo de efeito da condicionante" nem "momento exigido para cumprimento". Portanto, o sistema registra essa limitação funcional e **não presume esses dados**, deixando a classificação a cargo do assessor. |
| **Fonte e Situação** | *Fonte:* Boas práticas de instrução processual e controle preventivo de legalidade. *Situação:* **Proposta demonstrativa revisada pendente de validação humana.** |
| **Exemplo que Dispara** | Condicionante "Apresentar comprovação de capacidade técnica", `situacao: "pendente"`, `providencia: ""`. |
| **Exemplo que Não Dispara**| Condicionante com `situacao: "atendida"` ou com providência e classificação homologadas. |

---

### REG-04 — Condicionante Jurídica Pendente com Providência Declarada

| Campo | Especificação |
|---|---|
| **Identificador** | `REG-04-CONDICIONANTE-PENDENTE-COM-PROVIDENCIA` |
| **Nome** | Condicionante Jurídica Pendente com Providência Declarada no Formulário |
| **Regras Vinculadas** | **RN03** (Estrutura do achado), **RN04** (Classificação), **RN08** (Assinatura com ressalva/saneamento). |
| **Dados Necessários** | `condicionante.descricao`, `condicionante.referenciaParecer`, `condicionante.situacao`, `condicionante.providencia`, `condicionante.evidenciaAtendimento`. |
| **Separação das 4 Dimensões** | 1. **Situação do cumprimento:** Declarada como `pendente` ou `em_cumprimento`.<br>2. **Providência planejada:** Texto descritivo preenchido no formulário pelo usuário.<br>3. **Evidência de cumprimento:** Pendente de comprovação material autuada no processo.<br>4. **Classificação validada pelo assessor:** **Pendente de validação humana**. |
| **Condição de Disparo** | (`condicionante.situacao == 'pendente'` **OU** `condicionante.situacao == 'em_cumprimento'`) **E** (`condicionante.providencia != null` e `condicionante.providencia.trim() != ""`). |
| **Diretriz de Governança** | **Não reduzir a classificação apenas porque existe uma providência escrita.** O preenchimento do campo de providência registra a intenção ou medida administrativa planejada, mas não atesta que a condicionante esteja cumprida nem elimina os riscos jurídicos da sua pendência material. |
| **Interação com a Interface** | Permite o registro detalhado da providência e do responsável na Etapa 3. O motor captura os dados e estrutura o apontamento para conferência da suficiência e do cronograma na Etapa 4. |
| **Evidência Registrada** | Condicionante jurídica assinalada como pendente ou em cumprimento, constando no formulário o registro da providência declarada (`condicionante.providencia`). |
| **Regra / Motivo** | A conformidade plena com o parecer jurídico exige a comprovação efetiva do saneamento das condicionantes antes da prática do ato ou a gestão rigorosa de suas ressalvas durante a execução. |
| **Impacto Potencial** | Risco de início ou prosseguimento contratual baseado apenas em plano de ação, sem a efetiva juntada documental comprobatória aos autos processuais. |
| **Providência Recomendada** | Verificar se a providência informada atende integralmente ao que foi determinado pelo parecer jurídico, se deve ser cumprida antes da assinatura ou durante a vigência, e monitorar a juntada da respectiva evidência de cumprimento aos autos. |
| **Classificação Sugerida** | **`Classificação pendente de validação humana`** (sugestão indicativa demonstrativa: `RELEVANTE` se a condicionante for prévia à formalização do ato, ou `FORMAL` se for mera providência de governança a acompanhar). |
| **Dados para Alternativas e Limitações** | *Alternativas:* A redução ou elevação da gravidade depende da suficiência da medida proposta, do risco de descumprimento e da existência de prazo fixado pela PGE.<br>*Limitação do formulário:* O sistema não avalia a qualidade semântica da providência digitada nem confere se a peça de evidência foi anexada ao SEI/processo físico. Essa limitação está registrada, incumbindo ao assessor validar a classificação. |
| **Fonte e Situação** | *Fonte:* Gestão de riscos de contratação e RN03/RN04 de `docs/contexto.md`. *Situação:* **Proposta demonstrativa revisada pendente de validação humana.** |
| **Exemplo que Dispara** | Condicionante "Apresentar certidão de regularidade perante o FGTS", `situacao: "em_cumprimento"`, `providencia: "Solicitada emissão à contratada via ofício nº 12/2026"`. |
| **Exemplo que Não Dispara**| Condicionante com `situacao: "atendida"` e registro do documento comprobatório anexado. |

---

### REG-05 — Item de Checklist com Conferência em Aberto ("A Confirmar")

| Campo | Especificação |
|---|---|
| **Identificador** | `REG-05-DOCUMENTO-A-CONFIRMAR` |
| **Nome** | Item da Instrução Processual com Conferência em Aberto ("A Confirmar") |
| **Regras Vinculadas** | **RN03** (Estrutura do achado), **RN05** (Sugestão indicativa), **RN11** (Instrução insuficiente). |
| **Dados Necessários** | `itemChecklist.descricao`, `itemChecklist.status`, `itemChecklist.observacao`. |
| **Condição de Disparo** | `itemChecklist.status == 'confirmar'`. |
| **Tratamento de Ausências** | Se o item estiver como `confirmar` e o campo de observação estiver em branco, gera recomendação para detalhamento da dúvida técnica que justificou a marcação. |
| **Interação com a Interface** | Permite ao assessor assinalar na Etapa 3 que um documento ainda não foi localizado ou que sua validade precisa de diligência. Na Etapa 4, o motor converte a marcação em achado sugestivo de conferência pendente. |
| **Evidência Registrada** | Item do checklist de conformidade documental assinalado com o status "A confirmar". |
| **Regra / Motivo** | A instrução processual deve assegurar a presença e higidez das peças obrigatórias. A existência de dúvida não suprida impede o ateste seguro de regularidade (RN11). |
| **Impacto Potencial** | Risco de prosseguimento com instrução documental deficiente, gerando nulidades procedimentais ou impossibilidade de comprovação dos requisitos legais. |
| **Providência Recomendada** | Realizar diligência no processo para verificar a existência, validade e adequação do documento ou certidão, atualizando o status para `ok` após a constatação ou registrando a pendência formal. |
| **Classificação Sugerida** | **`Classificação pendente de validação humana`** (sugestão indicativa: `RELEVANTE` para peças estruturais da despesa ou `FORMAL` para registros acessórios). |
| **Dados para Alternativas e Limitações** | *Alternativas:* Para determinar se o achado é `RELEVANTE` ou `FORMAL`, é necessário saber se a peça pendente de confirmação é requisito essencial de validade do ato (ex.: autorização da autoridade competente, empenho prévio) ou documento meramente complementar.<br>*Limitação do formulário:* O checklist atual não contém metadados sobre a essencialidade jurídica de cada item. Essa limitação é documentada para que o assessor decida a gravidade segundo o contexto concreto. |
| **Fonte e Situação** | *Fonte:* Checklist procedimental da Administração Pública e RN11 de `docs/contexto.md`. *Situação:* **Aprovada para o protótipo com prevalência humana.** |
| **Exemplo que Dispara** | Item "Certidão de Regularidade Fiscal", `status: "confirmar"`, `observacao: "Verificar se a certidão anexada às fls. 30 encontra-se dentro do prazo de validade"`. |
| **Exemplo que Não Dispara**| Item com `status: "ok"` e referência de folhas/documento nos autos. |

---

### REG-06 — Item Marcado como "Não Aplicável" sem Justificativa Fundamentada

| Campo | Especificação |
|---|---|
| **Identificador** | `REG-06-NAO-APLICABILIDADE-SEM-JUSTIFICATIVA` |
| **Nome** | Item Dispensado sem Justificativa Circunstanciada no Formulário |
| **Regras Vinculadas** | **RN03** (Estrutura do achado), **RN04** (Classificação), **RN13** (Consistência de preenchimento). |
| **Dados Necessários** | `itemChecklist.descricao`, `itemChecklist.status`, `itemChecklist.justificativaNaoAplicavel`. |
| **Condição de Disparo** | `itemChecklist.status == 'nao_aplicavel'` **E** (`itemChecklist.justificativaNaoAplicavel == null` ou `itemChecklist.justificativaNaoAplicavel.trim().length < 5`). |
| **Papel do Limite de 5 Caracteres** | **Validação puramente técnica de preenchimento:** O piso de 5 caracteres atua unicamente como trava sintática na interface para impedir que o campo seja enviado em branco ou com caracteres dispersos. **Esse limite técnico NÃO atesta nem comprova que a justificativa seja suficiente, motivada ou juridicamente válida.** O mérito e a adequação da justificativa dependem sempre de validação humana. |
| **Interação com a Interface** | Na Etapa 3 (Conformidade), a validação de tela impede que o usuário avance deixando o campo vazio se marcou "Não aplicável". Em rascunhos retomados, o motor audita o checklist e sinaliza a falta de motivação. |
| **Evidência Registrada** | Item do checklist documental assinalado como não aplicável sem preenchimento ou com justificativa declarada inferior a 5 caracteres. |
| **Regra / Motivo** | Princípio da motivação dos atos administrativos (Lei nº 14.133/2021). O afastamento de requisito documental padronizado exige justificativa expressa demonstrando a incompatibilidade com o objeto. |
| **Impacto Potencial** | Risco de dispensa indevida de formalidade legal imperativa decorrente de erro operacional ou falta de registro das razões administrativas. |
| **Providência Recomendada** | Registrar justificativa fundamentada indicando a base fática ou jurídica que torna o documento dispensável no caso concreto, ou reintegrar o item à conferência. |
| **Classificação Sugerida** | **`Classificação pendente de validação humana`** (sugestão indicativa demonstrativa: `FORMAL` para simples saneamento de redação ou `RELEVANTE` se a peça for exigência legal cogente). |
| **Dados para Alternativas e Limitações** | *Alternativas:* Para discernir entre `FORMAL` e `RELEVANTE`, faz-se necessário examinar se o documento dispensado é passível de dispensa legal fundamentada ou se constitui exigência legal inderrogável.<br>*Limitação do formulário:* O formulário não processa linguagem natural nem analisa a procedência legal do texto digitado. O sistema registra a limitação e confia a análise de mérito ao assessor. |
| **Fonte e Situação** | *Fonte:* Teoria dos motivos determinantes e RN13 de `docs/contexto.md`. *Situação:* **Aprovada para o protótipo com trava técnica e avaliação de mérito humana.** |
| **Exemplo que Dispara** | Item "Matriz de Riscos", `status: "nao_aplicavel"`, `justificativaNaoAplicavel: ""` ou `"n/a"`. |
| **Exemplo que Não Dispara**| Item assinalado como não aplicável com justificativa circunstanciada registrada pelo assessor. |

---

## 4. Matriz de Síntese e Mapeamento de Classificações Preliminares

| Código da Regra | Gatilho Lógico no Estado | Classificação Preliminar Sugerida | Dados Necessários para Decisão | Limitações do Modelo Atual | Soberania da Validação Humana |
|---|---|---|---|---|---|
| `REG-01-VIGENCIA-INCONSISTENTE` | `fim < inicio` e vigência aplicável | **`FORMAL`** *(sugestão demonstrativa preliminar)* | Saber se o erro está apenas na digitação ou se consta na minuta autuada. | Sem campo de conferência de documento original autuado. | Assessor avalia se é erro de interface ou vício da minuta e define classificação. |
| `REG-02-PERTINENCIA-NAO-DEMONSTRADA` | Conclusão humana `NAO_DEMONSTRADA` / `NAO_PERTINENTE` ou eixos `false` | **`IMPEDITIVO`** ou **`RELEVANTE`** *(conforme conclusão humana)* | Conclusão do assessor e justificativa fática registrada. | Não presume respostas "A avaliar" como negativas. | Assessor decide a pertinência; sistema nunca sobrepõe sugestão à conclusão humana. |
| `REG-03-CONDICIONANTE-PENDENTE-SEM-PROVIDENCIA` | Condicionante `pendente` sem providência preenchida | **`Pendente de validação humana`** | Natureza jurídica (prévia ou resolutiva), prazo e efeito suspensivo. | Sem tipologia estruturada de condicionante no formulário. | Assessor avalia a natureza da condicionante e atribui soberanamente a gravidade. |
| `REG-04-CONDICIONANTE-PENDENTE-COM-PROVIDENCIA` | Condicionante `pendente`/`em_cumprimento` com providência | **`Pendente de validação humana`** | Efetividade da providência declarada e juntada de evidência aos autos. | Prova de juntada não é verificada automaticamente no sistema. | Assessor verifica se a providência atende ao parecer e se a evidência foi juntada. |
| `REG-05-DOCUMENTO-A-CONFIRMAR` | Item do checklist marcado como `confirmar` | **`Pendente de validação humana`** | Essencialidade jurídica da peça para a validade do ajuste. | Checklist atual não categoriza itens em essenciais ou acessórios. | Assessor verifica a peça nos autos e classifica a relevância da pendência. |
| `REG-06-NAO-APLICABILIDADE-SEM-JUSTIFICATIVA` | Item `nao_aplicavel` com justificativa < 5 caracteres | **`Pendente de validação humana`** | Legitimidade fática e jurídica da dispensa do requisito. | Trava de 5 caracteres é apenas técnica; não avalia mérito. | Assessor valida se a fundamentação é jurídica e formalmente cabível. |

---

## 5. Relação com Validações de Formulário vs. Motor de Regras

Existe uma separação deliberada e indispensável no CONFORMA GSASP entre as **Validações Técnicas de Interface** e o **Motor de Análise de Conformidade**:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. VALIDAÇÃO TÉCNICA DE INTERFACE (Etapas 1, 2 e 3)         │
│ - Finalidade: Garantir higidez mínima dos dados digitados.   │
│ - Escopo: Presença de campos, formatos de data, piso técnico│
│   de caracteres (ex.: 5 caracteres em justificativas).      │
│ - Ação: Adverte o operador e impede avanço acidental do     │
│   perfil Assessor sem travar rascunhos nem navegação Leitor.│
│ - Limite: NÃO avalia mérito nem presume conformidade legal. │
└──────────────────────────────┬──────────────────────────────┘
                               │ Estado consolidado / rascunho salvo
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. MOTOR DE REGRAS E APOIO À DECISÃO (Etapa 4 — Achados)    │
│ - Finalidade: Organizar fatos, cruzar regras e apontar      │
│   inconsistências na estrutura da RN03:                     │
│   Evidência -> Regra/Motivo -> Impacto -> Providência.      │
│ - Escopo: Avalia o conjunto dos dados sem inventar presunções│
│   de legalidade ou scores de risco (RN12).                  │
│ - Ação: Emite sugestões estruturadas sempre rotuladas como: │
│   "SUGESTÃO DO SISTEMA — PENDENTE DE VALIDAÇÃO HUMANA".     │
│ - Soberania: O assessor valida, ajusta a classificação ou   │
│   rejeita fundamentadamente cada apontamento (RN05/RN06).   │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Registro de Limitações do Modelo de Dados e Decisões Pendentes

Para assegurar fidelidade aos requisitos desta etapa e evitar suposições indevidas antes da implementação em código (S3.2):

1. **Limitações do Modelo de Dados do Protótipo (Sem ampliação não autorizada):**
   - *Origem da inconsistência de vigência:* O formulário não possui campo para marcar se o erro ocorreu na digitação do sistema ou no documento original assinado.
   - *Tipologia de condicionantes jurídicas:* O formulário possui apenas `situacao`, `descricao`, `referenciaParecer`, `providencia`, `responsavel` e `evidenciaAtendimento`. Não há metadados sobre efeito suspensivo ou momento legal de eficácia.
   - *Essencialidade de itens do checklist:* Não há diferenciação prévia entre requisitos de nulidade absoluta e formalidades secundárias.
   *Decisão:* Essas limitações ficam formalmente registradas. **Nenhum campo fictício será adicionado e nenhum formulário será alterado nesta tarefa.**
2. **Classificações Mantidas como Pendentes de Validação Humana:**
   - Em observância à governança, condicionantes pendentes (`REG-03` e `REG-04`), conferências em aberto (`REG-05`) e dispensas de itens (`REG-06`) não receberão classificações de gravidade impostas de forma determinística/inflexível pelo motor, sugerindo preferencialmente `Classificação pendente de validação humana` e facultando a escolha qualificada ao assessor.
3. **Revisão Humana do Catálogo:**
   - O catálogo documental da S3.1 permanece formalmente registrado como **pendente de revisão humana** prévia antes de qualquer codificação do motor na tarefa S3.2.
"""

with open("c:/Users/cleyt/OneDrive/Documentos/Projetos/conforma-gsasp-retomada/docs/regras-funcionais.md", "w", encoding="utf-8") as f:
    f.write(content.strip() + "\n")

print("regras-funcionais.md successfully updated!")
