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
import ProjectsModal from "./ProjectsModal";
import { Link } from "react-router-dom";

const { RangePicker } = DatePicker;

const Projects = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState([
    {
      key: "1",
      stt: 1,
      donVi: "Phòng A",
      sochungtu: "CC001",
      sanpham: "Chấm công T1",
      ngaychungtu: "01/04/2025",
      ghiChu: "Không có",
    },
    {
      key: "2",
      stt: 2,
      donVi: "Phòng B",
      sochungtu: "CC002",
      sanpham: "Chấm công T2",
      ngaychungtu: "01/05/2025",
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
        <Link to={`/pm/du-an-chi-tiet/${record.key}`}>{text}</Link> // ✅ THAY ĐOẠN NÀY
      ),
    },
    {
      title: "Ngày chứng từ",
      dataIndex: "ngaychungtu",
    },
    {
      title: "Sản phẩm",
      dataIndex: "sanpham",
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
        <h1 style={{ margin: 0 }}>Dự án</h1>
        <Space>
          <Tooltip title="Tìm kiếm">
            <Button icon={<SearchOutlined />} onClick={() => setShowFilters(!showFilters)} />
          </Tooltip>
          <Tooltip title="Thêm">
            <Button onClick={handleAdd} icon={<PlusOutlined />} />
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
            <Button icon={<PrinterOutlined />} />
          </Tooltip>
          <Tooltip title="Xuất excel">
            <Button icon={<FileExcelOutlined />} />
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
              <label>Sản phẩm</label>
              <Input
                placeholder="Sản phẩm"
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
      />

      {/* Modal */}
      <ProjectsModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editingData}
      />
    </div>
  );
};

export default Projects;
