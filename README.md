# 🐍 PyExplorer

> Aprenda Python de forma divertida e interativa!

[![CI/CD](https://github.com/albertoivo/PyExplorer/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/albertoivo/PyExplorer/actions/workflows/ci-cd.yml)
[![Security](https://github.com/albertoivo/PyExplorer/actions/workflows/security.yml/badge.svg)](https://github.com/albertoivo/PyExplorer/actions/workflows/security.yml)

PyExplorer é um jogo educativo desenvolvido em ReactJS para ensinar programação Python para crianças de 8 a 15 anos. O jogo utiliza Pyodide para executar código Python diretamente no navegador, proporcionando uma experiência completa de aprendizado sem necessidade de instalações.

![PyExplorer](https://img.shields.io/badge/python-kids-yellow?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/react-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/typescript-5.9-blue?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/firebase-hosting-orange?style=for-the-badge&logo=firebase)
![PWA](https://img.shields.io/badge/PWA-ready-brightgreen?style=for-the-badge&logo=pwa)

## ✨ Características

- 🎮 **Interface gamificada** - Mundos, estrelas e conquistas para motivar o aprendizado
- 🐍 **Python no navegador** - Execute código Python real usando Pyodide (WebAssembly)
- 📚 **5 tipos de questões** - Múltipla escolha, V/F, complete código, funções parciais e completas
- 🌍 **7 mundos temáticos** - Comandos básicos, variáveis, decisões, loops, funções, listas e strings
- 👶 **Design para crianças** - Linguagem simples e visual colorido
- 👤 **Modo convidado** - Jogar sem criar conta (progresso salvo localmente)
- 🔥 **Firebase** - Autenticação e armazenamento na nuvem

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

## 🌍 Mundos disponíveis

1. 🚀 **Primeiros Passos** - Comandos básicos (print, comentários)
2. 📦 **Variáveis** - Criação e uso de variáveis
3. 🔀 **Decisões** - if, else, elif
4. 🔄 **Repetição** - for, while, range
5. ✨ **Funções** - Criação e uso de funções
6. 📜 **Listas** - Manipulação de listas
7. 📝 **Strings** - Trabalho com textos

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
| `npm run build` | Cria build de produção |
| `npm run preview` | Visualiza build local |
| `npm run lint` | Executa linting do código |

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
