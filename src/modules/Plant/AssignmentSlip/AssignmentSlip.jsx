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
  Drawer,
  Card,
  Tag,
  Divider,
  Dropdown,
  Menu,
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
} from "@ant-design/icons";
import AssignmentSlipModal from "./AssignmentSlipModal";
import { Link } from "react-router-dom";
import {
  deleteAssignmetSlip,
  exportExcel,
  fillterAssignmentSlip,
} from "../../../services/apiPlan/apiAssignmentSlip";
import { saveAs } from "file-saver";

const { RangePicker } = DatePicker;

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

const AssignmentSlip = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [mobileActionDrawerVisible, setMobileActionDrawerVisible] = useState(false);
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

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize);
  }, []);

  const fetchData = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const {
        documentNumber,
        productName,
        managementUnit,
        department,
        dateRange,
      } = filters;
      const fromDate = dateRange ? dateRange[0].format("YYYY-MM-DD") : null;
      const toDate = dateRange ? dateRange[1].format("YYYY-MM-DD") : null;

      let res = await fillterAssignmentSlip(
        documentNumber,
        productName,
        department,
        managementUnit,
        fromDate,
        toDate,
        "",
        page,
        pageSize
      );
      if (res && res.status === 200) {
        let { items, totalCount } = res.data.data;

        // Thêm STT và key
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

  const [filters, setFilters] = useState({
    dateRange: null,
    documentNumber: "",
    productName: "",
    managementUnit: "",
    department: "",
  });

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      width: isMobile ? 50 : 60,
      fixed: isMobile ? "left" : false,
    },
    {
      title: "Số chứng từ",
      dataIndex: "documentNumber",
      width: isMobile ? 120 : 150,
      fixed: isMobile ? "left" : false,
      render: (text, record) => (
        <Link to={`/pl/phieu-giao-viec-chi-tiet/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: "Ngày chứng từ",
      dataIndex: "documentDate",
      width: isMobile ? 100 : 120,
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "---",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      width: isMobile ? 150 : 200,
    },
    {
      title: "Đơn vị quản lý sd",
      dataIndex: "managementUnit",
      width: isMobile ? 120 : 150,
    },
    {
      title: "Bộ phận",
      dataIndex: "department",
      width: isMobile ? 100 : 120,
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
        const config = statusConfig[status] || { color: "default", text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      width: isMobile ? 120 : 150,
      ellipsis: true,
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
      dataIndex: "documentNumber",
      fixed: "left",
      width: 200,
      render: (_, record) => (
        <div>
          <Link 
            to={`/pl/phieu-giao-viec-chi-tiet/${record.id}`}
            style={{ fontWeight: 600, fontSize: 14 }}
          >
            {record.documentNumber}
          </Link>
          <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
            {record.documentDate 
              ? new Date(record.documentDate).toLocaleDateString("vi-VN")
              : "---"}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
            {record.productName}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "approvalStatus",
      width: 100,
      render: (status) => {
        const statusConfig = {
          approved: { color: "green", text: "Đã duyệt" },
          rejected: { color: "red", text: "Từ chối" },
          pending: { color: "orange", text: "Chờ duyệt" },
        };
        const config = statusConfig[status] || { color: "default", text: status };
        return <Tag color={config.color} style={{ fontSize: 10 }}>{config.text}</Tag>;
      },
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

          await Promise.all(
            selectedRowKeys.map((id) => deleteAssignmetSlip(id))
          );

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

  const handleExportExcel = async () => {
    if (selectedRowKeys.length === 0) {
      Modal.warning({
        title: "Chưa chọn dòng nào",
        content: "Vui lòng chọn ít nhất một dòng để xuất Excel.",
      });
      return;
    }
    try {
      setLoading(true);
      for (const id of selectedRowKeys) {
        const matchedItem = dataSource.find((item) => item.id === id);
        const fileName = matchedItem?.documentNumber
          ? `PhieuGiaoViec_${matchedItem.documentNumber}.xlsx`
          : `PhieuGiaoViec_${id}.xlsx`;
        try {
          let res = await exportExcel(id);
          const blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });

          saveAs(blob, fileName);
        } catch (error) {
          console.log(error);
        }
      }
      setMobileActionDrawerVisible(false);
    } catch (error) {
      Modal.error({
        title: "Lỗi xuất file",
        content: "Đã xảy ra lỗi khi xuất một hoặc nhiều phiếu.",
      });
    } finally {
      setLoading(false);
    }
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
      documentNumber: "",
      productName: "",
      managementUnit: "",
      department: "",
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
      <Menu.Item 
        key="export" 
        icon={<FileExcelOutlined />} 
        onClick={handleExportExcel}
        disabled={selectedRowKeys.length === 0}
      >
        Xuất Excel ({selectedRowKeys.length})
      </Menu.Item>
    </Menu>
  );

  // Render filter form
  const renderFilterForm = () => (
    <div style={{ padding: isMobile ? 12 : 16 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <label style={{ display: "block", marginBottom: 4, fontSize: isMobile ? 12 : 14 }}>
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
          <label style={{ display: "block", marginBottom: 4, fontSize: isMobile ? 12 : 14 }}>
            Số chứng từ
          </label>
          <Input
            placeholder="Số chứng từ"
            value={filters.documentNumber}
            onChange={(e) =>
              handleFilterChange("documentNumber", e.target.value)
            }
            size={isMobile ? "small" : "default"}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <label style={{ display: "block", marginBottom: 4, fontSize: isMobile ? 12 : 14 }}>
            Tên sản phẩm
          </label>
          <Input
            placeholder="Tên sản phẩm"
            value={filters.productName}
            onChange={(e) =>
              handleFilterChange("productName", e.target.value)
            }
            size={isMobile ? "small" : "default"}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <label style={{ display: "block", marginBottom: 4, fontSize: isMobile ? 12 : 14 }}>
            Đơn vị quản lý sử dụng
          </label>
          <Input
            placeholder="Đơn vị quản lý"
            value={filters.managementUnit}
            onChange={(e) =>
              handleFilterChange("managementUnit", e.target.value)
            }
            size={isMobile ? "small" : "default"}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <label style={{ display: "block", marginBottom: 4, fontSize: isMobile ? 12 : 14 }}>
            Bộ phận
          </label>
          <Input
            placeholder="Bộ phận"
            value={filters.department}
            onChange={(e) =>
              handleFilterChange("department", e.target.value)
            }
            size={isMobile ? "small" : "default"}
          />
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
      {dataSource.map((item, index) => (
        <Card
          key={item.key}
          size="small"
          style={{ 
            marginBottom: 12,
            border: selectedRowKeys.includes(item.key) ? "2px solid #1890ff" : "1px solid #f0f0f0"
          }}
          bodyStyle={{ padding: 12 }}
          onClick={() => {
            const newSelection = selectedRowKeys.includes(item.key)
              ? selectedRowKeys.filter(key => key !== item.key)
              : [...selectedRowKeys, item.key];
            setSelectedRowKeys(newSelection);
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#666", marginRight: 8 }}>#{item.stt}</span>
                <Link 
                  to={`/pl/phieu-giao-viec-chi-tiet/${item.id}`}
                  style={{ fontWeight: 600, fontSize: 14 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.documentNumber}
                </Link>
              </div>
              
              <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
                <strong>Ngày:</strong> {item.documentDate 
                  ? new Date(item.documentDate).toLocaleDateString("vi-VN")
                  : "---"}
              </div>
              
              <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
                <strong>Sản phẩm:</strong> {item.productName}
              </div>
              
              <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
                <strong>Bộ phận:</strong> {item.department}
              </div>
              
              {item.note && (
                <div style={{ fontSize: 12, color: "#666" }}>
                  <strong>Ghi chú:</strong> {item.note}
                </div>
              )}
            </div>
            
            <div style={{ marginLeft: 12 }}>
              <Tag 
                color={
                  item.approvalStatus === "approved" ? "green" : 
                  item.approvalStatus === "rejected" ? "red" : "orange"
                }
                style={{ fontSize: 10 }}
              >
                {item.approvalStatus === "approved" ? "Đã duyệt" : 
                 item.approvalStatus === "rejected" ? "Từ chối" : "Chờ duyệt"}
              </Tag>
            </div>
          </div>
        </Card>
      ))}
      
      {/* Mobile Pagination */}
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Button
          disabled={pagination.current === 1}
          onClick={() => fetchData(pagination.current - 1, pagination.pageSize)}
          size="small"
        >
          Trang trước
        </Button>
        <span style={{ margin: "0 12px", fontSize: 12 }}>
          {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize)}
        </span>
        <Button
          disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
          onClick={() => fetchData(pagination.current + 1, pagination.pageSize)}
          size="small"
        >
          Trang sau
        </Button>
      </div>
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
        <h1 style={{ 
          margin: 0, 
          fontSize: isMobile ? 18 : 24,
          flex: isMobile ? "1 1 100%" : "auto"
        }}>
          Phiếu giao việc
        </h1>
        
        {isMobile ? (
          <Space size="small">
            <Button
              icon={<FilterOutlined />}
              onClick={() => setFilterDrawerVisible(true)}
              size="small"
              style={{ background: "#e6f4fb", color: "#0700ad" }}
            />
            <Dropdown overlay={actionMenu} trigger={['click']}>
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
            <Tooltip title="Xuất excel">
              <Button
                icon={<FileExcelOutlined />}
                onClick={handleExportExcel}
                style={{ background: "#e6f4fb", color: "#0700ad" }}
                size={isTablet ? "small" : "default"}
                disabled={selectedRowKeys.length === 0}
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

      {/* Modal */}
      <AssignmentSlipModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editingData}
      />
    </div>
  );
};

export default AssignmentSlip;