import React, { useState } from 'react';
import {
  Table,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Dropdown,
  Checkbox,
} from 'antd';
import {
  SearchOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const Review = () => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([
    'STT', 'donVi', 'maPhieu', 'loai', 'trangThai', 'dienGiai', 'yKien',
  ]);

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
  };

  const allColumns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      render: (_, __, index) => index + 1,
      width: 70,
      align: 'center',
    },
    {
      title: 'Đơn vị',
      dataIndex: 'donVi',
      key: 'donVi',
    },
    {
      title: 'Mã phiếu',
      dataIndex: 'maPhieu',
      key: 'maPhieu',
    },
    {
      title: 'Loại',
      dataIndex: 'loai',
      key: 'loai',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
    },
    {
      title: 'Diễn giải',
      dataIndex: 'dienGiai',
      key: 'dienGiai',
    },
    {
      title: 'Ý kiến người duyệt',
      dataIndex: 'yKien',
      key: 'yKien',
    },
  ];

  const filteredColumns = allColumns.filter((col) =>
    col.key === 'index' ? visibleColumns.includes('STT') : visibleColumns.includes(col.dataIndex)
  );

  const columnOptions = [
    { label: 'STT', value: 'STT' },
    ...allColumns.slice(1).map((col) => ({
      label: col.title,
      value: col.dataIndex,
    })),
  ];

  const handleColumnChange = (checkedValues) => {
    setVisibleColumns(checkedValues);
  };

  const handleApproveSelected = () => {
    console.log('Duyệt các dòng sau:', selectedRows);
    // Gọi API tại đây nếu cần
  };

  const [search, setSearch] = useState({
    maPhieu: '',
    donVi: '',
    loai: '',
    trangThai: '',
  });

  const data = [
    {
      key: '1',
      donVi: 'Phòng Kế Toán',
      maPhieu: 'MP001',
      loai: 'Chi phí',
      trangThai: 'Chờ duyệt',
      dienGiai: 'Thanh toán hóa đơn điện',
      yKien: 'Cần thêm hóa đơn gốc',
    },
    {
      key: '2',
      donVi: 'Phòng Nhân sự',
      maPhieu: 'MP002',
      loai: 'Lương',
      trangThai: 'Đã duyệt',
      dienGiai: 'Chi lương tháng 4',
      yKien: 'OK',
    },
  ];

  return (
    <div>
      {/* === Header === */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <Title level={3} style={{ margin: 0 }}>Xét duyệt</Title>

        <Space>
          
          <Button
            icon={searchVisible ? <CloseCircleOutlined /> : <SearchOutlined />}
            onClick={toggleSearch}
          >
            {/* {searchVisible ? 'Đóng tìm kiếm' : 'Tìm kiếm'} */}
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            disabled={selectedRows.length === 0}
            onClick={handleApproveSelected}
          >
            Duyệt hàng loạt
          </Button>
        </Space>
      </div>

      {/* === Form Tìm kiếm === */}
      {searchVisible && (
        <>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Input
              placeholder="Tìm theo mã phiếu"
              value={search.maPhieu}
              onChange={(e) => setSearch({ ...search, maPhieu: e.target.value })}
            />
          </Col>
          <Col span={6}>
            <Input
              placeholder="Tìm theo đơn vị"
              value={search.donVi}
              onChange={(e) => setSearch({ ...search, donVi: e.target.value })}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="Loại phiếu"
              value={search.loai}
              onChange={(value) => setSearch({ ...search, loai: value })}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="Chi phí">Chi phí</Option>
              <Option value="Lương">Lương</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="Trạng thái"
              value={search.trangThai}
              onChange={(value) => setSearch({ ...search, trangThai: value })}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="Chờ duyệt">Chờ duyệt</Option>
              <Option value="Đã duyệt">Đã duyệt</Option>
              <Option value="Từ chối">Từ chối</Option>
            </Select>
          </Col>
        </Row>
        <Row justify="end" style={{ marginBottom: 16 }}>
      <Space>
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={() => {
            console.log('Giá trị tìm kiếm:', search);
            // TODO: Gọi API tìm kiếm hoặc filter dữ liệu tại đây
          }}
        >
          Lọc
        </Button>
        <Button
          onClick={() => {
            setSearch({
              maPhieu: '',
              donVi: '',
              loai: '',
              trangThai: '',
            });
          }}
        >
          Hủy
        </Button>
      </Space>
    </Row>
        </> 
      )}

      {/* === Bảng dữ liệu === */}
      <Table
        rowSelection={{
          onChange: (_, rows) => setSelectedRows(rows),
        }}
        columns={filteredColumns}
        dataSource={data}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default Review;
