# CONFORMA GSASP — Guia de Retomada do Projeto

Documento de transição e estado do projeto para continuidade em outro computador ou sessão.  
Data do último registro: 24/09/2026.

---

## 1. Status Geral do Projeto
- **Fase atual:** Sprint 1 — Fundação, arquitetura e PWA.
- **Progresso:** Tarefas S0.2, S1.1, S1.2, S1.3, S1.4 e **S1.5 concluídas com sucesso**. Repositório conectado e publicação no GitHub Pages ativa.
- **Repositório oficial:** [https://github.com/cleytondias84/conforma-gsasp](https://github.com/cleytondias84/conforma-gsasp)
- **Site publicado:** [https://cleytondias84.github.io/conforma-gsasp/](https://cleytondias84.github.io/conforma-gsasp/)
- **Status de verificação:** Abertura do site publicado no navegador confirmada pelo usuário; a navegação completa de ponta a ponta na versão publicada permanece a ser realizada.
- **Próxima tarefa:** **S1.6** (Instalação e cache inicial; configuração PWA e ícones em public) — mantida pendente conforme o `sprint.md`, sem inicialização.

---

## 2. Histórico de Entregas (Resultados Comprovados)

### Preparação e Sprint 0
- **Ajuste de documentação:** Nomes dos arquivos padronizados para `docs/contexto.md` e `docs/sprint.md` (removida duplicidade `.md.md`). Conteúdo 100% preservado.
- **Tarefa S0.2 (Ambiente):** Verificação de ferramentas concluída.
  - Node.js: `v22.11.0`
  - npm: `10.9.0` (executável via `npm.cmd` no PowerShell)
  - Python: `3.13.0` (64-bit estável em `C:\Program Files\Python313\python.exe`)
  - Git: `git version 2.51.0.windows.1`

### S1.1 — Fundação e Arquitetura Inicial
- Estrutura base criada com **Vite + TypeScript + CSS puro** (sem framework adicional pesado).
- Arquivos criados e configurados:
  - `.gitignore` (proteção de `node_modules`, `dist`, `.venv`, `.env` e segredos).
  - `package.json` (dependências: `typescript ^5.7.3`, `vite ^6.2.0`).
  - `tsconfig.json` (configuração estrita do compilador TypeScript).
  - `index.html` (ponto de entrada HTML).
  - `src/style.css` e `src/main.ts`.
- Compilação testada com sucesso via `npm run build` (código de saída 0).

### S1.2 — Modelagem dos Dados
- Arquivo criado: [`src/domain/tipos.ts`](../src/domain/tipos.ts).
- Modelagem completa das entidades:
  - `Processo`, `Analise`, `Pertinencia`, `ItemConformidade`, `Condicionante`, `Achado`, `Risco`, `Resultado`, `EventoLocal`.
- Requisitos funcionais cumpridos:
  - Andamento da edição (`estadoEdicao`: `rascunho`, `em_analise`, `concluida`) separado da conclusão técnica.
  - Quatro conclusões previstas pela RN08 modeladas: `APTO_PARA_ASSINATURA`, `APTO_PARA_ASSINATURA_COM_RESSALVA_NAO_IMPEDITIVA`, `RETORNAR_PARA_SANEAMENTO_ANTES_DA_ASSINATURA`, `NAO_RECOMENDAVEL_PARA_ASSINATURA`.
  - Validação humana de achados explicitada: `SUGESTAO_SISTEMA`, `VALIDADO`, `REJEITADO`.
  - Campos não avaliados ou opcionais explicitados (aceitando `null` ou flags de não aplicabilidade).
- Compilação validada com sucesso via `npm run build`.

### S1.3 — Navegação e Estrutura Visual
- Arquivos criados/atualizados: [`src/router.ts`](../src/router.ts), [`src/style.css`](../src/style.css), [`src/main.ts`](../src/main.ts).
- Roteamento client-side por hash implementado:
  - Início: `#/`
  - 1. Identificação: `#/identificacao`
  - 2. Pertinência: `#/pertinencia`
  - 3. Conformidade: `#/conformidade`
  - 4. Achados: `#/achados`
  - 5. Riscos: `#/riscos`
  - 6. Resultado: `#/resultado`
- Recursos de usabilidade e acessibilidade:
  - Stepper no topo com indicador da etapa atual (`aria-current="step"`).
  - Botões "← Anterior" e "Próximo →" respeitando limites (retorno ao início na etapa 1 e conclusão da demonstração na etapa 6).
  - Na tela de Identificação, destaque visual dos **4 elementos essenciais**: Objeto, Tipo/Origem, Valor e Vigência.
  - Suporte a foco visível por teclado (`:focus-visible`) e layout responsivo.
  - Selo visível em todas as telas: *"Protótipo didático — somente dados fictícios"*.
- **Testes manuais realizados e confirmados pelo usuário:**
  1. Fluxo sequencial de avançar e recuar entre todas as etapas.
  2. Visualização dos 4 destaques na Identificação.
  3. Recarregamento de página com `F5` mantendo a rota da hash sem quebrar.
  4. Navegação acessível via teclado usando a tecla `Tab`.
- Compilação validada com sucesso via `npm run build`.

### S1.4 — Geração de Dados Sintéticos e Testes
- **Ambiente virtual local:** Configurado `.venv` local com Python 3.13.0 estável.
- **Dependências de teste:** `pytest==9.1.1` instalado isoladamente e registrado em [`requirements.txt`](../requirements.txt).
- **Scripts desenvolvidos:**
  - [`scripts/gerar_dados.py`](../scripts/gerar_dados.py): Gerador 100% determinístico com 5 cenários fictícios estruturados estritamente conforme [`src/domain/tipos.ts`](../src/domain/tipos.ts).
  - [`scripts/test_gerar_dados.py`](../scripts/test_gerar_dados.py): Suíte de testes unitários com 12 testes no `pytest`.
- **Arquivos gerados em `public/data/` (7 arquivos JSON):**
  - `cenarios.json` (consolidação com metadados e entidades).
  - `processos.json` (índice leve dos processos para listagem).
  - `cenario_01_regular_aquisicao.json` (Regular 1).
  - `cenario_02_regular_aditivo.json` (Regular 2).
  - `cenario_03_pendencia_condicionante.json` (Pendência 1).
  - `cenario_04_pendencia_pertinencia.json` (Pendência 2).
  - `cenario_05_grave_vigencia_invalida.json` (Inconsistência Grave).
- **Garantias funcionais e de integridade comprovadas:**
  - 2 regulares, 2 com pendências, 1 com inconsistência grave.
  - Dados estritamente determinísticos e repetíveis.
  - Identificadores únicos para processos, análises, checklist, condicionantes e achados.
  - Referências cruzadas válidas (`processoId` e `achadosRelacionados`).
  - Sem dados pessoais reais (zero CPFs, nomes explicitamente marcados como fictícios).
  - Sem falsa validação humana: `conclusaoValidada=null`, `validacaoHumana=null`, achados em `SUGESTAO_SISTEMA`.
  - Inconsistências intencionais documentadas e validadas por asserções específicas.
- **Validação de testes:** 12 testes no `pytest` executados com 100% de aprovação.
- Compilação da aplicação frontend mantida intacta (`npm run build` com saída 0).

### S1.5 — Configuração de Base, Documentação e Publicação (Concluída)
- **Base configurada:** [`vite.config.ts`](../vite.config.ts) criado com `base: '/conforma-gsasp/'`.
- **Endereço local:** Servidor local responde sob o prefixo `http://localhost:5173/conforma-gsasp/`.
- **Repositório remoto conectado:** [https://github.com/cleytondias84/conforma-gsasp](https://github.com/cleytondias84/conforma-gsasp) (branch `main`).
- **Site publicado no GitHub Pages:** [https://cleytondias84.github.io/conforma-gsasp/](https://cleytondias84.github.io/conforma-gsasp/)
- **Status de homologação da publicação:** Abertura do site no navegador confirmada com sucesso pelo usuário. A validação da navegação completa de ponta a ponta na versão publicada permanece a ser realizada.
- **Compatibilidade de caminhos e rotas por hash:**
  - As rotas por hash (`#/identificacao`, `#/pertinencia`, etc.) permanecem totalmente compatíveis e operacionais.
  - No build de produção (`dist/index.html`), os links dos módulos e folhas de estilo receberam automaticamente o prefixo `/conforma-gsasp/assets/`.
- **Documentação do projeto:** [`README.md`](../README.md) criado na raiz com finalidade institucional, links diretos do site e repositório, ferramentas, instruções de execução, catálogo dos 5 cenários e limitações claras da Sprint 1.
- **Workflow de automação:** [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) ativo no GitHub Actions (Python 3.13, testes pytest, build Vite e deploy Pages).
- **Git configurado:** Autor configurado localmente (`Cleyton Dias <cleyton.dias.adv@gmail.com>`), primeiro commit realizado e branch `main` sincronizada com o GitHub.

---

## 3. Diagnóstico e Configuração do Ambiente Atual
- **Python:** `Python 3.13.0` (64-bit estável em `C:\Program Files\Python313\python.exe`).
- **Ambiente Virtual:** `.venv` criado localmente na raiz do projeto.
- **Testes Python:** `pytest 9.1.1` disponível via `.\.venv\Scripts\pytest.exe`.
- **Node.js e npm:** `v22.11.0` e `10.9.0` (via `npm.cmd` no PowerShell).
- **Git:** `git version 2.51.0.windows.1` (repositório local inicializado, branch `main`, conectado ao GitHub).

---

## 4. Próximos Passos ao Retomar

### A) Passo Imediato: S1.6 — Configuração PWA (Instalação e Cache Offline)
- Configurar `vite-plugin-pwa`, manifest e cache para navegação offline após o primeiro carregamento.
- Testar a instalação e suporte offline em navegador compatível.

### B) Homologação da Navegação Publicada
- Executar teste navegacional completo pelas 6 etapas diretamente na URL do GitHub Pages (`https://cleytondias84.github.io/conforma-gsasp/`).

---

## 5. Comandos do Projeto

```bash
# 1. Frontend: Instalar dependências e rodar localmente
npm.cmd install
npm.cmd run dev
# Endereço: http://localhost:5173/conforma-gsasp/

# 2. Frontend: Compilação de produção e checagem de tipos
npm.cmd run build

# 3. Python: Gerar os dados sintéticos em public/data
.\.venv\Scripts\python.exe scripts/gerar_dados.py

# 4. Python: Executar a suíte de testes unitários
.\.venv\Scripts\pytest.exe -v scripts/test_gerar_dados.py
```

---

## 6. Pendências e Decisões Mapeadas

1. **Nome do repositório no GitHub:** Confirmado como `conforma-gsasp` e configurado no `vite.config.ts`.
2. **Decisões funcionais para as próximas Sprints (já catalogadas em `docs/contexto.md`):**
   - Matriz definitiva de papéis de usuários (Sprint 2).
   - Regras de obrigatoriedade e não aplicabilidade de campos contratuais (Sprint 2).
   - Metodologia de cálculo de riscos e tabela de decisão para sugestões de conclusão (Sprints 3 e 4).


