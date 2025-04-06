import { createContext, useContext, ReactNode } from 'react';
import { vi } from 'vitest';
import { generateMockActivities, generateMockGoals } from './mock-generators';

// Create a context to hold mock data that can be configured
export const TestDataContext = createContext<{
  user: any;
  activities: any[];
  goals: any[];
  streaks: any[];
  error: any | null;
}>({
  user: null,
  activities: [],
  goals: [],
  streaks: [],
  error: null
});

export const useTestData = () => useContext(TestDataContext);

// Create a provider that sets up test data and mocks
export function SupabaseTestProvider({ 
  children,
  mockData = { 
    user: { 
      id: 'test-user-id',
      email: 'test@example.com'
    },
    activities: generateMockActivities(3),
    goals: generateMockGoals(3),
    streaks: [],
    error: null
  }
}: { 
  children: ReactNode;
  mockData?: {
    user: any;
    activities: any[];
    goals: any[];
    streaks: any[];
    error: any | null;
  }
}) {
  // Mock the createClient function
  vi.mock('@/utils/supabase/client', () => ({
    createClient: vi.fn(() => ({
      auth: {
        getUser: vi.fn(() => Promise.resolve({
          data: { user: mockData.user },
          error: mockData.error
        }))
      },
      from: vi.fn((table) => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => {
              if (mockData.error) {
                return Promise.resolve({ data: null, error: mockData.error });
              }
              
              switch (table) {
                case 'health_activities':
                  return Promise.resolve({ data: mockData.activities, error: null });
                case 'health_goals':
                  return Promise.resolve({ data: mockData.goals, error: null });
                case 'health_streaks':
                  return Promise.resolve({ data: mockData.streaks, error: null });
                default:
                  return Promise.resolve({ data: [], error: null });
              }
            })
          }))
        }))
      }))
    }))
  }));

  return (
    <TestDataContext.Provider value={mockData}>
      {children}
    </TestDataContext.Provider>
  );
} 