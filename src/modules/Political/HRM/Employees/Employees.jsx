import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  Row,
  Col,
  Space,
  Tooltip,
  Modal,
  Drawer,
  Card,
  Dropdown,
  Menu,
  Typography,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  FilterOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import {
  deleteEmployees,
  filterEmployees,
} from "../../../../services/apiPolitical/apiEmployee";
import EmployeeModal from "./EmployeeModal";

const { Text } = Typography;

// Hook theo dõi kích thước màn hình
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
};

const Employees = () => {
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  const isTablet = width > 768 && width <= 1024;

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    fullName: "",
    department: "",
  });
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

  // ✅ State cho modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize);
  }, []);

  const fetchData = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      let res = await filterEmployees(
        filters.fullName,
        "",
        filters.department,
        "",
        "",
        "",
        "",
        page,
        pageSize
      );
      if (res && res.status === 200) {
        let { items, totalCount } = res.data.data;
        let dataWithStt = items.map((item, index) => ({
          ...item,
          key: item.id,
          stt: (page - 1) * pageSize + index + 1,
        }));
        setDataSource(dataWithStt);
        setPagination({ current: page, pageSize, total: totalCount });
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chọn dòng
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
  };

  // Xử lý xóa
  const handleDelete = () => {
    if (selectedRowKeys.length === 0) {
      Modal.warning({
        title: "Chưa chọn nhân viên nào",
        content: "Vui lòng chọn ít nhất một nhân viên để xóa.",
      });
      return;
    }
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc muốn xóa ${selectedRowKeys.length} nhân viên không?`,
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoading(true);
          await Promise.all(selectedRowKeys.map((id) => deleteEmployees(id)));
          setDataSource((prev) =>
            prev.filter((item) => !selectedRowKeys.includes(item.key))
          );
          setSelectedRowKeys([]);
          Modal.success({
            title: "Xóa thành công",
            content: `${selectedRowKeys.length} nhân viên đã được xóa.`,
          });
        } catch (err) {
          Modal.error({
            title: "Lỗi",
            content: "Không thể xóa nhân viên, vui lòng thử lại.",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Cột cho desktop/tablet
  const columns = [
    { title: "STT", dataIndex: "stt", width: 60 },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      render: (text, record) => (
        <Link to={`/pt/nhan-su/ho-so-nhan-vien-chi-tiet/${record.id}`}>
          {text}
        </Link>
      ),
    },
    { title: "Giới tính", dataIndex: "gender", width: 90 },
    { title: "SĐT", dataIndex: "phoneNumber", width: 120 },
    { title: "Chức vụ", dataIndex: "position" },
    { title: "Loại LĐ", dataIndex: "laborType" },
    {
      title: "Ngày vào",
      dataIndex: "startDate",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "---",
    },
  ];

  // Card cho mobile
  const renderMobileCards = () => (
    <div style={{ padding: "0 8px" }}>
      {dataSource.map((item) => (
        <Card
          key={item.key}
          size="small"
          style={{
            marginBottom: 12,
            border: selectedRowKeys.includes(item.key)
              ? "2px solid #1890ff"
              : "1px solid #f0f0f0",
          }}
          bodyStyle={{ padding: 12 }}
          onClick={() => {
            const newSelection = selectedRowKeys.includes(item.key)
              ? selectedRowKeys.filter((key) => key !== item.key)
              : [...selectedRowKeys, item.key];
            setSelectedRowKeys(newSelection);
          }}
        >
          <div style={{ marginBottom: 4 }}>
            <Link
              to={`/pt/nhan-su/ho-so-nhan-vien-chi-tiet/${item.id}`}
              style={{ fontWeight: 600, fontSize: 14 }}
              onClick={(e) => e.stopPropagation()}
            >
              {item.fullName}
            </Link>
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            <strong>SĐT:</strong> {item.phoneNumber}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            <strong>Chức vụ:</strong> {item.position}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            <strong>Loại LĐ:</strong> {item.laborType}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            <strong>Ngày vào:</strong>{" "}
            {item.startDate
              ? new Date(item.startDate).toLocaleDateString("vi-VN")
              : "---"}
          </div>
        </Card>
      ))}
    </div>
  );

  // Menu thao tác cho mobile
  const actionMenu = (
    <Menu>
      <Menu.Item
        key="add"
        icon={<PlusOutlined />}
        onClick={() => {
          setEditingData(null);
          setModalOpen(true);
        }}
      >
        Thêm mới
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        onClick={handleDelete}
        disabled={selectedRowKeys.length === 0}
        danger
      >
        Xóa ({selectedRowKeys.length})
      </Menu.Item>
      <Menu.Item
        key="export"
        icon={<FileExcelOutlined />}
        disabled={selectedRowKeys.length === 0}
      >
        Xuất Excel ({selectedRowKeys.length})
      </Menu.Item>
    </Menu>
  );

  return (
    <div style={{ padding: isMobile ? 8 : 16 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 24 }}>
          Hồ sơ nhân viên
        </h1>
        {isMobile ? (
          <Space size="small">
            <Button
              icon={<FilterOutlined />}
              onClick={() => setFilterDrawerVisible(true)}
              size="small"
              style={{ background: "#e6f4fb", color: "#0700ad" }}
            />
            <Dropdown overlay={actionMenu} trigger={["click"]}>
              <Button icon={<MoreOutlined />} size="small" />
            </Dropdown>
          </Space>
        ) : (
          <Space>
            <Tooltip title="Tìm kiếm">
              <Button
                icon={<SearchOutlined />}
                onClick={() => setFilterDrawerVisible(true)}
                style={{ background: "#e6f4fb", color: "#0700ad" }}
              />
            </Tooltip>
            <Tooltip title="Thêm">
              <Button
                icon={<PlusOutlined />}
                style={{ background: "#e6f4fb", color: "#0700ad" }}
                onClick={() => {
                  setEditingData(null);
                  setModalOpen(true);
                }}
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <Button
                icon={<DeleteOutlined />}
                danger
                disabled={selectedRowKeys.length === 0}
                onClick={handleDelete}
              />
            </Tooltip>
            <Tooltip title="Xuất excel">
              <Button
                icon={<FileExcelOutlined />}
                style={{ background: "#e6f4fb", color: "#0700ad" }}
                disabled={selectedRowKeys.length === 0}
              />
            </Tooltip>
          </Space>
        )}
      </div>

      {/* Danh sách */}
      {isMobile ? (
        renderMobileCards()
      ) : (
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: !isTablet,
            showQuickJumper: !isTablet,
            size: isTablet ? "small" : "default",
          }}
          onChange={(pagination) =>
            fetchData(pagination.current, pagination.pageSize)
          }
          bordered
          size={isTablet ? "small" : "default"}
          scroll={{ x: isTablet ? 800 : "max-content" }}
          components={{
            header: {
              cell: (props) => (
                <th
                  {...props}
                  style={{
                    backgroundColor: "#e6f4fb",
                    color: "#0700ad",
                    fontWeight: "600",
                    fontSize: isMobile ? 12 : 14,
                  }}
                />
              ),
            },
          }}
        />
      )}

      {/* Drawer lọc */}
      <Drawer
        title="Lọc tìm kiếm"
        placement="bottom"
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
        height="60%"
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Input
              placeholder="Tên nhân viên"
              value={filters.fullName}
              onChange={(e) =>
                setFilters({ ...filters, fullName: e.target.value })
              }
            />
          </Col>
          <Col span={24}>
            <Input
              placeholder="Bộ phận"
              value={filters.department}
              onChange={(e) =>
                setFilters({ ...filters, department: e.target.value })
              }
            />
          </Col>
          <Col span={24}>
            <Button
              type="primary"
              onClick={() => {
                fetchData(1, pagination.pageSize);
                setFilterDrawerVisible(false);
              }}
            >
              Lọc
            </Button>
          </Col>
        </Row>
      </Drawer>

      {/* Modal thêm/sửa nhân viên */}
      <EmployeeModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={() => {
          fetchData(pagination.current, pagination.pageSize);
          setModalOpen(false);
        }}
        initialValues={editingData}
      />
    </div>
  );
};

export default Employees;
