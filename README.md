# 🐍 PyExplorer

> Aprenda Python de forma divertida e interativa!
>
> **Acesse agora: [pyexplorer.com.br](https://pyexplorer.com.br)**

[![CI/CD](https://github.com/albertoivo/PyExplorer/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/albertoivo/PyExplorer/actions/workflows/ci-cd.yml)
[![Security](https://github.com/albertoivo/PyExplorer/actions/workflows/security.yml/badge.svg)](https://github.com/albertoivo/PyExplorer/actions/workflows/security.yml)

PyExplorer é um jogo educativo inovador desenvolvido em ReactJS, criado especialmente para ensinar programação Python de forma gamificada e envolvente para crianças e adolescentes (8 a 15 anos). O jogo utiliza tecnologias web modernas como Pyodide (WebAssembly) para executar código Python *diretamente no navegador*, proporcionando uma experiência completa de aprendizado sem a necessidade de configurações complexas ou instalações locais.

![PyExplorer](https://img.shields.io/badge/python-kids-yellow?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/react-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/typescript-5.9-blue?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/firebase-hosting-orange?style=for-the-badge&logo=firebase)
![PWA](https://img.shields.io/badge/PWA-ready-brightgreen?style=for-the-badge&logo=pwa)

## ✨ Características Principais

O PyExplorer não é apenas um tutorial, é uma plataforma completa de aprendizado gamificado:

- 🎮 **Gamificação Avançada**: Sistema rico com 4 Sagas Épicas, 18 Mundos, estrelas, moedas, conquistas, streak diário, missões dinâmicas e uma loja virtual de itens (Avatares e Power-ups).
- 🐍 **Python Nativo no Navegador**: O poder do Python real em suas mãos. Execute scripts, crie funções e manipule estruturas de dados usando Pyodide (WebAssembly).
- 🐢 **Aprendizado Visual com Turtle**: Desafios interativos com Turtle Graphics para desenhar formas e aprender lógica geométrica com código.
- 🧩 **8 Tipos de Questões Interativas**: Desde múltipla escolha e V/F até completamento de código, funções parciais/completas, Parsons problems (arrastar e soltar), desafios visuais (Turtle) e intensas Boss Battles contra o tempo.
- 🌍 **Jornada Épica (4 Sagas e 18 Mundos)**: Uma sequência pedagógica cuidadosamente desenhada que guia o aluno desde o `print()` até manipulação de APIs e Dados.
- 🏆 **Sistema de Certificados**: Emissão de certificados em PDF personalizados ao concluir a jornada de aprendizado.
- 📅 **Desafios Diários**: Conteúdo fresco todos os dias para manter o engajamento e a constância.
- 📖 **Modo História e Tutoriais**: Uma narrativa imersiva que acompanha o aprendizado, junto com tutoriais interativos passo a passo e flashcards de revisão.
- 📱 **PWA & Funcionamento Offline**: Instale como um aplicativo (Progressive Web App) em desktops ou celulares e jogue mesmo sem conexão com a internet.
- ⚡ **Performance e Acessibilidade**: Interface rápida com Monaco Editor embutido (lazy loading), cache inteligente e otimizações de acessibilidade.
- 👤 **Modo Convidado vs Nuvem**: Experimente o jogo imediatamente sem cadastro com progresso local, ou crie uma conta (via Firebase) para sincronizar dados na nuvem, acessar rankings e competir no Leaderboard.

## 📚 Jornada de Aprendizado: As 4 Sagas Épicas

Nossa aventura é dividida em **4 Sagas**, totalizando **18 Mundos** que cobrem desde o básico até conceitos avançados:

### 🛡️ Saga 1: O Aprendiz de Python
*Fundamentos & Lógica de Programação*
Dê os primeiros passos, crie variáveis, converse com o usuário e domine decisões e repetições!

1. 🚀 **Primeiros Passos** - Aprenda a dar os primeiros comandos em Python!
2. 📦 **Mundo das Variáveis** - Guarde informações em caixinhas mágicas!
3. 🔮 **Templo do Oráculo** - Aprenda a conversar com o usuário com input()!
4. 🔢 **Números Mágicos** - Faça cálculos incríveis como um mago da matemática!
5. 🔀 **Terra das Decisões** - Faça escolhas e crie caminhos diferentes!
6. 🔄 **Ilha da Repetição** - Repita comandos como um feiticeiro!

### 📜 Saga 2: O Guardião dos Dados
*Estruturas, Texto & Funções*
Domine a manipulação de textos, organize listas, dicionários e crie magias reutilizáveis!

7. 📝 **Reino das Palavras** - Manipule textos e crie histórias incríveis!
8. 📜 **Floresta das Listas** - Organize muitas coisas numa única lista!
9. 📚 **Biblioteca Secreta** - Guarde segredos em dicionários, tuplas e conjuntos!
10. ✨ **Vale das Funções** - Crie suas próprias magias reutilizáveis!
11. 🛡️ **Fortaleza dos Bugs** - Proteja seu código contra erros com try/except!

### 🏗️ Saga 3: O Arquiteto de Software
*Orientação a Objetos & Recursos Avançados*
Construa arquivos, use bibliotecas, crie suas próprias Classes/Objetos e use atalhos Pythonic!

12. 📂 **Arquivos do Conhecimento** - Leia, escreva e guarde informações em arquivos reais!
13. 🧰 **Bazar de Módulos** - Use magias prontas com import, math, random e mais!
14. 🧙‍♂️ **A Arte dos Objetos** - Crie seus próprios seres e blueprints com Classes e POO!
15. ⚡ **Atalhos Mágicos** - Escreva código poderoso com List Comprehensions e Lambdas!

### 🌟 Saga 4: As Trilhas do Destino
*Especializações & Projetos Práticos*
Crie artes com código, analise dados reais de IA e conecte-se com APIs da internet!

16. 🎨 **Estúdio de Arte & Turtle** - Crie desenhos geométricos e animações incríveis com código!
17. 🤖 **Laboratório de Dados & IA** - Explore dados, estatísticas e lógicas de Inteligência Artificial!
18. 🌐 **A Teia da Internet & APIs** - Conecte seus programas com informações vivas da internet!

## 🎯 A Estrutura dos Desafios (Tipos de Questões)

Para garantir uma fixação completa, utilizamos 8 abordagens diferentes:

| Tipo | Descrição da Mecânica |
|------------|-----------|
| `multiple_choice` | Questões clássicas de múltipla escolha para validar teoria. |
| `true_false` | Avaliação rápida de conceitos verdadeiro ou falso. |
| `fill_code` | Complete as lacunas em um bloco de código (Monaco Editor). |
| `partial_function` | Implemente a lógica interna de uma função pré-estruturada. |
| `full_function` | Escreva uma função do zero com base nos requisitos. |
| `parsons_problem` | Reordene blocos lógicos visualmente sem digitar (ótimo para celulares). |
| `turtle_challenge` | Programe instruções para a "Tartaruga" desenhar a forma solicitada. |
| `boss_battle` | Desafio épico cronometrado que revisa todo o conteúdo do Mundo para liberar a próxima etapa. |

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- (Opcional) Conta no Firebase para recursos de nuvem/autenticação.

### Instalação e Execução

1. Clone o repositório e acesse a pasta:
```bash
git clone https://github.com/albertoivo/PyExplorer.git
cd PyExplorer
```

2. Instale as dependências:
```bash
npm install
```

3. **(Opcional) Configuração do Firebase:**
   Para testar autenticação e Leaderboard, crie um arquivo `.env.local` na raiz com suas credenciais:
   ```env
   VITE_FIREBASE_API_KEY=sua_api_key
   VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=seu-projeto
   VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```
   *Nota: Sem o `.env.local`, o app funcionará no "Modo Convidado" (dados salvos localmente).*

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Abra http://localhost:5173 no seu navegador.

## 📁 Arquitetura e Estrutura do Código

```
src/
├── components/
│   ├── common/          # UI Genérica (Botões, Inputs, Cards, SEO)
│   ├── editor/          # Integração com Monaco Editor para Python
│   ├── education/       # Conteúdos de apoio (Flashcards, Tutoriais)
│   ├── game/            # Lógica dos Desafios (Feedback, Tipos de Questão, Boss Battles)
│   │   ├── questionTypes/ # Implementação visual de cada um dos 8 tipos de questões
│   │   └── turtle/      # Bridge React <-> Python para Canvas
│   ├── gamification/    # Sistemas de Engajamento (Missões, Loja, Mascote, XP)
│   └── layout/          # Estrutura das páginas, rotas protegidas e navegação
├── context/
│   ├── AuthContext.tsx       # Gerenciamento de Sessão e Auth Firebase
│   ├── GamificationContext.tsx # Central de XP, Nível e Economia
│   ├── MascotContext.tsx     # Estado e falas do Mascote assistente
│   └── PyodideContext.tsx    # Orquestração do Worker WebAssembly do Python
├── data/
│   ├── questions/       # Banco de dados de questões estruturado por arquivos/mundos
│   ├── worlds.ts        # Definição canônica das Sagas, Mundos e requisitos
│   └── educationContent.ts # Artigos e material didático
├── firebase/            # Serviços de Backend as a Service
├── hooks/               # Custom hooks para encapsular lógica complexa (useProgress, usePyodide)
├── pages/               # Páginas roteáveis da aplicação
├── types/               # Tipagens TypeScript (UserData, World, LeaderboardEntry)
├── utils/               # Funções de apoio (Validações, Lógica de Mascote, Formatação)
└── workers/             # Web Workers (Ex: pyodide.worker.ts) para evitar travamentos de UI
```

## 🧪 Suíte de Testes (Vitest)

O PyExplorer leva qualidade a sério, contando com **mais de 550 testes automatizados**:

- **Unit Tests**: Validação de utils, cálculos de XP, formatações e regras de negócio.
- **Integration Tests**: Fluxos de login, renderização condicional e comunicação com mocks de contexto.
- **Rules Tests**: Testes rigorosos das regras de segurança do Firestore.

```bash
npm run test           # Roda todos os testes (Unit + Integration)
npm run test:coverage  # Gera o relatório detalhado de cobertura
```

## ⚡ Performance e Decisões Técnicas

- **Web Workers para Python:** O código do usuário (via Pyodide) roda em uma thread separada (`workers/pyodide.worker.ts`). Isso garante que loops infinitos feitos por iniciantes não travem a interface gráfica (React).
- **Code Splitting Inteligente:** Bibliotecas pesadas como Monaco Editor, jsPDF e html2canvas são carregadas dinamicamente (`React.lazy` e `import()`) apenas quando a página/componente é acessada.
- **PWA Ready:** Configurações de `VitePWA` aplicadas para cache de assets e modo offline.

## 👨‍💻 Equipe e Contribuição

| Nome | Papel |
|------|-------|
| **Alberto Ivo Vieira** | 🚀 Lead Developer & Criador |
| **Isaac Andrade** | 🧪 Quality Assurance (QA) |
| **Hugo Thomaz** | 🧪 Quality Assurance (QA) |

**Quer contribuir?** Sinta-se à vontade para explorar as issues abertas ou propor novas ideias via Pull Requests!

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).

---
*Feito com 💜 para democratizar o ensino de programação.*
