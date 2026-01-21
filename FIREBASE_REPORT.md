# Relatório do Guardião Firebase 🔥

**Data:** 24/10/2023
**Status:** ⚠️ Atenção

## Resumo

A auditoria revelou que, embora as regras de segurança básicas e de propriedade estejam corretas, existem lacunas significativas na validação de tipos e limites dentro das `firestore.rules`, além de inconsistências entre os tipos TypeScript e o que é persistido no Firestore, especialmente nas coleções de `gamification` e `users`.

## ✅ Verificações Passaram

- **Propriedade de Dados:** Regras garantem corretamente que usuários só leem/escrevem seus próprios dados (`isOwner`).
- **Limites Críticos:** Campos como `totalScore` (users) e `score` (progress) possuem validação numérica adequada.
- **Campos Obrigatórios:** A validação de campos permitidos (`hasOnly`) está implementada corretamente para todas as coleções principais.
- **UnlockedWorlds:** Ao contrário da suspeita inicial, o campo `unlockedWorlds` está presente e validado como lista nas regras da coleção `users`.
- **Validação de Status:** O status em `userProgress` é estritamente validado contra os valores permitidos.

## ⚠️ Avisos (Ação Sugerida)

### Falta de Validação de Tipos em `users`
- **Localização:** `firestore.rules` (coleção `users`)
- **Descrição:** Campos como `longestStreak`, `inventory`, `equippedAvatar` e `lastActiveDate` estão na lista de permitidos (`hasOnly`), mas não possuem verificações de tipo (ex: `is number`, `is list`, `is string`).
- **Impacto:** Permite que dados malformados (ex: uma string no lugar de número) sejam salvos, podendo quebrar o frontend.
- **Sugestão:** Adicionar `isValidNumber` e `isValidString` para esses campos nas regras.

### Inconsistência de Schema em `gamification`
- **Localização:** `src/types/gamification.ts` vs `firestore.rules`
- **Descrição:** O tipo TypeScript `UserGamification` não possui o campo `updatedAt`, mas as regras exigem (ou permitem) e o serviço `saveGamificationData` o adiciona automaticamente.
- **Impacto:** O tipo TypeScript não reflete a realidade do banco de dados, o que pode causar confusão ao ler os dados de volta.
- **Sugestão:** Adicionar `updatedAt?: Date` à interface `UserGamification`.

### Validação Profunda Incompleta em `gamification`
- **Localização:** `firestore.rules` (coleção `gamification`)
- **Descrição:** Objetos aninhados como `streak` e `stats` têm validação parcial. Por exemplo, `stats.totalQuestionsCompleted` é validado, mas `stats.totalPlayTime` não tem verificação de tipo/limite nas regras.
- **Impacto:** Risco de inconsistência em métricas secundárias de gamificação.
- **Sugestão:** Expandir a validação dentro dos mapas de `gamification` para cobrir todos os campos numéricos.

### Falta de Validação Numérica em `userProgress`
- **Localização:** `firestore.rules` (coleção `userProgress`)
- **Descrição:** O campo `bestTimeSeconds` é permitido mas não tem verificação `isValidNumber`.
- **Impacto:** Possibilidade de salvar valores não numéricos.
- **Sugestão:** Adicionar verificação `isValidNumber(request.resource.data.bestTimeSeconds, 0, 9999)`.

### Duplicidade Semântica de Inventário
- **Localização:** `users` vs `gamification`
- **Descrição:** Existe um campo `inventory` (array de strings) em `users` e outro `inventory` (objeto complexo) em `gamification`.
- **Impacto:** Confusão sobre qual é a "fonte da verdade" para os itens do usuário.
- **Sugestão:** Consolidar o inventário em apenas uma coleção ou documentar claramente a distinção (ex: `users.inventory` como legacy ou resumo).

## ❌ Problemas Críticos

Não foram encontrados problemas críticos de segurança (bypass de auth ou vazamento de dados). A segurança de acesso está robusta.

## 📋 Tabela de Correspondência

| Coleção | Campo TypeScript | Campo Rules | Status |
|---------|------------------|-------------|--------|
| users | displayName | displayName | ✅ Validado |
| users | totalScore | totalScore | ✅ Validado |
| users | unlockedWorlds | unlockedWorlds | ✅ (Presente e validado como lista) |
| users | inventory | inventory | ⚠️ Sem validação de tipo |
| users | longestStreak | longestStreak | ⚠️ Sem validação de tipo |
| users | lastActiveDate | lastActiveDate | ⚠️ Sem validação de tipo |
| userProgress | score | score | ✅ Validado (0-9999) |
| userProgress | bestTimeSeconds | bestTimeSeconds | ⚠️ Sem validação de tipo |
| gamification | updatedAt | updatedAt | ⚠️ Ausente no TS |
| gamification | stats | stats | ⚠️ Validação parcial |
| questions | points | - | ⚠️ Sem validação (Admin only) |
