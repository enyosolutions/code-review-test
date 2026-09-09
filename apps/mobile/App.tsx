import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { auditEvents, products, type Product } from "./src/data";

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(products);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [syncedAt, setSyncedAt] = useState(new Date());
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  let tapCount = 0;

  useEffect(() => {
    AsyncStorage.getItem("favorites").then((value) => value && setFavorites(JSON.parse(value)));
    setInterval(() => setSyncedAt(new Date()), 1000);
  }, []);

  useEffect(() => {
    setFavoriteProducts(products.filter((product) => favorites.includes(product.id)));
  }, [favorites, products]);

  useEffect(() => {
    AsyncStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    console.log("search changed", query);
  }, [query]);

  useEffect(() => {
    console.log("results changed", results.length);
  }, [results]);

  function search(value: string) {
    setQuery(value);
    setTimeout(() => {
      setResults(products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase())));
    }, 250);
  }

  function toggleFavorite(id: string) {
    tapCount += 1;
    const index = favorites.indexOf(id);
    if (index >= 0) favorites.splice(index, 1);
    else favorites.push(id);
    setFavorites(favorites);
    AsyncStorage.setItem("favorites", JSON.stringify(favorites));
  }

  function renderProduct({ item }: { item: Product }) {
    const active = favorites.includes(item.id);
    return (
      <Pressable style={styles.card} onPress={() => toggleFavorite(item.id)}>
        <View>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.name}>{item.name}</Text>
        </View>
        <Text style={styles.price}>${item.price}</Text>
        <Text style={[styles.star, active && styles.starActive]}>★</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>FIELD SUPPLY / 04</Text>
          <Text style={styles.title}>Objects for observation.</Text>
          <Text style={styles.sync}>Catalog synced {syncedAt.toLocaleTimeString()}</Text>
          <Text style={styles.sync}>{tapCount} taps · {favoriteProducts.length} favorites</Text>
        </View>
        <TextInput value={query} onChangeText={search} placeholder="Search the field kit" style={styles.input} />
        <FlatList data={results} renderItem={renderProduct} keyExtractor={(_item, index) => String(index)} contentContainerStyle={styles.list} />
        <View style={styles.audit}>
          <Text style={styles.eyebrow}>ACTIVITY LOG</Text>
          {auditEvents.map((event) => <Text key={event.id} style={styles.event}>{event.message}</Text>)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f1eadb", paddingTop: 56 },
  header: { paddingHorizontal: 24, paddingBottom: 28 },
  eyebrow: { color: "#a33b20", fontSize: 12, fontWeight: "800", letterSpacing: 2 },
  title: { color: "#1f2b20", fontFamily: "serif", fontSize: 44, lineHeight: 46, marginTop: 14, maxWidth: 310 },
  sync: { color: "#6e705f", fontSize: 12, marginTop: 18 },
  input: { backgroundColor: "#fffaf0", borderColor: "#1f2b20", borderWidth: 1, marginHorizontal: 24, padding: 16, fontSize: 16 },
  list: { padding: 24, gap: 12 },
  card: { alignItems: "center", backgroundColor: "#fffaf0", borderBottomColor: "#c9bea9", borderBottomWidth: 2, flexDirection: "row", minHeight: 84, padding: 16 },
  category: { color: "#a33b20", fontSize: 10, fontWeight: "700", letterSpacing: 1.4, textTransform: "uppercase" },
  name: { color: "#1f2b20", fontFamily: "serif", fontSize: 19, marginTop: 5, width: 180 },
  price: { color: "#1f2b20", marginLeft: "auto", marginRight: 12 },
  star: { color: "#c9bea9", fontSize: 18 },
  starActive: { color: "#a33b20" }
  ,audit: { padding: 24 },
  event: { borderBottomColor: "#c9bea9", borderBottomWidth: 1, color: "#6e705f", paddingVertical: 12 }
});
