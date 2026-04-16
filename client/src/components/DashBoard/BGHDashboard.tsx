import React from 'react';
import { Table, Tabs, Tag, Progress } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  FileTextOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../hook/useAuth';

// --- DỮ LIỆU MẪU ---
const mockPendingApprovals = [
  { key: '1', loai: 'Quy hoạch', ten: 'Quy hoạch cán bộ Q1/2024', nguoi_tao: 'Trần Thị B', ngay_tao: '15/03/2024', trang_thai: 'Chờ duyệt' },
  { key: '2', loai: 'Bổ nhiệm', ten: 'Bổ nhiệm chuyên viên chính', nguoi_tao: 'Nguyễn Văn A', ngay_tao: '14/03/2024', trang_thai: 'Chờ duyệt' },
  { key: '3', loai: 'Quy hoạch', ten: 'Quy hoạch luân chuyển', nguoi_tao: 'Lê Văn C', ngay_tao: '13/03/2024', trang_thai: 'Chờ duyệt' },
];

const mockStatistics = [
  { key: '1', chi_tieu: 'Tổng quy hoạch', gia_tri: 15, da_duyet: 12, cho_duyet: 3 },
  { key: '2', chi_tieu: 'Tổng bổ nhiệm', gia_tri: 8, da_duyet: 6, cho_duyet: 2 },
  { key: '3', chi_tieu: 'Tổng luân chuyển', gia_tri: 5, da_duyet: 4, cho_duyet: 1 },
];

export const BGHDashboard: React.FC = () => {
  const { user } = useAuth();

  // --- COLUMNS ---
  const approvalColumns = [
    { title: 'Loại', dataIndex: 'loai', key: 'loai', className: 'font-medium text-slate-600' },
    { title: 'Tên', dataIndex: 'ten', key: 'ten', className: 'font-semibold text-slate-800' },
    { title: 'Người tạo', dataIndex: 'nguoi_tao', key: 'nguoi_tao' },
    { title: 'Ngày tạo', dataIndex: 'ngay_tao', key: 'ngay_tao' },
    {
      title: 'Trạng thái', dataIndex: 'trang_thai', key: 'trang_thai',
      render: (status: string) => (
        <Tag color="orange" className="rounded-md font-semibold">{status}</Tag>
      )
    },
    {
      title: 'Thao tác', key: 'action',
      render: () => (
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors shadow-sm">
          Duyệt ngay
        </button>
      )
    },
  ];

  const statisticsColumns = [
    { title: 'Chỉ tiêu', dataIndex: 'chi_tieu', key: 'chi_tieu', className: 'font-semibold text-slate-800' },
    { title: 'Tổng', dataIndex: 'gia_tri', key: 'gia_tri', className: 'font-medium text-slate-600' },
    {
      title: 'Đã duyệt', dataIndex: 'da_duyet', key: 'da_duyet',
      render: (val: number) => <span className="text-green-600 font-bold">{val}</span>
    },
    {
      title: 'Chờ duyệt', dataIndex: 'cho_duyet', key: 'cho_duyet',
      render: (val: number) => <span className="text-amber-600 font-bold">{val}</span>
    },
    {
      title: 'Tiến độ', key: 'tien_do',
      render: (_: unknown, record: { da_duyet: number; gia_tri: number }) => {
        const percent = Math.round((record.da_duyet / record.gia_tri) * 100);
        return (
          <div className="flex items-center gap-3">
            <Progress percent={percent} size="small" className="w-32 m-0" status="active" />
            <span className="text-[13px] font-bold text-slate-600">{percent}%</span>
          </div>
        );
      }
    },
  ];

  const tabItems = [
    {
      key: 'approvals',
      label: (
        <span>
          Chờ duyệt
          <Tag color="red" className="ml-2 rounded-full text-[10px] px-1.5">6</Tag>
        </span>
      ),
      children: (
        <div className="pb-4">
          <Table dataSource={mockPendingApprovals} columns={approvalColumns} pagination={false} size="middle" />
        </div>
      ),
    },
    {
      key: 'statistics',
      label: 'Thống kê',
      children: (
        <div className="pb-4">
          <Table dataSource={mockStatistics} columns={statisticsColumns} pagination={false} size="middle" />
        </div>
      ),
    },
    {
      key: 'schedule',
      label: 'Lịch làm việc',
      children: (
        <div className="space-y-4 p-4">
          <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-100">
            <h4 className="font-bold text-blue-800 mb-4 flex items-center text-[15px]">
              <div className="w-2 h-2 rounded-full bg-blue-600 mr-2" />
              Hôm nay - 20/03/2024
            </h4>
            <div className="space-y-3">
              <div className="flex items-center text-sm bg-white p-3.5 rounded-lg border border-blue-100 shadow-sm">
                <CalendarOutlined className="mr-3 text-blue-500 text-base" />
                <span className="text-slate-800 font-medium">09:00 - Họp UBND tỉnh</span>
              </div>
              <div className="flex items-center text-sm bg-white p-3.5 rounded-lg border border-blue-100 shadow-sm">
                <FileTextOutlined className="mr-3 text-blue-500 text-base" />
                <span className="text-slate-800 font-medium">14:00 - Xét duyệt quy hoạch Q1/2024</span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-700 mb-4 flex items-center text-[15px]">
              <div className="w-2 h-2 rounded-full bg-slate-400 mr-2" />
              Ngày mai - 21/03/2024
            </h4>
            <div className="space-y-3">
              <div className="flex items-center text-sm bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
                <CalendarOutlined className="mr-3 text-slate-400 text-base" />
                <span className="text-slate-700 font-medium">10:00 - Họp Ban Giám đốc</span>
              </div>
              <div className="flex items-center text-sm bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
                <TeamOutlined className="mr-3 text-slate-400 text-base" />
                <span className="text-slate-700 font-medium">15:00 - Gặp gỡ cán bộ mới</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">Dashboard Ban Giám Hiệu</h1>
          <p className="text-slate-500 mt-1 text-sm">Phê duyệt và giám sát quy hoạch, bổ nhiệm</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100">
          <span className="text-slate-600">Chào mừng, </span>
          <span className="font-bold text-blue-600">{user?.hoVaTen || 'Ban Giám Hiệu'}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
        {[
          { title: 'Chờ duyệt', value: 6, icon: <ClockCircleOutlined />, color: 'text-amber-500', bg: 'bg-amber-50', valueColor: 'text-amber-500' },
          { title: 'Đã duyệt hôm nay', value: 8, icon: <CheckCircleOutlined />, color: 'text-green-600', bg: 'bg-green-50', valueColor: 'text-green-600' },
          { title: 'Cần xem xét', value: 3, icon: <ExclamationCircleOutlined />, color: 'text-red-600', bg: 'bg-red-50', valueColor: 'text-red-600' },
          { title: 'Tỷ lệ duyệt', value: '85%', icon: <BarChartOutlined />, color: 'text-blue-600', bg: 'bg-blue-50', valueColor: 'text-blue-600' },
        ].map((item, index) => (
          <div key={index} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-2 ${item.bg} rounded-lg ${item.color}`}>{item.icon}</div>
              <span className="text-slate-500 font-semibold text-sm">{item.title}</span>
            </div>
            <div className={`text-3xl font-bold ${item.valueColor}`}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm rounded-xl border border-slate-100 overflow-hidden">
        <Tabs defaultActiveKey="approvals" className="px-5 pt-3" tabBarGutter={32} items={tabItems} />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h3 className="font-bold text-slate-800 text-base mb-4">Lối tắt nghiệp vụ</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <FileTextOutlined className="text-2xl text-blue-500" />, label: 'Duyệt quy hoạch' },
            { icon: <CheckSquareOutlined className="text-2xl text-green-500" />, label: 'Duyệt bổ nhiệm' },
            { icon: <TeamOutlined className="text-2xl text-indigo-500" />, label: 'Quản lý người dùng' },
            { icon: <BarChartOutlined className="text-2xl text-orange-500" />, label: 'Báo cáo tổng hợp' },
          ].map((item, index) => (
            <button key={index} className="flex flex-col items-center justify-center py-6 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group">
              <span className="mb-3 group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="font-semibold text-slate-700 text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
