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
- **Sprint 2 — Formulário de conformidade e persistência local (S2.1, S2.2, S2.3 e S2.4 homologadas):**
  - `S2.1` (Identificação do Instrumento): 100% homologada.
  - `S2.2` (Pertinência Institucional): 100% homologada.
  - `S2.3` (Conformidade Documental e Condicionantes): 100% homologada.
  - `S2.4` (Persistência Local com IndexedDB): 100% homologada.
    - Implementado em `src/services/armazenamento.ts`, `src/services/armazenamento.test.ts`, `src/router.ts`, `src/pages/conformidade.ts`, `src/pages/pertinencia.ts`, `src/pages/identificacao.ts` e `src/style.css`.
    - Repositório local assíncrono baseado em `IndexedDB` com fallback automático e transparente para `localStorage` e memória volátil.
    - Preservação integral dos dados preenchidos nas três etapas ativas: Identificação (`Processo`), Pertinência (`Pertinencia`) e Conformidade (`ItemConformidade[]` e `Condicionante[]`), incluindo personalizações criadas pelo usuário e condicionantes com preenchimento parcial/incompleto.
    - **Ajuste e validação de regressão:** Resolvida a captura de digitação via evento `input` em tempo real e sincronização do DOM antes do salvamento (`sincronizarEstadoDaTelaAtiva()`). Teste da condicionante incompleta realizado e aprovado pelo usuário em 24/09/2026.
    - 22 testes unitários aprovados via `npm test` e compilação de produção aprovada via `npm.cmd run build` com 0 erros.

---

## 2. Próximo Passo Exato

1. **Sprint 2 — Iniciar Tarefa S2.5:**
   - Implementar `src/auth/papeis.ts` e o seletor de perfil no cabeçalho/interface.
   - Perfis demonstrativos e controle de permissões simuladas:
     - Administrador / Assessor / Validador / Leitor.
     - Indicação visível de simulação; perfil Leitor não altera dados.
   - Não publicar alterações na branch `main` sem validação prévia.

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



