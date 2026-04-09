import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import MobileLayout from "@/components/MobileLayout";
import { confirmForgotPassword, requestForgotPassword } from "@/lib/api";
import { useAppNavigation } from "@/lib/app-navigation";

const ForgotPassword = () => {
  const { navigate } = useAppNavigation();
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const sendCode = async () => {
    if (!identifier.trim()) {
      setErrorMessage("Entrez votre email ou numero de telephone.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setMessage("");
    try {
      const res = await requestForgotPassword(identifier.trim());
      setCodeSent(true);
      setMessage(res.message || "Code envoye.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Impossible d'envoyer le code.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!identifier.trim() || !code.trim() || !newPassword.trim()) {
      setErrorMessage("Remplissez tous les champs.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Le mot de passe doit contenir au moins 6 caracteres.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setMessage("");
    try {
      const res = await confirmForgotPassword(identifier.trim(), code.trim(), newPassword);
      setMessage(res.message || "Mot de passe mis a jour.");
      setTimeout(() => navigate("Login"), 700);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Echec de reinitialisation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Mot de passe oublie</Text>
        <Text style={styles.subtitle}>Reinitialisez votre mot de passe par email ou telephone.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email ou telephone</Text>
          <TextInput
            value={identifier}
            onChangeText={setIdentifier}
            style={styles.input}
            placeholder="vous@exemple.com ou +216..."
            autoCapitalize="none"
          />

          {!codeSent && (
            <Pressable style={[styles.primaryButton, loading && styles.disabled]} onPress={sendCode} disabled={loading}>
              <Text style={styles.primaryText}>{loading ? "Envoi..." : "Envoyer code"}</Text>
            </Pressable>
          )}

          {codeSent && (
            <>
              <Text style={styles.label}>Code de verification</Text>
              <TextInput value={code} onChangeText={setCode} style={styles.input} placeholder="123456" keyboardType="number-pad" />

              <Text style={styles.label}>Nouveau mot de passe</Text>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                style={styles.input}
                placeholder="Nouveau mot de passe"
                secureTextEntry
              />

              <Pressable style={[styles.primaryButton, loading && styles.disabled]} onPress={resetPassword} disabled={loading}>
                <Text style={styles.primaryText}>{loading ? "Validation..." : "Changer mot de passe"}</Text>
              </Pressable>
            </>
          )}
        </View>

        {!!message && <Text style={styles.successText}>{message}</Text>}
        {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

        <Pressable onPress={() => navigate("Login")} style={styles.linkWrap}>
          <Text style={styles.linkText}>Retour a la connexion</Text>
        </Pressable>
      </ScrollView>
    </MobileLayout>
  );
};

const styles = StyleSheet.create({
  content: { paddingVertical: 28, gap: 14 },
  title: { fontSize: 26, fontWeight: "800", color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#64748b" },
  card: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", padding: 14, gap: 10 },
  label: { fontSize: 12, color: "#334155", fontWeight: "700" },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, backgroundColor: "#f8fafc" },
  primaryButton: { marginTop: 4, backgroundColor: "#0f766e", borderRadius: 12, alignItems: "center", paddingVertical: 12 },
  primaryText: { color: "#fff", fontWeight: "700" },
  disabled: { opacity: 0.7 },
  successText: { fontSize: 12, color: "#0f766e" },
  errorText: { fontSize: 12, color: "#dc2626" },
  linkWrap: { alignSelf: "flex-start", paddingVertical: 6 },
  linkText: { color: "#2563eb", fontWeight: "700" },
});

export default ForgotPassword;
