import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hook/useAuth"
import { Button, Card, Col, message, Popconfirm, Row, Statistic, Table, Tag } from "antd";
import dayjs from "dayjs";
import Search from "antd/es/transfer/search";
import { PlusOutlined } from "@ant-design/icons";
import { TRANG_THAI_PHIEU_DE_XUAT, type PhieuDeXuat } from "../../types/PhieuDeXuatNhanSu";
import { approvePhieuDeXuatNhanSu, getAllPhieuDeXuatNhanSu } from "../../api/phieuDeXuat.api";
import { CreatePhieuChuTruongModal } from "../PhieuChuTruong/CreatePhieuChuTruongModal";

export const PhieuDeXuatNhanSuPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [phieuDeXuatNhanSu, setphieuDeXuatNhanSu] = useState<PhieuDeXuat[]>([]);
    const [searchText, setSearchText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getAllPhieuDeXuatNhanSu();
            setphieuDeXuatNhanSu(response.data.data);
            console.log(response.data);
        } catch {
            message.error("Không thể tải dữ liệu phiếu chủ trương");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleApprove = async (id: number, trang_thai: number) => {
        try {
            await approvePhieuDeXuatNhanSu(id);
            message.success(trang_thai === 1 ? "Đã phê duyệt!" : "Đã từ chối!");
            fetchData();
        } catch {
            message.error("Thao tác thất bại");
        }
    };

    const status = useMemo(() => ({
        choDuyet: phieuDeXuatNhanSu.filter(item => item.trang_thai === 0).length,
        daDuyet: phieuDeXuatNhanSu.filter(item => item.trang_thai === 1).length,
        tuChoi: phieuDeXuatNhanSu.filter(item => item.trang_thai === 2).length,
    }), [phieuDeXuatNhanSu]);

    const filteredData = useMemo(() => {
        if (!searchText) return phieuDeXuatNhanSu;
        const lower = searchText.toLowerCase();
        return phieuDeXuatNhanSu.filter(item =>
            item.ten_chuc_danh?.toLowerCase().includes(lower)
        );
    }, [phieuDeXuatNhanSu, searchText]);

    const columns = [
        { title: "Số tờ trình", dataIndex: 'so_to_trinh_chu_truong' },
        { title: "Chức danh đề xuất", dataIndex: 'ten_chuc_danh' },
        { title: "SL", dataIndex: 'so_luong_de_xuat' },
        {
            title: 'Ngày lập', dataIndex: 'ngay_lap',
            render: (date: string) => dayjs(date).format("DD/MM/YYYY")
        },
        {
            title: 'Trạng thái', dataIndex: 'trang_thai',
             render: (trangThai: number) => {
                const status = TRANG_THAI_PHIEU_DE_XUAT[trangThai] ?? {label: '?', color: 'default'}
                return <Tag color={status.color}>{status.label}</Tag>;
            }
            
        },
        ...(user?.vai_tro === 'PTCCT' ? [{
            title: 'Thao tác',
            render: (_: unknown, record: PhieuDeXuat) => record.trang_thai === 0 ? (
                <div className="flex gap-2">
                    <Popconfirm title="Phê duyệt phiếu này?" onConfirm={() => handleApprove(record.id, 1)} okText="Duyệt" cancelText="Hủy">
                        <Button type="primary" size="small">Duyệt</Button>
                    </Popconfirm>
                    <Popconfirm title="Từ chối phiếu này?" onConfirm={() => handleApprove(record.id, 2)} okText="Từ chối" cancelText="Hủy" okButtonProps={{ danger: true }}>
                        <Button danger size="small">Từ chối</Button>
                    </Popconfirm>
                </div>
            ) : null
        }] : []),
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold m-0">Quản lý đề xuất nhân sự quy hoạch</h1>
                    <p className="text-gray-500 mt-1">
                        Đơn vị: <span className="font-semibold text-gray-700">{user?.vai_tro || "Đang tải..."}</span>
                    </p>
                </div>
            </div>

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
                        <Statistic title="Bị từ chối" value={status.tuChoi} valueStyle={{ color: '#ff4d4f', fontWeight: 'bold' }} />
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-sm">
                <div className="flex justify-between mb-4">
                    <Search
                        placeholder="🔍 Tìm theo số tờ trình, chức danh..."
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    {user?.vai_tro === 'VCQL' && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                            Lập phiếu đề xuất
                        </Button>
                    )}
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10, showTotal: (total) => `Tổng số ${total} tờ trình` }}
                />
            </Card>

            <CreatePhieuChuTruongModal
                isVisible={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSuccess={() => { setIsModalOpen(false); fetchData(); }}
            />
        </div>
    );
}
export default PhieuDeXuatNhanSuPage;
