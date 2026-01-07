import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { WorldProgressBar } from '../components/game/feedback/ProgressBar';
import { DataSeeder } from '../components/education/DataSeeder';
import './ProfilePage.css';

// Avatars disponíveis
const AVATARS = [
    { id: 'default_avatar', emoji: '🧑‍💻', name: 'Programador' },
    { id: 'ninja', emoji: '🥷', name: 'Ninja' },
    { id: 'wizard', emoji: '🧙‍♂️', name: 'Mago' },
    { id: 'astronaut', emoji: '👨‍🚀', name: 'Astronauta' },
    { id: 'scientist', emoji: '🧑‍🔬', name: 'Cientista' },
    { id: 'robot', emoji: '🤖', name: 'Robô' },
    { id: 'dragon', emoji: '🐉', name: 'Dragão' },
    { id: 'unicorn', emoji: '🦄', name: 'Unicórnio' },
];

// Mundos para exibir progresso
const WORLDS_INFO = [
    { id: 'basic_commands', name: 'Primeiros Passos', icon: '🚀' },
    { id: 'variables', name: 'Variáveis', icon: '📦' },
    { id: 'decisions', name: 'Decisões', icon: '🔀' },
    { id: 'loops', name: 'Repetição', icon: '🔄' },
    { id: 'functions', name: 'Funções', icon: '✨' },
    { id: 'lists', name: 'Listas', icon: '📜' },
    { id: 'strings', name: 'Strings', icon: '📝' },
];

/**
 * Página de perfil do usuário
 */
export function ProfilePage() {
    const { userData, isGuest } = useAuth();
    const { stats, allProgress } = useProgress();

    if (!userData) {
        return (
            <div className="profile-page">
                <div className="profile-empty">
                    <span>🔒</span>
                    <p>Você precisa estar logado para ver seu perfil.</p>
                </div>
            </div>
        );
    }

    // Encontra o emoji do avatar atual
    const currentAvatar = AVATARS.find(a => a.id === userData.avatar) || AVATARS[0];

    // Calcula progresso por mundo
    const getWorldProgress = (worldId: string) => {
        const worldProgress = allProgress.filter(p => {
            // Isso seria baseado em uma relação questão -> mundo
            // Por simplicidade, retornamos valores mock
            return p.questionId.includes(worldId.split('_')[0]);
        });
        return {
            completed: worldProgress.filter(p => p.status === 'completed').length,
            total: 5, // Mock - seria o total real de questões do mundo
        };
    };

    // Calcula nível do jogador
    const level = Math.floor(userData.totalScore / 100) + 1;
    const pointsForNextLevel = (level * 100) - userData.totalScore;

    return (
        <div className="profile-page">
            <div className="profile-container">
                {/* Card do Perfil */}
                <div className="profile-card">
                    <div className="profile-card__avatar">
                        <span className="profile-card__avatar-emoji">{currentAvatar.emoji}</span>
                        <span className="profile-card__avatar-name">{currentAvatar.name}</span>
                    </div>

                    <h1 className="profile-card__name">{userData.displayName}</h1>

                    {isGuest && (
                        <span className="profile-card__guest-badge">
                            👤 Modo Convidado
                        </span>
                    )}

                    <div className="profile-card__level">
                        <span className="profile-card__level-badge">Nível {level}</span>
                        <div className="profile-card__level-progress">
                            <div
                                className="profile-card__level-bar"
                                style={{ width: `${((100 - pointsForNextLevel) / 100) * 100}%` }}
                            />
                        </div>
                        <span className="profile-card__level-text">
                            {pointsForNextLevel} pontos para o próximo nível
                        </span>
                    </div>

                    <div className="profile-card__stats">
                        <div className="stat-item">
                            <span className="stat-item__value">⭐ {userData.totalScore}</span>
                            <span className="stat-item__label">Pontos</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-item__value">✅ {stats.completed}</span>
                            <span className="stat-item__label">Completas</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-item__value">🎯 {stats.totalAttempts}</span>
                            <span className="stat-item__label">Tentativas</span>
                        </div>
                    </div>
                </div>

                {/* Progresso por Mundo */}
                <div className="profile-section">
                    <h2 className="profile-section__title">🌍 Progresso nos Mundos</h2>
                    <div className="profile-worlds">
                        {WORLDS_INFO.map(world => (
                            <WorldProgressBar
                                key={world.id}
                                worldName={world.name}
                                worldIcon={world.icon}
                                completed={getWorldProgress(world.id).completed}
                                total={getWorldProgress(world.id).total}
                            />
                        ))}
                    </div>
                </div>

                {/* Conquistas */}
                <div className="profile-section">
                    <h2 className="profile-section__title">🏆 Conquistas</h2>
                    <div className="profile-achievements">
                        <div className={`achievement ${stats.completed >= 1 ? 'achievement--unlocked' : ''}`}>
                            <span className="achievement__icon">🎯</span>
                            <span className="achievement__name">Primeira Resposta</span>
                            <span className="achievement__desc">Complete sua primeira questão</span>
                        </div>
                        <div className={`achievement ${stats.completed >= 5 ? 'achievement--unlocked' : ''}`}>
                            <span className="achievement__icon">🌟</span>
                            <span className="achievement__name">Estrela Nascente</span>
                            <span className="achievement__desc">Complete 5 questões</span>
                        </div>
                        <div className={`achievement ${stats.completed >= 10 ? 'achievement--unlocked' : ''}`}>
                            <span className="achievement__icon">🔥</span>
                            <span className="achievement__name">Em Chamas</span>
                            <span className="achievement__desc">Complete 10 questões</span>
                        </div>
                        <div className={`achievement ${userData.totalScore >= 100 ? 'achievement--unlocked' : ''}`}>
                            <span className="achievement__icon">💯</span>
                            <span className="achievement__name">Centenário</span>
                            <span className="achievement__desc">Alcance 100 pontos</span>
                        </div>
                        <div className={`achievement ${level >= 5 ? 'achievement--unlocked' : ''}`}>
                            <span className="achievement__icon">🚀</span>
                            <span className="achievement__name">Decolando</span>
                            <span className="achievement__desc">Alcance o nível 5</span>
                        </div>
                        <div className={`achievement`}>
                            <span className="achievement__icon">👑</span>
                            <span className="achievement__name">Mestre Python</span>
                            <span className="achievement__desc">Complete todos os mundos</span>
                        </div>
                    </div>
                </div>

                {/* Aviso para convidados */}
                {isGuest && (
                    <div className="profile-guest-warning">
                        <span className="profile-guest-warning__icon">⚠️</span>
                        <div>
                            <p className="profile-guest-warning__title">Você está jogando como convidado</p>
                            <p className="profile-guest-warning__text">
                                Seu progresso está salvo apenas neste dispositivo.
                                Para salvar na nuvem e acessar de qualquer lugar, crie uma conta!
                            </p>
                        </div>
                    </div>
                )}


                {/* Ferramentas de Desenvolvedor */}
                <DataSeeder />
            </div>
        </div>
    );
}

export default ProfilePage;
