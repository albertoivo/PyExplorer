# Relatório do Guardião Firebase 🔥

**Data:** 25/10/2023 (Atualizado)
**Status:** ⚠️ Atenção

## Resumo

A análise revelou inconsistências entre a documentação anterior (`RELATORIO_FIREBASE.md`), o código atual e as especificações da missão. O campo `lastLoginAt` está ausente em toda a stack, apesar de solicitado. O código de `saveUser` mantém lógica de limpeza depreciada contradizendo o relatório anterior. `unlockedWorlds` está corretamente validado nas regras.

## ✅ Verificações Passaram

- **Sincronização `questions`:** Campos TS correspondem ao serviço; Rules (leitura pública/escrita admin) adequadas.
- **Validação `unlockedWorlds`:** O campo está presente e validado como lista em `firestore.rules` (ao contrário da suspeita levantada na missão).
- **Limites Numéricos:** `displayName`, `totalScore`, `attempts`, `streak` possuem limites adequados.
- **Segurança:** Regras de `isOwner` e validação de escrita estrita (`hasOnly`) implementadas.

## ⚠️ Avisos (Ação Sugerida)

### Campo `lastLoginAt` Ausente
- **Localização:** `src/types/question.ts` (UserData) e `firestore.rules` (users)
- **Descrição:** O campo `lastLoginAt` foi listado como requisito na missão, mas não existe na interface TypeScript nem nas regras de segurança.
- **Impacto:** Funcionalidade de rastreamento de login pode não funcionar ou dados podem ser rejeitados se enviados.
- **Sugestão:** Adicionar `lastLoginAt: Date` em `UserData` e `isValidTimestamp(request.resource.data.lastLoginAt)` em `firestore.rules`.

### Inconsistência Documental em `saveUser`
- **Localização:** `src/firebase/firestore.ts` (linha ~135) vs `RELATORIO_FIREBASE.md`
- **Descrição:** O relatório anterior afirma que a lógica de limpeza de campos depreciados foi removida, mas o código `saveUser` ainda executa `streak: deleteField()`, etc.
- **Impacto:** Confusão na manutenção. O código atual está correto para garantir a integridade com `hasOnly`, mas o relatório está desatualizado.
- **Sugestão:** Atualizar o relatório (feito aqui) ou refatorar se a limpeza não for mais necessária (provavelmente é necessária devido ao `hasOnly`).

### Validação Rasa de `gamification`
- **Localização:** `firestore.rules` (match `/gamification/{userId}`)
- **Descrição:** `achievements` e `activeMissions` são validados apenas como listas (`is list`), sem verificação da estrutura interna.
- **Impacto:** Um cliente malicioso poderia injetar objetos com formato inválido nessas listas.
- **Sugestão:** Implementar validação estrutural se possível, ou confiar na validação do serviço (risco aceito).

### Limite de Score em `userProgress`
- **Localização:** `firestore.rules`
- **Descrição:** A regra permite score 0-9999. A verificação solicitada questionava o limite 0-1000.
- **Impacto:** Baixo. O limite atual (9999) é mais permissivo e seguro para pontuações altas.
- **Sugestão:** Manter 9999 ou ajustar se houver requisito estrito de negócio para 1000.

## ❌ Problemas Críticos

*Nenhum problema crítico de segurança imediata bloqueante encontrado, mas a ausência de `lastLoginAt` pode ser bloqueante para novas features.*

## 📋 Tabela de Correspondência

| Coleção | Campo TypeScript | Campo Rules | Status |
|---------|------------------|-------------|--------|
| users | displayName | displayName | ✅ |
| users | unlockedWorlds | unlockedWorlds | ✅ (Presente) |
| users | lastLoginAt | ❌ ausente | ⚠️ (Requerido) |
| gamification | achievements | achievements | ⚠️ (Validação rasa) |
| userProgress | score | score (0-9999) | ✅ |
