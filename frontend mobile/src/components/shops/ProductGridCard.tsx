import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ShopCatalogProduct } from "@/lib/api";

interface ProductGridCardProps {
  product: ShopCatalogProduct;
  width: number;
  onVisitStore: () => void;
  onBuy: () => void;
}

const ProductGridCard = ({ product, width, onVisitStore, onBuy }: ProductGridCardProps) => {
  return (
    <View style={[styles.card, { width }]}>
      <Image source={{ uri: product.imageUrl }} style={styles.image} />
      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{`${product.priceTnd.toFixed(2)} TND`}</Text>
        <View style={styles.actionsRow}>
          <Pressable style={styles.visitButton} onPress={onVisitStore}>
            <Text style={styles.visitButtonText}>Visit Store</Text>
          </Pressable>
          <Pressable style={styles.buyButton} onPress={onBuy}>
            <Text style={styles.buyButtonText}>Buy with Creadi</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 132,
    backgroundColor: "#f1f5f9",
  },
  body: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 7,
  },
  name: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    minHeight: 36,
  },
  price: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f766e",
  },
  actionsRow: { flexDirection: "row", gap: 8 },
  visitButton: { flex: 1, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 10, alignItems: "center", justifyContent: "center", paddingVertical: 9, backgroundColor: "#fff" },
  visitButtonText: { color: "#334155", fontWeight: "700", fontSize: 11 },
  buyButton: { flex: 1, backgroundColor: "#0f766e", borderRadius: 10, alignItems: "center", justifyContent: "center", paddingVertical: 9 },
  buyButtonText: { color: "#fff", fontWeight: "700", fontSize: 11 },
});

export default ProductGridCard;
