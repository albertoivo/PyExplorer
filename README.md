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
- 🧩 **7 Tipos de Questões** - Múltipla escolha, V/F, complete código, funções, Parsons problems e desafios visuais
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
git clone https://github.com/seu-usuario/pyexplorer.git
cd pyexplorer
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
│   ├── editor/          # Editor de código Python
│   ├── game/            # Componentes do jogo
│   │   ├── feedback/    # Painéis de resultado
│   │   └── questionTypes/  # Tipos de questão
│   └── layout/          # Header, Footer, ProtectedRoute
├── context/
│   ├── AuthContext.tsx  # Contexto de autenticação
│   └── PyodideContext.tsx  # Contexto do Pyodide
├── data/
│   └── mockQuestions.ts # Questões de exemplo
├── firebase/
│   ├── auth.ts          # Funções de autenticação
│   ├── firebaseConfig.ts # Configuração Firebase
│   └── firestore.ts     # Funções do Firestore
├── hooks/
│   ├── useAuth.ts       # Hook de autenticação
│   ├── useProgress.ts   # Hook de progresso
│   ├── usePyodide.ts    # Hook do Pyodide
│   └── useQuestions.ts  # Hook de questões
├── pages/
│   ├── GamePage.tsx     # Página do jogo
│   ├── HomePage.tsx     # Página inicial
│   ├── LoginPage.tsx    # Página de login
│   ├── ProfilePage.tsx  # Página de perfil
│   └── RegisterPage.tsx # Página de cadastro
├── types/
│   └── question.ts      # Tipos TypeScript
├── App.tsx              # Componente principal
├── App.css              # Estilos do App
├── index.css            # Estilos globais
└── main.tsx             # Ponto de entrada
```

## 🎯 Tipos de Questões

| Tipo | Descrição |
|------|-----------|
| `multiple_choice` | Escolha uma alternativa correta |
| `true_false` | Verdadeiro ou Falso |
| `fill_code` | Complete lacunas no código |
| `partial_function` | Complete parte de uma função |
| `full_function` | Escreva uma função completa |
| `parsons` | Reordene blocos de código (lógica sem digitação) |
| `turtle_challenge` | Desenhe formas geométricas com Python |

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
| `npm run test:run` | Executa todos os testes unitários (Smoke, Integration, Regression) |
| `npm run test:ui` | Abre interface visual do Vitest |

## 🧪 Testes & Qualidade

O projeto conta com uma suíte de testes robusta utilizando **Vitest**:

O projeto conta com uma suíte de testes robusta utilizando **Vitest** com >360 testes cobrindo:

- **Unit Tests**: Lógica de jogo, geradores de certificado e utilitários
- **Integration Tests**: Fluxos de pontuação, autenticação e progressão
- **Smoke Tests**: Verificação crítica de renderização e integridade dos dados
- **Component Tests**: Validação de UI para componentes complexos (Certificados, Editor)

Para rodar os testes:
```bash
npm run test:run
```

## ⚡ Performance & Otimização

O PyExplorer foi otimizado para rodar suavemente em qualquer dispositivo:

- **Lazy Loading**: Páginas carregadas sob demanda (Code Splitting)
- **Manual Chunks**: Separação inteligente de dependências (React, Firebase)
- **Memoização**: Componentes otimizados para evitar re-renderizações
- **Cache PWA**: Funcionamento offline e carregamento instantâneo

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

- **Frontend**: React 19 + TypeScript + Vite
- **Estilização**: CSS Vanilla com Design System
- **Python Runtime**: Pyodide (WebAssembly)
- **Backend**: Firebase (Auth + Firestore + Hosting)
- **Editor**: Monaco Editor (VS Code)

## 👨‍💻 Equipe

| Nome | Papel |
|------|-------|
| **Alberto Ivo Vieira** | 🚀 Lead Developer |
| **Isaac Andrade** | 🧪 Quality Assurance (QA) |

## 📄 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

---

Feito com 💜 para ensinar programação de forma divertida!
