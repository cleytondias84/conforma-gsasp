# CONFORMA GSASP — Plano técnico de execução

Base: sprint enviado pelo usuário e contexto.md, 24/09/2026. Cinco sprints preservadas, precedidas de preparação. Todas as tarefas estão PENDENTES; arquivos ou planejamento existentes não comprovam conclusão. Responsáveis e datas: A DEFINIR.

## Como executar

Ler contexto.md antes de cada tarefa. Executar uma tarefa identificada por vez: plano breve → implementação → verificação → revisão → commit. Commit registra uma versão local; push envia ao GitHub. Não publicar arquivos reais ou segredos. Não apagar/sobrescrever documentos existentes ao criar o projeto.

Pronto significa critério de aceite comprovado, não apenas código escrito. Registrar o que foi testado e o que não foi. Se faltar decisão funcional, manter “A DEFINIR” e explicar o bloqueio; não inventar regra administrativa ou jurídica.

## Escolhas e organização

- Vite + TypeScript; HTML/CSS responsivos; sem framework adicional obrigatório.
- vite-plugin-pwa; Vitest; Python + pytest. Faker/Pydantic opcionais, apenas se houver necessidade; não criar dependências sem finalidade.
- IndexedDB. localStorage apenas como fallback explícito e testado.
- Python gera/valida dados; regras funcionais ficam em TypeScript. Python pode produzir casos de teste, sem manter segundo motor de negócio duplicado.
- Playwright é opcional, após o fluxo principal funcionar.
- public/data: dados fictícios; scripts: ferramentas Python; src/domain: tipos, regras e testes; src/auth: papéis simulados; src/services: leitura, armazenamento, indicadores e registro local; src/pages: telas; src/components: componentes; docs: documentos.
- Não implementar API futura, login real ou integração com IA nesta entrega.

## Preparação — Sprint 0

| ID | Tarefa e arquivos | Tecnologia | Critério de aceite |
|---|---|---|---|
| S0.1 | Conferir contexto.md e sprint.md; identificar lacunas | Markdown | Agente resume o projeto e lista pendências sem inventar decisões |
| S0.2 | Consultar versões de Node.js, npm, Python e Git | Terminal, somente leitura | Versões ou ausências relatadas; orientar instalações necessárias uma por vez |
| S0.3 | Definir diretório do projeto e inicialização segura | Planejamento | Documentos preservados; evitar inicializador com --overwrite em pasta ocupada |

Próximo passo inicial: S0.1 após os dois documentos estarem acessíveis na pasta aberta no Antigravity.

## Sprint 1 — Fundação, arquitetura e PWA

Objetivo: primeira aplicação navegável, instalável em navegador compatível e publicada com dados fictícios.

| ID | Tarefa e arquivos principais | Tecnologia | Pronto quando |
|---|---|---|---|
| S1.1 | Criar base sem sobrescrever docs; package.json, index.html, src/main.ts, src/style.css, tsconfig.json, .gitignore | Vite/TS/CSS | Página inicial abre localmente; build passa; documentos intactos; excluir node_modules, dist, .venv, .env e segredos do Git |
| S1.2 | Modelar Processo, Analise, Achado, Condicionante, Risco, Resultado e EventoLocal em src/domain/tipos.ts | TS | Tipos contemplam quatro conclusões; andamento separado da conclusão; campos opcionais/aplicabilidade explícitos |
| S1.3 | Criar navegação por etapas, tela inicial e estrutura visual em src/router.ts, src/pages e src/components | TS/HTML/CSS | Seis etapas navegáveis; destaque aos quatro elementos essenciais; teclado e celular utilizáveis |
| S1.4 | Gerar cinco casos fictícios em scripts/gerar_dados.py e public/data; scripts/test_gerar_dados.py | Python/pytest | Dois regulares, dois com pendências e um grave; determinísticos, IDs únicos; dados propositalmente inconsistentes identificados como cenários, sem invalidar o gerador |
| S1.5 | Configurar base e publicação; vite.config.ts, .github/workflows/deploy.yml e README.md inicial | Configuração/YAML | Repositório definido; build/publicação funcionam no subcaminho; recarregar rota por hash não quebra |
| S1.6 | Instalação e cache inicial; configuração PWA e ícones em public | TS/PWA | Tela inicial abre offline após acesso online; instalação testada em navegador compatível; caminhos respeitam base |

Testes: schema/consistência da massa e navegação básica; verificação de build, endereço publicado e cache inicial. Não confundir conclusão de S1 com MVP funcional completo.
Commit por tarefa, exemplo: chore: inicia estrutura do CONFORMA GSASP (S1.1).

### Registro de Execução da Sprint 1
- **Tarefas concluídas e homologadas:** S1.1, S1.2, S1.3, S1.4, S1.5 e **S1.6** (Sprint 1 100% concluída e homologada).
  - Repositório: [https://github.com/cleytondias84/conforma-gsasp](https://github.com/cleytondias84/conforma-gsasp)
  - Site publicado: [https://cleytondias84.github.io/conforma-gsasp/](https://cleytondias84.github.io/conforma-gsasp/)
- **Tarefa S1.6 (PWA) — Detalhes da Conclusão e Homologação:**
  - *Implementação técnica:* Manifesto web (`manifest.webmanifest`), ícones institucionais (`favicon.svg`, `pwa-192x192.png`, `pwa-512x512.png`, maskables e `apple-touch-icon.png`), plugin `vite-plugin-pwa` integrado ao Vite com service worker automático (`sw.js`) e precache de 31 ativos essenciais (HTML, CSS, JS, ícones e dados JSON sintéticos em `/data/`). Compatível com a base `/conforma-gsasp/` e rotas por hash.
  - *Testes realizados e homologados:*
    - **Instalação PWA:** Homologada manualmente pelo usuário em navegador compatível (modo standalone).
    - **Navegação Offline:** Homologada manualmente pelo usuário; navegação completa pelas 6 etapas após corte de rede com recarregamento bem-sucedido via cache do Service Worker.
    - **Verificação de Console:** Confirmado console limpo durante o teste em janela anônima. Os erros anteriormente observados no console (`Uncaught (in promise) {}` e `Language detection is not supported for this page`) não foram reproduzidos no teste sem extensões (tanto via automação em perfil temporário limpo quanto em janela anônima pelo usuário). Registra-se que os erros anteriores não foram reproduzidos no teste sem extensões, sem afirmar que toda a aplicação está livre de erros e sem atribuir conclusivamente as duas mensagens à extensão externa.
  - *Confirmação de publicação em produção:* Confirmado pelo usuário que a versão publicada no GitHub Pages abriu e que as seis etapas funcionaram normalmente.
- **Sprint 2 — Concluída:** Todas as 6 tarefas (S2.1 a S2.6) foram concluídas e homologadas com testes manuais aprovados pelo usuário.

## Sprint 2 — Formulário de conformidade e persistência local

Objetivo: criar/editar processo fictício e percorrer Identificação → Pertinência → Conformidade.

| ID | Tarefa e arquivos principais | Tecnologia | Pronto quando |
|---|---|---|---|
| S2.1 | Formulário em src/pages/identificacao.ts e validações em src/domain | TS | Campos de contexto.md disponíveis; erros claros; datas, valor e não aplicabilidade tratados conforme decisões confirmadas |
| S2.2 | src/pages/pertinencia.ts | TS | Competência/necessidade, vínculo, benefício, planejamento, proporcionalidade e economicidade registrados com evidência, conclusão e providência |
| S2.3 | src/pages/conformidade.ts; modelos de condicionantes/checklist | TS | ok/pendente/nao_aplicavel/confirmar; justificar não aplicabilidade; registrar parecer, condicionantes e atendimento sem presumir conclusão jurídica |
| S2.4 | src/services/armazenamento.ts e interface de repositório | TS/IndexedDB | Criar, editar, listar e retomar após fechar/reabrir navegador no mesmo perfil; falhas visíveis; fallback não oculta erro ou perde dados silenciosamente |
| S2.5 | src/auth/papeis.ts e seletor de perfil | TS | Matriz de papéis aprovada aplicada à interface e ações; indicação visível de simulação; Leitor não altera |
| S2.6 | Revisar cache das telas e retomada offline | PWA/TS | Análise sintética retomada offline após carregamento inicial; aviso sobre armazenamento local e ausência de sincronização |

Testes: campos obrigatórios e condicionais, dados inválidos, persistência, permissão simulada e retomada. Confirmar primeiro pendências funcionais relativas aos formulários.
Commit exemplo: feat: adiciona identificação e validações (S2.1).

### Registro de Execução da Sprint 2
- **Tarefa S2.1 (Formulário de Identificação e Validações de Domínio) — Concluída:**
  - *Implementação:* Formulário interativo completo em `src/pages/identificacao.ts`, regras e formatadores em `src/domain/validacao.ts`, estilos dedicados em `src/style.css` e integração ao roteador em `src/router.ts`.
  - *Critérios de aceite atendidos:*
    - Destaque em tempo real dos 4 elementos essenciais (Objeto, Tipo/Origem, Valor e Vigência) conforme RN01.
    - Campos de `Processo` mapeados de `contexto.md`: número, instrumento, regime jurídico, objeto, tipo/origem, contratado, CNPJ, valor e vigência.
    - Tratamento explícito de não aplicabilidade para valor (ex.: aditivos de prazo sem valor ou acordos de cooperação), vigência (prazo indeterminado) e contratado (atos unilaterais).
    - Validação clara de erros de preenchimento e consistência cronológica de datas de vigência (término >= início) conforme RN13.
    - Seletor para carga didática rápida dos 5 cenários fictícios de demonstração.
    - Suíte de testes automatizados em `src/domain/validacao.test.ts` (8 testes unitários aprovados via `npm test`).
    - Compilação estrita `npm.cmd run build` aprovada com 0 erros (geração de bundle e Service Worker preservados).
  - *Testes manuais homologados pelo usuário (24/09/2026):*
    1. Cartão Objeto acompanha a digitação em tempo real (RN01).
    2. Cenário sem valor financeiro (Cenário 2) desabilita o campo, exibe a indicação correta e permite avançar.
    3. Vigência invertida (Cenário 5) bloqueia o avanço exibindo erro claro (RN13); corrigir o término para 01/02/2027 permite prosseguir.
- **Tarefa S2.2 (Pertinência Institucional) — 100% Concluída e Homologada:**
  - *Implementação técnica:* Formulário interativo da Etapa 2 em `src/pages/pertinencia.ts`, integração ao roteador por hash em `src/router.ts`, regras determinísticas e validadores em `src/domain/validacao.ts`, testes unitários em `src/domain/validacao.test.ts` e estilização executiva em `src/style.css`.
  - *Critérios de aceite atendidos:*
    - Exibição contextual do processo ativo vindo da Identificação (Número, Instrumento, Objeto, Valor e Vigência).
    - Avaliação dos 5 eixos de pertinência: Competência/Necessidade, Vínculo ao Planejamento, Benefício ao Interesse Público, Proporcionalidade e Economicidade com opções acessíveis (Sim/Não/A avaliar).
    - Campos obrigatórios com validação de preenchimento (RN13): Evidências Documentais dos autos (mínimo 5 caracteres), Justificativa Técnica do Assessor (mínimo 10 caracteres) e Providência Recomendada.
    - Sugestão indicativa algorítmica calculada dinamicamente em tempo real (`sugerirConclusaoPertinencia`), destacada com badge "Pendente de Validação Humana (RN02)".
    - Seletor da Conclusão Técnica do Assessor com as 4 opções regulamentares: `PERTINENTE`, `PERTINENTE_COM_JUSTIFICATIVA`, `NAO_DEMONSTRADA` e `NAO_PERTINENTE`.
    - Alerta explicativo de soberania da avaliação humana (RN02/RN07) quando a decisão do assessor divergir da sugestão automática do sistema, garantindo que o algoritmo não substitua o juízo humano.
    - Seletor didático para carga rápida dos cenários de teste fictícios.
    - Navegação bidirecional: botões "← Voltar à Identificação" e "Avançar para Conformidade →" integrados à validação de formulário.
    - 12 testes unitários aprovados via `npm test`.
    - Compilação e empacotamento PWA aprovados via `npm.cmd run build` com 0 erros.
  - *Testes manuais homologados pelo usuário (24/09/2026):*
    1. Cenário regular: critérios em "Sim", sugestão "PERTINENTE" e avanço permitido.
    2. Conclusão humana divergente: aviso exibido e avanço permitido com os campos preenchidos.
    3. Cenário 4: respostas previstas carregadas e sugestão "PERTINÊNCIA NÃO DEMONSTRADA".
    4. Campos obrigatórios vazios: avanço bloqueado, resumo de pendências e campos destacados.
- **Tarefa S2.3 (Conformidade Documental e Condicionantes) — 100% Concluída e Homologada:**
  - *Implementação técnica:* Formulário interativo da Etapa 3 em `src/pages/conformidade.ts`, integração ao roteador por hash em `src/router.ts`, regras determinísticas e validadores em `src/domain/validacao.ts`, testes unitários em `src/domain/validacao.test.ts` e estilização executiva em `src/style.css`.
  - *Critérios de aceite atendidos:*
    - Cartão contextual exibindo dados do processo ativo da Etapa 1 e a conclusão técnica da pertinência da Etapa 2.
    - Aviso metodológico explícito de não presunção de conclusão jurídica (RN02/RN07).
    - Painel dinâmico de KPIs de conformidade (Conformes, Pendentes, A Confirmar, Não Aplicáveis e Condicionantes Pendentes).
    - Checklist com 4 opções de status (`ok`, `pendente`, `confirmar`, `nao_aplicavel`).
    - Justificativa obrigatória da não aplicabilidade (mínimo 5 caracteres) ao selecionar `nao_aplicavel` (RN13).
    - Acompanhamento individual de condicionantes de pareceres jurídicos (`atendida`, `pendente`, `em_cumprimento`, `nao_aplicavel`) com exigência de providência e responsável quando pendente/em cumprimento.
    - Inclusão e exclusão dinâmica de itens e condicionantes personalizados com atualização imediata dos contadores.
    - Seletor didático para carga rápida dos 5 cenários fictícios.
    - 16 testes unitários aprovados via `npm test` e compilação de produção aprovada via `npm.cmd run build` com 0 erros.
  - *Testes manuais homologados pelo usuário (24/09/2026):*
    1. Cenário regular: indicadores corretos e avanço para Achados.
    2. Item não aplicável: bloqueio sem justificativa e avanço após preenchimento.
    3. Condicionante pendente: bloqueio sem providência e avanço após restauração.
    4. Inclusão e exclusão de itens e condicionantes com atualização dos contadores.
- **Tarefa S2.4 (Persistência Local com IndexedDB) — 100% Concluída e Homologada:**
  - *Implementação técnica:* `src/services/armazenamento.ts`, `src/services/armazenamento.test.ts`, `src/router.ts`, `src/pages/conformidade.ts`, `src/pages/pertinencia.ts`, `src/pages/identificacao.ts` e `src/style.css`.
  - *Critérios de aceite atendidos:*
    - Repositório local assíncrono baseado em `IndexedDB` (`conforma_gsasp_db`, objectStore `rascunhos_analise`) com fallback seguro para `localStorage` e memória volátil.
    - Preservação completa e estruturada dos dados das três etapas ativas: Identificação (`Processo`), Pertinência (`Pertinencia`) e Conformidade (`ItemConformidade[]` e `Condicionante[]`), preservando inclusive adições, exclusões e edições de itens/condicionantes personalizados.
    - Salvamento flexível de rascunhos incompletos: permite salvar o estado em qualquer momento sem exigir preenchimento prévio de todos os campos ou bloqueios de validação formal.
    - Princípio de soberania e conformidade (RN02/RN07): distinção explícita de que salvar rascunho preserva apenas o trabalho local de edição e não se confunde com validação técnica, conclusão ou aprovação jurídica.
    - Transparência de escopo local: aviso visual explícito de que os dados ficam gravados exclusivamente no navegador deste computador, sem sincronização na nuvem nem envio para servidores remotos.
    - Barra executiva de persistência (`.storage-bar`) integrada no topo da interface com indicador visual de status do banco local, data/hora formatada do último salvamento, botão manual "💾 Salvar Rascunho" e botão "📂 Retomar Rascunho Salvo".
    - Salvamento automático de rascunho durante a navegação entre etapas e recuperação automática no carregamento inicial da aplicação.
    - Tratamento de falhas e erros de quota/bloqueio com feedback visual na interface sem perda silenciosa de dados.
    - 22 testes unitários aprovados via `npm test` (incluindo teste específico de regressão para condicionantes incompletas) e compilação de produção aprovada via `npm.cmd run build` com 0 erros.
  - *Testes manuais homologados pelo usuário (24/09/2026):*
    1. Salvamento manual de rascunho incompleto via botão "💾 Salvar Rascunho" com confirmação de carimbo de data/hora atualizado.
    2. Atualização da página (F5) no navegador confirmando a recuperação automática imediata dos dados preenchidos.
    3. Fechamento e reabertura da aba/navegador no mesmo perfil confirmando que os dados persistem no IndexedDB.
    4. Inclusão de item de checklist e condicionante personalizada na Etapa 3 (Conformidade), com correção da captura em tempo real e recuperação da condicionante incompleta testada e confirmada pelo usuário.
- **Tarefa S2.5 (Papéis de Usuário e Controle de Permissões Simuladas) — 100% Concluída e Homologada:**
  - *Implementação técnica:* `src/auth/papeis.ts`, `src/auth/papeis.test.ts`, integração no cabeçalho e roteador (`src/router.ts`), telas de Identificação (`src/pages/identificacao.ts`), Pertinência (`src/pages/pertinencia.ts`) e Conformidade (`src/pages/conformidade.ts`), e estilos dedicados em `src/style.css`.
  - *Critérios de aceite atendidos:*
    - **Matriz de permissões dos 4 perfis regulamentares (Seção 3 de docs/contexto.md):**
      1. `Administrador`: permissões operacionais e de configuração para testes amplos.
      2. `Editor / Assessor`: permissão completa para preenchimento, edição, adição/exclusão de itens/condicionantes e instrução técnica.
      3. `Leitor (Somente Consulta)`: consulta irrestrita a todas as 6 etapas, com bloqueio estrito de edição, gravação de rascunhos, carga de cenários e adição/exclusão de itens. Navegação livre entre as telas sem bloqueio por pendências de formulário.
      4. `Aprovador / Validador Executivo`: consulta e apreciação executiva do resultado sem permissão de edição direta de itens instrutórios nem assinatura institucional fictícia.
    - **Harmonização de nomenclatura:** Documentada e aplicada a correspondência onde "Aprovador" reflete a apreciação/validação executiva (sem assinatura eletrônica), enquanto o "Editor/Assessor" executa a validação técnica da instrução processual.
    - **Indicação ostensiva de simulação didática:** Banner explicativo permanente no cabeçalho (`.role-banner`) com insígnias visuais coloridas (`.role-pill`), descrição da finalidade e limite estrito de atuação, além de banner de aviso (`.readonly-banner`) nas telas em modo somente leitura. Alerta explícito de que os perfis não constituem autenticação institucional nem aprovação jurídica real.
    - **Preservação de dados e rascunhos na alternância de perfis:**
      - A troca de perfis pelo seletor "Ver como" preserva integralmente os dados em memória e no IndexedDB.
      - Extração segura do formulário: quando em modo somente leitura, as funções de extração retornam o estado em memória ativo, blindando os dados contra sobrescrita com campos vazios por estarem desabilitados no DOM.
      - Ao alternar entre perfis, o estado do formulário ativo é sincronizado antes da troca caso o perfil de origem permitisse edição.
    - **Preservação das funcionalidades anteriores:** Mantida a navegação por hash, validações da Identificação e Pertinência, checklist e condicionantes da Conformidade, persistência no IndexedDB e manifesto/cache do PWA.
    - **Suíte de testes automatizados:** 29 testes unitários aprovados via `npm test` (7 testes dedicados aos papéis e permissões).
    - **Compilação de produção:** Aprovada sem erros via `npm.cmd run build` (tsc + vite build).
  - *Testes manuais homologados pelo usuário (25/09/2026):*
    1. Assessor consegue editar e salvar rascunho.
    2. Leitor não consegue editar, carregar cenários nem salvar; os dados permanecem visíveis.
    3. Leitor navega pelas seis etapas, com ações de alteração bloqueadas.
    4. Ao voltar para Assessor, a edição é liberada e os dados e o perfil permanecem após F5.
- **Tarefa S2.6 (Revisão do Cache do PWA e Retomada Offline) — 100% Concluída e Homologada:**
  - *Implementação técnica:* `vite.config.ts`, `dist/sw.js`, `src/auth/papeis.ts`, `src/services/armazenamento.ts`, `src/services/armazenamento.test.ts`, `src/router.ts` e `src/style.css`.
  - *Critérios de aceite atendidos:*
    - **Cache de telas e recursos estáticos do PWA:** Precache automático de 31 ativos pelo Workbox Service Worker (`sw.js`), abrangendo HTML, JS, CSS, ícones/manifesto e arquivos de cenários sintéticos (`data/*.json`). Rota de navegação (`NavigationRoute`) configurada para `/conforma-gsasp/index.html`, assegurando que recarregamentos em qualquer rota funcionem sem internet após a primeira visita.
    - **Retomada offline do rascunho completo:** A inicialização assíncrona do roteador recupera automaticamente do IndexedDB todos os dados da análise (Processo, Pertinência, Checklist e Condicionantes), permitindo retomar rascunhos locais sem conexão com a internet.
    - **Preservação do perfil ativo e permissões:** Implementada persistência síncrona do perfil de usuário em `localStorage` com fallback para `sessionStorage`, garantindo que perfis selecionados persistam em janelas avulsas do PWA standalone e recarregamentos offline.
    - **Alerta explícito de escopo local:** Mantido aviso permanente na barra executiva (`.storage-disclaimer`) informando que os rascunhos ficam neste navegador e não são sincronizados entre computadores nem enviados para a nuvem.
    - **Tratamento e aviso de armazenamento em memória volátil:** Função `obterDiagnosticoArmazenamento()` integrada à barra superior. Caso o navegador bloqueie o IndexedDB e o localStorage (ex.: modo anônimo estrito ou cotas esgotadas), a interface exibe aviso ostensivo em vermelho (`.storage-memory-alert`): *"⚠️ Atenção — Armazenamento apenas em memória: os dados NÃO persistirão após fechar ou recarregar esta página."*
    - **Indicador de conectividade em tempo real:** Integrado indicador visual dinâmico (`.connection-pill`) na barra de persistência com atualização automática via eventos `online` e `offline` (`🌐 Online` vs `📡 Modo Offline (Cache Local Ativo)`).
    - **Testes automatizados e compilação:** 30 testes unitários aprovados via `npm test` e compilação de produção com empacotamento PWA aprovada via `npm.cmd run build` com 0 erros.
  - *Testes manuais homologados pelo usuário (25/09/2026):*
    1. Salvamento do rascunho online com identificação, pertinência, checklist e condicionante personalizada.
    2. Indicador alterado para Offline ao simular desconexão pelo painel Network.
    3. Recarregamento com F5 offline: sistema abriu e recuperou todos os dados salvos.
    4. Navegação pelas seis etapas offline como Leitor, com edição bloqueada.
    5. Perfil Leitor e dados preservados após F5 offline.
    6. Ao restaurar a conexão, indicador voltou para Online e foi possível retornar ao perfil Editor/Assessor.
- **Sprint 2 — Conclusão Oficial:** Todas as 6 tarefas da Sprint 2 (S2.1 a S2.6) foram concluídas, testadas e aprovadas pelo usuário. O fluxo das etapas de Identificação, Pertinência e Conformidade, com condicionantes jurídicas, perfis de acesso simulados, persistência no IndexedDB e suporte PWA offline está integralmente funcional.
- **Sprint 3 — Em andamento:**
  - **Tarefa S3.1 (Catálogo de Regras Funcionais em docs/regras-funcionais.md) — 100% Homologada para Prototipagem:**
    - Documento normativo e funcional estruturado em `docs/regras-funcionais.md` especificando 6 regras determinísticas (`REG-01` a `REG-06`).
    - **Aprovação Funcional (25/09/2026):** Aprovado pelo usuário como especificação funcional demonstrativa para desenvolvimento e testes do protótipo (não representa validação jurídica das regras nem aprovação de processos reais).
    - **Salvaguardas Mandatórias Registradas:**
      1. Preservação integral das validações existentes de campos obrigatórios e do salvamento de rascunhos locais.
      2. Condicionante em cumprimento continua pendente de avaliação humana, mesmo com providência preenchida.
      3. O mínimo técnico de caracteres não comprova adequação ou suficiência da justificativa.
  - **Tarefa S3.2 (Implementar funções em src/domain/regras.ts e testes) — 100% Concluída:**
    - *Implementação técnica:* `src/domain/regras.ts`, `src/domain/regras.test.ts` e atualização em `src/domain/tipos.ts`.
    - *Critérios de aceite atendidos:*
      1. **Motor determinístico puro:** Aplica as 6 regras do catálogo sem dependência de IA externa, sem chamadas remotas e sem efeitos colaterais. A mesma entrada produz rigorosamente a mesma saída.
      2. **Estrutura mandatória dos achados (RN03):** Cada apontamento emitido liga: *Evidência* &rarr; *Regra/Motivo* &rarr; *Impacto* &rarr; *Providência* &rarr; *Responsável*.
      3. **Separação rigorosa de campos (RN04/RN05):** Estrutura `Achado` separa explicitamente a classificação sugerida pelo sistema (`classificacaoSugerida: ClassificacaoAchado | null`), o estado de validação (`estadoValidacao: 'SUGESTAO_SISTEMA'`) e a decisão do assessor (`classificacaoValidada: null`). A "Classificação pendente" é modelada como `classificacaoSugerida === null`, sem inventar uma quinta gravidade.
      4. **Preservação de decisões humanas e divergências (RN02/RN07):** Na REG-02, a conclusão técnica favorável do assessor é preservada integralmente contra respostas negativas preliminares, emitindo sinalização de divergência humana para revisão sem gerar achado de recusa material.
      5. **Não conversão em aprovação automática (RN11):** O motor nunca converte ausência de dados ou ausência de achados em conclusão executiva para assinatura.
      6. **Imutabilidade:** Os dados de entrada são tratados como somente leitura, sem mutação de objetos ou propriedades.
    - *Testes e compilação:*
      - **48 testes unitários aprovados via `npm test`** (18 testes dedicados da S3.2 cobrindo todos os cenários de dados incompletos, vigência invertida, condicionantes com/sem providência, divergência humana e governança).
      - **Compilação e empacotamento PWA aprovados via `npm.cmd run build` com 0 erros** (bundle, precache de 31 ativos e Service Worker intactos).
  - **Tarefa S3.3 (src/pages/achados.ts e serviço de validação humana) — 100% Concluída e Homologada:**
    - *Implementação técnica:* `src/pages/achados.ts`, `src/pages/achados.test.ts`, integração em `src/router.ts`, estilos em `src/style.css`, suporte em `src/domain/tipos.ts` e `src/services/armazenamento.ts`.
    - *Critérios de aceite técnicos atendidos:*
      1. **Integração com o motor S3.2:** A tela sincroniza os dados do processo, pertinência, checklist e condicionantes através de `sincronizarAchadosComMotor()`.
      2. **Anatomia RN03 completa:** Cada apontamento exibe *Regra de Origem*, *Evidência dos Autos*, *Regra/Motivo*, *Impacto Potencial*, *Providência Recomendada* e *Setor Responsável*.
      3. **Desacoplamento rigoroso das classificações (RN04/RN05):** Exibe separadamente a Classificação Sugerida pelo Sistema e a Classificação Validada pelo Assessor. Quando o motor não sugere gravidade, exibe ostensivamente *"Classificação pendente de validação humana"*.
      4. **Ações completas de revisão humana (RN05/RN06):**
         - Validação com um clique (adotando a gravidade sugerida ou selecionando gravidade se pendente).
         - Alteração fundamentada da gravidade pelo assessor (`alterarClassificacaoAchado`).
         - Rejeição fundamentada com justificativa obrigatória registrada (`rejeitarAchado`).
         - Desfazer / Reabrir para revisão (`reabrirAchadoParaRevisao`).
         - Inclusão e exclusão de achados manuais com formulário e anatomia RN03 completa (`adicionarAchadoManual`).
      5. **Controle de perfis de usuário (S2.5):** Usuários no perfil *Leitor* ou *Aprovador* visualizam os achados em modo somente consulta, com controles de validação/rejeição e adição desabilitados.
      6. **Preservação de revisões e detecção de alterações (RN10):** Ao reexecutar o motor, apontamentos não são duplicados. Se os dados de origem nos autos forem alterados após uma validação humana prévia, o sistema sinaliza ostensivamente a necessidade de nova revisão (`necessitaNovaRevisao: true`).
      7. **Separação visual estrita de natureza:**
         - Alertas de Instrução e Preenchimento Pendente (RN11) destacados em quadro azul informativo.
         - Divergências com o Juízo Humano da Pertinência (RN02/RN07) destacadas em quadro âmbar orientador.
         - Apontamentos de Desconformidade (RN03/RN04) listados em cartões estruturados.
      8. **Salvaguarda de governança (RN11):** Nenhuma sugestão é validada automaticamente. A ausência de achados pelo motor não confere e não presume aptidão automática para assinatura.
      9. **Persistência local integral:** O estado dos achados (incluindo validações, rejeições com justificativas e achados manuais) é salvo e restaurado via `salvarRascunhoAtual` e `recuperarUltimoRascunho`.
    - *Testes automatizados e compilação verificados:*
      - **57 testes unitários aprovados via `node --experimental-strip-types --test src/**/*.test.ts`** (9 novos testes dedicados cobrindo sincronização, ações de revisão, achados manuais, persistência e RN10).
      - **Compilação e empacotamento PWA aprovados via `npm.cmd run build` com 0 erros** (dist/ gerada em 422ms, precache de 31 ativos).
    - *Testes manuais consolidados e homologados pelo usuário (25/09 e 28/09/2026):*
      - [x] Geração da sugestão REG-05, inicialmente pendente.
      - [x] Bloqueio da validação sem classificação.
      - [x] Validação como RELEVANTE e alteração para FORMAL.
      - [x] Preservação da validação e classificação após salvar e recarregar.
      - [x] Bloqueio de edição nos perfis Leitor e Aprovador.
      - [x] Aviso de alteração dos dados de origem (RN10), sem duplicidade de apontamentos.
      - [x] Reabertura para revisão (`reabrirAchadoParaRevisao`).
      - [x] Bloqueio da rejeição sem justificativa.
      - [x] Rejeição justificada e preservada após salvar e recarregar.
      - [x] Inclusão do achado manual com estado VALIDADO e classificação FORMAL.
      - [x] Preservação do achado manual após Salvar Rascunho e recarregar a página (F5).
      - [x] Exclusão do achado manual preservada após Salvar Rascunho e recarregar a página (F5), mantendo a sugestão preexistente sobre condicionante jurídica.
  - **Tarefa S3.4 (src/pages/riscos.ts e src/domain/riscos.ts) — Concluída Tecnicamente (Aguardando Homologação dos Testes Manuais):**
    - *Implementação técnica:* `src/domain/riscos.ts`, `src/domain/riscos.test.ts`, `src/pages/riscos.ts`, `src/pages/riscos.test.ts`, integração em `src/router.ts`, persistência no IndexedDB em `src/services/armazenamento.ts` e `src/services/armazenamento.test.ts`, e estilização em `src/style.css`.
    - *Critérios de aceite técnicos atendidos:*
      1. **Quatro dimensões e quatro níveis:** Avaliação multidimensional cobrindo as dimensões *Jurídica*, *Financeira*, *Operacional* e de *Controle*, com níveis *Baixo*, *Moderado*, *Alto* e *Crítico*.
      2. **Não presunção de risco baixo (RN11/RN12):** Nenhuma dimensão nasce pré-definida como "Baixo" por padrão. Todas iniciam como pendentes de apreciação humana (`nivel: null`). A ausência de achados apontados nas etapas anteriores não equivale a risco baixo nem autoriza aprovação automática.
      3. **Classificação humana e justificativa obrigatória:** Todo nível de risco atribuído exige justificativa técnica fundamentada nos autos (mínimo formal de 5 caracteres), com alerta didático de que a contagem de caracteres não atesta a suficiência substancial da motivação.
      4. **Vínculo formal a achados validados:** Lista dinâmica com checkboxes dos achados no estado `VALIDADO` da análise, permitindo ao assessor vincular explicitamente os apontamentos concretos que sustentam a avaliação da dimensão.
      5. **Governança de vínculos e achados em revisão (RN10):** Se um achado anteriormente vinculado for reaberto para revisão ou rejeitado na Etapa 4, ele deixa de ser considerado uma referência validada. A dimensão de risco afetada exibe um alerta visual de governança destacando que o achado retornou para revisão e que a avaliação precisa ser revista pelo assessor. O nível de risco e a justificativa técnica são estritamente preservados, sem reclassificação automática. É disponibilizado botão para desvinculação voluntária do achado no card.
      6. **Governança e Metodologia (RN12):** Banner explicativo permanente informando que, até a homologação da metodologia institucional definitiva pela SESP-MT, a avaliação é estritamente orientada pelo juízo do assessor, sem aplicação de pesos inventados ou fórmulas matemáticas arbitrárias.
      7. **Painel executivo de KPIs:** Contadores dinâmicos em tempo real exibindo a quantidade de dimensões em cada nível (Baixo, Moderado, Alto, Crítico e Pendentes).
      8. **Carga rápida de cenários didáticos:** Seletor demonstrativo com 3 cenários fictícios pré-configurados (Regular, Com Condicionante, e Grave) e opção de redefinição para facilitar testes rápidos e apresentações.
      9. **Controle de papéis simulados (S2.5):** Usuários nos perfis *Leitor* e *Aprovador* visualizam a matriz de riscos em modo somente consulta, com controles de seleção, vínculos e justificativas desabilitados, e navegação liberada.
      10. **Persistência local integral (S2.4):** A avaliação completa de riscos (dimensões, níveis, justificativas e achados relacionados) é persistida no IndexedDB e localStorage via `salvarRascunhoAtual` e restaurada em `recuperarUltimoRascunho` e na inicialização da aplicação (F5).
    - *Verificações automatizadas aprovadas:*
      - **80 testes unitários aprovados via `npm test`** (23 testes dedicados da S3.4 cobrindo tipos, imutabilidade, validação de campos, identificação de vínculos em revisão/órfãos, desvinculação, contadores de KPIs, renderização da tela, perfis somente leitura e persistência no IndexedDB).
      - **Compilação e empacotamento PWA aprovados via `npm.cmd run build` com 0 erros** (bundle gerado sem falhas, precache de 31 ativos e Service Worker íntegros).
    - *Testes manuais confirmados pelo usuário (28/09/2026):*
      - [x] TM-S3.4-01: Campos vazios bloqueiam o avanço, sem risco Baixo automático.
      - [x] TM-S3.4-02: Nível e justificativa persistem após salvar e recarregar a página (F5).
      - [x] TM-S3.4-03: As quatro dimensões preenchidas permitem avançar para a próxima etapa.
      - [x] TM-S3.4-04: Perfis Leitor e Aprovador não editam (somente consulta); perfil Editor permite edição e seleção normalmente.
      - [x] TM-S3.4-05: O vínculo com achado validado persiste após salvar e recarregar a página (F5).
      - [x] TM-S3.4-06: Ao reabrir o achado na Etapa 4, ele desaparece das opções de vínculo disponível, preservando o nível e a justificativa do risco.
    - *Testes manuais pendentes de homologação pelo usuário (a realizar em casa):*
      - [ ] TM-S3.4-07: Aviso quando um achado vinculado retorna para revisão (RN10): verificar se na dimensão afetada surge o banner amarelo de alerta informando que o achado não é mais referência validada e que a avaliação deve ser revista pelo assessor.
      - [ ] TM-S3.4-08: Preservação do nível e da justificativa nessa situação: conferir que o nível e a justificativa permanecem intactos, sem reclassificação automática.
      - [ ] TM-S3.4-09: Desvinculação voluntária e persistência: clicar no botão "Desvincular achado em revisão", verificar remoção do aviso e conferir persistência após Salvar Rascunho e recarregar (F5).
- **Próxima tarefa da Sprint 3:** S3.5 (`src/services/auditoria.ts` e histórico local) — *Ainda não iniciada*.
- **Caminho atual do projeto:** `C:\Users\79310680253\OneDrive\Documentos\Projetos\conforma-gsasp-retomada`
- **Comandos para manter o servidor local:**
  ```powershell
  npm.cmd run build
  npm.cmd run preview
  # Endereço: http://localhost:4173/conforma-gsasp/
  ```

## Sprint 3 — Motor de regras, achados e riscos

Objetivo: sugestões verificáveis, revisão humana e avaliação de risco explicável.

| ID | Tarefa e arquivos principais | Tecnologia | Pronto quando |
|---|---|---|---|
| S3.1 | Catalogar regras aprovadas em docs/regras-funcionais.md, vinculadas a contexto.md | Markdown | Cada regra informa condição, dados necessários, saída e fonte/motivo; lacunas destacadas; sem pesos inventados |
| S3.2 | Implementar funções em src/domain/regras.ts e testes | TS/Vitest | Mesma entrada produz mesmo resultado; dados ausentes não geram aprovação; sugestões não são classificações definitivas |
| S3.3 | src/pages/achados.ts e serviço de validação | TS | Evidência, regra/motivo, impacto, providência e responsável; sugestão identificada; validar/rejeitar com justificativa; sem duplicar achados ao reavaliar |
| S3.4 | src/pages/riscos.ts e src/domain/riscos.ts | TS | Dimensões e níveis exibidos com justificativa; até aprovação da metodologia, avaliação humana; cálculo automatizado somente com critérios aprovados e testados |
| S3.5 | src/services/auditoria.ts e histórico local | TS | Eventos de criação/edição/validação e antes/depois relevantes registrados; interface não oferece apagar eventos; informar que armazenamento local não é inviolável |
| S3.6 | Estrutura do painel em src/pages/painel.ts | TS/CSS | Contadores derivados dos dados; áreas dos indicadores preparadas sem apresentar metas como medições |

Testes: casos de vigência inconsistente, valores divergentes quando existirem campos comparáveis, condicionante pendente e pertinência não demonstrada. Vigência inconsistente é alerta de dados; consequência jurídica depende de validação funcional/humana.
Commit exemplo: feat: adiciona revisão humana dos achados (S3.3).

## Sprint 4 — Resultado executivo, relatórios e testes

Objetivo: converter análise revisada em documento para apoio à decisão.

| ID | Tarefa e arquivos principais | Tecnologia | Pronto quando |
|---|---|---|---|
| S4.1 | Definir tabela de decisão em docs/regras-funcionais.md | Markdown | Aprovar critérios para quatro conclusões e tratamento de insuficiência de dados; sem autorização automática para assinatura |
| S4.2 | src/domain/conclusao.ts e src/pages/resultado.ts | TS | Sugestão separada da validação; botão de validação exige revisão; alterações materiais invalidam validação anterior; autoridade não é substituída |
| S4.3 | Documento e estilos de impressão em src/pages/resultado.ts e src/style.css | TS/HTML/CSS | Identificação, pertinência, quadro, achados, riscos, pontos sem óbice, providências/responsáveis e conclusão; responde às cinco perguntas; HTML imprimível e PDF pelo navegador |
| S4.4 | Definir e implementar indicadores em src/services/indicadores.ts e painel | TS | Eventos/período aprovados; divisão por zero tratada; baseline estimado identificado; dados demonstrativos separados; redução descrita como aproximadamente 66,7% |
| S4.5 | Consolidar testes em src/domain/*.test.ts e scripts/test_gerar_dados.py | Vitest/pytest | Ao menos dez testes unitários úteis; seis cenários funcionais abaixo verificados; não alterar teste correto para esconder erro |

Cenários: regular; condicionante pendente; divergência de valor; vigência inconsistente; documento a confirmar; pertinência não demonstrada. Acrescentar casos para conclusão não recomendável e ressalva após definição dos critérios. Python valida massa/estrutura, TypeScript testa a regra usada no aplicativo.
Commit exemplo: feat: gera resultado executivo imprimível (S4.3).

## Sprint 5 — Homologação, segurança, UX e publicação final

Objetivo: fluxo completo demonstrável, documentação e entrega.

| ID | Tarefa e arquivos principais | Tecnologia | Pronto quando |
|---|---|---|---|
| S5.1 | Revisar dados públicos com scripts/validar_dados.py e checklist manual | Python/revisão | Proveniência inteiramente fictícia verificada; nenhum documento real, token ou segredo; mascaramento demonstrativo feito antes do JSON; testes não alegam provar ausência de coincidência com pessoas reais |
| S5.2 | Revisar componentes, formulários, erros e impressão | TS/CSS | Labels, foco, teclado, contraste, telas menores e impressão legíveis; não depender só de cor |
| S5.3 | Verificar instalação, cache e atualização PWA | PWA | Fluxo offline após primeiro acesso; nova versão não apaga análises locais; limitações de navegador documentadas |
| S5.4 | Revisar workflow de build/testes/publicação | GitHub Actions | Testes e build passam antes do deploy; site e rotas funcionam no endereço final e celular |
| S5.5 | README.md e docs/demonstracao.md | Markdown | Problema, solução, arquitetura, como rodar, KPIs, uso de IA, dados fictícios, limites e evolução; roteiro executável em menos de dez minutos |
| S5.6 | Revisar entrega e marcar versão | Git/documentação | Cinco processos sintéticos demonstráveis; checklist abaixo concluído; versão/tag coerente com resultado realmente validado |

Lighthouse: metas sugeridas no sprint recebido (desempenho 85, acessibilidade 90, boas práticas 90), registrar condições da medição. Não substituir testes funcionais por nota de ferramenta. Instalação/offline devem ser testados diretamente.
Commit exemplo: docs: documenta entrega e demonstração (S5.5).

## Definição de pronto do MVP

- [ ] Documentos e decisões preservados; pendências materiais resolvidas ou explicitamente limitadas.
- [ ] Seis etapas funcionam de ponta a ponta com dados sintéticos.
- [ ] Quatro elementos essenciais destacados.
- [ ] Pertinência e condicionantes tratadas explicitamente.
- [ ] Quatro classificações de achados e quatro conclusões representadas.
- [ ] Sugestões e conclusões dependem de validação humana; mudanças relevantes exigem revisão.
- [ ] Documento responde às cinco perguntas e permite impressão/PDF.
- [ ] KPIs explicáveis, baseline estimado e medições de demonstração identificadas.
- [ ] Perfis e registros locais apresentados como simulação.
- [ ] Persistência e offline testados; ausência de sincronização/backup explicada.
- [ ] Testes relevantes passam; publicação funciona no subcaminho correto.
- [ ] Nenhum dado real ou segredo publicado.
- [ ] README, roteiro de demonstração e transparência sobre IA completos.

## Ajustes em relação ao texto recebido

Documentos organizados em tarefas numeradas, arquivos e critérios verificáveis. Mantidas as cinco sprints, inclusive PWA/publicação inicial na Sprint 1 e revisão final na Sprint 5. Separado andamento das quatro conclusões. Classificações jurídicas automáticas, metodologia de risco e critérios de aptidão dependem de validação funcional. Retirada a duplicação de motor de regras em Python; mascaramento deslocado para antes da publicação; mantidos dados locais como demonstração. Esses ajustes não acrescentam integração institucional ou IA em execução.
