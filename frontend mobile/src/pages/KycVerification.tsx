import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import MobileLayout from "@/components/MobileLayout";
import { initSumsubKyc, syncSumsubKycStatus } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useAppNavigation } from "@/lib/app-navigation";

const KycVerification = () => {
  const { user } = useAuth();
  const { navigate } = useAppNavigation();
  const [sdkToken, setSdkToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const startKyc = async () => {
    if (!user) {
      navigate("Login");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setStatus("Initialisation KYC...");

    try {
      const session = await initSumsubKyc(user.userId);
      setSdkToken(session.sdkToken);
      setStatus("Verification en cours...");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Impossible de lancer le parcours KYC.");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  const html = useMemo(() => {
    if (!sdkToken) {
      return "";
    }

    const escapedToken = sdkToken.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://static.sumsub.com/idensic/static/sns-websdk-builder.js"></script>
    <style>
      html, body, #sumsub-websdk-container { margin: 0; padding: 0; width: 100%; height: 100%; background: #ffffff; }
    </style>
  </head>
  <body>
    <div id="sumsub-websdk-container"></div>
    <script>
      function sendMessage(payload) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }
      }

      try {
        const accessToken = '${escapedToken}';
        snsWebSdk
          .init(accessToken, function() { return Promise.resolve(accessToken); })
          .withConf({
            lang: 'fr',
            email: '',
            phone: ''
          })
          .withOptions({
            addViewportTag: false,
            adaptIframeHeight: true
          })
          .on('idCheck.onStepCompleted', function(payload) {
            sendMessage({ type: 'stepCompleted', payload: payload });
          })
          .on('idCheck.onApplicantStatusChanged', function(payload) {
            sendMessage({ type: 'statusChanged', payload: payload });
          })
          .on('idCheck.onError', function(payload) {
            sendMessage({ type: 'error', payload: payload });
          })
          .build()
          .launch('#sumsub-websdk-container');
      } catch (error) {
        sendMessage({ type: 'error', payload: { message: String(error) } });
      }
    </script>
  </body>
</html>`;
  }, [sdkToken]);

  return (
    <MobileLayout noPadding>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Verification KYC Sumsub</Text>
          <Text style={styles.subtitle}>Scan CIN, selfie et liveness automatiquement.</Text>
        </View>

        {!sdkToken && (
          <Pressable style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} onPress={startKyc} disabled={loading}>
            <Text style={styles.primaryButtonText}>{loading ? "Lancement..." : "Lancer verification"}</Text>
          </Pressable>
        )}

        {!!status && <Text style={styles.statusText}>{status}</Text>}
        {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

        {!!sdkToken && (
          <View style={styles.webviewContainer}>
            <WebView
              source={{ html }}
              originWhitelist={["*"]}
              javaScriptEnabled
              domStorageEnabled
              onMessage={async (event) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data ?? "{}");

                  if (data.type === "error") {
                    setErrorMessage("Erreur pendant la verification KYC. Veuillez reessayer.");
                    return;
                  }

                  if (user && (data.type === "statusChanged" || data.type === "stepCompleted")) {
                    const result = await syncSumsubKycStatus(user.userId);
                    setStatus(`Statut KYC: ${result.status}`);
                    if (result.status === "APPROVED") {
                      setSdkToken("");
                    }
                  }
                } catch {
                  setErrorMessage("Impossible de traiter le retour du SDK KYC.");
                }
              }}
            />
          </View>
        )}

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
  primaryButton: { backgroundColor: "#2563eb", borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  primaryButtonDisabled: { opacity: 0.7 },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  statusText: { fontSize: 12, color: "#111827" },
  errorText: { fontSize: 12, color: "#dc2626" },
  webviewContainer: { flex: 1, minHeight: 420, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, overflow: "hidden" },
  secondaryButton: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  secondaryButtonText: { color: "#374151", fontSize: 12, fontWeight: "700" },
});

export default KycVerification;
