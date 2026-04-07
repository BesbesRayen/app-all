import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import { getMerchants, Merchant } from "@/lib/api";

const Shops = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tout");
  const [stores, setStores] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadStores = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const merchants = await getMerchants();
        setStores(merchants);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Impossible de charger les boutiques.");
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(stores.map((item) => item.category).filter(Boolean)));
    return ["Tout", ...unique];
  }, [stores]);

  const filtered = stores.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "Tout" || s.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <MobileLayout noPadding>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Boutiques Partenaires</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholder="Rechercher une boutique..."
          placeholderTextColor="#9ca3af"
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[styles.catButton, activeCategory === cat && styles.catButtonActive]}
            >
              <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.listCard}>
          {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
          {loading && <Text style={styles.infoText}>Chargement des boutiques...</Text>}

          {filtered.map((store) => (
            <View key={store.id} style={styles.storeRow}>
              <View style={styles.storeLogo}><Text style={styles.storeLogoText}>{store.name.charAt(0)}</Text></View>
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text style={styles.storeDesc}>{store.address || "Adresse non disponible"}</Text>
              </View>
              <Text style={styles.storeCategory}>{store.category}</Text>
            </View>
          ))}

          {!loading && filtered.length === 0 && (
            <Text style={styles.emptyText}>Aucune boutique correspondante.</Text>
          )}
        </View>
      </ScrollView>
      <BottomNav />
    </MobileLayout>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 100 },
  title: { fontSize: 22, fontWeight: "700", color: "#111827" },
  searchInput: { marginTop: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#111827" },
  catRow: { marginTop: 12, maxHeight: 44 },
  catButton: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  catButtonActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  catText: { fontSize: 12, fontWeight: "700", color: "#6b7280" },
  catTextActive: { color: "#fff" },
  listCard: { marginTop: 14, borderRadius: 14, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", overflow: "hidden" },
  storeRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  storeLogo: { width: 44, height: 44, borderRadius: 10, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center" },
  storeLogoText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  storeInfo: { flex: 1 },
  storeName: { fontSize: 14, fontWeight: "700", color: "#111827" },
  storeDesc: { marginTop: 2, fontSize: 11, color: "#6b7280" },
  storeCategory: { fontSize: 10, fontWeight: "700", color: "#6b7280", backgroundColor: "#f3f4f6", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  infoText: { paddingHorizontal: 14, paddingTop: 12, fontSize: 12, color: "#6b7280" },
  errorText: { paddingHorizontal: 14, paddingTop: 12, fontSize: 12, color: "#dc2626" },
  emptyText: { paddingHorizontal: 14, paddingVertical: 12, fontSize: 12, color: "#6b7280" },
});

export default Shops;
