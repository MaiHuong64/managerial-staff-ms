import { type ThemeConfig } from "antd";

export const customTheme: ThemeConfig = {
  token: {
    colorPrimary: "#4f46e5",
    borderRadius: 8,
    fontSize: 16,
    fontFamily: "inherit, sans-serif",
    colorBgContainer: "#ffffff",
    colorBorder: "#d1d5db",
    colorText: "#111827",
    colorTextPlaceholder: "#6b7280",
  },
  components: {
    Input: { controlHeight: 44, hoverBorderColor: "#6366f1", activeBorderColor: "#6366f1" },
    Button: { controlHeight: 44, fontWeight: 600 },
    Form: { labelFontSize: 12, labelColor: "#6b7280" },
  }
};
