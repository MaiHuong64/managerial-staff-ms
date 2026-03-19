import { Table, Button, Input, Tag } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';

export const DepartmentPage = () => {
  const columns = [
    { title: 'Mã đơn vị', dataIndex: 'code', key: 'code', className: 'font-medium' },
    { title: 'Tên đơn vị', dataIndex: 'name', key: 'name' },
    { title: 'Số lượng nhân sự', dataIndex: 'count', key: 'count', align: 'center' as const },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      render: (s: string) => <Tag color={s === 'Active' ? 'green' : 'red'}>{s}</Tag> 
    },
    { 
      title: 'Thao tác', 
      render: () => <Button type="link">Chỉnh sửa</Button> 
    },
  ];

  return (
    <div className="p-6 space-y-4 bg-white m-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Danh mục đơn vị</h2>
        <Button type="primary" icon={<PlusOutlined />} className="bg-indigo-600">Thêm đơn vị</Button>
      </div>

      <Input prefix={<SearchOutlined className="text-gray-400" />} placeholder="Tìm kiếm đơn vị..." className="max-w-md h-10 rounded-lg" />

      <Table dataSource={[
        { key: '1', code: 'DV001', name: 'Phòng Tổ chức Cán bộ', count: 15, status: 'Active' },
        { key: '2', code: 'DV002', name: 'Phòng Đào tạo', count: 10, status: 'Active' },
      ]} columns={columns} />
    </div>
  );
};