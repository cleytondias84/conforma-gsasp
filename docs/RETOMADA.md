# CONFORMA GSASP — Guia de Retomada do Projeto

Documento de transição e estado do projeto para continuidade em outro computador ou sessão.  
Data do último registro: 24/09/2026.  
**Branch de trabalho atual:** `pausa-s1-6`

---

## 1. Status Geral do Projeto
- **Fase atual:** Sprint 1 — Fundação, arquitetura e PWA.
- **Tarefas concluídas e homologadas:**
  - `S0.2`: Diagnóstico e verificação de ambiente (Node, npm, Python, Git).
  - `S1.1`: Fundação e arquitetura inicial (Vite, TypeScript, CSS puro, `.gitignore`).
  - `S1.2`: Modelagem dos dados em `src/domain/tipos.ts` (entidades, 4 conclusões, validação humana, campos opcionais).
  - `S1.3`: Navegação client-side por hash, 6 etapas, stepper, acessibilidade, aviso de dados fictícios e 4 elementos essenciais na Identificação.
  - `S1.4`: Geração de 5 cenários fictícios determinísticos em `public/data/` e suíte de testes com 12 testes no `pytest` (`scripts/test_gerar_dados.py`).
  - `S1.5`: Configuração de base (`/conforma-gsasp/`), documentação (`README.md`), automação CI/CD (`.github/workflows/deploy.yml`) e publicação no GitHub Pages (`https://cleytondias84.github.io/conforma-gsasp/`).
- **Tarefa iniciada na S1.6 e status atual (NÃO CONCLUÍDA):**
  - **O que foi implementado tecnicamente:**
    - Plugin `vite-plugin-pwa` configurado em `vite.config.ts` com Workbox e geração automática de Service Worker (`sw.js`).
    - Manifesto Web (`manifest.webmanifest`) com tema `#0f172a`, idioma `pt-BR`, escopo `/conforma-gsasp/`, `start_url: '/conforma-gsasp/#/'` e modo `standalone`.
    - Script determinístico `scripts/gerar_icones.py` e geração de todos os ícones em `public/`: `favicon.svg`, `pwa-192x192.png`, `pwa-512x512.png`, maskables e `apple-touch-icon.png`.
    - Precache configurado para 31 ativos essenciais (HTML, CSS, JS, ícones e todos os arquivos JSON de dados sintéticos em `/data/*.json`).
    - Metatags de PWA integradas em `index.html`.
    - Step de geração de ícones adicionado em `.github/workflows/deploy.yml`.
    - Compilação (`npm run build`) e testes unitários (`pytest`) testados com 100% de sucesso localmente.
  - **O que ainda está pendente na S1.6:**
    - Teste manual de instalação do PWA em navegador compatível (Chrome/Edge/dispositivo móvel).
    - Teste manual de funcionamento offline (simulação de corte de rede via DevTools ou desconexão física, recarregamento com `F5` e navegação pelas 6 rotas por hash).
    - **A tarefa S1.6 NÃO está concluída** e não deve ser dada como pronta sem a validação humana desses dois testes.
- **Repositório oficial:** [https://github.com/cleytondias84/conforma-gsasp](https://github.com/cleytondias84/conforma-gsasp)
- **Branch do ponto de parada:** `pausa-s1-6` (as alterações da S1.6 estão isoladas nesta branch para não publicar código pendente na `main`).
- **Site publicado atualmente (baseado na main):** [https://cleytondias84.github.io/conforma-gsasp/](https://cleytondias84.github.io/conforma-gsasp/)
- **Sprint 2:** Mantida pendente, sem inicialização.

---

## 2. Próximo Passo Exato ao Retomar

Ao abrir o projeto no novo computador:

1. **Garantir que está na branch `pausa-s1-6`:**
   ```powershell
   git checkout pausa-s1-6
   ```
2. **Executar o build e o servidor de pré-visualização de produção:**
   ```powershell
   npm.cmd run build
   npm.cmd run preview
   ```
   *(O Service Worker só é ativado no build de produção servido via HTTP/HTTPS, por isso deve ser usado `preview` e não apenas `dev`).*
3. **Executar os dois testes manuais da S1.6:**
   - **Teste 1 (Instalação):** Abrir o endereço `http://localhost:4173/conforma-gsasp/` no Google Chrome ou Edge. Verificar se o ícone de instalação aparece na barra de endereços (ou no menu do navegador) e clicar em "Instalar CONFORMA". Verificar se abre em janela de aplicativo standalone.
   - **Teste 2 (Modo Offline):** Abrir as Ferramentas do Desenvolvedor (`F12`), ir na aba **Rede** (Network), mudar a velocidade para **Offline**. Pressionar `F5` e verificar se a página recarrega normalmente sem erro de falta de internet. Clicar em "Começar Demonstração" e navegar pelas seis etapas (`#/identificacao`, `#/pertinencia`, `#/conformidade`, `#/achados`, `#/riscos`, `#/resultado`).
4. **Após validação do usuário:**
   - Registrar no `docs/sprint.md` e `docs/RETOMADA.md` a aprovação manual dos testes da S1.6.
   - Mesclar a branch `pausa-s1-6` na `main` e enviar para o GitHub (`git checkout main`, `git merge pausa-s1-6`, `git push origin main`).
   - Somente após esses passos, iniciar a **Sprint 2**.

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

---

## 5. Pendências e Decisões Mapeadas para as Próximas Sprints

1. **Homologação manual da S1.6:** Instalação e teste offline.
2. **Sprint 2 (Formulário e Persistência Local):**
   - Matriz de papéis de usuários (Administrador, Analista, Revisor, Autoridade, Leitor).
   - Validações de obrigatoriedade e não aplicabilidade de campos contratuais.
   - Armazenamento local no navegador com IndexedDB e retomada offline.
3. **Sprints 3 e 4 (Motor de Regras, Riscos e Documento Final):**
   - Metodologia de cálculo de riscos e tabela de decisão para sugestões de conclusão.
   - Geração de documento de conformidade para impressão/PDF.



