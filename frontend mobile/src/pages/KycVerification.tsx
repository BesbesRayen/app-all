import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import MobileLayout from "@/components/MobileLayout";
import { uploadKycDocuments } from "@/lib/api";
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

const KycVerification = () => {
  const { user } = useAuth();
  const { navigate } = useAppNavigation();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [kycStatus, setKycStatus] = useState<KycUiStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [cinNumber, setCinNumber] = useState("");
  const [cinFrontUri, setCinFrontUri] = useState<string | null>(null);
  const [cinBackUri, setCinBackUri] = useState<string | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);

  const pickImage = async (setter: (v: string) => void) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setErrorMessage("Permission galerie refusee.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setter(result.assets[0].uri);
    }
  };

  const submitDocuments = async () => {
    if (!user) {
      navigate("Login");
      return;
    }

    if (!cinFrontUri || !cinNumber.trim()) {
      setErrorMessage("Le numero CIN et la photo CIN frontale sont obligatoires.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const response = await uploadKycDocuments(
        user.userId,
        cinNumber.trim(),
        { uri: cinFrontUri },
        cinBackUri ? { uri: cinBackUri } : null,
        selfieUri ? { uri: selfieUri } : null,
      );
      const nextStatus = normalizeKycStatus(response.status);
      setKycStatus(nextStatus);
      setStatus(`Documents envoyes. Statut: ${response.status}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Echec d'envoi des documents.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout noPadding>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Verification KYC</Text>
          <Text style={styles.subtitle}>Envoyez vos documents pour verification manuelle.</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Upload documents</Text>
          <TextInput value={cinNumber} onChangeText={setCinNumber} placeholder="Numero CIN" style={styles.input} />
          <Pressable style={styles.secondaryButton} onPress={() => pickImage((uri) => setCinFrontUri(uri))}>
            <Text style={styles.secondaryButtonText}>{cinFrontUri ? "CIN front selectionnee" : "Choisir CIN front"}</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => pickImage((uri) => setCinBackUri(uri))}>
            <Text style={styles.secondaryButtonText}>{cinBackUri ? "CIN verso selectionnee" : "Choisir CIN verso (optionnel)"}</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => pickImage((uri) => setSelfieUri(uri))}>
            <Text style={styles.secondaryButtonText}>{selfieUri ? "Selfie selectionne" : "Choisir selfie (optionnel)"}</Text>
          </Pressable>
          <Pressable style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} onPress={submitDocuments} disabled={loading}>
            <Text style={styles.primaryButtonText}>{loading ? "Envoi..." : "Envoyer documents"}</Text>
          </Pressable>
        </View>

        {!!status && <Text style={styles.statusText}>{status}</Text>}
        {!!kycStatus && (
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Statut KYC</Text>
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
        )}
        {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

        <Pressable onPress={() => navigate("Profile")} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Retour profil</Text>
        </Pressable>
      </View>
    </MobileLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20, gap: 12 },
  header: { gap: 4 },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 12, color: "#6b7280" },
  formCard: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, backgroundColor: "#fff", padding: 12, gap: 8 },
  formTitle: { fontSize: 13, fontWeight: "700", color: "#111827" },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, backgroundColor: "#f9fafb", paddingHorizontal: 12, paddingVertical: 10 },
  primaryButton: { backgroundColor: "#2563eb", borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  primaryButtonDisabled: { opacity: 0.7 },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 2 },
  statusLabel: { fontSize: 12, color: "#475569", fontWeight: "700" },
  statusChip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  statusChipPending: { backgroundColor: "#fff7ed", borderColor: "#fdba74" },
  statusChipApproved: { backgroundColor: "#ecfdf5", borderColor: "#6ee7b7" },
  statusChipRejected: { backgroundColor: "#fef2f2", borderColor: "#fca5a5" },
  statusChipText: { fontSize: 11, fontWeight: "800" },
  statusChipTextPending: { color: "#9a3412" },
  statusChipTextApproved: { color: "#065f46" },
  statusChipTextRejected: { color: "#991b1b" },
  statusText: { fontSize: 12, color: "#111827" },
  errorText: { fontSize: 12, color: "#dc2626" },
  secondaryButton: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  secondaryButtonText: { color: "#374151", fontSize: 12, fontWeight: "700" },
});

export default KycVerification;
