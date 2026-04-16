import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hook/useAuth"
import { Button, Card, Col, message, Row, Statistic, Table, Tag } from "antd";
import dayjs from "dayjs";
import Search from "antd/es/transfer/search";
import { PlusOutlined } from "@ant-design/icons";
import { TRANG_THAI_PHIEU_DE_XUAT, type PhieuDeXuatNhanSu } from "../../types/PhieuDeXuatNhanSu";
import CreateDeXuatNhanSuModal from "./CreateDeXuatNhanSuModal";
import DetailPhieuDeXuatModal from "./DetailPhieuDeXuatModal";
import { getAllPhieuDeXuatNhanSu } from "../../api/phieuDeXuat.api";

export const PhieuDeXuatNhanSuPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [phieuDeXuatNhanSu, setphieuDeXuatNhanSu] = useState<PhieuDeXuatNhanSu[]>([]);
    const [searchText, setSearchText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getAllPhieuDeXuatNhanSu();
            setphieuDeXuatNhanSu(response.data.data);
        } catch {
            message.error("Không thể tải dữ liệu phiếu đề xuất");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const status = useMemo(() => ({
        nhap: phieuDeXuatNhanSu.filter(item => item.trangThai === -1).length,
        choDuyet: phieuDeXuatNhanSu.filter(item => item.trangThai === 0).length,
        daDuyet: phieuDeXuatNhanSu.filter(item => item.trangThai === 1).length,
    }), [phieuDeXuatNhanSu]);

    const filteredData = useMemo(() => {
        if (!searchText) return phieuDeXuatNhanSu;
        const lower = searchText.toLowerCase();
        return phieuDeXuatNhanSu.filter(item =>
            item.tenChucDanh?.toLowerCase().includes(lower) ||
            item.tieuDe?.toLowerCase().includes(lower)
        );
    }, [phieuDeXuatNhanSu, searchText]);

    const columns = [
        { title: "Mã phiếu", dataIndex: 'maPhieuDeXuat', width: 110 },
        { title: "Tiêu đề", dataIndex: 'tieuDe' },
        { title: "Chức danh", dataIndex: 'tenChucDanh' },
        {
            title: 'Ngày lập', dataIndex: 'ngayLap', width: 110,
            render: (date: string) => dayjs(date).format("DD/MM/YYYY")
        },
        {
            title: 'Trạng thái', dataIndex: 'trangThai', width: 120,
            render: (trangThai: number) => {
                const s = TRANG_THAI_PHIEU_DE_XUAT[trangThai] ?? { label: '?', color: 'default' }
                return <Tag color={s.color}>{s.label}</Tag>;
            }
        },
        {
            title: 'Thao tác', width: 200,
            render: (_: unknown, record: PhieuDeXuatNhanSu) => (
                <div className="flex gap-2">
                    <Button size="small" onClick={() => setSelectedId(record.id)}>Xem</Button>
                </div>
            )
        },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold m-0">Quản lý đề xuất nhân sự quy hoạch</h1>
                    <p className="text-gray-500 mt-1">
                        Đơn vị: <span className="font-semibold text-gray-700">{user?.hoVaTen || "Đang tải..."}</span>
                    </p>
                </div>
            </div>

            <Row gutter={16} className="mb-6">
                <Col span={8}>
                    <Card size="small" className="border-l-4 border-l-gray-400 shadow-sm">
                        <Statistic title="Nháp" value={status.nhap} valueStyle={{ color: '#8c8c8c', fontWeight: 'bold' }} />
                    </Card>
                </Col>
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
            </Row>

            <Card className="shadow-sm">
                <div className="flex justify-between mb-4">
                    <Search
                        placeholder="🔍 Tìm theo tiêu đề, chức danh..."
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    {user?.vaiTro === 'VCQL' && (
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
                    pagination={{ pageSize: 10, showTotal: (total) => `Tổng số ${total} phiếu` }}
                />
            </Card>

            <CreateDeXuatNhanSuModal
                isVisible={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSuccess={() => { setIsModalOpen(false); fetchData(); }}
            />

            <DetailPhieuDeXuatModal
                id={selectedId}
                onClose={() => setSelectedId(null)}
                onSuccess={() => { setSelectedId(null); fetchData(); }}
            />
        </div>
    );
}
export default PhieuDeXuatNhanSuPage;
