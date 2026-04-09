import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Shops from "./pages/Shops";
import ShopProducts from "./pages/ShopProducts";
import ProductDetail from "./pages/ProductDetail";
import Credit from "./pages/Credit";
import Installments from "./pages/Installments";
import Profile from "./pages/Profile";
import PersonalInformation from "./pages/PersonalInformation";
import EditProfileField from "./pages/EditProfileField";
import Support from "./pages/Support";
import KycVerification from "./pages/KycVerification";
import NotFound from "./pages/NotFound";
import { AppNavigationProvider, AppRoute } from "@/lib/app-navigation";
import { AuthProvider } from "@/lib/auth";

const queryClient = new QueryClient();

const routeRank: Record<AppRoute, number> = {
  Login: 0,
  ForgotPassword: 1,
  Register: 1,
  Home: 2,
  Shops: 3,
  ShopProducts: 4,
  ProductDetail: 5,
  Credit: 3,
  Installments: 3,
  Profile: 3,
  PersonalInformation: 4,
  EditProfileField: 4,
  Support: 3,
  Kyc: 4,
  NotFound: 99,
};

const App = () => {
  const [navState, setNavState] = useState<{ route: AppRoute; params?: Record<string, unknown> }>({ route: "Login" });
  const transition = useRef(new Animated.Value(1)).current;
  const previousRoute = useRef<AppRoute>("Login");
  const direction = useRef(1);

  useEffect(() => {
    const prevRank = routeRank[previousRoute.current] ?? 0;
    const nextRank = routeRank[navState.route] ?? 0;
    direction.current = nextRank >= prevRank ? 1 : -1;

    transition.setValue(0);
    Animated.timing(transition, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    previousRoute.current = navState.route;
  }, [navState.route, transition]);

  const screen = useMemo(() => {
    switch (navState.route) {
      case "Login":
        return <Login />;
      case "ForgotPassword":
        return <ForgotPassword />;
      case "Register":
        return <Register />;
      case "Home":
        return <Home />;
      case "Shops":
        return <Shops />;
      case "ShopProducts":
        return <ShopProducts />;
      case "ProductDetail":
        return <ProductDetail />;
      case "Credit":
        return <Credit />;
      case "Installments":
        return <Installments />;
      case "Profile":
        return <Profile />;
      case "PersonalInformation":
        return <PersonalInformation />;
      case "EditProfileField":
        return <EditProfileField />;
      case "Support":
        return <Support />;
      case "Kyc":
        return <KycVerification />;
      default:
        return <NotFound />;
    }
  }, [navState.route]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppNavigationProvider
          value={{
            route: navState.route,
            params: navState.params,
            navigate: (route, params) => setNavState({ route, params }),
          }}
        >
          <Animated.View
            style={[
              styles.animatedContainer,
              {
                opacity: transition,
                transform: [
                  {
                    translateX: transition.interpolate({
                      inputRange: [0, 1],
                      outputRange: [direction.current * 12, 0],
                    }),
                  },
                  {
                    scale: transition.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.985, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            {screen}
          </Animated.View>
        </AppNavigationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

const styles = StyleSheet.create({
  animatedContainer: {
    flex: 1,
  },
});

export default App;
