  import { createContext, ReactNode, useContext } from "react";

export type AppRoute = "Login" | "Home" | "Shops" | "Credit" | "Installments" | "Profile" | "Kyc" | "NotFound";

interface AppNavigationValue {
  route: AppRoute;
  navigate: (route: AppRoute) => void;
}

const AppNavigationContext = createContext<AppNavigationValue | null>(null);

interface AppNavigationProviderProps {
  value: AppNavigationValue;
  children: ReactNode;
}

export const AppNavigationProvider = ({ value, children }: AppNavigationProviderProps) => {
  return <AppNavigationContext.Provider value={value}>{children}</AppNavigationContext.Provider>;
};

export const useAppNavigation = () => {
  const context = useContext(AppNavigationContext);

  if (!context) {
    throw new Error("useAppNavigation must be used inside AppNavigationProvider");
  }

  return context;
};
