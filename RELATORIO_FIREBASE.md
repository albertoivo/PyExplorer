# Relatório do Guardião Firebase 🔥

**Data:** 25/10/2023
**Status:** ⚠️ Atenção

## Resumo

A análise identificou que a maioria das inconsistências críticas foi mitigada pelo código do serviço (que remove campos depreciados) ou por atualizações de tipagem (como `updatedAt` em Gamification). No entanto, as **Firestore Security Rules** permanecem permissivas demais em relação a validações de tipos para campos depreciados e estruturas aninhadas complexas, criando um risco potencial de integridade de dados se acessados por clientes não oficiais.

## ✅ Verificações Passaram

- **Coleção `questions`:**
    - Campos sincronizados entre TypeScript (`QuestionDocument`) e Service (`questionsService.ts`).
    - Regras de segurança corretas: Leitura pública, Escrita apenas Admin.
- **Coleção `users`:**
    - Campo `unlockedWorlds` **está presente** e validado como lista nas regras (contrariando a suspeita inicial de ausência).
    - Limites de `displayName` (50 chars), `streak` (9999) e `totalXP` (9999999) estão consistentes.
    - Segurança de acesso (`isOwner`) implementada corretamente.
- **Coleção `userProgress`:**
    - Campos e Status (`not_started`, `in_progress`, `completed`) validados.
    - Limites de Score (9999) e Attempts (9999) adequados.
- **Tipagem:**
    - Conversão de datas (`Timestamp` ↔ `Date`) tratada corretamente nos serviços.
    - `UserGamification` no TypeScript agora inclui `updatedAt`, resolvendo inconsistência anterior.

## ⚠️ Avisos (Ação Sugerida)

### Validação Ausente para Campos Depreciados (`users`)
- **Localização:** `firestore.rules` (match `/users/{userId}`)
- **Descrição:** As regras permitem a escrita dos campos `longestStreak`, `inventory`, `equippedAvatar` e `lastActiveDate` (via `hasOnly`), mas **não validam seus tipos**. O serviço `saveUser` remove esses campos antes de salvar, mas as regras ainda os aceitam se enviados diretamente.
- **Impacto:** Um cliente malicioso ou bug pode salvar dados de tipo incorreto (ex: string em `longestStreak`), sujando o banco.
- **Sugestão:** Remover esses campos do `hasOnly` nas regras se eles não devem mais ser escritos, ou adicionar validação de tipo (`isValidNumber`, `is string`).

### Validação Rasa em Objetos Aninhados (`gamification`)
- **Localização:** `firestore.rules` (match `/gamification/{userId}`)
- **Descrição:** As regras verificam se `achievements` e `activeMissions` são listas, mas **não validam a estrutura dos objetos dentro dessas listas**.
- **Impacto:** É possível salvar conquistas ou missões com formato inválido (ex: faltando `id` ou `reward`), o que quebraria o frontend ao carregar.
- **Sugestão:** Devido a limitações do Firestore Rules em iterar listas, a mitigação ideal é garantir validação rigorosa no Cloud Functions ou manter a validação forte no client-side (atual).

### Campo `bestTimeSeconds` sem Validação (`userProgress`)
- **Localização:** `firestore.rules` (match `/userProgress/{progressId}`)
- **Descrição:** O campo `bestTimeSeconds` é permitido, mas não possui verificação `isValidNumber` como os outros campos métricos (`score`, `stars`).
- **Impacto:** Risco menor de integridade.
- **Sugestão:** Adicionar `(!('bestTimeSeconds' in request.resource.data) || isValidNumber(request.resource.data.bestTimeSeconds, 0, 99999))`.

## ❌ Problemas Críticos

### Duplicação de Esquema (`UserData` vs `UserGamification`)
- **Localização:** `src/types/question.ts` vs `src/types/gamification.ts`
- **Descrição:** Existe uma duplicação conceitual onde `inventory`, `streak` e `equippedAvatar` existem em `UserData` (como primitivos/depreciados) e em `UserGamification` (como objetos complexos).
- **Impacto:** O serviço `saveUser` explicitamente remove esses campos de `UserData` para evitar sobrescrever dados da gamificação. Isso cria uma "armadilha" de manutenção: se alguém remover a lógica de exclusão no serviço, os dados da gamificação podem ser corrompidos ou desincronizados.
- **Correção Necessária:** Concluir a migração removendo definitivamente esses campos da interface `UserData` no TypeScript e das `firestore.rules`.

## 📋 Tabela de Correspondência

| Coleção | Campo TypeScript | Campo Rules | Status |
|---------|------------------|-------------|--------|
| users | displayName | displayName | ✅ |
| users | unlockedWorlds | unlockedWorlds | ✅ (Presente e validado como List) |
| users | inventory | inventory | ⚠️ (Permitido na Rule, Depreciado no TS) |
| users | longestStreak | longestStreak | ⚠️ (Permitido sem validação de tipo) |
| userProgress | score | score | ✅ |
| userProgress | bestTimeSeconds | bestTimeSeconds | ⚠️ (Sem validação numérica) |
| gamification | updatedAt | updatedAt | ✅ (Presente no TS e Rules) |
| gamification | achievements | achievements | ⚠️ (Validação rasa de lista) |
| gamification | stats.completedWorldIds | stats.completedWorldIds | ⚠️ (Sem validação de tipo List) |
