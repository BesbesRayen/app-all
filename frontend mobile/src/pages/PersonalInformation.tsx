import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MobileLayout from "@/components/MobileLayout";
import { getProfile, UserProfile } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useAppNavigation } from "@/lib/app-navigation";

type KycUiStatus = "PENDING" | "APPROVED" | "REJECTED";

const normalizeKycStatus = (value?: string | null): KycUiStatus => {
  const status = (value ?? "").toUpperCase();
  if (status === "APPROVED") {
    return "APPROVED";
  }
  if (status === "REJECTED") {
    return "REJECTED";
  }
  return "PENDING";
};

const PersonalInformation = () => {
  const { user } = useAuth();
  const { navigate } = useAppNavigation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!user) {
        navigate("Login");
        return;
      }

      setLoading(true);
      setErrorMessage("");
      try {
        const data = await getProfile(user.userId);
        setProfile(data);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Impossible de charger les informations.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, navigate]);

  const rows = useMemo(() => {
    const firstName = profile?.firstName ?? user?.firstName ?? "";
    const lastName = profile?.lastName ?? user?.lastName ?? "";

    return [
      { label: "Nom", value: `${firstName} ${lastName}`.trim() || "Non renseigne" },
      { label: "Email", value: profile?.email ?? user?.email ?? "Non renseigne" },
      { label: "Telephone", value: profile?.phone || "Non renseigne" },
      { label: "Adresse", value: profile?.address || "Non renseignee" },
      { label: "Profession", value: profile?.profession || "Non renseignee" },
      { label: "Statut KYC", value: profile?.kycStatus || "PENDING" },
    ];
  }, [profile, user]);

  const kycStatus = normalizeKycStatus(profile?.kycStatus);

  return (
    <MobileLayout>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => navigate("Profile")} style={styles.backButton}>
            <Text style={styles.backText}>Retour</Text>
          </Pressable>
          <Text style={styles.title}>Informations personnelles</Text>
        </View>

        {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
        {loading && <Text style={styles.loadingText}>Chargement...</Text>}

        <View style={styles.card}>
          {rows.map((row) => {
            if (row.label === "Statut KYC") {
              return (
                <View key={row.label} style={styles.row}>
                  <Text style={styles.label}>{row.label}</Text>
                  <View
                    style={[
                      styles.statusChip,
                      kycStatus === "APPROVED" && styles.statusChipApproved,
                      kycStatus === "REJECTED" && styles.statusChipRejected,
                      kycStatus === "PENDING" && styles.statusChipPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        kycStatus === "APPROVED" && styles.statusChipTextApproved,
                        kycStatus === "REJECTED" && styles.statusChipTextRejected,
                        kycStatus === "PENDING" && styles.statusChipTextPending,
                      ]}
                    >
                      {kycStatus}
                    </Text>
                  </View>
                </View>
              );
            }

            return (
              <View key={row.label} style={styles.row}>
                <Text style={styles.label}>{row.label}</Text>
                <Text style={styles.value}>{row.value}</Text>
              </View>
            );
          })}
        </View>

        <Pressable style={styles.primaryButton} onPress={() => navigate("EditProfileField")}>
          <Text style={styles.primaryText}>Modifier</Text>
        </Pressable>
      </ScrollView>
    </MobileLayout>
  );
};

const styles = StyleSheet.create({
  content: { paddingVertical: 22, gap: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  backButton: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  backText: { fontSize: 12, fontWeight: "700", color: "#334155" },
  title: { fontSize: 21, fontWeight: "800", color: "#111827", flex: 1 },
  card: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 14, backgroundColor: "#fff", overflow: "hidden" },
  row: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  label: { fontSize: 11, color: "#64748b", fontWeight: "700" },
  value: { marginTop: 2, fontSize: 14, color: "#111827", fontWeight: "600" },
  statusChip: { marginTop: 6, alignSelf: "flex-start", borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  statusChipPending: { backgroundColor: "#fff7ed", borderColor: "#fdba74" },
  statusChipApproved: { backgroundColor: "#ecfdf5", borderColor: "#6ee7b7" },
  statusChipRejected: { backgroundColor: "#fef2f2", borderColor: "#fca5a5" },
  statusChipText: { fontSize: 11, fontWeight: "800" },
  statusChipTextPending: { color: "#9a3412" },
  statusChipTextApproved: { color: "#065f46" },
  statusChipTextRejected: { color: "#991b1b" },
  primaryButton: { backgroundColor: "#0f766e", borderRadius: 12, alignItems: "center", paddingVertical: 12 },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  loadingText: { fontSize: 12, color: "#64748b" },
  errorText: { fontSize: 12, color: "#dc2626" },
});

export default PersonalInformation;
