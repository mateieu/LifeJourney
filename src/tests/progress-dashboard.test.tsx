import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { createClient } from '@/utils/supabase/client';
import { mockActivity, mockGoal, mockStreak, mockUser } from './test-utils/mock-data';

// Mock essential components and hooks to isolate the components we want to test
vi.mock('@/components/subscription-check', () => ({
  SubscriptionCheck: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock('@/components/dashboard-navbar', () => ({
  default: () => <div>Navbar</div>
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/dashboard/progress'
}));

// Create a custom renderer for specific tab content
const renderActivityContent = () => {
  const ActivityContent = () => {
    const { ActivityDistribution, RecentActivity } = require('@/components/activity-content');
    return (
      <div>
        <h2>Activity Summary</h2>
        <p>Overview of your recorded health activities</p>
        <ActivityDistribution activities={[mockActivity]} />
        <RecentActivity activities={[mockActivity]} />
      </div>
    );
  };
  return render(<ActivityContent />);
};

const renderGoalContent = () => {
  const GoalContent = () => {
    const { GoalSummary, GoalProgress } = require('@/components/goal-content');
    return (
      <div>
        <h2>Goal Completion</h2>
        <p>Overview of your health goals progress</p>
        <GoalSummary goals={[mockGoal]} />
        <GoalProgress goals={[mockGoal]} />
      </div>
    );
  };
  return render(<GoalContent />);
};

describe('Progress Dashboard Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders activity content correctly', async () => {
    renderActivityContent();
    
    expect(screen.getByText('Activity Summary')).toBeInTheDocument();
    expect(screen.getByText(/Overview of your recorded health activities/i)).toBeInTheDocument();
    
    // Look for Walking
    expect(screen.getByText('Walking')).toBeInTheDocument();
    
    // Look for activity value
    expect(screen.getByText(/10000/)).toBeInTheDocument();
  });

  it('renders goal content correctly', async () => {
    renderGoalContent();
    
    expect(screen.getByText('Goal Completion')).toBeInTheDocument();
    expect(screen.getByText(/Overview of your health goals progress/i)).toBeInTheDocument();
    
    // Look for goal type
    expect(screen.getByText('Walking')).toBeInTheDocument();
    
    // Look for goal values
    expect(screen.getByText(/Target: 10000/i)).toBeInTheDocument();
    expect(screen.getByText(/Current: 5000/i)).toBeInTheDocument();
  });
}); 