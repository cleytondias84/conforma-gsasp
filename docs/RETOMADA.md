# CONFORMA GSASP — Guia de Retomada do Projeto

Documento de transição e estado do projeto para continuidade em outro computador ou sessão.  
Data do último registro: 24/09/2026.  
**Branch de trabalho atual:** `main` (após integração da branch `pausa-s1-6`)

---

## 1. Status Geral do Projeto
- **Fase atual:** Sprint 1 — Fundação, arquitetura e PWA (100% CONCLUÍDA E HOMOLOGADA).
- **Tarefas concluídas e homologadas:**
  - `S0.2`: Diagnóstico e verificação de ambiente (Node, npm, Python, Git).
  - `S1.1`: Fundação e arquitetura inicial (Vite, TypeScript, CSS puro, `.gitignore`).
  - `S1.2`: Modelagem dos dados em `src/domain/tipos.ts` (entidades, 4 conclusões, validação humana, campos opcionais).
  - `S1.3`: Navegação client-side por hash, 6 etapas, stepper, acessibilidade, aviso de dados fictícios e 4 elementos essenciais na Identificação.
  - `S1.4`: Geração de 5 cenários fictícios determinísticos em `public/data/` e suíte de testes com 12 testes no `pytest` (`scripts/test_gerar_dados.py`).
  - `S1.5`: Configuração de base (`/conforma-gsasp/`), documentação (`README.md`), automação CI/CD (`.github/workflows/deploy.yml`) e publicação no GitHub Pages (`https://cleytondias84.github.io/conforma-gsasp/`).
  - `S1.6`: Instalação e cache PWA (100% implementada e homologada).
    - **Implementação técnica:** Plugin `vite-plugin-pwa` configurado em `vite.config.ts` com Workbox e Service Worker automático (`sw.js`); manifesto Web (`manifest.webmanifest`) com tema `#0f172a`, idioma `pt-BR`, escopo `/conforma-gsasp/`, `start_url: '/conforma-gsasp/#/'` e modo `standalone`; ícones completos gerados via `scripts/gerar_icones.py` em `public/`; precache de 31 ativos essenciais (HTML, CSS, JS, ícones e dados sintéticos em `/data/*.json`).
    - **Testes manuais homologados pelo usuário:**
      1. *Instalação do PWA:* Aprovada no Chrome/Edge em modo standalone.
      2. *Modo Offline:* Aprovada com corte de rede via DevTools, recarregamento da página e navegação pelas seis etapas (`#/identificacao`, `#/pertinencia`, `#/conformidade`, `#/achados`, `#/riscos`, `#/resultado`).
      3. *Verificação de Console:* Confirmado console limpo durante o teste em janela anônima.
    - **Registro sobre mensagens no console:** As mensagens anteriormente observadas (`Uncaught (in promise) {}` e `Language detection is not supported for this page`) não foram reproduzidas no teste sem extensões (tanto via automação em perfil temporário limpo quanto em janela anônima pelo usuário). Registra-se que os erros anteriores não foram reproduzidos no teste sem extensões, sem afirmar que toda a aplicação está livre de erros e sem atribuir conclusivamente as duas mensagens à Monica.
- **Repositório oficial:** [https://github.com/cleytondias84/conforma-gsasp](https://github.com/cleytondias84/conforma-gsasp)
- **Site publicado:** [https://cleytondias84.github.io/conforma-gsasp/](https://cleytondias84.github.io/conforma-gsasp/)
- **Sprint 2:** Mantida pendente, sem inicialização.

---

## 2. Próximo Passo Exato ao Retomar

1. **Sprint 2 (Formulário de conformidade e persistência local):**
   - Iniciar pela tarefa `S2.1`: Formulário em `src/pages/identificacao.ts` e validações em `src/domain`.
   - Implementar os campos do formulário conforme especificação de `docs/contexto.md` (tratamento de datas, valores e aplicabilidade).
2. **Conferência da publicação:**
   - A conferência da nova versão da S1.6 publicada no GitHub Pages será realizada pelo usuário.

---

## 3. Comandos para Preparar e Executar em Outro Computador

### Passo a passo no novo computador:

#### 1. Clonar o repositório e acessar a branch da pausa
```powershell
git clone https://github.com/cleytondias84/conforma-gsasp.git
cd conforma-gsasp
git checkout pausa-s1-6
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



