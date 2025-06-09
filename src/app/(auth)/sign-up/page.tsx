"use client";

import { signUpAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { useEffect, useState, useActionState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SubmitButton({ 
  children, 
  loading = false 
}: { 
  children: React.ReactNode; 
  loading?: boolean 
}) {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      className="w-full bg-gradient-to-r from-dominator-blue to-dominator-magenta hover:from-dominator-blue/90 hover:to-dominator-magenta/90 text-white font-semibold py-2.5 rounded-lg transition-all hover:shadow-[0_0_20px_rgba(0,245,255,0.5)]"
      disabled={loading || pending}
    >
      {(loading || pending) ? 'Creating account...' : children}
    </Button>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, formAction] = useActionState(signUpAction, null);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { pending } = useFormStatus();
  
  // Get message and type from URL search params
  const message = searchParams?.get('message');
  const type = searchParams?.get('type') as 'success' | 'error' | 'info' | 'warning' | null;

  useEffect(() => {
    if (state?.success) {
      router.push("/sign-in?message=Account created successfully! Please check your email to confirm your account.&type=success");
    } else if (state?.error) {
      setFormError(state.error);
    }
  }, [state, router]);

  const handleFormAction = async (formData: FormData) => {
    setIsLoading(true);
    setFormError(null);
    try {
      await formAction(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-2xl bg-gray-900 p-8 border border-gray-700 shadow-2xl">
            <div className="absolute inset-0 -z-10 bg-grid-gray-800/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,#000)]" />
            <div className="flex flex-col items-center space-y-6">
              <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-white">Create an Account</h1>
                <p className="text-gray-300">
                  Already have an account?{" "}
                  <Link 
                    href="/sign-in" 
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    tabIndex={isLoading ? -1 : 0}
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
              
              <form action={handleFormAction} className="w-full space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="John Doe"
                    required
                    disabled={isLoading}
                    className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    disabled={isLoading}
                    className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    minLength={6}
                    required
                    disabled={isLoading}
                    className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Password must be at least 6 characters long
                  </p>
                </div>

                {formError && (
                  <div className="text-red-400 text-sm text-center p-2 bg-red-900/30 rounded-md">
                    {formError}
                  </div>
                )}
                
                {message && (
                  <div className={`text-sm text-center p-2 rounded-md ${
                    type === 'error' ? 'text-red-400 bg-red-900/30' : 'text-green-400 bg-green-900/30'
                  }`}>
                    {message}
                  </div>
                )}

                <SubmitButton loading={isLoading}>
                  Create Account
                </SubmitButton>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
