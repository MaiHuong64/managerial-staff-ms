import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hook/useAuth"
import type { PhieuChuTruong } from "../../types/PhieuChuTruong";
import { Button, Card, Col, Input, message, Modal, Popconfirm, Row, Statistic, Table, Tag } from "antd";
import dayjs from "dayjs";
import Search from "antd/es/transfer/search";
import { PlusOutlined } from "@ant-design/icons";
import { CreatePhieuChuTruongModal } from "./Modals/CreatePhieuChuTruongModal";
import { approvePhieuChuTruong, getPhieuChuTruongList, rejectPhieuChuTruong } from "../../api/phieuChuTruong.api";

export const PhieuChuTruongPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [phieuChuTruong, setPhieuChuTruong] = useState<PhieuChuTruong[]>([]);
    const [searchText, setSearchText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lyDoTuChoi, setLyDoTuChoi] = useState("");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getPhieuChuTruongList();
            setPhieuChuTruong(response.data.data);
        } catch {
            message.error("Không thể tải dữ liệu phiếu chủ trương");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleApprove = async (id: number) => {
        try {
            await approvePhieuChuTruong(id);
            message.success("Duyệt phiếu thành công");
            fetchData();
        } catch {
            message.error("Thao tác thất bại");
        }
    };
    const handleReject = async (id: number, lyDoTuChoi: string) => {
        try {
            await rejectPhieuChuTruong(id, lyDoTuChoi);
            message.success("Đã từ chối!");
            fetchData();
        } catch {
            message.error("Thao tác thất bại");
        }
    };

    const status = useMemo(() => ({
        choDuyet: phieuChuTruong.filter(item => item.trang_thai === 1).length,
        daDuyet: phieuChuTruong.filter(item => item.trang_thai === 2).length,
        tuChoi: phieuChuTruong.filter(item => item.trang_thai === 0).length,
    }), [phieuChuTruong]);

    const filteredData = useMemo(() => {
        if (!searchText) return phieuChuTruong;
        const lower = searchText.toLowerCase();
        return phieuChuTruong.filter(item =>
            item.so_to_trinh_chu_truong?.toLowerCase().includes(lower) ||
            item.ten_chuc_danh?.toLowerCase().includes(lower)
        );
    }, [phieuChuTruong, searchText]);

    const trangThaiTag = (trangThai: number) => {
        if (trangThai === 1) return <Tag color="gold">Chờ duyệt</Tag>;
        if (trangThai === 2) return <Tag color="green">Đã duyệt</Tag>;
        if (trangThai === 0) return <Tag color="red">Từ chối</Tag>;
    };

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
            render: (tt: number) => trangThaiTag(tt)
        },
        {
                   title: 'Thao tác', width: 200,
                   render: (_: unknown, record: PhieuChuTruong) => (
                       <div className="flex gap-2">
                           {/* <Button size="small" onClick={() => setSelectedId(record.id)}>Xem</Button> */}
                           {user?.vai_tro === 'BGH' && record.trang_thai === 1 && (
                               <>
                                    <Popconfirm title="Phê duyệt phiếu này?" onConfirm={() => handleApprove(record.id)} okText="Duyệt" cancelText="Hủy">
                                       <Button type="primary" size="small">Duyệt</Button>
                                    </Popconfirm>
                                    <Button danger size="small" onClick={() => {setSelectedId(record.id); setRejectModalOpen(true)}}>Từ chối</Button>
                               </>
                           )}
                       </div>
                   )
               },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold m-0">Quản lý Đề xuất Bổ nhiệm</h1>
                    {/* <p className="text-gray-500 mt-1">
                        Đơn vị: <span className="font-semibold text-gray-700">{ || "Đang tải..."}</span>
                    </p> */}
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
                            Lập Tờ trình đề xuất
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
            <Modal
                title="Nhập lý do từ chối"
                open={rejectModalOpen}
                onOk={async () => {
                    if (!selectedId || !lyDoTuChoi.trim()) {
                    message.warning("Vui lòng nhập lý do");
                    return;
                    }
                    await handleReject(selectedId, lyDoTuChoi);
                    setRejectModalOpen(false);
                    setLyDoTuChoi("");
                    setSelectedId(null);
                }}
                onCancel={() => setRejectModalOpen(false)}
                >
                <Input.TextArea
                    rows={4}
                    placeholder="Nhập lý do từ chối..."
                    value={lyDoTuChoi}
                    onChange={(e) => setLyDoTuChoi(e.target.value)}
                />
                </Modal>
        </div>
    );
}
export default PhieuChuTruongPage;
