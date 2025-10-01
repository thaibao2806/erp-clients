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
import { Link } from "react-router-dom";
import { saveAs } from "file-saver";
// import ImportWareHouseModal from "./ImportWareHouseModal";
import {
  deleteJobRequirements,
  exportExcelJR,
  filterJobRequirements,
} from "../../../../services/apiTechnicalMaterial/apiJobRequirement";
import { filterInventoryTransaction } from "../../../../config/config";
import { getStockOnHandReport } from "../../../../services/apiTechnicalMaterial/apiInventoryTransaction";

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

const MaterialManager = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [mobileActionDrawerVisible, setMobileActionDrawerVisible] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const today = new Date();
const currentMonth = today.getMonth() + 1; // getMonth trả về 0-11
const currentYear = today.getFullYear();

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
        warehouseCode,
        year,
        month,
      } = filters;

      let res = await getStockOnHandReport(
        warehouseCode, year, month
      );
      if (res && res.status === 200) {
        let { items, totalCount } = res.data.data;

        // Thêm STT và key
        // Dữ liệu trả về là array nên map trực tiếp
      let dataWithStt = res.data.data.map((item, index) => ({
        ...item,
        key: item.materialCode, // dùng mã vật tư làm key
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
  warehouseCode: "Q7",   // mặc định kho Q7
  month: currentMonth.toString(),   // mặc định tháng hiện tại
  year: currentYear.toString(),
});

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      width: isMobile ? 50 : 60,
      fixed: isMobile ? "left" : false,
    },
    {
      title: "Mã vật tư",
      dataIndex: "materialCode",
      width: isMobile ? 120 : 150,
    },
    {
      title: "Tên vật tư",
      width: isMobile ? 150 : 200,
      dataIndex: "materialName",
    },
    {
      title: "Đơn vị tính",
      width: isMobile ? 80 : 120,
      dataIndex: "unit",
    },
    {
      title: "Tồn đầu kỳ",
      width: isMobile ? 80 : 120,
      dataIndex: "openingBalance",
    },
    {
      title: "Nhập kho",
      width: isMobile ? 80 : 120,
      dataIndex: "inQty",
    },
    {
      title: "Xuất kho",
      width: isMobile ? 80 : 120,
      dataIndex: "outQty",
    },
    {
      title: "Tồn cuối kỳ",
      width: isMobile ? 80 : 120,
      dataIndex: "closingBalance",
    },
    // {
    //   title: "Trạng thái duyệt",
    //   dataIndex: "approvalStatus",
    //   render: (status) => {
    //     const statusConfig = {
    //       approved: { color: "green", text: "Đã duyệt" },
    //       rejected: { color: "red", text: "Từ chối" },
    //       pending: { color: "orange", text: "Chờ duyệt" },
    //     };
    //     const config = statusConfig[status] || {
    //       color: "default",
    //       text: status,
    //     };
    //     return <Tag color={config.color}>{config.text}</Tag>;
    //   },
    // },
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
      dataIndex: "materialCode",
      fixed: "left",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
            {record.materialCode}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
            {record.materialName}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
            {record.unit}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
            {record.openingBalance}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
            {record.inQty}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
            {record.outQty}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
            {record.closingBalance}
          </div>
        </div>
      ),
    },
    // {
    //   title: "Trạng thái",
    //   dataIndex: "approvalStatus",
    //   width: 100,
    //   render: (status) => {
    //     const statusConfig = {
    //       approved: { color: "green", text: "Đã duyệt" },
    //       rejected: { color: "red", text: "Từ chối" },
    //       pending: { color: "orange", text: "Chờ duyệt" },
    //     };
    //     const config = statusConfig[status] || {
    //       color: "default",
    //       text: status,
    //     };
    //     return (
    //       <Tag color={config.color} style={{ fontSize: 10 }}>
    //         {config.text}
    //       </Tag>
    //     );
    //   },
    // },
  ];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const handleAdd = () => {
    setEditingData(null); // không có dữ liệu -> thêm mới
    setModalOpen(true);
    setMobileActionDrawerVisible(false);
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
          setLoading(true); // bật loading cho Table

          // Gọi API xóa từng ID
          await Promise.all(
            selectedRowKeys.map((id) => deleteJobRequirements(id))
          );

          // Sau khi xóa thành công, cập nhật lại danh sách
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
        content: "Vui lòng chọn ít nhất một dòng để xuất excel.",
      });
      return;
    }
    try {
      setLoading(true);
      for (const id of selectedRowKeys) {
        const matchedItem = dataSource.find((item) => item.id === id);
        const fileName = matchedItem?.voucherNo
          ? `PhieuGiaoViec_${matchedItem.voucherNo}.xlsx`
          : `PhieuGiaoViec_${id}.xlsx`;
        try {
          let res = await exportExcelJR(id);
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
    fetchData(1, pagination.pageSize); // luôn reset về trang 1
    if (isMobile) {
      setFilterDrawerVisible(false);
    }
  };

  const handleReset = () => {
    setFilters({
      warehouseCode: "Q7",   // mặc định kho Q7
  month: currentMonth.toString(),   // mặc định tháng hiện tại
  year: currentYear.toString(),
    });
    fetchData(pagination.current, pagination.pageSize);
    if (isMobile) {
      setFilterDrawerVisible(false);
    }
  };

  // Action menu for mobile
  const actionMenu = (
    <Menu>
      {/* <Menu.Item key="add" icon={<PlusOutlined />} onClick={handleAdd}>
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
      </Menu.Item> */}
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
        {/* <Col xs={24} sm={12} md={8}>
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
        </Col> */}
        <Col xs={24} sm={12} md={8}>
          <label
            style={{
              display: "block",
              marginBottom: 4,
              fontSize: isMobile ? 12 : 14,
            }}
          >
            Kho
          </label>
          <Input
            placeholder="Kho"
            value={filters.warehouseCode}
            onChange={(e) => handleFilterChange("warehouseCode", e.target.value)}
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
            Tháng
          </label>
          <Input
            placeholder="Tháng"
            value={filters.month}
            onChange={(e) => handleFilterChange("month", e.target.value)}
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
            Năm
          </label>
          <Input
            placeholder="Năm"
            value={filters.year}
            onChange={(e) => handleFilterChange("year", e.target.value)}
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 12, color: "#666", marginRight: 8 }}>
                  #{item.stt}
                </span>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
                  <strong>Mã vật tư:</strong> {item.materialCode}
                </div>
              </div>

              <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
                <strong>Tên vật tư:</strong> {item.materialName}
              </div>

              <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
                <strong>ĐVT:</strong> {item.unit}
              </div>

              <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
                <strong>Tồn đầu kỳ:</strong> {item.openingBalance}
              </div>

              <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
                <strong>Nhập kho:</strong> {item.inQty}
              </div>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
                <strong>Xuất kho:</strong> {item.outQty}
              </div>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
                <strong>Tồn cuối kỳ:</strong> {item.closingBalance}
              </div>
            </div>

            {/* <div style={{ marginLeft: 12 }}>
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
            </div> */}
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
          {pagination.current} /{" "}
          {Math.ceil(pagination.total / pagination.pageSize)}
        </span>
        <Button
          disabled={
            pagination.current >=
            Math.ceil(pagination.total / pagination.pageSize)
          }
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
        <h1
          style={{
            margin: 0,
            fontSize: isMobile ? 18 : 24,
            flex: isMobile ? "1 1 100%" : "auto",
          }}
        >
          Quản lý vật tư
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
            {/* <Tooltip title="Thêm">
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
            </Tooltip> */}
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

      {/* Bộ lọc tìm kiếm */}
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

      {/* Bảng dữ liệu */}
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
      {/* <ImportWareHouseModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editingData}
      /> */}
    </div>
  );
};

export default MaterialManager;
