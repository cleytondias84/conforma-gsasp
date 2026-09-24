# CONFORMA GSASP — Contexto do projeto

Versão inicial para desenvolvimento assistido. Base: contexto funcional e sprint fornecidos pelo usuário em 24/09/2026. Este documento descreve um protótipo didático, não um sistema institucional em produção. Nenhuma tarefa está presumida como implementada.

## 1. Visão geral

CONFORMA GSASP — Sistema de Conformidade e Apoio à Decisão do GSASP/SESP-MT.

Padronizar e acelerar a revisão final de processos submetidos à decisão e assinatura do Secretário Adjunto de Segurança Pública. A conferência atual é predominantemente manual, distribuída entre documentos, normas, pareceres e experiência do assessor, com risco de omissões e retrabalho.

O protótipo é uma camada de conformidade e apoio à decisão. Não substitui SIGADOC, PGE, áreas técnicas, o assessor ou a autoridade. Prioriza objeto, tipo/origem, valor e vigência.

## 2. Objetivos e indicadores

| Indicador | Baseline inicial estimado | Meta | Medição proposta para validação no piloto |
|---|---|---|---|
| Tempo médio de análise | 30 minutos/processo | Até 10 minutos/processo | Soma do tempo ativo de análises concluídas dividida pelo número dessas análises |
| Taxa de retrabalho após primeira análise | 30% | Até 10% | Processos com retrabalho após primeira análise divididos pelos processos com primeira análise concluída, vezes 100 |

Os valores não são oficiais: exibir sempre “Baseline inicial estimado — sujeito à validação no piloto”. As duas metas representam redução aproximada de 66,7%, arredondada para 67%; não afirmar redução mínima comprovada de 67%.

Definir antes da implementação: início/fim e pausas do tempo ativo, período de observação e o que caracteriza retrabalho. Com denominador zero, mostrar “Sem dados”, nunca 0% como resultado medido. Dados demonstrativos e resultados calculados com uso do protótipo devem estar identificados separadamente. Não criar evidência de ganho institucional a partir de simulações.

## 3. Usuários e papéis

Usuário principal: assessor do GSASP. Autoridade decisora: Secretário Adjunto. Impactados: unidades técnicas, administrativas, orçamentárias, jurídicas e contratuais.

Matriz inicial proposta para confirmação:

| Papel | Uso proposto | Limite |
|---|---|---|
| Administrador | Configurações da demonstração e dados fictícios | Não recebe automaticamente competência decisória |
| Editor/Assessor | Preencher, revisar evidências, validar achados e conclusão técnica | Não assina pela autoridade |
| Leitor | Consultar análise demonstrativa | Não altera nem valida |
| Aprovador | Consultar resultado executivo e simular encaminhamento | Sem assinatura eletrônica ou aprovação institucional real |

O seletor “Ver como” simula papéis. Não é autenticação nem proteção efetiva de dados. A matriz definitiva é A DEFINIR pelo responsável funcional.

## 4. Fluxo e telas

As-Is: conferência manual → consulta a documentos/fontes → identificação de pendências → elaboração manual da conclusão → possíveis novas conferências.

To-Be:
1. Identificação: assessor registra processo/instrumento; objeto, tipo/origem, valor e vigência em destaque.
2. Pertinência Institucional: filtro prévio obrigatório; avaliar competência/necessidade, vínculo, benefício, planejamento, custo/proporcionalidade e economicidade; registrar conclusão e providência.
3. Conformidade: checklist, parecer jurídico e condicionantes; registrar fonte, situação e observação.
4. Achados: sistema sugere ou assessor registra; assessor confirma evidência, motivo, impacto, providência e classificação.
5. Riscos: assessor avalia dimensões e fundamenta o nível; automação só conforme metodologia validada.
6. Resultado: conclusão indicativa, revisão humana, documento executivo padronizado e encaminhamento demonstrativo.

Telas: início/painel, identificação, pertinência, conformidade, achados, riscos e resultado/impressão. Poucos cliques, navegação por etapas, hierarquia clara e aparência institucional, moderna, limpa e executiva.

## 5. Modelo inicial de dados

Tipos e obrigatoriedade abaixo são especificação inicial de trabalho; validar as lacunas antes de codificar regras materiais.

| Entidade | Campos principais | Observações |
|---|---|---|
| Processo | id, numero, instrumento, contratado, cnpj, objeto, tipoOrigem, valor, vigenciaInicio, vigenciaFim, regimeJuridico | Identificadores e nomes exclusivamente fictícios; definir casos de valor/vigência não aplicáveis |
| Analise | id, processoId, estadoEdicao, pertinencia, checklist, achados, riscos, conclusaoIndicativa, conclusaoValidada, validacaoHumana, datas | Separar andamento da edição da conclusão técnica |
| Pertinencia | respostas, evidencias, justificativa, conclusao, providencia | PERTINENTE; PERTINENTE_COM_JUSTIFICATIVA; NAO_DEMONSTRADA; NAO_PERTINENTE |
| ItemConformidade | id, descricao, status, observacao, referenciaFonte | ok; pendente; nao_aplicavel; confirmar; justificar não aplicabilidade |
| Condicionante | id, descricao, referenciaParecer, situacao, evidenciaAtendimento, providencia, responsavel | Tratamento explícito de condicionantes, sem presumir atendimento |
| Achado | id, titulo, evidencia, regraOuMotivo, impacto, providencia, responsavel, classificacao, estadoValidacao | Registrar sugestão, validação ou rejeição justificada |
| Risco | dimensao, nivel, justificativa, achadosRelacionados | Dimensões jurídica, financeira, operacional e controle; níveis baixo, moderado, alto, crítico |
| Resultado | mensagemInterna, conclusaoExecutiva, quadroSintese, pontosSemObice, providencias, retornoGabinete, novaAnaliseJuridica, justificativas | Responder às cinco perguntas finais |
| EventoLocal | id, dataHora, usuarioFicticio, papel, acao, entidade, registroId, antesDepois | Registro demonstrativo; não é trilha inviolável |

Andamento sugerido: rascunho, em análise, concluída. A conclusão deve ser campo separado e contemplar TODAS as quatro possibilidades da seção 6.

Checklist inicial proposto no sprint: parecer jurídico, condicionantes, dotação, empenho, garantia, gestor, fiscal, representação, termo de referência (TR), edital, proposta, ata de registro de preços (ARP) e versão do instrumento. A aplicabilidade depende do caso; a lista não afirma obrigação jurídica universal.

## 6. Regras funcionais

- RN01: destacar objeto, tipo/origem, valor e vigência desde o início.
- RN02: avaliar pertinência antes da conclusão; legalidade ou disponibilidade financeira, isoladamente, não demonstram pertinência.
- RN03: cada achado contém evidência → regra/motivo → impacto → providência. Fonte não informada deve aparecer como pendência, nunca ser inventada.
- RN04: classificações: IMPEDITIVO, RELEVANTE, FORMAL e MELHORIA; classificação final humana.
- RN05: todo achado automático aparece como “SUGESTÃO DO SISTEMA — PENDENTE DE VALIDAÇÃO HUMANA”.
- RN06: após confirmação explícita, mostrar “ACHADO VALIDADO”; permitir rejeição com justificativa e registro local.
- RN07: conclusão indicativa deve ser distinguida da conclusão validada pelo assessor e da decisão da autoridade.
- RN08: conclusões: APTO PARA ASSINATURA; APTO PARA ASSINATURA COM RESSALVA NÃO IMPEDITIVA; RETORNAR PARA SANEAMENTO ANTES DA ASSINATURA; NÃO RECOMENDÁVEL PARA ASSINATURA.
- RN09: responder: Pode assinar? O que corrigir? Quem corrige? Retorna ao Gabinete? Exige nova análise jurídica?
- RN10: alterações em evidências, achados ou dados relevantes após validação exigem nova revisão da conclusão; nunca manter silenciosamente resultado validado desatualizado. Salvaguarda técnica proposta.
- RN11: dados incompletos ou regras ainda não definidas não autorizam aptidão automática. Mostrar pendência de análise/validação.
- RN12: a matriz de risco e o mapeamento de achados para conclusões dependem de critérios aprovados. Não inventar pesos ou limites normativos.
- RN13: problemas de preenchimento (ex.: data inválida) devem gerar validação de formulário; não equivalem automaticamente a impedimento jurídico definitivo.

## 7. Saída executiva

Documento imprimível contendo identificação, pertinência, quadro-síntese, achados, matriz de riscos, pontos sem óbice, providências/responsáveis, conclusão executiva e resultado. Incluir mensagem interna ao setor quando pertinente, retorno ao Gabinete e necessidade de nova análise jurídica com justificativas humanas.

Exportação inicial: HTML preparado para impressão e opção de salvar em PDF pelo navegador. Rascunhos devem estar claramente identificados. Resultado validado não constitui assinatura eletrônica.

## 8. Humano e IA

“A IA confere e organiza; o assessor valida e decide.” Conferir fonte, raciocínio e decisão/providência antes de aceitar sugestões.

Visão futura: extração e organização de informações, inconsistências aparentes, sugestões de achados/riscos/providências e minutas, sempre com revisão humana.

Neste MVP estático, a IA auxilia o DESENVOLVIMENTO. O aplicativo usará regras programadas e modelos de texto; não há integração com modelo de IA ou extração automática de documentos. Não anunciar os alertas determinísticos como análise jurídica por IA. Não incluir chaves de API.

## 9. Arquitetura e dados

O sprint técnico detalha a escolha inicialmente descrita como HTML/CSS/JavaScript: Vite + TypeScript, HTML/CSS responsivos; JavaScript gerado/configurações; vite-plugin-pwa; Vitest; Python para geração/validação de dados sintéticos com pytest; GitHub Pages e GitHub Actions.

Python não executa no GitHub Pages. Dados sintéticos em public/data/*.json; IndexedDB para persistência local. Fallback para localStorage somente com aviso e teste; se indisponível, comunicar ausência de persistência, sem informar salvamento falso.

Rotas por hash (#/etapa). Configurar base conforme nome real do repositório e caminhos com import.meta.env.BASE_URL. Não presumir que o nome do repositório já foi escolhido; sugestão: conforma-gsasp.

PWA: instalação conforme suporte do navegador, cache, abertura offline após primeiro carregamento online e atualização controlada. Persistência local não sincroniza computadores, não é backup e pode ser apagada pelo usuário/navegador.

Somente informações inteiramente fictícias. Não importar processos reais, documentos internos, dados pessoais reais ou segredos. Evitar CPF, que não é necessário ao fluxo definido. Usar identificadores visivelmente fictícios. Se houver mascaramento demonstrativo, aplicar antes de gerar o JSON público, não só na tela. Máscaras não tornam dados reais automaticamente seguros para publicação. Testes de formato não comprovam que um dado não pertence a pessoa real.

## 10. Fora do escopo

SIGADOC; autenticação institucional; banco corporativo; assinatura eletrônica; extração automática de documentos; API/servidor; IA em execução; trilha de auditoria real; histórico institucional multiusuário; indicadores gerenciais corporativos; sistema completo de gestão contratual. Manter apenas histórico e indicadores locais demonstrativos necessários ao MVP.

## 11. Pendências funcionais

1. Confirmar a matriz de permissões por papel.
2. Definir quando contratado, CNPJ, valor e vigência são aplicáveis; não bloquear todo instrumento de valor zero sem decisão funcional.
3. Definir checklist por tipo de instrumento, fontes e condicionantes; não gerar fundamentação normativa fictícia.
4. Aprovar regras de risco e de sugestão das quatro conclusões, incluindo situações com pertinência não demonstrada.
5. Definir os eventos e denominadores dos indicadores.
6. Confirmar nome do repositório, responsáveis e datas das sprints.

Prosseguir com estrutura e telas enquanto esses pontos são decididos; não resolver ambiguidades materiais silenciosamente. Trabalhar uma tarefa de sprint.md por vez.
