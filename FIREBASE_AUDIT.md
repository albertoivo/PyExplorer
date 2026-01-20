# Relatório do Guardião Firebase 🔥

**Data:** 20 de Janeiro de 2026
**Status:** ⚠️ Atenção

## Resumo

A análise revelou que, embora as regras de segurança básicas (leitura/escrita) estejam corretas, há uma lacuna significativa na validação de dados (schema validation) dentro do `firestore.rules`. Muitos campos definidos nos tipos TypeScript (`UserData`, `UserProgress`, `UserGamification`) não possuem validação correspondente nas regras, permitindo potencialmente a gravação de dados inconsistentes ou campos arbitrários. Além disso, existe uma duplicação conceitual do campo `inventory` entre `users` e `gamification`.

## ✅ Verificações Passaram

- **Coleção `questions`**: Regras de segurança corretas (Leitura Pública, Escrita Admin). Campos do TypeScript são serializados corretamente (`questionsService.ts` lida com arrays aninhados).
- **Coleção `users`**: Validações de limites para `displayName` (50 chars), `totalScore`, `balance`, `streak` (0-9999).
- **Coleção `userProgress`**: Validações de `status` (enum correto), `score`, `attempts` e `stars` (0-3).
- **Coleção `gamification`**: Validação estrutural básica para `level` (com limites de XP), `streak` (currentStreak) e `stats` (totais).
- **Conversão de Tipos**: O serviço `firestore.ts` lida corretamente com a conversão `Date` ↔ `Timestamp` e campos opcionais (`undefined` para `null` ou omitido).

## ⚠️ Avisos (Ação Sugerida)

### Campos Ausentes nas Rules (`users`)
- **Localização:** `firestore.rules` (match `/users/{userId}`) vs `src/types/question.ts` (`UserData`)
- **Descrição:** Os campos `avatar`, `email`, `createdAt`, `updatedAt`, `lastActiveDate`, `longestStreak`, `inventory`, `equippedAvatar` existem no TypeScript mas não são validados nas regras.
- **Impacto:** Usuários podem enviar formatos inválidos (ex: número no lugar de string para avatar) ou dados incoerentes.
- **Sugestão:** Adicionar validações `isValidString` e `field is timestamp` para estes campos.

### Campos Ausentes nas Rules (`userProgress`)
- **Localização:** `firestore.rules` (match `/userProgress/{progressId}`) vs `src/types/question.ts` (`UserProgress`)
- **Descrição:** Os campos `bestTimeSeconds`, `lastAttemptAt` e `userAnswer` não são validados.
- **Impacto:** Perda de integridade de dados para métricas de performance.
- **Sugestão:** Adicionar `isValidNumber` para `bestTimeSeconds` e validação de timestamp para `lastAttemptAt`.

### Duplicação de Esquema (`inventory`)
- **Localização:** `src/types/question.ts` (`UserData.inventory`: `string[]`) vs `src/types/gamification.ts` (`UserGamification.inventory`: `UserInventory`)
- **Descrição:** O conceito de inventário existe em dois lugares com tipagens diferentes.
- **Impacto:** Confusão no desenvolvimento e potencial dessincronização de dados.
- **Sugestão:** Centralizar o inventário na coleção `gamification` ou padronizar os tipos.

## ❌ Problemas Críticos

### Ausência de `hasOnly` (Campos Arbitrários)
- **Localização:** `firestore.rules` (Todas as coleções de escrita do usuário)
- **Descrição:** As regras atuais validam campos específicos se presentes, mas não impedem o envio de campos extras desconhecidos (ex: `isAdmin: true` ou dados lixo).
- **Impacto:** Poluição do banco de dados e potencial risco se algum serviço confiar cegamente nos dados do documento.
- **Correção Necessária:** Implementar verificação `hasOnly(['campo1', 'campo2', ...])` ou garantir que o backend/cliente limpe os dados antes de usar.

### Validação Rasa em Objetos Complexos (`gamification`)
- **Localização:** `firestore.rules` (match `/gamification/{userId}`)
- **Descrição:** Campos como `achievements`, `activeMissions` e `powerUps` são validados apenas como `list` ou `map`.
- **Impacto:** Usuários mal-intencionados podem forjar conquistas ou missões completas enviando estruturas JSON manipuladas dentro dessas listas/mapas.
- **Correção Necessária:** Implementar validação profunda (verificar campos internos de cada item da lista) ou mover a lógica de escrita de gamificação sensível para Cloud Functions.

## 📋 Tabela de Correspondência

| Coleção | Campo TypeScript | Campo Rules | Status |
|---------|------------------|-------------|--------|
| **users** | `displayName` | `displayName` | ✅ |
| **users** | `unlockedWorlds` | `unlockedWorlds` | ✅ (Presente) |
| **users** | `avatar` | ❌ ausente | ⚠️ |
| **users** | `inventory` | ❌ ausente | ⚠️ |
| **users** | `longestStreak` | ❌ ausente | ⚠️ |
| **userProgress** | `status` | `status` | ✅ |
| **userProgress** | `stars` | `stars` | ✅ |
| **userProgress** | `userAnswer` | ❌ ausente | ⚠️ |
| **gamification**| `level.currentXP`| `level.currentXP` | ✅ |
| **gamification**| `streak.longest` | ❌ ausente | ⚠️ |
| **gamification**| `achievements` | `achievements` (apenas `is list`) | ❌ (Raso) |
