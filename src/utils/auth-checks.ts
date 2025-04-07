import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login?redirectTo=' + encodeURIComponent(window.location.pathname));
  }
  
  return session;
} 