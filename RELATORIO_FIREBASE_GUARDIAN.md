# Relatório do Guardião Firebase 🔥

**Data:** 28/01/2026
**Status:** ✅ OK

## Resumo

A análise atual dos arquivos revela um alto nível de consistência entre os tipos TypeScript, as regras do Firestore e os serviços. Diferente das suspeitas levantadas na missão, campos críticos como `unlockedWorlds` estão presentes e validados. Algumas validações estruturais profundas (arrays de objetos) são rasas devido a limitações do Firestore, mas os riscos são mitigados pela lógica dos serviços.

## ✅ Verificações Passaram

- **Sincronização `users`:** Todos os campos de `UserData` (incluindo `unlockedWorlds` e `lastLoginAt`) estão validados em `firestore.rules` com `hasOnly`.
- **Sincronização `questions`:** Tipos críticos (`type`, `world`, `difficulty`) são validados contra enums nas regras. Leitura pública e escrita admin estão corretas.
- **Sincronização `gamification`:** Estruturas complexas (`streak`, `stats`, `powerUps`) estão mapeadas e validadas (keys e tipos) nas regras.
- **Limites Numéricos:** `totalScore` (9.999.999), `streak` (9.999), e `attempts` (9.999) possuem margens seguras e consistentes.
- **Segurança:** Regras de `isOwner` garantem isolamento de dados de usuário e progresso.

## ⚠️ Avisos (Ação Sugerida)

### Validação Rasa de Listas em `gamification`
- **Localização:** `firestore.rules` (match `/gamification/{userId}`)
- **Descrição:** Campos como `achievements` e `activeMissions` são validados apenas como listas (`isValidList`), sem verificação da estrutura dos objetos internos.
- **Impacto:** Risco teórico de injeção de dados malformados nessas listas por usuários autenticados (se bypassarem o cliente).
- **Sugestão:** Aceitável dada a complexidade do Firestore Rules. Manter validação forte no `questionsService.ts` (já existente em `validateGamificationData`).

### Validação Rasa de `unlockedWorlds`
- **Localização:** `firestore.rules` (match `/users/{userId}`)
- **Descrição:** `unlockedWorlds` é validado como lista de tamanho 1000, mas os elementos individuais não são verificados contra a lista de mundos permitidos (enum `World`).
- **Impacto:** Possibilidade de inserir strings arbitrárias como "mundos".
- **Sugestão:** Adicionar validação de elementos se crítico, ou confiar na validação do serviço `unlockWorld`.

### Validação Aberta de `questions`
- **Localização:** `firestore.rules` (match `/questions/{questionId}`)
- **Descrição:** A regra de escrita valida campos obrigatórios, mas **não usa `hasOnly`**.
- **Impacto:** Admins podem acidentalmente salvar campos com typo (ex: `points` vs `score`) ou campos extras não documentados.
- **Sugestão:** Adicionar `hasOnly` à regra de admin se desejar esquema estrito.

## ❌ Problemas Críticos

*Nenhum problema crítico encontrado.*

## 📋 Tabela de Correspondência

| Coleção | Campo TypeScript | Campo Rules | Status |
|---------|------------------|-------------|--------|
| users | displayName | displayName | ✅ |
| users | unlockedWorlds | unlockedWorlds | ✅ (Presente) |
| users | lastLoginAt | lastLoginAt | ✅ (Presente) |
| userProgress | score | score (0-9999) | ✅ |
| gamification | achievements | achievements | ⚠️ (Validação rasa) |
| gamification | activeMissions | activeMissions | ⚠️ (Validação rasa) |
