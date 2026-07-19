import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView, { Polyline, Region } from "react-native-maps";
import { TruckRouteOption, TruckRouteSegment } from "@nyc-truck-gps/shared";
import { colors } from "../theme/colors";
import { useLanguage } from "../i18n";
import { fetchOfficialTruckRoutes } from "../services/api";

interface Props {
  origin: string;
  destination: string;
  route?: TruckRouteOption;
}

const NYC_REGION: Region = {
  latitude: 40.7128,
  longitude: -74.006,
  latitudeDelta: 0.42,
  longitudeDelta: 0.42
};

export function MapPreview({ origin, destination, route }: Props) {
  const { t, td } = useLanguage();
  const [segments, setSegments] = useState<TruckRouteSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const loadRegion = useCallback(async (region: Region) => {
    setLoading(true);
    try {
      const result = await fetchOfficialTruckRoutes(regionToBounds(region));
      setSegments(result.routes);
      setUnavailable(false);
    } catch {
      setUnavailable(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadRegion(NYC_REGION); }, [loadRegion]);

  const officialLines = useMemo(() => segments.flatMap((segment) =>
    segment.geometry.coordinates.map((line, index) => ({
      key: `${segment.id}-${index}`,
      routeType: segment.routeType,
      coordinates: line.map(([longitude, latitude]) => ({ latitude, longitude }))
    }))
  ), [segments]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={NYC_REGION}
        onRegionChangeComplete={(region) => { void loadRegion(region); }}
        loadingEnabled
      >
        {officialLines.map((line) => (
          <Polyline
            key={line.key}
            coordinates={line.coordinates}
            strokeColor={line.routeType === "Through" ? "#1D4ED8" : "#F97316"}
            strokeWidth={line.routeType === "Through" ? 4 : 3}
          />
        ))}
        {route?.geometry?.length ? <Polyline coordinates={route.geometry} strokeColor={colors.primary} strokeWidth={6} /> : null}
      </MapView>

      <View style={styles.legend}>
        <Text style={styles.legendText}><Text style={styles.through}>━</Text> Through</Text>
        <Text style={styles.legendText}><Text style={styles.local}>━</Text> Local</Text>
        <Text style={styles.count}>{segments.length} {t("officialSegments")}</Text>
      </View>
      {loading ? <ActivityIndicator style={styles.loading} color={colors.primary} /> : null}
      {unavailable ? <Text style={styles.error}>{t("officialMapUnavailable")}</Text> : null}

      <View style={styles.bottomSheet}>
        <Text style={styles.caption}>{t("currentRoute")}</Text>
        <Text style={styles.routeName}>{td(route?.name ?? "Truck-safe route")}</Text>
        <Text style={styles.routeMeta}>{route ? `${route.etaMinutes} min · ${route.distanceMiles} mi · $${route.tollEstimateUsd}` : t("mockMap")}</Text>
        <Text style={styles.endpoints} numberOfLines={1}>{origin} → {destination}</Text>
      </View>
    </View>
  );
}

function regionToBounds(region: Region) {
  return {
    north: region.latitude + region.latitudeDelta / 2,
    south: region.latitude - region.latitudeDelta / 2,
    east: region.longitude + region.longitudeDelta / 2,
    west: region.longitude - region.longitudeDelta / 2
  };
}

const styles = StyleSheet.create({
  container: { height: 360, borderRadius: 20, overflow: "hidden", marginBottom: 14, backgroundColor: "#CBD5E1" },
  map: { ...StyleSheet.absoluteFillObject },
  legend: { position: "absolute", top: 10, left: 10, right: 10, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.94)", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7 },
  legendText: { color: colors.text, fontSize: 11, fontWeight: "700" },
  through: { color: "#1D4ED8", fontSize: 18 },
  local: { color: "#F97316", fontSize: 18 },
  count: { color: colors.muted, fontSize: 10, marginLeft: "auto" },
  loading: { position: "absolute", top: 52, right: 14 },
  error: { position: "absolute", top: 48, left: 10, right: 10, color: "#991B1B", backgroundColor: "#FEE2E2", padding: 8, borderRadius: 10, fontSize: 11 },
  bottomSheet: { position: "absolute", left: 12, right: 12, bottom: 12, backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 18, padding: 12 },
  caption: { color: colors.muted, fontSize: 12 },
  routeName: { color: colors.text, fontSize: 18, fontWeight: "900", marginTop: 2 },
  routeMeta: { color: colors.muted, marginTop: 3 },
  endpoints: { color: colors.text, fontSize: 11, marginTop: 5 }
});
