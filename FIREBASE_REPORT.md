# Relatório do Guardião Firebase 🔥

**Data:** 16/10/2023 (Simulada)
**Status:** ❌ Problemas Críticos

## Resumo

A análise revelou falhas críticas de validação na coleção `gamification` (permitindo injeção de dados arbitrários) e inconsistências na definição de tipos de usuário (`users`) entre TypeScript e Firestore Rules. Embora a segurança de propriedade (`isOwner`) esteja ativa, a integridade dos dados não está garantida.

## ✅ Verificações Passaram

- **Sincronização de Campos (Questions):** Os campos definidos em `QuestionDocument` (TS) correspondem aos utilizados no `questionsService.ts` para serialização e desserialização.
- **Sincronização de Datas:** Os serviços (`firestore.ts`, `questionsService.ts`) convertem corretamente `Date` ↔ `Timestamp`.
- **Limites Básicos:** `displayName` (50 chars), `totalScore` e `balance` (999999) estão validados corretamente nas Rules.
- **Segurança de Acesso:** Regras de `isOwner` e `isAuthenticated` estão implementadas corretamente para todas as coleções.
- **Serialização de Arrays:** `questionsService.ts` trata corretamente arrays aninhados (tests inputs) que o Firestore não suporta nativamente.
- **Campos de Progresso:** `score` e `attempts` estão limitados adequadamente na coleção `userProgress`.

## ⚠️ Avisos (Ação Sugerida)

### Campo `unlockedWorlds` sem Validação de Conteúdo
- **Localização:** `firestore.rules` (users collection)
- **Descrição:** A análise do código (`firestore.rules`) confirmou que o campo `unlockedWorlds` está presente em `allowedKeys`, ao contrário da suspeita de que estaria ausente. No entanto, **não há validação** de que seu conteúdo seja um array de strings ou que contenha apenas valores válidos (`World` type).
- **Impacto:** Um usuário pode enviar `unlockedWorlds: "invalid"` ou `[1, 2, 3]` e corromper o frontend que espera `string[]`.
- **Sugestão:** Adicionar validação de tipo se possível, ou confiar na validação da aplicação (menos seguro).

### Inconsistência `lastLoginAt` vs `lastActiveDate`
- **Localização:** `src/types/question.ts` vs `firestore.rules`
- **Descrição:** `firestore.rules` permite `lastLoginAt`, mas este campo **não existe** na interface `UserData` do TypeScript (que usa `lastActiveDate`).
- **Impacto:** `lastLoginAt` é um campo "fantasma" permitido no banco mas não usado/tipado no código, gerando confusão.
- **Sugestão:** Remover `lastLoginAt` das Rules se não for usado, ou adicioná-lo ao tipo `UserData`.

### Campo `streak` em `users` sem Limite
- **Localização:** `firestore.rules` (users collection)
- **Descrição:** O campo `streak` é permitido em `users`, mas não possui validação de range (`isValidNumber(..., 0, 9999)`), diferentemente de `totalScore`.
- **Impacto:** Risco menor, mas permite valores negativos ou absurdos.
- **Sugestão:** Adicionar `isValidNumber(request.resource.data.get('streak', 0), 0, 9999)`.

## ❌ Problemas Críticos

### Falta de Validação na Atualização de `gamification`
- **Localização:** `firestore.rules:108` (`allow update: if isOwner(userId);`)
- **Descrição:** A regra de `update` para `gamification` permite **qualquer** estrutura de dados. Não há validação de esquema, campos permitidos ou tipos.
- **Impacto:** Um usuário mal-intencionado pode apagar todo seu progresso, injetar campos gigantes para aumentar custos, ou alterar sua estrutura para causar erros no frontend.
- **Correção Necessária:** Implementar validação `hasOnly` ou checagem de campos críticos no `update`, similar à coleção `users`.

### Limites Ausentes para `streak` e `totalXP` (Gamificação)
- **Localização:** `firestore.rules` (gamification match)
- **Descrição:** Os campos `streak` (dentro do objeto complexo) e `totalXP` (nível) não possuem nenhuma validação de limites nas Rules, violando os requisitos de segurança esperados.
- **Impacto:** Usuários podem setar `streak: 9999999` ou `totalXP: 9999999` via console do navegador.
- **Correção Necessária:** Devido à estrutura aninhada complexa de `UserGamification` (`level.totalXP`, `streak.currentStreak`), é difícil validar profundamente com Rules simples. Recomenda-se mover dados críticos para campos de topo ou simplificar a estrutura para validação.

### Campo `lastAttemptAt` Não Validado
- **Localização:** `firestore.rules` (userProgress)
- **Descrição:** O campo `lastAttemptAt` existe no TypeScript e é salvo pelo serviço, mas as Rules ignoram sua validação.
- **Impacto:** Baixo, mas inconsistente com a rigidez de outros campos.
- **Correção Necessária:** Adicionar validação de timestamp (`request.resource.data.lastAttemptAt is timestamp`).

## 📋 Tabela de Correspondência

| Coleção | Campo TypeScript | Campo Rules | Status |
|---------|------------------|-------------|--------|
| users | `displayName` | `displayName` | ✅ OK |
| users | `unlockedWorlds` | `allowedKeys` | ⚠️ Presente, sem validação de tipo |
| users | `lastLoginAt` (missing) | `lastLoginAt` | ⚠️ Inconsistência (Rules > TS) |
| users | `streak` | `streak` | ⚠️ Presente, sem limite numérico |
| gamification | `level.totalXP` | ❌ Ausente | ❌ Crítico |
| gamification | `streak.currentStreak` | ❌ Ausente | ❌ Crítico |
| userProgress | `lastAttemptAt` | ❌ Ausente | ⚠️ Ausente nas validações |
