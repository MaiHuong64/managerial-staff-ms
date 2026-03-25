import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hook/useAuth"
import type{ PhieuChuTruong } from "../../types/PhieuChuTruong";
import axiosClient from "../../utils/AxiosClient";
import { Button, Card, Col, message, Row, Statistic, Table } from "antd";
import dayjs from "dayjs";
import Search from "antd/es/transfer/search";
import { PlusOutlined } from "@ant-design/icons";

export const PhieuChuTruongPage: React.FC = () => {
    const {user} = useAuth();
    const [loading, setLoading] = useState(true);
    const[phieuChuTruong, setPhieuChuTruong] = useState<PhieuChuTruong[]>([]);

    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get('/pct');
                
                setPhieuChuTruong(response.data.data); 
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
                message.error("Không thể tải dữ liệu phiếu chủ trương");
            } finally {
                setLoading(false);
            }
        }
        fetchData();     
    },[]);
    
   const status = useMemo(() => {
        return {
            choDuyet: phieuChuTruong.filter(item => item.trang_thai === 0).length,
            daDuyet: phieuChuTruong.filter(item => item.trang_thai === 1).length,
            tuChoi: phieuChuTruong.filter(item => item.trang_thai === 2).length,
        };
    }, [phieuChuTruong]);
    const filteredData = useMemo(() => {
        if (!searchText) return phieuChuTruong; // Nếu không gõ gì thì hiện tất cả
        
        const lowercasedFilter = searchText.toLowerCase();
        return phieuChuTruong.filter(item => 
            (item.so_to_trinh_chu_truong && item.so_to_trinh_chu_truong.toLowerCase().includes(lowercasedFilter)) ||
            (item.ten_chuc_danh && item.ten_chuc_danh.toLowerCase().includes(lowercasedFilter))
        );
    }, [phieuChuTruong, searchText]);

    const columns = [
        {
            title: "Số tờ trình",
            dataIndex: 'so_to_trinh_chu_truong',

        },
        {
            title: "Chức danh đề xuất",
            dataIndex: 'ten_chuc_danh'
        },
        {
            title: "SL",
            dataIndex: 'so_luong_de_xuat'
        },
        {
            title: 'Ngay lap',
            dataIndex: 'ngay_lap',
            render: (date: string) => dayjs(date).format("DD/MM/YYYY")
        }
    ]
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header hiển thị thông tin Khoa */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold m-0">Quản lý Đề xuất Bổ nhiệm</h1>
                    <p className="text-gray-500 mt-1">
                        Đơn vị: <span className="font-semibold text-gray-700">{user?.vai_tro || "Đang tải..."}</span>
                    </p>
                </div>
            </div>

            {/* Thống kê */}
            <Row gutter={16} className="mb-6">
                <Col span={8}>
                    <Card size="small" className="border-l-4 border-l-blue-500 shadow-sm">
                        <Statistic title="Đang chờ duyệt" value={status.choDuyet} valueStyle={{ color: '#1890ff', fontWeight: 'bold' }} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card size="small" className="border-l-4 border-l-green-500 shadow-sm">
                        <Statistic title="Đã được phê duyệt" value={status.daDuyet} valueStyle={{ color: '#52c41a', fontWeight: 'bold' }} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card size="small" className="border-l-4 border-l-red-500 shadow-sm">
                        <Statistic title="Bị trả về / Hủy" value={status.tuChoi} valueStyle={{ color: '#ff4d4f', fontWeight: 'bold' }} />
                    </Card>
                </Col>
            </Row>

            {/* Bảng dữ liệu */}
            <Card className="shadow-sm">
                <div className="flex justify-between mb-4">
                    <Search 
                        placeholder="🔍 Tìm theo số tờ trình, chức danh..." onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Button type="primary" icon={<PlusOutlined />}>
                        Lập Tờ trình đề xuất
                    </Button>
                </div>

                <Table 
                    columns={columns} 
                    dataSource={filteredData} 
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10, showTotal: (total) => `Tổng số ${total} tờ trình` }}
                />
            </Card>
        </div>
    );
}
export default PhieuChuTruongPage;