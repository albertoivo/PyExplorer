# Relatório do Guardião Firebase 🔥

**Data:** 24/05/2024
**Status:** ⚠️ Atenção

## Resumo

A análise revelou que a maioria das regras básicas de segurança e tipos estão consistentes. No entanto, existem lacunas de validação significativas na coleção `gamification` (estruturas aninhadas complexas não validadas) e na coleção `users` (falta de restrição estrita de campos extras). A suspeita inicial de que `unlockedWorlds` estava ausente nas regras provou-se **incorreta**; o campo está devidamente validado como lista.

## ✅ Verificações Passaram

- **`questions`**:
  - Leitura pública e escrita apenas Admin configuradas corretamente.
  - Sanitização de arrays aninhados (`tests`) implementada corretamente no `questionsService.ts`.
- **`users`**:
  - Limites de `displayName` (50 chars), `streak` (9999) e `totalScore` (9999999) estão consistentes.
  - `unlockedWorlds` está presente nas regras e validado como `list`.
- **`userProgress`**:
  - Enum de `status` sincronizado (`not_started`, `in_progress`, `completed`).
  - Limites de `score` e `attempts` adequados.
- **Tipagem e Conversão**:
  - Conversão `Date` ↔ `Timestamp` tratada corretamente nos serviços (`saveUser`, `saveProgress`, `saveGamificationData`).
  - Tratamento de `undefined` em `saveProgress` evita erros do Firestore.

## ⚠️ Avisos (Ação Sugerida)

### Falta de `hasOnly()` em `users`
- **Localização:** `firestore.rules` (match `/users/{userId}`)
- **Descrição:** As regras validam campos específicos (`displayName`, `totalScore`, etc.), mas não impedem o envio de campos desconhecidos.
- **Impacto:** Usuários mal-intencionados podem injetar campos arbitrários (lixo) nos documentos de usuário.
- **Sugestão:** Implementar verificação `request.resource.data.keys().hasOnly([...])` listando todos os campos permitidos do `UserData`.

### Validação Rasa de `unlockedWorlds`
- **Localização:** `firestore.rules`
- **Descrição:** O campo é validado apenas como `list`. Não verifica se os itens dentro da lista são strings ou se correspondem aos mundos válidos (`basic_commands`, etc.).
- **Impacto:** Usuário pode enviar `unlockedWorlds: [123, true, "mundo_inexistente"]`.
- **Sugestão:** Adicionar validação de conteúdo da lista se possível, ou confiar na validação da aplicação (risco baixo).

## ❌ Problemas Críticos

### Falta de Validação em Campos de Gamificação
- **Localização:** `firestore.rules` (match `/gamification/{userId}`)
- **Descrição:** As regras validam `level` e `streak`, mas **ignoram completamente** campos complexos definidos no TypeScript: `achievements`, `activeMissions`, `inventory`, `powerUps`, e `stats`.
- **Impacto:** Um usuário pode enviar uma requisição de escrita forjando um inventário cheio de itens pagos, estatísticas falsas ou conquistas não desbloqueadas. Como não há `hasOnly` e nem validação específica para esses campos, a escrita será aceita desde que `level` e `streak` (se presentes) sejam válidos.
- **Correção Necessária:** É necessário mapear e validar a estrutura desses objetos nas regras, ou pelo menos restringir o tamanho/tipo dos dados permitidos.

## 📋 Tabela de Correspondência

| Coleção | Campo TypeScript | Campo Rules | Status |
|---------|------------------|-------------|--------|
| users | displayName | displayName | ✅ |
| users | totalScore | totalScore | ✅ |
| users | unlockedWorlds | unlockedWorlds | ✅ (Validado como `list`) |
| users | email | *(Ausente)* | ⚠️ (Não validado) |
| userProgress | status | status | ✅ |
| userProgress | score | score | ✅ (0-9999) |
| gamification | level | level | ✅ |
| gamification | inventory | *(Ausente)* | ❌ Crítico |
| gamification | stats | *(Ausente)* | ❌ Crítico |
