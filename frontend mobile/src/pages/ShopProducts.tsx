import { useEffect, useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import MobileLayout from "@/components/MobileLayout";
import ArticleCard from "@/components/shops/ArticleCard";
import { useAppNavigation } from "@/lib/app-navigation";
import { getShopCatalogArticles, getShopCatalogShop, ShopCatalogArticle } from "@/lib/api";

const ShopProducts = () => {
  const { navigate, params } = useAppNavigation();
  const { width: screenWidth } = useWindowDimensions();
  const merchantId = Number(params?.merchantId ?? 0);
  const merchantName = String(params?.merchantName ?? "Boutique");
  const [storeUrl, setStoreUrl] = useState("");
  const [articles, setArticles] = useState<ShopCatalogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const [shop, result] = await Promise.all([
          getShopCatalogShop(merchantId),
          getShopCatalogArticles(merchantId),
        ]);
        setStoreUrl(shop?.storeUrl ?? "");
        setArticles(result);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Impossible de charger les articles.");
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [merchantId]);

  const columnCount = screenWidth >= 860 ? 3 : 2;
  const itemWidth = useMemo(() => {
    const totalGap = (columnCount - 1) * 10;
    const available = screenWidth - 40 - totalGap;
    return available / columnCount;
  }, [columnCount, screenWidth]);

  return (
    <MobileLayout noPadding>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigate("Shops")} style={styles.backButton}>
            <Text style={styles.backText}>Retour</Text>
          </Pressable>
          <Text style={styles.title}>{merchantName}</Text>
        </View>

        {loading && <Text style={styles.infoText}>Chargement des articles...</Text>}
        {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

        <View style={styles.grid}>
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              width={itemWidth}
              onOpen={() =>
                navigate("ProductDetail", {
                  merchantId,
                  merchantName,
                  articleId: article.id,
                  articleName: article.name,
                })
              }
              onVisitStore={() => {
                if (storeUrl) {
                  Linking.openURL(storeUrl);
                }
              }}
            />
          ))}
        </View>

        {!loading && articles.length === 0 && <Text style={styles.empty}>Aucun article disponible pour cette boutique.</Text>}
      </ScrollView>
    </MobileLayout>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 30, gap: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backButton: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  backText: { fontSize: 12, fontWeight: "700", color: "#334155" },
  title: { fontSize: 22, fontWeight: "800", color: "#111827", flex: 1 },
  infoText: { fontSize: 12, color: "#6b7280", marginTop: 6 },
  errorText: { fontSize: 12, color: "#dc2626", marginTop: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  empty: { fontSize: 12, color: "#6b7280", marginTop: 12 },
});

export default ShopProducts;
