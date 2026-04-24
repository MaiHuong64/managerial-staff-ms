import React, { useEffect, useState } from 'react';
import { Table, Tabs, Tag, Progress, Spin } from 'antd';
import {
  TeamOutlined, FileTextOutlined,
  TagsOutlined, BuildOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../hook/useAuth';
import { getPTCCTDashboard } from '../../api/dashboard.api';

export const PTCCTDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState({
    tongVienChuc: 0,
    tongDonVi: 0,
    tongChucDanh: 0,
    dotQuyHoachDangHoatDong: 0,
    dotBoNhiemDangHoatDong: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPTCCTDashboard();
        setSystemStats(res.data.data.systemStats);
        setRecentActivities(res.data.data.recentActivities);
      } catch (error) {
        console.error('Lỗi tải dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Đang tải dashboard..." />
      </div>
    );
  }

  const activityColumns = [
    { title: 'Thời gian', dataIndex: 'thoi_gian', key: 'thoi_gian', className: 'text-slate-500' },
    {
      title: 'Loại', dataIndex: 'loai', key: 'loai',
      render: (type: string) => {
        const config: Record<string, { color: string; text: string; bg: string }> = {
          create: { color: '#0ea5e9', text: 'Tạo mới', bg: '#e0f2fe' },
          approve: { color: '#16a34a', text: 'Phê duyệt', bg: '#dcfce7' },
          update: { color: '#f59e0b', text: 'Cập nhật', bg: '#fef3c7' },
        };
        const current = config[type] || config.update;
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-medium border"
            style={{ color: current.color, backgroundColor: current.bg, borderColor: current.color + '40' }}>
            {current.text}
          </span>
        );
      }
    }
  ];

  const pendingTasksColumns = [
    { title: 'Số lượng', dataIndex: 'so_luong', key: 'so_luong' },
    {
      title: 'Trạng thái', dataIndex: 'trang_thai', key: 'trang_thai',
      render: (status: string) => {
        const colorMap: Record<string, string> = { 'Chờ xử lý': '#f59e0b', 'Đang xử lý': '#2563eb', 'Chờ duyệt': '#0ea5e9' };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      }
    },
    {
      title: 'Độ ưu tiên', dataIndex: 'do_uu_tien', key: 'do_uu_tien',
      render: (priority: string) => {
        const colorMap: Record<string, string> = { 'Cao': '#dc2626', 'Trung bình': '#f59e0b', 'Thấp': '#16a34a' };
        return <Tag color={colorMap[priority] || 'default'}>{priority}</Tag>;
      }
    },
  ];

  const tabItems = [
    {
      key: 'overview',
      label: 'Tổng quan hệ thống',
      children: (
        <div className="pb-4">
          <div className="text-center py-8 text-slate-500">Thống kê chi tiết đang được phát triển</div>
        </div>
      ),
    },
    {
      key: 'activities',
      label: 'Hoạt động gần đây',
      children: (
        <div className="pb-4">
          <Table dataSource={recentActivities} columns={activityColumns} pagination={false} size="middle" rowKey={(record, index) => `${record.loai}-${index}`} />
        </div>
      ),
    },
    {
      key: 'pending',
      label: 'Công việc chờ xử lý',
      children: (
        <div className="pb-4">
          <Table dataSource={[]} columns={pendingTasksColumns} pagination={false} size="middle" />
        </div>
      ),
    },
    {
      key: 'reports',
      label: 'Báo cáo thống kê',
      children: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6 pt-2">
          <div className="border border-slate-200 rounded-lg p-5">
            <h4 className="text-sm font-bold text-slate-800 mb-6">Biểu đồ bổ nhiệm 12 tháng qua</h4>
            <div className="flex items-end gap-2 h-48 w-full">
              {[40, 70, 45, 90, 65, 85, 120, 95, 110, 80, 60, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-blue-100 hover:bg-blue-600 rounded-t-sm transition-colors relative group cursor-pointer"
                  style={{ height: `${(h / 120) * 100}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity">
                    {h}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 text-xs text-slate-500 font-medium">
              <span>T1</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>T8</span><span>T9</span><span>T10</span><span>T11</span><span>T12</span>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-5">
            <h4 className="text-sm font-bold text-slate-800 mb-6">Chỉ số hiệu suất xử lý</h4>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-600 font-medium">Tỷ lệ duyệt quy hoạch</span>
                  <span className="text-sm font-bold text-slate-800">87%</span>
                </div>
                <Progress percent={87} strokeColor="#2563eb" trailColor="#f1f5f9" showInfo={false} size="small" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-600 font-medium">Tỷ lệ duyệt bổ nhiệm</span>
                  <span className="text-sm font-bold text-slate-800">92%</span>
                </div>
                <Progress percent={92} strokeColor="#16a34a" trailColor="#f1f5f9" showInfo={false} size="small" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-600 font-medium">Hoàn thành đúng hạn (SLA)</span>
                  <span className="text-sm font-bold text-slate-800">75%</span>
                </div>
                <Progress percent={75} strokeColor="#f59e0b" trailColor="#f1f5f9" showInfo={false} size="small" status="active" />
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-[#f8fafc] min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight m-0">Dashboard P.TC-CT</h1>
          <p className="text-sm text-slate-500 mt-1">Tổng quan tình hình nhân sự và quy hoạch ĐHAG</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100">
          <span className="text-slate-600">Chào mừng, </span>
          <span className="font-bold text-blue-600">{user?.hoVaTen || 'P.TC-CT'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {[
          { title: 'Tổng viên chức', value: systemStats.tongVienChuc.toLocaleString(), icon: <TeamOutlined />, color: 'text-blue-600', bg: 'bg-blue-50', change: '', changeLabel: 'Viên chức quản lý' },
          { title: 'Tổng đơn vị', value: systemStats.tongDonVi.toString(), icon: <BuildOutlined />, color: 'text-indigo-600', bg: 'bg-indigo-50', change: '', changeLabel: 'Phòng ban & Khoa' },
          { title: 'Tổng chức danh', value: systemStats.tongChucDanh.toString(), icon: <TagsOutlined />, color: 'text-amber-600', bg: 'bg-amber-50', change: '', changeLabel: 'Đang áp dụng' },
          { title: 'Đợt đang hoạt động', value: (systemStats.dotQuyHoachDangHoatDong + systemStats.dotBoNhiemDangHoatDong).toString(), icon: <BarChartOutlined />, color: 'text-emerald-600', bg: 'bg-emerald-50', change: null, changeLabel: `${systemStats.dotQuyHoachDangHoatDong} quy hoạch • ${systemStats.dotBoNhiemDangHoatDong} bổ nhiệm` },
        ].map((item, index) => (
          <div key={index} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">{item.title}</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-2">{item.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center ${item.color} text-xl`}>
                {item.icon}
              </div>
            </div>
            <div className="mt-4 flex items-center text-[13px]">
              {item.change ? (
                <span className="text-green-600 font-semibold bg-green-50 border border-green-100 px-1.5 py-0.5 rounded">
                  {item.change}
                </span>
              ) : null}
              <span className="text-slate-400 ml-2">{item.changeLabel}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Tabs defaultActiveKey="overview" className="px-5 pt-3" tabBarGutter={24} items={tabItems} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-base font-bold text-slate-800 mb-4">Lối tắt nghiệp vụ</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <TeamOutlined className="text-2xl text-blue-500" />, label: 'Quản lý viên chức', hoverBorder: 'hover:border-blue-500', hoverBg: 'hover:bg-blue-50' },
            { icon: <BuildOutlined className="text-2xl text-indigo-500" />, label: 'Quản lý đơn vị', hoverBorder: 'hover:border-indigo-500', hoverBg: 'hover:bg-indigo-50' },
            { icon: <TagsOutlined className="text-2xl text-amber-500" />, label: 'Quản lý chức danh', hoverBorder: 'hover:border-amber-500', hoverBg: 'hover:bg-amber-50' },
            { icon: <FileTextOutlined className="text-2xl text-emerald-500" />, label: 'Báo cáo tổng hợp', hoverBorder: 'hover:border-emerald-500', hoverBg: 'hover:bg-emerald-50' },
          ].map((item, index) => (
            <button key={index} className={`flex flex-col items-center justify-center gap-3 bg-[#f8fafc] border border-slate-200 ${item.hoverBorder} ${item.hoverBg} text-slate-700 p-4 rounded-xl transition-all font-medium group`}>
              <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};