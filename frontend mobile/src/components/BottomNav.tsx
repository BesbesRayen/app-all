import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppRoute, useAppNavigation } from "@/lib/app-navigation";

const tabs = [
  { route: "Home" as AppRoute, icon: "⌂", label: "Accueil" },
  { route: "Shops" as AppRoute, icon: "◫", label: "Boutiques" },
  { route: "Credit" as AppRoute, icon: "¤", label: "Credit" },
  { route: "Installments" as AppRoute, icon: "◷", label: "Echeances" },
  { route: "Profile" as AppRoute, icon: "☺", label: "Profil" },
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
                <Text style={[styles.icon, isActive && styles.iconActive]}>{tab.icon}</Text>
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
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "700",
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
