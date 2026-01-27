# Relatório do Guardião Firebase 🔥

**Data:** 27 de Outubro de 2024
**Status:** ⚠️ Atenção

## Resumo

A análise revelou que as regras de segurança do Firestore estão, em sua maioria, bem sincronizadas com os tipos TypeScript, garantindo integridade básica dos dados. No entanto, existem lacunas importantes na validação de estruturas aninhadas (como conquistas e missões) e na coleção de questões, que depende inteiramente da confiança no admin. Uma inconsistência funcional foi encontrada no Leaderboard (falta do campo `level`).

## ✅ Verificações Passaram

- **Coleção `users`**:
  - Os campos principais (`uid`, `displayName`, `avatar`, `email`, `createdAt`, `updatedAt`, `totalScore`, `lastLoginAt`) estão corretamente validados e tipados.
  - **Nota:** O campo `unlockedWorlds` está **presente** e validado como lista nas regras (`hasOnly` e check `is list`), garantindo consistência com `UserData`.
  - O campo `balance` também está corretamente validado.
  - Conversões de `Date` <-> `Timestamp` são tratadas corretamente no serviço `firestore.ts`.

- **Coleção `userProgress`**:
  - Todos os campos de `UserProgress` (`uid`, `questionId`, `status`, `score`, `stars`, `attempts`, `bestTimeSeconds`, `lastAttemptAt`, `userAnswer`) estão na allowlist `hasOnly`.
  - Os valores de `status` são estritamente validados contra os literais do TypeScript.
  - Limites de `score` (0-9999) e `attempts` (0-9999) são adequados e seguros.

- **Coleção `gamification`**:
  - A estrutura macro (`level`, `streak`, `achievements`, `activeMissions`, `inventory`, `powerUps`, `stats`) é validada.
  - Validações profundas para objetos como `level`, `streak`, `inventory` e `powerUps` estão corretas e sincronizadas com os tipos.
  - O campo `stats` tem todos os seus subcampos (ex: `consecutiveFastAnswers`, `completedWorldIds`) validados corretamente.

- **Segurança**:
  - O acesso é restrito corretamente via `isOwner()` para dados sensíveis e `isAdmin()` para dados globais/configuração.

## ⚠️ Avisos (Ação Sugerida)

### Validação de Schema da Coleção `questions`
- **Localização:** `firestore.rules` (match `/questions/{questionId}`)
- **Descrição:** A coleção `questions` permite escrita por admins (`if isAdmin()`), mas **não valida** se os dados escritos correspondem à interface `QuestionDocument`. Atualmente, qualquer JSON pode ser salvo se for por um admin.
- **Impacto:** Risco de inconsistência de dados se o admin (ou script de seed) contiver bugs, quebrando o frontend que espera campos obrigatórios.
- **Sugestão:** Implementar validação `hasOnly` e checagem de tipos para campos essenciais (`type`, `world`, `difficulty`, `prompt`, `correctBool`/`options`) dentro das rules, similar ao que é feito em `users`.

### Estruturas Aninhadas em `gamification` (Listas Opacas)
- **Localização:** `firestore.rules` (coleção `gamification`, campos `achievements` e `activeMissions`)
- **Descrição:** As regras validam apenas que `achievements` e `activeMissions` são listas (`is list`), mas não validam a estrutura dos objetos dentro dessas listas (ex: `achievementId`, `unlockedAt` em `UserAchievement`).
- **Impacto:** É possível salvar objetos malformados dentro dessas listas, causando erros de runtime no frontend ao tentar acessar propriedades inexistentes.
- **Sugestão:** Devido às limitações do Firestore Rules para iterar listas, a validação deve ser reforçada no serviço (`firestore.ts`) com schemas runtime (ex: Zod) antes do envio, já que as Rules não conseguem validar profundamente arrays de objetos.

### Campo `level` Ausente no Leaderboard
- **Localização:** `firestore.rules` (coleção `leaderboard`) e `src/firebase/firestore.ts` (`updateLeaderboard`)
- **Descrição:** A interface TypeScript `LeaderboardEntry` possui o campo `level`, mas este campo **não existe** na coleção `leaderboard` do Firestore e nem é salvo pela função `updateLeaderboard`.
- **Impacto:** O frontend que exibir o Leaderboard não terá acesso ao nível do usuário, ou mostrará valor padrão (0), causando inconsistência visual.
- **Sugestão:** Adicionar o campo `level` na allowlist `hasOnly` da regra `leaderboard` e atualizar `updateLeaderboard` para salvar `userData.level` (obtido de `gamification`).

### Inconsistência de Nomenclatura (Leaderboard)
- **Localização:** `src/types/gamification.ts` vs `firestore.rules`
- **Descrição:** A interface `LeaderboardEntry` usa o nome `score`, enquanto o Firestore e `UserData` usam `totalScore`.
- **Impacto:** Confusão no desenvolvimento e necessidade de mapeamento manual.
- **Sugestão:** Padronizar para `totalScore` na interface `LeaderboardEntry` ou manter o mapeamento explícito no serviço.

## ❌ Problemas Críticos

*Nenhum problema crítico de segurança (bypass de auth) ou perda de dados iminente foi encontrado.*

## 📋 Tabela de Correspondência

| Coleção | Campo TypeScript | Campo Rules | Status |
|---------|------------------|-------------|--------|
| users | displayName | displayName | ✅ |
| users | unlockedWorlds | unlockedWorlds | ✅ (Presente e validado como lista) |
| users | balance | balance | ✅ |
| questions | (Todo Schema) | ❌ (Sem validação) | ⚠️ Apenas Admin |
| gamification | achievements[].id | ❌ (Sem deep check) | ⚠️ Validação rasa |
| gamification | stats.completedWorldIds | completedWorldIds | ✅ |
| leaderboard | level | ❌ ausente | ⚠️ |
| userProgress | score | score (0-9999) | ✅ |
