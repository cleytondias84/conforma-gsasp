# CONFORMA GSASP — Guia de Retomada do Projeto

Documento de transição e estado do projeto para continuidade em outro computador ou sessão.  
Data do último registro: 24/09/2026.  
**Branch de trabalho atual:** `pausa-s2-4` (com o progresso integral das tarefas S1.1 a S2.4)  
**Caminho local da pasta do projeto:**  
`C:\Users\cleyt\OneDrive\Documentos\Projetos\conforma-gsasp-retomada`

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
    - Implementado em `src/services/armazenamento.ts`, `src/services/armazenamento.test.ts`, `src/router.ts`, `src/pages/conformidade.ts`, `src/pages/pertinencia.ts`, `src/pages/identificacao.ts` e `src/style.css`.
    - Repositório local assíncrono baseado em `IndexedDB` com fallback automático e transparente para `localStorage` e memória volátil.
    - Preservação integral dos dados preenchidos nas três etapas ativas: Identificação (`Processo`), Pertinência (`Pertinencia`) e Conformidade (`ItemConformidade[]` e `Condicionante[]`), incluindo personalizações criadas pelo usuário e condicionantes com preenchimento parcial/incompleto.
    - **Ajuste e validação de regressão:** Resolvida a captura de digitação via evento `input` em tempo real e sincronização do DOM antes do salvamento (`sincronizarEstadoDaTelaAtiva()`). Teste da condicionante incompleta realizado e aprovado pelo usuário em 24/09/2026.
    - 22 testes unitários aprovados via `npm test` e compilação de produção aprovada via `npm.cmd run build` com 0 erros.
  - `S2.5` (Papéis de Usuário e Permissões Simuladas): 100% HOMOLOGADA.
    - Implementado em `src/auth/papeis.ts`, `src/auth/papeis.test.ts`, `src/router.ts`, `src/pages/identificacao.ts`, `src/pages/pertinencia.ts`, `src/pages/conformidade.ts` e `src/style.css`.
    - Matriz com 4 papéis documentados em `docs/contexto.md`: `Administrador`, `Editor / Assessor`, `Leitor (Somente Consulta)` e `Aprovador / Validador Executivo`.
    - Indicação explícita e visual de que os perfis são simulações didáticas sem autenticação institucional nem aprovação legal.
    - Perfil `Leitor` bloqueia todas as alterações (edição de campos, carga de cenários, adição/exclusão de itens e salvamento de rascunhos), mantendo navegação e consulta livres pelas 6 etapas.
    - Preservação total de dados e rascunhos ao alternar de perfil, com blindagem de extração de dados para que campos desabilitados não sobrescrevam dados em memória.
    - 4 testes manuais homologados pelo usuário em 25/09/2026 (Assessor edita/salva; Leitor bloqueado para alterações; Leitor navega pelas 6 etapas; volta para Assessor sem perda e com persistência após F5).
  - `S2.6` (Revisão do Cache do PWA e Retomada Offline): 100% HOMOLOGADA.
    - Implementado em `vite.config.ts`, `dist/sw.js`, `src/auth/papeis.ts`, `src/services/armazenamento.ts`, `src/services/armazenamento.test.ts`, `src/router.ts` e `src/style.css`.
    - Precache Workbox de 31 ativos (`index.html`, bundle JS/CSS, manifest, ícones e arquivos `data/*.json`), garantindo carregamento de todas as telas sem internet após a primeira visita.
    - Retomada offline garantida de rascunho salvo no IndexedDB (Identificação, Pertinência, Checklist e Condicionantes).
    - Preservação de perfis simulados reforçada com persistência em `localStorage` e `sessionStorage`.
    - Alerta transparente de armazenamento local sem sincronização remota mantido na barra executiva.
    - Diagnóstico de armazenamento em tempo real com aviso obrigatório destacado (`.storage-memory-alert`) caso opere apenas em memória volátil.
    - Indicador de conectividade em tempo real (`.connection-pill`: `🌐 Online` vs `📡 Modo Offline (Cache Local Ativo)`).
    - 30 testes unitários aprovados via `npm test` e compilação `npm.cmd run build` com 0 erros.
    - 6 testes manuais homologados pelo usuário em 25/09/2026: salvamento de rascunho completo online; detecção de desconexão pelo indicador; recarregamento F5 offline com recuperação integral dos dados; navegação pelas 6 etapas offline como Leitor; perfil Leitor e dados preservados após F5 offline; restauração da conexão com retorno ao perfil Editor/Assessor.

---

## 2. Próximo Passo Exato

1. **Sprint 3 — Iniciar Tarefa S3.1 (Motor de Regras, Achados e Riscos):**
   - Catalogar as regras aprovadas em `docs/regras-funcionais.md`, vinculadas a `contexto.md`.
   - Mapear para cada regra: condição, dados necessários, saída esperada e fonte/motivo legal ou regulamentar demonstrativo.
   - Destacar lacunas de dados e garantir que regras não presumam conclusões ou pesos inventados sem validação humana.
   - Manter alterações isoladas localmente; não mesclar nem publicar na branch `main` nesta fase.

2. **Comandos para Retomar o Servidor Local na Pasta Ativa:**
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



