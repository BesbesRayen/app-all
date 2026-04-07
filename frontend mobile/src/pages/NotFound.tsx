import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppNavigation } from "@/lib/app-navigation";

const NotFound = () => {
  const { navigate } = useAppNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.message}>Oops! Page not found</Text>
      <Pressable onPress={() => navigate("Login")}>
        <Text style={styles.link}>Return to Home</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f7f8fc", gap: 8 },
  code: { fontSize: 42, fontWeight: "700", color: "#111827" },
  message: { fontSize: 20, color: "#6b7280" },
  link: { fontSize: 14, color: "#2563eb", textDecorationLine: "underline" },
});

export default NotFound;
