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
    updatedAt?: string
    keywords: string[]
    faqs?: { question: string, answer: string }[]
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
        updatedAt: '2026-05-16',
        keywords: ['o que é python', 'python para iniciantes', 'linguagem python'],
        faqs: [
            {
                question: "Python é difícil de aprender?",
                answer: "Não! Python é considerada a linguagem mais fácil de aprender, ideal para iniciantes e crianças devido à sua sintaxe simples e legível, semelhante ao inglês."
            },
            {
                question: "Preciso de um computador potente para programar em Python?",
                answer: "Não! O Python é muito leve. E com o PyExplorer, você pode rodar o código direto no navegador do seu celular ou tablet, sem precisar instalar nada."
            }
        ],
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

Se você quer o melhor para o seu filho, **[comece a aprender python jogando](/)** agora mesmo!
`
    },
    {
        id: 'how-to-teach-python',
        slug: 'como-ensinar-python-criancas',
        title: 'Como Ensinar Python para Crianças de 8 a 15 anos',
        description: 'Um guia prático para pais e professores sobre como introduzir o Python para crianças e adolescentes de forma eficaz e divertida.',
        icon: '💡',
        category: 'parents',
        readTime: 6,
        publishedAt: '2026-05-04',
        keywords: ['como ensinar python', 'python 8 a 15 anos', 'metodologia programação infantil'],
        content: `
# Como Ensinar Python para Crianças de 8 a 15 anos

Ensinar programação para crianças e adolescentes requer uma abordagem diferente do ensino para adultos. Aqui estão as melhores práticas:

## 1. Comece com o "Porquê" 🎯
Antes de mostrar código, mostre o que ele pode fazer. Mostre jogos, sites e robôs criados com Python. Isso desperta o interesse imediato.

## 2. Use Analogias do Mundo Real 🍎
Explique variáveis como "caixas etiquetadas" e loops como "uma receita de bolo que se repete". Isso torna o abstrato em algo concreto.

## 3. Aprendizado Baseado em Projetos 🏗️
Em vez de ensinar toda a teoria primeiro, deixe a criança criar algo pequeno logo de cara. O sentimento de conquista é o maior motivador.

## 4. Gamificação é Essencial 🎮
Crianças amam desafios, níveis e recompensas. É por isso que plataformas como o PyExplorer funcionam tão bem.

## 5. Respeite o Ritmo 🐢
Algumas crianças pegam rápido, outras precisam de mais tempo. O importante é manter o processo divertido e sem pressão.

## Conclusão
O objetivo não é apenas formar programadores, mas sim ensinar pensamento lógico e resolução de problemas.

Para facilitar essa jornada, você pode utilizar ferramentas gratuitas e lúdicas. **[comece a aprender python jogando](/)** com seu filho hoje mesmo!
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
        title: '5 Melhores Jogos para Estudar Python e Programação',
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

**[Comece a aprender python jogando](/)** agora mesmo no PyExplorer! 🚀
`
    },
    {
        id: 'python-exercises-kids',
        slug: 'exercicios-python-criancas',
        title: 'Exercícios de Python para Crianças: Desafios Práticos com Gabarito',
        description: 'Pratique lógica e programação com 5 exercícios divertidos de Python pensados para crianças e iniciantes. Inclui código completo e respostas explicadas.',
        icon: '📝',
        category: 'beginner',
        readTime: 6,
        publishedAt: '2026-07-24',
        updatedAt: '2026-07-24',
        keywords: ['exercícios python crianças', 'exercícios python iniciantes', 'desafios de programação infantil', 'aprender python praticando'],
        faqs: [
            {
                question: "Como praticar estes exercícios sem instalar nada no computador?",
                answer: "Você pode testar todos os códigos direto no navegador usando o PyExplorer! Nossa plataforma executa Python real em qualquer computador, tablet ou celular."
            },
            {
                question: "Qual a idade recomendada para resolver estes desafios?",
                answer: "Estes exercícios foram desenhados para crianças e jovens a partir de 8 anos, ou para qualquer iniciante que esteja dando os primeiros passos na programação."
            }
        ],
        content: `
# Exercícios de Python para Crianças: Desafios Práticos

A melhor maneira de aprender a programar é **colocando a mão na massa**! Preparamos 5 desafios progressivos para exercitar sua lógica de programação.

---

## 🎯 Desafio 1: O Apresentador de Herói

**Objetivo:** Criar um programa que receba o nome de um personagem e seu superpoder, e exiba uma mensagem de apresentação.

### O que você vai praticar:
- Uso de \`input()\` para receber dados
- Uso de \`print()\` e concatenação de textos

### Tente resolver primeiro!
Escreva um código que peça o **Nome** e o **Poder**, e mostre: \`"Atenção! O herói [Nome] chegou com o poder de [Poder]!"\`.

\`\`\`python
# Dica: use duas variáveis diferentes
nome = input("Qual o nome do herói? ")
poder = input("Qual é o seu superpoder? ")

# Agora mostre a mensagem!
\`\`\`

---

## 🔢 Desafio 2: Calculadora de Idade em Dias

**Objetivo:** Descobrir aproximadamente quantos dias uma pessoa já viveu no planeta!

### O que você vai praticar:
- Conversão de texto para número inteiro com \`int()\`
- Operações matemáticas em Python

### Solução Explicada:
\`\`\`python
idade = int(input("Quantos anos você tem? "))
dias = idade * 365

print("Uau! Você já viveu aproximadamente", dias, "dias!")
\`\`\`

---

## ⚡ Desafio 3: Detector de Supervelocidade

**Objetivo:** Verificar se um robô está andando dentro do limite de velocidade permitido.

### O que você vai praticar:
- Estruturas condicionais (\`if\` e \`else\`)
- Comparadores numéricos (\`>\`, \`<=\`)

\`\`\`python
velocidade = int(input("Qual a velocidade atual do robô (km/h)? "))

if velocidade > 80:
    print("⚠️ ALERTA: Velocidade muito alta! Reduzindo motores...")
else:
    print("✅ Velocidade segura! Continue navegando.")
\`\`\`

---

## 🔄 Desafio 4: O Contador Regressivo do Foguete

**Objetivo:** Fazer uma contagem regressiva de 5 até 1 para o lançamento de uma nave espacial!

### O que você vai praticar:
- Laços de repetição com \`for\` e a função \`range()\`

\`\`\`python
print("🚀 Lançamento em...")

for segundo in range(5, 0, -1):
    print(segundo, "...")

print("💥 DECOLAR!")
\`\`\`

---

## 🎮 Desafio 5: O Escolhedor de Caminho Mágico

**Objetivo:** Criar um mini jogo de decisão onde a escolha do jogador muda o final da história!

\`\`\`python
print("Você está diante de duas portas na floresta misteriosa:")
print("1 - Porta de Cristal")
print("2 - Porta de Madeira")

escolha = input("Qual porta você abre (1 ou 2)? ")

if escolha == "1":
    print("✨ Você encontrou um baú cheio de diamantes mágicos!")
elif escolha == "2":
    print("🐉 Um amigável dragão verde te ofereceu uma carona!")
else:
    print("❓ Você hesitou e uma brisa mágica te levou de volta para casa!")
\`\`\`

---

## 🚀 Onde Praticar Mais?

Quer testar esses códigos e resolver mais de 100 desafios interativos com dicas do mascote e sistema de pontos?

**[Aprenda Python Jogando no PyExplorer](/)** e transforme o estudo da programação em uma verdadeira aventura!
`
    },
    {
        id: 'scratch-vs-python',
        slug: 'scratch-vs-python',
        title: 'Scratch vs Python: Qual a Melhor Linguagem para Crianças?',
        description: 'Entenda as diferenças entre Scratch e Python, os prós e contras de cada um e saiba exatamente o momento certo para seu filho fazer a transição para código escrito.',
        icon: '⚔️',
        category: 'parents',
        readTime: 5,
        publishedAt: '2026-07-24',
        updatedAt: '2026-07-24',
        keywords: ['scratch vs python', 'scratch ou python para crianças', 'diferenca scratch python', 'qual melhor linguagem infantil'],
        faqs: [
            {
                question: "Meu filho precisa aprender Scratch antes do Python?",
                answer: "Não obrigatoriamente. Crianças a partir de 8 ou 9 anos já conseguem começar diretamente no Python com jogos e ambientes lúdicos como o PyExplorer."
            },
            {
                question: "O Scratch é considerado programação de verdade?",
                answer: "Sim! O Scratch ensina toda a lógica essencial (variáveis, loops, condições). A única diferença é que a criança encaixa blocos coloridos em vez de digitar texto."
            }
        ],
        content: `
# Scratch vs Python: Qual Escolher para Crianças?

Se você quer introduzir seu filho ou aluno ao universo da tecnologia, é muito provável que tenha se deparado com duas opções populares: **Scratch** e **Python**.

Embora ambas sejam ferramentas educacionais incríveis, elas atendem a **estágios de desenvolvimento diferentes**.

---

## 📊 Comparativo Direto

| Recurso | Scratch 🐱 | Python 🐍 |
| :--- | :--- | :--- |
| **Estilo de Código** | Bloco visual de arrastar e soltar | Código escrito em texto |
| **Faixa Etária Ideal** | 6 a 9 anos | 8 a 15+ anos |
| **Curva de Aprendizado** | Muito baixa (sem erros de digitação) | Suave e natural |
| **Uso no Mundo Real** | Educacional e conceitual | Profissional (Google, Netflix, IA) |
| **Portabilidade** | Web e animações | Jogos, sites, robótica e aplicativos |

---

## 🧩 O que é o Scratch?

O Scratch foi desenvolvido pelo prestigiado laboratório MIT para ensinar lógica computacional através de blocos visuais. 

### Vantagens do Scratch:
- ✅ **Zero erro de sintaxe:** Não existe o risco de esquecer uma vírgula ou parêntese.
- ✅ **Resultado visual imediato:** Fácil para criar animações e historinhas rapidamente.

### Limitações:
- ❌ Não prepara para o mercado ou desenvolvimento de sistemas reais.
- ❌ Pode se tornar infantilizado à medida que a criança cresce.

---

## 🐍 O que é o Python?

O Python é uma das linguagens de programação reais mais populares do planeta, famosa por ter uma sintaxe limpa que lembra frases simples em inglês.

### Vantagens do Python:
- ✅ **Linguagem Real:** A criança aprende o mesmo idioma usado por engenheiros da NASA e desenvolvedores de Inteligência Artificial.
- ✅ **Raciocínio Estruturado:** Estimula a atenção aos detalhes e digitação.
- ✅ **Transição Perfeita com Jogos:** Quando ensinado com gamificação (como no PyExplorer), torna-se tão divertido quanto um videogame.

---

## 🎯 Quando Fazer a Transição do Scratch para o Python?

O momento ideal para migrar do Scratch para o Python é quando a criança:
1. Já compreende conceitos básicos como "Se... Então" e repetições.
2. Já possui uma digitação confortável no teclado.
3. Demonstra vontade de criar projetos mais desafiadores.

Descubra mais em nosso **[guia de Python para crianças](/python-para-criancas)** e veja como essa transição pode ser natural e empolgante.

---

## 💡 Conclusão

Não existe uma ferramenta "melhor" absoluta, mas sim a **ferramenta certa para a idade certa**:
- **6 aos 8 anos:** Comece com o Scratch para despertar a curiosidade.
- **A partir dos 8 anos:** O **Python** é a escolha ideal para construir habilidades reais e duradouras.

Quer começar a jornada em Python de forma 100% gratuita e em português? **[Experimente o PyExplorer jogando agora mesmo](/)**!
`
    },
    {
        id: 'python-projects-kids',
        slug: 'projetos-python-criancas',
        title: '5 Projetos Simples em Python para Crianças Criarem Hoje',
        description: 'Aprenda a criar 5 projetos e jogos incríveis em Python do zero! Códigos curtos, explicados passo a passo e prontos para executar.',
        icon: '🛠️',
        category: 'beginner',
        readTime: 7,
        publishedAt: '2026-07-24',
        updatedAt: '2026-07-24',
        keywords: ['projetos python crianças', 'projetos python iniciantes', 'criar jogos em python', 'projetos de programação infantil'],
        faqs: [
            {
                question: "Preciso instalar programas no computador para criar esses projetos?",
                answer: "Não! Você pode escrever e testar todos esses projetos diretamente no navegador pelo PyExplorer."
            },
            {
                question: "Posso modificar os projetos para deixá-los do meu jeito?",
                answer: "Com certeza! Essa é a melhor parte da programação: alterar as regras, mudar as frases e criar sua própria versão do jogo."
            }
        ],
        content: `
# 5 Projetos Simples em Python para Crianças Criarem Hoje

Programar fica muito mais empolgante quando você vê suas próprias ideias ganhando vida na tela!

Reunimos **5 projetos práticos**, divertidos e com poucas linhas de código, perfeitos para quem está começando.

---

## 🎲 Projeto 1: Simulador de Lançamento de Dados

Crie um dado virtual que sorteia um número de 1 a 6 toda vez que você joga!

\`\`\`python
import random

print("🎲 Jogando o dado mágico...")
resultado = random.randint(1, 6)
print("Você tirou o número:", resultado)
\`\`\`

*Desafio Extra:* Tente mudar o código para rolar um dado de 20 lados de RPG (\`randint(1, 20)\`)!

---

## 🔮 Projeto 2: A Bola 8 Mágica do Futuro

Faça uma pergunta para a Bola 8 Mágica e veja qual será o seu destino!

\`\`\`python
import random

pergunta = input("Faça uma pergunta sobre o seu futuro: ")

respostas = [
    "Com certeza sim! ✨",
    "Minhas fontes dizem que não... 🔮",
    "Pergunte novamente mais tarde! ⏳",
    "Sem dúvidas! 🚀",
    "Absolutamente não! ❌"
]

print("A Bola 8 Mágica respondeu:", random.choice(respostas))
\`\`\`

---

## 📖 Projeto 3: Gerador de Historinhas Malucas (Mad Libs)

Um jogo clássico onde você digita palavras aleatórias e o programa gera uma história engraçada!

\`\`\`python
substantivo = input("Digite um animal: ")
lugar = input("Digite um lugar: ")
comida = input("Digite uma comida: ")

print(f"\nUm dia, o {substantivo} foi passear em {lugar} e comeu um prato gigante de {comida}!")
\`\`\`

---

## 🏆 Projeto 4: Quiz de Conhecimentos de Super-Heróis

Crie seu próprio jogo de perguntas e respostas para testar seus amigos!

\`\`\`python
pontos = 0

print("⚡ QUIZ DOS SUPER-HERÓIS ⚡")
resposta = input("Qual o nome do alter ego do Homem-Aranha? ").strip().title()

if resposta == "Peter Parker":
    print("✅ Correto! Mais 10 pontos!")
    pontos += 10
else:
    print("❌ Ops! A resposta correta era Peter Parker.")

print(f"Sua pontuação final: {pontos} pontos!")
\`\`\`

---

## 🔢 Projeto 5: O Jogo do Número Secreto

O computador escolhe um número de 1 a 10 e você precisa adivinhar em até 3 tentativas!

\`\`\`python
import random

numero_secreto = random.randint(1, 10)
acertou = False

print("🎯 Adivinhe o número secreto entre 1 e 10!")

for tentativa in range(1, 4):
    chute = int(input(f"Tentativa {tentativa}: "))
    
    if chute == numero_secreto:
        print("🎉 PARABÉNS! Você descobriu o número secreto!")
        acertou = True
        break
    elif chute < numero_secreto:
        print("Dica: O número secreto é MAIOR! ⬆️")
    else:
        print("Dica: O número secreto é MENOR! ⬇️")

if not acertou:
    print(f"Que pena! O número secreto era {numero_secreto}.")
\`\`\`

---

## 🌟 Gostou desses projetos?

No **PyExplorer**, você aprende todos os conceitos por trás desses jogos passo a passo, conquistando estrelas e desbloqueando novos mundos!

**[Comece a aprender python jogando agora mesmo](/)** e crie seus próprios projetos de tecnologia!
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
 * Retorna artigos relacionados (mesma categoria, exceto o atual)
 */
export function getRelatedArticles(currentSlug: string, limit: number = 3): Article[] {
    const current = getArticleBySlug(currentSlug)
    if (!current) return ARTICLES.slice(0, limit)

    return ARTICLES
        .filter(a => a.slug !== currentSlug && a.category === current.category)
        .slice(0, limit)
}
