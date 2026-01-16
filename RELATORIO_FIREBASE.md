# Relatório do Guardião Firebase 🔥

**Data:** 16/10/2023
**Status:** ❌ Problemas Críticos

## Resumo

A análise revelou inconsistências críticas na coleção `gamification` que impedirão o funcionamento correto do sistema de escrita (erros de "Permission Denied"), pois as regras esperam números onde o TypeScript envia objetos. Além disso, faltam validações importantes na coleção `users` (como `displayName`) e o limite de `streak` (ofensiva) de 365 dias é muito baixo para um produto de longo prazo. A ausência de `hasOnly()` em todas as regras permite a poluição do banco de dados com campos não documentados.

## ✅ Verificações Passaram

- **Autenticação:** Regras de `isOwner` estão corretas para todas as coleções.
- **Leitura de Questões:** Pública para leitura, restrita a admin para escrita.
- **Validação de Status:** `userProgress.status` valida corretamente os valores permitidos.
- **Conversão de Datas:** Serviços lidam corretamente com `Date` ↔ `Timestamp`.
- **Arrays Simples:** `unlockedWorlds` e `inventory` (strings) são suportados pelo Firestore.
- **QuestionID:** Validação de tamanho (se aplicada implicitamente pelo ID do doc) e unicidade são gerenciadas pelo serviço.

## ⚠️ Avisos (Ação Sugerida)

### [Falta de Validação em Users]
- **Localização:** `firestore.rules` (match `/users/{userId}`)
- **Descrição:** Campos como `displayName`, `unlockedWorlds` e `inventory` existem no TypeScript (`UserData`) mas não possuem validação nas Rules. `displayName` deveria ter limite de caracteres.
- **Impacto:** Usuários podem salvar nomes gigantes (spam/UI break) ou injetar dados inválidos em arrays.
- **Sugestão:** Adicionar validação: `isValidString(request.resource.data.displayName, 50)` e verificar tipos dos arrays se possível.

### [Limite de Streak Baixo]
- **Localização:** `firestore.rules` (users e gamification)
- **Descrição:** A validação `isValidNumber(..., 0, 365)` limita a ofensiva a 1 ano.
- **Impacto:** Usuários fiéis terão erros ao tentar salvar o dia 366.
- **Sugestão:** Aumentar limite para 9999 (como em `userProgress.attempts`).

### [Duplicidade de Dados]
- **Localização:** `src/types/question.ts` vs `src/types/gamification.ts`
- **Descrição:** `inventory` e `streak` existem tanto em `UserData` quanto em `UserGamification`.
- **Impacto:** Risco de inconsistência de dados se apenas um for atualizado.
- **Sugestão:** Definir uma única fonte de verdade (ex: mover tudo de gamificação para dentro da coleção `gamification` e manter `users` leve).

### [Ausência de hasOnly()]
- **Localização:** `firestore.rules` (todas as coleções)
- **Descrição:** As regras não usam `hasOnly()`, permitindo escrita de campos desconhecidos.
- **Impacto:** Poluição do esquema do banco de dados com campos órfãos ou legados.
- **Sugestão:** Implementar validação estrita dos campos permitidos em cada coleção.

## ❌ Problemas Críticos

### [Inconsistência de Tipos em Gamification]
- **Localização:** `firestore.rules` vs `src/types/gamification.ts`
- **Descrição:**
    - O TypeScript envia `level` como um **objeto** (`UserLevel`). As Rules validam `level` como **número** (`isValidNumber`).
    - O TypeScript envia `streak` como um **objeto** (`UserStreak`). As Rules validam `streak` como **número** (`isValidNumber`).
- **Impacto:** **Bloqueio total de escrita.** Qualquer tentativa de salvar `gamification` falhará com erro de permissão, pois `request.resource.data.level` não será um número.
- **Correção Necessária:** Atualizar as Rules para não validar esses campos como números ou alterar o serviço para salvar a estrutura "achatada" que as rules esperam (não recomendado). O ideal é ajustar as Rules para validar a estrutura do objeto ou remover a validação de tipo primitivo.

### [Inconsistência de Estrutura em Gamification]
- **Localização:** `firestore.rules` vs `src/types/gamification.ts`
- **Descrição:** As Rules validam `totalXP` e `xp` na raiz do documento. No TypeScript (`UserGamification`), esses campos estão aninhados dentro do objeto `level` (`level.totalXP`, `level.currentXP`).
- **Impacto:** As validações de limites de XP nas Rules são inúteis (sempre passarão pois os campos não existem na raiz) e os dados reais não são validados.
- **Correção Necessária:** Ajustar as Rules para validar `request.resource.data.level.totalXP` (map access) ou mover os campos para a raiz no TypeScript.

## 📋 Tabela de Correspondência

| Coleção | Campo TypeScript | Campo Rules | Status | Observação |
|---------|------------------|-------------|--------|------------|
| users | displayName | (ausente) | ⚠️ | Falta validação de string/length |
| users | totalScore | totalScore | ✅ | |
| users | balance | balance | ✅ | |
| users | streak | streak | ⚠️ | TS: number, Rules: number (limitado a 365) |
| users | unlockedWorlds | (ausente) | ⚠️ | Array não validado |
| gamification | level | level | ❌ | TS: Object, Rules: Number |
| gamification | streak | streak | ❌ | TS: Object, Rules: Number |
| gamification | level.totalXP | totalXP | ❌ | Campo na raiz vs aninhado |
| userProgress | status | status | ✅ | Enum validado corretamente |
| userProgress | score | score | ⚠️ | Limite de 1000 pode ser baixo |
