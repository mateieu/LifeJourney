// Create mock data for tests
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