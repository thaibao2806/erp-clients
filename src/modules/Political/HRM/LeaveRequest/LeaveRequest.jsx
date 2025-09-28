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
  Tag,
  Dropdown,
  Menu,
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
import { saveAs } from "file-saver";
import LeaveRequestModal from "./LeaveRequestModal";
import {
  deleteLeaveRequestByID,
  filterLeaveRequests,
} from "../../../../services/apiPolitical/apiLeaveRequest";

// Hook theo dõi kích thước màn hình
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
};

const LeaveRequest = () => {
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  const isTablet = width > 768 && width <= 1024;

  const [showFilters, setShowFilters] = useState(false);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
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
    position: "",
  });

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize);
  }, []);

  const fetchData = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const { fullName, department, position } = filters;
      let res = await filterLeaveRequests(
        fullName || "",
        department || "",
        position || "",
        "",
        "",
        "",
        "",
        "",
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
      console.error("API error:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "STT", dataIndex: "stt", width: 60 },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      render: (text, record) => (
        <Link to={`/pt/nhan-su/nghi-phep-chi-tiet/${record.id}`}>{text}</Link>
      ),
    },
    { title: "Chức vụ", dataIndex: "position" },
    { title: "Phòng ban", dataIndex: "department" },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "---",
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "---",
    },
    { title: "Loại phép", dataIndex: "leaveType" },
    {
      title: "Trạng thái",
      dataIndex: "approvalStatus",
      render: (status) => {
        const map = {
          approved: { color: "green", text: "Đã duyệt" },
          rejected: { color: "red", text: "Từ chối" },
          pending: { color: "orange", text: "Chờ duyệt" },
        };
        const config = map[status] || { color: "default", text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  // Mobile cards
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
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <Link
                to={`/pt/nhan-su/nghi-phep-chi-tiet/${item.id}`}
                style={{ fontWeight: 600, fontSize: 14 }}
                onClick={(e) => e.stopPropagation()}
              >
                {item.fullName}
              </Link>
              <div style={{ fontSize: 12, color: "#666" }}>
                <strong>Chức vụ:</strong> {item.position}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>
                <strong>Phòng ban:</strong> {item.department}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>
                <strong>Bắt đầu:</strong>{" "}
                {item.startDate
                  ? new Date(item.startDate).toLocaleDateString("vi-VN")
                  : "---"}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>
                <strong>Kết thúc:</strong>{" "}
                {item.endDate
                  ? new Date(item.endDate).toLocaleDateString("vi-VN")
                  : "---"}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>
                <strong>Loại phép:</strong> {item.leaveType}
              </div>
            </div>
            <Tag
              color={
                item.approvalStatus === "approved"
                  ? "green"
                  : item.approvalStatus === "rejected"
                  ? "red"
                  : "orange"
              }
              style={{ fontSize: 10 }}
            >
              {item.approvalStatus === "approved"
                ? "Đã duyệt"
                : item.approvalStatus === "rejected"
                ? "Từ chối"
                : "Chờ duyệt"}
            </Tag>
          </div>
        </Card>
      ))}
    </div>
  );

  // Row selection
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  // Actions mobile menu
  const actionMenu = (
    <Menu>
      <Menu.Item
        key="add"
        icon={<PlusOutlined />}
        onClick={() => setModalOpen(true)}
      >
        Thêm mới
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        danger
        disabled={selectedRowKeys.length === 0}
        onClick={() => handleDelete()}
      >
        Xóa ({selectedRowKeys.length})
      </Menu.Item>
    </Menu>
  );

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const handleDelete = () => {
    if (selectedRowKeys.length === 0) return;
    Modal.confirm({
      title: "Xóa đơn nghỉ phép",
      content: `Bạn có chắc muốn xóa ${selectedRowKeys.length} dòng này?`,
      onOk: async () => {
        await Promise.all(
          selectedRowKeys.map((id) => deleteLeaveRequestByID(id))
        );
        setDataSource((prev) =>
          prev.filter((i) => !selectedRowKeys.includes(i.key))
        );
        setSelectedRowKeys([]);
      },
    });
  };

  return (
    <div style={{ padding: isMobile ? 8 : 16 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: isMobile ? "wrap" : "nowrap",
        }}
      >
        <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 24 }}>
          Đơn xin nghỉ phép
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
          <Space size={isTablet ? "small" : "default"}>
            <Tooltip title="Tìm kiếm">
              <Button
                icon={<SearchOutlined />}
                onClick={() => setShowFilters(!showFilters)}
                style={{ background: "#e6f4fb", color: "#0700ad" }}
                size={isTablet ? "small" : "default"}
              />
            </Tooltip>
            <Tooltip title="Thêm">
              <Button
                onClick={() => setModalOpen(true)}
                icon={<PlusOutlined />}
                style={{ background: "#e6f4fb", color: "#0700ad" }}
                size={isTablet ? "small" : "default"}
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <Button
                icon={<DeleteOutlined />}
                danger
                disabled={selectedRowKeys.length === 0}
                onClick={handleDelete}
                size={isTablet ? "small" : "default"}
              />
            </Tooltip>
          </Space>
        )}
      </div>

      {/* Filters */}
      {!isMobile && showFilters && (
        <div
          style={{
            background: "#fafafa",
            padding: 16,
            marginBottom: 20,
            borderRadius: 8,
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Input
                placeholder="Họ tên"
                value={filters.fullName}
                onChange={(e) =>
                  setFilters({ ...filters, fullName: e.target.value })
                }
              />
            </Col>
            <Col span={8}>
              <Input
                placeholder="Chức vụ"
                value={filters.position}
                onChange={(e) =>
                  setFilters({ ...filters, position: e.target.value })
                }
              />
            </Col>
            <Col span={8}>
              <Input
                placeholder="Phòng ban"
                value={filters.department}
                onChange={(e) =>
                  setFilters({ ...filters, department: e.target.value })
                }
              />
            </Col>
          </Row>
          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Button
              type="primary"
              onClick={() => fetchData(1, pagination.pageSize)}
              style={{ marginRight: 8 }}
            >
              Lọc
            </Button>
            <Button
              onClick={() =>
                setFilters({ fullName: "", department: "", position: "" })
              }
            >
              Hủy
            </Button>
          </div>
        </div>
      )}

      {/* Table or Mobile Cards */}
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
          }}
          onChange={(p) => fetchData(p.current, p.pageSize)}
          bordered
          size={isTablet ? "small" : "default"}
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

      {/* Drawer Filter */}
      <Drawer
        title="Bộ lọc"
        placement="bottom"
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
        height="70%"
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Input
              placeholder="Họ tên"
              value={filters.fullName}
              onChange={(e) =>
                setFilters({ ...filters, fullName: e.target.value })
              }
            />
          </Col>
          <Col span={24}>
            <Input
              placeholder="Chức vụ"
              value={filters.position}
              onChange={(e) =>
                setFilters({ ...filters, position: e.target.value })
              }
            />
          </Col>
          <Col span={24}>
            <Input
              placeholder="Phòng ban"
              value={filters.department}
              onChange={(e) =>
                setFilters({ ...filters, department: e.target.value })
              }
            />
          </Col>
          <Col span={24}>
            <Button
              type="primary"
              onClick={() => fetchData(1, pagination.pageSize)}
            >
              Lọc
            </Button>
          </Col>
        </Row>
      </Drawer>

      {/* Modal thêm/sửa */}
      <LeaveRequestModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={() => fetchData(pagination.current, pagination.pageSize)}
        initialValues={editingData}
      />
    </div>
  );
};

export default LeaveRequest;
