import React, { useEffect, useState } from "react";
import { Input, Button, Space, message } from "antd";
import { SmileOutlined } from "@ant-design/icons";
import { addNotes, getNotes } from "../services/apiNotes";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
const { TextArea } = Input;

const NoteSection = ({ refId, refType, voucherNo }) => {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [sending, setSending] = useState(false); // ✅ Loading khi gửi
  const user = useSelector((state) => state.auth.login.currentUser);

  useEffect(() => {
    if (refId && refType) {
      getNote(refId, refType);
    }
  }, [refId, refType]);

  const getNote = async (refId, refType) => {
    try {
      let res = await getNotes(refId, refType);
      if (res && res.status === 200) {
        setNotes(res.data.data || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSend = async () => {
    if (!note.trim() || sending) return;

    setSending(true); // ✅ Bắt đầu loading
    const now = new Date().toISOString();
    let id = uuidv4();
    try {
      const res = await addNotes(
        id,
        refId,
        refType,
        note,
        user.data?.userName || "unknown",
        user.data?.fullName || "unknown",
        now,
        user.data?.userName || "unknown",
        now,
        voucherNo
      );
      if (res && res.status === 200) {
        setNotes([
          {
            content: note,
            createdAt: now,
            createdBy: user.data?.userName || "unknown",
            createdName: user.data?.fullName || "unknown",
            userName: user.data?.userName || "unknown",
          },
          ...notes,
        ]);
        setNote("");
      } else {
        message.error("Không thể gửi ghi chú!");
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi gửi ghi chú!");
    } finally {
      setSending(false); // ✅ Kết thúc loading
    }
  };

  return (
    <>
      <div
        style={{
          borderRadius: 12,
          backgroundColor: "#e6f4fb",
          padding: 16,
          border: "1px solid #91d5ff",
          marginTop: 16,
        }}
      >
        {/* Ô nhập ghi chú */}
        <TextArea
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nhập ghi chú..."
          onPressEnter={(e) => {
            if (e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        {/* Hướng dẫn + nút */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 8,
          }}
        >
          <span style={{ fontStyle: "italic" }}>
            {/* Bấm <b>Shift + Enter</b> để đăng */}
          </span>
          <Space>
            <Button shape="circle" icon={<SmileOutlined />} />

            <Button
              type="primary"
              onClick={handleSend}
              loading={sending}
              disabled={!note.trim()}
            >
              Gửi
            </Button>
          </Space>
        </div>
      </div>

      {/* Ghi chú đã gửi */}
      <div style={{ marginTop: 16 }}>
        {notes.map((n, index) => (
          <div
            key={index}
            style={{
              background: "#fff",
              padding: 12,
              borderRadius: 8,
              marginBottom: 8,
              border: "1px solid #d9d9d9",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            {/* Avatar hoặc Icon tạm */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "#1890ff",
                color: "#fff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              {n.userName ? n.userName.charAt(0).toUpperCase() : "SH"}
            </div>

            {/* Nội dung ghi chú */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>
                {n.createdName || n.createdBy}
              </div>
              <div style={{ whiteSpace: "pre-line" }}>{n.content}</div>
              <div style={{ fontSize: 12, color: "#999", textAlign: "right" }}>
                {dayjs(n.createdAt).format("DD/MM/YYYY")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default NoteSection;
