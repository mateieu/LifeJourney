import { render, screen, waitFor } from '@testing-library/react';
import { LifeCalendar } from './life-calendar';
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
        order: vi.fn().mockImplementation(() => Promise.resolve({ 
          data: [], 
          error: null 
        })),
      }),
    }),
  };
});

// Mock the ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

describe('LifeCalendar', () => {
  it('starts with a loading state', () => {
    render(<LifeCalendar />);
    
    // Test for a loading indicator or skeleton
    const loadingElement = document.querySelector('.animate-pulse');
    expect(loadingElement).toBeTruthy();
  });

  it('eventually shows calendar content', async () => {
    render(<LifeCalendar />);
    
    // Wait for calendar title to appear - looking for specific title
    await waitFor(() => {
      // Look specifically for the "Life Calendar" heading
      const lifeCalendarHeading = screen.getByRole('heading', { name: 'Life Calendar' });
      expect(lifeCalendarHeading).toBeInTheDocument();
    }, { timeout: 2000 });
  });
}); 