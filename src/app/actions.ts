"use server";

import { encodedRedirect } from "@/utils/utils";
import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";
import { PostgrestError } from "@supabase/supabase-js";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || '';
  const supabase = await createClient();

  // Input validation
  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  if (password.length < 6) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Password must be at least 6 characters long",
    );
  }

  if (!email.includes('@')) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Please enter a valid email address",
    );
  }

  try {
    // Step 1: Create auth user
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          email: email,
        }
      },
    });

    if (signUpError) {
      // Handle specific auth errors
      if (signUpError.message.includes('unique')) {
        return encodedRedirect(
          "error",
          "/sign-up",
          "This email is already registered. Please sign in instead.",
        );
      }
      return encodedRedirect("error", "/sign-up", signUpError.message);
    }

    if (!user) {
      return encodedRedirect(
        "error",
        "/sign-up",
        "Registration failed. Please try again.",
      );
    }

    // Step 2: Create user profile
    try {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          user_id: user.id,
          name: fullName,
          email: email,
          token_identifier: user.id,
          created_at: new Date().toISOString()
        });

      if (profileError) {
        // Handle specific database errors
        if (profileError.code === '23505') { // Unique violation
          return encodedRedirect(
            "error",
            "/sign-up",
            "An account with this email already exists.",
          );
        }
        if (profileError.code === '42P01') { // Undefined table
          return encodedRedirect(
            "error",
            "/sign-up",
            "System configuration error. Please contact support.",
          );
        }
        // Log the error code for debugging
        console.error(`Database error code: ${profileError.code}`);
        return encodedRedirect(
          "error",
          "/sign-up",
          "Could not create user profile. Please try again.",
        );
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      return encodedRedirect(
        "error",
        "/sign-up",
        "Failed to create user profile. Please try again later.",
      );
    }

    // Success case
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return encodedRedirect(
      "error",
      "/sign-up",
      "An unexpected error occurred. Please try again later.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {});

  if (error) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const checkUserSubscription = async (userId: string) => {
  const supabase = await createClient();

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error) {
    return false;
  }

  return !!subscription;
};
