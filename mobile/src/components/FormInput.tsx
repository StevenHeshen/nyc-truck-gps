import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors } from "../theme/colors";

interface Props extends TextInputProps {
  label: string;
  suffix?: string;
}

export function FormInput({ label, suffix, style, ...props }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput style={[styles.input, style]} placeholderTextColor="#94A3B8" {...props} />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { color: colors.text, fontSize: 13, fontWeight: "700" },
  inputRow: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center"
  },
  input: { flex: 1, fontSize: 16, color: colors.text },
  suffix: { color: colors.muted, fontSize: 13, marginLeft: 6 }
});
