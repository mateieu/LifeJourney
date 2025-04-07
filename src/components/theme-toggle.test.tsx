import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './theme-toggle';
import { vi } from 'vitest';

// Better mock that actually returns the theme elements
vi.mock('./theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

// Mock Dropdown component to simulate opening
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

describe('ThemeToggle', () => {
  it('renders correctly', () => {
    render(<ThemeToggle />);
    
    expect(screen.getByText(/toggle theme/i)).toBeInTheDocument();
  });
  
  it('has theme options', () => {
    render(<ThemeToggle />);
    
    // The dropdown content is already rendered due to our mock
    expect(screen.getByRole('button', { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dark/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /system/i })).toBeInTheDocument();
  });
}); 