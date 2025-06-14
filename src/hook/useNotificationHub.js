import { useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import { useSelector, useDispatch } from "react-redux";
import { notification } from "antd";

const useNotificationHub = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user?.token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:5001/hubs/notification", {
        accessTokenFactory: () => user.data.token, // truyền token để xác thực
      })
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => console.log("SignalR connected"))
      .catch((err) => console.error("SignalR connection error", err));

    // Khi nhận thông báo
    connection.on("ReceiveNotification", (message) => {
      console.log("Received:", message);

      // Hiển thị popup
      notification.open({
        message: message.title || "Thông báo mới",
        description: message.content || "",
        placement: "topRight",
      });

      // (Tuỳ chọn) Thêm vào danh sách trong Redux nếu cần
      // dispatch(addNotification(message));
    });

    return () => {
      connection.stop();
    };
  }, [user?.token]);
};

export default useNotificationHub;
