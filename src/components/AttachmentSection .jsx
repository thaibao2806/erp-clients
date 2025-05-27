import React, { useEffect, useState } from "react";
import { Table, Checkbox } from "antd";
import { useSelector } from "react-redux";
import { downloadAttachments, getAttachments } from "../services/apiAttachment";
import dayjs from "dayjs";

const AttachmentSection = ({ refId, refType, refreshTrigger }) => {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.auth.login.currentUser);

  const fetchAttachments = async () => {
    if (!refId || !refType) return;

    setLoading(true);
    try {
      const res = await getAttachments(refId, refType, user.data.token);
      if (res.status === 200) {
        setAttachments(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi tải danh sách file");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [refId, refType, refreshTrigger]);

  const columns = [
    // {
    //   title: <Checkbox />,
    //   dataIndex: "checkbox",
    //   width: 50,
    //   render: () => <Checkbox />,
    // },
    {
      title: "STT",
      dataIndex: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên file",
      dataIndex: "fileName",
      render: (text, record) => (
        <a
          onClick={() =>
            downloadAttachments(record.id, record.fileName, user.data.token)
          }
        >
          {text}
        </a>
      ),
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (text) => (text ? dayjs(text).format("DD/MM/YYYY HH:mm") : "--"),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={attachments}
      pagination={false}
      loading={loading}
      locale={{ emptyText: "Không có dữ liệu" }}
      scroll={{ y: 240 }}
      size="small"
    />
  );
};

export default AttachmentSection;
