/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { AuthResponse } from "@/lib/api";

type AuthUser = Pick<AuthResponse, "userId" | "email" | "firstName" | "lastName">;

interface AuthContextValue {
  user: AuthUser | null;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUserState] = useState<AuthUser | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      setUser: (nextUser) => setUserState(nextUser),
      logout: () => setUserState(null),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};