# CONFORMA GSASP — Sistema de Conformidade e Apoio à Decisão

> **Aviso Importante:** Este software é um **protótipo didático** em fase de desenvolvimento para demonstração de conceitos de conformidade documental e apoio à decisão na Secretaria Adjunta de Segurança Pública (GSASP/SESP-MT). Todos os dados, processos, números, nomes de empresas e valores contidos neste repositório são **100% fictícios**. Não há utilização de dados pessoais reais, documentos sigilosos ou pareceres institucionais reais.

- **Demonstração Online (GitHub Pages):** [https://cleytondias84.github.io/conforma-gsasp/](https://cleytondias84.github.io/conforma-gsasp/)
- **Repositório do Código:** [https://github.com/cleytondias84/conforma-gsasp](https://github.com/cleytondias84/conforma-gsasp)

---

## 1. Finalidade do Projeto

O **CONFORMA GSASP** visa estruturar, padronizar e acelerar a etapa de revisão final de conformidade de processos e instrumentos jurídicos submetidos à apreciação e assinatura da autoridade decisora.

O sistema atua como uma camada de apoio analítico, organizando a conferência em **seis etapas sequenciais**:
1. **Identificação:** Registro dos dados do processo com destaque visual aos 4 elementos essenciais (**Objeto**, **Tipo/Origem**, **Valor** e **Vigência**).
2. **Pertinência Institucional:** Filtro prévio avaliando competência, necessidade, planejamento, custo/proporcionalidade e economicidade.
3. **Conformidade:** Checklist documental, verificação do parecer jurídico e atendimento de condicionantes.
4. **Achados:** Apontamento estruturado de não conformidades ligando *Evidência → Regra/Motivo → Impacto → Providência → Responsável*.
5. **Riscos:** Avaliação multidimensional explicável (jurídica, financeira, operacional e controle).
6. **Resultado:** Minuta executiva respondendo às 5 perguntas essenciais para a tomada de decisão da autoridade.

---

## 2. Tecnologias Utilizadas

- **Frontend:** [Vite](https://vite.dev/) com [TypeScript](https://www.typescriptlang.org/) e CSS puro (arquitetura leve sem frameworks pesados).
- **Roteamento:** Roteamento client-side baseado em hash (`#/etapa`), garantindo recarregamento seguro em subdiretórios de hospedagem estática.
- **Dados Sintéticos e Testes Unitários:** Python 3.13 com [pytest](https://docs.pytest.org/), garantindo geração determinística e validação de tipos de dados.
- **CI/CD e Hospedagem:** GitHub Actions para testes e compilação automatizados, com publicação estática no [GitHub Pages](https://pages.github.com/).

---

## 3. Estrutura do Projeto

```text
conforma-gsasp/
├── .github/workflows/    # Pipeline de CI/CD para GitHub Pages
├── docs/                 # Documentação de contexto, sprint e guia de retomada
│   ├── contexto.md       # Regras funcionais, modelo de dados e diretrizes
│   ├── sprint.md         # Plano de execução técnica
│   └── RETOMADA.md       # Histórico de entregas e estado do ambiente
├── public/               # Ativos estáticos e dados públicos
│   └── data/             # Arquivos JSON com os cenários sintéticos determinísticos
├── scripts/              # Scripts utilitários e testes em Python
│   ├── gerar_dados.py    # Gerador dos 5 cenários fictícios
│   └── test_gerar_dados.py # Suíte de 12 testes unitários dos dados sintéticos
├── src/                  # Código-fonte da aplicação web
│   ├── domain/           # Modelagem de tipos TypeScript (tipos.ts)
│   ├── main.ts           # Ponto de entrada da aplicação
│   ├── router.ts         # Roteador por hash e casca navegável das etapas
│   └── style.css         # Sistema visual, layout responsivo e acessibilidade
├── index.html            # Ponto de entrada HTML
├── package.json          # Dependências do ecossistema Node/TypeScript
├── tsconfig.json         # Configuração estrita do compilador TypeScript
└── vite.config.ts        # Configuração da base de publicação ('/conforma-gsasp/')
```

---

## 4. Instruções de Execução Local

### Pré-requisitos
- **Node.js** (v20 ou superior recomendado; testado na v22) e **npm**.
- **Python** (versão 3.11, 3.12 ou 3.13 estável).

### Executando o Frontend

```bash
# 1. Instalar as dependências do Node.js
npm.cmd install

# 2. Iniciar o servidor de desenvolvimento
npm.cmd run dev
# Acesse o endereço indicado no terminal (ex: http://localhost:5173/conforma-gsasp/)

# 3. Compilar para produção e checar tipos
npm.cmd run build

# 4. Pré-visualizar o build localmente
npm.cmd run preview
```

### Executando os Testes e Gerador Python

```bash
# 1. Criar e preparar o ambiente virtual
python -m venv .venv
.\.venv\Scripts\pip.exe install -r requirements.txt

# 2. Gerar os dados sintéticos em public/data/
.\.venv\Scripts\python.exe scripts/gerar_dados.py

# 3. Executar a suíte de testes unitários com pytest
.\.venv\Scripts\pytest.exe -v
```

---

## 5. Cenários Sintéticos Disponíveis

A pasta `public/data/` contém 5 cenários determinísticos projetados para validação:
- **Cenário 1 (Regular):** Aquisição regular de TI via pregão com checklist completo e condicionante atendida.
- **Cenário 2 (Regular com Ressalva):** Termo aditivo de dilatação de prazo contratual de serviços continuados sem acréscimo de valor (`valorNaoAplicavel: true`) e recomendação formal.
- **Cenário 3 (Com Pendências):** Contratação de limpeza com garantia de execução pendente e certidão vencida.
- **Cenário 4 (Com Pendências):** Adesão a ata de registro de preços com pertinência institucional `NAO_DEMONSTRADA` e ausência de reserva orçamentária atestada.
- **Cenário 5 (Inconsistência Grave):** Processo com datas de vigência cronologicamente invertidas (`vigenciaFim < vigenciaInicio`), pertinência `NAO_PERTINENTE` e parecer jurídico contrário.

---

## 6. Estado Atual e Limitações (Sprint 1)

Nesta entrega da **Sprint 1 (Fundação, arquitetura e PWA)**:
- **Implementado:** Roteador client-side por hash com as 6 etapas navegáveis, destaque visual dos 4 elementos essenciais, selos de dados fictícios, acessibilidade por teclado (`Tab`), modelo de dados TypeScript consolidado e 5 cenários sintéticos gerados e testados via Python.
- **Limitações atuais (Não implementadas nesta etapa):**
  - Os formulários interativos de edição e a persistência local (IndexedDB) serão implementados na **Sprint 2**.
  - O motor de regras automatizado e a metodologia de cálculo de risco serão implementados na **Sprint 3**.
  - A geração da saída executiva imprimível/PDF e indicadores locais serão implementados na **Sprint 4**.
  - Não há conexão com banco de dados corporativo, SIGADOC ou backend próprio.
  - Não há extração automática de documentos por IA em tempo de execução nem autenticação institucional de usuários.
