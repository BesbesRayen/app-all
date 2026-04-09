import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ShopCatalogShop } from "@/lib/api";

interface ShopListItemProps {
  shop: ShopCatalogShop;
  onPress: () => void;
}

const ShopListItem = ({ shop, onPress }: ShopListItemProps) => {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Image source={{ uri: shop.logoUrl }} style={styles.image} />
      <View style={styles.body}>
        <Text style={styles.name}>{shop.name}</Text>
        <Text style={styles.subtitle}>Voir les produits</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 96,
    height: 96,
    backgroundColor: "#f1f5f9",
  },
  body: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "700",
    color: "#2563eb",
  },
});

export default ShopListItem;
