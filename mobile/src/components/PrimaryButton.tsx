import React from "react";
import { Pressable, StyleSheet, Text, PressableProps } from "react-native";
import { colors } from "../theme/colors";

interface Props extends PressableProps {
  title: string;
  variant?: "primary" | "secondary";
}

export function PrimaryButton({ title, variant = "primary", style, ...props }: Props) {
  const isPrimary = variant === "primary";
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primary : styles.secondary,
        pressed && { opacity: 0.8 },
        typeof style === "function" ? style({ pressed }) : style
      ]}
      {...props}
    >
      <Text style={[styles.text, isPrimary ? styles.primaryText : styles.secondaryText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  text: { fontSize: 16, fontWeight: "700" },
  primaryText: { color: colors.primaryText },
  secondaryText: { color: colors.text }
});
