import React, { useState, useEffect } from "react";
import { Button, Input, Checkbox } from "antd";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import loginBg from "../../../assets/images/login/login.jpg";
import Bg from "../../../assets/images/login/bg.jpg";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUser } from "../../../redux/apiRequest";

const Login = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const [rememberMe, setRememberMe] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorLogin, setErrorLogin] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    // 👇 Load username đã lưu
    const savedUsername = localStorage.getItem("rememberedUsername");
    const passwordUsername = localStorage.getItem("rememberedPassword");
    if (savedUsername) {
      setUsername(savedUsername);
      setPassword(passwordUsername);
      setRememberMe(true);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Hàm để kiểm tra mật khẩu
  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
  };

  // Hàm xử lý submit
  const handleSubmit = async () => {
    setErrorLogin("");
    const user = { username, password };
    setErrors({ username: "", password: "" });

    if (!username) {
      setErrors((prev) => ({
        ...prev,
        username: t("validation.usernameRequired"),
      }));
      return;
    }

    if (!password) {
      setErrors((prev) => ({
        ...prev,
        password: t("validation.passwordRequired"),
      }));
      return;
    } else if (!validatePassword(password)) {
      setErrors((prev) => ({
        ...prev,
        password: t("validation.passwordStrength"),
      }));
      return;
    }

    setLoading(true);

    let res = await loginUser(user, dispatch, navigate);
    if (res) {
      setErrorLogin(res);
    } else {
      // ✅ Lưu username nếu chọn nhớ mật khẩu
      if (rememberMe) {
        localStorage.setItem("rememberedUsername", username);
        localStorage.setItem("rememberedPassword", password);
      } else {
        localStorage.removeItem("rememberedUsername");
        localStorage.removeItem("rememberedPassword");
      }
    }

    setLoading(false);
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
          flexWrap: "wrap",
        }}
      >
        {/* Bên trái: Hình ảnh */}
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
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
            <h5
              style={{
                color: "red",
                fontSize: "16px",
                marginBottom: "10px",
              }}
            >
              {errorLogin}
            </h5>

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
              <div style={{ color: "red", fontSize: "12px" }}>
                {errors.username}
              </div>
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
              <div style={{ color: "red", fontSize: "12px" }}>
                {errors.password}
              </div>
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
              <a href="/check-otp" style={{ color: "#1E3A8A" }}>
                {t("forgotPassword")}
              </a>
            </div>

            {/* Nút Đăng nhập */}
            <Button
              type="primary"
              block
              htmlType="submit"
              style={{
                height: "50px",
                fontSize: "18px",
              }}
              loading={loading}
              disabled={loading}
            >
              {t("submit")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
