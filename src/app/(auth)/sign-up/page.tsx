import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { signUpAction } from "@/app/actions";
import Navbar from "@/components/navbar";
import { redirect } from "next/navigation";

export default async function Signup() {
  const handleSignUp = async (formData: FormData) => {
    'use server';
    const result = await signUpAction(formData);
    
    if (result.error) {
      return redirect(`/sign-up?error=${encodeURIComponent(result.error)}`);
    }
    
    if (result.success) {
      return redirect(`/sign-up?success=${encodeURIComponent(result.success)}`);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-dominator-black px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-dominator-dark/50 p-8 backdrop-blur-sm border border-dominator-dark/50 shadow-2xl">
          <div className="absolute inset-0 -z-10 bg-grid-dominator-dark/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,hsl(var(--background)))]" />
          <form action={handleSignUp} className="flex flex-col space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-dominator-blue to-dominator-magenta bg-clip-text text-transparent">
                Create an Account
              </h1>
              <p className="text-sm text-dominator-light/80">
                Already have an account?{" "}
                <Link
                  className="font-medium text-dominator-blue hover:text-dominator-green transition-colors"
                  href="/sign-in"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium text-dominator-light/90">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="John Doe"
                  required
                  className="w-full bg-dominator-dark/50 border-dominator-dark/50 text-dominator-light placeholder-dominator-light/50 focus:ring-2 focus:ring-dominator-blue focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-dominator-light/90">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full bg-dominator-dark/50 border-dominator-dark/50 text-dominator-light placeholder-dominator-light/50 focus:ring-2 focus:ring-dominator-blue focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-dominator-light/90">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  minLength={6}
                  required
                  className="w-full bg-dominator-dark/50 border-dominator-dark/50 text-dominator-light placeholder-dominator-light/50 focus:ring-2 focus:ring-dominator-blue focus:border-transparent transition-all"
                />
                <p className="text-xs text-dominator-light/50 mt-1">
                  Password must be at least 6 characters long
                </p>
              </div>
            </div>

            <SubmitButton
              pendingText="Creating Account..."
              className="w-full bg-gradient-to-r from-dominator-blue to-dominator-magenta hover:from-dominator-blue/90 hover:to-dominator-magenta/90 text-dominator-black font-semibold py-2.5 rounded-lg transition-all hover:shadow-[0_0_20px_rgba(0,245,255,0.5)]"
            >
              Create Account
            </SubmitButton>

            <FormMessage />
          </form>
        </div>
        <SmtpMessage />
      </div>
    </>
  );
}
