import { Button, Descriptions, message, Modal, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { useAuth } from "../../hook/useAuth";
import { getPhieuDeXuatNhanSuById, guiPhieuDeXuatNhanSu } from "../../api/phieuDeXuat.api";
import { DU_DIEU_KIEN, TRANG_THAI_PHIEU_DE_XUAT, type ChiTietPhieuDeXuat, type PhieuDeXuatDetail } from "../../types/PhieuDeXuatNhanSu";
import dayjs from "dayjs";

interface Props {
    id: number | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const DetailPhieuDeXuatModal: React.FC<Props> = ({ id, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [data, setData] = useState<PhieuDeXuatDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        getPhieuDeXuatNhanSuById(id)
            .then(res => setData(res.data.data))
            .catch(() => message.error("Không thể tải chi tiết phiếu"))
            .finally(() => setLoading(false));
    }, [id]);

    const handleGui = async () => {
        if (!id) return;
        try {
            setSubmitting(true);
            await guiPhieuDeXuatNhanSu(id);
            message.success("Đã gửi phiếu cho PTCCT!");
            onSuccess();
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Gửi phiếu thất bại");
        } finally {
            setSubmitting(false);
        }
    };

    const trangThai = data ? TRANG_THAI_PHIEU_DE_XUAT[data.trang_thai] : null;
    const canGui = data?.trang_thai === -1 && user?.vai_tro === 'VCQL';

    const nhanSuColumns = [
        { title: "Họ và tên", dataIndex: "ho_va_ten" },
        {
            title: "Điều kiện",
            dataIndex: "du_dieu_kien",
            render: (val: number) => {
                const dk = DU_DIEU_KIEN[val];
                return <Tag color={dk?.color}>{dk?.label}</Tag>;
            }
        },
        { title: "Ghi chú", dataIndex: "ghi_chu", render: (val: string) => val || "—" },
    ];

    return (
        <Modal
            title="Chi tiết phiếu đề xuất nhân sự"
            open={!!id}
            onCancel={onClose}
            width={800}
            style={{ top: 20 }}
            loading={loading}
            footer={[
                <Button key="close" onClick={onClose}>Đóng</Button>,
                canGui && (
                    <Button key="gui" type="primary" loading={submitting} onClick={handleGui}>
                        Gửi cho PTCCT
                    </Button>
                ),
            ]}
        >
            {data && (
                <>
                    <Descriptions bordered size="small" column={2} className="mb-4">
                        <Descriptions.Item label="Mã phiếu">{data.ma_phieu_de_xuat}</Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={trangThai?.color}>{trangThai?.label}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tiêu đề" span={2}>{data.tieu_de}</Descriptions.Item>
                        <Descriptions.Item label="Chức danh">{data.ten_chuc_danh}</Descriptions.Item>
                        <Descriptions.Item label="Số lượng đề xuất">{data.so_luong_de_xuat}</Descriptions.Item>
                        <Descriptions.Item label="Đơn vị">{data.ten_don_vi}</Descriptions.Item>
                        <Descriptions.Item label="Người lập">{data.nguoi_lap}</Descriptions.Item>
                        <Descriptions.Item label="Ngày lập">
                            {dayjs(data.ngay_lap).format("DD/MM/YYYY")}
                        </Descriptions.Item>
                        {data.ngay_phe_duyet && (
                            <Descriptions.Item label="Ngày phê duyệt">
                                {dayjs(data.ngay_phe_duyet).format("DD/MM/YYYY")}
                            </Descriptions.Item>
                        )}
                        {data.noi_dung && (
                            <Descriptions.Item label="Nội dung" span={2}>{data.noi_dung}</Descriptions.Item>
                        )}
                        {data.ghi_chu && (
                            <Descriptions.Item label="Ghi chú PTCCT" span={2}>{data.ghi_chu}</Descriptions.Item>
                        )}
                    </Descriptions>

                    <div className="font-medium mb-2">
                        Danh sách viên chức đề xuất
                        <span className="ml-2 text-gray-400 font-normal">({data.nhanSu.length} người)</span>
                    </div>
                    <Table
                        dataSource={data.nhanSu}
                        columns={nhanSuColumns}
                        rowKey="id"
                        size="small"
                        pagination={false}
                    />
                </>
            )}
        </Modal>
    );
};

export default DetailPhieuDeXuatModal;
