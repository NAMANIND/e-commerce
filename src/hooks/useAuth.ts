import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  setSession,
  clearSession,
  selectAuth,
  selectIsAuthenticated,
  selectAuthLoading,
} from "@/store/authSlice";

export function useAuth() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { session, user } = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setSession(session));
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setSession(session));
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  const signInWithGoogle = async (
    redirectTo: string = "/profile?checkout=true"
  ) => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}`,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    dispatch(clearSession());
    router.push("/");
  };

  const requireAuth = (redirectTo: string = "/login") => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo + "?redirect=/");
    }
  };

  return {
    session,
    user,
    isAuthenticated,
    loading,
    signInWithGoogle,
    signOut,
    requireAuth,
  };
}
