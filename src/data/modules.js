// src/config/navigation.js

// Định nghĩa cấu trúc dữ liệu cho modules và pages
export const moduleData = {
    TM: { // Sales Order
      name: 'Ban KT-VT-CN',
      pages: [
        { key: 'so-orders', label: 'Đơn hàng bán', path: '/so/orders' },
        { key: 'so-delivery', label: 'Tình trạng giao hàng', path: '/so/delivery-status' },
        { key: 'so-pricelist', label: 'Bảng giá', path: '/so/price-list' },
      ],
    },
    PL: { // Purchase Order
      name: 'Ban KH-UD',
      pages: [
        { key: 'po-orders', label: 'Đơn hàng mua', path: '/po/orders' },
        { key: 'po-receipts', label: 'Nhập kho', path: '/po/receipts' },
      ],
    },
    FN: { // Warehouse Management
      name: 'Ban Tài Chính',
      pages: [
        { key: 'wm-inventory', label: 'Tồn kho', path: '/wm/inventory' },
        { key: 'wm-transfer', label: 'Chuyển kho', path: '/wm/transfer' },
      ],
    },
    PT: { // Customer Relationship Management
      name: 'Ban hành chính - chính trị',
      pages: [
        { key: 'crm-customers', label: 'Danh sách khách hàng', path: '/crm/customers' },
        { key: 'crm-opportunities', label: 'Cơ hội bán hàng', path: '/crm/opportunities' },
      ],
    },
    PM: { // Customer Relationship Management
        name: 'Điều độ sản xuất',
        pages: [
          { key: 'pm-dashboard', label: 'A. Dashboard', path: '/pm/dashboard' },
          { key: 'pm-chamcong', label: 'B. Chấm công', path: '/pm/cham-cong' },
          { key: 'pm-bien-ban', label: 'C. Biên bản', children: [
            { key: 'pm-bien-ban-ban-giao', label: '1. Bàn giao vật tư', path: '/pm/bien-ban/bien-ban-ban-giao-vat-tu' },
            { key: 'pm-bien-ban-thu-hoi-vat-tu', label: '2. Thu hồi vật tư', path: '/pm/bien-ban/bien-ban-thu-hoi-vat-tu' },
            { key: 'pm-bien-ban-khao-sat-thiet-bi', label: '3. Khảo sát thiết bị', path: '/pm/bien-ban/bien-ban-khao-sat-thiet-bị' },
            { key: 'pm-bien-ban-nghiem-thu-sau-sua-chua', label: '4. Nghiệm thu sau sửa chữa', path: '/pm/bien-ban/bien-ban-nghiem-thu-sau-sua-chua' },
          ] },
          { key: 'pm-bao-cao', label: 'D. Báo cáo', children: [
            { key: 'pm-bao-cao-ban-giao', label: '1. Bàn giao vật tư', path: '/pm/bao-cao/bao-cao-ban-giao-vat-tu' },
            { key: 'pm-bao-cao-thu-hoi-vat-tu', label: '2. Thu hồi vật tư', path: '/pm/bao-cao/bao-cao-thu-hoi-vat-tu' },
          ] },
          { key: 'pm-de-xuat', label: 'E. Đề xuất', children: [
            { key: 'pm-de-xuat-sua-chua', label: '1. Sửa chữa', path: '/pm/de-xuat/de-xuat-sua-chua' },
            { key: 'pm-de-xuat-thanh-ly', label: '2. Thanh lý', path: '/pm/de-xuat/de-xuat-thanh-ly' },
          ] },
          { key: 'pm-so-kho', label: 'F. Sổ kho', path: '/pm/so-kho' },
          { key: 'pm-du-an', label: 'G. Dự án', path: '/pm/du-an' },
          { key: 'pm-tien-do', label: 'H. Tiến độ', path: '/pm/tien-do' },
        ],
      },
    // Thêm các module khác nếu cần
  };
  
  // Lấy danh sách keys của các module
  const moduleKeys = Object.keys(moduleData);
  
  // Xác định thông tin mặc định
  let defaultModuleKey = '';
  let defaultPageKey = '';
  let defaultPath = '/'; // Đường dẫn fallback
  
  if (moduleKeys.length > 0) {
    defaultModuleKey = moduleKeys[0]; // Lấy key của module đầu tiên
    const firstModulePages = moduleData[defaultModuleKey]?.pages;
    if (firstModulePages && firstModulePages.length > 0) {
      defaultPageKey = firstModulePages[0].key; // Lấy key của trang đầu tiên
      defaultPath = firstModulePages[0].path; // Lấy path của trang đầu tiên
    }
  }
  
  // Tạo danh sách modules cho Select component
  export const modules = moduleKeys.map(key => ({
    value: key,
    label: moduleData[key].name,
  }));
  
  // Export các giá trị mặc định để sử dụng ở nơi khác
  export { defaultModuleKey, defaultPageKey, defaultPath };