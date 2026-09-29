# CONFORMA GSASP — Catálogo de Regras Funcionais do Motor de Conformidade

Documento de especificação técnica e funcional para o futuro Motor de Regras (Sprint 3 — S3.1).  
**Base normativa e conceitual:** [docs/contexto.md](file:///c:/Users/cleyt/OneDrive/Documentos/Projetos/conforma-gsasp-retomada/docs/contexto.md) (Seções 4, 5, 6, 8 e 11) e [docs/sprint.md](file:///c:/Users/cleyt/OneDrive/Documentos/Projetos/conforma-gsasp-retomada/docs/sprint.md).  
**Data de aprovação funcional:** 25/09/2026.  
**Situação:** Aprovado pelo usuário como especificação funcional demonstrativa para desenvolvimento e testes do protótipo (isso não representa validação jurídica das regras nem aprovação de processos reais).  
**Salvaguardas Mandatórias Registradas:**  
- **Preservação das validações existentes:** Mantidas as validações de campos obrigatórios e a integridade do salvamento de rascunhos.  
- **Condicionantes em cumprimento:** Condicionante em cumprimento continua pendente de avaliação humana, mesmo com providência preenchida.  
- **Piso técnico de caracteres:** O mínimo de caracteres não comprova adequação nem suficiência jurídica da justificativa.

---

## 1. Princípios de Governança do Motor de Regras

O motor de regras do CONFORMA GSASP é um componente de conferência lógica, estruturação de evidências e apoio à decisão, operando sob as seguintes diretrizes fundamentais:

1. **A IA/Sistema confere e organiza; o assessor valida e a autoridade decide (RN02, RN07):**  
   Nenhuma regra algorítmica produz conclusão jurídica definitiva, presunção de legalidade ou substitui o juízo discricionário e a responsabilidade da autoridade competente. Todas as saídas e achados automáticos são emitidos sob o rótulo **`SUGESTÃO DO SISTEMA — PENDENTE DE VALIDAÇÃO HUMANA`** (RN05).
2. **Diferenciação rigorosa entre tipos de apontamentos:**
   - **Inconsistência de preenchimento na interface (RN13):** Divergência formal ou digitação incompleta nos campos do formulário (ex.: data final anterior à inicial). Deve ser tratada prioritariamente na interface para evitar dados inconsistentes, sendo tratada pelo motor como inconsistência de datas a conferir, sem presumir erro de digitação do operador nem vício material no documento original autuado.
   - **Informação insuficiente ou campo não avaliado (RN11):** Ausência de documento registrado, ausência de resposta fática ou critérios assinalados como pendentes ("A avaliar"). Gera alerta de instrução pendente de preenchimento ou análise, nunca autorizando presunção de resposta negativa nem ateste automático de conformidade.
   - **Achado de desconformidade material (RN03, RN04):** Apontamento substantivo fundamentado decorrente de divergência concreta entre os fatos documentados nos autos e as exigências normativas, pareceres jurídicos vinculantes ou diretrizes institucionais.
3. **Separação rigorosa das quatro dimensões das Condicionantes Jurídicas (RN03, RN04):**  
   O tratamento de condicionantes jurídicas de pareceres anteriores exige distinguir com clareza analítica:
   - **(a) Situação do cumprimento:** Estado formal da condicionante (`atendida`, `pendente`, `em_cumprimento`, `nao_aplicavel`).
   - **(b) Providência planejada:** Ação descrita ou declarada no formulário pelo usuário para buscar o saneamento.
   - **(c) Evidência de cumprimento:** Peça documental concretamente autuada no processo que comprove que a condicionante foi satisfeita.
   - **(d) Classificação validada pelo assessor:** Avaliação humana de gravidade (`IMPEDITIVO`, `RELEVANTE`, `FORMAL`, `MELHORIA`), atribuída soberanamente pelo assessor segundo a natureza da exigência.  
   *Diretriz mandatória:* O mero registro de uma providência planejada ou declarada **não comprova cumprimento da condicionante** e **não reduz a classificação de risco**. Da mesma forma, **não se deve classificar automaticamente uma condicionante sem providência como IMPEDITIVA**, cabendo manter como `Classificação pendente de validação humana`, sem associações presumidas entre exigência prévia/acompanhamento e determinada gravidade.
4. **Sem pesos numéricos inventados e significado de "Classificação pendente" (RN04, RN12):**  
   O sistema não utiliza cálculos quantitativos artificiais ou fórmulas de "score de risco" desprovidas de respaldo normativo. Adota-se exclusivamente a tipologia qualitativa de quatro níveis da RN04 (`IMPEDITIVO`, `RELEVANTE`, `FORMAL`, `MELHORIA`).  
   *Importante:* A indicação **"Classificação pendente de validação humana" é um estado de avaliação do apontamento**, e **não uma quinta categoria de gravidade**. Significa que o sistema não possui critérios objetivos para cravar a gravidade e incumbe ao assessor atribuir uma das quatro categorias regulamentares.
5. **Alcance da opção "Não se aplica":**  
   A opção "Não se aplica" dispensa **exclusivamente a checagem correspondente no protótipo**, permanecendo sempre sujeita à revisão e validação humana. Não constitui ateste institucional de dispensa legal.
6. **Não presunção de inexistência nos autos processuais:**  
   O sistema **não deve afirmar que um documento inexiste nos autos** apenas porque não foi registrado ou anexado no formulário do protótipo. O apontamento deve registrar a ausência de registro ou conferência no sistema, cabendo a verificação da existência física/digital nos autos reais ao assessor.
7. **Transparência sobre limitações do formulário e dados ausentes:**  
   O sistema não deve emitir sugestões de gravidade baseadas em características que não consegue verificar (ex.: essencialidade do documento, efeito suspensivo da condicionante, conferência de original autuado). Nessas situações, registra-se expressamente a limitação estrutural e mantém-se a classificação pendente de validação humana.

---

## 2. Estrutura Padrão de Especificação das Regras

Cada regra deste catálogo segue a anatomia obrigatória da RN03 e as diretrizes de governança revisadas:
- **Identificador e Nome:** Código único e denominação semântica precisa.
- **Regras de Negócio Vinculadas:** Mapeamento cruzado com [docs/contexto.md](file:///c:/Users/cleyt/OneDrive/Documentos/Projetos/conforma-gsasp-retomada/docs/contexto.md).
- **Dados Necessários e Condição de Disparo:** Variáveis de entrada existentes e expressão lógica determinística.
- **Tratamento de Dados Ausentes e Não Aplicabilidade:** Comportamento diante de campos nulos, não avaliados ou dispensados.
- **Estrutura do Achado Sugerido:** Evidência → Regra/Motivo → Impacto → Providência Recomendada (linguagem neutra e demonstrativa, sem prescrever documentos específicos sem fundamento validado).
- **Classificação Preliminar:** Indicação demonstrativa sujeita a validação ou indicação de "Classificação pendente de validação humana".
- **Critérios para Classificações Alternativas e Limitações do Formulário:** Detalhamento das limitações técnicas do protótipo atual.
- **Interação com a Interface:** Relação com bloqueios de formulário e persistência de rascunhos.
- **Fonte Normativa e Situação da Validação:** Base legal/administrativa e situação da revisão humana.
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
| **Tratamento de Ausências e Não Aplicabilidade** | Se `vigenciaNaoAplicavel == true`, a checagem de datas é **dispensada no protótipo** (sujeito à revisão humana). Se uma ou ambas as datas forem nulas/vazias, não dispara esta regra, gerando alerta de instrução pendente de preenchimento. |
| **Interação com a Interface** | Na Etapa 1 (Identificação), o formulário sinaliza a inconsistência e impede o avanço do perfil Editor/Assessor para proteger a higiene dos dados. Em rascunhos retomados ou na navegação como Leitor, o motor identifica as datas cadastradas e gera o apontamento analítico. |
| **Evidência Registrada** | Data final de vigência cadastrada (`processo.vigenciaFim`) anterior à data inicial de vigência (`processo.vigenciaInicio`). |
| **Regra / Motivo** | Princípio da continuidade dos ajustes contratuais, segurança jurídica e coerência temporal dos atos administrativos (Lei nº 14.133/2021, art. 105). O período de vigência delimita temporalmente a eficácia dos direitos e obrigações. |
| **Impacto Potencial** | Inconsistência no cômputo do prazo do instrumento, risco de execução sem respaldo temporal regular ou necessidade de retificação formal do termo. |
| **Providência Recomendada** | Conferir a fonte documental, corrigir eventual erro de cadastro na interface ou, caso a divergência conste no documento original autuado, solicitar a retificação adequada ao setor responsável antes da subscrição. *(Orientação neutra, sem prescrever documento obrigatório específico sem fundamento validado).* |
| **Classificação Sugerida** | **Sugestão demonstrativa preliminar: `FORMAL` (como inconsistência de datas a conferir)**, sujeita à validação humana. A definição final de gravidade requer conferência pelo assessor. |
| **Dados para Alternativas e Limitações** | *Alternativas:* `FORMAL` (se a divergência for mero equívoco de preenchimento no formulário) vs. `RELEVANTE` (se o erro temporal constar na minuta autuada no processo físico/digital).<br>*Limitação do formulário:* O sistema não dispõe de campo para atestar a conferência do documento original autuado. Logo, não presume a causa, sugerindo `FORMAL` de modo indicativo e confiando a classificação ao assessor. |
| **Fonte e Situação** | *Fonte:* Prática administrativa de conformidade e art. 105 da Lei nº 14.133/2021. *Situação:* **Proposta demonstrativa pendente de aprovação humana.** |
| **Exemplo que Dispara** | `vigenciaInicio: "2026-03-01"`, `vigenciaFim: "2026-02-01"` (Cenário 5). |
| **Exemplo que Não Dispara**| `vigenciaInicio: "2026-03-01"`, `vigenciaFim: "2027-03-01"` ou `vigenciaNaoAplicavel: true`. |

---

### REG-02 — Pertinência Institucional Não Demonstrada, em Avaliação ou com Divergência

| Campo | Especificação |
|---|---|
| **Identificador** | `REG-02-PERTINENCIA-NAO-DEMONSTRADA` |
| **Nome** | Pertinência Institucional Não Demonstrada, em Avaliação ou com Divergência Registrada |
| **Regras Vinculadas** | **RN02** (Filtro obrigatório de pertinência), **RN03** (Estrutura do achado), **RN04** (Classificação), **RN08** (Conclusão técnica), **RN11** (Dados incompletos). |
| **Dados Necessários** | `pertinencia.conclusao`, `pertinencia.respostas`, `pertinencia.justificativa`. |
| **Diferenciação dos Três Estados de Avaliação** | 1. **Não Pertinente (`NAO_PERTINENTE`):** Manifestação técnica conclusiva do assessor indicando que o objeto contraria as competências, prioridades ou conveniência institucional do órgão. Sugestão preliminar demonstrativa: **`IMPEDITIVO`**.<br>2. **Pertinência Não Demonstrada (`NAO_DEMONSTRADA`):** Manifestação técnica conclusiva do assessor de que a instrução processual atual não comprovou a necessidade, o vínculo ou a vantajocidade, demandando complementação/saneamento. Sugestão preliminar demonstrativa: **`RELEVANTE`**.<br>3. **Avaliação Ainda Não Concluída (`conclusao == null`):**<br>- *Se existir resposta expressa "Não" (`false`) em qualquer critério:* Gera apontamento analítico de que há critério desfavorável assinalado sem conclusão firmada. Classificação: **`Classificação pendente de validação humana`**.<br>- *Se os critérios estiverem em "A avaliar" (`null`) ou vazios:* Trata-se de instrução incompleta (RN11); gera alerta de pendência de preenchimento, sem presumir resposta negativa. |
| **Condição de Disparo** | `pertinencia.conclusao == 'NAO_DEMONSTRADA'` **OU** `pertinencia.conclusao == 'NAO_PERTINENTE'` **OU** (`pertinencia.conclusao == null` **E** qualquer resposta dos 5 critérios for expressamente `false`). |
| **Tratamento de Conclusão Humana Divergente** | Se o assessor assinalar resposta "Não" em algum critério preliminar, mas selecionar conclusão técnica favorável (`PERTINENTE` ou `PERTINENTE_COM_JUSTIFICATIVA`), **a conclusão humana é preservada integralmente** (RN02/RN07). O motor **não gera achado de recusa material**, mas emite um **alerta informativo de divergência** na interface para que a contradição seja revista e fundamentada nos autos. |
| **Evidência Registrada** | Conclusão humana indicando que a pertinência não restou demonstrada/pertinente nos autos, ou registro de resposta preliminar expressamente negativa sem conclusão firmada. |
| **Regra / Motivo** | A conformidade jurídica e orçamentária depende do vínculo entre o objeto e os objetivos estratégicos, competências e conveniência do órgão público (RN02). A contratação deve atender ao interesse público comprovado. |
| **Impacto Potencial** | Risco de despesa pública sem motivação fática suficiente, vulnerabilidade a questionamentos por órgãos de controle e potencial antieconomicidade. |
| **Providência Recomendada** | Restituir os autos ao setor demandante para juntada de justificativas complementares, ou emitir manifestação técnica circunstanciada fundamentando a decisão a ser submetida à autoridade superior. |
| **Classificação** | - Se `conclusao == 'NAO_PERTINENTE'`: sugestão demonstrativa **`IMPEDITIVO`** (sujeita à validação).<br>- Se `conclusao == 'NAO_DEMONSTRADA'`: sugestão demonstrativa **`RELEVANTE`** (sujeita à validação).<br>- Se `conclusao == null` com resposta negativa: **`Classificação pendente de validação humana`**. |
| **Fonte e Situação** | *Fonte:* Práticas de governança de contratações públicas e RN02 de `docs/contexto.md`. *Situação:* **Proposta demonstrativa pendente de aprovação humana.** |
| **Exemplo que Dispara** | `conclusao: "NAO_DEMONSTRADA"`, `respostas: { vinculoPlanejamento: false, ... }` (Cenário 4). |
| **Exemplo que Não Dispara**| `conclusao: "PERTINENTE"`, respostas validadas e justificativa registrada nos autos. |

---

### REG-03 — Condicionante Jurídica Pendente ou em Cumprimento sem Providência Declarada

| Campo | Especificação |
|---|---|
| **Identificador** | `REG-03-CONDICIONANTE-SEM-PROVIDENCIA` |
| **Nome** | Condicionante Jurídica Pendente ou em Cumprimento sem Providência Declarada no Formulário |
| **Regras Vinculadas** | **RN03** (Estrutura do achado), **RN04** (Classificação), **RN07** (Apoio à decisão), **RN11** (Instrução pendente). |
| **Dados Necessários** | `condicionante.descricao`, `condicionante.referenciaParecer`, `condicionante.situacao`, `condicionante.providencia`. |
| **Estados Cobertos** | Condicionante com situação **`pendente`** OU **`em_cumprimento`**, com campo de providência vazio (`providencia == null` ou em branco). |
| **Condição de Disparo** | (`condicionante.situacao == 'pendente'` **OU** `condicionante.situacao == 'em_cumprimento'`) **E** (`condicionante.providencia == null` ou `condicionante.providencia.trim() == ""`). |
| **Diretriz de Classificação** | **`Classificação pendente de validação humana`**. O sistema não presume que a ausência de providência declarada torne a condicionante `IMPEDITIVA`, nem associa a exigência a uma gravidade pré-fixada. A indicação de gravidade é prerrogativa do assessor humano. |
| **Interação com a Interface** | Na Etapa 3 (Conformidade), a interface adverte o usuário e orienta o registro de providência. Em rascunhos retomados ou importações onde a condicionante figure sem ação descrita, o motor gera este apontamento informativo. |
| **Evidência Registrada** | Condicionante jurídica assinalada como pendente ou em cumprimento, sem registro de providência de saneamento no formulário. |
| **Regra / Motivo** | Manifestações jurídicas com ressalvas ou condicionantes requerem tratamento administrativo para atendimento das orientações fixadas pelo órgão consultivo. |
| **Impacto Potencial** | Risco de celebração ou prosseguimento da contratação sem encaminhamento das recomendações expedidas pela consultoria jurídica. |
| **Providência Recomendada** | Examinar o parecer jurídico para identificar a ação saneadora necessária, definindo a providência administrativa, o setor responsável e o cronograma de atendimento. |
| **Classificação** | **`Classificação pendente de validação humana`** (sem sugestões predeterminadas de gravidade, cabendo ao assessor valorar segundo o conteúdo da manifestação jurídica). |
| **Limitação do Formulário** | O formulário atual não possui campos estruturados para metadados de efeito jurídico da condicionante (suspensivo ou resolutivo). O sistema registra essa limitação e não presume dados inexistentes. |
| **Fonte e Situação** | *Fonte:* Boas práticas de instrução processual e controle preventivo de legalidade. *Situação:* **Proposta demonstrativa revisada pendente de aprovação humana.** |
| **Exemplo que Dispara** | Condicionante "Apresentar comprovação de capacidade técnica", `situacao: "pendente"`, `providencia: ""`. |
| **Exemplo que Não Dispara**| Condicionante com `situacao: "atendida"` ou com `providencia` preenchida (esta última tratada pela REG-04). |

---

### REG-04 — Condicionante Jurídica Pendente ou em Cumprimento com Providência Declarada

| Campo | Especificação |
|---|---|
| **Identificador** | `REG-04-CONDICIONANTE-COM-PROVIDENCIA` |
| **Nome** | Condicionante Jurídica Pendente ou em Cumprimento com Providência Declarada no Formulário |
| **Regras Vinculadas** | **RN03** (Estrutura do achado), **RN04** (Classificação), **RN08** (Assinatura com ressalva/saneamento). |
| **Dados Necessários** | `condicionante.descricao`, `condicionante.referenciaParecer`, `condicionante.situacao`, `condicionante.providencia`. |
| **Estados Cobertos** | Condicionante com situação **`pendente`** OU **`em_cumprimento`**, com campo de providência preenchido (`providencia != null` e não vazio). |
| **Condição de Disparo** | (`condicionante.situacao == 'pendente'` **OU** `condicionante.situacao == 'em_cumprimento'`) **E** (`condicionante.providencia != null` e `condicionante.providencia.trim() != ""`). |
| **Distinção Fundamental** | **Providência planejada/declarada NÃO comprova cumprimento da condicionante.** O preenchimento do campo descreve a medida administrativa proposta ou em curso, mas não substitui a comprovação documental autuada no processo. A providência declarada **não reduz automaticamente a classificação de risco**. |
| **Interação com a Interface** | Permite o registro da ação e do responsável na Etapa 3. O motor captura os dados e estrutura o apontamento para conferência do cumprimento e suficiência da medida. |
| **Evidência Registrada** | Condicionante jurídica assinalada como pendente ou em cumprimento, constando no formulário o registro de providência declarada (`condicionante.providencia`). |
| **Regra / Motivo** | A conformidade com a manifestação jurídica requer a comprovação documental do saneamento das condicionantes antes da prática do ato ou a gestão rigorosa de suas ressalvas durante a execução. |
| **Impacto Potencial** | Risco de celebração ou prosseguimento contratual amparado em plano de ação sem a efetiva constatação do cumprimento nos autos processuais. |
| **Providência Recomendada** | Verificar se a providência informada atende integralmente ao parecer jurídico e acompanhar a efetiva juntada da respectiva comprovação documental aos autos. |
| **Classificação** | **`Classificação pendente de validação humana`** (retiradas quaisquer associações presumidas entre exigência prévia/acompanhamento e determinada gravidade). |
| **Limitação do Formulário** | O sistema não valida semântica de providências nem confere autos eletrônicos externos. O assessor humano deve examinar a suficiência e atribuir a gravidade. |
| **Fonte e Situação** | *Fonte:* Gestão de riscos de contratação e RN03/RN04 de `docs/contexto.md`. *Situação:* **Proposta demonstrativa revisada pendente de aprovação humana.** |
| **Exemplo que Dispara** | Condicionante "Apresentar certidão de regularidade perante o FGTS", `situacao: "em_cumprimento"`, `providencia: "Solicitada emissão à contratada via ofício nº 12/2026"`. |
| **Exemplo que Não Dispara**| Condicionante com `situacao: "atendida"` e documento comprobatório autuado. |

---

### REG-05 — Item de Checklist com Conferência em Aberto ("A Confirmar")

| Campo | Especificação |
|---|---|
| **Identificador** | `REG-05-DOCUMENTO-A-CONFIRMAR` |
| **Nome** | Item da Instrução Processual com Conferência em Aberto ("A Confirmar") |
| **Regras Vinculadas** | **RN03** (Estrutura do achado), **RN05** (Sugestão indicativa), **RN11** (Instrução insuficiente). |
| **Dados Necessários** | `itemChecklist.descricao`, `itemChecklist.status`, `itemChecklist.observacao`. |
| **Condição de Disparo** | `itemChecklist.status == 'confirmar'`. |
| **Tratamento de Ausências** | Se o item estiver como `confirmar` e o campo de observação estiver em branco, recomenda-se detalhar a dúvida técnica que motivou a marcação. |
| **Não Presunção de Inexistência nos Autos** | O apontamento reflete dúvida ou pendência de conferência no formulário; **não afirma que o documento inexiste nos autos processuais físicos/digitais**, cabendo a conferência concreta ao assessor. |
| **Evidência Registrada** | Item do checklist de conformidade documental assinalado com o status "A confirmar". |
| **Regra / Motivo** | A instrução processual deve assegurar a higidez das peças obrigatórias. A existência de dúvida não suprida no formulário impede o ateste seguro de regularidade (RN11). |
| **Impacto Potencial** | Risco de prosseguimento da análise com peça documental não localizada ou em dúvida no formulário. |
| **Providência Recomendada** | Realizar diligência no processo para verificar a existência, validade e adequação do documento ou certidão, atualizando o status para `ok` após constatação ou registrando a pendência formal. |
| **Classificação** | **`Classificação pendente de validação humana`** *(removidas sugestões de gravidade baseadas em características que o sistema não consegue verificar, como essencialidade do documento)*. |
| **Limitação do Formulário** | O checklist atual não possui metadados sobre a essencialidade jurídica da peça. O sistema registra essa limitação e confia a classificação ao assessor humano. |
| **Fonte e Situação** | *Fonte:* Checklist procedimental da Administração Pública e RN11 de `docs/contexto.md`. *Situação:* **Proposta demonstrativa pendente de aprovação humana.** |
| **Exemplo que Dispara** | Item "Certidão de Regularidade Fiscal", `status: "confirmar"`, `observacao: "Verificar se a certidão anexada às fls. 30 encontra-se dentro do prazo de validade"`. |
| **Exemplo que Não Dispara**| Item com `status: "ok"` e referência de documento nos autos. |

---

### REG-06 — Item Marcado como Não Aplicável com Justificativa Ausente ou Abaixo do Mínimo Técnico

| Campo | Especificação |
|---|---|
| **Identificador** | `REG-06-NAO-APLICABILIDADE-SEM-JUSTIFICATIVA` |
| **Nome** | Item Marcado como Não Aplicável com Justificativa Ausente ou Abaixo do Mínimo Técnico de Preenchimento |
| **Regras Vinculadas** | **RN03** (Estrutura do achado), **RN04** (Classificação), **RN13** (Consistência de preenchimento). |
| **Dados Necessários** | `itemChecklist.descricao`, `itemChecklist.status`, `itemChecklist.justificativaNaoAplicavel`. |
| **Condição de Disparo** | `itemChecklist.status == 'nao_aplicavel'` **E** (`itemChecklist.justificativaNaoAplicavel == null` ou `itemChecklist.justificativaNaoAplicavel.trim().length < 5`). |
| **Significado do Limite Técnico de 5 Caracteres** | **Trava sintática de interface:** O piso de 5 caracteres atua unicamente como validação técnica de preenchimento na interface.  <br>- **Menos de 5 caracteres NÃO comprova falta de fundamento jurídico;**  <br>- **Cinco ou mais caracteres também NÃO comprovam justificativa adequada ou motivada.**  <br>A avaliação de mérito e suficiência jurídica da justificativa cabe sempre ao assessor humano. |
| **Alcance do "Não se Aplica"** | A marcação "Não se aplica" dispensa **somente a checagem correspondente no protótipo**, permanecendo sujeita à revisão humana. |
| **Título Exato do Achado Sugerido** | **“Item marcado como não aplicável com justificativa ausente ou abaixo do mínimo técnico de preenchimento.”** |
| **Evidência Registrada** | Item do checklist documental assinalado como não aplicável sem justificativa preenchida ou com texto inferior ao mínimo técnico de 5 caracteres. |
| **Regra / Motivo** | Princípio da motivação dos atos administrativos (Lei nº 14.133/2021). A dispensa de exigência padrão requer motivação expressa demonstrando a incompatibilidade com o objeto. |
| **Impacto Potencial** | Risco de dispensa de item da instrução sem o registro da justificativa cabível no formulário. |
| **Providência Recomendada** | Registrar justificativa circunstanciada indicando as razões fáticas ou jurídicas que justificam o afastamento do item no caso concreto, ou reintegrar o item à conferência. |
| **Classificação** | **`Classificação pendente de validação humana`** *(removidas sugestões de gravidade baseadas em características que o sistema não consegue verificar, como cogência da peça)*. |
| **Limitação do Formulário** | O sistema não processa linguagem natural nem analisa a validade jurídica da fundamentação digitada. Essa limitação é documentada e a validação do mérito é confiada ao assessor. |
| **Fonte e Situação** | *Fonte:* Teoria dos motivos determinantes e RN13 de `docs/contexto.md`. *Situação:* **Proposta demonstrativa pendente de aprovação humana.** |
| **Exemplo que Dispara** | Item "Matriz de Riscos", `status: "nao_aplicavel"`, `justificativaNaoAplicavel: ""` ou `"n/a"`. |
| **Exemplo que Não Dispara**| Item com `status: "nao_aplicavel"` e justificativa circunstanciada registrada pelo assessor. |

---

## 4. Matriz de Síntese e Mapeamento de Classificações Preliminares

| Código da Regra | Gatilho Lógico no Estado | Classificação Sugerida ou Estado | Dados Necessários para Decisão Humana | Limitações do Modelo Atual | Soberania da Validação Humana |
|---|---|---|---|---|---|
| `REG-01-VIGENCIA-INCONSISTENTE` | `fim < inicio` e vigência aplicável | **`FORMAL`** *(sugestão demonstrativa preliminar)* | Saber se o erro está apenas na digitação ou se consta na minuta autuada. | Sem campo de conferência de documento original autuado. | Assessor confere a fonte e define soberanamente a classificação. |
| `REG-02-PERTINENCIA-NAO-DEMONSTRADA` | Conclusão humana `NAO_PERTINENTE` ou `NAO_DEMONSTRADA`, ou critérios `false` sem conclusão | - `NAO_PERTINENTE`: **`IMPEDITIVO`**<br>- `NAO_DEMONSTRADA`: **`RELEVANTE`**<br>- Sem conclusão com "Não": **`Classificação pendente`** | Conclusão do assessor e justificativa fática registrada. | Não presume respostas "A avaliar" como negativas. | Assessor decide a pertinência; conclusão humana favorável divergente é preservada com alerta. |
| `REG-03-CONDICIONANTE-SEM-PROVIDENCIA` | Condicionante `pendente` ou `em_cumprimento` com providência vazia | **`Classificação pendente de validação humana`** | Natureza jurídica (prévia ou resolutiva), prazo e efeito suspensivo. | Sem tipologia estruturada de condicionante no formulário. | Assessor avalia a natureza da condicionante e atribui soberanamente a gravidade. |
| `REG-04-CONDICIONANTE-COM-PROVIDENCIA` | Condicionante `pendente` ou `em_cumprimento` com providência preenchida | **`Classificação pendente de validação humana`** | Efetividade da providência declarada e juntada de evidência aos autos. | Providência planejada não comprova cumprimento; sem checagem de autos eletrônicos externos. | Assessor verifica se a providência atende ao parecer e se o cumprimento foi comprovado. |
| `REG-05-DOCUMENTO-A-CONFIRMAR` | Item do checklist marcado como `confirmar` | **`Classificação pendente de validação humana`** | Essencialidade jurídica da peça para a validade do ajuste. | Checklist atual não categoriza itens em essenciais ou acessórios. | Assessor verifica a peça nos autos e classifica a relevância da pendência. |
| `REG-06-NAO-APLICABILIDADE-SEM-JUSTIFICATIVA` | Item `nao_aplicavel` com justificativa < 5 caracteres | **`Classificação pendente de validação humana`** | Legitimidade fática e jurídica da dispensa do requisito. | Piso de 5 caracteres é apenas trava de interface; não avalia suficiência jurídica. | Assessor valida se a fundamentação é cabível e suficiente nos autos. |

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
   - Em estrita observância à governança, condicionantes (`REG-03` e `REG-04`), conferências em aberto (`REG-05`) e dispensas de itens (`REG-06`) não receberão classificações de gravidade impostas de forma determinística/inflexível pelo motor, mantendo a indicação `Classificação pendente de validação humana` e facultando a escolha qualificada ao assessor.
   - Reafirma-se que "Classificação pendente" é um estado de avaliação do apontamento, não uma quinta categoria de gravidade.
3. **Aprovação Funcional do Catálogo:**
   - O catálogo documental da S3.1 foi formalmente aprovado pelo usuário em 25/09/2026 como especificação funcional demonstrativa para desenvolvimento e testes do protótipo (S3.2), sem constituir validação jurídica das regras nem aprovação de processos reais.

---

## 7. Tabela de Decisão para Conclusão Executiva e Sugestão de Encaminhamento (RN08) — Tarefa S4.1

### 7.1. Diretrizes de Governança da Conclusão Executiva

A Etapa 6 (*Resultado & Encaminhamento*) consolida a instrução processual das etapas anteriores (Identificação, Pertinência, Conformidade, Achados e Riscos) em uma recomendação executiva para apoio à decisão da autoridade subscritora, regida pelos seguintes postulados:

1. **Quatro Conclusões Regulamentares Exatas (RN08):**
   Adota-se estritamente a tipologia quadripartida definida na Seção 6 do [docs/contexto.md](file:///c:/Users/79310680253/OneDrive/Documentos/Projetos/conforma-gsasp-retomada/docs/contexto.md):
   - `APTO_PARA_ASSINATURA`
   - `APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA`
   - `RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA`
   - `NAO_RECOMENDAVEL_PARA_ASSINATURA`

2. **Tratamento da Insuficiência de Dados Instrutórios (RN11):**
   - É **expressamente vedada a criação de uma quinta conclusão** (como "Insuficiência de Dados").
   - A falta de dados essenciais, a existência de itens do checklist com status `confirmar` sem resposta, condicionantes sem situação definida, etapas não preenchidas ou dimensões de risco em aberto são tratadas como **motivo/código de fundamentação (`MOT-SANEAMENTO-INSUFICIENCIA-DADOS`)** vinculado determinística e obrigatoriamente à conclusão:
     **`RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA`**.

3. **Consolidação Conservadora da Matriz de Riscos (Maior Nível Observado):**
   - Quando as dimensões *Jurídica*, *Financeira*, *Operacional* e de *Controle* apresentarem níveis de risco heterogêneos, o risco consolidado da análise adotará o **critério conservador do maior nível de risco existente entre as dimensões avaliadas**:
     $$\text{Risco Consolidado} = \max(\text{Jurídica}, \text{Financeira}, \text{Operacional}, \text{Controle})$$
     - Se ao menos uma dimensão for `Crítico` $\rightarrow$ Risco Consolidado = **Crítico**.
     - Senão, se ao menos uma for `Alto` $\rightarrow$ Risco Consolidado = **Alto**.
     - Senão, se ao menos uma for `Moderado` $\rightarrow$ Risco Consolidado = **Moderado**.
     - Senão, se todas forem `Baixo` $\rightarrow$ Risco Consolidado = **Baixo**.
     - Se qualquer dimensão não tiver sido avaliada (`nivel == null`), considera-se haver pendência instrutória, disparando a regra de insuficiência de dados.

4. **Vedação Absoluta a Autorização Automática para Assinatura (RN08, RN12):**
   - Nenhuma combinação algorítmica ou ausência de achados confere ateste automático de conformidade legal ou "autorização automática para assinatura".
   - A saída gerada pelo sistema é **estritamente indicativa**, prestando-se ao auxílio da instrução, permanecendo o juízo conclusivo privativo do assessor técnico e a decisão final indelegável da autoridade competente (Secretário de Estado / Ordenador de Despesas).

5. **Soberania Humana e Invalidação por Alteração Material dos Autos (RN02, RN07, RN10):**
   - O assessor pode divergir motivadamente da conclusão sugerida pelo motor lógico.
   - Qualquer divergência humana exige **justificativa técnica obrigatória registrada nos autos** (mínimo de 10 caracteres) e prevalece sobre a sugestão da máquina.
   - **Salvaguarda RN10 (Invalidação Dinâmica):** Se houver modificação posterior em etapas anteriores (ex.: alteração de dados do processo, reabertura de achado validado, alteração de gravidade de achado ou modificação da matriz de riscos), qualquer validação humana anterior da conclusão é **automaticamente invalidada**, exigindo nova manifestação explícita do assessor.

---

### 7.2. Ordem Estrita de Precedência Lógica (Avaliação Determinística em Cascata)

Para afastar qualquer ambiguidade ou sobreposição de regras, o motor de recomendação avalia os dados processuais em uma **ordem estrita de precedência (P1 a P5)**, do cenário mais restritivo/prejudicial ao mais favorável. A primeira condição satisfeita define a conclusão sugerida e cessa a cascata:

> [!IMPORTANT]
> **Precedência Absoluta de P1 sobre as Demais Camadas:**
> Se houver dados essenciais faltantes, itens do checklist pendentes de conferência (`confirmar`), itens com dispensa (`nao_aplicavel`) desprovidos de justificativa obrigatória, sugestões do motor ainda não avaliadas pelo assessor (`SUGESTAO_SISTEMA`) ou dimensões de risco em aberto (`null`), aplica-se **obrigatoriamente P1** (`RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA`). O motor **jamais avalia P2 (recusa), P3, P4 ou P5 antes de superada a incompletude mínima necessária da instrução e das avaliações humanas**. A expressão "independentemente de achados ou riscos" nas regras P2 refere-se estritamente aos dados já validados, jamais dispensando o afastamento prévio de P1.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ P1: Insuficiência de Dados ou Avaliações Pendentes (RN11, RN12)        │
│     (Campos essenciais nulos, "confirmar" em aberto, "nao_aplicavel"   │
│      sem justificativa, achados sem juízo ou riscos pendentes)         │
│     -> RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Instrução e avaliações mínimas concluídas
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ P2: Óbice Impeditivo no Estado Atual / Recusa (RN02, RN04, RN12)       │
│     (Não pertinente, achado impeditivo validado ou risco crítico)      │
│     -> NAO_RECOMENDAVEL_PARA_ASSINATURA                                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Sem óbice impeditivo, crítico ou recusa
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ P3: Necessidade de Saneamento Material / Risco Alto (RN02, RN03, RN12) │
│     (Pertinência não demonstrada, item de checklist pendente, achado   │
│      relevante, condicionante pendente de ato prévio ou risco alto)    │
│     -> RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Sem pendências materiais/relevantes/alto risco
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ P4: Regularidade com Ressalva Não Impeditiva (RN04, RN08, RN12)        │
│     (Achados formais, melhorias, risco moderado e/ou pertinência       │
│      atestada com justificativa — admite múltiplos motivos MOT)        │
│     -> APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Sem ressalvas e 4x risco Baixo
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ P5: Plena Regularidade Demonstrada (RN08)                              │
│     (Zero achados, itens do checklist resolvidos [conforme ou          │
│      nao_aplicavel justificado], condicionantes cumpridas, 4x Baixo)   │
│     -> APTO_PARA_ASSINATURA                                            │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 7.3. Catálogo de Códigos de Motivo / Fundamentação da Conclusão

| Código de Motivo | Denominação Padronizada | Conclusão Vinculada | Descrição da Hipótese |
|---|---|---|---|
| `MOT-SANEAMENTO-INSUFICIENCIA-DADOS` | Insuficiência de Dados Instrutórios Essenciais | `RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA` | Campos cadastrais essenciais ausentes, itens do checklist com status "confirmar" sem diligência, itens "nao_aplicavel" sem justificativa obrigatória, ou condicionantes sem situação definida (P1). |
| `MOT-SANEAMENTO-AVALIACOES-PENDENTES` | Etapas Anteriores Não Concluídas | `RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA` | Sugestões de achados do motor no estado `SUGESTAO_SISTEMA` sem juízo humano, ou dimensões de risco em estado `Pendente` de avaliação (`null`) (P1). |
| `MOT-RECUSA-PERTINENCIA-NEGATIVA` | Pertinência Institucional Não Pertinente | `NAO_RECOMENDAVEL_PARA_ASSINATURA` | Assessor concluiu soberanamente que o objeto não é pertinente às finalidades da Pasta (P2). |
| `MOT-RECUSA-ACHADO-IMPEDITIVO` | Presença de Achado Validado Impeditivo | `NAO_RECOMENDAVEL_PARA_ASSINATURA` | Existência de ao menos um achado validado com gravidade `IMPEDITIVO` nos autos, inviabilizando a assinatura no estado atual do processo (P2). |
| `MOT-RECUSA-RISCO-CRITICO` | Matriz de Risco em Nível Crítico | `NAO_RECOMENDAVEL_PARA_ASSINATURA` | Ao menos uma dimensão da matriz de riscos avaliada no nível `Crítico` pelo assessor (P2). |
| `MOT-SANEAMENTO-PERTINENCIA-NAO-DEMONSTRADA` | Pertinência Institucional Não Demonstrada | `RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA` | Ausência de comprovação de benefício público ou motivação insuficiente que exige complementação instrutória (P3). |
| `MOT-SANEAMENTO-CHECKLIST-PENDENTE` | Pendência Conhecida em Item de Checklist | `RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA` | Item obrigatório do checklist de conformidade documental com status "pendente", configurando deficiência instrutória conhecida que exige regularização antes da assinatura (P3). |
| `MOT-SANEAMENTO-ACHADO-RELEVANTE` | Presença de Achado Validado Relevante | `RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA` | Existência de achado validado como `RELEVANTE` que demanda saneamento prévio antes da formalização do ato (P3). |
| `MOT-SANEAMENTO-CONDICIONANTE-PENDENTE` | Condicionante Jurídica Pendente de Cumprimento | `RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA` | Condicionante de parecer jurídico pendente de providência saneadora indispensável antes da subscrição (P3). |
| `MOT-SANEAMENTO-RISCO-ALTO` | Matriz de Risco em Nível Alto | `RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA` | Nível consolidado de risco avaliado como `Alto`, demandando plano de contingência ou saneamento prévio (P3). |
| `MOT-RESSALVA-ACHADO-FORMAL` | Presença de Achados Validados Formais | `APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA` | Inconsistências de forma ou cadastrais sem gravidade material que recomendam advertência ou retificação sem travar a assinatura (P4). |
| `MOT-RESSALVA-MELHORIA` | Recomendações de Aprimoramento e Boas Práticas | `APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA` | Sugestões de governança ou melhoria procedimental futura que não inviabilizam a celebração atual (P4). |
| `MOT-RESSALVA-RISCO-MODERADO` | Matriz de Risco em Nível Moderado | `APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA` | Riscos controláveis (isolados ou concorrentes com achados formais) que exigem monitoramento setorial durante a execução contratual (P4). |
| `MOT-RESSALVA-PERTINENCIA-COM-JUSTIFICATIVA` | Pertinência Atestada Mediante Justificativa | `APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA` | Pertinência válida atestada mediante justificativa técnica extraordinária acolhida pelo assessor, cuja fundamentação deve constar destacada no relatório executivo (P4). |
| `MOT-APTIDAO-PLENA-REGULARIDADE` | Plena Conformidade da Instrução Processual | `APTO_PARA_ASSINATURA` | Pertinência estritamente favorável (sem ressalvas), todos os itens do checklist resolvidos (conforme ou nao_aplicavel justificado), condicionantes cumpridas, zero achados impeditivos/formais e todas as 4 dimensões de risco Baixo (P5). |

> [!NOTE]
> **Regra de Coexistência de Motivos de Ressalva na Precedência P4:**
> Na hipótese de coexistirem múltiplos fatores de ressalva em um mesmo processo (ex.: presença concomitante de um achado formal, risco operacional moderado e pertinência atestada com justificativa), todos convergem determinística e exclusivamente para a mesma conclusão (`APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA`). O motor associará e retornará a lista completa dos respectivos códigos `MOT-*` (`codigosMotivo: string[]`), garantindo rastreabilidade e fundamentação integral na saída executiva.

---

### 7.4. Tabela Completa de Decisão Lógica (RN08)

| Regra ID | Precedência | Condições de Entrada (Pertinência + Achados + Riscos + Checklist) | Conclusão Sugerida pelo Sistema | Código de Motivo | Providência Sugerida na Saída Executiva | Exige Saneamento? | Salvaguarda Aplicável |
|---|---|---|---|---|---|---|---|
| **DEC-01** | **P1** (Dados Faltantes / Conferências em Aberto) | Dados essenciais ausentes OU checklist com item `confirmar` pendente OU item `nao_aplicavel` sem justificativa obrigatória OU condicionante sem situação/providência | `RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA` | `MOT-SANEAMENTO-INSUFICIENCIA-DADOS` | Diligenciar ao setor demandante para completar a instrução, justificar itens dispensados e anexar documentos pendentes de conferência. | **Sim** (Instrução) | **RN11**: Dados incompletos não autorizam aptidão automática. Precede P2 a P5. |
| **DEC-02** | **P1** (Avaliações Incompletas) | Achados com status `SUGESTAO_SISTEMA` sem validação/rejeição OU dimensão de risco com nível `Pendente` (`null`) | `RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA` | `MOT-SANEAMENTO-AVALIACOES-PENDENTES` | Concluir a avaliação técnica humana dos achados e da matriz de riscos nas Etapas 4 e 5. | **Sim** (Avaliação) | **RN05/RN12**: Juízo humano obrigatório antes do fechamento. Precede P2 a P5. |
| **DEC-03** | **P2** (Pertinência Negativa) | Instrução e avaliações mínimas concluídas (sem pendências P1); pertinência validada como `NAO_PERTINENTE` (independentemente de achados validados ou riscos) | `NAO_RECOMENDAVEL_PARA_ASSINATURA` | `MOT-RECUSA-PERTINENCIA-NEGATIVA` | Arquivar o processo ou indeferir a solicitação por ausência de aderência aos objetivos institucionais da Pasta. | **Não** (Recusa) | **RN02**: Pertinência é requisito primário e prejudicial aos demais. Avaliada após superação de P1. |
| **DEC-04** | **P2** (Achado Impeditivo) | Instrução e avaliações mínimas concluídas (sem pendências P1); ao menos 1 achado validado como `IMPEDITIVO` nos autos | `NAO_RECOMENDAVEL_PARA_ASSINATURA` | `MOT-RECUSA-ACHADO-IMPEDITIVO` | Não recomendar a assinatura enquanto subsistir o achado impeditivo. Se a causa admitir correção, promover o saneamento e submeter o processo a nova análise; se insanável, registrar o óbice e abster-se da subscrição. | **Não** (para celebração atual); saneamento condiciona eventual ciclo futuro | **RN04**: Achado impeditivo obsta formalmente a subscrição no estado atual dos autos. Avaliada após P1. |
| **DEC-05** | **P2** (Risco Crítico) | Instrução e avaliações mínimas concluídas (sem pendências P1); nível consolidado de risco avaliado como `Crítico` (ao menos 1 dimensão crítica, sem achados impeditivos) | `NAO_RECOMENDAVEL_PARA_ASSINATURA` | `MOT-RECUSA-RISCO-CRITICO` | Submeter o quadro de riscos à autoridade competente, destacando a existência de nível consolidado CRÍTICO e os fundamentos registrados pelo assessor, com sugestão indicativa de não assinatura. | **Não** (Óbice por Risco Crítico) | **RN12**: Risco crítico sob juízo fundamentado do assessor; decisão cabe à autoridade. Avaliada após P1. |
| **DEC-06** | **P3** (Pertinência Não Demonstrada) | Sem pendências P1 nem óbices P2; pertinência validada como `NAO_DEMONSTRADA` | `RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA` | `MOT-SANEAMENTO-PERTINENCIA-NAO-DEMONSTRADA` | Retornar ao setor solicitante para complementar o Estudo Técnico Preliminar e justificar a necessidade pública. | **Sim** (Motivação) | **RN02**: Falta de demonstração de pertinência exige saneamento fático prévio. |
| **DEC-07A** | **P3** (Item de Checklist Pendente) | Sem pendências P1 nem óbices P2; ao menos 1 item do checklist com status `pendente` (deficiência documental conhecida) | `RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA` | `MOT-SANEAMENTO-CHECKLIST-PENDENTE` | Notificar formalmente o setor demandante/gestor para providenciar a juntada do documento pendente nos autos antes da subscrição. | **Sim** (Saneamento Documental) | **RN04/RN11**: Pendência documental conhecida exige saneamento prévio à subscrição. |
| **DEC-07B** | **P3** (Achado Relevante / Condicionante Jurídica) | Sem pendências P1 nem óbices P2; ao menos 1 achado validado como `RELEVANTE` OU condicionante jurídica `pendente`/`em_cumprimento` exigindo ato prévio | `RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA` | `MOT-SANEAMENTO-ACHADO-RELEVANTE` (ou `MOT-SANEAMENTO-CONDICIONANTE-PENDENTE`) | Notificar o fiscal/gestor para cumprir condicionante ou sanear a impropriedade relevante antes da assinatura. | **Sim** (Saneamento Material) | **RN03/RN04**: Relevantes e condicionantes exigem correção prévia à subscrição. |
| **DEC-08** | **P3** (Risco Alto) | Sem pendências P1 nem óbices P2; sem pendências documentais ou achados relevantes; nível consolidado de risco `Alto` | `RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA` | `MOT-SANEAMENTO-RISCO-ALTO` | Elaborar e juntar matriz de contingência ou mitigar os fatores que elevaram o risco antes da subscrição. | **Sim** (Mitigação) | **RN12**: Risco alto exige reanálise ou salvaguardas adicionais. |
| **DEC-09A** | **P4** (Ressalva por Achado Formal) | Sem pendências P1, P2 ou P3; itens do checklist resolvidos (`conforme` ou `nao_aplicavel` justificado); ao menos 1 achado validado como `FORMAL` | `APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA` | `MOT-RESSALVA-ACHADO-FORMAL` | Dar ciência à autoridade e registrar no termo de autorização as recomendações formais a serem observadas na execução. | **Não** (Ressalva) | **RN04/RN08**: Falhas formais não impedem a celebração; admite coexistência em P4. |
| **DEC-09B** | **P4** (Ressalva por Recomendação de Melhoria) | Sem pendências P1, P2 ou P3; itens do checklist resolvidos; ao menos 1 achado validado como `MELHORIA` (sem achados formais) | `APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA` | `MOT-RESSALVA-MELHORIA` | Registrar no relatório executivo as sugestões de governança e aprimoramento procedimental para contratações futuras. | **Não** (Ressalva) | **RN04/RN08**: Sugestões de melhoria não impedem a celebração; admite coexistência em P4. |
| **DEC-09C** | **P4** (Ressalva por Risco Moderado) | Sem pendências P1, P2 ou P3; itens do checklist resolvidos; risco consolidado avaliado como `Moderado` (isolado ou concorrente) | `APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA` | `MOT-RESSALVA-RISCO-MODERADO` | Registrar recomendações de monitoramento setorial e mitigação dos riscos operacionais/financeiros durante a execução contratual. | **Não** (Ressalva) | **RN08/RN12**: Risco moderado permite assinatura com plano de controle; admite coexistência em P4. |
| **DEC-09D** | **P4** (Ressalva por Pertinência com Justificativa) | Sem pendências P1, P2 ou P3; itens do checklist resolvidos; pertinência validada como `PERTINENTE_COM_JUSTIFICATIVA` | `APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA` | `MOT-RESSALVA-PERTINENCIA-COM-JUSTIFICATIVA` | Fazer constar expressamente na conclusão executiva a motivação fática e técnica acolhida que fundamentou a pertinência do ajuste. | **Não** (Ressalva) | **RN02/RN08**: Pertinência válida com exigência de transparência da motivação; admite coexistência em P4. |
| **DEC-10** | **P5** (Plena Regularidade) | Sem pendências P1, P2 ou P3; pertinência estritamente `PERTINENTE`; todos os itens do checklist resolvidos (`conforme` OU `nao_aplicavel` com justificativa válida, com zero itens `pendente` ou `confirmar`); todas as condicionantes cumpridas; zero achados validados; todas as 4 dimensões de risco `Baixo` | `APTO_PARA_ASSINATURA` | `MOT-APTIDAO-PLENA-REGULARIDADE` | Encaminhar os autos à autoridade competente para deliberação e subscrição do instrumento. | **Não** (Regular) | **RN07/RN08**: Conclusão indicativa; itens dispensados com justificativa válida admitem P5; assinatura é decisão humana indelegável. |

---

### 7.5. Exemplos de Cenários Representativos

Para atestar o determinismo e a totalidade da tabela de decisão, os seguintes 17 cenários representativos cobrem todas as regras e camadas de precedência:

1. **Cenário 1 — Aquisição Regular Plena (Itens Conformes):**
   - *Entrada:* Pertinência `PERTINENTE`, checklist 100% `conforme`, condicionantes atendidas, 0 achados validados, matriz de risco com as 4 dimensões em `Baixo`.
   - *Aplicação:* Atende a **DEC-10 (Precedência P5)**.
   - *Conclusão:* `APTO_PARA_ASSINATURA`.
   - *Motivo:* `MOT-APTIDAO-PLENA-REGULARIDADE`.

2. **Cenário 2 — Aquisição Regular com Item Dispensado Justificado (`nao_aplicavel` Válido):**
   - *Entrada:* Pertinência `PERTINENTE`, 5 itens `conforme` e 1 item `nao_aplicavel` devidamente fundamentado ("Inaplicável por se tratar de inexigibilidade com fornecedor exclusivo"), 0 itens `pendente` ou `confirmar`, condicionantes atendidas, 0 achados, riscos 4x `Baixo`.
   - *Aplicação:* Atende a **DEC-10 (Precedência P5)** — itens justificados são considerados formalmente resolvidos.
   - *Conclusão:* `APTO_PARA_ASSINATURA`.
   - *Motivo:* `MOT-APTIDAO-PLENA-REGULARIDADE`.

3. **Cenário 3 — Aditivo de Prazo com Item Formal Secundário:**
   - *Entrada:* Pertinência `PERTINENTE`, checklist resolvido, 1 achado validado como `FORMAL` (erro material de digitação na minuta), riscos 4x `Baixo`.
   - *Aplicação:* Atende a **DEC-09A (Precedência P4)**.
   - *Conclusão:* `APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA`.
   - *Motivo:* `MOT-RESSALVA-ACHADO-FORMAL`.

4. **Cenário 4 — Recomendação de Melhoria Procedimental Isolada:**
   - *Entrada:* Pertinência `PERTINENTE`, checklist resolvido, 1 achado validado como `MELHORIA`, 0 formais, riscos 4x `Baixo`.
   - *Aplicação:* Atende a **DEC-09B (Precedência P4)**.
   - *Conclusão:* `APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA`.
   - *Motivo:* `MOT-RESSALVA-MELHORIA`.

5. **Cenário 5 — Contratação de Serviços com Risco Operacional Moderado Isolado (Zero Achados):**
   - *Entrada:* Pertinência `PERTINENTE`, checklist resolvido, 0 achados validados, dimensões: Jurídica `Baixo`, Financeira `Baixo`, Controle `Baixo`, Operacional `Moderado` (risco consolidado = `Moderado`).
   - *Aplicação:* Atende a **DEC-09C (Precedência P4)**.
   - *Conclusão:* `APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA`.
   - *Motivo:* `MOT-RESSALVA-RISCO-MODERADO`.

6. **Cenário 6 — Pertinência Atestada Mediante Justificativa Isolada:**
   - *Entrada:* Pertinência validada como `PERTINENTE_COM_JUSTIFICATIVA`, checklist 100% resolvido, condicionantes cumpridas, 0 achados, riscos 4x `Baixo`.
   - *Aplicação:* Atende a **DEC-09D (Precedência P4)**.
   - *Conclusão:* `APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA`.
   - *Motivo:* `MOT-RESSALVA-PERTINENCIA-COM-JUSTIFICATIVA`.

7. **Cenário 7 — Coexistência de Múltiplas Ressalvas P4:**
   - *Entrada:* Pertinência `PERTINENTE_COM_JUSTIFICATIVA`, checklist resolvido, 1 achado validado como `FORMAL`, nível consolidado de risco `Moderado`.
   - *Aplicação:* Atende concorrentemente a **DEC-09A, DEC-09C e DEC-09D (Precedência P4)**.
   - *Conclusão:* `APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA`.
   - *Motivos Associados:* `['MOT-RESSALVA-ACHADO-FORMAL', 'MOT-RESSALVA-RISCO-MODERADO', 'MOT-RESSALVA-PERTINENCIA-COM-JUSTIFICATIVA']`.

8. **Cenário 8 — Checklist de Conformidade com Item Pendente Conhecido:**
   - *Entrada:* Pertinência `PERTINENTE`, ao menos 1 item do checklist com status `pendente` (ex.: falta Certidão de Regularidade do FGTS), zero achados impeditivos, sem risco crítico.
   - *Aplicação:* Atende a **DEC-07A (Precedência P3)**.
   - *Conclusão:* `RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA`.
   - *Motivo:* `MOT-SANEAMENTO-CHECKLIST-PENDENTE`.

9. **Cenário 9 — Pendência de Caução Contratual Prévia (Condicionante Jurídica Pendente / Achado Relevante):**
   - *Entrada:* Pertinência `PERTINENTE`, condicionante jurídica `pendente` de comprovação da caução de 5%, achado validado `RELEVANTE`.
   - *Aplicação:* Atende a **DEC-07B (Precedência P3)**.
   - *Conclusão:* `RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA`.
   - *Motivo:* `MOT-SANEAMENTO-ACHADO-RELEVANTE` (ou `MOT-SANEAMENTO-CONDICIONANTE-PENDENTE`).

10. **Cenário 10 — Estudo Técnico Preliminar Insuficiente (Pertinência Não Demonstrada):**
    - *Entrada:* Assessor validou pertinência como `NAO_DEMONSTRADA`, zero achados impeditivos, sem risco crítico.
    - *Aplicação:* Atende a **DEC-06 (Precedência P3)**.
    - *Conclusão:* `RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA`.
    - *Motivo:* `MOT-SANEAMENTO-PERTINENCIA-NAO-DEMONSTRADA`.

11. **Cenário 11 — Risco Consolidado Alto sem Achados Relevantes:**
    - *Entrada:* Pertinência `PERTINENTE`, 0 achados validados, dimensão Financeira avaliada como `Alto` (risco consolidado = `Alto`).
    - *Aplicação:* Atende a **DEC-08 (Precedência P3)**.
    - *Conclusão:* `RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA`.
    - *Motivo:* `MOT-SANEAMENTO-RISCO-ALTO`.

12. **Cenário 12 — Checklist com Item "confirmar" ou "nao_aplicavel" sem Justificativa:**
    - *Entrada:* Checklist com item "Licença Ambiental" no status `confirmar` pendente de diligência, ou marcado como `nao_aplicavel` com justificativa em branco.
    - *Aplicação:* Atende a **DEC-01 (Precedência P1)**.
    - *Conclusão:* `RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA`.
    - *Motivo:* `MOT-SANEAMENTO-INSUFICIENCIA-DADOS`.

13. **Cenário 13 — Precedência P1 com Dados Faltantes em Processo com Achado Impeditivo:**
    - *Entrada:* Dados essenciais ausentes acompanhados de achado com gravidade `IMPEDITIVO`.
    - *Aplicação:* Atende a **DEC-01 (Precedência P1)** — P1 tem precedência absoluta sobre P2.
    - *Conclusão:* `RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA`.
    - *Motivo:* `MOT-SANEAMENTO-INSUFICIENCIA-DADOS`.

14. **Cenário 14 — Avaliações Humanas Incompletas (Achado ou Risco Pendente):**
    - *Entrada:* Achados sugeridos pelo motor no status `SUGESTAO_SISTEMA` sem juízo do assessor, ou dimensão de risco com nível não selecionado (`null`).
    - *Aplicação:* Atende a **DEC-02 (Precedência P1)**.
    - *Conclusão:* `RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA`.
    - *Motivo:* `MOT-SANEAMENTO-AVALIACOES-PENDENTES`.

15. **Cenário 15 — Objeto Estranho às Competências da SESP-MT com P1 Superada:**
    - *Entrada:* Instrução e avaliações completas; assessor validou pertinência como `NAO_PERTINENTE`.
    - *Aplicação:* Atende a **DEC-03 (Precedência P2)**.
    - *Conclusão:* `NAO_RECOMENDAVEL_PARA_ASSINATURA`.
    - *Motivo:* `MOT-RECUSA-PERTINENCIA-NEGATIVA`.

16. **Cenário 16 — Licitação com Achado Impeditivo com P1 Superada:**
    - *Entrada:* Instrução completa (sem P1 pendente); assessor validou 1 achado como `IMPEDITIVO`.
    - *Aplicação:* Atende a **DEC-04 (Precedência P2)**.
    - *Conclusão:* `NAO_RECOMENDAVEL_PARA_ASSINATURA`.
    - *Motivo:* `MOT-RECUSA-ACHADO-IMPEDITIVO`.

17. **Cenário 17 — Risco Crítico Isolado em Matriz Heterogênea:**
    - *Entrada:* Instrução e achados sem óbices, porém dimensão Financeira avaliada como `Crítico` (risco consolidado = `Crítico`).
    - *Aplicação:* Atende a **DEC-05 (Precedência P2)**.
    - *Conclusão:* `NAO_RECOMENDAVEL_PARA_ASSINATURA`.
    - *Motivo:* `MOT-RECUSA-RISCO-CRITICO`.

---

### 7.6. Ambiguidades Mapeadas e Decisões de Governança

Para conhecimento e decisão prévia da equipe humana antes da codificação TypeScript (S4.2):

1. **Momento da Eficácia das Condicionantes Jurídicas:**
   - *Situação:* Nem toda condicionante exige cumprimento *anterior* à assinatura; algumas são de cumprimento *contínuo/posterior* (ex.: acompanhamento contratual, extração mensal de certidões).
   - *Tratamento adotado:* Como o modelo atual do formulário dispõe apenas de `situacao: 'em_cumprimento'` sem detalhamento de termo suspensivo, toda condicionante em cumprimento que gere achado classificado como `RELEVANTE` pelo assessor exigirá saneamento antes da assinatura (`DEC-07B`). Se o assessor entender que o cumprimento é diferido na execução, caberá a ele classificar o achado como `FORMAL` ou divergir motivadamente da conclusão sugerida.
2. **Pertinência com Justificativa (`PERTINENTE_COM_JUSTIFICATIVA`):**
   - *Decisão homologada:* Trata-se como pertinência válida, porém gerando ressalva específica (`MOT-RESSALVA-PERTINENCIA-COM-JUSTIFICATIVA` em `DEC-09D`), com determinação expressa de fazer constar no relatório executivo e no termo de autorização a motivação técnica e fática extraordinária que sustentou o juízo de pertinência.
3. **Precedência P1 sobre P2 e Natureza da Classificação Impeditiva (DEC-04 e DEC-05):**
   - *Decisão homologada:* Pendências instrutórias ou avaliações em aberto barram a análise antes de qualquer juízo de mérito (P1 precede P2). O achado `IMPEDITIVO` obsta a assinatura no estado atual do processo; se a causa admitir correção, caberá saneamento e nova submissão; se for insanável, registra-se a impossibilidade de subscrição. No risco `Crítico`, a providência orienta-se neutra e tecnicamente aos fundamentos do assessor, sem inferir automaticamente probabilidade de dano severo.
4. **Tratamento Rigoroso dos Quatro Estados do Checklist de Conformidade:**
   - *Decisão homologada:*
     - `confirmar`: Permanece em **P1** (`MOT-SANEAMENTO-INSUFICIENCIA-DADOS` / `DEC-01`), pois traduz diligência humana ou conferência ainda não concluída.
     - `pendente`: Ingressa em **P3** (`MOT-SANEAMENTO-CHECKLIST-PENDENTE` / `DEC-07A`), traduzindo deficiência instrutória conhecida que exige juntada prévia do documento pelo demandante.
     - `nao_aplicavel` com justificativa válida: Considera-se formalmente resolvido para fins da cascata decisória; não impede **P4** nem **P5** (`DEC-10`).
     - `nao_aplicavel` sem justificativa obrigatória: Trata-se em **P1** (`MOT-SANEAMENTO-INSUFICIENCIA-DADOS` / `DEC-01`) como instrução incompleta por ausência de motivação da dispensa.
5. **Divergência Humana na Conclusão Executiva:**
   - Se o assessor alterar a conclusão (ex.: de `RETORNAR_PARA_SANEAMENTO` para `APTO_COM_RESSALVA`), a interface exigirá campo de justificativa obrigatório e exibirá um selo visual: `Divergência Registrada pelo Assessor — Prevalece o Juízo Humano (RN02/RN07)`.
6. **Invalidação Dinâmica por Modificação Material Posterior (RN10):**
   - Qualquer validação anterior da conclusão executiva perde a validade se forem alterados dados cadastrais, checklist, condicionantes, gravidade de achados ou níveis da matriz de riscos, forçando nova conferência e fechamento pelo assessor.

---

### 7.7. Declaração Formal de Totalidade e Determinismo da Tabela de Decisão

Atesta-se formalmente para fins de homologação da especificação funcional (S4.1):

1. **Totalidade Lógica (Ausência de Lacunas):**
   - O domínio de entrada composto pelo produto cartesiano dos estados possíveis de Pertinência ($\{PERTINENTE, PERTINENTE\_COM\_JUSTIFICATIVA, NAO\_DEMONSTRADA, NAO\_PERTINENTE\}$), Checklist ($\{conforme, confirmar, pendente, nao\_aplicavel \text{ com justificativa}, nao\_aplicavel \text{ sem justificativa}\}$), Condicionantes ($\{cumprida, pendente, em\_cumprimento, dispensada\}$), Achados Validados ($\{IMPEDITIVO, RELEVANTE, FORMAL, MELHORIA, nenhum\}$) e Matriz de Riscos ($\{Crítico, Alto, Moderado, Baixo, pendente\}$) possui mapeamento exaustivo e unívoco. Não existe qualquer tupla válida de dados processuais que resulte em estado não tratado ou indefinido.

2. **Determinismo Estrito (Inexistência de Ambiguidade):**
   - A ordenação em cascata $P1 \rightarrow P2 \rightarrow P3 \rightarrow P4 \rightarrow P5$ opera como um circuito lógico de prioridade de corte antecipado (*short-circuit evaluation*). A satisfação da primeira camada interrompe a avaliação, garantindo que exatamente **uma** das quatro conclusões regulamentares seja produzida para qualquer entrada.
   - Na camada P4, na hipótese de confluência de múltiplos fatores de ressalva (achados formais, melhorias, risco moderado e/ou pertinência justificada), a conclusão permanece determinística e unívoca (`APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA`), sendo gerada a agregação de todos os respectivos códigos `MOT-*` no vetor de motivos associados (`codigosMotivo: string[]`).

3. **Conformidade com os Princípios Institucionais da SESP-MT:**
   - Preservação integral da soberania do juízo técnico do assessor (RN02 e RN07).
   - Inexistência de autorização automática para celebração (RN08 e RN12).
   - Salvaguarda mandatória de integridade e não regressão por alteração material posterior (RN10).
   - Fundamentação padronizada vinculada exclusivamente ao catálogo quadruplo de conclusões (RN08 e RN11).

