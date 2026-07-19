// Expo exposes EXPO_PUBLIC_* variables to the app bundle. For a physical phone,
// use the computer's LAN address; simulators can use localhost.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
