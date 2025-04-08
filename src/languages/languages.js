// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Các file ngôn ngữ (có thể là JSON hoặc object)
const resources = {
  en: {
    translation: {
      login: "Login",
      username: "Username",
      password: "Password",
      rememberMe: "Remember Me",
      forgotPassword: "Forgot password?",
      submit: "Submit",
      validation: {
        usernameRequired: "Username is required",
        passwordRequired: "Password is required",
        passwordStrength:
          "Password must have at least 8 characters, including lowercase, uppercase, number, and special character.",
      },
    },
  },
  vi: {
    translation: {
      login: "Đăng nhập",
      username: "Tài khoản",
      password: "Mật khẩu",
      rememberMe: "Nhớ mật khẩu",
      forgotPassword: "Quên mật khẩu?",
      submit: "Đăng nhập",
      validation: {
        usernameRequired: "Tài khoản là bắt buộc",
        passwordRequired: "Mật khẩu là bắt buộc",
        passwordStrength:
          "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
      },
    },
  },
};

i18n
  .use(initReactI18next) // Sử dụng i18next cho React
  .init({
    resources,
    lng: "vi", // Ngôn ngữ mặc định
    fallbackLng: "vi", // Ngôn ngữ dự phòng nếu không tìm thấy
    interpolation: {
      escapeValue: false, // React đã tự escape, không cần thiết
    },
  });

export default i18n;
