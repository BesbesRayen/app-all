import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import { getMyInstallments, Installment, payInstallment } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useAppNavigation } from "@/lib/app-navigation";

const toMoney = (amount: number) => `${amount.toFixed(3)} TND`;
const toPrettyDate = (dateIso: string) => new Date(dateIso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });

const Installments = () => {
  const { user } = useAuth();
  const { navigate } = useAppNavigation();
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadInstallments = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const data = await getMyInstallments(user.userId);
      setInstallments(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Impossible de charger les echeances.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadInstallments();
  }, [loadInstallments]);

  const overdueInstallment = useMemo(
    () => installments.find((item) => item.status === "OVERDUE") ?? null,
    [installments],
  );

  const totalPaid = installments.filter((i) => i.status === "PAID").length;
  const total = installments.length;
  const pct = total > 0 ? Math.round((totalPaid / total) * 100) : 0;

  const handlePayOverdue = async () => {
    if (!user || !overdueInstallment) {
      return;
    }

    setPaying(true);
    setErrorMessage("");
    try {
      await payInstallment(user.userId, overdueInstallment.id, overdueInstallment.amount);
      await loadInstallments();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Le paiement a echoue.");
    } finally {
      setPaying(false);
    }
  };

  if (!user) {
    return (
      <MobileLayout>
        <View style={styles.emptyWrap}>
          <Text style={styles.title}>Session requise</Text>
          <Text style={styles.subtitle}>Connectez-vous pour afficher vos echeances.</Text>
          <Pressable onPress={() => navigate("Login")} style={styles.dangerButton}>
            <Text style={styles.dangerText}>Aller a la connexion</Text>
          </Pressable>
        </View>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout noPadding>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Echeances</Text>
        <Text style={styles.subtitle}>{totalPaid}/{total} payees</Text>

        {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
        {loading && <Text style={styles.subtitle}>Chargement...</Text>}

        <View style={styles.progressCard}>
          <View style={styles.progressHead}><Text style={styles.progressLabel}>Progression</Text><Text style={styles.progressPct}>{pct}%</Text></View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
        </View>

        <View style={styles.listCard}>
          {installments.map((inst, i) => (
            <View key={`${inst.id}-${i}`} style={[styles.listRow, inst.status === "OVERDUE" && styles.listRowOverdue]}>
              <View style={styles.listInfo}>
                <Text style={styles.monthText}>{`Echeance #${inst.id}`}</Text>
                <Text style={styles.dateText}>{toPrettyDate(inst.dueDate)}</Text>
              </View>
              <View style={styles.listRight}>
                <Text style={styles.amountText}>{toMoney(inst.amount)}</Text>
                <Text style={[styles.statusText, inst.status === "PAID" && styles.paid, inst.status === "OVERDUE" && styles.overdue]}>
                  {inst.status === "PAID" ? "Paye" : inst.status === "OVERDUE" ? "En retard" : "A venir"}
                </Text>
              </View>
            </View>
          ))}
          {!loading && installments.length === 0 && <Text style={styles.emptyText}>Aucune echeance trouvee.</Text>}
        </View>

        {overdueInstallment && (
          <Pressable style={[styles.dangerButton, paying && styles.dangerButtonDisabled]} onPress={handlePayOverdue} disabled={paying}>
            <Text style={styles.dangerText}>{paying ? "Paiement..." : "Payer l'echeance en retard"}</Text>
          </Pressable>
        )}
      </ScrollView>
      <BottomNav />
    </MobileLayout>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 100, gap: 14 },
  title: { fontSize: 22, fontWeight: "700", color: "#111827" },
  subtitle: { marginTop: 2, fontSize: 14, color: "#6b7280" },
  progressCard: { marginTop: 6, backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#e5e7eb", padding: 14 },
  progressHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { fontSize: 12, textTransform: "uppercase", color: "#6b7280", fontWeight: "700" },
  progressPct: { fontSize: 14, color: "#111827", fontWeight: "700" },
  progressTrack: { height: 10, borderRadius: 6, backgroundColor: "#e5e7eb", overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#2563eb" },
  listCard: { backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#e5e7eb", overflow: "hidden" },
  listRow: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6", flexDirection: "row", justifyContent: "space-between" },
  listRowOverdue: { backgroundColor: "#fef2f2" },
  listInfo: { flex: 1 },
  monthText: { fontSize: 14, fontWeight: "600", color: "#111827" },
  dateText: { marginTop: 2, fontSize: 11, color: "#6b7280" },
  listRight: { alignItems: "flex-end" },
  amountText: { fontSize: 14, fontWeight: "700", color: "#111827" },
  statusText: { marginTop: 2, fontSize: 11, color: "#6b7280", fontWeight: "700" },
  paid: { color: "#059669" },
  overdue: { color: "#dc2626" },
  dangerButton: { backgroundColor: "#dc2626", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  dangerButtonDisabled: { opacity: 0.7 },
  dangerText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  errorText: { fontSize: 12, color: "#dc2626" },
  emptyText: { paddingHorizontal: 14, paddingVertical: 12, color: "#6b7280", fontSize: 12 },
  emptyWrap: { flex: 1, justifyContent: "center", paddingHorizontal: 20, gap: 12 },
});

export default Installments;
