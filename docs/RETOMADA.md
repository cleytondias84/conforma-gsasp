# CONFORMA GSASP — Guia de Retomada do Projeto

Documento de transição e estado do projeto para continuidade em outro computador ou sessão.  
Data do último registro: 29/09/2026.  
**Branch de trabalho atual:** `pausa-s2-4` (Sprints 1, 2 e 3 100% CONCLUÍDAS E HOMOLOGADAS; Sprint 4 a iniciar)  
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

---

## 2. Próximo Passo Exato (Ponto Seguro de Retomada)

- **Situação de momento:**
  - **Sprint 1:** 100% concluída e publicada.
  - **Sprint 2:** 100% concluída e homologada (S2.1 a S2.6).
  - **Sprint 3:** **100% CONCLUÍDA E HOMOLOGADA** (S3.1 a S3.6: 99 testes unitários aprovados, build 100% íntegro e 6 testes manuais da S3.6 homologados).
  - **Sprint 4:** Em andamento:
    - `S4.1` (Tabela de Decisão RN08 em docs/regras-funcionais.md): **100% HOMOLOGADA** pelo usuário em 29/09/2026.
    - `S4.2` (Motor de Conclusão e Tela da Etapa 6 — src/domain/conclusao.ts e src/pages/resultado.ts): **EM VALIDAÇÃO MANUAL** (138 testes unitários aprovados; build 100% íntegro).
    - `S4.2`: **Ainda NÃO homologada integralmente** (3 de 5 testes manuais aprovados).
    - `S4.3` (Documento executivo e estilos de impressão): **NÃO INICIADA**.

1. **Sprint 4 — Tarefa S4.2 em Validação Manual (RN08, RN09, RN10):**
   - **Camada de Domínio Puro (`src/domain/conclusao.ts`):**
     - Cascata determinística estrita: $P1 \rightarrow P2 \rightarrow P3 \rightarrow P4 \rightarrow P5$.
     - Precedência P1 absoluta: dados essenciais faltantes (`DEC-01`) ou avaliações mínimas pendentes (`DEC-02`) acionam P1 antes de óbices P2 a P5.
     - 4 estados de checklist: `confirmar` em P1; `pendente` em P3 (`DEC-07A`, `MOT-SANEAMENTO-CHECKLIST-PENDENTE`); `nao_aplicavel` com justificativa formalmente resolvido admitindo P4/P5 (`DEC-10`); `nao_aplicavel` sem justificativa obrigatória em P1 (`DEC-01`).
     - Consolidação de riscos: Crítico > Alto > Moderado > Baixo; dimensão não avaliada aciona P1 (`MOT-SANEAMENTO-AVALIACOES-PENDENTES`), vedada presunção de risco Baixo.
     - Agregação de múltiplos códigos `MOT-*` quando coexistirem ressalvas em P4 (`APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA`).
     - Saída com salvaguarda `naoConstituiAutorizacaoAutomatica: true`.
   - **Camada de Interface e Governança (`src/pages/resultado.ts`):**
     - Banner ostensivo de apoio à decisão (sem autorização automática para assinatura).
     - Cartão da sugestão do sistema com badge, precedência, regra DEC e códigos MOT.
     - Espaço de homologação técnica do assessor: adoção direta ou seleção divergente com justificativa obrigatória ($\ge 10$ caracteres).
     - Invalidação dinâmica automática (RN10) por alterações supervenientes nos autos.
     - Respostas às 5 Perguntas Executivas Centrais (RN09).
     - Trilha de auditoria integrada (`VALIDACAO_CONCLUSAO`, `DIVERGENCIA_CONCLUSAO`, `REABERTURA_CONCLUSAO`).
     - Modo somente consulta para perfis *Leitor* e *Aprovador*.
     - Persistência e restauração do parecer no IndexedDB/localStorage.
   - **Testes Automatizados e Build:**
     - **138 testes unitários aprovados via `npm test`** (32 de domínio + 7 de interface + 99 preexistentes).
     - **Compilação e empacotamento PWA aprovados via `npm.cmd run build` com 0 erros** (bundle gerado em 571ms, precache de 31 ativos e Service Worker íntegros).
   - **Testes Manuais da S4.2 (Status da Validação):**
     - [x] TM-S4.2-01: Adoção da sugestão do sistema em consonância com o motor no Cenário 1 (Processo SESP-PRO-2026/00001, P5, DEC-10, MOT-APTIDAO-PLENA-REGULARIDADE, Risco Baixo), homologação com selo "PARECER HOMOLOGADO EM CONSONÂNCIA", badge "Em Consonância com o Sistema", metadados de responsável/data/hora e registro na auditoria (VALIDACAO_CONCLUSAO) (Homologado pelo usuário em 29/09/2026).
     - [x] TM-S4.2-02: Reabertura de parecer para revisão, bloqueio estrito de divergência com justificativa vazia ou curta (< 10 caracteres) e homologação de divergência técnica fundamentada (Processo SESP-PRO-2026/00001, RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA) com selo "PARECER HOMOLOGADO COM DIVERGÊNCIA MOTIVADA", badge "Prevalece Decisão Humana (RN02/RN07)", justificativa registrada e evento na auditoria (DIVERGENCIA_CONCLUSAO) (Homologado pelo usuário em 29/09/2026).
     - [ ] TM-S4.2-03: Invalidação dinâmica automática da conclusão (RN10) após alteração superveniente na matriz de riscos e alerta ostensivo na tela (PENDENTE).
     - [ ] TM-S4.2-04: Conferência das respostas às 5 Perguntas Executivas Centrais (RN09) e das 4 salvaguardas regulamentares da SESP-MT (PENDENTE).
     - [x] TM-S4.2-05: Modo somente consulta nos perfis Leitor e Aprovador (banner exibido, bloqueio de controles de homologação/adoção/reabertura, dados preservados e restauração ao retornar para Assessor) (Homologado pelo usuário em 29/09/2026).

2. **Próxima Ação Imediata na Retomada:**
   - **Próximo teste exato a executar:** **TM-S4.2-03** (Invalidação Dinâmica Automática por Alterações Supervenientes — RN10), seguido por **TM-S4.2-04** (Cinco Perguntas Executivas e Salvaguardas).
   - **Regra de bloqueio estrita:** Nenhuma nova implementação de código deve começar antes da conclusão integral da validação manual e homologação formal da Tarefa S4.2. A Tarefa S4.3 **NÃO** deve ser iniciada antes disso.

3. **Comandos para Retomar o Servidor Local na Pasta Ativa:**
   ```powershell
   # 1. Garantir que está na pasta do projeto:
   cd C:\Users\cleyt\OneDrive\Documentos\Projetos\conforma-gsasp-retomada

   # 2. Compilar e rodar os testes:
   npm.cmd test
   npm.cmd run build

   # 3. Iniciar o servidor de pré-visualização:
   npm.cmd run preview
   # Endereço: http://localhost:4173/conforma-gsasp/
   ```

---

## 3. Comandos para Preparar e Executar em Outro Computador

### Passo a passo no novo computador:

#### 1. Clonar o repositório e acessar a branch da pausa
```powershell
git clone https://github.com/cleytondias84/conforma-gsasp.git
cd conforma-gsasp
git checkout pausa-s2-4
```

#### 2. Preparar o ambiente Node.js / Frontend
```powershell
# Instala as dependências (Vite, TypeScript, vite-plugin-pwa)
npm.cmd install
```

#### 3. Preparar o ambiente Python local (.venv)
```powershell
# Criar o ambiente virtual isolado
python -m venv .venv

# Ativar o ambiente virtual (Windows PowerShell)
.\.venv\Scripts\Activate.ps1
# (ou no CMD: .\.venv\Scripts\activate.bat | ou Linux/macOS: source .venv/bin/activate)

# Instalar dependências registradas (pytest)
pip install -r requirements.txt
```

#### 4. Gerar dados sintéticos e ícones
```powershell
# Gera os 7 arquivos de cenários fictícios em public/data/
python scripts/gerar_dados.py

# Gera os ícones do PWA e favicon em public/
python scripts/gerar_icones.py
```

#### 5. Executar os testes automatizados
```powershell
# Executa a suíte de testes unitários dos dados sintéticos (12 testes)
pytest -v scripts/test_gerar_dados.py
```

#### 6. Compilar e executar a aplicação
```powershell
# Compilação de produção e checagem estrita de tipos
npm.cmd run build

# Executa o servidor de pré-visualização (recomendado para testar o PWA e Service Worker)
npm.cmd run preview
# Endereço: http://localhost:4173/conforma-gsasp/

# Ou para desenvolvimento contínuo:
npm.cmd run dev
# Endereço: http://localhost:5173/conforma-gsasp/
```

---

## 4. Histórico de Entregas Anteriores (S0.2 a S1.5)

Para consulta de detalhes de decisões e implementações das tarefas já homologadas:
- **S0.2:** Diagnóstico de ambiente e ferramentas mínimas.
- **S1.1:** Setup inicial com Vite + TypeScript + CSS puro, `.gitignore` seguro.
- **S1.2:** Modelagem em `src/domain/tipos.ts` (4 conclusões da RN08, validação humana, campos opcionais).
- **S1.3:** Roteador hash com 6 etapas, stepper acessível, foco por teclado e destaque dos 4 elementos essenciais na Identificação.
- **S1.4:** Gerador `scripts/gerar_dados.py` gerando 2 casos regulares, 2 com pendências e 1 grave com inconsistências propositais, testado via `scripts/test_gerar_dados.py`.
- **S1.5:** Configuração de `base: '/conforma-gsasp/'`, deploy automatizado no GitHub Actions e publicação ativa no GitHub Pages.
- **S1.6:** Instalação e cache PWA (Service Worker Workbox, precache de 31 ativos, manifesto, ícones e homologação de instalação e funcionamento offline).

---

## 5. Pendências e Decisões Mapeadas para as Próximas Sprints

1. **Sprint 2 (Formulário e Persistência Local):**
   - Matriz de papéis de usuários (Administrador, Analista, Revisor, Autoridade, Leitor).
   - Validações de obrigatoriedade e não aplicabilidade de campos contratuais.
   - Armazenamento local no navegador com IndexedDB e retomada offline.
2. **Sprints 3 e 4 (Motor de Regras, Riscos e Documento Final):**
   - Metodologia de cálculo de riscos e tabela de decisão para sugestões de conclusão.
   - Geração de documento de conformidade para impressão/PDF.



