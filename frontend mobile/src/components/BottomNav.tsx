import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppRoute, useAppNavigation } from "@/lib/app-navigation";

const tabs = [
  { route: "Home" as AppRoute, icon: "home-outline", label: "Accueil" },
  { route: "Shops" as AppRoute, icon: "storefront-outline", label: "Boutiques" },
  { route: "Credit" as AppRoute, icon: "credit-card-outline", label: "Credit" },
  { route: "Support" as AppRoute, icon: "headset", label: "Support" },
  { route: "Profile" as AppRoute, icon: "account-outline", label: "Profil" },
];

const BottomNav = () => {
  const { route, navigate } = useAppNavigation();

  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        {tabs.map((tab) => {
          const isActive = route === tab.route;

          return (
            <Pressable
              key={tab.route}
              onPress={() => navigate(tab.route)}
              style={styles.tabButton}
            >
              <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
                <MaterialCommunityIcons name={tab.icon as never} size={18} style={[styles.icon, isActive && styles.iconActive]} />
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  bar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    paddingVertical: 8,
  },
  tabButton: {
    alignItems: "center",
    paddingVertical: 4,
    width: 64,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxActive: {
    backgroundColor: "#2563eb",
  },
  icon: {
    color: "#6b7280",
  },
  iconActive: {
    color: "#ffffff",
  },
  label: {
    marginTop: 2,
    fontSize: 10,
    color: "#6b7280",
    fontWeight: "600",
  },
  labelActive: {
    color: "#2563eb",
  },
});

export default BottomNav;
