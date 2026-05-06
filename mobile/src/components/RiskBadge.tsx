import React from "react";
import { StyleSheet, Text } from "react-native";
import { Severity } from "@nyc-truck-gps/shared";
import { colors } from "../theme/colors";

export function RiskBadge({ severity }: { severity: Severity }) {
  const style = severity === "danger" ? styles.danger : severity === "warning" ? styles.warning : styles.safe;
  const text = severity === "danger" ? "危险" : severity === "warning" ? "提醒" : "安全";
  return <Text style={[styles.badge, style]}>{text}</Text>;
}

const styles = StyleSheet.create({
  badge: { overflow: "hidden", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, fontSize: 12, fontWeight: "800" },
  danger: { color: colors.danger, backgroundColor: colors.dangerBg },
  warning: { color: colors.warning, backgroundColor: colors.warningBg },
  safe: { color: colors.safe, backgroundColor: colors.safeBg }
});
