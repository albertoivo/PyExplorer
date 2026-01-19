# Relatório do Guardião Firebase 🔥

**Data:** 16/10/2023
**Status:** ❌ Problemas Críticos

## Resumo

A análise revelou inconsistências importantes entre os tipos TypeScript e as Regras de Segurança, sendo a mais grave um **bug de perda de dados** no serviço de persistência de progresso, onde campos como `stars` e `bestTimeSeconds` são descartados antes de salvar. Além disso, as regras de segurança estão desatualizadas em relação aos novos campos da "Fase 2" (loja e inventário).

## ✅ Verificações Passaram

- [x] **Conversão de Datas:** `Timestamp` ↔ `Date` tratada corretamente nos serviços.
- [x] **Segurança Admin:** Escrita em `questions` restrita a admins.
- [x] **Limites Básicos:** `displayName` (50 chars), `totalScore` (9.999.999) validados corretamente.
- [x] **Serialização:** Arrays aninhados em `questions` (test cases) sanitizados corretamente.
- [x] **Propriedade:** Regras `isOwner()` garantem isolamento de dados do usuário.

## ⚠️ Avisos (Ação Sugerida)

### Falta de Validação: Campos Novos de Usuário
- **Localização:** `firestore.rules` (match `/users/{userId}`)
- **Descrição:** Os campos `inventory`, `equippedAvatar`, `email`, `avatar`, `longestStreak` e `lastActiveDate` existem no tipo `UserData` mas não são validados nas rules.
- **Impacto:** Usuários mal-intencionados podem injetar dados inválidos nestes campos ou inflar inventories.
- **Sugestão:** Adicionar validação de tipo (ex: `inventory is list`, `email is string`).

### Validação Rasa em Gamification
- **Localização:** `firestore.rules` (match `/gamification/{userId}`)
- **Descrição:** As regras verificam se `stats` e `streak` são mapas, mas não validam campos internos críticos como `longestStreak` ou `worldsCompleted`.
- **Impacto:** Possibilidade de burlar estatísticas avançadas sem quebrar o tipo básico.
- **Sugestão:** Expandir a validação dos Maps para checar campos internos (ex: `request.resource.data.streak.longestStreak is number`).

### Inconsistência: UnlockedWorlds
- **Localização:** `firestore.rules` vs `src/types/question.ts`
- **Descrição:** O campo `unlockedWorlds` está presente nas regras (validado como lista), ao contrário da suspeita inicial, mas carece de validação de conteúdo (se os valores são strings válidas de `World`).
- **Sugestão:** Manter como está por enquanto, mas idealmente validar os elementos da lista.

## ❌ Problemas Críticos

### Perda de Dados em `saveProgress`
- **Localização:** `src/firebase/firestore.ts` : linha ~235 (função `saveProgress`)
- **Descrição:** O objeto `dataToSave` é construído manualmente e **ignora** explicitamente os campos `stars` e `bestTimeSeconds`, mesmo eles existindo no tipo `UserProgress` e sendo passados para a função.
- **Impacto:** **Funcionalidade Quebrada.** O sistema de "3 estrelas" e recorde de tempo não está sendo salvo no banco. O usuário sempre vê 0 estrelas ao recarregar.
- **Correção Necessária:** Adicionar `stars` e `bestTimeSeconds` ao objeto `dataToSave` dentro de `saveProgress`.

### Falta de Validação de Estrelas
- **Localização:** `firestore.rules` (match `/userProgress/{progressId}`)
- **Descrição:** Não há regra limitando o campo `stars`.
- **Impacto:** Um usuário pode injetar `stars: 999`, quebrando a UI ou a lógica de gamificação.
- **Correção Necessária:** Adicionar `(!('stars' in request.resource.data) || isValidNumber(request.resource.data.stars, 0, 3))` nas regras.

## 📋 Tabela de Correspondência

| Coleção | Campo TypeScript | Campo Rules | Status |
|---------|------------------|-------------|--------|
| users | displayName | displayName | ✅ |
| users | totalScore | totalScore | ✅ |
| users | unlockedWorlds | unlockedWorlds | ✅ (Existe, validado como list) |
| users | inventory | ❌ ausente | ⚠️ |
| users | equippedAvatar | ❌ ausente | ⚠️ |
| userProgress | score | score | ✅ |
| userProgress | stars | ❌ ausente | ❌ (Crítico) |
| userProgress | bestTimeSeconds | ❌ ausente | ❌ (Crítico) |
| gamification | streak.currentStreak | streak.currentStreak | ✅ |
| gamification | streak.longestStreak | ❌ ausente | ⚠️ |
