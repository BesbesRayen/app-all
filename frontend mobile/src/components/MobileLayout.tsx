import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface MobileLayoutProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

const MobileLayout = ({ children, className = "", noPadding = false }: MobileLayoutProps) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, !noPadding && styles.withPadding]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f8fc",
  },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },
  withPadding: {
    paddingHorizontal: 20,
  },
});

export default MobileLayout;
