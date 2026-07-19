import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { VehicleProfile, VehicleType } from "@nyc-truck-gps/shared";
import { Card } from "../components/Card";
import { FormInput } from "../components/FormInput";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors } from "../theme/colors";
import { useLanguage } from "../i18n";

interface Props {
  vehicle: VehicleProfile;
  onSave: (vehicle: VehicleProfile) => void;
}

const vehicleTypes: VehicleType[] = ["box_truck", "semi", "cargo_van", "dump_truck", "tractor_trailer"];

export function VehicleScreen({ vehicle, onSave }: Props) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState({ ...vehicle });

  function update<K extends keyof VehicleProfile>(key: K, value: VehicleProfile[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    await AsyncStorage.setItem("vehicleProfile", JSON.stringify(draft));
    onSave(draft);
    Alert.alert(t("saved"), t("savedBody"));
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Card style={styles.form}>
        <Text style={styles.title}>{t("vehicleProfile")}</Text>
        <FormInput label={t("vehicleName")} value={draft.name} onChangeText={(text) => update("name", text)} />

        <Text style={styles.label}>{t("vehicleType")}</Text>
        <View style={styles.typeGrid}>
          {vehicleTypes.map((type) => (
            <Text
              key={type}
              onPress={() => update("type", type)}
              style={[styles.typeChip, draft.type === type && styles.typeChipActive]}
            >
              {t(type)}
            </Text>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.flex1}><FormInput label={t("feet")} value={String(draft.heightFt)} keyboardType="numeric" onChangeText={(text) => update("heightFt", Number(text || 0))} /></View>
          <View style={styles.flex1}><FormInput label={t("inches")} suffix="in" value={String(draft.heightIn)} keyboardType="numeric" onChangeText={(text) => update("heightIn", Number(text || 0))} /></View>
        </View>
        <FormInput label={t("gvw")} suffix="lb" value={String(draft.weightLbs)} keyboardType="numeric" onChangeText={(text) => update("weightLbs", Number(text || 0))} />
        <View style={styles.row}>
          <View style={styles.flex1}><FormInput label={t("length")} suffix="ft" value={String(draft.lengthFt)} keyboardType="numeric" onChangeText={(text) => update("lengthFt", Number(text || 0))} /></View>
          <View style={styles.flex1}><FormInput label={t("width")} suffix="ft" value={String(draft.widthFt)} keyboardType="numeric" onChangeText={(text) => update("widthFt", Number(text || 0))} /></View>
        </View>
        <FormInput label={t("axles")} value={String(draft.axles)} keyboardType="numeric" onChangeText={(text) => update("axles", Number(text || 0))} />

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchTitle}>{t("hazmat")}</Text>
            <Text style={styles.muted}>{t("hazmatHelp")}</Text>
          </View>
          <Switch value={draft.hasHazmat} onValueChange={(value) => update("hasHazmat", value)} />
        </View>

        <PrimaryButton title={t("saveVehicle")} onPress={save} />
      </Card>

      <Card>
        <Text style={styles.titleSmall}>{t("futureTitle")}</Text>
        <Text style={styles.muted}>{t("futureBody")}</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  form: { gap: 12 },
  title: { color: colors.text, fontSize: 22, fontWeight: "900" },
  titleSmall: { color: colors.text, fontSize: 17, fontWeight: "900", marginBottom: 8 },
  label: { color: colors.text, fontSize: 13, fontWeight: "700" },
  row: { flexDirection: "row", gap: 10 },
  flex1: { flex: 1 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeChip: { overflow: "hidden", borderRadius: 999, borderWidth: 1, borderColor: colors.border, paddingVertical: 8, paddingHorizontal: 12, color: colors.text, backgroundColor: colors.card, fontWeight: "700" },
  typeChipActive: { backgroundColor: colors.primary, color: colors.primaryText, borderColor: colors.primary },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.bg, borderRadius: 16, padding: 12 },
  switchTitle: { color: colors.text, fontWeight: "900" },
  muted: { color: colors.muted, lineHeight: 20 }
});
