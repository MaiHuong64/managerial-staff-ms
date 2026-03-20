// pages/PhieuChuTruongListView.tsx
import { Button, Table, Tag, Card, message } from "antd";
import { useEffect, useState } from "react";
import axiosClient from "../../utils/AxiosClient";
import { CreatePhieuChuTruongModal } from "./CreatePhieuChuTruongModal";
import type { PhieuChuTruong } from "../../types/PhieuChuTruong";

const TRANG_THAI: Record<number, { label: string; color: string }> = {
    1: { label: "Chờ duyệt",  color: "warning"    },
    2: { label: "Đã duyệt",   color: "success"    },
    3: { label: "Từ chối",    color: "error"      },
};

export const PhieuChuTruongListView: React.FC = () => {
    const [data, setData]       = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get("/phieu-chu-truong");
            setData(res.data.data);
        } catch {
            message.error("Lỗi khi tải danh sách");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const cols = [
        { title: "Số văn bản",   dataIndex: "so_van_ban"    },
        { title: "Ngày lập",     dataIndex: "ngay_lap",
          render: (d: string) => new Date(d).toLocaleDateString("vi-VN") },
        { title: "Chức danh",    dataIndex: "ten_chuc_danh" },
        { title: "Đơn vị",       dataIndex: "ten_don_vi"    },
        { title: "Số lượng",     dataIndex: "so_luong_de_xuat", align: "center" as const },
        {
            title: "Trạng thái", dataIndex: "trang_thai",
            render: (s: number) => {
                const t = TRANG_THAI[s];
                return t ? <Tag color={t.color}>{t.label}</Tag> : <Tag>Không xác định</Tag>;
            }
        },
        {
            title: "Thao tác", key: "action",
            render: (_: PhieuChuTruong, record: PhieuChuTruong) => (
                // Chỉ tạo đợt bổ nhiệm từ phiếu đã được duyệt
                <Button type="link" size="small"
                    disabled={record.trang_thai !== 2}
                    onClick={() => {/* navigate tới tạo đợt bổ nhiệm với phiếu này */}}>
                    Tạo đợt bổ nhiệm
                </Button>
            )
        }
    ];

    return (
        <div className="p-6">
            <Card title="Danh sách phiếu xin chủ trương"
                extra={<Button type="primary" onClick={() => setModalVisible(true)}>
                    + Lập phiếu mới
                </Button>}>
                <Table rowKey="id" columns={cols} dataSource={data}
                    loading={loading} pagination={{ pageSize: 10 }} />
            </Card>

            <CreatePhieuChuTruongModal
                isVisible={modalVisible}
                onCancel={() => setModalVisible(false)}
                onSuccess={() => { setModalVisible(false); fetchData(); }}
            />
        </div>
    );
};