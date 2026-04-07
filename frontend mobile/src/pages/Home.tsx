import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import { AppRoute, useAppNavigation } from "@/lib/app-navigation";
import {
  getMerchants,
  getMyCreditScore,
  getMyInstallments,
  getMyPayments,
  getUnreadNotificationCount,
  Installment,
  Merchant,
  Payment,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";

const promos = [
  { title: "0% intérêt", subtitle: "Chez Mytek jusqu'au 30 Oct", gradient: "from-blue-500 to-indigo-600" },
  { title: "Offre spéciale", subtitle: "2x points fidélité Aziza", gradient: "from-emerald-500 to-teal-600" },
  { title: "Nouveau partenaire", subtitle: "IKEA maintenant disponible", gradient: "from-amber-500 to-orange-600" },
];

const toMoney = (value?: number) => `${(value ?? 0).toFixed(3)} TND`;

const toPrettyDate = (dateIso?: string) => {
  if (!dateIso) {
    return "-";
  }
  const date = new Date(dateIso);
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
};

const getInstallmentPriority = (status: Installment["status"]) => {
  if (status === "OVERDUE") {
    return 0;
  }
  if (status === "PENDING") {
    return 1;
  }
  return 2;
};

const Home = () => {
  const { navigate } = useAppNavigation();
  const { user } = useAuth();
  const [promoIndex, setPromoIndex] = useState(0);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [maxCreditAmount, setMaxCreditAmount] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const interval = setInterval(() => setPromoIndex((i) => (i + 1) % promos.length), 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const [merchantData, installmentData, paymentData, scoreData, unreadData] = await Promise.all([
          getMerchants(),
          getMyInstallments(user.userId),
          getMyPayments(user.userId),
          getMyCreditScore(user.userId),
          getUnreadNotificationCount(user.userId),
        ]);

        setMerchants(merchantData);
        setInstallments(installmentData);
        setPayments(paymentData);
        setScore(scoreData.score);
        setMaxCreditAmount(scoreData.maxCreditAmount);
        setUnreadCount(unreadData);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Impossible de charger le tableau de bord.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const nextInstallment = useMemo(() => {
    const dueItems = installments
      .filter((item) => item.status === "PENDING" || item.status === "OVERDUE")
      .sort((a, b) => {
        const statusDelta = getInstallmentPriority(a.status) - getInstallmentPriority(b.status);
        if (statusDelta !== 0) {
          return statusDelta;
        }
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });

    return dueItems[0] ?? null;
  }, [installments]);

  const recentPayments = useMemo(
    () =>
      [...payments]
        .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
        .slice(0, 3),
    [payments],
  );

  if (!user) {
    return (
      <MobileLayout>
        <View style={styles.centerBox}>
          <Text style={styles.emptyTitle}>Session expiree</Text>
          <Text style={styles.emptySubtitle}>Connectez-vous pour charger vos donnees.</Text>
          <Pressable style={styles.primarySmall} onPress={() => navigate("Login")}>
            <Text style={styles.primarySmallText}>Aller a la connexion</Text>
          </Pressable>
        </View>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout noPadding>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}><Text style={styles.avatarText}>AB</Text></View>
            <View>
              <Text style={styles.hello}>Bonjour</Text>
              <Text style={styles.name}>{`${user.firstName} ${user.lastName}`}</Text>
            </View>
          </View>
          <View style={styles.bell}><Text>{unreadCount > 0 ? unreadCount : "•"}</Text></View>
        </View>

        {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

        {loading && <Text style={styles.infoText}>Chargement des donnees...</Text>}

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Credit Disponible</Text>
          <Text style={styles.balanceValue}>{toMoney(maxCreditAmount ?? 0)}</Text>
          <View style={styles.balanceBottom}>
            <View>
              <Text style={styles.balanceHint}>Prochaine echeance</Text>
              <Text style={styles.balanceDate}>
                {nextInstallment
                  ? `${toPrettyDate(nextInstallment.dueDate)} - ${toMoney(nextInstallment.amount)}`
                  : "Aucune echeance"}
              </Text>
            </View>
            <Pressable style={styles.primarySmall} onPress={() => navigate("Installments")}>
              <Text style={styles.primarySmallText}>Payer</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>Score de credit</Text>
          <Text style={styles.scoreSub}>{score !== null ? `Bon - ${score}/850` : "Indisponible"}</Text>
        </View>

        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actionRow}>
          {[
            { label: "Demander credit", route: "Credit" as AppRoute },
            { label: "Scanner QR", route: "Home" as AppRoute },
            { label: "Verification KYC", route: "Profile" as AppRoute },
          ].map((action) => (
            <Pressable key={action.label} style={styles.actionCard} onPress={() => navigate(action.route)}>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.promoCard}>
          <Text style={styles.promoTitle}>{promos[promoIndex].title}</Text>
          <Text style={styles.promoSub}>{promos[promoIndex].subtitle}</Text>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Boutiques</Text>
          <Pressable onPress={() => navigate("Shops")}><Text style={styles.link}>Tout voir</Text></Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {merchants.slice(0, 8).map((store) => (
            <View key={store.name} style={styles.storeBadge}>
              <Text style={styles.storeBadgeText}>{store.name}</Text>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Recent</Text>
        <View style={styles.listCard}>
          {recentPayments.map((txn) => (
            <View key={txn.id} style={styles.listRow}>
              <View>
                <Text style={styles.txnLabel}>{`Paiement #${txn.installmentId}`}</Text>
                <Text style={styles.txnDate}>{toPrettyDate(txn.paidAt)}</Text>
              </View>
              <Text style={styles.txnAmount}>{`-${toMoney(txn.amount)}`}</Text>
            </View>
          ))}
          {recentPayments.length === 0 && <Text style={styles.emptyListText}>Aucun paiement recent.</Text>}
        </View>
      </ScrollView>
      <BottomNav />
    </MobileLayout>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 100, gap: 14 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "700" },
  hello: { fontSize: 12, color: "#6b7280" },
  name: { fontSize: 15, fontWeight: "700", color: "#111827" },
  bell: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center", justifyContent: "center" },
  balanceCard: { backgroundColor: "#111827", borderRadius: 16, padding: 18 },
  balanceLabel: { color: "#9ca3af", fontSize: 12, fontWeight: "600" },
  balanceValue: { color: "#fff", fontSize: 30, fontWeight: "700", marginTop: 6 },
  balanceBottom: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#374151", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  balanceHint: { color: "#9ca3af", fontSize: 11 },
  balanceDate: { color: "#fff", fontSize: 12, marginTop: 2 },
  primarySmall: { backgroundColor: "#2563eb", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 },
  primarySmallText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  scoreCard: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 14 },
  scoreTitle: { fontSize: 12, fontWeight: "700", color: "#111827" },
  scoreSub: { fontSize: 11, color: "#6b7280", marginTop: 4 },
  sectionTitle: { fontSize: 12, color: "#6b7280", fontWeight: "700", textTransform: "uppercase" },
  actionRow: { flexDirection: "row", gap: 10 },
  actionCard: { flex: 1, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 14, padding: 12, minHeight: 72, justifyContent: "center" },
  actionLabel: { fontSize: 11, textAlign: "center", fontWeight: "600", color: "#111827" },
  promoCard: { backgroundColor: "#2563eb", borderRadius: 14, padding: 14 },
  promoTitle: { color: "#fff", fontWeight: "700", fontSize: 14 },
  promoSub: { color: "#dbeafe", fontSize: 11, marginTop: 2 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  link: { color: "#2563eb", fontWeight: "700", fontSize: 12 },
  storeBadge: { backgroundColor: "#fff", borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14, marginRight: 8, borderWidth: 1, borderColor: "#e5e7eb" },
  storeBadgeText: { fontSize: 12, fontWeight: "600", color: "#111827" },
  listCard: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 14, overflow: "hidden" },
  listRow: { paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  txnLabel: { fontSize: 13, fontWeight: "600", color: "#111827" },
  txnDate: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  txnAmount: { fontSize: 13, fontWeight: "700", color: "#111827" },
  emptyListText: { paddingHorizontal: 14, paddingVertical: 12, fontSize: 12, color: "#6b7280" },
  infoText: { fontSize: 12, color: "#6b7280", marginBottom: 6 },
  errorText: { fontSize: 12, color: "#dc2626", marginBottom: 6 },
  centerBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  emptySubtitle: { fontSize: 13, color: "#6b7280", textAlign: "center" },
});

export default Home;
