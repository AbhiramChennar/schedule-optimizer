import 'dotenv/config';

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
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    extra: {
      groqApiKey: process.env.GROQ_API_KEY,
      googleVisionApiKey: process.env.GOOGLE_VISION_API_KEY
    }
  }
};