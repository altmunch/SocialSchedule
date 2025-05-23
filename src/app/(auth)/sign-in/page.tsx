import { signInAction } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import Navbar from "@/components/navbar";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface Message {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
}

interface LoginProps {
  searchParams: Message;
}

export default async function SignInPage({ searchParams }: LoginProps) {
  const message = await searchParams;

  if (message?.message) {
    return (
      <div className="flex h-screen w-full flex-1 items-center justify-center p-4 sm:max-w-md">
        <FormMessage message={message} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-dominator-black px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-dominator-dark/50 p-8 backdrop-blur-sm border border-dominator-dark/50 shadow-2xl">
          <div className="absolute inset-0 -z-10 bg-grid-dominator-dark/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,hsl(var(--background)))]" />
          <form className="flex flex-col space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-dominator-blue to-dominator-magenta bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-sm text-dominator-light/80">
                Don't have an account?{" "}
                <Link
                  className="font-medium text-dominator-blue hover:text-dominator-green transition-colors"
                  href="/sign-up"
                >
                  Create one now
                </Link>
              </p>
            </div>

            <div className="space-y-5">
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
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-medium text-dominator-light/90">
                    Password
                  </Label>
                  <Link
                    className="text-xs text-dominator-blue/80 hover:text-dominator-green transition-colors"
                    href="/forgot-password"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  className="w-full bg-dominator-dark/50 border-dominator-dark/50 text-dominator-light placeholder-dominator-light/50 focus:ring-2 focus:ring-dominator-blue focus:border-transparent transition-all"
                />
              </div>
            </div>

            <SubmitButton
              className="w-full bg-gradient-to-r from-dominator-blue to-dominator-magenta hover:from-dominator-blue/90 hover:to-dominator-magenta/90 text-dominator-black font-semibold py-2.5 rounded-lg transition-all hover:shadow-[0_0_20px_rgba(0,245,255,0.5)]"
              pendingText="Signing in..."
              formAction={signInAction}
            >
              Sign In to Your Account
            </SubmitButton>

            <FormMessage message={message} />
          </form>
        </div>
      </div>
    </>
  );
}
