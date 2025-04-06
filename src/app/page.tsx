import { Metadata } from "next";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { HomePage } from "@/components/home-page";

export const metadata: Metadata = {
  title: "LifeJourney - Your Health Tracking App",
  description: "Track your health, fitness and wellness journey in one place",
};

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    redirect("/dashboard");
  }
  
  return <HomePage />;
}
