# Relatório do Guardião Firebase 🔥

**Data:** 25/10/2023
**Status:** ⚠️ Atenção

## Resumo

As regras de segurança (Firestore Rules) cobrem as permissões básicas e validações de tipos primitivos (números e strings) para campos críticos como pontuação e display name. No entanto, há lacunas significativas na validação de estruturas complexas de gamificação (conquistas, missões) e falta de validação para vários campos informativos do usuário (avatar, datas). A consistência de tipos entre TypeScript e Firestore está adequada, com serviços lidando corretamente com serialização.

## ✅ Verificações Passaram

- **Coleção `questions`**: Permissões configuradas corretamente (leitura pública, escrita apenas admin). Serviço `questionsService` trata corretamente a serialização de arrays aninhados (`tests`).
- **Limites Numéricos**: Limites para `totalScore` (9.999.999), `streak` (9.999) e `level` (100) estão consistentes e razoáveis.
- **Validação de Status**: `userProgress` valida corretamente os estados permitidos (`not_started`, `in_progress`, `completed`).
- **Tipos de Data**: Serviços convertem corretamente entre `Date` (TypeScript) e `Timestamp` (Firestore).
- **Segurança Básica**: Regras `isAuthenticated()` e `isOwner()` garantem isolamento de dados por usuário.
- **Campo `unlockedWorlds`**: Ao contrário da suspeita inicial, este campo **está presente e validado** nas regras como uma lista (`request.resource.data.unlockedWorlds is list`).

## ⚠️ Avisos (Ação Sugerida)

### Falta de Validação Estrita (`hasOnly`)
- **Localização:** `firestore.rules` (todas as coleções)
- **Descrição:** As regras validam campos específicos se eles existirem, mas não impedem a inserção de campos desconhecidos/extras. A função `hasOnly()` sugerida não está implementada.
- **Impacto:** Usuários maliciosos podem injetar campos "lixo" nos documentos, aumentando custos de armazenamento ou causando comportamento inesperado no frontend se este não filtrar.
- **Sugestão:** Implementar função auxiliar `hasOnly` e aplicá-la nas regras de escrita para restringir o schema.

### Campos Ausentes nas Rules (Users)
- **Localização:** `firestore.rules` (coleção `users`)
- **Descrição:** Campos definidos no TypeScript (`UserData`) não são validados: `email`, `avatar`, `createdAt`, `updatedAt`, `lastActiveDate`, `inventory`, `equippedAvatar`.
- **Impacto:** Possibilidade de salvar dados com tipos incorretos (ex: `avatar` como número).
- **Sugestão:** Adicionar validações de tipo (ex: `avatar is string`) para todos os campos do schema `UserData`.

### Validação de Estruturas Complexas (Gamification)
- **Localização:** `firestore.rules` (coleção `gamification`)
- **Descrição:** Campos complexos como `achievements`, `activeMissions`, `inventory`, `powerUps` e `stats` não possuem validação estrutural, apenas verificação de que o documento é um mapa.
- **Impacto:** Risco de "cheating" em elementos de gamificação (ex: usuário injetar conquistas falsas ou itens no inventário).
- **Sugestão:** Devido à complexidade do Firestore Rules para validar arrays de objetos, considerar mover a lógica de escrita de gamificação sensível para Cloud Functions ou simplificar a estrutura para validação.

### Validação de `questionId` em Progresso
- **Localização:** `firestore.rules` (coleção `userProgress`)
- **Descrição:** O corpo do documento `userProgress` não valida se `questionId` é uma string válida, confiando apenas na consistência do ID do documento (`uid_questionId`).
- **Impacto:** Baixo, mas inconsistência de dados possível.
- **Sugestão:** Adicionar validação `isValidString(request.resource.data.questionId, 100)`.

## ❌ Problemas Críticos

Não foram identificados problemas críticos de segurança que permitam vazamento de dados de outros usuários ou destruição de dados alheios. O risco principal reside na integridade dos dados de gamificação do próprio usuário (auto-trapaça), permitido pelas regras permissivas em objetos aninhados.

## 📋 Tabela de Correspondência

| Coleção | Campo TypeScript | Campo Rules | Status |
|---------|------------------|-------------|--------|
| users | displayName | displayName | ✅ Validado |
| users | totalScore | totalScore | ✅ Validado (0-9.999.999) |
| users | unlockedWorlds | unlockedWorlds | ✅ Validado (Lista) |
| users | streak | streak | ✅ Validado |
| users | avatar | - | ⚠️ Ausente |
| users | inventory | - | ⚠️ Ausente |
| gamification | level.level | level.level | ✅ Validado |
| gamification | achievements | - | ⚠️ Ausente (Objeto complexo) |
| gamification | inventory | - | ⚠️ Ausente |
| userProgress | status | status | ✅ Validado |
| userProgress | score | score | ✅ Validado (0-9.999) |
