import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { RouteResponse, TruckRouteOption, VehicleProfile } from "@nyc-truck-gps/shared";
import { Card } from "../components/Card";
import { FormInput } from "../components/FormInput";
import { MapPreview } from "../components/MapPreview";
import { PrimaryButton } from "../components/PrimaryButton";
import { RiskBadge } from "../components/RiskBadge";
import { fetchTruckRoute } from "../services/api";
import { buildLocalFallbackRoute } from "../services/localFallback";
import { colors } from "../theme/colors";

interface Props {
  vehicle: VehicleProfile;
}

export function RouteScreen({ vehicle }: Props) {
  const [origin, setOrigin] = useState("Flushing, Queens");
  const [destination, setDestination] = useState("Sunset Park, Brooklyn");
  const [response, setResponse] = useState<RouteResponse | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<TruckRouteOption["id"]>("safe");
  const [loading, setLoading] = useState(false);

  const selectedRoute = useMemo(() => response?.routes.find((route) => route.id === selectedRouteId), [response, selectedRouteId]);

  async function generateRoute() {
    const payload = { origin, destination, vehicle };
    try {
      setLoading(true);
      const result = await fetchTruckRoute(payload);
      setResponse(result);
      setSelectedRouteId(result.recommendedRouteId);
    } catch (error) {
      const fallback = buildLocalFallbackRoute(payload);
      setResponse(fallback);
      setSelectedRouteId(fallback.recommendedRouteId);
      Alert.alert("使用本地演示数据", "后端 API 没有连接成功，当前显示手机端本地 mock 路线。运行 backend 后可调用真实 API。", [{ text: "OK" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Card style={styles.section}>
        <Text style={styles.title}>生成货车路线</Text>
        <FormInput label="起点" value={origin} onChangeText={setOrigin} />
        <FormInput label="终点" value={destination} onChangeText={setDestination} />
        <View style={styles.vehicleBox}>
          <Text style={styles.caption}>当前车辆</Text>
          <Text style={styles.vehicleName}>{vehicle.name}</Text>
          <Text style={styles.muted}>高 {vehicle.heightFt}'{vehicle.heightIn}" · 重 {vehicle.weightLbs.toLocaleString()} lb · {vehicle.type}</Text>
        </View>
        <PrimaryButton title={loading ? "正在生成..." : "生成 Truck-safe 路线"} onPress={generateRoute} disabled={loading} />
        {loading ? <ActivityIndicator style={{ marginTop: 12 }} /> : null}
      </Card>

      <MapPreview origin={origin} destination={destination} route={selectedRoute} />

      {response ? (
        <>
          <View style={styles.summaryRow}>
            <SummaryCard label="危险" value={response.summary.danger} tone="danger" />
            <SummaryCard label="提醒" value={response.summary.warning} tone="warning" />
            <SummaryCard label="安全" value={response.summary.safe} tone="safe" />
          </View>

          <Text style={styles.sectionTitle}>路线选择</Text>
          {response.routes.map((route) => (
            <Pressable key={route.id} onPress={() => setSelectedRouteId(route.id)}>
              <Card style={[styles.routeCard, selectedRouteId === route.id && styles.selectedCard]}>
                <View style={styles.rowBetween}>
                  <Text style={styles.routeName}>{route.name}</Text>
                  <Text style={styles.compliance}>{route.compliance}</Text>
                </View>
                <Text style={styles.muted}>{route.etaMinutes} min · {route.distanceMiles} mi · toll ${route.tollEstimateUsd}</Text>
                <Text style={styles.description}>{route.description}</Text>
              </Card>
            </Pressable>
          ))}

          <Text style={styles.sectionTitle}>风险检测</Text>
          {(response.restrictions ?? response.routes?.flatMap((route) => route.risks ?? []) ?? []).map((restriction, index) => (
            <Card key={`${restriction.id}-${index}`} style={styles.riskCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.riskTitle}>{restriction.title}</Text>
                <RiskBadge severity={restriction.computedSeverity} />
              </View>
              <Text style={styles.muted}>{restriction.location} · {restriction.borough}</Text>
              <Text style={styles.description}>{restriction.reason}</Text>
              <Text style={styles.description}>{restriction.note}</Text>
            </Card>
          ))}

          <Text style={styles.disclaimer}>{response.disclaimer}</Text>
        </>
      ) : (
        <Card>
          <Text style={styles.muted}>点击“生成 Truck-safe 路线”后，这里会显示路线、风险和合规分析。</Text>
        </Card>
      )}
    </ScrollView>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: "danger" | "warning" | "safe" }) {
  const bg = tone === "danger" ? colors.dangerBg : tone === "warning" ? colors.warningBg : colors.safeBg;
  const fg = tone === "danger" ? colors.danger : tone === "warning" ? colors.warning : colors.safe;
  return (
    <View style={[styles.summaryCard, { backgroundColor: bg }]}>
      <Text style={[styles.summaryValue, { color: fg }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 32 },
  section: { gap: 12, marginBottom: 14 },
  title: { color: colors.text, fontSize: 22, fontWeight: "900" },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "900", marginTop: 8, marginBottom: 10 },
  vehicleBox: { backgroundColor: colors.bg, borderRadius: 16, padding: 12 },
  caption: { color: colors.muted, fontSize: 12 },
  vehicleName: { color: colors.text, fontSize: 17, fontWeight: "900", marginTop: 2 },
  muted: { color: colors.muted, marginTop: 4 },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  summaryCard: { flex: 1, borderRadius: 18, padding: 14, alignItems: "center" },
  summaryValue: { fontSize: 26, fontWeight: "900" },
  summaryLabel: { fontSize: 12, fontWeight: "800" },
  routeCard: { marginBottom: 10 },
  selectedCard: { borderColor: colors.primary, borderWidth: 2 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  routeName: { color: colors.text, fontSize: 17, fontWeight: "900", flex: 1 },
  compliance: { color: colors.primary, fontWeight: "900" },
  description: { color: colors.text, marginTop: 8, lineHeight: 20 },
  riskCard: { marginBottom: 10 },
  riskTitle: { color: colors.text, fontSize: 16, fontWeight: "900", flex: 1 },
  disclaimer: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 8 }
});
