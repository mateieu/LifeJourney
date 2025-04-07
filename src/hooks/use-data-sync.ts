import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useErrorHandler } from "@/utils/error-handling";
import { useToast } from "@/components/ui/use-toast";

export function useDataSync<T>(
  tableName: string,
  initialFetch: boolean = true,
  queryOptions: any = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(initialFetch);
  const [syncing, setSyncing] = useState(false);
  const { handleError } = useErrorHandler();
  const { toast } = useToast();
  const supabase = createClient();
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      let query = supabase
        .from(tableName)
        .select('*')
        .eq('user_id', user.id);
        
      // Apply additional query options
      if (queryOptions.order) {
        query = query.order(queryOptions.order.column, { ascending: queryOptions.order.ascending });
      }
      
      if (queryOptions.limit) {
        query = query.limit(queryOptions.limit);
      }
      
      const { data: results, error } = await query;
      
      if (error) throw error;
      
      setData(results || []);
    } catch (error) {
      handleError(error, `Failed to fetch data from ${tableName}`);
    } finally {
      setLoading(false);
    }
  };
  
  const addOrUpdate = async (item: Partial<T>) => {
    try {
      setSyncing(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const itemWithUserId = {
        ...item,
        user_id: user.id,
      };
      
      const { data: result, error } = await supabase
        .from(tableName)
        .upsert(itemWithUserId)
        .select();
      
      if (error) throw error;
      
      // Update local data
      if (result && result[0]) {
        const newItem = result[0];
        const index = data.findIndex((i: any) => i.id === newItem.id);
        
        if (index >= 0) {
          // Update existing item
          const newData = [...data];
          newData[index] = newItem as T;
          setData(newData);
        } else {
          // Add new item
          setData([...data, newItem as T]);
        }
        
        toast({
          title: "Success",
          description: "Your data has been saved",
        });
      }
      
      return result?.[0] || null;
    } catch (error) {
      handleError(error, "Failed to save data");
      return null;
    } finally {
      setSyncing(false);
    }
  };
  
  const remove = async (id: string) => {
    try {
      setSyncing(true);
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local data
      setData(data.filter((item: any) => item.id !== id));
      
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      
      return true;
    } catch (error) {
      handleError(error, "Failed to delete item");
      return false;
    } finally {
      setSyncing(false);
    }
  };
  
  useEffect(() => {
    if (initialFetch) {
      fetchData();
    }
    
    // Set up realtime subscription for syncing data
    const channel = supabase
      .channel(`table:${tableName}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: tableName 
        }, 
        (payload) => {
          // Automatically refresh data when changes occur
          fetchData();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName]);
  
  return {
    data,
    loading,
    syncing,
    fetchData,
    addOrUpdate,
    remove
  };
} 