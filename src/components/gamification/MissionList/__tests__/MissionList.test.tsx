import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MissionList from '../MissionList';
import type { Mission, UserMission } from '../../../types/gamification';

// Mock the data module to have control over ENDGAME_MISSIONS
vi.mock('../../../../data/gamificationData', () => ({
    ENDGAME_MISSIONS: [
        {
            type: 'endgame',
            title: 'Mock Endgame Mission',
            description: 'Mock Description',
            icon: '🏆',
            objectiveType: 'speedrun',
            targetValue: 5,
            starsReward: 100,
            xpReward: 200,
        },
        {
            type: 'endgame',
            title: 'Improvement Mission',
            description: 'Improve stats',
            icon: '📈',
            objectiveType: 'improve_stars',
            targetValue: 3,
            starsReward: 120,
            xpReward: 400,
        }
    ]
}));

describe('MissionList', () => {
    const mockDailyMissions: Mission[] = [
        {
            id: 'daily_1',
            type: 'daily',
            title: 'Daily Quest 1',
            description: 'Do something daily',
            icon: '🌞',
            objectiveType: 'complete_questions',
            targetValue: 10,
            starsReward: 5,
            xpReward: 10
        }
    ];

    const mockWeeklyMissions: Mission[] = [
        {
            id: 'weekly_1',
            type: 'weekly',
            title: 'Weekly Quest 1',
            description: 'Do something weekly',
            icon: '📅',
            objectiveType: 'earn_stars',
            targetValue: 50,
            starsReward: 20,
            xpReward: 100
        }
    ];

    it('renders daily and weekly missions sections', () => {
        render(
            <MissionList
                dailyMissions={mockDailyMissions}
                weeklyMissions={mockWeeklyMissions}
                userMissions={[]}
            />
        );

        expect(screen.getByText('Missões Diárias')).toBeInTheDocument();
        expect(screen.getByText('Missões Semanais')).toBeInTheDocument();

        expect(screen.getByText('Daily Quest 1')).toBeInTheDocument();
        expect(screen.getByText('Weekly Quest 1')).toBeInTheDocument();

        // Ensure Endgame section is NOT present when there are no user missions for it
        expect(screen.queryByText('Desafios de Mestre')).not.toBeInTheDocument();
    });

    it('renders endgame missions when user has them', () => {
        const userMissionsWithEndgame: UserMission[] = [
            {
                missionId: 'endgame_speedrun_1', // Matches 'speedrun' type in mock
                progress: 0,
                status: 'in_progress',
                startedAt: new Date(),
                updatedAt: new Date()
            }
        ];

        render(
            <MissionList
                dailyMissions={[]}
                weeklyMissions={[]}
                userMissions={userMissionsWithEndgame}
            />
        );

        expect(screen.getByText('Desafios de Mestre')).toBeInTheDocument();
        expect(screen.getByText('Mock Endgame Mission')).toBeInTheDocument();
    });

    it('renders correct progress and percentage', () => {
        const userMissions: UserMission[] = [
            {
                missionId: 'daily_1',
                progress: 5,
                status: 'in_progress',
                startedAt: new Date(),
                updatedAt: new Date()
            }
        ];

        render(
            <MissionList
                dailyMissions={mockDailyMissions}
                weeklyMissions={[]}
                userMissions={userMissions}
            />
        );

        // Progress text 5/10
        expect(screen.getByText('5/10')).toBeInTheDocument();

        // Check if progress bar has correct width (50%)
        // We look for the progress-fill div by class name or structure.
        // Since it's a visual style, we can inspect the style attribute.
        // However, testing implementation details like class names is fragile.
        // Ideally we would have a role="progressbar" but the component structure is divs.
        // We can find by text "5/10" parent's previous sibling.

        // Let's use a query selector for the specific class since we imported the CSS in the component
        // Note: JSDOM parses styles but might not compute layout. Inline styles work though.
        const progressBarFill = document.querySelector('.mission-card__progress-fill');
        expect(progressBarFill).toHaveStyle('width: 50%');
    });

    it('renders completed status correctly', () => {
        const userMissions: UserMission[] = [
            {
                missionId: 'daily_1',
                progress: 10,
                status: 'completed',
                startedAt: new Date(),
                updatedAt: new Date()
            }
        ];

        render(
            <MissionList
                dailyMissions={mockDailyMissions}
                weeklyMissions={[]}
                userMissions={userMissions}
            />
        );

        expect(screen.getByText('✅ Completada!')).toBeInTheDocument();

        // Check for completed class on the card
        const card = screen.getByText('Daily Quest 1').closest('.mission-card');
        expect(card).toHaveClass('mission-card--completed');
    });

    it('renders claimed status correctly', () => {
         const userMissions: UserMission[] = [
            {
                missionId: 'daily_1',
                progress: 10,
                status: 'claimed',
                startedAt: new Date(),
                updatedAt: new Date()
            }
        ];

        render(
            <MissionList
                dailyMissions={mockDailyMissions}
                weeklyMissions={[]}
                userMissions={userMissions}
            />
        );

        expect(screen.getByText('✅ Completada!')).toBeInTheDocument(); // Logic says (isCompleted || isClaimed) -> show badge

         const card = screen.getByText('Daily Quest 1').closest('.mission-card');
         expect(card).toHaveClass('mission-card--claimed');
    });

    it('handles fallback for unknown endgame missions', () => {
        // If the user has an endgame mission ID that doesn't match definitions
        const unknownEndgameMission: UserMission[] = [
             {
                missionId: 'endgame_unknown_999',
                progress: 0,
                status: 'in_progress',
                startedAt: new Date(),
                updatedAt: new Date()
            }
        ];

         render(
            <MissionList
                dailyMissions={[]}
                weeklyMissions={[]}
                userMissions={unknownEndgameMission}
            />
        );

        // The fallback logic in the component:
        // return { ... title: 'Desafio Secreto' ... }
        // but then `.filter(m => m.title !== 'Desafio Secreto')`
        // So it should NOT render.

        expect(screen.queryByText('Desafio Secreto')).not.toBeInTheDocument();
        // Since it filters out, and activeEndgameMissions will be empty, the section should not appear.
        expect(screen.queryByText('Desafios de Mestre')).not.toBeInTheDocument();
    });
});
