# 💡 Invasão Bugzila (Eventos Globais Coletivos)

### 🎯 O "Porquê" (Psicologia)
Usa o gatilho de **Urgência e Escassez** (evento de fim de semana) combinado com **Prova Social e Pertencimento** ("todos estão lutando, preciso ajudar"). Diferente de estudar sozinho, aqui a criança sente que seu código tem um **Propósito Épico**: salvar o PyExplorer. O medo de "perder o evento" (FOMO) impulsiona o retorno (D7), e o loot exclusivo (skins de Pet) cria colecionismo e status.

### 🛠️ Como Funciona (Mecânica)
- **O que o usuário vê?**
  - Na sexta-feira, um alerta: "⚠️ Invasão Detectada!".
  - No dashboard, uma barra de vida GIGANTE compartilhada por TODOS os usuários (ex: 1.000.000 HP).
  - Um monstro animado (Bugzila) que reage a danos.
- **O que o usuário faz?**
  - Cada exercício resolvido lança um "ataque" no Boss.
  - Exercícios difíceis dão mais dano (Crítico!).
  - O Pet do usuário aparece na tela "atacando" junto (quanto maior o nível do Pet, maior o dano).
- **O que acontece depois?**
  - Se a comunidade zerar o HP até domingo à noite, TODOS ganham um prêmio exclusivo (ex: "Chapéu do Bugzila" para o avatar).
  - Se falharem, o prêmio some para sempre.

### 🎨 Exemplo Visual (Wireframe Mental)
Um banner no topo do Dashboard com um fundo vermelho pulsante. No centro, o sprite do "Bugzila" (pixel art) tremendo. Embaixo, uma barra de HP vermelha diminuindo em tempo real com números subindo ("-10", "-50 de Maria", "-20 de João"). Ao resolver um exercício, uma animação de foguete sai do código do usuário e explode no Boss.

### 🚀 Estimativa de Implementação
- **Complexidade:** Média
- **Passos Macro:**
  1. Criar coleção `events` no Firestore para gerenciar HP Global e Estado do Boss (usando `FieldValue.increment` para concorrência).
  2. Implementar `RaidWidget` no Dashboard que escuta o HP em tempo real (`onSnapshot`).
  3. Adicionar lógica de "Cálculo de Dano" (Base + Nível do Pet) ao completar missões.
