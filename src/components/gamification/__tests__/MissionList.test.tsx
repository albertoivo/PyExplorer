import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MissionList } from '../MissionList/MissionList';
import type { Mission, UserMission } from '../../../types/gamification';

// Mock the gamification data to control endgame missions
vi.mock('../../../data/gamificationData', () => ({
    ENDGAME_MISSIONS: [
        {
            id: 'endgame_speedrun_1',
            type: 'endgame',
            title: 'Mestre da Velocidade',
            description: 'Complete uma fase em menos de 30s',
            icon: '⚡',
            objectiveType: 'speedrun',
            targetValue: 30,
            starsReward: 50,
            xpReward: 500
        }
    ]
}));

describe('MissionList Component', () => {
    const mockDailyMissions: Mission[] = [
        {
            id: 'daily_1',
            type: 'daily',
            title: 'Daily Quest 1',
            description: 'Do something today',
            icon: '🌞',
            objectiveType: 'complete_questions',
            targetValue: 5,
            starsReward: 10,
            xpReward: 50
        }
    ];

    const mockWeeklyMissions: Mission[] = [
        {
            id: 'weekly_1',
            type: 'weekly',
            title: 'Weekly Quest 1',
            description: 'Do something this week',
            icon: '📅',
            objectiveType: 'earn_stars',
            targetValue: 20,
            starsReward: 30,
            xpReward: 150
        }
    ];

    const mockUserMissions: UserMission[] = [
        {
            missionId: 'daily_1',
            progress: 2,
            status: 'in_progress',
            assignedDate: '2023-01-01'
        },
        {
            missionId: 'weekly_1',
            progress: 20,
            status: 'completed',
            assignedDate: '2023-01-01'
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders daily and weekly missions correctly', () => {
        render(
            <MissionList
                dailyMissions={mockDailyMissions}
                weeklyMissions={mockWeeklyMissions}
                userMissions={mockUserMissions}
            />
        );

        expect(screen.getByText('Daily Quest 1')).toBeInTheDocument();
        expect(screen.getByText('Weekly Quest 1')).toBeInTheDocument();
        expect(screen.getByText('Missões Diárias')).toBeInTheDocument();
        expect(screen.getByText('Missões Semanais')).toBeInTheDocument();
    });

    it('displays progress correctly', () => {
        render(
            <MissionList
                dailyMissions={mockDailyMissions}
                weeklyMissions={[]}
                userMissions={mockUserMissions}
            />
        );

        // Daily mission 1: 2/5 progress
        expect(screen.getByText('2/5')).toBeInTheDocument();

        // Check progress bar width (2/5 = 40%)
        const progressBar = screen.getAllByRole('generic').find(el =>
            el.className === 'mission-card__progress-fill'
        );
        expect(progressBar).toHaveStyle({ width: '40%' });
    });

    it('shows completed badge for completed missions', () => {
        render(
            <MissionList
                dailyMissions={[]}
                weeklyMissions={mockWeeklyMissions}
                userMissions={mockUserMissions}
            />
        );

        expect(screen.getByText('✅ Completada!')).toBeInTheDocument();
    });

    it('renders endgame missions when user has them active', () => {
        const endgameUserMissions: UserMission[] = [
            {
                missionId: 'endgame_speedrun_1',
                progress: 0,
                status: 'in_progress',
                assignedDate: '2023-01-01'
            }
        ];

        render(
            <MissionList
                dailyMissions={[]}
                weeklyMissions={[]}
                userMissions={endgameUserMissions}
            />
        );

        expect(screen.getByText('Desafios de Mestre')).toBeInTheDocument();
        expect(screen.getByText('Mestre da Velocidade')).toBeInTheDocument();
        expect(screen.getByText('Dificuldade Elevada')).toBeInTheDocument();
    });

    it('does not render endgame section if no endgame missions are active', () => {
        render(
            <MissionList
                dailyMissions={mockDailyMissions}
                weeklyMissions={[]}
                userMissions={mockUserMissions}
            />
        );

        expect(screen.queryByText('Desafios de Mestre')).not.toBeInTheDocument();
    });

    it('handles claimed status correctly', () => {
        const claimedUserMissions: UserMission[] = [
            {
                missionId: 'daily_1',
                progress: 5,
                status: 'claimed',
                assignedDate: '2023-01-01'
            }
        ];

        render(
            <MissionList
                dailyMissions={mockDailyMissions}
                weeklyMissions={[]}
                userMissions={claimedUserMissions}
            />
        );

        expect(screen.getByText('✅ Completada!')).toBeInTheDocument();
        const card = screen.getByText('Daily Quest 1').closest('.mission-card');
        expect(card).toHaveClass('mission-card--claimed');
    });

    it('handles missing user mission data (default 0 progress)', () => {
        render(
            <MissionList
                dailyMissions={mockDailyMissions}
                weeklyMissions={[]}
                userMissions={[]} // Empty user missions
            />
        );

        expect(screen.getByText('0/5')).toBeInTheDocument();
        const progressBar = screen.getAllByRole('generic').find(el =>
            el.className === 'mission-card__progress-fill'
        );
        expect(progressBar).toHaveStyle({ width: '0%' });
    });
});
