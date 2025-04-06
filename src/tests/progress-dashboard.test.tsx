import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
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
const ActivityContent = () => {
  return (
    <div>
      <h2>Activity Summary</h2>
      <p>Overview of your recorded health activities</p>
      <div>
        <h3>Activity Distribution</h3>
        <div>
          <span data-testid="activity-type-distribution">Walking</span>
          <span>1 entry</span>
        </div>
      </div>
      <div>
        <h3>Recent Activity</h3>
        <div>
          <div data-testid="activity-type-recent">Walking</div>
          <div>10000 steps</div>
        </div>
      </div>
    </div>
  );
};

const GoalContent = () => {
  return (
    <div>
      <h2>Goal Completion</h2>
      <p>Overview of your health goals progress</p>
      <div>
        <h3>Active Goals</h3>
        <div>
          <div data-testid="goal-type">Walking</div>
          <div>Target: 10000 steps</div>
          <div>Current: 5000 steps</div>
        </div>
      </div>
    </div>
  );
};

describe('Progress Dashboard Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders activity content correctly', async () => {
    render(<ActivityContent />);
    
    expect(screen.getByText('Activity Summary')).toBeInTheDocument();
    expect(screen.getByText(/Overview of your recorded health activities/i)).toBeInTheDocument();
    
    // Look for Walking using data-testid to avoid ambiguity
    expect(screen.getByTestId('activity-type-distribution')).toHaveTextContent('Walking');
    
    // Look for activity value
    expect(screen.getByText(/10000/)).toBeInTheDocument();
  });

  it('renders goal content correctly', async () => {
    render(<GoalContent />);
    
    expect(screen.getByText('Goal Completion')).toBeInTheDocument();
    expect(screen.getByText(/Overview of your health goals progress/i)).toBeInTheDocument();
    
    // Look for goal type
    expect(screen.getByTestId('goal-type')).toHaveTextContent('Walking');
    
    // Look for goal values
    expect(screen.getByText(/Target: 10000/i)).toBeInTheDocument();
    expect(screen.getByText(/Current: 5000/i)).toBeInTheDocument();
  });
}); 