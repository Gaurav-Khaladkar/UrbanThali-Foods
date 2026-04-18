import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>UrbanThali</Text>
        <Text style={styles.subtitle}>Healthy subscriptions, delivered daily.</Text>
        <Text style={styles.copy}>Starter mobile shell is ready for auth, plans, and pause-skip flows.</Text>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fb",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    gap: 10
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1a1a1a"
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#344054"
  },
  copy: {
    fontSize: 15,
    color: "#4b5565",
    lineHeight: 22
  }
});
