# Relatório do Guardião Firebase 🔥

**Data:** 22/05/2024
**Status:** ⚠️ Atenção

## Resumo

A análise revelou que a maioria dos tipos TypeScript e regras do Firestore estão sincronizados, com validações de segurança robustas para propriedade de dados (`isOwner`). No entanto, foram encontradas validações superficiais para estruturas complexas aninhadas na coleção `gamification` e algumas discrepâncias menores entre a documentação esperada e a implementação real (ex: `lastLoginAt`).

## ✅ Verificações Passaram

- **Coleção `questions`**: Rules permitem leitura pública e escrita apenas para admin. Serviço `sanitizeForFirestore` lida corretamente com serialização de arrays aninhados.
- **Coleção `users`**: Campos `uid`, `displayName`, `avatar`, `email`, `createdAt`, `updatedAt`, `totalScore`, `balance` e `unlockedWorlds` estão validados via `hasOnly`.
    - *Nota:* O campo `unlockedWorlds` **está presente** nas regras de segurança, ao contrário do sugerido na checklist inicial.
- **Coleção `userProgress`**: Campos validados corretamente. Status restrito a `not_started`, `in_progress`, `completed`.
- **Limites Numéricos**:
    - `displayName` max 50 chars.
    - `totalScore` até 9.999.999.
    - `streak` até 9.999.
    - `totalXP` até 9.999.999.
- **Segurança**: Funções `isOwner` e `isAdmin` aplicadas corretamente. Usuários não podem alterar dados de outros.

## ⚠️ Avisos (Ação Sugerida)

### Validação Superficial de Objetos Aninhados
- **Localização:** `firestore.rules` (match `/gamification/{userId}`)
- **Descrição:** Os campos `achievements` e `activeMissions` são validados apenas como listas (`is list`), sem verificação da estrutura interna dos objetos contidos.
- **Impacto:** Um usuário mal-intencionado poderia injetar objetos gigantes ou com campos inválidos dentro destas listas, potencialmente burlando a lógica de UI ou causando erros de renderização.
- **Sugestão:** Implementar validação profunda se possível, ou validar via Cloud Functions no `onWrite`.

### Campo `lastLoginAt` Ausente
- **Localização:** `src/types/question.ts` (Interface `UserData`) e `firestore.rules`
- **Descrição:** O campo `lastLoginAt` foi listado como requisito na auditoria, mas não existe na interface TypeScript `UserData` nem nas validações do Firestore.
- **Impacto:** Inconsistência entre a especificação da auditoria e o código. Funcionalidade de rastreio de último login pode estar ausente ou dependendo de `updatedAt`.
- **Sugestão:** Adicionar `lastLoginAt` à interface `UserData` e às regras `hasOnly` se for um requisito de negócio, ou remover da checklist.

### Limite de Score em `userProgress`
- **Localização:** `firestore.rules` (match `/userProgress/{progressId}`)
- **Descrição:** A regra valida `score` até 9.999 (`isValidNumber(..., 0, 9999)`), enquanto a checklist sugeria verificar limites de 0-1.000.
- **Impacto:** Baixo risco, apenas uma divergência de especificação. 9.999 parece um limite seguro e adequado.
- **Sugestão:** Atualizar a documentação para refletir o limite real de 9.999.

### Validação de Formato de Datas em Strings
- **Localização:** `firestore.rules` (match `/gamification/{userId}`)
- **Descrição:** Campos como `streak.lastActivityDate` e `powerUps.lastResetDate` são strings (YYYY-MM-DD) no TypeScript, mas nas rules não há validação de formato (apenas `hasOnly` permite o campo).
- **Impacto:** Possibilidade de salvar datas inválidas.
- **Sugestão:** Adicionar validação regex para formato de data `YYYY-MM-DD` nas rules.

## ❌ Problemas Críticos

*Nenhum problema crítico de segurança (bypass de auth ou vazamento de dados) foi encontrado.*

## 📋 Tabela de Correspondência

| Coleção | Campo TypeScript | Campo Rules | Status |
|---------|------------------|-------------|--------|
| users | displayName | displayName | ✅ |
| users | unlockedWorlds | unlockedWorlds | ✅ (Presente) |
| users | balance | balance | ✅ |
| users | (Ausente) | lastLoginAt | ⚠️ (Requisitado na auditoria) |
| userProgress | score | score | ✅ (Limite 9999) |
| gamification | achievements | achievements | ⚠️ (Sem validação profunda) |
| gamification | inventory.equippedFrame | inventory.equippedFrame | ✅ |
