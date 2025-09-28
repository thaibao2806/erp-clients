import React, { useEffect, useState } from "react";
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
  Select,
  Drawer,
  Card,
  Tag,
  Divider,
  Dropdown,
  Menu,
  Checkbox,
  Typography,
  Badge,
  BackTop,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  PrinterOutlined,
  FileExcelOutlined,
  FilterOutlined,
  MoreOutlined,
  MenuOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UpOutlined,
} from "@ant-design/icons";
import BuySuppliesModal from "./BuySuppliesModal";
import { Link } from "react-router-dom";
import {
  deleteBuySupplies,
  filterBuySupplies,
} from "../../../../services/apiProductControl/apiBuySupplies";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

// Hook để theo dõi kích thước màn hình
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

const BuySupplies = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [mobileActionDrawerVisible, setMobileActionDrawerVisible] =
    useState(false);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const { width } = useWindowSize();

  // Responsive breakpoints
  const isMobile = width <= 768;
  const isTablet = width > 768 && width <= 1024;
  const isDesktop = width > 1024;

  const [filters, setFilters] = useState({
    dateRange: null,
    voucherNo: "",
    proposalName: "",
    proposalType: "",
  });

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize);
  }, []);

  // Update selectAll checkbox state
  useEffect(() => {
    const allVisibleKeys = dataSource.map((item) => item.key);
    setSelectAllChecked(
      allVisibleKeys.length > 0 &&
        allVisibleKeys.every((key) => selectedRowKeys.includes(key))
    );
  }, [selectedRowKeys, dataSource]);

  const fetchData = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const { voucherNo, proposalName, proposalType, dateRange } = filters;
      const fromDate = dateRange ? dateRange[0].format("YYYY-MM-DD") : null;
      const toDate = dateRange ? dateRange[1].format("YYYY-MM-DD") : null;

      let res = await filterBuySupplies(
        voucherNo,
        proposalName,
        proposalType,
        "",
        fromDate,
        toDate,
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

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      width: isMobile ? 50 : 60,
      fixed: isMobile ? "left" : false,
    },
    {
      title: "Đơn vị",
      dataIndex: "divionID",
      width: isMobile ? 100 : 120,
    },
    {
      title: "Số chứng từ",
      dataIndex: "voucherNo",
      width: isMobile ? 120 : 150,
      fixed: isMobile ? "left" : false,
      render: (text, record) => (
        <Link to={`/pm/de-xuat/mua-vat-tu-ccdc-chi-tiet/${record.key}`}>
          {text}
        </Link>
      ),
    },
    {
      title: "Ngày chứng từ",
      dataIndex: "voucherDate",
      width: isMobile ? 100 : 120,
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "---",
    },
    {
      title: "Nội dung đề xuất",
      dataIndex: "proposalName",
      width: isMobile ? 150 : 200,
    },
    {
      title: "Loại đề xuất",
      dataIndex: "proposalType",
      width: isMobile ? 110 : 130,
      render: (type) => {
        const typeConfig = {
          MV: { color: "green", text: "Mua vật tư" },
          CV: { color: "blue", text: "Cấp vật tư" },
          SC: { color: "orange", text: "Sửa chữa" },
        };
        const config = typeConfig[type] || { color: "default", text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      width: isMobile ? 120 : 150,
      ellipsis: true,
    },
    {
      title: "Trạng thái duyệt",
      dataIndex: "approvalStatus",
      width: isMobile ? 110 : 130,
      render: (status) => {
        const statusConfig = {
          approved: { color: "green", text: "Đã duyệt" },
          rejected: { color: "red", text: "Từ chối" },
          pending: { color: "orange", text: "Chờ duyệt" },
        };
        const config = statusConfig[status] || {
          color: "default",
          text: status,
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  // Mobile columns - simplified view
  const mobileColumns = [
    {
      title: "STT",
      dataIndex: "stt",
      width: 50,
      fixed: "left",
    },
    {
      title: "Thông tin",
      dataIndex: "voucherNo",
      fixed: "left",
      width: 200,
      render: (_, record) => (
        <div>
          <Link
            to={`/pm/de-xuat/mua-vat-tu-ccdc-chi-tiet/${record.key}`}
            style={{ fontWeight: 600, fontSize: 14 }}
          >
            {record.voucherNo}
          </Link>
          <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
            {record.voucherDate
              ? new Date(record.voucherDate).toLocaleDateString("vi-VN")
              : "---"}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
            {record.proposalName}
          </div>
        </div>
      ),
    },
    {
      title: "Loại & Trạng thái",
      dataIndex: "proposalType",
      width: 120,
      render: (type, record) => (
        <div>
          <Tag
            color={type === "MV" ? "green" : type === "CV" ? "blue" : "orange"}
            style={{ fontSize: 10, marginBottom: 4 }}
          >
            {type === "MV" ? "Mua VT" : type === "CV" ? "Cấp VT" : "Sửa chữa"}
          </Tag>
          <br />
          <Tag
            color={
              record.approvalStatus === "approved"
                ? "green"
                : record.approvalStatus === "rejected"
                ? "red"
                : "orange"
            }
            style={{ fontSize: 10 }}
          >
            {record.approvalStatus === "approved"
              ? "Đã duyệt"
              : record.approvalStatus === "rejected"
              ? "Từ chối"
              : "Chờ duyệt"}
          </Tag>
        </div>
      ),
    },
  ];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const handleAdd = () => {
    setEditingData(null);
    setModalOpen(true);
    setMobileActionDrawerVisible(false);
  };

  const handleEdit = (record) => {
    setEditingData(record);
    setModalOpen(true);
  };

  const handleSubmit = (values) => {
    if (editingData) {
      console.log("Cập nhật:", values);
    } else {
      fetchData(pagination.current, pagination.pageSize);
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

  // Handle select all for mobile
  const handleSelectAll = (checked) => {
    if (checked) {
      const allKeys = dataSource.map((item) => item.key);
      setSelectedRowKeys(allKeys);
    } else {
      setSelectedRowKeys([]);
    }
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

    const selectedRows = dataSource.filter((item) =>
      selectedRowKeys.includes(item.key)
    );

    const approvedRows = selectedRows.filter(
      (item) => item.approvalStatus === "approved"
    );

    if (approvedRows.length > 0) {
      Modal.warning({
        title: "Không thể xóa phiếu đã duyệt",
        content: `Có ${approvedRows.length} phiếu đã được duyệt. Vui lòng bỏ chọn chúng trước khi xóa.`,
      });
      return;
    }

    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} dòng này không?`,
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoading(true);

          await Promise.all(selectedRowKeys.map((id) => deleteBuySupplies(id)));

          const remainingData = dataSource.filter(
            (item) => !selectedRowKeys.includes(item.key)
          );

          setDataSource(remainingData);
          setSelectedRowKeys([]);
          setMobileActionDrawerVisible(false);
          Modal.success({
            title: "Xóa thành công",
            content: `${selectedRowKeys.length} dòng đã được xóa.`,
          });
        } catch (error) {
          console.error("Lỗi khi xóa:", error);
          Modal.error({
            title: "Lỗi",
            content: "Đã xảy ra lỗi khi xóa. Vui lòng thử lại.",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleSearch = () => {
    fetchData(1, pagination.pageSize);
    if (isMobile) {
      setFilterDrawerVisible(false);
    }
  };

  const handleReset = () => {
    setFilters({
      dateRange: null,
      voucherNo: "",
      proposalName: "",
      proposalType: "",
    });
    fetchData(pagination.current, pagination.pageSize);
    if (isMobile) {
      setFilterDrawerVisible(false);
    }
  };

  // Action menu for mobile
  const actionMenu = (
    <Menu>
      <Menu.Item key="add" icon={<PlusOutlined />} onClick={handleAdd}>
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
    </Menu>
  );

  // Render filter form
  const renderFilterForm = () => (
    <div style={{ padding: isMobile ? 12 : 16 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <label
            style={{
              display: "block",
              marginBottom: 4,
              fontSize: isMobile ? 12 : 14,
            }}
          >
            Thời gian
          </label>
          <RangePicker
            style={{ width: "100%" }}
            format="DD/MM/YYYY"
            value={filters.dateRange}
            onChange={(value) => handleFilterChange("dateRange", value)}
            size={isMobile ? "small" : "default"}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <label
            style={{
              display: "block",
              marginBottom: 4,
              fontSize: isMobile ? 12 : 14,
            }}
          >
            Số chứng từ
          </label>
          <Input
            placeholder="Số chứng từ"
            value={filters.voucherNo}
            onChange={(e) => handleFilterChange("voucherNo", e.target.value)}
            size={isMobile ? "small" : "default"}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <label
            style={{
              display: "block",
              marginBottom: 4,
              fontSize: isMobile ? 12 : 14,
            }}
          >
            Nội dung đề xuất
          </label>
          <Input
            placeholder="Nội dung đề xuất"
            value={filters.proposalName}
            onChange={(e) => handleFilterChange("proposalName", e.target.value)}
            size={isMobile ? "small" : "default"}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <label
            style={{
              display: "block",
              marginBottom: 4,
              fontSize: isMobile ? 12 : 14,
            }}
          >
            Loại đề xuất
          </label>
          <Select
            placeholder="Chọn loại đề xuất"
            value={filters.proposalType}
            onChange={(value) => handleFilterChange("proposalType", value)}
            style={{ width: "100%" }}
            size={isMobile ? "small" : "default"}
          >
            <Option value="MV">Mua vật tư, ccdc</Option>
            <Option value="CV">Cấp vật tư, ccdc</Option>
            <Option value="SC">Sửa chữa thiết bị, CCDC</Option>
          </Select>
        </Col>
      </Row>
      <div style={{ marginTop: 16, textAlign: "right" }}>
        <Button
          type="primary"
          onClick={handleSearch}
          style={{ marginRight: 8 }}
          size={isMobile ? "small" : "default"}
        >
          Lọc
        </Button>
        <Button onClick={handleReset} size={isMobile ? "small" : "default"}>
          Hủy
        </Button>
      </div>
    </div>
  );

  // Render mobile cards
  const renderMobileCards = () => (
    <div style={{ padding: "0 8px" }}>
      {/* Select All Option */}
      <Card
        size="small"
        style={{
          marginBottom: 12,
          backgroundColor: "#f6ffed",
          border: "1px solid #b7eb8f",
        }}
        bodyStyle={{ padding: "8px 12px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Checkbox
            checked={selectAllChecked}
            onChange={(e) => handleSelectAll(e.target.checked)}
          >
            <Text style={{ fontSize: "12px", fontWeight: "500" }}>
              Chọn tất cả ({dataSource.length})
            </Text>
          </Checkbox>
          {selectedRowKeys.length > 0 && (
            <Badge
              count={selectedRowKeys.length}
              style={{ backgroundColor: "#52c41a" }}
            />
          )}
        </div>
      </Card>

      {/* Data Cards */}
      {dataSource.map((item, index) => (
        <Card
          key={item.key}
          size="small"
          style={{
            marginBottom: 12,
            border: selectedRowKeys.includes(item.key)
              ? "2px solid #1890ff"
              : "1px solid #f0f0f0",
            borderRadius: "8px",
            boxShadow: selectedRowKeys.includes(item.key)
              ? "0 2px 8px rgba(24, 144, 255, 0.2)"
              : "0 1px 3px rgba(0,0,0,0.1)",
            transition: "all 0.2s ease",
          }}
          bodyStyle={{ padding: 12 }}
          onClick={() => {
            const newSelection = selectedRowKeys.includes(item.key)
              ? selectedRowKeys.filter((key) => key !== item.key)
              : [...selectedRowKeys, item.key];
            setSelectedRowKeys(newSelection);
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: 1 }}>
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <Checkbox
                  checked={selectedRowKeys.includes(item.key)}
                  onChange={(e) => {
                    e.stopPropagation();
                    const newSelection = e.target.checked
                      ? [...selectedRowKeys, item.key]
                      : selectedRowKeys.filter((key) => key !== item.key);
                    setSelectedRowKeys(newSelection);
                  }}
                  style={{ marginRight: 8 }}
                />
                <Text style={{ fontSize: 11, color: "#999", marginRight: 8 }}>
                  #{item.stt}
                </Text>
                <Link
                  to={`/pm/de-xuat/mua-vat-tu-ccdc-chi-tiet/${item.key}`}
                  style={{ fontWeight: 600, fontSize: 14, color: "#1890ff" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.voucherNo}
                </Link>
              </div>

              {/* Details */}
              <div style={{ fontSize: 12, color: "#666", lineHeight: 1.4 }}>
                <div style={{ marginBottom: 2 }}>
                  <Text strong>Ngày:</Text>{" "}
                  {item.voucherDate
                    ? new Date(item.voucherDate).toLocaleDateString("vi-VN")
                    : "---"}
                </div>

                <div style={{ marginBottom: 2 }}>
                  <Text strong>Đơn vị:</Text> {item.divionID}
                </div>

                <div style={{ marginBottom: 2 }}>
                  <Text strong>Nội dung:</Text>
                  <Text ellipsis style={{ marginLeft: 4 }}>
                    {item.proposalName}
                  </Text>
                </div>

                {item.note && (
                  <div>
                    <Text strong>Ghi chú:</Text>
                    <Text ellipsis style={{ marginLeft: 4 }}>
                      {item.note}
                    </Text>
                  </div>
                )}
              </div>
            </div>

            {/* Status & Type */}
            <div
              style={{
                marginLeft: 12,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <Tag
                color={
                  item.proposalType === "MV"
                    ? "green"
                    : item.proposalType === "CV"
                    ? "blue"
                    : "orange"
                }
                style={{
                  fontSize: 10,
                  marginBottom: 4,
                  borderRadius: "4px",
                  fontWeight: "500",
                }}
              >
                {item.proposalType === "MV"
                  ? "Mua VT"
                  : item.proposalType === "CV"
                  ? "Cấp VT"
                  : "Sửa chữa"}
              </Tag>

              <Tag
                color={
                  item.approvalStatus === "approved"
                    ? "green"
                    : item.approvalStatus === "rejected"
                    ? "red"
                    : "orange"
                }
                style={{
                  fontSize: 10,
                  borderRadius: "4px",
                  fontWeight: "500",
                }}
              >
                {item.approvalStatus === "approved"
                  ? "Đã duyệt"
                  : item.approvalStatus === "rejected"
                  ? "Từ chối"
                  : "Chờ duyệt"}
              </Tag>
            </div>
          </div>
        </Card>
      ))}

      {/* Mobile Pagination */}
      {dataSource.length > 0 && (
        <Card
          style={{
            marginTop: 16,
            textAlign: "center",
            backgroundColor: "#fafafa",
          }}
          bodyStyle={{ padding: "12px" }}
        >
          <Space>
            <Button
              disabled={pagination.current === 1}
              onClick={() =>
                fetchData(pagination.current - 1, pagination.pageSize)
              }
              size="small"
            >
              Trang trước
            </Button>
            <Text style={{ fontSize: 12, color: "#666", margin: "0 8px" }}>
              {pagination.current} /{" "}
              {Math.ceil(pagination.total / pagination.pageSize)}
            </Text>
            <Button
              disabled={
                pagination.current >=
                Math.ceil(pagination.total / pagination.pageSize)
              }
              onClick={() =>
                fetchData(pagination.current + 1, pagination.pageSize)
              }
              size="small"
            >
              Trang sau
            </Button>
          </Space>
          <Divider type="vertical" />
          <Text style={{ fontSize: 11, color: "#999" }}>
            Tổng: {pagination.total} đề xuất
          </Text>
        </Card>
      )}
    </div>
  );

  return (
    <div style={{ padding: isMobile ? 8 : 5 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: isMobile ? "wrap" : "nowrap",
          gap: isMobile ? 8 : 0,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: isMobile ? 18 : 24,
            flex: isMobile ? "1 1 100%" : "auto",
          }}
        >
          Đề xuất mua, cấp, sửa chữa vật tư, CCDC
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
                onClick={handleAdd}
                icon={<PlusOutlined />}
                style={{ background: "#e6f4fb", color: "#0700ad" }}
                size={isTablet ? "small" : "default"}
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={handleDelete}
                disabled={selectedRowKeys.length === 0}
                size={isTablet ? "small" : "default"}
              />
            </Tooltip>
          </Space>
        )}
      </div>

      {/* Selected items info for mobile */}
      {isMobile && selectedRowKeys.length > 0 && (
        <div
          style={{
            background: "#e6f7ff",
            padding: 8,
            borderRadius: 4,
            marginBottom: 12,
            fontSize: 12,
            textAlign: "center",
          }}
        >
          Đã chọn {selectedRowKeys.length} mục
        </div>
      )}

      {/* Filter Section */}
      {!isMobile && showFilters && (
        <div
          style={{
            background: "#fafafa",
            padding: 16,
            marginBottom: 20,
            borderRadius: 8,
            border: "1px solid #eee",
          }}
        >
          {renderFilterForm()}
        </div>
      )}

      {/* Table for desktop/tablet, Cards for mobile */}
      {isMobile ? (
        renderMobileCards()
      ) : (
        <Table
          rowSelection={rowSelection}
          columns={isMobile ? mobileColumns : columns}
          dataSource={dataSource}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: !isTablet,
            showQuickJumper: !isTablet,
            size: isTablet ? "small" : "default",
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} mục`,
          }}
          onChange={(pagination) => {
            fetchData(pagination.current, pagination.pageSize);
          }}
          bordered
          size={isTablet ? "small" : "default"}
          scroll={{ x: isMobile ? 600 : isTablet ? 800 : "max-content" }}
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

      {/* Filter Drawer for Mobile */}
      <Drawer
        title="Lọc tìm kiếm"
        placement="bottom"
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
        height="80%"
      >
        {renderFilterForm()}
      </Drawer>

      {/* Mobile Action Drawer */}
      <Drawer
        title={`Thao tác${
          selectedRowKeys.length > 0 ? ` (${selectedRowKeys.length})` : ""
        }`}
        placement="bottom"
        onClose={() => setMobileActionDrawerVisible(false)}
        open={mobileActionDrawerVisible}
        height="auto"
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: "8px 0" }}>
          <div
            onClick={handleAdd}
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f0f0f0",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <PlusOutlined style={{ color: "#1890ff" }} />
            <span>Thêm đề xuất mới</span>
          </div>

          <div
            onClick={handleDelete}
            style={{
              padding: "16px 20px",
              cursor: selectedRowKeys.length === 0 ? "not-allowed" : "pointer",
              opacity: selectedRowKeys.length === 0 ? 0.5 : 1,
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: selectedRowKeys.length === 0 ? "#ccc" : "#ff4d4f",
            }}
          >
            <DeleteOutlined />
            <span>Xóa đề xuất đã chọn ({selectedRowKeys.length})</span>
          </div>
        </div>
      </Drawer>

      {/* Modal */}
      <BuySuppliesModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editingData}
      />

      {/* Back to Top */}
      <BackTop>
        <div
          style={{
            height: 40,
            width: 40,
            lineHeight: "40px",
            borderRadius: 20,
            backgroundColor: "#1890ff",
            color: "#fff",
            textAlign: "center",
            fontSize: 14,
          }}
        >
          <UpOutlined />
        </div>
      </BackTop>
    </div>
  );
};

export default BuySupplies;
