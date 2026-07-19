import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text, Pressable, View } from "react-native";
import { VehicleProfile } from "@nyc-truck-gps/shared";
import { ReportsScreen } from "./src/screens/ReportsScreen";
import { RouteScreen } from "./src/screens/RouteScreen";
import { VehicleScreen } from "./src/screens/VehicleScreen";
import { colors } from "./src/theme/colors";
import { Language, LanguageProvider, useLanguage } from "./src/i18n";

const defaultVehicle: VehicleProfile = {
  id: "vehicle_1",
  name: "My Box Truck",
  type: "box_truck",
  heightFt: 12,
  heightIn: 6,
  weightLbs: 26000,
  lengthFt: 24,
  widthFt: 8,
  axles: 2,
  hasHazmat: false
};

type Tab = "route" | "vehicle" | "reports";

export default function App() {
  return <LanguageProvider><AppContent /></LanguageProvider>;
}

function AppContent() {
  const { language, setLanguage, t } = useLanguage();
  const [tab, setTab] = useState<Tab>("route");
  const [vehicle, setVehicle] = useState<VehicleProfile>(defaultVehicle);

  useEffect(() => {
    AsyncStorage.getItem("vehicleProfile")
      .then((value) => {
        if (value) setVehicle(JSON.parse(value));
      })
      .catch(() => undefined);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>NYC Truck GPS</Text>
          <Text style={styles.subtitle}>{t("subtitle")}</Text>
        </View>
        <View style={styles.languageRow}>
          {(["en", "zh", "es"] as Language[]).map((item) => <Pressable key={item} onPress={() => setLanguage(item)} style={[styles.languageButton, language === item && styles.languageButtonActive]}><Text style={[styles.languageText, language === item && styles.languageTextActive]}>{item.toUpperCase()}</Text></Pressable>)}
        </View>
      </View>
      <View style={styles.tabs}>
        <TabButton active={tab === "route"} label={t("route")} onPress={() => setTab("route")} />
        <TabButton active={tab === "vehicle"} label={t("vehicle")} onPress={() => setTab("vehicle")} />
        <TabButton active={tab === "reports"} label={t("reports")} onPress={() => setTab("reports")} />
      </View>
      {tab === "route" ? <RouteScreen vehicle={vehicle} /> : null}
      {tab === "vehicle" ? <VehicleScreen vehicle={vehicle} onSave={setVehicle} /> : null}
      {tab === "reports" ? <ReportsScreen /> : null}
    </SafeAreaView>
  );
}

function TabButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tabButton, active && styles.tabButtonActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8, backgroundColor: colors.bg, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  title: { color: colors.text, fontSize: 28, fontWeight: "900" },
  subtitle: { color: colors.muted, marginTop: 2 },
  tabs: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: colors.bg },
  tabButton: { flex: 1, minHeight: 42, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  tabButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.text, fontWeight: "800" },
  tabTextActive: { color: colors.primaryText },
  languageRow: { flexDirection: "row", gap: 4 },
  languageButton: { paddingHorizontal: 8, paddingVertical: 7, borderRadius: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  languageButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  languageText: { color: colors.text, fontSize: 11, fontWeight: "800" },
  languageTextActive: { color: colors.primaryText }
});
