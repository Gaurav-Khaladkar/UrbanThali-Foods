import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

type Screen = "login" | "register" | "home" | "payment" | "mapping" | "delivery";

interface Delivery {
  id: string;
  customerName: string;
  status: "assigned" | "picked_up" | "in_transit" | "delivered" | "failed";
  etaMinutes: number;
}

const API_URL = "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error ?? "Request failed");
  }

  return json as T;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [message, setMessage] = useState("Welcome");

  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("admin@proapp.local");
  const [password, setPassword] = useState("Admin@123");
  const [token, setToken] = useState("");

  const [amount, setAmount] = useState("199");
  const [paymentId, setPaymentId] = useState("");
  const [otp, setOtp] = useState("1234");
  const [routeInfo, setRouteInfo] = useState("");

  const [deliveryName, setDeliveryName] = useState("Aarav");
  const [deliveryPhone, setDeliveryPhone] = useState("9999999999");
  const [deliveryAddress, setDeliveryAddress] = useState("Baner, Pune");
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  const isAuthenticated = Boolean(token);

  async function onRegisterAdmin(): Promise<void> {
    try {
      const result = await request<{ message: string; data: { email: string } }>("/auth/admin/register", {
        method: "POST",
        body: JSON.stringify({
          name: adminName || "Admin User",
          email,
          password
        })
      });
      setMessage(`${result.message}: ${result.data.email}`);
      setScreen("login");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Registration failed");
    }
  }

  async function onLogin(): Promise<void> {
    try {
      const result = await request<{ data: { token: string; email: string } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      setToken(result.data.token);
      setMessage(`Logged in as ${result.data.email}`);
      setScreen("home");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed");
    }
  }

  async function onCreatePayment(): Promise<void> {
    try {
      const result = await request<{ data: { id: string } }>("/payments/create-intent", {
        method: "POST",
        body: JSON.stringify({
          amountInr: Number(amount),
          method: "upi",
          customerEmail: email
        })
      });
      setPaymentId(result.data.id);
      setMessage("Payment intent created. Confirm with OTP 1234.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Payment creation failed");
    }
  }

  async function onConfirmPayment(): Promise<void> {
    try {
      const result = await request<{ message: string }>("/payments/confirm", {
        method: "POST",
        body: JSON.stringify({
          paymentId,
          otp
        })
      });
      setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Payment confirm failed");
    }
  }

  async function onGenerateRoute(): Promise<void> {
    try {
      const result = await request<{ data: { distanceKm: number; etaMinutes: number } }>("/navigation/route", {
        method: "POST",
        body: JSON.stringify({
          start: { lat: 18.5204, lng: 73.8567 },
          end: { lat: 18.5314, lng: 73.8446 }
        })
      });
      setRouteInfo(`${result.data.distanceKm} km | ETA ${result.data.etaMinutes} min`);
      setMessage("Navigation route loaded");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Route request failed");
    }
  }

  async function onCreateDelivery(): Promise<void> {
    try {
      await request("/deliveries", {
        method: "POST",
        body: JSON.stringify({
          customerName: deliveryName,
          customerPhone: deliveryPhone,
          address: deliveryAddress,
          riderName: "Ravi Rider",
          start: { lat: 18.5204, lng: 73.8567 },
          end: { lat: 18.5314, lng: 73.8446 }
        })
      });
      setMessage("Delivery order created");
      await onRefreshDeliveries();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delivery create failed");
    }
  }

  async function onRefreshDeliveries(): Promise<void> {
    try {
      const result = await request<{ data: Delivery[] }>("/deliveries");
      setDeliveries(result.data);
      setMessage("Delivery list refreshed");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delivery fetch failed");
    }
  }

  const navButton = (target: Screen, label: string) => (
    <Pressable style={[styles.navBtn, screen === target && styles.navBtnActive]} onPress={() => setScreen(target)}>
      <Text style={styles.navBtnText}>{label}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Professional Service App</Text>
        <Text style={styles.headerSub}>
          Login, Admin Registration, Payment, Mapping, Delivery {isAuthenticated ? "| Authenticated" : ""}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {screen === "login" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Admin Login</Text>
            <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={styles.input} />
            <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" style={styles.input} />
            <Pressable style={styles.primaryBtn} onPress={onLogin}>
              <Text style={styles.primaryBtnText}>Login</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={() => setScreen("register")}>
              <Text style={styles.secondaryBtnText}>Go to Admin Registration</Text>
            </Pressable>
          </View>
        )}

        {screen === "register" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Admin Registration</Text>
            <TextInput value={adminName} onChangeText={setAdminName} placeholder="Full Name" style={styles.input} />
            <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={styles.input} />
            <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" style={styles.input} />
            <Pressable style={styles.primaryBtn} onPress={onRegisterAdmin}>
              <Text style={styles.primaryBtnText}>Register Admin</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={() => setScreen("login")}>
              <Text style={styles.secondaryBtnText}>Back to Login</Text>
            </Pressable>
          </View>
        )}

        {screen === "home" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Dashboard</Text>
            <Text style={styles.copy}>All major professional modules are connected with live API calls.</Text>
            <View style={styles.featureGrid}>
              <Text style={styles.feature}>Navigation API: Active</Text>
              <Text style={styles.feature}>Payment Gateway: Sandbox Active</Text>
              <Text style={styles.feature}>Mapping: Route endpoint Active</Text>
              <Text style={styles.feature}>Delivery Tracking: Active</Text>
            </View>
          </View>
        )}

        {screen === "payment" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Payment Gateway</Text>
            <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="Amount in INR" style={styles.input} />
            <Pressable style={styles.primaryBtn} onPress={onCreatePayment}>
              <Text style={styles.primaryBtnText}>Create Payment Intent</Text>
            </Pressable>
            <TextInput value={paymentId} onChangeText={setPaymentId} placeholder="Payment ID" style={styles.input} />
            <TextInput value={otp} onChangeText={setOtp} placeholder="OTP (1234)" style={styles.input} />
            <Pressable style={styles.primaryBtn} onPress={onConfirmPayment}>
              <Text style={styles.primaryBtnText}>Confirm Payment</Text>
            </Pressable>
          </View>
        )}

        {screen === "mapping" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Mapping and GPS Route</Text>
            <Text style={styles.copy}>Start: Pune Station | End: Baner</Text>
            <Pressable style={styles.primaryBtn} onPress={onGenerateRoute}>
              <Text style={styles.primaryBtnText}>Generate Route</Text>
            </Pressable>
            {routeInfo ? <Text style={styles.highlight}>Route: {routeInfo}</Text> : null}
          </View>
        )}

        {screen === "delivery" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Delivery System</Text>
            <TextInput value={deliveryName} onChangeText={setDeliveryName} placeholder="Customer Name" style={styles.input} />
            <TextInput value={deliveryPhone} onChangeText={setDeliveryPhone} placeholder="Customer Phone" style={styles.input} />
            <TextInput value={deliveryAddress} onChangeText={setDeliveryAddress} placeholder="Address" style={styles.input} />
            <Pressable style={styles.primaryBtn} onPress={onCreateDelivery}>
              <Text style={styles.primaryBtnText}>Create Delivery</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={onRefreshDeliveries}>
              <Text style={styles.secondaryBtnText}>Refresh Deliveries</Text>
            </Pressable>
            {deliveries.map((delivery) => (
              <View key={delivery.id} style={styles.deliveryCard}>
                <Text style={styles.deliveryTitle}>
                  {delivery.customerName} - {delivery.status}
                </Text>
                <Text style={styles.copy}>ETA: {delivery.etaMinutes} min</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {isAuthenticated && (
        <View style={styles.bottomNav}>
          {navButton("home", "Home")}
          {navButton("payment", "Payment")}
          {navButton("mapping", "Mapping")}
          {navButton("delivery", "Delivery")}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>{message}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1220"
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10
  },
  headerTitle: {
    color: "#f8fbff",
    fontSize: 20,
    fontWeight: "700"
  },
  headerSub: {
    color: "#a9bdd8",
    marginTop: 4
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 110,
    gap: 14
  },
  card: {
    backgroundColor: "#f7faff",
    borderRadius: 14,
    padding: 14,
    gap: 10
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#13203b"
  },
  input: {
    borderWidth: 1,
    borderColor: "#c9d6ec",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff"
  },
  primaryBtn: {
    backgroundColor: "#1d4ed8",
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center"
  },
  primaryBtnText: {
    color: "#ffffff",
    fontWeight: "600"
  },
  secondaryBtn: {
    backgroundColor: "#dde7f8",
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center"
  },
  secondaryBtnText: {
    color: "#12326c",
    fontWeight: "600"
  },
  copy: {
    color: "#334155"
  },
  featureGrid: {
    gap: 8
  },
  feature: {
    color: "#1f3e7a",
    fontWeight: "600"
  },
  highlight: {
    color: "#0f3f8f",
    fontWeight: "700"
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 42,
    backgroundColor: "#0f172a",
    borderTopColor: "#2a3652",
    borderTopWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  navBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#192944",
    alignItems: "center"
  },
  navBtnActive: {
    backgroundColor: "#1d4ed8"
  },
  navBtnText: {
    color: "#dbeafe",
    fontWeight: "600",
    fontSize: 12
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  footerText: {
    color: "#dbeafe",
    fontSize: 12
  },
  deliveryCard: {
    borderWidth: 1,
    borderColor: "#d5e1f4",
    borderRadius: 10,
    padding: 10
  },
  deliveryTitle: {
    color: "#0f172a",
    fontWeight: "700"
  }
});
