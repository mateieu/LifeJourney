import { render } from '@testing-library/react';
import { vi } from 'vitest';
import ProgressPage from '@/app/dashboard/progress/page';

// Mock critical dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  })),
  usePathname: vi.fn(() => '/dashboard/progress'),
}));

vi.mock('@/utils/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'test-user' } },
        error: null
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ 
            data: [{ id: '1', user_id: 'test-user', activity_type: 'walking', value: 10000 }], 
            error: null 
          }))
        }))
      }))
    }))
  }))
}));

vi.mock('@/components/dashboard-navbar', () => ({
  default: () => <div>DashboardNavbar</div>
}));

vi.mock('@/components/subscription-check', () => ({
  SubscriptionCheck: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('ProgressPage Component Visual Test', () => {
  it('renders without crashing', () => {
    const { asFragment } = render(<ProgressPage />);
    expect(asFragment()).toBeTruthy();
  });
}); 