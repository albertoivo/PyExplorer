import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { useGamification } from '../context/GamificationContext';
import { useQuestionsFirestore } from '../hooks/useQuestionsFirestore';
import { WorldProgressBar } from '../components/game/feedback/ProgressBar';
import { DataSeeder } from '../components/education/DataSeeder';
import { SHOP_ITEMS } from '../data/gamificationData';
import { WORLDS } from '../data/worlds';
import { useTranslation } from 'react-i18next';
import { SEO } from '../components/common/SEO';
import './ProfilePage.css';

/**
 * Página de perfil do usuário
 */
export function ProfilePage() {
    const { t } = useTranslation(['gamification', 'worlds', 'common']);
    const { userData, isGuest } = useAuth();
    const { stats, allProgress } = useProgress();
    const { achievements, unlockedAchievements, gamification, currentLevel, levelProgress } = useGamification();
    const { getQuestionsByWorld } = useQuestionsFirestore();

    if (!userData) {
        return (
            <div className="profile-page">
                <div className="profile-empty">
                    <span>🔒</span>
                    <p>{t('gamification:profile.loginRequired', 'Você precisa estar logado para ver seu perfil.')}</p>
                </div>
            </div>
        );
    }

    // Encontra o item do avatar atual
    const currentAvatarId = gamification?.inventory?.equippedAvatar || userData.avatar;
    const currentFrameId = gamification?.inventory?.equippedFrame;
    const currentAvatarItem = SHOP_ITEMS.find(a => a.id === currentAvatarId && a.type === 'avatar');
    const currentFrameItem = currentFrameId ? SHOP_ITEMS.find(f => f.id === currentFrameId) : null;
    const displayAvatar = currentAvatarItem || SHOP_ITEMS.find(a => a.id === 'avatar_snake_green') || { icon: '🧑‍💻', name: t('common:player', 'Programador') };

    // Calcula progresso por mundo usando o total real de questões
    const getWorldProgress = (worldId: string) => {
        const worldQuestions = getQuestionsByWorld(worldId as import('../types/question').World);
        const completedProgress = allProgress.filter(p =>
            p.status === 'completed' && worldQuestions.some(q => q.id === p.questionId)
        );
        return {
            completed: completedProgress.length,
            total: worldQuestions.length,
        };
    };

    // Ferramentas de Desenvolvedor (Apenas admin)
    const isAdmin = userData.email === 'albertoivo@gmail.com';

    return (
        <div className="profile-page">
            <SEO
                title={t('gamification:profile.seoTitle', 'Meu Perfil')}
                description={t('gamification:profile.seoDescription', 'Veja seu progresso, conquistas e estatísticas no PyExplorer!')}
                noindex
            />
            <div className="profile-container">
                {/* Card do Perfil */}
                <div className="profile-card">
                    <div className="profile-card__avatar">
                        {currentFrameItem?.color ? (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                border: currentFrameItem.color === 'rainbow' ? '4px solid transparent' : `4px solid ${currentFrameItem.color}`,
                                background: currentFrameItem.color === 'rainbow'
                                    ? 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)'
                                    : 'transparent',
                                backgroundClip: currentFrameItem.color === 'rainbow' ? 'padding-box' : undefined,
                            }}>
                                <span className="profile-card__avatar-emoji" style={{ fontSize: '60px', lineHeight: 1 }}>{displayAvatar.icon}</span>
                            </span>
                        ) : (
                            <span className="profile-card__avatar-emoji">{displayAvatar.icon}</span>
                        )}
                        <span className="profile-card__avatar-name">
                            {'id' in displayAvatar ? t(`gamification:shopItems.${displayAvatar.id}.name`, displayAvatar.name) : displayAvatar.name}
                        </span>
                    </div>

                    <h2 className="profile-card__name">{userData.displayName}</h2>

                    {isGuest && (
                        <span className="profile-card__guest-badge">
                            👤 {t('gamification:profile.guestMode', 'Modo Convidado')}
                        </span>
                    )}

                    <div className="profile-card__level">
                        <span className="profile-card__level-badge">
                            {t('gamification:profile.level', { level: currentLevel.level, defaultValue: `Nível ${currentLevel.level}` })} - {t(`gamification:levels.${currentLevel.level}.name`, currentLevel.name)}
                        </span>
                        <div className="profile-card__level-progress">
                            <div
                                className="profile-card__level-bar"
                                style={{ width: `${levelProgress}%` }}
                            />
                        </div>
                        <span className="profile-card__level-text">
                            {currentLevel.maxXP === Infinity
                                ? t('gamification:profile.maxLevel', 'Nível máximo!')
                                : t('gamification:profile.xpToNextLevel', {
                                    current: currentLevel.maxXP - gamification.level.totalXP,
                                    next: currentLevel.maxXP,
                                    defaultValue: `${currentLevel.maxXP - gamification.level.totalXP} XP para o próximo nível`
                                })}
                        </span>
                    </div>

                    <div className="profile-card__stats">
                        <div className="stat-item">
                            <span className="stat-item__value">⚡ {userData.totalScore}</span>
                            <span className="stat-item__label">{t('gamification:stats.score', 'Pontuação')}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-item__value">✅ {stats.completed}</span>
                            <span className="stat-item__label">{t('gamification:stats.completed', 'Concluídas')}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-item__value">🎯 {stats.totalAttempts}</span>
                            <span className="stat-item__label">{t('gamification:stats.attempts', 'Tentativas')}</span>
                        </div>
                    </div>
                </div>

                {/* Progresso por Mundo */}
                <div className="profile-section">
                    <h2 className="profile-section__title">🌍 {t('gamification:profile.worldsProgress', 'Progresso nos Mundos')}</h2>
                    <div className="profile-worlds">
                        {WORLDS.map(world => (
                            <WorldProgressBar
                                key={world.id}
                                worldName={t(`worlds:${world.id}.name`, world.name)}
                                worldIcon={world.icon}
                                completed={getWorldProgress(world.id).completed}
                                total={getWorldProgress(world.id).total}
                            />
                        ))}
                    </div>
                </div>

                {/* Conquistas (Dinâmico) */}
                <div className="profile-section">
                    <h2 className="profile-section__title">🏅 {t('gamification:tabs.achievements', 'Conquistas')}</h2>
                    <div className="profile-achievements">
                        {achievements.map((achievement) => {
                            const isUnlocked = unlockedAchievements.some(u => u.id === achievement.id);
                            // Se estiver oculta e bloqueada, não mostra
                            if (achievement.hidden && !isUnlocked) return null;

                            return (
                                <div key={achievement.id} className={`achievement ${isUnlocked ? 'achievement--unlocked' : ''} `}>
                                    <span className="achievement__icon">{achievement.icon}</span>
                                    <span className="achievement__name">{t(`gamification:achievements.items.${achievement.id}.name`, achievement.name)}</span>
                                    <span className="achievement__desc">{t(`gamification:achievements.items.${achievement.id}.description`, achievement.description)}</span>
                                    {isUnlocked && <span className="achievement__check">✅</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Aviso para convidados */}
                {isGuest && (
                    <div className="profile-guest-warning">
                        <span className="profile-guest-warning__icon">⚠️</span>
                        <div>
                            <p className="profile-guest-warning__title">{t('gamification:profile.guestWarningTitle', 'Você está jogando como convidado')}</p>
                            <p className="profile-guest-warning__text">
                                {t('gamification:profile.guestWarningText', 'Seu progresso está salvo apenas neste dispositivo. Para salvar na nuvem e acessar de qualquer lugar, crie uma conta!')}
                            </p>
                        </div>
                    </div>
                )}

                {/* Ferramentas de Desenvolvedor */}
                {isAdmin && (
                    <DataSeeder />
                )}
            </div>
        </div>
    );
}
