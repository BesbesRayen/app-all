import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import { AppRoute, useAppNavigation } from "@/lib/app-navigation";
import {
  getMyCreditScore,
  getMyInstallments,
  getMyPayments,
  getUnreadNotificationCount,
  Installment,
  Payment,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";

const promos = [
  { title: "0% interet", subtitle: "Chez Mytek jusqu'au 30 Oct" },
  { title: "Offre speciale", subtitle: "2x points fidelite Aziza" },
  { title: "Nouveau partenaire", subtitle: "IKEA maintenant disponible" },
];

const quickActions: Array<{ label: string; route: AppRoute; icon: string; color: string }> = [
  { label: "Boutique", route: "Shops", icon: "storefront-outline", color: "#2563eb" },
  { label: "Verification KYC", route: "Kyc", icon: "card-account-details-outline", color: "#0f766e" },
  { label: "Aide & Support", route: "Support", icon: "headset", color: "#f97316" },
];

interface DealItem {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  endAtIso: string;
  hot?: boolean;
  storeUrl: string;
}

const deals: DealItem[] = [
  {
    id: "zara-jacket",
    name: "Zara Quilted Jacket",
    brand: "Zara",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200",
    price: 189,
    originalPrice: 259,
    endAtIso: "2026-04-09T22:30:00.000Z",
    hot: true,
    storeUrl: "https://www.zara.com",
  },
  {
    id: "bershka-denim",
    name: "Bershka Denim Set",
    brand: "Bershka",
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200",
    price: 139,
    originalPrice: 199,
    endAtIso: "2026-04-09T21:10:00.000Z",
    hot: true,
    storeUrl: "https://www.bershka.com",
  },
  {
    id: "decathlon-run",
    name: "Decathlon Running Pack",
    brand: "Decathlon",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200",
    price: 229,
    originalPrice: 299,
    endAtIso: "2026-04-10T08:00:00.000Z",
    storeUrl: "https://www.decathlon.tn",
  },
  {
    id: "megapc-headset",
    name: "Mega PC Gaming Headset",
    brand: "Mega PC",
    imageUrl: "https://images.unsplash.com/photo-1599669454699-248893623440?w=1200",
    price: 269,
    originalPrice: 349,
    endAtIso: "2026-04-09T19:15:00.000Z",
    hot: true,
    storeUrl: "https://www.mega-pc.tn",
  },
  {
    id: "zara-sneakers",
    name: "Zara Urban Sneakers",
    brand: "Zara",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200",
    price: 119,
    originalPrice: 169,
    endAtIso: "2026-04-09T17:45:00.000Z",
    storeUrl: "https://www.zara.com",
  },
  {
    id: "decathlon-watch",
    name: "Decathlon Smart Watch",
    brand: "Decathlon",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200",
    price: 179,
    originalPrice: 239,
    endAtIso: "2026-04-10T11:00:00.000Z",
    storeUrl: "https://www.decathlon.tn",
  },
];

const toMoney = (value?: number) => `${(value ?? 0).toFixed(3)} TND`;

const toPrettyDate = (dateIso?: string) => {
  if (!dateIso) {
    return "-";
  }
  const date = new Date(dateIso);
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
};

const toDealMoney = (value: number) => `${value.toFixed(0)} TND`;

const formatCountdown = (endAtIso: string, nowMs: number) => {
  const remaining = Math.max(0, new Date(endAtIso).getTime() - nowMs);
  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const DealCard = ({
  item,
  nowMs,
  width,
  compact,
  onBuy,
}: {
  item: DealItem;
  nowMs: number;
  width: number;
  compact?: boolean;
  onBuy: () => void;
}) => {
  const pressScale = useRef(new Animated.Value(1)).current;
  const tickAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    tickAnim.setValue(0.92);
    Animated.timing(tickAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [nowMs, tickAnim]);

  const discountPct = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);

  return (
    <Animated.View
      style={[
        styles.dealCard,
        compact && styles.dealCardCompact,
        { width, transform: [{ scale: Animated.multiply(pressScale, tickAnim) }] },
      ]}
    >
      <Pressable
        onPressIn={() => {
          Animated.timing(pressScale, { toValue: 0.985, duration: 120, useNativeDriver: true }).start();
        }}
        onPressOut={() => {
          Animated.timing(pressScale, { toValue: 1, duration: 140, useNativeDriver: true }).start();
        }}
        style={({ pressed }) => [styles.dealCardInner, pressed && styles.dealCardPressed]}
      >
        <View>
          <Image source={{ uri: item.imageUrl }} style={[styles.dealImage, compact && styles.dealImageCompact]} />
          {item.hot && (
            <View style={styles.hotBadge}>
              <Text style={styles.hotBadgeText}>Hot Deal</Text>
            </View>
          )}
        </View>

        <View style={styles.dealBody}>
          <Text numberOfLines={1} style={styles.dealBrand}>{item.brand}</Text>
          <Text numberOfLines={2} style={styles.dealName}>{item.name}</Text>

          <View style={styles.dealPriceRow}>
            <Text style={styles.dealPrice}>{toDealMoney(item.price)}</Text>
            <Text style={styles.dealOriginalPrice}>{toDealMoney(item.originalPrice)}</Text>
            <View style={styles.discountPill}><Text style={styles.discountPillText}>-{discountPct}%</Text></View>
          </View>

          <View style={styles.timerRow}>
            <MaterialCommunityIcons name="timer-sand" size={14} color="#9f1239" />
            <Text style={styles.timerLabel}>Flash Sale</Text>
            <Text style={styles.timerValue}>{formatCountdown(item.endAtIso, nowMs)}</Text>
          </View>

          <View style={styles.cardButtonsRow}>
            <Pressable style={styles.buyButton} onPress={onBuy}>
              <Text style={styles.buyButtonText}>Buy with Creadi</Text>
            </Pressable>
            <Pressable style={styles.visitButton} onPress={() => Linking.openURL(item.storeUrl)}>
              <Text style={styles.visitButtonText}>Visit Store</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
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
  const { width: screenWidth } = useWindowDimensions();
  const { user } = useAuth();
  const carouselRef = useRef<ScrollView | null>(null);
  const [promoIndex, setPromoIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [nowMs, setNowMs] = useState(Date.now());
  const [score, setScore] = useState<number | null>(null);
  const [maxCreditAmount, setMaxCreditAmount] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const carouselDeals = deals.slice(3);
  const carouselCardWidth = Math.min(screenWidth * 0.78, 330);
  const carouselSnap = carouselCardWidth + 12;

  useEffect(() => {
    const interval = setInterval(() => setPromoIndex((i) => (i + 1) % promos.length), 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (carouselDeals.length <= 1 || isUserInteracting) {
      return;
    }

    const interval = setInterval(() => {
      setCarouselIndex((previous) => {
        const next = (previous + 1) % carouselDeals.length;
        carouselRef.current?.scrollTo({ x: next * carouselSnap, animated: true });
        return next;
      });
    }, 3400);

    return () => clearInterval(interval);
  }, [carouselDeals.length, carouselSnap, isUserInteracting]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const [installmentData, paymentData, scoreData, unreadData] = await Promise.all([
          getMyInstallments(user.userId),
          getMyPayments(user.userId),
          getMyCreditScore(user.userId),
          getUnreadNotificationCount(user.userId),
        ]);

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
            <View style={styles.avatar}><Text style={styles.avatarText}>{`${user.firstName[0] ?? "U"}${user.lastName[0] ?? "S"}`}</Text></View>
            <View>
              <Text style={styles.hello}>Bonjour</Text>
              <Text style={styles.name}>{`${user.firstName} ${user.lastName}`}</Text>
            </View>
          </View>
          <View style={styles.bell}><Text style={styles.bellText}>{unreadCount > 0 ? unreadCount : "0"}</Text></View>
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

        <Text style={styles.sectionTitle}>Acces rapide</Text>
        <View style={styles.actionRow}>
          {quickActions.map((action) => (
            <Pressable key={action.label} style={styles.actionCard} onPress={() => navigate(action.route)}>
              <View style={[styles.actionIconWrap, { backgroundColor: action.color }]}>
                <MaterialCommunityIcons name={action.icon as never} size={18} color="#fff" />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.ctaButton} onPress={() => navigate("Credit")}>
          <MaterialCommunityIcons name="cash-fast" size={18} color="#fff" />
          <Text style={styles.ctaText}>Demander un credit maintenant</Text>
        </Pressable>

        <View style={styles.promoCard}>
          <Text style={styles.promoTitle}>{promos[promoIndex].title}</Text>
          <Text style={styles.promoSub}>{promos[promoIndex].subtitle}</Text>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Featured Deals + Flash Sale</Text>
          <Pressable onPress={() => navigate("Shops")}><Text style={styles.link}>Voir plus</Text></Pressable>
        </View>

        <DealCard item={deals[0]} nowMs={nowMs} width={screenWidth - 40} onBuy={() => navigate("Credit")} />

        <View style={styles.splitDealsRow}>
          <DealCard
            item={deals[1]}
            nowMs={nowMs}
            width={(screenWidth - 52) / 2}
            compact
            onBuy={() => navigate("Credit")}
          />
          <DealCard
            item={deals[2]}
            nowMs={nowMs}
            width={(screenWidth - 52) / 2}
            compact
            onBuy={() => navigate("Credit")}
          />
        </View>

        <ScrollView
          ref={carouselRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={carouselSnap}
          snapToAlignment="start"
          contentContainerStyle={styles.carouselContent}
          onScrollBeginDrag={() => setIsUserInteracting(true)}
          onMomentumScrollEnd={() => setIsUserInteracting(false)}
          onScroll={(event) => {
            const nextIndex = Math.round(event.nativeEvent.contentOffset.x / carouselSnap);
            if (nextIndex !== carouselIndex && nextIndex >= 0 && nextIndex < carouselDeals.length) {
              setCarouselIndex(nextIndex);
            }
          }}
          scrollEventThrottle={16}
        >
          {carouselDeals.map((deal) => (
            <DealCard
              key={deal.id}
              item={deal}
              nowMs={nowMs}
              width={carouselCardWidth}
              onBuy={() => navigate("Credit")}
            />
          ))}
        </ScrollView>

        <View style={styles.carouselDotsRow}>
          {carouselDeals.map((deal, index) => (
            <Pressable
              key={deal.id}
              onPress={() => {
                setCarouselIndex(index);
                carouselRef.current?.scrollTo({ x: index * carouselSnap, animated: true });
              }}
              style={[styles.carouselDot, index === carouselIndex && styles.carouselDotActive]}
            />
          ))}
        </View>

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
  bellText: { fontSize: 12, fontWeight: "700", color: "#111827" },
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
  actionCard: { flex: 1, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 14, padding: 12, minHeight: 92, justifyContent: "center", alignItems: "center", gap: 8 },
  actionIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 11, textAlign: "center", fontWeight: "700", color: "#111827" },
  ctaButton: { marginTop: 2, backgroundColor: "#0f766e", borderRadius: 14, paddingVertical: 13, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  ctaText: { color: "#fff", fontWeight: "700" },
  promoCard: { backgroundColor: "#2563eb", borderRadius: 14, padding: 14 },
  promoTitle: { color: "#fff", fontWeight: "700", fontSize: 14 },
  promoSub: { color: "#dbeafe", fontSize: 11, marginTop: 2 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 },
  link: { color: "#2563eb", fontWeight: "700", fontSize: 12 },
  splitDealsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "stretch", gap: 10 },
  carouselContent: { paddingRight: 8, paddingTop: 2 },
  carouselDotsRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: -4 },
  carouselDot: { width: 8, height: 8, borderRadius: 99, backgroundColor: "#cbd5e1" },
  carouselDotActive: { width: 22, backgroundColor: "#0f766e" },
  dealCard: { marginRight: 12, borderRadius: 18 },
  dealCardCompact: { marginRight: 0 },
  dealCardInner: {
    backgroundColor: "#fcfcff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    shadowColor: "#7c3aed",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  dealCardPressed: { opacity: 0.96 },
  dealImage: { width: "100%", height: 148, backgroundColor: "#f8fafc" },
  dealImageCompact: { height: 104 },
  hotBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#fb7185",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  hotBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  dealBody: { padding: 12, gap: 8 },
  dealBrand: { fontSize: 11, color: "#64748b", fontWeight: "700" },
  dealName: { fontSize: 14, color: "#0f172a", fontWeight: "800", minHeight: 34 },
  dealPriceRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  dealPrice: { fontSize: 16, color: "#111827", fontWeight: "800" },
  dealOriginalPrice: { fontSize: 12, color: "#94a3b8", textDecorationLine: "line-through" },
  discountPill: { backgroundColor: "#ffe4e6", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  discountPillText: { color: "#be123c", fontWeight: "800", fontSize: 10 },
  timerRow: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#fff1f2", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  timerLabel: { fontSize: 11, color: "#9f1239", fontWeight: "700" },
  timerValue: { marginLeft: "auto", fontSize: 12, color: "#881337", fontWeight: "800", letterSpacing: 0.3 },
  cardButtonsRow: { flexDirection: "row", gap: 8 },
  buyButton: { flex: 1, backgroundColor: "#0f766e", borderRadius: 10, alignItems: "center", paddingVertical: 10 },
  buyButtonText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  visitButton: { flex: 1, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 10, alignItems: "center", paddingVertical: 10, backgroundColor: "#fff" },
  visitButtonText: { color: "#334155", fontSize: 11, fontWeight: "700" },
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
