import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createClient } from '@/utils/supabase/client';
import ProgressPage from '@/app/dashboard/progress/page';
import { mockActivity, mockGoal, mockStreak, mockUser } from './test-utils/mock-data';

// Create a test utilities file with the mock data
// src/tests/test-utils/mock-data.ts
export const mockActivity = {
  id: '1',
  user_id: 'test-user-id',
  activity_type: 'walking',
  value: 10000,
  completed_at: new Date().toISOString(),
  notes: null,
  created_at: new Date().toISOString(),
  updated_at: null
};

export const mockGoal = {
  id: '1',
  user_id: 'test-user-id',
  goal_type: 'walking',
  target_value: 10000,
  current_value: 5000,
  target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'active',
  start_date: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: null
};

export const mockStreak = {
  id: '1',
  user_id: 'test-user-id',
  streak_type: 'walking',
  current_streak: 5,
  longest_streak: 10,
  last_activity_date: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: null
};

export const mockUser = {
  id: 'test-user-id',
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  email: 'test@example.com',
  role: '',
  phone: ''
};

// Mock the TabsContent components to always be visible regardless of the tab state
vi.mock('@/components/ui/tabs', async () => {
  const actual = await vi.importActual('@/components/ui/tabs');
  return {
    ...actual,
    TabsContent: ({ children, value }) => (
      <div data-testid={`${value}-content`} data-value={value}>
        {children}
      </div>
    )
  };
});

vi.mock('@/utils/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: mockUser },
        error: null
      }))
    },
    from: vi.fn((table) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => {
            switch (table) {
              case 'health_activities':
                return Promise.resolve({ data: [mockActivity], error: null });
              case 'health_goals':
                return Promise.resolve({ data: [mockGoal], error: null });
              case 'health_streaks':
                return Promise.resolve({ data: [mockStreak], error: null });
              default:
                return Promise.resolve({ data: [], error: null });
            }
          })
        }))
      }))
    }))
  }))
}));

describe('ProgressPage Component - Simplified', () => {
  it('renders activity content correctly', async () => {
    render(<ProgressPage />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Check for activity content (should be visible regardless of tab)
    expect(screen.getByText(/Activity Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Activity Distribution/i)).toBeInTheDocument();
    expect(screen.getByText(/Recent Activity/i)).toBeInTheDocument();
    expect(screen.getByText('Walking')).toBeInTheDocument();
  });

  it('renders goal content correctly', async () => {
    render(<ProgressPage />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Check for goal content (should be visible regardless of tab)
    expect(screen.getByText(/Goal Completion/i)).toBeInTheDocument();
    expect(screen.getByText(/Overview of your health goals progress/i)).toBeInTheDocument();
    expect(screen.getByText('Active Goals')).toBeInTheDocument();
    expect(screen.getByText('Target: 10000')).toBeInTheDocument();
  });
}); 