"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/supabase";

type ActionResult = {
  error?: string;
  success?: boolean;
  message?: string;
  data?: any;
};

export const signUpAction = async (prevState: any, formData: FormData): Promise<ActionResult> => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || '';
  
  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long" };
  }

  const supabase = createClient();
  
  try {
    // First, sign up the user with Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          email,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
      },
    });

    if (signUpError) {
      return { error: signUpError.message };
    }

    // If we have a user, ensure their profile is created
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Don't fail the signup if profile creation fails, just log it
      }
    }

    return { 
      success: true, 
      message: 'Check your email for the confirmation link.',
      data: authData 
    };
  } catch (error: any) {
    console.error('Signup error:', error);
    return { error: error.message || "An error occurred during sign up" };
  }
};

export const signInAction = async (prevState: any, formData: FormData): Promise<ActionResult> => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = createClient();
  
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "An error occurred during sign in" };
  }
};

export const forgotPasswordAction = async (prevState: any, formData: FormData): Promise<ActionResult> => {
  const email = formData.get("email")?.toString();

  if (!email) {
    return { error: "Email is required" };
  }

  const supabase = createClient();
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "An error occurred" };
  }
};

export const resetPasswordAction = async (prevState: any, formData: FormData): Promise<ActionResult> => {
  const password = formData.get("password")?.toString() || '';
  const confirmPassword = formData.get("confirmPassword")?.toString() || '';
  const token = formData.get("token")?.toString();

  if (!password || !confirmPassword) {
    return { error: "All fields are required" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long" };
  }

  if (!token) {
    return { error: "Invalid or expired reset token" };
  }

  const supabase = createClient();
  
  try {
    // First verify the token
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery',
    });

    if (verifyError) {
      throw verifyError;
    }

    // Then update the password
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return { 
      error: error.message || "An error occurred while resetting your password. Please try again." 
    };
  }
};

export const signOutAction = async (): Promise<ActionResult> => {
  const supabase = createClient();
  
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "An error occurred during sign out" };
  }
};
