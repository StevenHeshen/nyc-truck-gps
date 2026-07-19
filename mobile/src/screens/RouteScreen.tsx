import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { RouteResponse, TruckRouteOption, VehicleProfile } from "@nyc-truck-gps/shared";
import { Card } from "../components/Card";
import { FormInput } from "../components/FormInput";
import { MapPreview } from "../components/MapPreview";
import { PrimaryButton } from "../components/PrimaryButton";
import { RiskBadge } from "../components/RiskBadge";
import { ApiError, fetchTruckRoute } from "../services/api";
import { buildLocalFallbackRoute } from "../services/localFallback";
import { colors } from "../theme/colors";
import { useLanguage } from "../i18n";

interface Props {
  vehicle: VehicleProfile;
}

export function RouteScreen({ vehicle }: Props) {
  const { t, td, language } = useLanguage();
  const [origin, setOrigin] = useState("123-01 Roosevelt Ave, Queens, NY 11368");
  const [destination, setDestination] = useState("220 36th St, Brooklyn, NY 11232");
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
      if (error instanceof ApiError && error.code === "address_not_found") {
        setResponse(null);
        Alert.alert(t("addressNotFoundTitle"), t("addressNotFoundBody"));
        return;
      }
      const fallback = buildLocalFallbackRoute(payload);
      setResponse(fallback);
      setSelectedRouteId(fallback.recommendedRouteId);
      Alert.alert(t("localDataTitle"), t("localDataBody"), [{ text: "OK" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Card style={styles.section}>
        <Text style={styles.title}>{t("generateRoute")}</Text>
        <FormInput label={t("origin")} value={origin} onChangeText={setOrigin} />
        <FormInput label={t("destination")} value={destination} onChangeText={setDestination} />
        <View style={styles.vehicleBox}>
          <Text style={styles.caption}>{t("currentVehicle")}</Text>
          <Text style={styles.vehicleName}>{vehicle.name}</Text>
          <Text style={styles.muted}>{t("height")} {vehicle.heightFt}'{vehicle.heightIn}" · {t("weight")} {vehicle.weightLbs.toLocaleString()} lb · {t(vehicle.type)}</Text>
        </View>
        <PrimaryButton title={loading ? t("generating") : t("generateTruckRoute")} onPress={generateRoute} disabled={loading} />
        {loading ? <ActivityIndicator style={{ marginTop: 12 }} /> : null}
      </Card>

      <MapPreview origin={origin} destination={destination} route={selectedRoute} />

      {response ? (
        <>
          {response.routeProvider === "demo" ? (
            <View style={styles.summaryRow}>
              <SummaryCard label={t("danger")} value={response.summary.danger} tone="danger" />
              <SummaryCard label={t("warning")} value={response.summary.warning} tone="warning" />
              <SummaryCard label={t("safe")} value={response.summary.safe} tone="safe" />
            </View>
          ) : (
            <Card style={styles.validationCard}>
              <Text style={styles.riskTitle}>{t("deterministicRouteTitle")}</Text>
              <Text style={styles.description}>{t("validationPendingBody")}</Text>
            </Card>
          )}
          <Text style={styles.provider}>{t("routeProvider")}: {response.routeProvider === "valhalla" ? t("valhallaProvider") : t("demoProvider")}</Text>

          {response.aiAdvisory ? (
            <Card style={styles.advisoryCard}>
              <Text style={styles.riskTitle}>{t("aiAdvisory")}</Text>
              <Text style={styles.description}>{response.aiAdvisory}</Text>
            </Card>
          ) : null}

          <Text style={styles.sectionTitle}>{t("routeOptions")}</Text>
          {response.routes.map((route) => (
            <Pressable key={route.id} onPress={() => setSelectedRouteId(route.id)}>
              <Card style={[styles.routeCard, selectedRouteId === route.id && styles.selectedCard]}>
                <View style={styles.rowBetween}>
                  <Text style={styles.routeName}>{td(route.name)}</Text>
                  <Text style={styles.compliance}>{route.compliance}</Text>
                </View>
                <Text style={styles.muted}>{route.etaMinutes} min · {route.distanceMiles} mi · toll ${route.tollEstimateUsd}</Text>
                <Text style={styles.description}>{td(route.description)}</Text>
              </Card>
            </Pressable>
          ))}

          {response.restrictions.length ? <Text style={styles.sectionTitle}>{t("riskChecks")}</Text> : null}
          {response.restrictions.map((restriction, index) => (
            <Card key={`${restriction.id}-${index}`} style={styles.riskCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.riskTitle}>{td(restriction.title)}</Text>
                <RiskBadge severity={restriction.computedSeverity} />
              </View>
              <Text style={styles.muted}>{restriction.location} · {restriction.borough}</Text>
              <Text style={styles.description}>{localizeReason(restriction.reason, language)}</Text>
              <Text style={styles.description}>{td(restriction.note)}</Text>
              <Text style={styles.source}>{t("source")}: {t(restriction.source.kind)} · {restriction.source.name}</Text>
            </Card>
          ))}

          <Text style={styles.disclaimer}>{td(response.disclaimer)}</Text>
        </>
      ) : (
        <Card>
          <Text style={styles.muted}>{t("emptyRoute")}</Text>
        </Card>
      )}
    </ScrollView>
  );
}

function localizeReason(reason: string, language: "en" | "zh" | "es") {
  if (language === "en") return reason;
  if (reason.includes("at or above the clearance")) return language === "zh" ? "车辆高度达到或超过该处限高，存在碰撞危险。" : "La altura del vehículo alcanza o supera el límite; existe peligro de choque.";
  if (reason.includes("below the clearance")) return language === "zh" ? "车辆高度低于演示限高值；仍须遵守现场标志。" : "La altura está por debajo del límite de demostración; siga siempre las señales.";
  if (reason.includes("GVW") && reason.includes("exceeds")) return language === "zh" ? "车辆总重超过该桥梁的演示限重。" : "El peso bruto excede el límite de demostración del puente.";
  if (reason.includes("Hazmat")) return language === "zh" ? "该隧道的演示数据标记为禁止危险品。" : "Los datos de demostración indican que el túnel prohíbe materiales peligrosos.";
  if (reason.includes("Commercial vehicle restriction")) return language === "zh" ? "该路段限制商用车辆通行。" : "Este tramo restringe el paso de vehículos comerciales.";
  return language === "zh" ? "演示分析未发现与当前车辆直接冲突；请确认现场标志。" : "El análisis de demostración no encontró un conflicto directo; confirme las señales.";
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
  provider: { color: colors.muted, fontSize: 12, fontWeight: "700", marginBottom: 8 },
  advisoryCard: { marginBottom: 10, borderColor: colors.primary, borderWidth: 1 },
  validationCard: { marginBottom: 12, borderColor: colors.warning, borderWidth: 1 },
  source: { color: colors.muted, fontSize: 11, marginTop: 8 },
  disclaimer: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 8 }
});
