import { type ThemeConfig } from "antd";

export const customTheme: ThemeConfig = {
  token: {
    // Colors
    colorPrimary: '#2563eb', // Blue-600
    colorSuccess: '#16a34a', // Green-600
    colorWarning: '#f59e0b', // Amber-500
    colorError: '#dc2626',   // Red-600
    colorInfo: '#0ea5e9',    // Sky-500

    // Typography
    fontFamily: '"Roboto", sans-serif',
    colorText: '#0f172a', // Slate-900
    colorTextSecondary: '#64748b', // Slate-500

    // Background & Border
    colorBgContainer: '#ffffff', // Card BG
    colorBgLayout: '#f8fafc', // Main BG (Slate-50)
    colorBorder: '#e2e8f0', // Slate-200

    // Sizing & Radius
    borderRadius: 8,
    controlHeight: 44, // Tăng height cho input dễ nhìn hơn
  },
  components: {
    Button: {
      controlHeight: 44,
      borderRadius: 8,
      fontWeight: 500,
    },
    Input: {
      paddingBlock: 8,
      paddingInline: 12,
    },
    Card: {
      borderRadiusLG: 12, // Design system yêu cầu rounded-xl cho Card
      colorBorderSecondary: '#e2e8f0',
    }
  }
};