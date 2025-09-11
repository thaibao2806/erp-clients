import React, { useState } from "react";
import {
  Table,
  Button,
  Input,
  DatePicker,
  Row,
  Col,
  Space,
  Tooltip,
  Modal,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  PrinterOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import CheckRepairsModal from "./CheckRepairsModal";
import { Link } from "react-router-dom";

const { RangePicker } = DatePicker;

const CheckRepairs = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState([
    {
      key: "1",
      stt: 1,
      donVi: "Phòng A",
      sochungtu: "CC001",
      tenthietbi: "Chấm công T1",
      ngaychungtu: "01/04/2025",
      bophan: "Tổ đóng mới",
      ghiChu: "Không có",
    },
    {
      key: "2",
      stt: 2,
      donVi: "Phòng B",
      sochungtu: "CC002",
      tenthietbi: "Chấm công T2",
      ngaychungtu: "01/05/2025",
      bophan: "Tổ hệ trục",
      ghiChu: "Nghỉ lễ 1 ngày",
    },
  ]);

  const [filters, setFilters] = useState({
    dateRange: null,
    maChamCong: "",
    tenChamCong: "",
  });

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      width: 60,
    },
    {
      title: "Đơn vị",
      dataIndex: "donVi",
    },
    {
      title: "Số chứng từ",
      dataIndex: "sochungtu",
      render: (text, record) => (
        <Link to={`/pm/de-xuat/bien-ban-nghiem-thu-sau-sua-chua-chi-tiet/${record.key}`}>{text}</Link> // ✅ THAY ĐOẠN NÀY
      ),
    },
    {
      title: "Ngày chứng từ",
      dataIndex: "ngaychungtu",
    },
    {
      title: "Nội dung kiểm tra",
      dataIndex: "tenthietbi",
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
    },
  ];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const handleAdd = () => {
    setEditingData(null); // không có dữ liệu -> thêm mới
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingData(record); // truyền dữ liệu -> chỉnh sửa
    setModalOpen(true);
  };

  const handleSubmit = (values) => {
    if (editingData) {
      console.log("Cập nhật:", values);
      // Gọi API update ở đây
    } else {
      console.log("Thêm mới:", values);
      // Gọi API thêm mới ở đây
    }
    setModalOpen(false);
  };

  // Xử lý chọn dòng
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  // Xử lý nút xóa
  const handleDelete = () => {
    if (selectedRowKeys.length === 0) {
      Modal.warning({
        title: "Chưa chọn dòng nào",
        content: "Vui lòng chọn ít nhất một dòng để xóa.",
      });
      return;
    }

    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} dòng này không?`,
      onOk: () => {
        const newData = dataSource.filter(
          (item) => !selectedRowKeys.includes(item.key)
        );
        setDataSource(newData);
        setSelectedRowKeys([]);
      },
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleSearch = () => {
    console.log("Filter:", filters);
  };

  const handleReset = () => {
    setFilters({
      dateRange: null,
      maChamCong: "",
      tenChamCong: "",
    });
  };

  return (
    <div style={{ padding: 5 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h1 style={{ margin: 0 }}>Biên bản kiểm tra sau sửa chữa</h1>
        <Space>
          <Tooltip title="Tìm kiếm">
            <Button icon={<SearchOutlined />} onClick={() => setShowFilters(!showFilters)} style={{ background:"#e6f4fb", color:"#0700ad" }}/>
          </Tooltip>
          <Tooltip title="Thêm">
            <Button onClick={handleAdd} icon={<PlusOutlined />} style={{ background:"#e6f4fb", color:"#0700ad" }}/>
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={handleDelete}
              disabled={selectedRowKeys.length === 0}
            />
          </Tooltip>
          <Tooltip title="In">
            <Button icon={<PrinterOutlined />} style={{ background:"#e6f4fb", color:"#0700ad" }}/>
          </Tooltip>
          <Tooltip title="Xuất excel">
            <Button icon={<FileExcelOutlined />} style={{ background:"#e6f4fb", color:"#0700ad" }}/>
          </Tooltip>
        </Space>
      </div>

      {/* Bộ lọc tìm kiếm */}
      {showFilters && (
        <div
          style={{
            background: "#fafafa",
            padding: 16,
            marginBottom: 20,
            borderRadius: 8,
            border: "1px solid #eee",
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <label>Thời gian</label>
              <RangePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                value={filters.dateRange}
                onChange={(value) => handleFilterChange("dateRange", value)}
              />
            </Col>
            <Col span={8}>
              <label>Số chứng từ</label>
              <Input
                placeholder="Số chứng từ"
                value={filters.maChamCong}
                onChange={(e) => handleFilterChange("maChamCong", e.target.value)}
              />
            </Col>
            <Col span={8}>
              <label>Nội dung kiểm tra</label>
              <Input
                placeholder="Nội dung kiểm tra"
                value={filters.tenChamCong}
                onChange={(e) => handleFilterChange("tenChamCong", e.target.value)}
              />
            </Col>
          </Row>
          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Button type="primary" onClick={handleSearch} style={{ marginRight: 8 }}>
              Lọc
            </Button>
            <Button onClick={handleReset}>Hủy</Button>
          </div>
        </div>
      )}

      {/* Bảng dữ liệu */}
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={dataSource}
        pagination={{ pageSize: 5 }}
        bordered
        components={{
                header: {
                  cell: (props) => (
                    <th
                      {...props}
                      style={{
                        backgroundColor: "#e6f4fb",
                        color: "#0700ad",
                        fontWeight: "600",
                      }}
                    />
                  ),
                  },
              }}
      />

      {/* Modal */}
      <CheckRepairsModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editingData}
      />
    </div>
  );
};

export default CheckRepairs;
