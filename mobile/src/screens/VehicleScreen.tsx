import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { VehicleProfile, VehicleType } from "@nyc-truck-gps/shared";
import { Card } from "../components/Card";
import { FormInput } from "../components/FormInput";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors } from "../theme/colors";

interface Props {
  vehicle: VehicleProfile;
  onSave: (vehicle: VehicleProfile) => void;
}

const vehicleTypes: VehicleType[] = ["box_truck", "semi", "cargo_van", "dump_truck", "tractor_trailer"];

export function VehicleScreen({ vehicle, onSave }: Props) {
  const [draft, setDraft] = useState({ ...vehicle });

  function update<K extends keyof VehicleProfile>(key: K, value: VehicleProfile[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    await AsyncStorage.setItem("vehicleProfile", JSON.stringify(draft));
    onSave(draft);
    Alert.alert("已保存", "车辆档案已经保存到本机。用真实账号系统后可以保存到云端。");
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Card style={styles.form}>
        <Text style={styles.title}>车辆档案</Text>
        <FormInput label="车辆名称" value={draft.name} onChangeText={(text) => update("name", text)} />

        <Text style={styles.label}>车辆类型</Text>
        <View style={styles.typeGrid}>
          {vehicleTypes.map((type) => (
            <Text
              key={type}
              onPress={() => update("type", type)}
              style={[styles.typeChip, draft.type === type && styles.typeChipActive]}
            >
              {type}
            </Text>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.flex1}><FormInput label="车高 Feet" value={String(draft.heightFt)} keyboardType="numeric" onChangeText={(text) => update("heightFt", Number(text || 0))} /></View>
          <View style={styles.flex1}><FormInput label="Inches" suffix="in" value={String(draft.heightIn)} keyboardType="numeric" onChangeText={(text) => update("heightIn", Number(text || 0))} /></View>
        </View>
        <FormInput label="重量 GVW" suffix="lb" value={String(draft.weightLbs)} keyboardType="numeric" onChangeText={(text) => update("weightLbs", Number(text || 0))} />
        <View style={styles.row}>
          <View style={styles.flex1}><FormInput label="车长" suffix="ft" value={String(draft.lengthFt)} keyboardType="numeric" onChangeText={(text) => update("lengthFt", Number(text || 0))} /></View>
          <View style={styles.flex1}><FormInput label="车宽" suffix="ft" value={String(draft.widthFt)} keyboardType="numeric" onChangeText={(text) => update("widthFt", Number(text || 0))} /></View>
        </View>
        <FormInput label="轴数" value={String(draft.axles)} keyboardType="numeric" onChangeText={(text) => update("axles", Number(text || 0))} />

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchTitle}>Hazmat / 危险品</Text>
            <Text style={styles.muted}>打开后会避开危险品限制路线</Text>
          </View>
          <Switch value={draft.hasHazmat} onValueChange={(value) => update("hasHazmat", value)} />
        </View>

        <PrimaryButton title="保存车辆档案" onPress={save} />
      </Card>

      <Card>
        <Text style={styles.titleSmall}>上线后建议增加</Text>
        <Text style={styles.muted}>车牌、DOT number、保险、车队 ID、多车辆档案、司机账号、云端同步。</Text>
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
