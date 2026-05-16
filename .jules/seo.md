# Contexto e Estratégia de SEO: PyExplorer

## 1. Visão Geral do Projeto
* **Nome do Projeto:** PyExplorer
* **Status Atual:** O site já possui excelente ranqueamento no Google para a palavra-chave exata da marca ("Pyexplorer"), aparecendo em primeiro lugar.
* **SEO Técnico:** A base técnica está consolidada. As *meta tags* estão configuradas, as marcações *Schema.org* (EducationalApplication e Course) estão aplicadas, e as rotas principais (`/`, `/about`, `/learn`) utilizam pré-renderização estática via Vite (`vite-plugin-prerender`). O `sitemap.xml` é gerado automaticamente.
* **Objetivo Principal:** Expandir o ranqueamento orgânico para termos de busca amplos (cauda longa e média), deixando de depender apenas da pesquisa pelo nome da marca.

## 2. Palavras-Chave Alvo (Termos Genéricos)
O conteúdo e as páginas devem ser otimizados para capturar buscas relacionadas a aprendizado de programação, com foco no público infantojuvenil e iniciantes:
* aprender python
* python para crianças
* estudar python
* jogo de python

## 3. Plano de Ação Estratégico
Como o SEO técnico (on-page) já está bem estruturado, a estratégia agora muda para **Marketing de Conteúdo, Arquitetura de Informação e Autoridade Off-Page**.

### A. Marketing de Conteúdo e Intenção de Busca
* **Ação:** Utilizar a rota pré-renderizada `/learn` como um hub de conteúdo (blog ou central de artigos).
* **Tática:** Criar artigos de cauda longa com títulos que respondam diretamente às dúvidas dos usuários no Google (ex: "Como ensinar Python para crianças de 8 a 15 anos" ou "5 jogos para estudar Python").
* **Linkagem Interna:** Inserir links dentro desses artigos apontando de volta para o jogo (`/`) com textos âncora descritivos (ex: "comece a aprender python jogando").

### B. Criação de Landing Pages Específicas
* **Ação:** Descentralizar o tráfego da página inicial criando páginas de destino dedicadas a clusters específicos de palavras-chave.
* **Tática:** Desenvolver rotas como `/python-para-criancas` ou `/aprender-python-jogando`.
* **Requisito Técnico:** Sempre adicionar as novas rotas criadas ao array do `prerender` no `vite.config.ts` para garantir a indexação correta pelo Googlebot.

### C. Autoridade Off-Page (Link Building)
* **Ação:** Melhorar a autoridade do domínio (DA) adquirindo *backlinks* de qualidade.
* **Tática:** * Entrar em contato com blogs de educação, portais de tecnologia e escolas para inclusão da ferramenta (que é gratuita) em listas e artigos.
    * Publicar artigos técnicos ou estudos de caso sobre a criação do PyExplorer em plataformas como Dev.to, TabNews e Medium, direcionando links para o domínio oficial.

### D. Monitoramento e Indexação
* **Ação:** Utilização contínua do Google Search Console (GSC).
* **Tática:** Garantir o envio atualizado do `sitemap.xml` e monitorar a aba de "Desempenho" para identificar impressões de novas palavras-chave genéricas, ajustando o conteúdo conforme as oportunidades aparecerem.

---

## 4. Diretrizes de Comportamento para a IA
* Atue como um Especialista em SEO e Estrategista de Conteúdo.
* Ao sugerir novos conteúdos ou textos para o site, foque na densidade e semântica das "Palavras-Chave Alvo".
* Lembre-se sempre de que o PyExplorer é construído em um ambiente de Single Page Application (SPA), portanto, toda estratégia de conteúdo deve levar em consideração as necessidades de pré-renderização (Prerendering) para garantir que os rastreadores leiam o HTML estático.