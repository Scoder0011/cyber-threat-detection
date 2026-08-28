import React, { createContext, useContext, useEffect, useState } from "react";
import { beginOAuth, getUser, signInWithPassword, signOut as supabaseSignOut, signUp } from "../api/supabase";

const AuthContext = createContext(null);
const storageKey = "threatlens_session";
const storeSession = (session) => localStorage.setItem(storageKey, JSON.stringify(session));

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
        if (!saved?.access_token) return;
        const nextUser = await getUser(saved.access_token);
        setSession(saved);
        setUser(nextUser);
      } catch {
        localStorage.removeItem(storageKey);
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const completeAuth = async (request) => {
    setIsLoading(true);
    try {
      const nextSession = await request();
      if (!nextSession?.access_token) return { data: nextSession, error: null };
      const nextUser = nextSession.user || await getUser(nextSession.access_token);
      storeSession(nextSession);
      setSession(nextSession);
      setUser(nextUser);
      return { data: { session: nextSession, user: nextUser }, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = (email, password) => completeAuth(() => signInWithPassword(email, password));
  const signUpWithEmail = (email, password, fullName) => completeAuth(() => signUp(email, password, fullName));
  const signInWithOAuth = async (provider) => {
    try {
      beginOAuth(provider);
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };
  const signOut = async () => {
    setIsLoading(true);
    try {
      if (session?.access_token) await supabaseSignOut();
      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      localStorage.removeItem(storageKey);
      setUser(null);
      setSession(null);
      setIsLoading(false);
    }
  };

  return <AuthContext.Provider value={{ user, session, isLoading, isAuthenticated: Boolean(user), signInWithEmail, signUpWithEmail, signInWithOAuth, signOut, getSession: () => session }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
