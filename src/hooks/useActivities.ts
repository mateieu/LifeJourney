import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { HealthActivity } from '@/types/health';

export function useActivities() {
  const [activities, setActivities] = useState<HealthActivity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const { data, error: activitiesError } = await supabase
        .from('health_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (activitiesError) throw activitiesError;

      if (!data || data.length === 0) {
        setError('No activities found');
        return;
      }

      setActivities(data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return { activities, error, loading, refetch: fetchActivities };
} 