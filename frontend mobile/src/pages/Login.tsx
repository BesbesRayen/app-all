import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppNavigation } from "@/lib/app-navigation";
import { login } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const Login = () => {
  const { navigate } = useAppNavigation();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Veuillez saisir votre email et mot de passe.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const auth = await login({
        email: email.trim(),
        password,
      });
      setUser({
        userId: auth.userId,
        email: auth.email,
        firstName: auth.firstName,
        lastName: auth.lastName,
      });
      navigate("Home");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Echec de connexion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.headerBlock}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>🛡</Text>
            </View>

            <Text style={styles.title}>
              Bienvenue sur{"\n"}
              <Text style={styles.brand}>CreadiTN</Text>
            </Text>

            <Text style={styles.subtitle}>Votre plateforme de micro-credit intelligent</Text>
          </View>

          <View style={styles.form}>
            <View>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (errorMessage) {
                    setErrorMessage("");
                  }
                }}
                style={styles.input}
                placeholder="vous@exemple.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View>
              <Text style={styles.label}>MOT DE PASSE</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    if (errorMessage) {
                      setErrorMessage("");
                    }
                  }}
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                />

                <Pressable
                  onPress={() => setShowPassword((prev) => !prev)}
                  style={styles.passwordToggle}
                >
                  <Text style={styles.passwordToggleText}>{showPassword ? "🙈" : "👁"}</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.forgotRow}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => navigate("ForgotPassword")}>
                <Text style={styles.forgotText}>Mot de passe oublie ?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isSubmitting && styles.loginButtonDisabled]}
              activeOpacity={0.9}
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              <Text style={styles.loginButtonText}>
                {isSubmitting ? "Connexion..." : "Se connecter ->"}
              </Text>
            </TouchableOpacity>

            {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
          </View>

          <View style={styles.separatorRow}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>ou</Text>
            <View style={styles.separatorLine} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            activeOpacity={0.85}
            onPress={() => navigate("Home")}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleButtonText}>Continuer avec Google</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Pas encore de compte ?{" "}
            <Text style={styles.footerAction} onPress={() => navigate("Register")}>
              Creer un compte
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f8fc",
  },
  flexOne: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  headerBlock: {
    marginBottom: 40,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  logoText: {
    fontSize: 28,
    color: "#ffffff",
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    color: "#111827",
  },
  brand: {
    color: "#2563eb",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#6b7280",
  },
  form: {
    gap: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: "700",
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: "#111827",
  },
  passwordWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingLeft: 14,
    paddingRight: 46,
    paddingVertical: 14,
    fontSize: 14,
    color: "#111827",
  },
  passwordToggle: {
    position: "absolute",
    right: 12,
    height: 34,
    width: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  passwordToggleText: {
    fontSize: 16,
  },
  forgotRow: {
    alignItems: "flex-end",
  },
  forgotText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563eb",
  },
  loginButton: {
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  errorText: {
    marginTop: 4,
    color: "#dc2626",
    fontSize: 12,
    lineHeight: 18,
  },
  separatorRow: {
    marginVertical: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  separatorText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#9ca3af",
  },
  googleButton: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ea4335",
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  footerText: {
    marginTop: 32,
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
  },
  footerAction: {
    fontWeight: "700",
    color: "#2563eb",
  },
});

export default Login;
