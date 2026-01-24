import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MissionList } from '../MissionList';
import type { Mission, UserMission } from '../../../../types/gamification';

// Mock data module
vi.mock('../../../../data/gamificationData', () => ({
    ENDGAME_MISSIONS: [
        {
            objectiveType: 'speedrun',
            title: 'Mestre da Velocidade',
            description: 'Complete 10 questões rapidamente',
            targetValue: 10,
            starsReward: 50,
            xpReward: 100,
            type: 'endgame',
            icon: '⚡'
        }
    ]
}));

describe('MissionList Component', () => {
    const dailyMissions: Mission[] = [
        {
            id: 'daily_1',
            type: 'daily',
            title: 'Resolver 5 Questões',
            description: 'Complete 5 questões hoje',
            icon: '📝',
            objectiveType: 'complete_questions',
            targetValue: 5,
            starsReward: 10,
            xpReward: 20
        }
    ];

    const weeklyMissions: Mission[] = [
        {
            id: 'weekly_1',
            type: 'weekly',
            title: 'Acertar 20 Questões',
            description: 'Acerte 20 questões nesta semana',
            icon: '📅',
            objectiveType: 'complete_questions',
            targetValue: 20,
            starsReward: 50,
            xpReward: 100
        }
    ];

    const userMissions: UserMission[] = [
        {
            missionId: 'daily_1',
            progress: 2,
            status: 'active',
            expiresAt: new Date()
        },
        {
            missionId: 'weekly_1',
            progress: 20,
            status: 'completed',
            expiresAt: new Date()
        },
        {
            missionId: 'endgame_speedrun_0',
            progress: 5,
            status: 'active',
            expiresAt: new Date()
        }
    ];

    it('renders daily and weekly missions correctly', () => {
        render(
            <MissionList
                dailyMissions={dailyMissions}
                weeklyMissions={weeklyMissions}
                userMissions={userMissions}
            />
        );

        // Check Daily Mission
        expect(screen.getByText('Resolver 5 Questões')).toBeInTheDocument();
        expect(screen.getByText('Complete 5 questões hoje')).toBeInTheDocument();
        expect(screen.getByText('2/5')).toBeInTheDocument(); // Progress text

        // Check Weekly Mission
        expect(screen.getByText('Acertar 20 Questões')).toBeInTheDocument();
        expect(screen.getByText('20/20')).toBeInTheDocument();
    });

    it('renders endgame missions based on userMissions matching', () => {
        render(
            <MissionList
                dailyMissions={[]}
                weeklyMissions={[]}
                userMissions={userMissions}
            />
        );

        // Should find "Mestre da Velocidade" because userMissions has 'endgame_speedrun_0'
        expect(screen.getByText('Mestre da Velocidade')).toBeInTheDocument();
        expect(screen.getByText('Dificuldade Elevada')).toBeInTheDocument();
        expect(screen.getByText('5/10')).toBeInTheDocument();
    });

    it('shows completed badge for completed missions', () => {
        render(
            <MissionList
                dailyMissions={dailyMissions}
                weeklyMissions={weeklyMissions}
                userMissions={userMissions}
            />
        );

        // Weekly mission is completed
        // We need to find the specific card. Since we have text "Acertar 20 Questões", we can look near it.
        const weeklyCardTitle = screen.getByText('Acertar 20 Questões');
        const weeklyCard = weeklyCardTitle.closest('.mission-card');

        expect(weeklyCard).toHaveClass('mission-card--completed');
        expect(weeklyCard).toHaveTextContent('✅ Completada!');
    });

    it('calculates progress bar width correctly', () => {
        // Filter out endgame missions to ensure we check the daily mission
        const onlyDailyUserMissions = userMissions.filter(m => m.missionId === 'daily_1');

        const { container } = render(
            <MissionList
                dailyMissions={dailyMissions}
                weeklyMissions={[]}
                userMissions={onlyDailyUserMissions}
            />
        );

        // Daily mission: 2/5 = 40%
        // The component has: className="mission-card__progress-fill" style={{ width: `${percentage}%` }}

        const fill = container.querySelector('.mission-card__progress-fill');
        expect(fill).toHaveStyle({ width: '40%' });
    });

    it('renders claimed missions with correct styling', () => {
        const claimedUserMissions: UserMission[] = [
            {
                missionId: 'daily_1',
                progress: 5,
                status: 'claimed',
                expiresAt: new Date()
            }
        ];

        render(
            <MissionList
                dailyMissions={dailyMissions}
                weeklyMissions={[]}
                userMissions={claimedUserMissions}
            />
        );

        const cardTitle = screen.getByText('Resolver 5 Questões');
        const card = cardTitle.closest('.mission-card');

        expect(card).toHaveClass('mission-card--claimed');
        expect(card).toHaveTextContent('✅ Completada!');
    });

    it('does not render unknown endgame missions (fallback filtering)', () => {
         const unknownUserMissions: UserMission[] = [
            {
                missionId: 'endgame_unknown_999',
                progress: 0,
                status: 'active',
                expiresAt: new Date()
            }
        ];

        render(
            <MissionList
                dailyMissions={[]}
                weeklyMissions={[]}
                userMissions={unknownUserMissions}
            />
        );

        // "Desafio Secreto" is the fallback title, but the component filters it out.
        expect(screen.queryByText('Desafio Secreto')).not.toBeInTheDocument();
        expect(screen.queryByText('Mestre da Velocidade')).not.toBeInTheDocument();
    });
});
