import React, { useEffect, useState } from 'react';
import { Table, Tabs, Tag, Progress, Spin } from 'antd';
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
import { getBGHDashboard } from '../../api/dashboard.api';

export const BGHDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [statistics, setStatistics] = useState({
    choDuyet: 0,
    daDuyetHomNay: 0,
    canXemXet: 0,
    tyLeDuyet: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getBGHDashboard();
        setPendingApprovals(res.data.data.pendingApprovals);
        setStatistics(res.data.data.statistics);
      } catch (error) {
        console.error('Lỗi tải dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- COLUMNS ---
  const approvalColumns = [
    { title: 'Mã phương án', dataIndex: 'maPhuongAn', key: 'maPhuongAn', className: 'font-semibold text-slate-800' },
    { title: 'Số tờ trình', dataIndex: 'soToTrinh', key: 'soToTrinh' },
    { title: 'Ngày lập', dataIndex: 'ngayTao', key: 'ngayTao', render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '-' },
    { title: 'Số ứng viên', dataIndex: 'soLuongUngVien', key: 'soLuongUngVien' },
    {
      title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai',
      render: (status: number) => (
        <Tag color="orange" className="rounded-md font-semibold">
          {status === 1 ? 'Chờ duyệt' : 'Đã duyệt'}
        </Tag>
      )
    },
    {
      title: 'Thao tác', key: 'action',
      render: (_: any, record: any) => (
        <button
          onClick={() => window.location.href = `/phuong-an-nhan-su/${record.id}`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors shadow-sm">
          Duyệt ngay
        </button>
      )
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Đang tải dashboard..." />
      </div>
    );
  }

  const tabItems = [
    {
      key: 'approvals',
      label: (
        <span>
          Chờ duyệt
          <Tag color="red" className="ml-2 rounded-full text-[10px] px-1.5">{statistics.choDuyet}</Tag>
        </span>
      ),
      children: (
        <div className="pb-4">
          <Table dataSource={pendingApprovals} columns={approvalColumns} pagination={false} size="middle" rowKey="id" />
        </div>
      ),
    },
    {
      key: 'statistics',
      label: 'Thống kê',
      children: (
        <div className="pb-4">
          <div className="text-center py-8 text-slate-500">Thống kê chi tiết đang được phát triển</div>
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
          { title: 'Chờ duyệt', value: statistics.choDuyet, icon: <ClockCircleOutlined />, color: 'text-amber-500', bg: 'bg-amber-50', valueColor: 'text-amber-500' },
          { title: 'Đã duyệt hôm nay', value: statistics.daDuyetHomNay, icon: <CheckCircleOutlined />, color: 'text-green-600', bg: 'bg-green-50', valueColor: 'text-green-600' },
          { title: 'Cần xem xét', value: statistics.canXemXet, icon: <ExclamationCircleOutlined />, color: 'text-red-600', bg: 'bg-red-50', valueColor: 'text-red-600' },
          { title: 'Tỷ lệ duyệt', value: `${statistics.tyLeDuyet}%`, icon: <BarChartOutlined />, color: 'text-blue-600', bg: 'bg-blue-50', valueColor: 'text-blue-600' },
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
