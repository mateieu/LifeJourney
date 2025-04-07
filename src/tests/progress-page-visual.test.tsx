import { render, screen } from '@testing-library/react';
import ProgressPage from '@/app/dashboard/progress/page';
import { vi } from 'vitest';

// Mock the DashboardNavbar component
vi.mock('@/components/dashboard-navbar', () => ({
  DashboardNavbar: ({ user }: { user: any }) => (
    <div data-testid="mocked-navbar">Mocked Navbar</div>
  )
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn().mockReturnValue({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn()
  }),
  usePathname: vi.fn().mockReturnValue('/dashboard/progress')
}));

// Mock Supabase client 
vi.mock('@/utils/supabase/client', () => ({
  createClient: vi.fn().mockReturnValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ 
        data: { user: { id: 'test-user-id' } }, 
        error: null 
      }),
      getSession: vi.fn().mockResolvedValue({ 
        data: { session: { user: { id: 'test-user-id' } } }, 
        error: null 
      })
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockImplementation(() => Promise.resolve({ 
        data: [], 
        error: null 
      }))
    })
  })
}));

// Mock subscription check component
vi.mock('@/components/subscription-check', () => ({
  SubscriptionCheck: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('ProgressPage Component Visual Test', () => {
  it('renders without crashing', async () => {
    render(<ProgressPage />);
    
    // Just check that the page renders without throwing an error
    expect(screen.getByTestId('mocked-navbar')).toBeInTheDocument();
  });
}); 