import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import {
  CreditSimulationResult,
  getMerchants,
  Merchant,
  requestCredit,
  simulateCredit,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useAppNavigation } from "@/lib/app-navigation";

const Credit = () => {
  const { user } = useAuth();
  const { navigate } = useAppNavigation();
  const [amount, setAmount] = useState(500);
  const [months, setMonths] = useState(3);
  const [confirmed, setConfirmed] = useState(false);
  const [requestId, setRequestId] = useState<number | null>(null);
  const [simulation, setSimulation] = useState<CreditSimulationResult | null>(null);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const downPayment = useMemo(() => Number((amount * 0.1).toFixed(3)), [amount]);
  const monthlyPayment = (simulation?.monthlyAmount ?? amount / months).toFixed(3);
  const totalCost = (simulation?.totalAmount ?? amount).toFixed(3);
  const monthOptions = [3, 6, 9, 12];

  useEffect(() => {
    const loadMerchants = async () => {
      try {
        const data = await getMerchants();
        setMerchants(data);
      } catch {
        // Merchant is optional for request payload, so ignore this load error.
      }
    };

    loadMerchants();
  }, []);

  useEffect(() => {
    const loadSimulation = async () => {
      try {
        const result = await simulateCredit({
          totalAmount: amount,
          downPayment,
          numberOfInstallments: months,
        });
        setSimulation(result);
      } catch {
        setSimulation(null);
      }
    };

    loadSimulation();
  }, [amount, downPayment, months]);

  const handleConfirmRequest = async () => {
    if (!user) {
      navigate("Login");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const result = await requestCredit(user.userId, {
        totalAmount: amount,
        downPayment,
        numberOfInstallments: months,
        merchantId: merchants[0]?.id,
      });
      setRequestId(result.id);
      setConfirmed(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Demande de credit echouee.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <MobileLayout>
        <View style={styles.confirmedWrap}>
          <Text style={styles.confirmedTitle}>Session requise</Text>
          <Text style={styles.confirmedSub}>Connectez-vous pour faire une demande de credit.</Text>
          <Pressable onPress={() => navigate("Login")} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Aller a la connexion</Text>
          </Pressable>
        </View>
      </MobileLayout>
    );
  }

  if (confirmed) {
    return (
      <MobileLayout>
        <View style={styles.confirmedWrap}>
          <View style={styles.confirmedIcon}><Text style={styles.confirmedIconText}>✓</Text></View>
          <View>
            <Text style={styles.confirmedTitle}>Demande Confirmee</Text>
            <Text style={styles.confirmedSub}>
              {amount.toFixed(3)} TND en {months} mensualités
            </Text>
            {requestId !== null && <Text style={styles.confirmedSub}>{`Reference #${requestId}`}</Text>}
          </View>
          <Pressable onPress={() => setConfirmed(false)} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Nouvelle Demande</Text>
          </Pressable>
        </View>
        <BottomNav />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout noPadding>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Demande de Credit</Text>
        <Text style={styles.subtitle}>Simulez votre plan de paiement</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Montant</Text>
          <Text style={styles.amount}>{amount.toFixed(3)} TND</Text>
          <View style={styles.rangeRow}>
            {[100, 500, 1000, 2500, 5000].map((a) => (
              <Pressable
                key={a}
                style={[styles.amountChip, amount === a && styles.amountChipActive]}
                onPress={() => setAmount(a)}
              >
                <Text style={[styles.amountChipText, amount === a && styles.amountChipTextActive]}>{a}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <Text style={styles.cardLabel}>Mensualites</Text>
          <View style={styles.monthRow}>
            {monthOptions.map((m) => (
              <Pressable key={m} style={[styles.monthChip, months === m && styles.monthChipActive]} onPress={() => setMonths(m)}>
                <Text style={[styles.monthChipText, months === m && styles.monthChipTextActive]}>{m} mois</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resume</Text>
          <View style={styles.summaryRow}><Text style={styles.summaryKey}>Mensualite</Text><Text style={styles.summaryValue}>{monthlyPayment} TND</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryKey}>Apport</Text><Text style={styles.summaryValue}>{downPayment.toFixed(3)} TND</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryKey}>Total</Text><Text style={styles.summaryValue}>{totalCost} TND</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryKey}>Duree</Text><Text style={styles.summaryValue}>{months} mois</Text></View>
        </View>

        {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

        <Pressable onPress={handleConfirmRequest} style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} disabled={loading}>
          <Text style={styles.primaryButtonText}>{loading ? "Envoi en cours..." : "Confirmer la demande"}</Text>
        </Pressable>
      </ScrollView>
      <BottomNav />
    </MobileLayout>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 100, gap: 14 },
  title: { fontSize: 22, fontWeight: "700", color: "#111827" },
  subtitle: { marginTop: 4, fontSize: 14, color: "#6b7280" },
  card: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 14, padding: 14 },
  cardLabel: { fontSize: 12, color: "#6b7280", fontWeight: "700", textTransform: "uppercase" },
  amount: { marginTop: 10, fontSize: 30, fontWeight: "700", color: "#111827" },
  rangeRow: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  amountChip: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#fff" },
  amountChipActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  amountChipText: { fontSize: 12, fontWeight: "700", color: "#374151" },
  amountChipTextActive: { color: "#fff" },
  monthRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  monthChip: { width: "23%", minWidth: 70, alignItems: "center", paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#fff" },
  monthChipActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  monthChipText: { fontSize: 13, fontWeight: "700", color: "#111827" },
  monthChipTextActive: { color: "#fff" },
  summaryCard: { borderRadius: 14, backgroundColor: "#111827", padding: 14, gap: 8 },
  summaryTitle: { color: "#9ca3af", fontSize: 12, textTransform: "uppercase", fontWeight: "700" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryKey: { color: "#9ca3af", fontSize: 13 },
  summaryValue: { color: "#fff", fontSize: 13, fontWeight: "700" },
  primaryButton: { marginTop: 4, backgroundColor: "#2563eb", borderRadius: 12, paddingVertical: 15, alignItems: "center" },
  primaryButtonDisabled: { opacity: 0.7 },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  confirmedWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  confirmedIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#d1fae5", alignItems: "center", justifyContent: "center" },
  confirmedIconText: { fontSize: 40, color: "#059669" },
  confirmedTitle: { textAlign: "center", fontSize: 22, fontWeight: "700", color: "#111827" },
  confirmedSub: { marginTop: 6, textAlign: "center", color: "#6b7280" },
  errorText: { marginTop: 2, color: "#dc2626", fontSize: 12 },
});

export default Credit;
