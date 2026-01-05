/**
 * Dados do conteúdo educacional para SEO
 * Artigos sobre Python para aumentar autoridade do site
 */

export interface Article {
    id: string
    slug: string
    title: string
    description: string
    content: string
    icon: string
    category: 'beginner' | 'intermediate' | 'tips' | 'parents'
    readTime: number // minutos
    publishedAt: string
    keywords: string[]
}

export const ARTICLES: Article[] = [
    {
        id: 'what-is-python',
        slug: 'o-que-e-python',
        title: 'O que é Python? Guia Completo para Iniciantes',
        description: 'Descubra o que é a linguagem Python, por que ela é tão popular e como ela pode ser a melhor escolha para quem está começando a programar.',
        icon: '🐍',
        category: 'beginner',
        readTime: 5,
        publishedAt: '2026-01-05',
        keywords: ['o que é python', 'python para iniciantes', 'linguagem python'],
        content: `
# O que é Python?

**Python** é uma linguagem de programação criada em 1991 por Guido van Rossum. Ela foi projetada para ser **fácil de ler e escrever**, como se fosse quase um texto em inglês!

## Por que Python é tão Popular?

Python é uma das linguagens mais usadas no mundo por vários motivos:

### 1. Fácil de Aprender 📚
Python tem uma sintaxe simples e clara. Veja como é fácil escrever "Olá, Mundo!":

\`\`\`python
print("Olá, Mundo!")
\`\`\`

### 2. Versátil 🔧
Com Python você pode criar:
- **Jogos** (como Minecraft!)
- **Sites e aplicativos**
- **Inteligência Artificial**
- **Análise de dados**
- **Automação de tarefas**

### 3. Comunidade Enorme 🌍
Milhões de programadores usam Python, então sempre tem alguém para ajudar!

## Python para Crianças

Python é perfeito para crianças porque:
- ✅ Não precisa decorar muitos comandos complicados
- ✅ Erros são mostrados de forma clara
- ✅ Resultados aparecem rapidamente
- ✅ É divertido ver o código funcionando!

## Comece Agora!

No PyExplorer, você aprende Python jogando! Resolva desafios, ganhe estrelas e evolua do básico ao avançado.

**Está pronto para começar sua jornada?** 🚀
`
    },
    {
        id: 'why-learn-python',
        slug: 'por-que-aprender-python',
        title: 'Por que Aprender Python em 2026? 5 Motivos Incríveis',
        description: 'Conheça os 5 principais motivos para aprender Python em 2026 e como essa linguagem pode abrir portas para sua carreira.',
        icon: '🚀',
        category: 'beginner',
        readTime: 4,
        publishedAt: '2026-01-05',
        keywords: ['por que aprender python', 'vantagens python', 'carreira python'],
        content: `
# Por que Aprender Python em 2026?

Se você está pensando em aprender a programar, **Python é a escolha certa**! Veja 5 motivos:

## 1. Linguagem Mais Usada do Mundo 🏆

Python é a linguagem #1 em popularidade segundo o índice TIOBE. Gigantes como **Google, Netflix, Instagram e Spotify** usam Python!

## 2. Salários Altos 💰

Programadores Python estão entre os mais bem pagos:
- **Júnior**: R$ 4.000 - R$ 7.000
- **Pleno**: R$ 8.000 - R$ 15.000
- **Sênior**: R$ 15.000 - R$ 30.000+

## 3. Inteligência Artificial 🤖

Python é a linguagem principal para:
- Machine Learning
- ChatGPT e outros modelos de IA
- Análise de dados
- Automação

## 4. Fácil de Aprender 📖

Compare um "Olá Mundo" em diferentes linguagens:

**Python:**
\`\`\`python
print("Olá, Mundo!")
\`\`\`

**Java:**
\`\`\`java
public class Main {
    public static void main(String[] args) {
        System.out.println("Olá, Mundo!");
    }
}
\`\`\`

Viu a diferença? Python é direto ao ponto!

## 5. Comunidade Incrível 🌟

- Milhares de bibliotecas gratuitas
- Documentação excelente
- Fóruns ativos para tirar dúvidas
- Tutoriais em português

## Comece Sua Jornada!

O PyExplorer foi criado para tornar o aprendizado de Python **divertido e acessível**. Comece hoje mesmo!
`
    },
    {
        id: 'python-for-kids',
        slug: 'python-para-criancas',
        title: 'Python para Crianças: O Guia Definitivo para Pais',
        description: 'Saiba como ensinar Python para crianças de forma divertida. Dicas para pais sobre idade ideal, recursos e como apoiar o aprendizado.',
        icon: '👨‍👩‍👧‍👦',
        category: 'parents',
        readTime: 6,
        publishedAt: '2026-01-05',
        keywords: ['python para crianças', 'ensinar programação', 'programação infantil'],
        content: `
# Python para Crianças: Guia para Pais

Seu filho quer aprender a programar? **Python é a escolha perfeita!** Este guia vai ajudar você a apoiar essa jornada.

## Qual a Idade Ideal? 🎂

- **6-8 anos**: Conceitos básicos com jogos visuais
- **8-12 anos**: Python com projetos simples (ideal para PyExplorer!)
- **12+ anos**: Projetos mais complexos e criativos

## Benefícios da Programação para Crianças

### 1. Pensamento Lógico 🧠
Programar ensina a criança a pensar de forma estruturada e resolver problemas passo a passo.

### 2. Criatividade 🎨
Com código, as crianças podem criar seus próprios jogos, histórias e animações!

### 3. Resiliência 💪
Erros fazem parte da programação. As crianças aprendem que falhar é o caminho para o sucesso.

### 4. Habilidade do Futuro 🔮
Programação será essencial em praticamente todas as carreiras.

## Como Apoiar seu Filho

### ✅ Faça junto
Sente ao lado e aprenda também! Isso cria conexão.

### ✅ Celebre pequenas vitórias
Cada código que funciona merece comemoração! 🎉

### ✅ Deixe errar
Não corrija imediatamente. Deixe a criança descobrir o erro.

### ✅ Limite o tempo
30-60 minutos por sessão é ideal para manter o foco.

## Por que PyExplorer?

O PyExplorer foi criado especialmente para crianças:
- 🎮 Aprendizado em formato de jogo
- ⭐ Sistema de recompensas e conquistas
- 🐍 Mascote simpático que ajuda
- 📱 Funciona no celular, tablet e computador
- 🆓 100% gratuito!

**Comece a aventura com seu filho hoje!**
`
    },
    {
        id: 'first-steps-python',
        slug: 'primeiros-passos-python',
        title: 'Primeiros Passos em Python: Tutorial para Iniciantes',
        description: 'Aprenda os comandos básicos de Python neste tutorial passo a passo. Do print() às variáveis, tudo explicado de forma simples.',
        icon: '👣',
        category: 'beginner',
        readTime: 7,
        publishedAt: '2026-01-05',
        keywords: ['tutorial python', 'aprender python do zero', 'comandos python'],
        content: `
# Primeiros Passos em Python

Vamos aprender os comandos básicos de Python! Este tutorial é para quem nunca programou.

## 1. O Comando print() 📝

O \`print()\` mostra mensagens na tela:

\`\`\`python
print("Olá, eu sou um programa!")
print("Python é incrível!")
\`\`\`

**Resultado:**
\`\`\`
Olá, eu sou um programa!
Python é incrível!
\`\`\`

## 2. Variáveis 📦

Variáveis são como caixas que guardam valores:

\`\`\`python
nome = "Maria"
idade = 10
print("Meu nome é", nome)
print("Tenho", idade, "anos")
\`\`\`

**Resultado:**
\`\`\`
Meu nome é Maria
Tenho 10 anos
\`\`\`

## 3. Fazendo Contas 🔢

Python é uma calculadora super poderosa:

\`\`\`python
# Soma
resultado = 10 + 5
print(resultado)  # 15

# Multiplicação
total = 4 * 3
print(total)  # 12

# Tudo junto!
conta = (10 + 5) * 2
print(conta)  # 30
\`\`\`

## 4. Pedindo Informação 💬

Use \`input()\` para pedir dados ao usuário:

\`\`\`python
nome = input("Qual seu nome? ")
print("Olá,", nome, "!")
\`\`\`

## 5. Tomando Decisões 🤔

Use \`if\` para fazer escolhas:

\`\`\`python
idade = 12

if idade >= 10:
    print("Você pode jogar!")
else:
    print("Volte quando for maior!")
\`\`\`

## Pratique no PyExplorer!

Esses comandos são a base de tudo! No PyExplorer, você pratica cada um deles com desafios divertidos e ganha estrelas por cada acerto! ⭐
`
    },
    {
        id: 'programming-games-kids',
        slug: 'jogos-aprender-programacao',
        title: '5 Melhores Jogos para Aprender Programação',
        description: 'Conheça os melhores jogos e plataformas para crianças aprenderem programação de forma divertida, incluindo PyExplorer.',
        icon: '🎮',
        category: 'tips',
        readTime: 5,
        publishedAt: '2026-01-05',
        keywords: ['jogos programação', 'aprender programação jogando', 'coding games'],
        content: `
# 5 Melhores Jogos para Aprender Programação

Aprender a programar pode ser **muito divertido**! Conheça os melhores jogos:

## 1. PyExplorer 🐍⭐ (Recomendado!)

**Idade:** 8-15 anos
**Linguagem:** Python
**Preço:** Gratuito

O PyExplorer é um jogo brasileiro feito especialmente para ensinar Python:
- ✅ Interface em português
- ✅ Sistema de níveis e recompensas
- ✅ Desafios progressivos
- ✅ Funciona offline
- ✅ 100% gratuito!

## 2. Scratch 🐱

**Idade:** 6-12 anos
**Linguagem:** Blocos visuais
**Preço:** Gratuito

Criado pelo MIT, o Scratch usa blocos coloridos que se encaixam. Ótimo para começar, mas não ensina código real.

## 3. Code.org 🎓

**Idade:** 4-18 anos
**Linguagem:** Diversos
**Preço:** Gratuito

Plataforma com cursos estruturados usando personagens famosos como Minecraft e Star Wars.

## 4. CodeCombat ⚔️

**Idade:** 10+ anos
**Linguagem:** Python, JavaScript
**Preço:** Freemium

Jogo RPG onde você controla um herói escrevendo código. Divertido, mas em inglês.

## 5. Lightbot 💡

**Idade:** 4-10 anos
**Linguagem:** Conceitos lógicos
**Preço:** Pago (R$ 15)

Puzzle game que ensina conceitos de programação sem código.

## Por que Escolher PyExplorer?

| Característica | PyExplorer | Outros |
|----------------|------------|--------|
| Em português | ✅ | ❌/Parcial |
| Python real | ✅ | ❌/Limitado |
| Gratuito | ✅ | ❌/Freemium |
| Sistema gamificado | ✅ | Parcial |
| Offline | ✅ | ❌ |

**Comece agora mesmo no PyExplorer!** 🚀
`
    }
]

/**
 * Busca um artigo pelo slug
 */
export function getArticleBySlug(slug: string): Article | undefined {
    return ARTICLES.find(article => article.slug === slug)
}

/**
 * Retorna artigos por categoria
 */
export function getArticlesByCategory(category: Article['category']): Article[] {
    return ARTICLES.filter(article => article.category === category)
}

/**
 * Retorna artigos relacionados (mesma categoria, exceto o atual)
 */
export function getRelatedArticles(currentSlug: string, limit: number = 3): Article[] {
    const current = getArticleBySlug(currentSlug)
    if (!current) return ARTICLES.slice(0, limit)

    return ARTICLES
        .filter(a => a.slug !== currentSlug && a.category === current.category)
        .slice(0, limit)
}
