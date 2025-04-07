import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock matchMedia for components that depend on window.matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {},
    addEventListener: function() {},
    removeEventListener: function() {},
    dispatchEvent: function() {},
  };
};

// Mock Supabase
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
      getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'test-user-id' } } }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation(callback => Promise.resolve(callback({ data: [], error: null }))),
    }),
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  })),
  usePathname: jest.fn(() => '/dashboard'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock date-fns functions often used in the app
jest.mock('date-fns', () => {
  const actualDateFns = jest.requireActual('date-fns');
  return {
    ...actualDateFns,
    format: jest.fn((date, format) => '2023-01-01'),
    parseISO: jest.fn(str => new Date('2023-01-01')),
    startOfWeek: jest.fn(date => new Date('2023-01-01')),
    endOfWeek: jest.fn(date => new Date('2023-01-07')),
    eachDayOfInterval: jest.fn(() => Array(7).fill(0).map((_, i) => new Date(`2023-01-0${i+1}`))),
    addWeeks: jest.fn(date => date),
    subWeeks: jest.fn(date => date),
    isSameDay: jest.fn(() => false),
  };
});

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder; 