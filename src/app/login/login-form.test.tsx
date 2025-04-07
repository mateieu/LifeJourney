import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './login-form';
import { createClient } from '@/utils/supabase/client';
import { vi } from 'vitest';

vi.mock('@/utils/supabase/client', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('LoginForm', () => {
  it('renders the login form', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
  
  it('shows validation errors for empty fields', async () => {
    render(<LoginForm />);
    
    // Submit without filling fields
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });
  
  it('handles successful login', async () => {
    // Mock successful auth
    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: 'test-id' } }, error: null }),
      },
    };
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);
    
    render(<LoginForm />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check if login is handled
    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
}); 