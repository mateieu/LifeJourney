'use client';

import { useEffect, useState } from 'react';
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import Footer from "@/components/footer";
import { createClient } from '@/utils/supabase/client';
import AuthRedirect from '@/components/auth-redirect';
import {
  ArrowUpRight,
  CheckCircle2,
  Trophy,
  Heart,
  Activity,
  Medal,
  Target,
  Flame,
  Clock,
  Award,
  Dumbbell,
  Utensils,
} from "lucide-react";
import { Logo } from '@/components/ui/logo';

export default function Home() {
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        
        // Get user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (!userError) {
          setUser(user);
        }
        
        // Get plans
        const { data: plansData, error: plansError } = await supabase.functions.invoke(
          "supabase-functions-get-plans",
        );
        if (!plansError) {
          setPlans(plansData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <AuthRedirect />
      
      <Navbar />
      <Hero />

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-2 bg-green-100 rounded-full mb-4">
              <Trophy className="w-5 h-5 text-green-600" />
              <span className="ml-2 text-sm font-medium text-green-800">
                Gamified Health
              </span>
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Transform Your Health Journey
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our app turns healthy habits into an engaging adventure with
              personalized quests and meaningful rewards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Target className="w-6 h-6" />,
                title: "Personalized Goals",
                description:
                  "Custom health journeys based on your unique needs",
              },
              {
                icon: <Medal className="w-6 h-6" />,
                title: "Achievement Badges",
                description: "Earn badges that showcase your health milestones",
              },
              {
                icon: <Flame className="w-6 h-6" />,
                title: "Streak Tracking",
                description: "Build momentum with daily habit streaks",
              },
              {
                icon: <Trophy className="w-6 h-6" />,
                title: "Real Rewards",
                description: "Unlock tangible benefits as you progress",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="text-green-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Paths Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Choose Your Health Adventure
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select a journey path that aligns with your wellness goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <Flame className="w-10 h-10" />,
                title: "Weight Loss",
                description:
                  "A structured path to help you shed pounds through balanced nutrition and effective workouts",
                features: [
                  "Calorie tracking",
                  "Cardio-focused workouts",
                  "Nutrition guidance",
                ],
              },
              {
                icon: <Dumbbell className="w-10 h-10" />,
                title: "Muscle Gain",
                description:
                  "Build strength and muscle with progressive resistance training and protein-rich nutrition",
                features: [
                  "Strength training plans",
                  "Protein intake tracking",
                  "Recovery monitoring",
                ],
              },
              {
                icon: <Heart className="w-10 h-10" />,
                title: "General Wellness",
                description:
                  "Improve overall health with balanced habits focusing on nutrition, activity, and mindfulness",
                features: [
                  "Habit building",
                  "Stress management",
                  "Sleep quality tracking",
                ],
              },
            ].map((path, index) => (
              <div
                key={index}
                className="p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="bg-green-100 p-4 rounded-full inline-block mb-6">
                  <div className="text-green-600">{path.icon}</div>
                </div>
                <h3 className="text-2xl font-bold mb-3">{path.title}</h3>
                <p className="text-gray-600 mb-6">{path.description}</p>
                <ul className="space-y-2">
                  {path.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-green-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-green-100">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500K+</div>
              <div className="text-green-100">Quests Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1M+</div>
              <div className="text-green-100">Badges Earned</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">85%</div>
              <div className="text-green-100">Habit Retention</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              How Your Health Journey Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A simple process to gamify your wellness and achieve lasting
              results.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <Award className="w-8 h-8" />,
                title: "Create Profile",
                description:
                  "Set your health goals and choose your journey path",
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: "Daily Quests",
                description: "Complete personalized health activities each day",
              },
              {
                icon: <Flame className="w-8 h-8" />,
                title: "Build Streaks",
                description: "Maintain consistency and watch your streaks grow",
              },
              {
                icon: <Trophy className="w-8 h-8" />,
                title: "Earn Rewards",
                description:
                  "Unlock badges and real-world benefits as you progress",
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center">
                  <div className="bg-green-100 p-4 rounded-full mb-6">
                    <div className="text-green-600">{step.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-600 text-center">
                    {step.description}
                  </p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gray-200 -z-10 transform -translate-x-1/2">
                    <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 rotate-45">
                      <ArrowUpRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gray-50" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-2 bg-green-100 rounded-full mb-4">
              <Medal className="w-5 h-5 text-green-600" />
              <span className="ml-2 text-sm font-medium text-green-800">
                Membership Plans
              </span>
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Choose Your Wellness Plan
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Invest in your health with our flexible membership options.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans?.map((item) => (
              <PricingCard key={item.id} item={item} user={user} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Begin Your Health Adventure Today
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands who have transformed their health journey into an
            exciting game of progress and rewards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/dashboard"
              className="inline-flex items-center px-8 py-4 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Start Your Journey
              <ArrowUpRight className="ml-2 w-5 h-5" />
            </a>
            <a
              href="/sign-up"
              className="inline-flex items-center px-8 py-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Sign Up Free
              <ArrowUpRight className="ml-2 w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
