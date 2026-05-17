# 🔍 Auditoria Completa de SEO — PyExplorer

> **Objetivo:** Transformar o PyExplorer na autoridade brasileira em "ensino de Python para crianças" e ocupar as primeiras posições do Google para todas as keywords relevantes do nicho.

---

## 📊 Diagnóstico Atual

### ✅ O que já está BEM feito
| Item | Status | Arquivo |
|------|--------|---------|
| `<html lang="pt-BR">` | ✅ | `index.html` |
| Meta tags básicas (title, description, robots) | ✅ | `index.html` |
| Open Graph + Twitter Cards | ✅ | `index.html` + `SEO.tsx` |
| Schema.org `WebApplication` + `Course` | ✅ | `index.html` |
| Google Site Verification (2 tokens) | ✅ | `index.html` |
| `robots.txt` com Sitemap | ✅ | `public/robots.txt` |
| `sitemap.xml` estático | ✅ | `public/sitemap.xml` |
| URL canônica por página | ✅ | `SEO.tsx` |
| `hrefLang` pt-BR + x-default | ✅ | `SEO.tsx` |
| Prerender de rotas de conteúdo (Puppeteer) | ✅ | `vite.config.ts` |
| PWA completo (manifest, icons, screenshots) | ✅ | `vite.config.ts` |
| Brotli + Gzip compression | ✅ | `vite.config.ts` |
| Componente `<SEO>` reutilizável com JSON-LD | ✅ | `SEO.tsx` |
| Artigos educacionais ricos (/learn/*) | ✅ | `learnData.ts` |
| Preconnect para fonts e CDN | ✅ | `index.html` |
| Blocking de crawlers de IA (GPTBot, CCBot, etc.) | ✅ | `robots.txt` |

### ❌ Problemas Críticos Encontrados

| # | Problema | Impacto | Prioridade |
|---|----------|---------|------------|
| 1 | Sitemap estático com `lastmod` desatualizado (2026-02-02) | Google ignora sitemaps com datas falsas | 🔴 CRÍTICO |
| 2 | Sitemap inclui `/profile` e `/certificate` (bloqueadas no robots.txt) | Conflito de sinais → confusão do crawler | 🔴 CRÍTICO |
| 3 | Sem Schema.org `FAQPage` nas páginas de artigo | Perde espaço de rich snippets no SERP | 🟡 ALTO |
| 4 | Sem Schema.org `BreadcrumbList` | Perde breadcrumbs visuais no Google | 🟡 ALTO |
| 5 | `og:image` usa caminho relativo no `SEO.tsx` (default `/og-image.jpg`) | WhatsApp/Facebook não resolvem a imagem | 🟡 ALTO |
| 6 | Sem página 404 customizada com SEO | Perde oportunidade de recaptura e sinaliza baixa qualidade | 🟡 ALTO |
| 7 | Artigos sem `dateModified` no JSON-LD | Google prefere conteúdo "fresco" | 🟡 MÉDIO |
| 8 | Sem link `rel="manifest"` no `index.html` | PWA não é detectado pelo Google | 🟡 MÉDIO |
| 9 | Nenhuma página usa a prop `structuredData` do SEO (exceto ArticlePage) | Desperdício do recurso implementado | 🟡 MÉDIO |
| 10 | Footer não tem markup semântico `<nav>` | Perda de sinais de navegação interna | 🟢 BAIXO |

---

## 🎯 Fase 1 — Correções Críticas (Semana 1)

### 1.1 Consertar o Sitemap

**Problema:** O `sitemap.xml` é estático e está com `lastmod: 2026-02-02` em TODAS as URLs. Datas falsas fazem o Google ignorar completamente o campo `lastmod`, prejudicando o crawl budget.

**Ação:**
- [ ] Remover `/profile` e `/certificate` do sitemap (estão bloqueadas no `robots.txt` — conflito)
- [ ] Remover `/rewards` do sitemap (é uma rota protegida/logada)
- [ ] Atualizar os `lastmod` para refletir datas reais de modificação
- [ ] Considerar gerar o sitemap automaticamente no build via script

```xml
<!-- Exemplo corrigido -->
<url>
  <loc>https://pyexplorer.com.br</loc>
  <lastmod>2026-05-16</lastmod>
  <changefreq>weekly</changefreq>
  <priority>1.0</priority>
</url>
```

**Dica pro:** Adicionar `<image:image>` tags para as páginas que têm OG images, ajudando no Google Images.

### 1.2 Corrigir OG Image para URLs Absolutas

**Problema:** O default do `og:image` é `/og-image.jpg` (relativo). Facebook, WhatsApp e LinkedIn exigem URLs absolutas.

**Arquivo:** `src/components/common/SEO.tsx`

**Ação:**
- [ ] Mudar o default de `ogImage` para usar a URL absoluta:
```tsx
ogImage = `${env.APP_URL}/og-image.jpg`
```

### 1.3 Alinhar Sitemap ↔ Robots.txt

**Arquivo:** `public/robots.txt`

**Ação:**
- [ ] Adicionar `Disallow: /rewards` e `Disallow: /game` no robots.txt (conteúdo dinâmico logado)
- [ ] Manter o `/login` e `/register` no sitemap (são landing pages indexáveis)

---

## 🎯 Fase 2 — Dados Estruturados Avançados (Semana 2)

### 2.1 BreadcrumbList Schema em Todas as Páginas

**Impacto:** O Google exibe breadcrumbs visuais no SERP, o que aumenta CTR em ~20%.

**Arquivo:** `src/pages/ArticlePage.tsx` (já tem breadcrumb visual — falta o JSON-LD)

**Ação:**
- [ ] Adicionar schema `BreadcrumbList` em `ArticlePage.tsx`:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://pyexplorer.com.br" },
    { "@type": "ListItem", "position": 2, "name": "Aprender", "item": "https://pyexplorer.com.br/learn" },
    { "@type": "ListItem", "position": 3, "name": "O que é Python?" }
  ]
}
```

### 2.2 FAQPage Schema nos Artigos Educacionais

**Impacto:** Rich snippet de FAQ ocupa 3-5x mais espaço no SERP, roubando cliques dos concorrentes.

**Ação:**
- [ ] Adicionar seção FAQ ao final de cada artigo em `learnData.ts`
- [ ] Gerar schema `FAQPage` automaticamente a partir dos dados
- [ ] Exemplo para "O que é Python?":
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Python é difícil de aprender?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Não! Python é considerada a linguagem mais fácil de aprender..."
      }
    }
  ]
}
```

### 2.3 SoftwareApplication Schema na HomePage

**Arquivo:** `src/pages/HomePage.tsx`

**Ação:**
- [ ] Passar `structuredData` via prop do `<SEO>`:
```tsx
<SEO
  title="Aprenda Python Jogando"
  structuredData={{
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "PyExplorer",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "BRL" },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "150"
    }
  }}
/>
```

> ⚠️ Só inclua `aggregateRating` se tiver reviews reais. Caso contrário, use apenas `SoftwareApplication` sem rating.

### 2.4 EducationalOrganization na AboutPage

**Arquivo:** `src/pages/AboutPage.tsx`

**Ação:**
- [ ] Adicionar schema Organization:
```tsx
<SEO
  title="Sobre o PyExplorer"
  structuredData={{
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "PyExplorer",
    "url": "https://pyexplorer.com.br",
    "logo": "https://pyexplorer.com.br/icons/icon-512x512.png",
    "description": "Plataforma educacional gratuita...",
    "sameAs": ["https://github.com/albertoivo/PyExplorer"]
  }}
/>
```

---

## 🎯 Fase 3 — Estratégia de Conteúdo (Semanas 3-4)

### 3.1 Expandir o Hub de Artigos `/learn`

O PyExplorer tem hoje **6 artigos**. Para ser autoridade, precisa de pelo menos **20-30 artigos** cobrindo o _topic cluster_ inteiro.

**Artigos prioritários para criar (por volume de busca estimado):**

| Título Sugerido | Keyword Alvo | Volume Estimado |
|----------------|-------------|-----------------|
| "Python Online: Execute Código no Navegador" | python online | Alto |
| "Exercícios de Python para Iniciantes (com Respostas)" | exercícios python | Muito Alto |
| "Como Instalar Python no Windows, Mac e Linux" | instalar python | Muito Alto |
| "O que é Lógica de Programação? Guia para Crianças" | lógica de programação | Alto |
| "Python vs Scratch: Qual o Melhor para Crianças?" | python vs scratch | Médio |
| "10 Projetos Fáceis em Python para Iniciantes" | projetos python iniciantes | Alto |
| "O que é Programação? Explicado para Crianças" | o que é programação | Alto |
| "Como Aprender a Programar do Zero em 2026" | aprender a programar | Muito Alto |
| "Variáveis em Python: Guia Completo" | variáveis python | Alto |
| "If e Else em Python: Como Tomar Decisões" | if else python | Alto |
| "For e While em Python: Loops Explicados" | for while python | Alto |
| "Funções em Python: Guia para Iniciantes" | funções python | Alto |
| "Listas em Python: Tutorial Completo" | listas python | Alto |
| "Strings em Python: Manipulando Textos" | strings python | Médio |
| "Dicionários em Python: O que São e Como Usar" | dicionários python | Médio |

### 3.2 Estrutura de Topic Cluster

```
                    ┌─────────────────────┐
                    │   PILLAR PAGE        │
                    │   /learn             │
                    │   "Aprenda Python"   │
                    └─────────┬───────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
   ┌──────┴──────┐    ┌──────┴──────┐    ┌──────┴──────┐
   │ Iniciante   │    │ Para Pais   │    │ Referência  │
   │ /learn/...  │    │ /learn/...  │    │ /learn/...  │
   └─────────────┘    └─────────────┘    └─────────────┘
   - O que é Python    - Guia para Pais   - Variáveis
   - Primeiros Passos  - Como Ensinar     - If/Else
   - Exercícios        - Idade Ideal      - Loops
   - Projetos                             - Funções
```

### 3.3 Internal Linking Strategy

**Problema atual:** Os artigos têm poucos links internos entre si.

**Ação:**
- [ ] Todo artigo deve ter pelo menos **3 links internos** para outros artigos
- [ ] Todo artigo deve terminar com CTA para `/game` (já existe ✅)
- [ ] A HomePage deve linkar para os artigos mais importantes (já existe parcialmente ✅)
- [ ] Adicionar "Artigos Relacionados" com 3-4 cards no final (já existe ✅, mas limitado por categoria)
- [ ] Cross-linkar entre categorias (ex: artigo "para pais" linka para artigo "iniciante")

---

## 🎯 Fase 4 — SEO Técnico Avançado (Semana 4-5)

### 4.1 Prerender — Expandir Rotas

**Arquivo:** `vite.config.ts`

**Problema:** O prerender cobre 9 rotas, mas falta cobrir landing pages SEO.

**Ação:**
- [ ] Adicionar `/login` e `/register` ao prerender (são indexáveis e aparecem no SERP)
- [ ] Para cada novo artigo criado, adicionar ao array de rotas do prerender

### 4.2 Criar Página 404 Customizada

**Impacto:** Usuários que chegam por links quebrados são perdidos. Uma 404 bem feita recupera até 30% deles.

**Ação:**
- [ ] Criar `NotFoundPage.tsx` com:
  - H1: "Ops! Página não encontrada 🐍"
  - Links para `/`, `/learn`, `/game`
  - Componente `<SEO title="Página não encontrada" />`
  - `<meta name="robots" content="noindex" />`
- [ ] Adicionar `<Route path="*" element={<NotFoundPage />} />` no `App.tsx`

### 4.3 Landing Pages de Cauda Longa (SEO Pages)

**Ação:** Criar landing pages específicas para keywords de alto volume:

| Rota | Keyword Alvo |
|------|-------------|
| `/python-para-criancas` | "python para crianças" |
| `/aprender-python-jogando` | "aprender python jogando" |
| `/curso-python-gratis` | "curso python grátis" |
| `/exercicios-python` | "exercícios python" |

> **Nota:** As rotas `/python-para-criancas` e `/aprender-python-jogando` já estão no prerender (`vite.config.ts` L27-28) mas **não existem como componentes no Router!** Isso gera 404 em produção. Precisa criar os componentes ou redirecionar.

### 4.4 Manifest Link no HTML

**Problema:** Não há `<link rel="manifest">` no `index.html`. O Vite PWA plugin injeta automaticamente, mas é boa prática ter como fallback.

**Verificação:**
- [ ] Confirmar se o build final contém `<link rel="manifest" href="/manifest.webmanifest">` no HTML gerado

### 4.5 Performance (Core Web Vitals)

O Google usa CWV como fator de ranking. Itens para verificar:

- [ ] **LCP (Largest Contentful Paint):** O hero section carrega rápido? O `loading-screen` pode atrasar o LCP real
- [ ] **CLS (Cumulative Layout Shift):** Fontes do Google Fonts causam FOUT? Já tem `display=swap` ✅
- [ ] **FID/INP:** O Pyodide (WASM) bloqueia a thread principal? O lazy loading está OK ✅
- [ ] Considerar usar `<link rel="preload">` para a OG image se ela estiver acima do fold
- [ ] Auditar com Lighthouse e PageSpeed Insights periodicamente

---

## 🎯 Fase 5 — Autoridade e Link Building (Contínuo)

### 5.1 GitHub Profile README

- [ ] Adicionar badge de "PyExplorer" no perfil do GitHub com link para o site
- [ ] Criar um `README.md` robusto no repositório com screenshots e link `pyexplorer.com.br`

### 5.2 Backlinks Estratégicos

- [ ] Submeter o PyExplorer em diretórios de ferramentas educacionais:
  - Product Hunt
  - AlternativeTo
  - Awesome Python (lista no GitHub)
  - Awesome Educational Games
- [ ] Escrever guest posts em blogs de educação/tecnologia brasileiros
- [ ] Contatar professores de programação para reviews

### 5.3 Google Search Console

- [ ] Submeter o sitemap atualizado no GSC
- [ ] Monitorar cobertura de índice (páginas indexadas vs excluídas)
- [ ] Monitorar Core Web Vitals
- [ ] Verificar se as rotas pré-renderizadas estão sendo indexadas corretamente
- [ ] Solicitar indexação manual das páginas mais importantes

### 5.4 Social Proof

- [ ] Adicionar contadores reais (alunos cadastrados, questões resolvidas) na HomePage
- [ ] Implementar depoimentos de pais/alunos (com schema `Review`)
- [ ] Compartilhar certificados gera backlinks orgânicos (Web Share API ✅ já implementada)

---

## 🎯 Fase 6 — SEO Semântico e HTML (Quick Wins)

### 6.1 Footer com `<nav>` Semântico

**Arquivo:** `src/components/layout/Footer.tsx`

**Ação:**
- [ ] Envolver os grupos de links em `<nav aria-label="Links do rodapé">`

### 6.2 Melhorar Descrições por Página

Algumas páginas usam descriptions genéricas demais:

| Página | Descrição Atual | Sugestão |
|--------|----------------|----------|
| GamePage | "Explore mundos, resolva desafios em Python e ganhe recompensas." | "Resolva +100 desafios interativos de Python no navegador. 11 mundos, boss battles e sistema de estrelas. 100% grátis!" |
| GamificationPage | "Conquistas, missões diárias, loja de avatares e ranking do PyExplorer!" | OK ✅ |
| LearnPage | "Tutoriais de Python para crianças e iniciantes. Guias passo a passo e dicas para pais." | "Aprenda Python do zero com tutoriais gratuitos em português. Guias para crianças, iniciantes e pais." |

### 6.3 Keywords nos Artigos

**Arquivo:** `src/data/learnData.ts`

Os artigos já têm `keywords[]` mas **não são usados em nenhum lugar**!

**Ação:**
- [ ] Passar `keywords` para o componente `<SEO>` via prop (ex: `<meta name="keywords" content="...">`)
- [ ] Ou melhor: usar as keywords para gerar `meta description` mais relevante por artigo

### 6.4 Tempo de Leitura e Data de Publicação

**Ação:**
- [ ] Adicionar campo `updatedAt` nos artigos de `learnData.ts`
- [ ] Usar `dateModified` no JSON-LD do `ArticlePage.tsx`
- [ ] Google prioriza conteúdo com `dateModified` recente

---

## 📋 Checklist de Prioridades

### 🔴 Prioridade Máxima (Esta semana)
- [ ] Corrigir datas do `sitemap.xml`
- [ ] Remover rotas protegidas do sitemap (`/profile`, `/certificate`, `/rewards`)
- [ ] Corrigir `og:image` para URL absoluta no `SEO.tsx`
- [ ] Criar componentes para `/python-para-criancas` e `/aprender-python-jogando` (rotas fantasma)

### 🟡 Prioridade Alta (Próximas 2 semanas)
- [ ] Adicionar `BreadcrumbList` JSON-LD no `ArticlePage`
- [ ] Adicionar `FAQPage` JSON-LD nos artigos
- [ ] Criar página 404
- [ ] Expandir descrições meta por página
- [ ] Usar `structuredData` prop nas páginas restantes (HomePage, AboutPage, LearnPage)

### 🟢 Prioridade Média (Próximo mês)
- [ ] Escrever 10+ novos artigos para o topic cluster
- [ ] Implementar internal linking robusto
- [ ] Submeter em diretórios e listas de ferramentas educacionais
- [ ] Adicionar `dateModified` nos artigos
- [ ] Auditar Core Web Vitals com Lighthouse

### 🔵 Contínuo
- [ ] Monitorar Google Search Console semanalmente
- [ ] Atualizar artigos existentes a cada 3 meses (sinaliza "freshness")
- [ ] Criar novos artigos baseados em keywords descobertas no GSC
- [ ] Construir backlinks via guest posts e comunidades

---

## 🏆 Meta Final

Com todas as fases implementadas, o PyExplorer deve ranquear para:

| Keyword | Posição Alvo |
|---------|-------------|
| "python para crianças" | Top 3 |
| "aprender python jogando" | Top 1 |
| "curso python grátis crianças" | Top 3 |
| "jogo de programação python" | Top 3 |
| "ensinar python para crianças" | Top 5 |
| "exercícios python iniciantes" | Top 5 |
| "o que é python" | Top 10 |
| "aprender a programar" | Top 10 |
