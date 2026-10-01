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
  - **Tarefa S3.4 (src/pages/riscos.ts e src/domain/riscos.ts) — 100% Concluída e Homologada:**
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
    - *Testes manuais consolidados e homologados pelo usuário (28/09/2026):*
      - [x] TM-S3.4-01: Campos vazios bloqueiam o avanço, sem risco Baixo automático.
      - [x] TM-S3.4-02: Nível e justificativa persistem após salvar e recarregar a página (F5).
      - [x] TM-S3.4-03: As quatro dimensões preenchidas permitem avançar para a próxima etapa.
      - [x] TM-S3.4-04: Perfis Leitor e Aprovador não editam (somente consulta); perfil Editor permite edição e seleção normalmente.
      - [x] TM-S3.4-05: O vínculo com achado validado persiste após salvar e recarregar a página (F5).
      - [x] TM-S3.4-06: Ao reabrir o achado na Etapa 4, ele desaparece das opções de vínculo disponível, preservando o nível e a justificativa do risco.
      - [x] TM-S3.4-07: Ao reabrir um achado vinculado, apareceu o aviso de retorno para revisão (RN10) na dimensão afetada.
      - [x] TM-S3.4-08: O nível Baixo e a justificativa foram rigorosamente preservados, sem reclassificação automática.
      - [x] TM-S3.4-09: Após desvincular, salvar o rascunho e recarregar com F5, o aviso desapareceu e o nível e a justificativa permaneceram preservados.
  - **Tarefa S3.5 (Trilha de Auditoria Local e Histórico de Eventos — src/services/auditoria.ts) — Concluída e Homologada:**
    - *Implementação técnica:* `src/services/auditoria.ts`, `src/services/auditoria.test.ts`, `src/services/armazenamento.ts`, `src/services/armazenamento.test.ts`, `src/domain/tipos.ts`, `src/pages/achados.ts`, `src/pages/riscos.ts`, `src/router.ts` e `src/style.css`.
    - *Critérios de aceite técnicos atendidos:*
      1. **Histórico local de eventos associado à análise (EventoLocal):** Registro estruturado com `id`, `dataHora`, `usuarioFicticio`, `papel`, `acao`, `entidade`, `registroId`, `antesDepois` e `descricao` legível.
      2. **Transparência e governança institucional:** Aviso ostensivo permanente (`AVISO_AUDITORIA_LOCAL`) informando que a trilha é local e demonstrativa (IndexedDB deste navegador), sem garantia de inviolabilidade criptográfica, fé pública ou validade como auditoria corporativa institucional (SIGADOC/SEI).
      3. **Imutabilidade e ausência de exclusão individual na UI:** A interface não oferece botões ou mecanismos para editar, alterar ou apagar eventos individuais da trilha de auditoria.
      4. **Não geração de eventos duplicados em carregamentos:** O carregamento da página, renderização de rotas e reabertura após F5 (`initRouter`, `renderRoute`) não geram eventos espúrios. Apenas ações explícitas do usuário (salvamento, validação, alteração de gravidade, rejeição, reabertura, inclusão/exclusão manual, avaliação de risco, vinculação e troca de perfil) emitem registros.
      5. **Rastreamento de mudanças relevantes (antes/depois):** Eventos de validação, alteração de gravidade, rejeição, riscos e perfis gravam o estado anterior e posterior de forma inspecionável com resumo amigável.
      6. **Persistência local no IndexedDB com fallback:** A lista de eventos é integrada a `DadosRascunhoCompleto` e persiste integralmente após recarregar a página (F5) ou retomar rascunho anterior.
      7. **Interface acessível em todas as etapas:** Botão "📜 Auditoria Local (N)" na barra de persistência superior, abrindo modal acessível com contadores, banner de governança e ordenação cronológica decrescente (mais recente no topo).
    - *Verificações automatizadas aprovadas:*
      - **93 testes unitários aprovados via `npm test`** (13 testes dedicados da S3.5 cobrindo tipos, imutabilidade, formatação, renderização sem controles de exclusão e persistência no IndexedDB).
      - **Compilação e empacotamento PWA aprovados via `npm.cmd run build` com 0 erros** (bundle gerado em 790ms, precache de 31 ativos e Service Worker íntegros).
    - *Testes manuais da S3.5 (Homologados pelo usuário em 28/09/2026):*
      - [x] TM-S3.5-01: Acesso à trilha de auditoria exibindo título, contador, aviso de governança e ausência de controles de edição/exclusão; fechamento via Esc preservando a etapa e consulta funcional como Leitor.
      - [x] TM-S3.5-02: Validação do achado registrada; alteração Formal → Relevante exibida corretamente em Antes/Depois na trilha; ambos os eventos preservados após salvar e F5.
      - [x] TM-S3.5-03: Rejeição sem justificativa bloqueada; rejeição com justificativa registrada integralmente no histórico e preservada após salvar e F5.
      - [x] TM-S3.5-04: Persistência integral da trilha após "Salvar Rascunho" e recarregar com F5, preservando os eventos sem duplicá-los pelo carregamento ou navegação entre Achados e Riscos.
      - [x] TM-S3.5-05: Registro de alteração de risco jurídico (Baixo para Moderado com Antes/Depois) e registro de alternância de perfil simulado no cabeçalho (Assessor → Leitor → Assessor).
- **Tarefa S3.6 (Estrutura do painel em src/pages/painel.ts) — 100% CONCLUÍDA E HOMOLOGADA:**
    - *Implementação técnica:* `src/pages/painel.ts`, `src/pages/painel.test.ts`, `src/router.ts` e `src/style.css`.
    - *Critérios de aceite técnicos atendidos:*
      1. **Painel executivo da análise ativa com metadados essenciais:** Destaque para número do processo, instrumento, contratado, objeto, valor estimado, vigência e CNPJ (RN01).
      2. **Contadores derivados estritamente dos dados vigentes:** Situação da identificação, conclusão da pertinência, itens do checklist (conformes, pendentes, a confirmar), condicionantes (atendidas, em cumprimento, pendentes), achados validados por gravidade, sugestões pendentes, rejeições fundamentadas, riscos por dimensão e total de eventos na trilha de auditoria local.
      3. **Diferenciação rigorosa de situações de achados:** Sugestões do motor pendentes de validação e apontamentos rejeitados NÃO são contabilizados como impedimentos confirmados até decisão formal do assessor.
      4. **Não transformação automática de pendências em óbice jurídico:** Alertas claros de governança informando que pendências instrutórias e condicionantes demandam saneamento e não equivalem a impedimento automático (RN11 e RN13).
      5. **Preservação de riscos sob juízo humano:** As 4 dimensões (Jurídica, Financeira, Operacional, Controle) preservam rigorosamente os níveis fixados pelo assessor; dimensões não avaliadas permanecem como "Pendente", sem atribuição de risco baixo artificial (RN12).
      6. **Indicadores de eficiência e produtividade com distinção ética (metas vs. medições):** Estrutura dos indicadores (Tempo Médio de Análise e Taxa de Retrabalho) apresentando baseline inicial estimado (30 min e 30%), meta de até ~67% de redução e medição estrita como "Sem dados medidos", com salvaguarda institucional de que metas não constituem ganho comprovado antes de validação empírica no piloto (docs/contexto.md — Seção 2).
      7. **Imutabilidade e não emissão de eventos espúrios:** A consulta ao Painel Executivo é puramente de leitura, sem alteração de rascunhos nem emissão de eventos na trilha de auditoria.
      8. **Navegação e usabilidade institucional:** Atalhos diretos para as 6 etapas, botão "📊 Painel" na barra de persistência superior e suporte a `#/' e `#/painel'.
    - *Verificações automatizadas aprovadas:*
      - **99 testes unitários aprovados via `npm test`** (6 testes dedicados da S3.6 cobrindo contadores, diferenciação de achados, riscos pendentes e salvaguardas de indicadores).
      - **Compilação e empacotamento PWA aprovados via `npm.cmd run build` com 0 erros** (bundle gerado em 1.18s, precache de 31 ativos e Service Worker íntegros).
    - *Testes manuais da S3.6 (100% Homologados pelo usuário em 29/09/2026):*
      - [x] TM-S3.6-01: Acesso ao Painel Executivo na rota inicial `#/` e `#/painel`, conferência do cabeçalho com metadados do processo, botão de atalho na barra superior e preservação do contador de auditoria após F5 sem eventos espúrios.
      - [x] TM-S3.6-02: Exibição dos contadores reais de checklist e condicionantes no painel e validação de conformidade com mensagem semântica correta ("concluída com pendências" no Cenário 5 e "concluída sem pendências" no Cenário 1, sem presunção de impedimento automático) (Aprovado pelo usuário em 29/09/2026).
      - [x] TM-S3.6-03: Exibição dos contadores de achados coincidindo com a etapa (1 validado Relevante, 1 rejeitado e 0 impeditivos validados), sem contagem indevida de sugestão ou rejeição como impedimento.
      - [x] TM-S3.6-04: Exibição dos riscos por dimensão coincidindo com a etapa (Jurídica Moderado e dimensões não avaliadas permanecendo pendentes, sem risco baixo artificial).
      - [x] TM-S3.6-05: Exibição dos indicadores de tempo e retrabalho com distinção entre baseline estimado (30 min e 30%), meta de até ~67% (10 min e 10%), medição "Sem dados medidos", fórmulas visíveis e salvaguarda institucional, sem exibição artificial de 0% (Aprovado pelo usuário em 29/09/2026).
      - [x] TM-S3.6-06: Navegação funcional pelos atalhos para as 6 etapas e retorno ao Painel pelo cabeçalho, barra de persistência e botões de rodapé; rotas #/identificacao, #/pertinencia, #/conformidade, #/achados, #/riscos e #/resultado conferidas, dados preservados, recarga F5 mantendo estado e auditoria local mantida em 0 sem eventos espúrios (Homologado pelo usuário em 29/09/2026).
- **Sprint 3 — 100% Concluída e Homologada:** Todas as 6 tarefas da Sprint 3 (S3.1 a S3.6) foram concluídas, testadas (99 testes unitários aprovados) e validadas manualmente pelo usuário.
- **Sprint 4 — Em andamento:**
  - **Tarefa S4.1 (Definir tabela de decisão em docs/regras-funcionais.md) — 100% Concluída e Homologada:**
    - Elaborada e homologada a Seção 7 em `docs/regras-funcionais.md` especificando a lógica determinística integral da RN08.
    - Mantidas rigorosamente as 4 conclusões regulamentares (`APTO_PARA_ASSINATURA`, `APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA`, `RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA` e `NAO_RECOMENDAVEL_PARA_ASSINATURA`), vedada quinta conclusão.
    - Insuficiência de dados instrutórios tratada como código de motivo (`MOT-SANEAMENTO-INSUFICIENCIA-DADOS` e `MOT-SANEAMENTO-AVALIACOES-PENDENTES`) sob `RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA`.
    - Cascata de precedência lógica estrita (P1 a P5) com precedência absoluta de P1 sobre P2 a P5 (dados e avaliações mínimas concluídas antes de avaliar óbices P2). Camada P2 nomeada como "Óbice Impeditivo no Estado Atual / Recusa".
    - Tratamento rigoroso dos 4 estados do checklist: `confirmar` em P1 (diligência em aberto); `pendente` em P3 como deficiência conhecida (`DEC-07A`, `MOT-SANEAMENTO-CHECKLIST-PENDENTE`); `nao_aplicavel` justificado como formalmente resolvido admitindo P4 e P5; `nao_aplicavel` sem justificativa obrigatória em P1 (`DEC-01`).
    - Desmembramento de DEC-07 em DEC-07A (checklist pendente) e DEC-07B (achado relevante / condicionante).
    - Ajuste em P5 (DEC-10): plena regularidade admite itens dispensados com justificativa válida, mantendo zero pendentes, zero a confirmar, zero achados, condicionantes atendidas e 4x Baixo.
    - DEC-04 ajustada: sem a expressão contraditória "sanear vício insanável", com providência precisa sobre o óbice impeditivo no estado atual e eventual saneamento futuro se cabível.
    - DEC-05 ajustada: redação neutra e tecnicamente aderente à matriz de riscos, sem presunção automática de dano severo.
    - Precedência P4 desdobrada e motivos de ressalva separados formalmente (`MOT-RESSALVA-ACHADO-FORMAL`, `MOT-RESSALVA-MELHORIA`, `MOT-RESSALVA-RISCO-MODERADO`, `MOT-RESSALVA-PERTINENCIA-COM-JUSTIFICATIVA`), com regra de agregação de múltiplos códigos MOT quando coexistirem.
    - Eliminação do gap de risco moderado isolado (DEC-09C) e tratamento explícito de `PERTINENTE_COM_JUSTIFICATIVA` (DEC-09D).
    - Tabela completa de regras `DEC-01` a `DEC-10`, 17 cenários representativos de teste documentados e declaração formal de Totalidade e Determinismo (Seção 7.7).
    - Totalidade e determinismo rigorosamente conferidos: zero combinações sem regra aplicável e zero combinações gerando conclusões ambíguas.
    - Salvaguardas: vedação de autorização automática para assinatura, soberania humana e invalidação dinâmica por alterações supervenientes (RN10).
    - *Homologada formalmente pelo usuário em 29/09/2026.*
  - **Tarefa S4.2 (src/domain/conclusao.ts e src/pages/resultado.ts) — 100% Concluída e Homologada:**
    - *Implementação técnica:* `src/domain/conclusao.ts`, `src/domain/conclusao.test.ts`, `src/pages/resultado.ts`, `src/pages/resultado.test.ts`, integração em `src/router.ts`, suporte em `src/services/auditoria.ts`, `src/services/armazenamento.ts` e estilização em `src/style.css`.
    - *Critérios de aceite técnicos atendidos:*
      1. **Motor de Domínio Puro e Determinístico (`src/domain/conclusao.ts`):** Aplicação estrita da precedência $P1 \rightarrow P2 \rightarrow P3 \rightarrow P4 \rightarrow P5$, produzindo unicamente uma das 4 conclusões regulamentares da RN08, sem dependência de DOM, APIs de interface ou efeitos colaterais.
      2. **Precedência Absoluta de P1 (RN08 / Seção 7.2):** Dados instrutórios essenciais incompletos (`DEC-01`) ou avaliações mínimas pendentes (`DEC-02`) ativam P1 antes de qualquer avaliação de óbices P2 a P5.
      3. **Consolidação Conservadora de Riscos (RN12):** Consolida as 4 dimensões (Crítico > Alto > Moderado > Baixo); qualquer dimensão não avaliada aciona P1 (`MOT-SANEAMENTO-AVALIACOES-PENDENTES`), vedada presunção automática de risco Baixo.
      4. **Tratamento Integral dos 4 Estados do Checklist:** Itens `confirmar` acionam P1 (`DEC-02`); itens `pendente` conhecidos acionam P3 (`DEC-07A`, `MOT-SANEAMENTO-CHECKLIST-PENDENTE`); itens `nao_aplicavel` com justificativa válida são formalmente resolvidos admitindo P4 e P5 (`DEC-10`); itens `nao_aplicavel` sem justificativa obrigatória acionam P1 (`DEC-01`).
      5. **Agregação de Múltiplos Códigos de Motivo (P4):** Coexistência de ressalvas (achado formal, melhoria, risco moderado e/ou pertinência com justificativa) resulta univocamente em `APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA`, agregando todos os códigos `MOT-*` aplicáveis na fundamentação auditável.
      6. **Espaço de Deliberação e Divergência Humana Soberana (RN02/RN07):** Assessor pode adotar a sugestão do motor ou divergir motivadamente. Seleção divergente exige justificativa técnica obrigatória ($\ge 10$ caracteres) para homologação.
      7. **Trilha de Auditoria Integrada (S3.5):** Registro de eventos padronizados `VALIDACAO_CONCLUSAO`, `DIVERGENCIA_CONCLUSAO` (com fundamentação nos autos) e `REABERTURA_CONCLUSAO`.
      8. **Invalidação Dinâmica Automática (RN10):** Alteração superveniente em dados de etapas anteriores (processo, pertinência, checklist, condicionantes, achados ou riscos) invalida automaticamente a conclusão homologada e exibe alerta ostensivo de reavaliação necessária, com registro único de auditoria sem duplicações.
      9. **Respostas Estruturadas às 5 Perguntas Executivas (RN09):** Responde com precisão: 1. Pode assinar? 2. O que corrigir? 3. Quem corrige? 4. Retorna ao Gabinete? 5. Exige nova análise jurídica?
      10. **Salvaguarda Institucional e Vedação de Assinatura Automática (RN08/RN11):** Banner ostensivo destacando a natureza estritamente indicativa, sem chancela eletrônica, autorização automática ou substituição da deliberação da autoridade competente.
      11. **Controle de Papéis e Persistência Local:** Perfis *Leitor* e *Aprovador* em modo somente consulta (`readonly-banner`); persistência da conclusão homologada, justificativa e observações no IndexedDB/localStorage via `salvarRascunhoAtual` e restauração em `recuperarUltimoRascunho`.
    - *Verificações automatizadas aprovadas:*
      - **149 testes unitários aprovados via `npm test`** (32 testes de domínio cobrindo todos os 17 cenários da RN08 + 13 testes da tela de resultado com regressão RN10 completa A-H + 104 preexistentes, 0 falhas).
      - **Compilação e empacotamento PWA aprovados via `npm.cmd run build` com 0 erros** (bundle gerado com sucesso, precache de 31 ativos e Service Worker íntegros).
    - *Status dos Testes Manuais da S4.2 (100% Aprovados pelo usuário em 30/09/2026):*
      - [x] TM-S4.2-01: APROVADO (Adoção da sugestão do sistema em consonância com o motor no Cenário 1, homologação exibindo selo "PARECER HOMOLOGADO EM CONSONÂNCIA", metadados e registro na auditoria).
      - [x] TM-S4.2-02: APROVADO (Reabertura de parecer para revisão, bloqueio estrito de divergência com justificativa vazia ou curta e homologação de divergência técnica fundamentada).
      - [x] TM-S4.2-03: APROVADO (Invalidação dinâmica automática da conclusão RN10 após alteração superveniente na matriz de riscos, persistência estrita e registro único na trilha de auditoria local sem duplicação após F5 — Homologado pelo usuário em 30/09/2026).
      - [x] TM-S4.2-04: APROVADO (Conferência das respostas às 5 Perguntas Executivas Centrais RN09 e das 4 salvaguardas regulamentares da SESP-MT, coerência de fluxo e ausência de eventos espúrios de auditoria — Homologado pelo usuário em 30/09/2026).
      - [x] TM-S4.2-05: APROVADO (Modo somente consulta nos perfis Leitor e Aprovador com banner, bloqueio de controles e preservação de dados).
    - *Status Geral da Sprint 4 e MVP Demonstrativo:*
      - S4.1: 100% HOMOLOGADA (Tabela de Decisão RN08 em docs/regras-funcionais.md);
      - S4.2: 100% CONCLUÍDA E HOMOLOGADA (Motor de Conclusão determinístico e Tela Etapa 6);
      - S4.3: 100% CONCLUÍDA E HOMOLOGADA (Relatório executivo e visualização impressa em #/relatorio);
      - S4.4: 100% CONCLUÍDA E HOMOLOGADA (Indicadores executivos e rastreamento local);
      - S4.5: 100% CONCLUÍDA E HOMOLOGADA (157 testes unitários em 20 suítes, 0 falhas, build PWA 100% íntegro);
      - **Apresentação e Homologação:** MVP demonstrativo apresentado e validado com nota 10;
      - **Marco de Congelamento:** Tag imutável `v0.1.0-mvp-demo` (commit `74225d1`).

## Definição de Pronto do MVP Demonstrativo (100% Concluída)

- [x] Documentos e decisões preservados; pendências materiais resolvidas ou explicitamente limitadas.
- [x] Seis etapas funcionam de ponta a ponta com dados sintéticos.
- [x] Quatro elementos essenciais destacados (RN01).
- [x] Pertinência e condicionantes tratadas explicitamente (RN02/RN03/RN13).
- [x] Quatro classificações de achados e quatro conclusões representadas (RN04/RN08).
- [x] Sugestões e conclusões dependem de validação humana; mudanças relevantes exigem revisão (RN10).
- [x] Documento responde às cinco perguntas (RN09) e permite impressão/PDF.
- [x] KPIs explicáveis, baseline estimado e medições de demonstração identificadas.
- [x] Perfis e registros locais apresentados como simulação.
- [x] Persistência e offline testados; ausência de sincronização/backup explicada.
- [x] Testes relevantes passam (157 aprovados, 0 falhas); publicação funciona no subcaminho correto.
- [x] Nenhum dado real ou segredo publicado.
- [x] README, roteiro de demonstração e transparência sobre IA completos.

---

## Nova Fase: Sprint 5 — Ingestão Inteligente + Trilha de Auditoria Humano × IA × Sistema

Documento diretor arquitetural: 👉 [docs/ROADMAP_AUDITORIA_HUMANO_IA.md](file:///c:/Users/cleyt/OneDrive/Documentos/Projetos/conforma-gsasp-retomada/docs/ROADMAP_AUDITORIA_HUMANO_IA.md)
Guia de retomada e ambiente: 👉 [docs/RETOMADA.md](file:///c:/Users/cleyt/OneDrive/Documentos/Projetos/conforma-gsasp-retomada/docs/RETOMADA.md)
Branch ativa de desenvolvimento: `s5-ingestao-auditoria`
Commit-base: `74225d1`
Baseline de testes: 157 testes unitários aprovados, 20 suítes, 0 falhas

### Objetivo Geral da Sprint 5
Construir o pipeline de ingestão assistida por IA para minutas e peças documentais em PDF, viabilizando a extração de dados com evidenciação rigorosa por campo e estabelecendo uma trilha de auditoria tripartite que segrega com clareza institucional as ações do **HUMANO**, da **IA** e do **SISTEMA**.

### Primeira Entrega Estrita da Sprint 5
$$\text{Upload de Minuta/PDF} \longrightarrow \text{Extração da Identificação} \longrightarrow \text{Evidência por Campo} \longrightarrow \text{Confirmar / Editar / Rejeitar} \longrightarrow \text{Persistência após Validação Humana}$$

- **Upload de minuta/PDF:** Entrada de documento não estruturado em formato PDF.
- **Extração da Identificação:** Extração assistida dos campos da Etapa 1 (Objeto, Tipo/Origem, Valor, Vigência, Número, Contratado e CNPJ).
- **Evidência por campo:** Citação da página e do trecho textual exato do documento original que serviu de substrato à extração.
- **Ações humanas explícitas:** Botões individuais por campo para `Confirmar`, `Editar` (com justificativa) ou `Rejeitar`.
- **Persistência condicionada:** Nenhuma informação produzida pela IA entra no estado de negócio da análise sem a validação humana/técnica expressa, observadas as competências do usuário e da autoridade competente.

### Princípios Obrigatórios de Governança
1. **A IA extrai, classifica e sugere:** Desempenha função exclusivamente instrumental de apoio operacional. Não valida, não conclui e não delibera.
2. **O Humano confirma, corrige, rejeita e complementa:** O operador realiza a validação humana/técnica, observadas as competências do usuário e da autoridade competente.
3. **O Sistema aplica regras determinísticas (RN/DEC/MOT):** O motor algorítmico executa regras normativas e lógicas estritas, livres de inferência generativa.
4. **Vedação de confusão:** Nenhum desses três atores pode ser confundido na trilha de auditoria, na interface ou nos relatórios executivos.

### Atores Formais da Trilha de Auditoria
- `HUMANO`: Operador autenticado/simulado atuando no processo.
- `IA`: Pipeline probabilístico de extração e OCR.
- `SISTEMA`: Motor de regras lógicas, validadores e barramento de dados.

### Metadados Mínimos Mandatórios de Toda Execução de IA
Toda execução futura de IA deverá registrar e preservar, no mínimo:
- `prompt_id`
- `prompt_version`
- `ai_run_id`
- `gatilho/automação`
- `modelo/provedor`
- `documentos/fontes` (com identificador de integridade/hash, sendo SHA-256 diretriz técnica candidata)
- `página/trecho/evidência`
- `saída produzida` (saída bruta ou referência segura à saída, conforme política de retenção e segurança)
- `campos sugeridos` (grau de confiança registrado somente quando o modelo ou pipeline fornecer métrica tecnicamente válida, vedada a inferência de percentual artificial)
- `timestamp` (carimbo de tempo padronizado, sendo ISO 8601 UTC diretriz técnica candidata)
- `intervenção humana posterior` (IDs dos eventos humanos vinculados)

### Rastreabilidade de Alterações Humanas sobre Sugestões da IA
Qualquer intervenção do operador humano modificando ou rejeitando sugestão da IA deverá registrar:
- `valor anterior` (sugerido pela IA);
- `valor posterior` (adotado pelo humano);
- `usuário` (identificação e papel ativo);
- `data/hora` (timestamp ISO);
- `justificativa quando aplicável` (obrigatória em divergências materiais e rejeições).

### Segregação e Blindagem de Regras Determinísticas do SISTEMA
Regras normativas e determinísticas — tais como **RN10** (invalidação superveniente da conclusão homologada por fato novo), **RN08** (cascata de precedência P1 a P5), **DEC-01 a DEC-10** e códigos **MOT-*** — **devem ser auditadas estritamente como ações do SISTEMA, nunca atribuídas à IA**. O motor do software computa lógica booleana prescrita em norma.

### Requisitos Arquiteturais para Uso Institucional Futuro
Para viabilizar futura adoção corporativa:
- **Trilha append-only:** Base de auditoria com objetivo de ser estritamente aditiva (vedadas instruções de `UPDATE` ou `DELETE`).
- **Eventos não apagados nem sobrescritos:** Garantia de imutabilidade histórica física e lógica.
- **Retificação por novo evento:** Alterações exigem novo evento de retificação vinculado ao ID do evento antecedente.
- **Autenticação:** Identificação de operadores e credenciais de serviços.
- **Integridade:** Mecanismos de integridade (sendo hashing encadeado diretriz técnica candidata).
- **Controle de acesso:** Controle de acesso e permissões (sendo RBAC diretriz técnica candidata, não arquitetura definitivamente escolhida nesta fase).
- **Retenção:** Prazos de guarda e ciclo de vida documental conforme normas e políticas aplicáveis.
- **Exportação para auditoria:** Exportação estruturada para auditoria, controle interno/externo e demais necessidades institucionais, conforme governança futura (sendo JSON e PDF formatos tratados como diretrizes técnicas candidatas).

> [!WARNING]
> **Ressalva Institucional de Armazenamento:**
> A versão atual baseada em **IndexedDB continua sendo estritamente demonstrativa e didática**, sem garantias criptográficas ou equivalência a sistemas corporativos de processo eletrônico (SIGADOC/SEI).

### Tabela de Tarefas da Sprint 5

| ID | Tarefa e Arquivos Principais | Tecnologia | Critério de Aceite / Pronto Quando |
|---|---|---|---|
| **S5.1** | **Upload de Minuta/PDF e Extração da Identificação (Primeira Entrega):** Componente de upload seguro de PDF; extração assistida dos campos essenciais da Identificação (RN01: Objeto, Tipo, Valor, Vigência, Número, Contratado, CNPJ); visualizador de evidência com página e trecho textual; ações por campo de Confirmar, Editar e Rejeitar; persistência no rascunho condicionada à validação humana/técnica, observadas as competências do usuário e da autoridade competente. | TS / PDF Parser / HTML / CSS | Upload funcional com arquivo PDF de exemplo; campos extraídos destacados com indicação de página e trecho; botões Confirmar/Editar/Rejeitar operacionais; nenhum dado persiste sem validação do operador humano; rascunho de negócio isolado de saídas brutas de IA. |
| **S5.2** | **Trilha de Auditoria Tripartite e Metadados de IA:** Expansão de `src/domain/tipos.ts` e `src/services/auditoria.ts` para suportar os três atores (`HUMANO`, `IA`, `SISTEMA`); estrutura de metadados de IA contendo obrigatoriamente os 11 atributos (`prompt_id`, `prompt_version`, `ai_run_id`, `gatilho/automação`, `modelo/provedor`, `documentos/fontes`, `página/trecho/evidência`, `saída produzida`, `campos sugeridos`, `timestamp`, `intervenção humana posterior`), com saída bruta ou referência segura conforme política de retenção e grau de confiança registrado apenas quando tecnicamente válido. | TS / Tipagem Estrita | Tipos discriminam formalmente eventos de HUMANO, IA e SISTEMA; evento de IA registra os 11 metadados mandatórios completos; serialização e deserialização preservam integridade sem perdas; testes unitários dedicados aprovados. |
| **S5.3** | **Diffs Auditáveis e Rastreabilidade de Intervenções Humanas:** Registro detalhado de intervenções humanas sobre sugestões da IA com `valor anterior`, `valor posterior`, `usuário`, `data/hora` e `justificativa`; renderização de diff visual na tela de auditoria; exigência de justificativa mínima em alterações materiais. | TS / Interface / Auditoria | Toda edição humana de dado de IA gera evento com antes/depois, identificação do operador e justificativa; bloqueio de salvamento se justificativa obrigatória estiver vazia; modal de auditoria exibe visualmente o diff. |
| **S5.4** | **Segregação e Blindagem de Regras Determinísticas do SISTEMA:** Auditoria explícita dos disparos do motor de regras (RN10, RN08, DEC-01 a DEC-10, MOT-*) como eventos exclusivos do ator `SISTEMA`; garantia de que nenhuma regra lógica seja rotulada como inferência de IA. | TS / Motor de Domínio | Eventos de disparo de RN10, RN08, DEC e MOT contêm obrigatoriamente `ator: 'SISTEMA'`; testes automatizados verificam que nenhum evento determinístico é atribuído ao ator 'IA'. |
| **S5.5** | **Arquitetura de Auditoria Institucional, Imutabilidade e Exportação:** Modelagem append-only na camada de serviço; retificação por novo evento com vínculo de ID; visualizador com filtros por ator (`HUMANO`, `IA`, `SISTEMA`); exportação estruturada do dossiê probatório em formatos abertos (JSON como diretriz candidata); aviso ostensivo de governança sobre o IndexedDB demonstrativo. | TS / Serviços / Exportação | Interface não disponibiliza ações de exclusão ou edição de eventos de auditoria; retificações geram novo evento encadeado; exportação estruturada operacional; banner de persistência didática mantido. |
| **S5.6** | **Suíte de Testes Automatizados e Homologação da Sprint 5:** Cobertura de testes unitários para os novos fluxos de ingestão, auditoria tripartite e rastreabilidade humana; garantia de não regressão dos 157 testes unitários consolidados no MVP. | Vitest / TypeScript | 100% dos 157 testes preexistentes continuam aprovados; novos testes unitários cobrem o pipeline de ingestão e auditoria; compilação `npm run build` passa com 0 erros. |

### Definição de Pronto da Sprint 5
- [ ] Upload de minuta em PDF funcional com extração assistida de Identificação (RN01).
- [ ] Evidência literal (página e trecho) exibida individualmente por campo.
- [ ] Intervenção humana por campo (Confirmar / Editar / Rejeitar) obrigatória antes de qualquer persistência no rascunho de negócio.
- [ ] Trilha de auditoria tripartite registra distintamente os atores `HUMANO`, `IA` e `SISTEMA`.
- [ ] 11 metadados mínimos de IA preservados em todas as rodadas de extração (com saída bruta ou referência segura e confiança apenas se tecnicamente válida).
- [ ] Alterações humanas sobre dados de IA preservam valor anterior, valor posterior, operador, data/hora e justificativa.
- [ ] Regras determinísticas (RN10, RN08, DEC, MOT) registradas exclusivamente como eventos do `SISTEMA`.
- [ ] Trilha de eventos opera sob lógica append-only e retificação por novo evento.
- [ ] Aviso sobre armazenamento IndexedDB estritamente demonstrativo preservado.
- [ ] Todos os 157 testes anteriores passam sem regressão e novos testes de ingestão/auditoria são aprovados.
- [ ] Build de produção aprovado com 0 erros.
