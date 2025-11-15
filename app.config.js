export default {
  expo: {
    name: "schedule-optimizer",
    slug: "schedule-optimizer",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "scheduleoptimizer",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.scheduleoptimizer.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.scheduleoptimizer.app"
    },
    extra: {
      groqApiKey: process.env.GROQ_API_KEY || "PLACEHOLDER_KEY"
    }
  }
};