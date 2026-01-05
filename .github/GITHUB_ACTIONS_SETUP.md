# Configuração do GitHub Actions para PyExplorer

Este guia explica como configurar o GitHub Actions para deploy automático no Firebase Hosting.

## 📋 Pré-requisitos

- Repositório no GitHub
- Projeto no Firebase (já configurado)
- Firebase CLI instalado localmente

## 🔐 Configurar Secret do Firebase

Para que o GitHub Actions possa fazer deploy no Firebase, você precisa criar uma **Service Account** e adicionar como secret no repositório.

### Passo 1: Gerar a Service Account

Execute o seguinte comando no terminal:

```bash
firebase login:ci
```

Isso abrirá o navegador para autenticação. Após autenticar, você receberá um token.

### Passo 2: Usar Firebase GitHub Action (Recomendado)

A forma mais fácil é usar o comando do Firebase CLI:

```bash
# Na raiz do projeto
firebase init hosting:github
```

Isso irá:
1. Criar automaticamente a Service Account no Google Cloud
2. Adicionar o secret `FIREBASE_SERVICE_ACCOUNT` no seu repositório
3. Configurar os workflows (que já criamos manualmente)

### Passo 3: Configuração Manual (Alternativa)

Se preferir configurar manualmente:

1. Acesse o [Console do Google Cloud](https://console.cloud.google.com/)
2. Selecione o projeto `pyexplorer-cd32d`
3. Vá para **IAM & Admin > Service Accounts**
4. Clique em **Create Service Account**
5. Nome: `github-actions-deploy`
6. Role: `Firebase Hosting Admin`
7. Crie uma chave JSON
8. No GitHub, vá para **Settings > Secrets and variables > Actions**
9. Adicione o secret `FIREBASE_SERVICE_ACCOUNT` com o conteúdo do JSON

## 🚀 Workflows Disponíveis

### CI/CD Pipeline (`ci-cd.yml`)

**Triggers:**
- Push para `main` ou `develop`
- Pull Requests para `main` ou `develop`

**Jobs:**
| Job | Descrição |
|-----|-----------|
| `build` | Build, lint, type-check |
| `deploy-production` | Deploy para produção (apenas push para main) |
| `deploy-preview` | Deploy preview (apenas PRs) |
| `lighthouse` | Auditoria de performance |

### Security & Quality (`security.yml`)

**Triggers:**
- Toda segunda-feira às 9h UTC
- Execução manual

**Jobs:**
| Job | Descrição |
|-----|-----------|
| `audit` | Verificação de vulnerabilidades |
| `outdated` | Verificação de pacotes desatualizados |

## 📊 Visualizando Resultados

### Badges (adicione ao README.md)

```markdown
![CI/CD](https://github.com/albertoivo/PyExplorer/actions/workflows/ci-cd.yml/badge.svg)
![Security](https://github.com/albertoivo/PyExplorer/actions/workflows/security.yml/badge.svg)
```

### Artifacts

Os builds geram artifacts que ficam disponíveis por 7 dias:
- Bundle do aplicativo (`dist/`)
- Relatórios do Lighthouse

## 🔧 Variáveis de Ambiente

| Secret | Descrição |
|--------|-----------|
| `FIREBASE_SERVICE_ACCOUNT` | JSON da Service Account do Firebase |
| `GITHUB_TOKEN` | Automático, gerado pelo GitHub |

## ⚡ Deploy Preview para PRs

Quando você cria um PR, o GitHub Actions automaticamente:
1. Faz build do projeto
2. Deploy para um URL temporário de preview
3. Comenta no PR com o link do preview

Isso permite testar mudanças antes de fazer merge!

## 🐛 Troubleshooting

### Erro de autenticação do Firebase

```
Error: Failed to list Firebase Hosting sites
```

**Solução:** Verifique se o secret `FIREBASE_SERVICE_ACCOUNT` está correto e a Service Account tem permissões adequadas.

### Build falha por tipos TypeScript

```
error TS2xxx: ...
```

**Solução:** Execute `npm run build` localmente para ver os erros detalhados.

### Lighthouse timeout

O Lighthouse pode falhar se o site demorar muito para carregar. Verifique a performance do app.
