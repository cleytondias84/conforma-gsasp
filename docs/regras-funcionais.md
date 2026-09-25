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
