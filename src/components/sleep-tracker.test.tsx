import { render, screen, waitFor } from '@testing-library/react';
import { SleepTracker } from './sleep-tracker';
import { vi } from 'vitest';

// Mock dependencies
vi.mock('@/utils/supabase/client', () => {
  return {
    createClient: vi.fn().mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ 
          data: { user: { id: 'test-user-id' } }, 
          error: null 
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockImplementation(() => Promise.resolve({ 
          data: [], 
          error: null 
        })),
      }),
    }),
  };
});

describe('SleepTracker', () => {
  it('initially renders a loading skeleton', () => {
    render(<SleepTracker />);
    
    // Check for loading skeleton
    const loadingSkeleton = document.querySelector('.animate-pulse');
    expect(loadingSkeleton).toBeTruthy();
  });
  
  it('eventually renders sleep tracker content', async () => {
    render(<SleepTracker />);
    
    // Wait for real content to appear
    await waitFor(() => {
      // Check for the specific title instead of generic text
      const sleepTitle = screen.getByRole('heading', { name: 'Sleep Tracker' });
      expect(sleepTitle).toBeInTheDocument();
    }, { timeout: 2000 });
  });
}); 