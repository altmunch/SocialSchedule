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
      className="w-full bg-gradient-to-r from-[#8D5AFF] to-[#5afcc0] hover:from-[#8D5AFF]/90 hover:to-[#5afcc0]/90 text-white font-semibold py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-[#8D5AFF]/20 h-12"
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-[#8D5AFF]/20 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#5afcc0]/10 rounded-full filter blur-3xl"></div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Logo/Brand */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#8D5AFF] to-[#5afcc0] rounded-2xl mb-4">
                <span className="text-2xl font-bold text-white">CC</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome back</h1>
              <p className="text-gray-300">Sign in to your ClipsCommerce account</p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
              <form action={handleSubmit} ref={formRef} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300 font-medium">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#8D5AFF] focus:border-transparent rounded-xl h-12 transition-all"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-300 font-medium">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-[#8D5AFF] hover:text-[#8D5AFF]/80 transition-colors"
                      tabIndex={isLoading ? -1 : 0}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#8D5AFF] focus:border-transparent rounded-xl h-12 transition-all"
                    disabled={isLoading}
                  />
                </div>
                
                <SubmitButton loading={isLoading}>
                  Sign In to Your Account
                </SubmitButton>
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <div className="text-red-400 text-sm text-center">
                      {error}
                    </div>
                  </div>
                )}
                
                {message && (
                  <div className={`border rounded-xl p-4 ${
                    type === 'error' 
                      ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                      : 'bg-green-500/10 border-green-500/20 text-green-400'
                  }`}>
                    <div className="text-sm text-center">
                      {message}
                    </div>
                  </div>
                )}
              </form>
              
              <div className="mt-8 pt-6 border-t border-gray-700/50">
                <p className="text-center text-sm text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    href="/sign-up"
                    className="font-medium text-[#8D5AFF] hover:text-[#8D5AFF]/80 hover:underline transition-colors"
                    tabIndex={isLoading ? -1 : 0}
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
