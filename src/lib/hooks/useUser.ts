import { useEffect, useState } from "react";
import { supabaseClient } from "../../db/supabase.client";
import type { User } from "@supabase/supabase-js";

/**
 * Custom hook to fetch and manage currently logged in user data
 * @returns Object containing user data, loading state and error
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        setIsLoading(true);
        const { data, error } = await supabaseClient.auth.getUser();

        if (error) {
          throw error;
        }

        if (data?.user) {
          setUser(data.user);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred fetching user data");
        console.error("Error fetching user:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();

    // Set up auth state change listener
    const { data: authListener } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (session?.user) {
        setUser(session.user);
      }
    });

    // Clean up subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading, error };
}
