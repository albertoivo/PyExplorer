import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MissionList } from '../MissionList';
import type { Mission, UserMission } from '../../../../types/gamification';

// Mock data
const mockDailyMissions: Mission[] = [
    {
        id: 'daily_1',
        title: 'Daily Task 1',
        description: 'Do something daily',
        type: 'daily',
        icon: '🌞',
        objectiveType: 'complete_questions',
        targetValue: 5,
        starsReward: 10,
        xpReward: 50,
    }
];

const mockWeeklyMissions: Mission[] = [
    {
        id: 'weekly_1',
        title: 'Weekly Task 1',
        description: 'Do something weekly',
        type: 'weekly',
        icon: '📅',
        objectiveType: 'earn_stars',
        targetValue: 100,
        starsReward: 50,
        xpReward: 200,
    }
];

const mockUserMissions: UserMission[] = [
    {
        missionId: 'daily_1',
        progress: 2,
        status: 'active',
        expiresAt: new Date()
    },
    {
        missionId: 'weekly_1',
        progress: 100, // Completed
        status: 'completed', // Or claimed
        expiresAt: new Date()
    }
];

// Mock ENDGAME_MISSIONS
vi.mock('../../../../data/gamificationData', () => ({
    ENDGAME_MISSIONS: [
        {
            objectiveType: 'speedrun',
            title: 'Endgame Speedrun',
            description: 'Run fast',
            icon: '⚡',
            targetValue: 10,
            starsReward: 1000,
            xpReward: 5000
        }
    ]
}));

describe('MissionList', () => {
    it('renders daily and weekly sections', () => {
        render(
            <MissionList
                dailyMissions={mockDailyMissions}
                weeklyMissions={mockWeeklyMissions}
                userMissions={mockUserMissions}
            />
        );

        expect(screen.getByText('Missões Diárias')).toBeDefined();
        expect(screen.getByText('Missões Semanais')).toBeDefined();
    });

    it('renders mission details correctly', () => {
        render(
            <MissionList
                dailyMissions={mockDailyMissions}
                weeklyMissions={[]}
                userMissions={mockUserMissions}
            />
        );

        expect(screen.getByText('Daily Task 1')).toBeDefined();
        expect(screen.getByText('Do something daily')).toBeDefined();
        expect(screen.getByText('2/5')).toBeDefined(); // Progress
        expect(screen.getByText('10')).toBeDefined(); // Stars
        expect(screen.getByText('50 XP')).toBeDefined(); // XP
    });

    it('renders completion badge for completed missions', () => {
        render(
            <MissionList
                dailyMissions={[]}
                weeklyMissions={mockWeeklyMissions}
                userMissions={mockUserMissions}
            />
        );

        expect(screen.getByText('Weekly Task 1')).toBeDefined();
        expect(screen.getByText('✅ Completada!')).toBeDefined();
    });

    it('renders Endgame section when endgame missions are present in userMissions', () => {
        const endgameUserMissions: UserMission[] = [
            ...mockUserMissions,
            {
                missionId: 'endgame_speedrun_0',
                progress: 0,
                status: 'active',
                expiresAt: new Date()
            }
        ];

        render(
            <MissionList
                dailyMissions={mockDailyMissions}
                weeklyMissions={mockWeeklyMissions}
                userMissions={endgameUserMissions}
            />
        );

        expect(screen.getByText('Desafios de Mestre')).toBeDefined();
        expect(screen.getByText('Endgame Speedrun')).toBeDefined();
    });

    it('calculates progress percentage correctly', () => {
        const { container } = render(
            <MissionList
                dailyMissions={mockDailyMissions}
                weeklyMissions={[]}
                userMissions={mockUserMissions}
            />
        );

        // Daily task is 2/5 -> 40%
        const progressBar = container.querySelector('.mission-card__progress-fill');
        expect(progressBar).toHaveStyle({ width: '40%' });
    });

    it('does NOT render Endgame section if no endgame missions active', () => {
        render(
            <MissionList
                dailyMissions={mockDailyMissions}
                weeklyMissions={mockWeeklyMissions}
                userMissions={mockUserMissions} // No endgame here
            />
        );

        expect(screen.queryByText('Desafios de Mestre')).toBeNull();
    });
});
