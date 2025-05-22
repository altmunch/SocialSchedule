import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          try {
            const cookieList = cookieStore.getAll();
            return cookieList.map(({ name, value }: RequestCookie) => ({
              name,
              value,
            }));
          } catch (error) {
            // If cookies() is called in an environment where it's not allowed
            console.error("Error accessing cookies:", error);
            return [];
          }
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // If cookies() is called in an environment where it's not allowed
            console.error("Error setting cookies:", error);
          }
        },
      },
    }
  );
};
