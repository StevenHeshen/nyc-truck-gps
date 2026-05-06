import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TruckRouteOption } from "@nyc-truck-gps/shared";
import { colors } from "../theme/colors";

interface Props {
  origin: string;
  destination: string;
  route?: TruckRouteOption;
}

export function MapPreview({ origin, destination, route }: Props) {
  return (
    <View style={styles.map}>
      <View style={styles.grid} />
      <Text style={[styles.pin, styles.origin]}>{origin}</Text>
      <Text style={[styles.pin, styles.destination]}>{destination}</Text>
      <View style={styles.routeLine} />
      <View style={[styles.routeLine, styles.routeLineTwo]} />
      <Text style={styles.warning}>!</Text>
      <View style={styles.bottomSheet}>
        <Text style={styles.caption}>当前路线</Text>
        <Text style={styles.routeName}>{route?.name ?? "Truck-safe route"}</Text>
        <Text style={styles.routeMeta}>{route ? `${route.etaMinutes} min · ${route.distanceMiles} mi · $${route.tollEstimateUsd}` : "Mock map preview"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { height: 310, backgroundColor: "#1E293B", borderRadius: 20, overflow: "hidden", marginBottom: 14 },
  grid: { ...StyleSheet.absoluteFillObject, opacity: 0.16, borderWidth: 1, borderColor: "#fff" },
  pin: { position: "absolute", backgroundColor: "#fff", color: colors.text, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999, fontWeight: "800", maxWidth: 170 },
  origin: { left: 18, top: 48 },
  destination: { right: 18, bottom: 88 },
  routeLine: { position: "absolute", left: 64, top: 116, width: 230, height: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.75)", transform: [{ rotate: "24deg" }] },
  routeLineTwo: { top: 165, left: 78, width: 190, opacity: 0.45, transform: [{ rotate: "-18deg" }] },
  warning: { position: "absolute", left: "55%", top: "42%", width: 30, height: 30, borderRadius: 15, backgroundColor: colors.danger, color: "#fff", textAlign: "center", lineHeight: 30, fontWeight: "900" },
  bottomSheet: { position: "absolute", left: 12, right: 12, bottom: 12, backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 18, padding: 14 },
  caption: { color: colors.muted, fontSize: 12 },
  routeName: { color: colors.text, fontSize: 20, fontWeight: "900", marginTop: 2 },
  routeMeta: { color: colors.muted, marginTop: 4 }
});
