import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { DriverReport } from "@nyc-truck-gps/shared";
import { Card } from "../components/Card";
import { FormInput } from "../components/FormInput";
import { PrimaryButton } from "../components/PrimaryButton";
import { createReport, fetchReports } from "../services/api";
import { colors } from "../theme/colors";
import { useLanguage } from "../i18n";

export function ReportsScreen() {
  const { t } = useLanguage();
  const [type, setType] = useState("Hard right turn");
  const [location, setLocation] = useState("Atlantic Ave near 3rd Ave");
  const [note, setNote] = useState("Box truck turning is difficult because of construction cones.");
  const [reports, setReports] = useState<DriverReport[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadReports() {
    try {
      setLoading(true);
      const result = await fetchReports();
      setReports(result.reports);
    } catch (error) {
      Alert.alert(t("apiError"), error instanceof Error ? error.message : t("apiError"));
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    try {
      const result = await createReport({ type, location, note });
      setReports((prev) => [result.report, ...prev]);
      Alert.alert(t("submitted"), t("submittedBody"));
    } catch (error) {
      Alert.alert(t("apiError"), error instanceof Error ? error.message : t("apiError"));
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Card style={styles.form}>
        <Text style={styles.title}>{t("driverReports")}</Text>
        <FormInput label={t("issueType")} value={type} onChangeText={setType} />
        <FormInput label={t("location")} value={location} onChangeText={setLocation} />
        <FormInput label={t("details")} value={note} onChangeText={setNote} multiline style={{ minHeight: 90, textAlignVertical: "top" }} />
        <PrimaryButton title={t("submitReport")} onPress={submit} />
        <PrimaryButton title={t("refreshReports")} variant="secondary" onPress={loadReports} />
      </Card>

      <Text style={styles.sectionTitle}>{t("latestReports")}</Text>
      {loading ? <ActivityIndicator /> : null}
      {reports.map((report) => (
        <Card key={report.id} style={styles.reportCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.reportType}>{report.type}</Text>
            <Text style={styles.status}>{t(report.status)}</Text>
          </View>
          <Text style={styles.muted}>{report.location}</Text>
          <Text style={styles.note}>{report.note}</Text>
          <Text style={styles.muted}>{report.votes} {t("useful")}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 32 },
  form: { gap: 12, marginBottom: 14 },
  title: { color: colors.text, fontSize: 22, fontWeight: "900" },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "900", marginVertical: 10 },
  reportCard: { marginBottom: 10 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  reportType: { color: colors.text, fontSize: 16, fontWeight: "900", flex: 1 },
  status: { overflow: "hidden", borderRadius: 999, backgroundColor: colors.bg, color: colors.text, paddingHorizontal: 10, paddingVertical: 5, fontWeight: "800" },
  muted: { color: colors.muted, marginTop: 5 },
  note: { color: colors.text, marginTop: 8, lineHeight: 20 }
});
