import { StyleSheet, Text, View } from "react-native";

const Index = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Your Blank App</Text>
      <Text style={styles.subtitle}>Start building your amazing project here!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f8fc",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    color: "#111827",
  },
  subtitle: {
    marginTop: 12,
    fontSize: 18,
    textAlign: "center",
    color: "#6b7280",
  },
});

export default Index;
