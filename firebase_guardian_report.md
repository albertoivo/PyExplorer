# Relatório do Guardião Firebase 🔥

**Data:** 14/10/2023
**Status:** ⚠️ Atenção

## Resumo

A análise revelou que, embora a estrutura dos serviços e tipos TypeScript esteja alinhada em sua maior parte, as **regras de segurança do Firestore (Firestore Security Rules)** estão significativamente mais permissivas do que o esperado. Muitas validações mencionadas como requisitos (como verificação de campos com `hasOnly()` e limites de valores em gamificação) **não existem** no arquivo `firestore.rules` atual, delegando a integridade dos dados inteiramente ao frontend.

## ✅ Verificações Passaram

- **Sincronização de Campos (Questions):** O serviço `questionsService.ts` serializa e desserializa corretamente os campos de `QuestionDocument`, incluindo o tratamento de arrays aninhados em `tests`.
- **Permissões de Acesso (Geral):**
    - `questions`: Leitura pública, escrita apenas Admin.
    - `users`, `userProgress`, `leaderboard`, `gamification`: Leitura/Escrita restrita ao dono (owner) ou Admin.
- **Validação de Score (Leaderboard):** O campo `totalScore` na coleção `leaderboard` está validado entre 0 e 9.999.999.
- **Validação Básica de Progresso:** A coleção `userProgress` valida que o `status` seja um dos valores permitidos e o `score` esteja entre 0-9999.
- **Conversão de Tipos:** Os serviços lidam corretamente com a conversão `Date` <-> `Timestamp`.

## ⚠️ Avisos (Ação Sugerida)

### Validação de Campos em `userProgress` Incompleta
- **Localização:** `firestore.rules:79` (match `/userProgress/{progressId}`)
- **Descrição:** As regras validam `status` e `score`, mas ignoram `attempts` e `lastAttemptAt`, que existem no tipo `UserProgress`.
- **Impacto:** Usuários podem enviar valores arbitrários para tentativas ou datas, embora o risco de segurança seja baixo.
- **Sugestão:** Adicionar validação para `attempts` (ex: `isValidNumber(data.attempts, 0, 9999)`) e verificar se `lastAttemptAt` é um Timestamp.

### Inconsistência de Campos de Data (`users`)
- **Localização:** `src/types/question.ts` vs Prompt
- **Descrição:** O prompt menciona verificar `lastLoginAt`, mas o tipo TypeScript `UserData` define `lastActiveDate`.
- **Impacto:** Potencial confusão na nomenclatura de campos.
- **Sugestão:** Padronizar para `lastActiveDate` em todos os lugares ou adicionar `lastLoginAt` ao tipo se for uma propriedade distinta.

## ❌ Problemas Críticos

### Ausência Total de Schema Validation em `users`
- **Localização:** `firestore.rules:49` (match `/users/{userId}`)
- **Descrição:** O comentário no arquivo diz explicitamente "Removida validação estrita de campos". Não há uso de `hasOnly()`, ao contrário do que se esperava na verificação.
- **Impacto:** Usuários maliciosos podem injetar quaisquer campos no seu documento de usuário (ex: `isAdmin: true`, embora a função `isAdmin()` verifique o token e email, isso polui o banco). Campos obrigatórios como `unlockedWorlds` não são verificados.
- **Correção Necessária:** Reintroduzir validação de schema usando `keys().hasOnly([...])` ou `hasAll([...])` para garantir a integridade dos dados vitais.

### Falta de Validação em `gamification` (Risco de Cheat)
- **Localização:** `firestore.rules:61` (match `/gamification/{userId}`)
- **Descrição:** **Não há nenhuma validação de dados** nesta coleção. As regras de limite para `streak` e `totalXP` mencionadas no prompt não existem.
- **Impacto:** Um usuário pode enviar uma requisição direta para o Firestore definindo seu `level` para 100, `streak` para 9999 e desbloquear todas as conquistas, quebrando a economia do jogo.
- **Correção Necessária:** Implementar validações estritas para `level`, `streak` e, idealmente, impedir a escrita direta de `achievements` complexos sem uma Cloud Function, ou validar profundamente a estrutura se possível (embora difícil em regras). Pelo menos validar os limites numéricos de `streak` e `xp`.

## 📋 Tabela de Correspondência

| Coleção | Campo TypeScript | Campo Rules | Status |
|---------|------------------|-------------|--------|
| questions | (todos) | (apenas permissão) | ✅ (Admin write) |
| users | displayName | ❌ ausente | ⚠️ (Sem validação) |
| users | unlockedWorlds | ❌ ausente | ⚠️ (Sem validação) |
| users | totalScore | ❌ ausente | ⚠️ (Validado apenas em `leaderboard`) |
| userProgress | status | status | ✅ |
| userProgress | score | score (0-9999) | ✅ |
| userProgress | attempts | ❌ ausente | ⚠️ |
| gamification | streak | ❌ ausente | ❌ (Crítico) |
| gamification | level/totalXP | ❌ ausente | ❌ (Crítico) |
| leaderboard | totalScore | totalScore | ✅ |
