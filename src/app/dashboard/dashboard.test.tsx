import { render, screen } from '@testing-library/react';
import Dashboard from './page';
import { vi } from 'vitest';

vi.mock('@/utils/supabase/client');

// Mock next/navigation once at the top of file
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/dashboard',
}));

describe('Dashboard', () => {
  it('renders dashboard overview', () => {
    render(<Dashboard />);
    
    // Be more specific with your text queries
    expect(screen.getByText('Dashboard Summary')).toBeInTheDocument();
  });
  
  it('shows dashboard content', () => {
    render(<Dashboard />);
    
    // Test for elements that actually exist
    expect(screen.getByText('Your health at a glance')).toBeInTheDocument();
    // When there are multiple elements, use getAllByText and check the count
    expect(screen.getAllByText(/health insights/i).length).toBeGreaterThan(0);
  });
}); 