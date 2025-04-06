export function generateMockActivities(count = 3) {
  const types = ['walking', 'running', 'cycling', 'swimming', 'yoga', 'meditation', 'strength', 'water', 'sleep'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `activity-${i + 1}`,
    user_id: 'test-user-id',
    activity_type: types[i % types.length],
    value: Math.floor(Math.random() * 10000) + 1000,
    completed_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    notes: i % 3 === 0 ? `Note for activity ${i + 1}` : null,
    created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null
  }));
}

export function generateMockGoals(count = 3) {
  const types = ['walking', 'running', 'cycling', 'swimming', 'yoga', 'meditation', 'strength', 'water', 'sleep'];
  const statuses = ['active', 'completed', 'expired'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `goal-${i + 1}`,
    user_id: 'test-user-id',
    goal_type: types[i % types.length],
    target_value: Math.floor(Math.random() * 10000) + 5000,
    current_value: Math.floor(Math.random() * 5000),
    target_date: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: statuses[i % statuses.length],
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null
  }));
} 