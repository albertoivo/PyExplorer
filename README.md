# 🐍 PyExplorer

> Aprenda Python de forma divertida e interativa!
>
> **Acesse agora: [pyexplorer.com.br](https://pyexplorer.com.br)**

[![CI/CD](https://github.com/albertoivo/PyExplorer/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/albertoivo/PyExplorer/actions/workflows/ci-cd.yml)
[![Security](https://github.com/albertoivo/PyExplorer/actions/workflows/security.yml/badge.svg)](https://github.com/albertoivo/PyExplorer/actions/workflows/security.yml)

PyExplorer é um jogo educativo desenvolvido em ReactJS para ensinar programação Python para crianças de 8 a 15 anos. O jogo utiliza Pyodide para executar código Python diretamente no navegador, proporcionando uma experiência completa de aprendizado sem necessidade de instalações.

![PyExplorer](https://img.shields.io/badge/python-kids-yellow?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/react-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/typescript-5.9-blue?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/firebase-hosting-orange?style=for-the-badge&logo=firebase)
![PWA](https://img.shields.io/badge/PWA-ready-brightgreen?style=for-the-badge&logo=pwa)

## ✨ Características

- 🏆 **Sistema de Certificados** - Gere um certificado personalizado em PDF ao concluir a jornada
- 🔍 **SEO Otimizado** - Meta tags dinâmicas e suporte a redes sociais para compartilhar conquistas
- 🎮 **Gamificação Avançada** - Mundos, estrelas, conquistas, streak diário, missões e loja de itens
- 🐍 **Python no navegador** - Execute código Python real usando Pyodide (WebAssembly)
- 🐢 **Aprendizado Visual** - Desafios com Turtle Graphics para desenhar com código
- 🧩 **8 Tipos de Questões** - Múltipla escolha, V/F, complete código, funções, Parsons problems, desafios visuais e Boss Battles
- 📅 **Desafios Diários** - Novas questões adicionadas diariamente
- 🌍 **11 Mundos Temáticos** - Sequência pedagógica otimizada para iniciantes
- 📖 **Modo História** - Acompanhe uma narrativa envolvente enquanto aprende
- 📱 **PWA & Offline** - Instale como app e jogue mesmo sem internet
- ⚡ **Alta Performance** - Carregamento otimizado com lazy loading e cache inteligente
- 👤 **Modo Convidado** - Experimente sem cadastro com salvamento local

## 📚 Educação & Conteúdo

- **Tutoriais Interativos**: Lições passo a passo antes de cada mundo
- **Flashcards**: Sistema de revisão rápida para memorização
- **Artigos**: Biblioteca de conteúdo extra para aprofundamento (/learn)

## 🚀 Começando

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- (Opcional) Conta no Firebase para usar funcionalidades de nuvem

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/albertoivo/PyExplorer.git
cd PyExplorer
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o Firebase (opcional):
   - Copie `.env.example` para `.env.local`
   - Preencha com suas credenciais do Firebase
   - Ou use o modo convidado sem configurar

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Acesse http://localhost:5173 no navegador

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── common/          # Componentes genéricos (Botões, Inputs, SEO)
│   ├── editor/          # Editor de código Python (Monaco)
│   ├── education/       # Flashcards, Tutoriais e Dicas
│   ├── game/            # Componentes core do jogo
│   │   ├── feedback/    # Painéis de resultado e animações
│   │   ├── questionTypes/ # Implementação dos 8 tipos de questões
│   │   └── turtle/      # Renderização do Turtle Graphics
│   ├── gamification/    # Missões, Conquistas e Loja
│   └── layout/          # Header, Footer, ProtectedRoute, Offline
├── context/
│   ├── AuthContext.tsx       # Autenticação e Perfis
│   ├── GamificationContext.tsx # XP, Moedas e Níveis
│   ├── MascotContext.tsx     # Estado do mascote guia
│   └── PyodideContext.tsx    # Runtime Python WebAssembly
├── data/
│   ├── questions/       # Base de questões dividida por mundos
│   ├── worlds.ts        # Configuração da progressão de mundos
│   └── educationContent.ts # Conteúdo didático e tutoriais
├── firebase/
│   ├── auth.ts          # Regras de negócio de autenticação
│   ├── firestore.ts     # Operações de progresso e ranking
│   └── questionsService.ts # Sincronização de questões
├── hooks/
│   ├── useAuth.ts       # Acesso ao usuário e sessão
│   ├── useGamification.ts # Lógica de recompensas e missões
│   ├── useProgress.ts   # Persistência de progresso local/nuvem
│   └── usePyodide.ts    # Execução de código Python
├── pages/
│   ├── HomePage.tsx     # Landing page e dashboard
│   ├── GamePage.tsx     # Arena de desafios
│   ├── LearnPage.tsx    # Hub de conteúdos educativos
│   ├── GamificationPage.tsx # Loja e inventário
│   ├── ProfilePage.tsx  # Perfil do jogador e estatísticas
│   └── CertificatePage.tsx # Visualização de certificados
├── types/
│   └── question.ts      # Definições TypeScript globais
├── App.tsx              # Roteamento e Providers
├── index.css            # Design System (Tokens e Base)
└── main.tsx             # Inicialização do App
```

## 🎯 Tipos de Questões

| ID Interno | Descrição |
|------------|-----------|
| `multiple_choice` | Escolha uma alternativa correta |
| `true_false` | Verdadeiro ou Falso |
| `fill_code` | Complete lacunas no código |
| `partial_function` | Complete parte de uma função |
| `full_function` | Escreva uma função completa |
| `parsons_problem` | Reordene blocos de código (lógica visual) |
| `turtle_challenge` | Desenhe formas geométricas com Python |
| `boss_battle` | Desafios contra o tempo para fechar mundos |

## 🌍 Mundos disponíveis

1. 🚀 **Primeiros Passos** - Comandos básicos (print, comentários)
2. 📦 **Mundo das Variáveis** - Criação e uso de variáveis e tipos
3. 🔢 **Números Mágicos** - Operações matemáticas e operadores
4. 🔀 **Terra das Decisões** - Estruturas condicionais (if, else, elif)
5. 🔄 **Ilha da Repetição** - Laços de repetição (for, while, range)
6. ✨ **Vale das Funções** - Definição de funções, parâmetros e retorno
7. 📜 **Floresta das Listas** - Criação e manipulação de listas
8. 📝 **Reino das Palavras** - Manipulação de strings e f-strings
9. 🔮 **Templo do Oráculo** - Interação com usuário (input) e conversão de tipos
10. 📚 **Biblioteca Secreta** - Dicionários e pares chave-valor
11. 🛡️ **Fortaleza dos Bugs** - Tratamento de erros e exceções (try/except)

## 🔥 Configuração do Firebase

### 1. Crie um projeto no Firebase
- Acesse https://console.firebase.google.com/
- Crie um novo projeto
- Ative Authentication (Email/Senha)
- Ative Cloud Firestore

### 2. Configure as variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 3. Deploy das regras do Firestore
```bash
firebase deploy --only firestore:rules
```

## 📦 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Cria build de produção otimizado |
| `npm run preview` | Visualiza build local |
| `npm run lint` | Executa linting do código |
| `npm run test` | Executa todos os testes unitários e de integração |
| `npm run test:coverage` | Gera relatório de cobertura de testes |

## 🧪 Testes & Qualidade

O projeto conta com uma suíte de testes robusta utilizando **Vitest** com **>550 testes** cobrindo:

- **Unit Tests**: Lógica de jogo, geradores de certificado e utilitários
- **Integration Tests**: Fluxos de pontuação, autenticação e progressão
- **Smoke Tests**: Verificação crítica de renderização e integridade dos dados
- **Component Tests**: Validação de UI para componentes complexos (Certificados, Editor)
- **Rules Tests**: Testes das regras de segurança do Firestore (Emulator)

Para rodar os testes:
```bash
npm run test
```

## ⚡ Performance & Otimização

O PyExplorer foi otimizado para rodar suavemente em qualquer dispositivo:

- **Lazy Loading**: Páginas e componentes pesados (Monaco, Mascot) carregados sob demanda
- **Manual Chunks**: Separação inteligente de dependências (React, Firebase, Monaco)
- **Memoização**: Componentes otimizados para evitar re-renderizações desnecessárias
- **Cache PWA**: Funcionamento offline e carregamento instantâneo via Service Worker
- **Brotli/Gzip**: Compressão avançada de assets estáticos

## 🚀 Deploy

### Firebase Hosting

```bash
# Instale o Firebase CLI (se ainda não tiver)
npm install -g firebase-tools

# Faça login no Firebase
firebase login

# Inicialize o projeto (se ainda não fez)
firebase init hosting

# Build e deploy
npm run build
firebase deploy --only hosting
```

## 🛠 Tecnologias Utilizadas

- **Frontend**: React 19 + TypeScript 5.9 + Vite
- **Estilização**: CSS Vanilla com Design System Moderno
- **Python Runtime**: Pyodide (WebAssembly)
- **Backend**: Firebase (Auth + Firestore + Hosting)
- **Editor**: Monaco Editor (@monaco-editor/react)
- **Testes**: Vitest + React Testing Library

## 👨‍💻 Equipe

| Nome | Papel |
|------|-------|
| **Alberto Ivo Vieira** | 🚀 Lead Developer |
| **Isaac Andrade** | 🧪 Quality Assurance (QA) |
| **Hugo Thomaz** | 🧪 Quality Assurance (QA) |

## 📄 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

---

Feito com 💜 para ensinar programação de forma divertida!
