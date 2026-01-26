# Relatório do Guardião Firebase 🔥

**Data:** 15/10/2023
**Status:** ⚠️ Atenção

## Resumo

A análise revelou que a sincronização entre os tipos TypeScript e as regras do Firestore está, em sua maior parte, robusta e segura. As coleções principais (`users`, `userProgress`) possuem validações estritas que correspondem aos tipos. No entanto, foram identificadas lacunas na validação profunda de objetos aninhados na coleção `gamification`, onde campos listados no `hasOnly` carecem de verificações subsequentes de tipo ou estrutura. Ao contrário do suspeitado, o campo `unlockedWorlds` já está corretamente validado nas regras.

## ✅ Verificações Passaram

- **Coleção `users`:** Todos os campos (`uid`, `displayName`, `avatar`, `email`, `createdAt`, `updatedAt`, `totalScore`, `balance`, `lastLoginAt`) estão corretamente listados e validados nas regras.
- **Campo `unlockedWorlds`:** Confirmado que existe nas regras e é validado como lista (`request.resource.data.unlockedWorlds is list`).
- **Coleção `userProgress`:** Campos sincronizados. Validação de `status` correta. Limites de `score` (0-9999) e `attempts` adequados para o escopo por questão.
- **Coleção `questions`:** Serviços tratam corretamente a serialização de arrays aninhados (`sanitizeForFirestore`). Regras garantem acesso apenas leitura para público e escrita para admin.
- **Tipos de Data:** Conversão consistente entre `Date` (TypeScript) e `Timestamp` (Firestore) em todos os serviços (`saveUser`, `saveGamificationData`, etc.).
- **Segurança:** Regras de `isOwner` aplicadas consistentemente para escrita em dados de usuário.

## ⚠️ Avisos (Ação Sugerida)

### Falta de Validação de Tipo em Campos da Gamificação
- **Localização:** `firestore.rules` (match `/gamification/{userId}`)
- **Descrição:** Diversos campos estão permitidos via `hasOnly`, mas não possuem validação de tipo específica (como `isValidNumber` ou `isValidString`) nas cláusulas subsequentes.
  - `streak.longestStreak` (Deveria ser validado como número)
  - `inventory.equippedFrame` (Deveria ser validado como string)
  - `inventory.equippedTitle` (Deveria ser validado como string)
  - `stats.completedWorldIds` (Deveria ser validado como lista)
- **Impacto:** Possibilidade de gravar tipos incorretos (ex: string onde deveria ser number), podendo causar erros de runtime no frontend ao processar os dados.
- **Sugestão:** Adicionar validações explícitas (`isValidNumber`, `isValidString`, `is list`) para esses campos nas regras.

### Validação Rasa de Objetos Aninhados (Deep Validation)
- **Localização:** `firestore.rules` (match `/gamification/{userId}`)
- **Descrição:** Campos complexos como `achievements`, `activeMissions` e `powerUps.inventory` são validados apenas estruturalmente (`is list` ou `is map`). Não há validação dos campos internos desses objetos (ex: se um achievement possui `id` e `unlockedAt`).
- **Impacto:** Risco de inconsistência de dados se o frontend enviar objetos malformados dentro dessas listas/mapas.
- **Sugestão:** Se a estrutura for rígida, implementar funções de validação profunda nas rules. Caso contrário, reforçar a validação no serviço (`saveGamificationData`) antes do envio.

## ❌ Problemas Críticos

*Nenhum problema crítico de segurança ou inconsistência grave foi encontrado durante esta análise.*

## 📋 Tabela de Correspondência

| Coleção | Campo TypeScript | Campo Rules | Status |
|---------|------------------|-------------|--------|
| users | displayName | displayName | ✅ |
| users | unlockedWorlds | unlockedWorlds | ✅ (Presente e Validado) |
| users | totalScore | totalScore | ✅ |
| userProgress | score | score | ✅ (Limite 0-9999) |
| userProgress | status | status | ✅ |
| gamification | streak.longestStreak | longestStreak | ⚠️ (Sem validação de tipo) |
| gamification | stats.completedWorldIds | completedWorldIds | ⚠️ (Sem validação de tipo) |
| gamification | inventory.equippedFrame | equippedFrame | ⚠️ (Sem validação de tipo) |
