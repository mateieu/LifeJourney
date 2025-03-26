import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { signUpAction } from "@/app/actions";
import Navbar from "@/components/navbar";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default async function RegisterPage(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="flex h-screen w-full flex-1 items-center justify-center p-4 sm:max-w-md">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="grid md:grid-cols-2 h-full">
          {/* Form Section */}
          <div className="flex flex-col justify-center px-4 py-12 md:px-8 lg:px-12 xl:px-20">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  Create your account
                </h1>
                <p className="text-muted-foreground">
                  Join HealthQuest and start your wellness journey today.
                </p>
              </div>

              <form className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      type="text"
                      placeholder="John Doe"
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      name="password"
                      placeholder="Create a password"
                      minLength={6}
                      required
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 6 characters
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      name="terms"
                      className="mt-1"
                      required
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-muted-foreground"
                    >
                      I agree to the{" "}
                      <Link href="#" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="#" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                </div>

                <SubmitButton
                  formAction={signUpAction}
                  pendingText="Creating account..."
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Create Account
                </SubmitButton>

                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link
                    className="text-primary font-medium hover:underline transition-all"
                    href="/sign-in"
                  >
                    Sign in
                  </Link>
                </div>

                <FormMessage message={searchParams} />
              </form>
            </div>
          </div>

          {/* Feature Highlights Section */}
          <div className="hidden md:flex bg-gradient-to-br from-green-50 to-blue-50 p-12 items-center justify-center">
            <div className="max-w-md space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">
                  Join the HealthQuest Community
                </h2>
                <p className="text-muted-foreground">
                  Transform your health journey into an exciting adventure
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    title: "Personalized Health Journey",
                    description:
                      "Get a custom plan based on your goals and preferences",
                  },
                  {
                    title: "Gamified Experience",
                    description:
                      "Earn points, badges, and rewards as you progress",
                  },
                  {
                    title: "Track Your Progress",
                    description:
                      "Monitor your achievements and build healthy habits",
                  },
                  {
                    title: "Community Support",
                    description:
                      "Connect with others on similar health journeys",
                  },
                ].map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="bg-green-100 p-1 rounded-full">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 text-center">
                <Link
                  href="/questionnaire"
                  className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                >
                  Take the health assessment after signing up
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
