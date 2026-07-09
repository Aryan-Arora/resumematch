import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function useSession() {
  const [session, setSession] = useState(undefined); // undefined = still checking

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return session;
}

export function signOut() {
  return supabase.auth.signOut();
}
