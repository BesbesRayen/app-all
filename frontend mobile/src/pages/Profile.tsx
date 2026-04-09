import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import { useAppNavigation } from "@/lib/app-navigation";
import { getKycStatus, getProfile, KycStatusResult, UserProfile } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const menuItems = [
  { label: "Informations personnelles", action: "info" as const },
  { label: "Score de credit", action: "score" as const },
  { label: "Mes demandes", action: "requests" as const },
  { label: "Aide & Support", action: "support" as const },
];

const Profile = () => {
  const { navigate } = useAppNavigation();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [kyc, setKyc] = useState<KycStatusResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const [profileData, kycData] = await Promise.all([
          getProfile(user.userId),
          getKycStatus(user.userId),
        ]);
        setProfile(profileData);
        setKyc(kycData);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Impossible de charger votre profil.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  if (!user) {
    return (
      <MobileLayout>
        <View style={styles.emptyWrap}>
          <Text style={styles.title}>Session requise</Text>
          <Text style={styles.kycSub}>Connectez-vous pour voir votre profil.</Text>
          <Pressable onPress={() => navigate("Login")} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Aller a la connexion</Text>
          </Pressable>
        </View>
      </MobileLayout>
    );
  }

  const firstName = profile?.firstName ?? user.firstName;
  const lastName = profile?.lastName ?? user.lastName;
  const email = profile?.email ?? user.email;
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const kycLabel = kyc?.status ?? profile?.kycStatus ?? "PENDING";

  const handleMenuAction = (action: "info" | "score" | "requests" | "support") => {
    switch (action) {
      case "info":
        navigate("PersonalInformation");
        return;
      case "score":
        navigate("Credit");
        return;
      case "requests":
        navigate("Installments");
        return;
      case "support":
        navigate("Support");
        return;
    }
  };

  return (
    <MobileLayout noPadding>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profil</Text>

        {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
        {loading && <Text style={styles.loadingText}>Chargement...</Text>}

        <View style={styles.userCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
          <View>
            <Text style={styles.userName}>{`${firstName} ${lastName}`}</Text>
            <Text style={styles.userMail}>{email}</Text>
          </View>
        </View>

        <View style={styles.kycCard}>
          <Text style={styles.kycTitle}>Verification KYC personnalisée</Text>
          <Text style={styles.kycSub}>{`Statut actuel: ${kycLabel}`}</Text>
          <Pressable style={styles.primaryButton} onPress={() => navigate("Kyc")}>
            <Text style={styles.primaryButtonText}>Demarrer verification</Text>
          </Pressable>
        </View>

        <View style={styles.menuCard}>
          {menuItems.map((menuItem) => (
            <Pressable
              key={menuItem.label}
              style={styles.menuRow}
              onPress={() => handleMenuAction(menuItem.action)}
            >
              <Text style={styles.menuText}>{menuItem.label}</Text>
              {menuItem.badge && <Text style={styles.badge}>{menuItem.badge}</Text>}
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => {
            logout();
            navigate("Login");
          }}
          style={styles.logoutButton}
        >
          <Text style={styles.logoutText}>Se deconnecter</Text>
        </Pressable>
      </ScrollView>
      <BottomNav />
    </MobileLayout>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 100, gap: 14 },
  title: { fontSize: 22, fontWeight: "700", color: "#111827" },
  userCard: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 14, padding: 14, flexDirection: "row", gap: 12, alignItems: "center" },
  avatar: { width: 64, height: 64, borderRadius: 14, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  userName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  userMail: { marginTop: 3, fontSize: 12, color: "#6b7280" },
  kycCard: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#dbeafe", borderRadius: 14, padding: 14 },
  kycTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  kycSub: { marginTop: 6, fontSize: 12, color: "#6b7280", lineHeight: 18 },
  primaryButton: { marginTop: 10, backgroundColor: "#2563eb", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, alignSelf: "flex-start" },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  menuCard: { borderRadius: 14, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#fff", overflow: "hidden" },
  menuRow: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  menuText: { fontSize: 14, color: "#111827", fontWeight: "600" },
  badge: { backgroundColor: "#fef3c7", color: "#92400e", fontSize: 10, fontWeight: "700", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  logoutButton: { borderRadius: 12, borderWidth: 1, borderColor: "#fecaca", paddingVertical: 14, alignItems: "center", backgroundColor: "#fff" },
  logoutText: { color: "#dc2626", fontSize: 14, fontWeight: "700" },
  errorText: { fontSize: 12, color: "#dc2626" },
  loadingText: { fontSize: 12, color: "#6b7280" },
  emptyWrap: { flex: 1, justifyContent: "center", paddingHorizontal: 20, gap: 12 },
});

export default Profile;
