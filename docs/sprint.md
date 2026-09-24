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
