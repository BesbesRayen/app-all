import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Shops from "./pages/Shops";
import Credit from "./pages/Credit";
import Installments from "./pages/Installments";
import Profile from "./pages/Profile";
import KycVerification from "./pages/KycVerification";
import NotFound from "./pages/NotFound";
import { AppNavigationProvider, AppRoute } from "@/lib/app-navigation";
import { AuthProvider } from "@/lib/auth";

const queryClient = new QueryClient();

const App = () => {
  const [route, setRoute] = useState<AppRoute>("Login");

  const screen = useMemo(() => {
    switch (route) {
      case "Login":
        return <Login />;
      case "Home":
        return <Home />;
      case "Shops":
        return <Shops />;
      case "Credit":
        return <Credit />;
      case "Installments":
        return <Installments />;
      case "Profile":
        return <Profile />;
      case "Kyc":
        return <KycVerification />;
      default:
        return <NotFound />;
    }
  }, [route]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppNavigationProvider value={{ route, navigate: setRoute }}>
          {screen}
        </AppNavigationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
