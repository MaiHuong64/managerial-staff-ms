import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Table, Button, Tag, Spin } from 'antd';
import { TeamOutlined, FileTextOutlined,BarChartOutlined} from '@ant-design/icons';
import { useAuth } from '../../hook/useAuth';
import { getAllPhieuDeXuatNhanSu } from '../../api/phieuDeXuat.api'
import { getPhuongAnList } from '../../api/phuongAnNhanSu.api';
import type { PhieuDeXuatNhanSu } from '../../types/PhieuDeXuatNhanSu';
import type { PhuongAnNhanSu } from '../../types/PhuongAnNhanSu';
import { useNavigate } from 'react-router-dom';
import type { PhieuChuTruong } from '../../types/PhieuChuTruong';
import { getPhieuChuTruongList } from '../../api/phieuChuTruong.api';
import dayjs from 'dayjs';

export const VCQLDashboard: React.FC = () => {
  const { user } = useAuth();
  const [danhSachPDX, setDanhSachPDX] = useState<PhieuDeXuatNhanSu[]>([]);
  const [danhSachPCT, setDanhSachPCT] = useState<PhieuChuTruong[]>([]);
  const [phuongAnNhanSu, setPhuongAnNhanSu] = useState<PhuongAnNhanSu[]>([]);
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [resPDX, resPCT, resPA] = await Promise.all([getAllPhieuDeXuatNhanSu(), getPhieuChuTruongList(), getPhuongAnList()])
        setDanhSachPDX(resPDX.data?.data || []);
        setDanhSachPCT(resPCT.data?.data || []);
        setPhuongAnNhanSu(resPA.data?.data || []);

      } catch (error) {
        console.error(error);
      } finally{
        setLoading(false);
      }
    }
    fetchMasterData();
  }, [])

  const PDXColums = [
    {title: "Mã Phiếu", dataIndex: "maPhieuDeXuat", key: "maPhieuDeXuat"},
    {title: "tieuDe", dataIndex: "tieuDe", key: "tieuDe"},
    {
      title: "Trạng thái", dataIndex: 'trangThai', key: "trangThai",
      render: (status: number) => {
        const config = status === 1 ? {color: 'green', text: 'Đã duyệt'} : status === 2 ? {color: 'red', text: 'Từ chối'} : {color: 'blue', text: 'Chờ duyệt'}
      return <Tag color={config.color} className="rounded-full px-3">{config.text}</Tag>;
      }
      
    }
  ]
  const PCTColumns = [
  { title: "Số tờ trình", dataIndex: 'soToTrinhChuTruong' },
  { title: "Chức danh đề xuất", dataIndex: 'tenChucDanh' },
  { title: "SL", dataIndex: 'soLuongDeXuat' },
  { title: 'Ngày lập', dataIndex: 'ngayLap', render: (date: string) => dayjs(date).format("DD/MM/YYYY") },
  {
    title: 'Trạng thái', 
    dataIndex: 'trangThai', 
    key: 'trangThai',
    render: (status: number) => {
      const config = status === 2 
        ? { color: 'green', text: 'Hoàn thành' } 
        : status === 0 
        ? { color: 'red', text: 'Từ chối' } 
        : { color: 'blue', text: 'Đang thực hiện' };
      return <Tag color={config.color}>{config.text}</Tag>;
    }
  },
];
  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <Spin tip="Đang tải dữ liệu..." size="large" />
    </div>
  );
  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-screen">
      {/* Header & Greeting */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">Dashboard Viên Chức Quản Lý</h1>
          <p className="text-slate-500 mt-1">Hệ thống quản lý nhân sự và quy hoạch đơn vị</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100">
          <span className="text-slate-600">Chào mừng, </span>
          <span className="font-bold text-blue-600">{user?.hoVaTen || 'Trưởng đơn vị'}</span>
        </div>
      </div>
      
      {/* Hàng 2: Thống kê tổng quan */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm rounded-xl border-none hover:shadow-md transition-shadow">
            <Statistic 
              title="Phiếu chủ trương"
              value={PCTColumns.length}
              prefix={<BarChartOutlined className="p-2 bg-blue-50 text-blue-500 rounded-lg mr-2" />} 
              />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm rounded-xl border-none hover:shadow-md transition-shadow">
            <Statistic 
              title="Phiếu đề xuất" 
              value={danhSachPDX.length} 
              prefix={<FileTextOutlined className="p-2 bg-green-50 text-green-500 rounded-lg mr-2" />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm rounded-xl border-none">
            <Statistic 
              title="Phương án nhân sự" 
              value={phuongAnNhanSu.length} 
              prefix={<TeamOutlined className="p-2 bg-purple-50 text-purple-500 rounded-lg mr-2" />} 
            />
          </Card>
        </Col>
      </Row>

      {/* Hàng 3: Bảng quản lý chi tiết */}
      <Row gutter={[16, 16]}>
        {/* Table 1: Danh sách phiếu đề xuất */}
        <Col lg={12} span={24}>
          <Card 
            title={<span className="flex items-center gap-2"><FileTextOutlined /> Phiếu đề xuất gần đây</span>}
            className="shadow-sm rounded-xl border-none h-full"
            extra={<Button type="link" size="small" onClick={()=> navigate('/phieu-de-xuat')}>Tất cả</Button>}
          >
            <Table
              dataSource={danhSachPDX.slice(0, 5)} // Chỉ hiện 5 cái mới nhất
              columns={PDXColums}
              pagination={false}
              rowKey="id"
            />
          </Card>
        </Col>

        <Col lg={12} span={24}>
          <Card 
            title={<span className="flex items-center gap-2"><BarChartOutlined /> Danh sách phiếu chủ trương</span>}
            className="shadow-sm rounded-xl border-none h-full"
            extra={<Button type="primary" size="small"onClick={() => navigate('/phieu-chu-truong')}>Quản lý</Button>}
          >
            <Table
              dataSource={danhSachPCT.slice(0, 5)}
              columns={PCTColumns}
              pagination={false}
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>

      {/* Hàng 4: Hành động nhanh */}
      {/* <Card 
        title={<span className="text-slate-700 font-bold">Hành động quản lý nhanh</span>} 
        className="shadow-sm rounded-xl border-none"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Button type="primary" size="large" block className="h-14 rounded-lg flex items-center justify-center gap-2 shadow-blue-100 shadow-lg">
              <TeamOutlined className="text-lg" /> 
              <span className="font-semibold">Quản lý viên chức</span>
            </Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button size="large" block className="h-14 rounded-lg flex items-center justify-center gap-2 hover:border-blue-400">
              <FileTextOutlined className="text-lg text-blue-500" /> 
              <span className="text-slate-700">Quản lý quy hoạch</span>
            </Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button size="large" block className="h-14 rounded-lg flex items-center justify-center gap-2 hover:border-blue-400">
              <BarChartOutlined className="text-lg text-indigo-500" /> 
              <span className="text-slate-700">Báo cáo thống kê</span>
            </Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button size="large" block className="h-14 rounded-lg flex items-center justify-center gap-2 hover:border-blue-400">
              <CheckCircleOutlined className="text-lg text-green-500" /> 
              <span className="text-slate-700">Phê duyệt hồ sơ</span>
            </Button>
          </Col>
        </Row>
      </Card> */}
    </div>
  );
};