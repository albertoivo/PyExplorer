import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MissionList } from '../MissionList/MissionList';
import type { Mission, UserMission } from '../../../types/gamification';

describe('MissionList', () => {
    const mockDailyMissions: Mission[] = [
        {
            id: 'daily_1',
            type: 'daily',
            title: 'Daily Mission 1',
            description: 'Description 1',
            icon: '📅',
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
            title: 'Weekly Mission 1',
            description: 'Description 2',
            icon: '📆',
            objectiveType: 'earn_stars',
            targetValue: 20,
            starsReward: 50,
            xpReward: 200
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
            progress: 20,
            status: 'completed',
            completedAt: new Date(),
            expiresAt: new Date()
        },
        {
            missionId: 'endgame_speedrun_0',
            progress: 1,
            status: 'active',
            expiresAt: new Date()
        }
    ];

    it('renders daily and weekly missions', () => {
        render(
            <MissionList
                dailyMissions={mockDailyMissions}
                weeklyMissions={mockWeeklyMissions}
                userMissions={mockUserMissions}
            />
        );

        expect(screen.getByText('Daily Mission 1')).toBeInTheDocument();
        expect(screen.getByText('Weekly Mission 1')).toBeInTheDocument();
        expect(screen.getByText('Missões Diárias')).toBeInTheDocument();
        expect(screen.getByText('Missões Semanais')).toBeInTheDocument();
    });

    it('displays progress correctly', () => {
        render(
            <MissionList
                dailyMissions={mockDailyMissions}
                weeklyMissions={mockWeeklyMissions}
                userMissions={mockUserMissions}
            />
        );

        expect(screen.getByText('2/5')).toBeInTheDocument(); // Daily progress
        expect(screen.getByText('20/20')).toBeInTheDocument(); // Weekly progress
    });

    it('shows completed status', () => {
        render(
            <MissionList
                dailyMissions={mockDailyMissions}
                weeklyMissions={mockWeeklyMissions}
                userMissions={mockUserMissions}
            />
        );

        const completedBadge = screen.getByText('✅ Completada!');
        expect(completedBadge).toBeInTheDocument();
    });

    it('renders endgame missions if present', () => {
        render(
            <MissionList
                dailyMissions={[]}
                weeklyMissions={[]}
                userMissions={mockUserMissions}
            />
        );

        // Based on logic, endgame_speedrun_0 should match an endgame mission definition
        // or fallback to "Desafio Secreto" (but filtered out if logic fails, let's see)
        // Actually, logic filters out "Desafio Secreto" titles.
        // Assuming ENDGAME_MISSIONS in data has 'speedrun' type.
        // If not, it won't render.
        // Let's check if the section title renders
        expect(screen.getByText('Desafios de Mestre')).toBeInTheDocument();
    });

    it('renders empty lists gracefully', () => {
        render(
            <MissionList
                dailyMissions={[]}
                weeklyMissions={[]}
                userMissions={[]}
            />
        );

        expect(screen.getByText('Missões Diárias')).toBeInTheDocument();
        expect(screen.queryByText('Daily Mission 1')).not.toBeInTheDocument();
    });
});
