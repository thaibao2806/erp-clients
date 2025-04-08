import React, { useState, useEffect } from "react";
import { Button, Input, Checkbox, message, Select } from "antd";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next"; // Import hook useTranslation
import loginBg from "../../../assets/images/login/login.jpg";
import Bg from "../../../assets/images/login/bg.jpg";

const Login = () => {
  const { t, i18n } = useTranslation(); // Hàm `t` để lấy giá trị dịch, `i18n` để thay đổi ngôn ngữ
  const [rememberMe, setRememberMe] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ username: "", password: "" });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMobile(true); // Nếu màn hình nhỏ hơn hoặc bằng 768px
      } else {
        setIsMobile(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Gọi hàm ngay lập tức để xác định kích thước ban đầu

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Hàm để kiểm tra mật khẩu
  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
  };

  // Hàm xử lý submit
  const handleSubmit = () => {
    setErrors({ username: "", password: "" });

    // Kiểm tra tài khoản
    if (!username) {
      setErrors((prev) => ({ ...prev, username: t("validation.usernameRequired") }));
      return;
    }

    // Kiểm tra mật khẩu
    if (!password) {
      setErrors((prev) => ({ ...prev, password: t("validation.passwordRequired") }));
      return;
    } else if (!validatePassword(password)) {
      setErrors((prev) => ({
        ...prev,
        password: t("validation.passwordStrength"),
      }));
      return;
    }

    // Nếu form hợp lệ, kiểm tra "Nhớ mật khẩu"
    if (rememberMe) {
      localStorage.setItem("rememberMe", true);
      localStorage.setItem("username", username);
      localStorage.setItem("password", password);
    }

    message.success(t("loginSuccess"));
  };

  // Thay đổi ngôn ngữ
  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${Bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "80%",
          height: "60%",
          maxWidth: "850px",
          display: "flex",
          justifyContent: "space-between",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          flexDirection: "row",
          flexWrap: "wrap", // Cho phép các phần tử bọc khi màn hình nhỏ
        }}
      >
        {/* Bên trái: Hình ảnh, chỉ hiển thị nếu không phải là mobile */}
        {!isMobile && (
          <div
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "300px",
              backgroundImage: `url(${loginBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}

        {/* Bên phải: Form đăng nhập */}
        <div
          style={{
            flex: 1,
            padding: "30px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            backgroundColor: "#FFFFFF",
          }}
        >
          {/* Dropdown chọn ngôn ngữ */}
          <div style={{ textAlign: "right", marginBottom: "0px" }}>
            <Select defaultValue="vi" onChange={handleLanguageChange} style={{ width: 120 }}>
              <Select.Option value="vi">Tiếng Việt</Select.Option>
              <Select.Option value="en">English</Select.Option>
            </Select>
          </div>

          <h2
            style={{
              textAlign: "center",
              color: "#1E3A8A",
              fontSize: "36px",
              fontWeight: "bold",
              marginBottom: "30px",
            }}
          >
            {t("login")}
          </h2>

          {/* Ô nhập tài khoản */}
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t("username")}
            style={{
              marginBottom: "20px",
              height: "50px",
              fontSize: "16px",
              borderColor: errors.username ? "red" : "",
            }}
          />
          {errors.username && (
            <div style={{ color: "red", fontSize: "12px" }}>{errors.username}</div>
          )}

          {/* Ô nhập mật khẩu */}
          <Input.Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("password")}
            iconRender={(visible) =>
              visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
            }
            style={{
              marginBottom: "20px",
              height: "50px",
              fontSize: "16px",
              borderColor: errors.password ? "red" : "",
            }}
          />
          {errors.password && (
            <div style={{ color: "red", fontSize: "12px" }}>{errors.password}</div>
          )}

          {/* Nhớ mật khẩu + Quên mật khẩu */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            >
              {t("rememberMe")}
            </Checkbox>
            <a href="/forgot-password" style={{ color: "#1E3A8A" }}>
              {t("forgotPassword")}
            </a>
          </div>

          {/* Nút Đăng nhập */}
          <Button
            type="primary"
            block
            style={{
              height: "50px",
              fontSize: "18px",
            }}
            onClick={handleSubmit}
          >
            {t("submit")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
