"use client";

import { signInAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface FormState {
  error: string | null;
  success: boolean;
}

function SubmitButton({ 
  children, 
  loading = false 
}: { 
  children: React.ReactNode; 
  loading?: boolean 
}) {
  return (
    <Button 
      type="submit" 
      className="w-full bg-gradient-to-r from-dominator-blue to-dominator-magenta hover:from-dominator-blue/90 hover:to-dominator-magenta/90 text-white font-semibold py-2.5 rounded-lg transition-all hover:shadow-[0_0_20px_rgba(0,245,255,0.5)]"
      disabled={loading}
    >
      {loading ? 'Signing in...' : children}
    </Button>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true to prevent flash of login
  const [error, setError] = useState<string | null>(null);
  const message = searchParams.get('message');
  const type = searchParams.get('type') as 'success' | 'error' | 'info' | 'warning' | null;

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          router.push('/dashboard');
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signInAction({}, formData);
      
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        router.push("/dashboard");
      } else {
        setError('An unknown error occurred');
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      setError('An error occurred during sign in');
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
                <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back</h1>
                <p className="text-gray-300">Enter your credentials to sign in to your account</p>
              </div>
              
              <form action={handleSubmit} className="w-full space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      tabIndex={isLoading ? -1 : 0}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />

                </div>
                
                <SubmitButton loading={isLoading}>
                  Sign In to Your Account
                </SubmitButton>
                
                {error && (
                  <div className="text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}
                
                {message && (
                  <div className={`text-sm text-center ${
                    type === 'error' ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {message}
                  </div>
                )}
              </form>
              
              <p className="text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <Link
                  href="/sign-up"
                  className="font-medium text-blue-400 hover:text-blue-300 hover:underline"
                  tabIndex={isLoading ? -1 : 0}
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
