import React from "react";
import { Table, Checkbox } from "antd";

const AttachmentSection = ({ attachments = [] }) => {
  const columns = [
    {
      title: <Checkbox />,
      dataIndex: "checkbox",
      width: 50,
      render: () => <Checkbox />,
    },
    {
      title: "STT",
      dataIndex: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên file",
      dataIndex: "fileName",
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={attachments}
      pagination={false}
      locale={{ emptyText: "Không có dữ liệu" }}
      scroll={{ y: 240 }}
      size="small"
    />
  );
};

export default AttachmentSection;
