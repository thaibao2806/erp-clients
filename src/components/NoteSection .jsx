import React, { useState } from "react";
import { Input, Button, Space, message } from "antd";
import { SmileOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const NoteSection = () => {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);

  const handleSend = () => {
    if (!note.trim()) return;

    setNotes([...notes, { content: note, time: new Date().toLocaleString() }]);
    setNote("");
    message.success("Đã gửi ghi chú!");
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
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <span style={{ fontStyle: "italic" }}>Bấm <b>Shift + Enter</b> để đăng</span>
        <Space>
          <Button shape="circle" icon={<SmileOutlined />} />
          <Button onClick={() => setNote("")}>Xóa trắng</Button>
          <Button type="primary" onClick={handleSend}>
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
            }}
          >
            <div>{n.content}</div>
            <div style={{ fontSize: 12, color: "#999", textAlign: "right" }}>{n.time}</div>
          </div>
        ))}
      </div>
    </>
  );
};

export default NoteSection;
