import React, { useState, useEffect } from "react";
import { Button, Input, Checkbox, message, Select, notification } from "antd";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next"; // Import hook useTranslation
import loginBg from "../../../assets/images/login/login.jpg";
import Bg from "../../../assets/images/login/bg.jpg";
import { useNavigate } from "react-router-dom";
import { resetPasswords } from "../../../services/apiAuth";

const ForgotPassword = () => {
  const { t, i18n } = useTranslation(); // Hàm `t` để lấy giá trị dịch, `i18n` để thay đổi ngôn ngữ
  const [rememberMe, setRememberMe] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
  };

  // Hàm để kiểm tra email
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Hàm xử lý submit
  const handleSubmit = async () => {
    setErrors({ email: "", password: "", confirmPassword: "" });

    if (!email) {
      setErrors((prev) => ({
        ...prev,
        email: "Cần nhập email",
      }));
      return;
    } else if (!validateEmail(email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Email không đúng định dạng",
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

    if (password != confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Mật khẩu nhập lại không đúng",
      }));
      return;
    }

    setLoading(true);
    try {
      let res = await resetPasswords(email, otp, password);
      if (res && res.status === 200) {
        setLoading(false);
        notification.success({
          message: "Thành công",
          description: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại",
          placement: "topRight",
        });
        navigate("/login");
      }
    } catch (error) {
      if (error.status) {
        setLoading(false);
        setErrors((prev) => ({
          ...prev,
          email: error.response.data,
        }));
        return;
      }
    }
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
          <h2
            style={{
              textAlign: "center",
              color: "#1E3A8A",
              fontSize: "36px",
              fontWeight: "bold",
              marginBottom: "30px",
            }}
          >
            Quên mật khẩu
          </h2>

          {/* Ô nhập tài khoản */}
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={"Email"}
            style={{
              marginBottom: "20px",
              height: "50px",
              fontSize: "16px",
              borderColor: errors.email ? "red" : "",
            }}
          />
          {errors.email && (
            <div style={{ color: "red", fontSize: "12px" }}>{errors.email}</div>
          )}

          <Input
            value={otp}
            onChange={(e) => setOTP(e.target.value)}
            placeholder={"Mã OTP"}
            style={{
              marginBottom: "20px",
              height: "50px",
              fontSize: "16px",
            }}
          />

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

          <Input.Password
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={"Nhập lại mật khẩu"}
            iconRender={(visible) =>
              visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
            }
            style={{
              marginBottom: "20px",
              height: "50px",
              fontSize: "16px",
              borderColor: errors.confirmPassword ? "red" : "",
            }}
          />
          {errors.confirmPassword && (
            <div style={{ color: "red", fontSize: "12px" }}>
              {errors.confirmPassword}
            </div>
          )}

          {/* Nút Đăng nhập */}
          <Button
            type="primary"
            block
            style={{
              height: "50px",
              fontSize: "18px",
            }}
            loading={loading} // Hiệu ứng loading
            disabled={loading}
            onClick={handleSubmit}
          >
            Đổi mật khẩu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
