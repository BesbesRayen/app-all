import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import ShopListItem from "@/components/shops/ShopListItem";
import { getShopCatalogShops, ShopCatalogShop } from "@/lib/api";
import { useAppNavigation } from "@/lib/app-navigation";

const Shops = () => {
  const { navigate } = useAppNavigation();
  const [search, setSearch] = useState("");
  const [shops, setShops] = useState<ShopCatalogShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadStores = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const catalogShops = await getShopCatalogShops();
        setShops(catalogShops);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Impossible de charger les boutiques.");
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, []);

  const filtered = useMemo(() => shops.filter((s) => {
    const term = search.toLowerCase();
    return s.name.toLowerCase().includes(term);
  }), [search, shops]);

  return (
    <MobileLayout noPadding>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Boutiques</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholder="Rechercher une boutique..."
          placeholderTextColor="#9ca3af"
        />

        <View style={styles.list}>
          {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
          {loading && <Text style={styles.infoText}>Chargement des boutiques...</Text>}

          {filtered.map((store) => (
            <ShopListItem
              key={store.id}
              shop={store}
              onPress={() => navigate("ShopProducts", { merchantId: store.id, merchantName: store.name })}
            />
          ))}

          {!loading && filtered.length === 0 && (
            <Text style={styles.emptyText}>Aucune boutique trouvee.</Text>
          )}
        </View>
      </ScrollView>
      <BottomNav />
    </MobileLayout>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 100, gap: 12 },
  title: { fontSize: 22, fontWeight: "700", color: "#111827" },
  searchInput: { marginTop: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#111827" },
  list: { marginTop: 2, gap: 10 },
  infoText: { paddingTop: 12, fontSize: 12, color: "#6b7280" },
  errorText: { paddingTop: 12, fontSize: 12, color: "#dc2626" },
  emptyText: { paddingVertical: 12, fontSize: 12, color: "#6b7280" },
});

export default Shops;
