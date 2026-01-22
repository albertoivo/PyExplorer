# Relatório do Guardião Firebase 🔥

**Data:** 14/10/2023 (Simulada)
**Status:** ⚠️ Atenção

## Resumo

A análise revelou inconsistências importantes entre os tipos TypeScript e as Security Rules, principalmente na duplicação de esquemas entre `UserData` e `UserGamification` e na falta de validação profunda de tipos em objetos aninhados (Maps) nas regras do Firestore. As coleções de questões e progresso estão, em sua maioria, bem sincronizadas.

## ✅ Verificações Passaram

- **Coleção `questions`:** Tipos TypeScript sincronizados com o serviço; regras de segurança adequadas (Admin Write / Public Read).
- **Coleção `users`:** Campo `unlockedWorlds` está presente e validado como lista nas regras (ao contrário da suspeita inicial).
- **Limites:** Validações de tamanho para `displayName`, `streak` e `totalXP` estão coerentes.
- **Segurança:** Uso correto de `isOwner()` e `isAdmin()` para controle de acesso.
- **Conversão de Tipos:** Serviços tratam corretamente a conversão `Timestamp` ↔ `Date`.

## ⚠️ Avisos (Ação Sugerida)

### Falta de Validação de Tipos em `users`
- **Localização:** `firestore.rules` (match `/users/{userId}`)
- **Descrição:** Os campos `longestStreak`, `inventory`, `equippedAvatar` e `lastActiveDate` estão na allowlist `hasOnly`, mas não possuem verificações de tipo específicas (ex: `isValidNumber`, `is list`, `is string`).
- **Impacto:** Permite salvar tipos incorretos (ex: salvar um número em `equippedAvatar` ou string em `longestStreak`).
- **Sugestão:** Adicionar validações explícitas:
  ```javascript
  (!('longestStreak' in request.resource.data) || isValidNumber(request.resource.data.longestStreak, 0, 9999)) &&
  (!('inventory' in request.resource.data) || request.resource.data.inventory is list)
  ```

### Inconsistência de Tipo `UserGamification` (`updatedAt`)
- **Localização:** `src/types/gamification.ts` vs `firestore.rules` vs `src/firebase/firestore.ts`
- **Descrição:** O serviço `saveGamificationData` injeta `updatedAt` e as regras o exigem/permitem, mas o tipo TypeScript `UserGamification` não possui este campo.
- **Impacto:** O código TypeScript não consegue acessar `updatedAt` ao ler os dados, gerando erros de tipo se tentado.
- **Sugestão:** Adicionar `updatedAt: Date;` à interface `UserGamification`.

### Validação Parcial em Objetos Aninhados (`gamification`)
- **Localização:** `firestore.rules` (match `/gamification/{userId}`)
- **Descrição:** Objetos como `stats`, `streak`, `inventory` e `powerUps` têm seus campos listados em `hasOnly`, mas muitos valores internos não têm validação de tipo (ex: `totalPlayTime` em stats, `longestStreak` em streak).
- **Impacto:** Dados corrompidos podem ser salvos dentro dessas estruturas complexas.
- **Sugestão:** Expandir as regras para validar os tipos dos campos aninhados, não apenas sua presença.

### Campo `bestTimeSeconds` sem Validação (`userProgress`)
- **Localização:** `firestore.rules` (match `/userProgress/{progressId}`)
- **Descrição:** O campo está na allowlist mas não tem verificação `isValidNumber`.
- **Impacto:** Risco menor, mas inconsistente com outros campos métricos.
- **Sugestão:** Adicionar `isValidNumber(request.resource.data.bestTimeSeconds, 0, 99999)`.

## ❌ Problemas Críticos

### Duplicação de Esquema (`UserData` vs `UserGamification`)
- **Localização:** `src/types/question.ts` vs `src/types/gamification.ts`
- **Descrição:** Os campos `inventory`, `streak` e `equippedAvatar` existem em ambas as interfaces com estruturas diferentes.
    - `UserData.inventory`: `string[]` (Lista de IDs)
    - `UserGamification.inventory`: Objeto `UserInventory` (com `ownedItems`, `equippedFrame`, etc.)
    - `UserData.streak`: `number`
    - `UserGamification.streak`: Objeto `UserStreak`
- **Impacto:** Risco alto de inconsistência de dados. Atualizar o streak na gamificação não atualiza automaticamente o usuário, criando duas verdades no banco.
- **Correção Necessária:** Unificar a fonte da verdade. Recomenda-se depreciar os campos complexos em `UserData` e usar apenas `UserGamification` para dados de jogo, mantendo `UserData` apenas para perfil básico (auth, display).

## 📋 Tabela de Correspondência

| Coleção | Campo TypeScript | Campo Rules | Status |
|---------|------------------|-------------|--------|
| users | displayName | displayName | ✅ |
| users | unlockedWorlds | unlockedWorlds | ✅ (Presente e validado como List) |
| users | inventory | inventory | ⚠️ (Validado apenas presença, conflito de esquema) |
| users | longestStreak | longestStreak | ⚠️ (Sem validação numérica) |
| userProgress | score | score | ✅ |
| userProgress | bestTimeSeconds | bestTimeSeconds | ⚠️ (Sem validação numérica) |
| gamification | updatedAt | updatedAt | ❌ (Ausente no Tipo TS) |
| gamification | stats.totalPlayTime | stats.totalPlayTime | ⚠️ (Sem validação numérica) |
