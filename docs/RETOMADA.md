# CONFORMA GSASP — Guia de Retomada do Projeto

Documento de transição e estado do projeto para continuidade em outro computador ou sessão.
Data do último registro: 01/10/2026.
**Marco de Congelamento do MVP Demonstrativo:** Tag `v0.1.0-mvp-demo` (concluído, apresentado e validado com nota 10).
**Branch de trabalho ativa:** `s5-ingestao-auditoria` (Nova Fase: Sprint 5 — Ingestão Inteligente + Trilha de Auditoria Humano × IA × Sistema).
**Commit-base:** `74225d1`.
**Status dos testes automatizados:** 157 aprovados, 0 falhas, 20 suítes. Build validado com sucesso.
**Caminho local da pasta do projeto:**
`C:\Users\79310680253\OneDrive\Documentos\Projetos\conforma-gsasp-retomada` (trabalho) / `C:\Users\cleyt\OneDrive\Documentos\Projetos\conforma-gsasp-retomada` (casa)

---

## 1. Status Geral do Projeto
- **Sprint 1 — Fundação, arquitetura e PWA:** 100% CONCLUÍDA, PUBLICADA E CONFERIDA.
  - Repositório oficial: [https://github.com/cleytondias84/conforma-gsasp](https://github.com/cleytondias84/conforma-gsasp)
  - Site publicado: [https://cleytondias84.github.io/conforma-gsasp/](https://cleytondias84.github.io/conforma-gsasp/)
  - Conferência em produção confirmada pelo usuário em 24/09/2026.
- **Sprint 2 — Formulário de conformidade e persistência local:** 100% CONCLUÍDA E HOMOLOGADA (S2.1 a S2.6).
  - `S2.1` (Identificação do Instrumento): 100% homologada.
  - `S2.2` (Pertinência Institucional): 100% homologada.
  - `S2.3` (Conformidade Documental e Condicionantes): 100% homologada.
  - `S2.4` (Persistência Local com IndexedDB): 100% homologada.
  - `S2.5` (Papéis de Usuário e Permissões Simuladas): 100% HOMOLOGADA.
  - `S2.6` (Revisão do Cache do PWA e Retomada Offline): 100% HOMOLOGADA.
- **Sprint 3 — Motor de regras, achados e riscos:** 100% CONCLUÍDA E HOMOLOGADA (S3.1 a S3.6).
  - `S3.1` (Catálogo de Regras Funcionais em docs/regras-funcionais.md): 100% HOMOLOGADA PARA PROTOTIPAGEM.
    - Catálogo normativo e funcional estruturado com 6 regras determinísticas (`REG-01` a `REG-06`).
    - **Aprovação Funcional (25/09/2026):** Aprovado pelo usuário como especificação funcional demonstrativa para desenvolvimento e testes do protótipo (não representa validação jurídica das regras nem aprovação de processos reais).
    - **Salvaguardas Mandatórias Registradas:**
      1. Preservação integral das validações existentes de campos obrigatórios e do salvamento de rascunhos locais.
      2. Condicionante em cumprimento continua pendente de avaliação humana, mesmo com providência preenchida.
      3. O mínimo técnico de caracteres não comprova adequação ou suficiência da justificativa.
  - `S3.2` (Motor de Regras em src/domain/regras.ts e Testes): 100% CONCLUÍDA E TESTADA.
    - Implementado motor puramente determinístico em `src/domain/regras.ts` aplicando as 6 regras do catálogo sem IA externa.
    - Estrutura completa de achados vinculando Evidência &rarr; Regra/Motivo &rarr; Impacto &rarr; Providência &rarr; Responsável (RN03).
    - Separação formal de classificação sugerida (`classificacaoSugerida`), estado de validação (`estadoValidacao: 'SUGESTAO_SISTEMA'`) e decisão do assessor (`classificacaoValidada: null`).
    - "Classificação pendente" tratada rigorosamente como estado de avaliação (`classificacaoSugerida === null`), sem inventar uma quinta gravidade.
    - Preservação da conclusão humana em divergências da REG-02 com alerta de revisão, sem achado de recusa material.
    - Ausência de dados ou de achados nunca convertida em aprovação automática para assinatura.
    - Imutabilidade comprovada: objetos de entrada são tratados como somente leitura.
    - **48 testes unitários aprovados via `npm test`** (18 testes dedicados da S3.2).
    - **Compilação e empacotamento PWA aprovados via `npm.cmd run build` com 0 erros**.
  - `S3.3` (src/pages/achados.ts e Serviço de Validação Humana): 100% CONCLUÍDA E HOMOLOGADA.
    - Implementado em `src/pages/achados.ts`, `src/pages/achados.test.ts`, `src/router.ts`, `src/style.css`, `src/domain/tipos.ts` e `src/services/armazenamento.ts`.
    - Integração plena com o motor determinístico S3.2 via `sincronizarAchadosComMotor()`.
    - Exibição de cada sugestão com anatomia RN03: *Regra de Origem*, *Evidência dos Autos*, *Regra/Motivo*, *Impacto Potencial*, *Providência Recomendada* e *Setor Responsável*.
    - Desacoplamento explícito entre Classificação Sugerida pelo Sistema, Classificação Validada pelo Assessor e Estado de Validação.
    - Ações completas de revisão: validação direta, alteração de classificação, rejeição com justificativa obrigatória registrada, reabertura para revisão e achados manuais com anatomia completa.
    - Governança de perfis: bloqueio de operações para perfis somente leitura (Leitor e Aprovador).
    - Preservação de revisões anteriores sem duplicidades e detecção de alterações nos dados de origem (RN10) com alerta de nova revisão.
    - Separação visual entre Alertas de Instrução (RN11), Divergências Humanas (RN02/RN07) e Achados de Desconformidade.
    - Salvaguarda RN11 ostensiva: ausência de achados não constitui aprovação automática para assinatura.
    - Persistência em rascunhos locais com IndexedDB/localStorage.
    - **57 testes unitários aprovados via `npm test`** (9 novos testes dedicados da S3.3).
    - **Compilação e empacotamento PWA aprovados via `npm.cmd run build` com 0 erros**.
    - **Testes manuais consolidados e homologados pelo usuário (25/09 e 28/09/2026):**
      1. Geração da sugestão REG-05, inicialmente com classificação pendente.
      2. Bloqueio da validação sem escolha explícita de classificação de gravidade.
      3. Validação como `RELEVANTE` e posterior alteração da gravidade para `FORMAL`.
      4. Preservação da validação e da classificação após salvar rascunho e recarregar a página (F5).
      5. Bloqueio de edição e validação nos perfis `Leitor` e `Aprovador` (modo consulta).
      6. Aviso de alteração dos dados de origem (RN10) exibido corretamente, sem duplicidade de apontamentos.
      7. Reabertura para revisão funcional (`reabrirAchadoParaRevisao`).
      8. Bloqueio da rejeição sem justificativa textual.
      9. Rejeição com justificativa obrigatória registrada e preservada após salvar e recarregar (F5).
      10. Inclusão do achado manual com estado VALIDADO e classificação FORMAL.
      11. Preservação do achado manual após Salvar Rascunho e recarregar a página (F5).
      12. Exclusão do achado manual preservada após Salvar Rascunho e recarregar a página (F5), mantendo a sugestão preexistente sobre condicionante jurídica.
  - `S3.4` (Avaliação de Riscos — src/pages/riscos.ts e src/domain/riscos.ts): 100% CONCLUÍDA E HOMOLOGADA.
    - Implementação da matriz de riscos cobrindo as 4 dimensões (*Jurídica*, *Financeira*, *Operacional* e *Controle*) e 4 níveis (*Baixo*, *Moderado*, *Alto* e *Crítico*).
    - Princípio da não presunção (RN11/RN12): nenhuma dimensão nasce como "Baixo" por padrão; todas iniciam pendentes de apreciação humana (`nivel: null`).
    - Exigência de justificativa técnica fundamentada para cada nível atribuído (mínimo formal de 5 caracteres).
    - Vínculo formal com achados validados da análise (`achadosRelacionados`), permitindo fundamentar cada dimensão.
    - Governança de vínculos e achados em revisão (RN10): se um achado vinculado for reaberto para revisão ou rejeitado na Etapa 4, ele deixa de ser considerado uma referência validada. A dimensão afetada exibe alerta visual de governança avisando que a avaliação precisa ser revista pelo assessor, preservando o nível e a justificativa sem reclassificação automática, com botão para desvinculação voluntária.
    - Governança RN12 ostensiva: metodologia demonstrativa sem pesos ou fórmulas arbitrárias; ausência de achados não presume risco baixo.
    - Painel dinâmico de KPIs em tempo real (Baixo, Moderado, Alto, Crítico e Pendentes).
    - Seletor didático de carga rápida com 3 cenários fictícios pré-configurados (Regular, Com Condicionante e Grave) e opção de redefinição.
    - Controle de papéis simulados (S2.5): modo somente consulta para *Leitor* e *Aprovador* com bloqueio de edição e navegação liberada.
    - Persistência local integral (S2.4): salvamento e restauração dos riscos no IndexedDB e localStorage via `salvarRascunhoAtual` e `recuperarUltimoRascunho`.
    - **80 testes unitários aprovados via `npm test`** (23 testes dedicados da S3.4).
    - **Compilação e empacotamento PWA aprovados via `npm.cmd run build` com 0 erros**.
    - **Testes manuais consolidados e homologados pelo usuário (28/09/2026):**
      1. TM-S3.4-01: Campos vazios bloqueiam o avanço, sem risco Baixo automático.
      2. TM-S3.4-02: Nível e justificativa persistem após salvar e recarregar a página (F5).
      3. TM-S3.4-03: As quatro dimensões preenchidas permitem avançar para a próxima etapa.
      4. TM-S3.4-04: Perfis Leitor e Aprovador não editam (somente consulta); perfil Editor permite edição e seleção normalmente.
      5. TM-S3.4-05: O vínculo com achado validado persiste após salvar e recarregar a página (F5).
      6. TM-S3.4-06: Ao reabrir o achado na Etapa 4, ele desaparece das opções de vínculo disponível, preservando o nível e a justificativa do risco.
      - [x] TM-S3.4-07: Ao reabrir um achado vinculado, apareceu o aviso de retorno para revisão (RN10) na dimensão afetada.
      - [x] TM-S3.4-08: O nível Baixo e a justificativa foram rigorosamente preservados, sem reclassificação automática.
      - [x] TM-S3.4-09: Após desvincular, salvar o rascunho e recarregar com F5, o aviso desapareceu e o nível e a justificativa permaneceram preservados.
  - `S3.5` (Trilha de Auditoria Local e Histórico de Eventos — src/services/auditoria.ts): CONCLUÍDA E HOMOLOGADA (93 testes unitários e 5 testes manuais aprovados).
    - Implementação estruturada do histórico local associado à análise (`EventoLocal`: criação, edição, validações, alterações de papéis, riscos e diffs de antes/depois).
    - Aviso ostensivo de governança (`AVISO_AUDITORIA_LOCAL`): trilha mantida exclusivamente no armazenamento local deste navegador (IndexedDB) para fins didáticos, sem garantia de inviolabilidade criptográfica, fé pública ou equivalência a auditoria corporativa institucional (SIGADOC/SEI).
    - Imutabilidade da interface: a tela de auditoria não oferece botões ou mecanismos para editar, alterar ou apagar eventos individuais.
    - Não duplicação em carregamentos: renderizações e inicializações de tela (F5) não geram eventos espúrios; navegação entre etapas não emite eventos; apenas ações concretas do usuário são registradas.
    - Persistência e restauração integradas a `DadosRascunhoCompleto` no IndexedDB.
    - **93 testes unitários aprovados via `npm test`** (13 testes dedicados da S3.5).
    - **Compilação e empacotamento PWA aprovados via `npm.cmd run build` com 0 erros** (bundle gerado em 790ms, precache de 31 ativos e Service Worker íntegros).
    - **Testes manuais da S3.5 consolidados e homologados pelo usuário (28/09/2026):**
      - [x] TM-S3.5-01: Auditoria abre com título, contador e aviso de governança, sem controles de edição/exclusão; Esc fecha preservando a etapa; Leitor consulta sem editar/excluir.
      - [x] TM-S3.5-02: Validação do achado registrada; alteração Formal → Relevante exibida corretamente em Antes/Depois; ambos os eventos preservados após salvar e F5.
      - [x] TM-S3.5-03: Rejeição sem justificativa bloqueada; rejeição com justificativa registrada integralmente no histórico e preservada após salvar e F5.
      - [x] TM-S3.5-04: Salvar rascunho gera evento com data, hora, processo e perfil; F5 e navegação entre etapas não geram duplicidades; após o último salvamento e F5, o histórico mantém os eventos íntegros.
      - [x] TM-S3.5-05: Alteração de risco jurídico de Baixo para Moderado registra corretamente Antes/Depois e persiste após salvar e F5; trocas Assessor → Leitor → Assessor registradas.
  - `S3.6` (Estrutura do Painel Executivo — src/pages/painel.ts): 100% CONCLUÍDA E HOMOLOGADA (99 testes unitários e 6 testes manuais aprovados).
    - Painel executivo consolidado com metadados do processo ativo em destaque (número, instrumento, contratado, objeto, valor, vigência e CNPJ).
    - Contadores dinâmicos reais derivados do estado em memória/IndexedDB: identificação, pertinência, checklist (conformes, pendentes, a confirmar), condicionantes (atendidas, em cumprimento, pendentes), achados validados por gravidade, sugestões pendentes, rejeições fundamentadas, riscos por dimensão e eventos na trilha de auditoria local.
    - Diferenciação estrita entre sugestões do sistema, achados validados e rejeitados: sugestões pendentes e rejeições NÃO são contadas como impedimentos confirmados.
    - Não transformação automática de pendências documentais ou condicionantes em impedimento jurídico (RN11 e RN13).
    - Preservação dos níveis de risco estabelecidos pelo assessor; dimensões não preenchidas exibidas como pendentes sem defaults artificiais (RN12).
    - Indicadores estratégicos de eficiência (Tempo Médio de Análise e Taxa de Retrabalho) com baseline estimado (30 min e 30%), meta de até ~67% de redução e medição estrita como "Sem dados medidos", com salvaguarda institucional de governança ética das métricas.
    - Imutabilidade e consulta puramente de leitura: a visualização do painel não altera o estado da análise nem emite eventos de auditoria.
    - Navegação com atalhos para as 6 etapas, botão "📊 Painel" na barra de persistência superior e suporte a `#/` e `#/painel`.
    - **99 testes unitários aprovados via `npm test`** (6 testes dedicados da S3.6).
    - **Compilação e empacotamento PWA aprovados via `npm.cmd run build` com 0 erros** (bundle gerado em 1.18s, precache de 31 ativos e Service Worker íntegros).
    - **Testes manuais da S3.6 (100% Homologados pelo usuário em 29/09/2026):**
      - [x] TM-S3.6-01: Acesso ao Painel Executivo na rota inicial `#/` e `#/painel`, conferência do cabeçalho com metadados do processo, botão de atalho na barra superior e preservação do contador de auditoria após F5 sem eventos espúrios.
      - [x] TM-S3.6-02: Exibição dos contadores reais de checklist e condicionantes no painel e validação de conformidade com mensagem semântica correta ("concluída com pendências" no Cenário 5 e "concluída sem pendências" no Cenário 1, sem presunção de impedimento automático) (Homologado pelo usuário em 29/09/2026).
      - [x] TM-S3.6-03: Exibição dos contadores de achados coincidindo com a etapa (1 validado Relevante, 1 rejeitado e 0 impeditivos validados), sem contagem indevida de sugestão ou rejeição como impedimento.
      - [x] TM-S3.6-04: Exibição dos riscos por dimensão coincidindo com a etapa (Jurídica Moderado e dimensões não avaliadas permanecendo pendentes, sem risco baixo artificial).
      - [x] TM-S3.6-05: Exibição dos indicadores de tempo e retrabalho com distinção entre baseline estimado (30 min e 30%), meta de até ~67% (10 min e 10%), medição "Sem dados medidos", fórmulas visíveis e salvaguarda institucional, sem exibição artificial de 0% (Homologado pelo usuário em 29/09/2026).
      - [x] TM-S3.6-06: Navegação funcional pelos atalhos para as 6 etapas e retorno ao Painel pelo cabeçalho, barra de persistência e botões de rodapé; rotas #/identificacao, #/pertinencia, #/conformidade, #/achados, #/riscos e #/resultado conferidas, dados preservados, recarga F5 mantendo estado e auditoria local mantida em 0 sem eventos espúrios (Homologado pelo usuário em 29/09/2026).

- **Sprint 4 — Resultado executivo, relatórios e testes (MVP Demonstrativo):** 100% CONCLUÍDA E HOMOLOGADA.
  - `S4.1` (Tabela de Decisão RN08 em docs/regras-funcionais.md): 100% Homologada formalmente pelo usuário em 29/09/2026.
  - `S4.2` (Motor de Conclusão e Tela da Etapa 6 — src/domain/conclusao.ts e src/pages/resultado.ts): 100% Homologada (32 testes de domínio cobrindo os 17 cenários da RN08 + 13 testes de interface + regressão RN10 completa A-H).
  - `S4.3`, `S4.4`, `S4.5`, `S5.1-S5.6`: Pacote de fechamento do MVP Demonstrativo com exportação JSON/PDF mascarada, relatório executivo imprimível (#/relatorio), 157 testes unitários aprovados em 20 suítes e congelamento na tag `v0.1.0-mvp-demo`.
  - **Apresentação Executiva do MVP Demonstrativo:** Apresentado e homologado com nota 10.

---

## 2. Ponto Seguro de Retomada — Sprint 5

### 2.1. Contexto Técnico Atual
- **MVP demonstrativo:** Concluído, apresentado e validado formalmente com nota 10.
- **Tag de congelamento:** `v0.1.0-mvp-demo`.
- **Branch ativa de desenvolvimento:** `s5-ingestao-auditoria`.
- **Commit-base:** `74225d1`.
- **Testes atuais:** 157 aprovados, 0 falhas, 20 suítes (`npm test`).
- **Build de produção:** Validado com sucesso (`npm.cmd run build`).
- **Diretriz de tarefa estrita:** Não alterar nenhum arquivo de `src`, `public`, testes, configuração, dependências ou lógica da aplicação nesta etapa de documentação.

### 2.2. Nova Fase: Sprint 5 — Ingestão Inteligente + Trilha de Auditoria Humano × IA × Sistema
A Sprint 5 marca o início da automação assistida com IA com rigorosa governança pública e trilha de auditoria tripartite segregada.

O documento diretor completo desta fase está registrado em:
👉 [docs/ROADMAP_AUDITORIA_HUMANO_IA.md](file:///c:/Users/cleyt/OneDrive/Documentos/Projetos/conforma-gsasp-retomada/docs/ROADMAP_AUDITORIA_HUMANO_IA.md)

### 2.3. Primeira Entrega Estrita da Sprint 5
A primeira entrega funcional da Sprint 5 está circunscrita estritamente ao seguinte fluxo:
$$\text{Upload de Minuta/PDF} \longrightarrow \text{Extração da Identificação} \longrightarrow \text{Evidência por Campo} \longrightarrow \text{Confirmar / Editar / Rejeitar} \longrightarrow \text{Persistência após Validação Humana}$$

1. **Upload da Minuta/PDF:** Envio de arquivo em formato PDF contendo a minuta contratual ou termo aditivo.
2. **Extração da Identificação:** Extração assistida por IA dos campos essenciais do instrumento (RN01: Objeto, Tipo/Origem, Valor, Vigência, além de Número, Contratado e CNPJ).
3. **Evidência por Campo:** Cada campo sugerido deve exibir a coordenada/localização exata no documento (página e trecho literal) de onde o dado foi extraído.
4. **Intervenção Humana Obrigatória:** Para cada campo, o operador humano dispõe das opções explícitas de **Confirmar** a extração, **Editar** o valor (com justificativa quando couber) ou **Rejeitar** a sugestão.
5. **Persistência Condicionada:** Nenhuma informação produzida pela IA é gravada diretamente no rascunho de negócio sem a validação expressa do operador humano.

### 2.4. Princípio Obrigatório de Governança
A segregação entre os papéis no CONFORMA GSASP é categórica:
- **IA:** extrai, classifica e sugere;
- **Humano:** confirma, corrige, rejeita e complementa (validação humana/técnica, observadas as competências do usuário e da autoridade competente);
- **Sistema:** aplica regras determinísticas RN / DEC / MOT;
- **Nenhum desses atores deve ser confundido na auditoria.**

### 2.5. Trilha de Auditoria Tripartite (HUMANO × IA × SISTEMA)
A trilha de auditoria deve categorizar os eventos a partir de três atores formais:
1. `HUMANO`: Registra confirmações, edições, rejeições, divergências motivadas e homologações do assessor.
2. `IA`: Registra a execução de pipelines de OCR/NLP, saídas brutas e sugestões probabilísticas de campos.
3. `SISTEMA`: Registra validações lógicas estruturais, verificações de integridade e a aplicação determinística de regras.

### 2.6. Metadados Mínimos Mandatórios de Toda Execução de IA
Toda execução futura de componentes de inteligência artificial deverá registrar e preservar, no mínimo:
- `prompt_id`
- `prompt_version`
- `ai_run_id`
- `gatilho/automação`
- `modelo/provedor`
- `documentos/fontes` (com identificação de integridade/hash, sendo SHA-256 diretriz técnica candidata)
- `página/trecho/evidência`
- `saída produzida` (saída bruta ou referência segura à saída, conforme política de retenção e segurança)
- `campos sugeridos` (grau de confiança registrado somente quando o modelo ou pipeline fornecer métrica tecnicamente válida, vedada a inferência de percentual artificial)
- `timestamp` (carimbo de tempo padronizado, sendo ISO 8601 UTC diretriz técnica candidata)
- `intervenção humana posterior` (IDs dos eventos humanos subsequentes)

### 2.7. Rastreamento de Alterações Humanas sobre Sugestões da IA
Qualquer modificação realizada pelo operador sobre uma sugestão gerada pela IA deverá preservar:
- `valor anterior` (sugerido pela IA);
- `valor posterior` (adotado pelo humano);
- `usuário` (identificação e papel ativo);
- `data/hora` (timestamp ISO);
- `justificativa quando aplicável` (obrigatória para alterações materiais e rejeições).

### 2.8. Segregação e Atribuição de Regras Determinísticas ao SISTEMA
Regras determinísticas e normativas — tais como **RN10** (invalidação superveniente da conclusão homologada por fato novo), **RN08** (cascata determinística P1 a P5), regras **DEC-01 a DEC-10** e motivos **MOT-*** — **devem ser auditadas estritamente como ações do SISTEMA, nunca atribuídas à IA**. O motor do sistema executa lógica booleana prescrita em norma, sem inferência generativa.

### 2.9. Requisitos Arquiteturais para Uso Institucional Futuro
Para viabilizar futura adoção corporativa, a arquitetura da auditoria deve prever:
- **Trilha append-only:** Base de auditoria com objetivo de ser estritamente aditiva (sem operações de exclusão ou sobrescrita).
- **Eventos não apagados nem sobrescritos:** Garantia de imutabilidade histórica.
- **Retificação por novo evento:** Qualquer alteração ou desfazimento gera novo evento de retificação vinculado ao ID do evento original.
- **Autenticação:** Identificação de operadores humanos e credenciais de serviços.
- **Integridade:** Mecanismos de integridade (sendo hashing encadeado diretriz técnica candidata).
- **Controle de acesso:** Controle de acesso e permissões (sendo RBAC diretriz técnica candidata, não arquitetura definitivamente escolhida nesta fase).
- **Retenção:** Prazos de guarda e ciclo de vida documental conforme normas e políticas aplicáveis.
- **Exportação para auditoria:** Geração de pacotes estruturados para auditoria, controle interno/externo e demais necessidades institucionais, conforme governança futura (sendo JSON e PDF formatos tratados como diretrizes técnicas candidatas).

> [!WARNING]
> **Advertência de Governança Institucional:**
> A versão atual da persistência baseada em **IndexedDB continua sendo apenas demonstrativa e didática**. Ela não fornece garantias de inviolabilidade criptográfica contra manipulações no cliente.

### 2.10. Comandos para Executar e Testar na Branch Ativa
```powershell
# 1. Garantir que está na pasta do projeto e na branch correta:
cd C:\Users\cleyt\OneDrive\Documentos\Projetos\conforma-gsasp-retomada
git status
# Branch: s5-ingestao-auditoria

# 2. Executar a suíte completa de testes automatizados (157 testes):
npm.cmd test

# 3. Compilar a aplicação e validar tipos e PWA:
npm.cmd run build

# 4. Iniciar o servidor de pré-visualização:
npm.cmd run preview
# Endereço: http://localhost:4173/conforma-gsasp/
```

---

## 3. Comandos para Preparar e Executar em Outro Computador

### Passo a passo no novo computador:

#### 1. Clonar o repositório e acessar a branch da Sprint 5
```powershell
git clone https://github.com/cleytondias84/conforma-gsasp.git
cd conforma-gsasp
git checkout s5-ingestao-auditoria
```

#### 2. Preparar o ambiente Node.js / Frontend
```powershell
npm.cmd install
```

#### 3. Preparar o ambiente Python local (.venv)
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

#### 4. Executar os testes automatizados
```powershell
# Testes do gerador Python (12 testes):
pytest -v scripts/test_gerar_dados.py

# Testes da aplicação TypeScript (157 testes em 20 suítes):
npm.cmd test
```

#### 5. Compilar e executar a aplicação
```powershell
npm.cmd run build
npm.cmd run preview
# Endereço: http://localhost:4173/conforma-gsasp/
```

---

## 4. Histórico de Entregas Anteriores (Sprints 1 a 4 e Congelamento do MVP)

- **Sprint 1 (Fundação, Arquitetura e PWA):** Tipagem de domínio, roteador por hash, gerador de dados sintéticos, GitHub Pages e PWA com precache e suporte offline.
- **Sprint 2 (Formulário e Persistência Local):** Formulários de Identificação (RN01), Pertinência (RN02), Conformidade Documental/Condicionantes (RN03/RN13), persistência em IndexedDB e papéis simulados (S2.5).
- **Sprint 3 (Motor de Regras, Achados e Riscos):** Catálogo de regras determinísticas (`REG-01` a `REG-06`), motor de achados com anatomia RN03, matriz de riscos qualitativa de 4 dimensões (RN12), trilha de auditoria local (S3.5) e painel executivo (S3.6).
- **Sprint 4 (Resultado Executivo, Tabela de Decisão e Relatórios):** Tabela de decisão RN08 (P1 a P5, DEC-01 a DEC-10, MOT-*), motor de conclusão determinístico com invalidação dinâmica superveniente RN10, respostas às 5 Perguntas Executivas RN09, tela de relatório executivo (#/relatorio) e exportação com máscara de proteção.
- **Marco de Congelamento do MVP Demonstrativo:** Homologação completa com 157 testes unitários em 20 suítes, apresentação formal com nota 10 e criação da tag imutável `v0.1.0-mvp-demo`.

---

## 5. Planejamento e Decisões para a Sprint 5

1. **Marco 5.1 — Upload e Extração de Identificação com Validação Humana:**
   - Componente de upload de PDF e extração estruturada de campos essenciais.
   - Painel comparativo de evidências com citação de página/trecho e botões Confirmar/Editar/Rejeitar.
   - Persistência no rascunho de negócio estritamente condicionada à validação humana/técnica, observadas as competências do usuário e da autoridade competente.
2. **Marco 5.2 — Trilha de Auditoria Tripartite e Preservação de Metadados de IA:**
   - Estruturação dos três atores (`HUMANO`, `IA`, `SISTEMA`).
   - Registro mandatório dos 11 metadados de execução de IA (`prompt_id`, `prompt_version`, `ai_run_id`, etc.), utilizando saída bruta ou referência segura à saída, conforme política de retenção e segurança.
   - Métrica de confiança registrada exclusivamente quando o modelo/pipeline fornecer métrica tecnicamente válida, vedada a inferência de percentual artificial.
3. **Marco 5.3 — Diffs Auditáveis e Justificativa de Divergência:**
   - Preservação de valor anterior, valor posterior, identificação do operador, data/hora e justificativa.
4. **Marco 5.4 — Segregação e Blindagem das Regras do SISTEMA:**
   - Auditoria autônoma de RN10, RN08, DEC e MOT como ações exclusivas do SISTEMA.
5. **Marco 5.5 — Homologação da Suíte de Testes da Nova Fase:**
   - Testes unitários para os novos módulos sem qualquer regressão dos 157 testes preexistentes.
