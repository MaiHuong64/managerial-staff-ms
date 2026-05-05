import { Button, Descriptions, Modal, Tag, Spin, message, Form, Input } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { approvePhieuChuTruong,  getPhieuChuTruongById, rejectPhieuChuTruong,} from "../../api/phieuChuTruong.api";
import { getHoSoByPhieuChuTruong, createHoSo } from "../../api/hoSoBoNhiem.api";
import type { PhieuChuTruong } from "../../types/PhieuChuTruong";

interface Props {
    id: number | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const DetailPhieuChuTruongModal: React.FC<Props> = ({ id, onClose, onSuccess }) => {
    const navigate = useNavigate();
    const [data, setData] = useState<PhieuChuTruong | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectForm] = Form.useForm();
    const [hasHoSo, setHasHoSo] = useState(false);
    const [checkingHoSo, setCheckingHoSo] = useState(false);
    const [hoSoId, setHoSoId] = useState<number | null>(null);

    const fetchData = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const response = await getPhieuChuTruongById(id);
            setData(response.data.data);

            // Check xem đã có hồ sơ bổ nhiệm chưa
            if (response.data.data.trangThai === 2 && response.data.data.nguonNhanSu === 2) {
                checkHoSoExists(id);
            }
        } catch {
            message.error("Không thể tải dữ liệu phiếu chủ trương");
        } finally {
            setLoading(false);
        }
    };

    const checkHoSoExists = async (phieuId: number) => {
        try {
            setCheckingHoSo(true);
            const response = await getHoSoByPhieuChuTruong(phieuId);
            const hoSoList = response.data.data;
            if (hoSoList.length > 0) {
                setHasHoSo(true);
                setHoSoId(hoSoList[0].id);
            } else {
                setHasHoSo(false);
                setHoSoId(null);
            }
        } catch {
            setHasHoSo(false);
            setHoSoId(null);
        } finally {
            setCheckingHoSo(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const renderNguonNhanSu = (val: number) =>
        val === 1 ? "Tại chỗ (trong quy hoạch)" : "Điều động từ nơi khác";

    const renderTrangThai = (tt: number) => {
        if (tt === 1) return <Tag color="gold">Chờ duyệt</Tag>;
        if (tt === 2) return <Tag color="green">Đã duyệt</Tag>;
        return <Tag color="red">Từ chối</Tag>;
    };

    const handleApprove = async () => {
        if (!id) return;
        try {
            setSubmitting(true);
            await approvePhieuChuTruong(id);
            message.success("Duyệt phiếu thành công");
            fetchData();
            onSuccess();
        } catch {
            message.error("Thao tác thất bại");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async (values: { lyDoTuChoi: string }) => {
        if (!id) return;
        try {
            setSubmitting(true);
            await rejectPhieuChuTruong(id, values.lyDoTuChoi);
            message.success("Đã từ chối!");
            setRejectModalVisible(false);
            rejectForm.resetFields();
            fetchData();
            onSuccess();
        } catch {
            message.error("Thao tác thất bại");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateHoSo = async () => {
        if (!id) return;
        try {
            setSubmitting(true);
            const response = await createHoSo({ phieuChuTruongId: id });
            message.success("Tạo hồ sơ bổ nhiệm thành công");
            const hoSoId = response.data.data.id;
            onClose();
            navigate(`/ho-so-bo-nhiem/${hoSoId}`);
        } catch (err: any) {
            message.error(err?.response?.data?.message || "Không thể tạo hồ sơ");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Modal
                title="Chi tiết tờ trình xin chủ trương"
                open={!!id}
                onCancel={onClose}
                width={700}
                footer={[
                    data?.trangThai === 1 && (
                        <Button key="reject" danger onClick={() => setRejectModalVisible(true)} disabled={submitting} >
                            Từ chối
                        </Button>
                    ),
                    data?.trangThai === 1 && (
                        <Button key="approve" type="primary" loading={submitting} onClick={handleApprove} >
                            Duyệt
                        </Button>
                    ),
                    data?.trangThai === 2 && data?.nguonNhanSu === 2 && (
                        !hasHoSo ? (
                            <Button key="create-ho-so" type="primary" loading={submitting || checkingHoSo} onClick={handleCreateHoSo}>
                                Lập Hồ Sơ Bổ Nhiệm
                            </Button>
                        ) : (
                            <Button key="view-ho-so" type="primary" onClick={() => {
                                if (hoSoId) {
                                    onClose();
                                    navigate(`/ho-so-bo-nhiem/${hoSoId}`);
                                }
                            }}>
                                Xem Hồ Sơ Bổ Nhiệm
                            </Button>
                        )
                    ),
                    <Button key="close" onClick={onClose}>
                        Đóng
                    </Button>,
                ]}
            >
                <Spin spinning={loading}>
                    {data && (
                        <Descriptions bordered column={2} size="small" className="mt-4">
                            <Descriptions.Item label="Số tờ trình" span={2}>
                                <span className="font-bold">{data.soToTrinhChuTruong}</span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                {renderTrangThai(data.trangThai)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày lập">
                                {dayjs(data.ngayLap).format("DD/MM/YYYY")}
                            </Descriptions.Item>
                            <Descriptions.Item label="Chức danh">
                                {data.tenChucDanh}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số lượng">
                                {data.soLuongDeXuat}
                            </Descriptions.Item>
                            <Descriptions.Item label="Nguồn nhân sự" span={2}>
                                {renderNguonNhanSu(data.nguonNhanSu)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tiêu đề" span={2}>
                                {data.tieuDe}
                            </Descriptions.Item>
                            <Descriptions.Item label="Lý do đề xuất" span={2}>
                                <div className="whitespace-pre-wrap">{data.lyDoDeXuat}</div>
                            </Descriptions.Item>
                            {data.lyDoTuChoi && (
                                <Descriptions.Item label="Lý do từ chối" span={2}>
                                    <span className="text-red-500 italic">
                                        {data.lyDoTuChoi}
                                    </span>
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    )}
                </Spin>
            </Modal>

            <Modal title="Nhập lý do từ chối" 
                open={rejectModalVisible}
                onCancel={() => {
                    setRejectModalVisible(false);
                    rejectForm.resetFields();
                }}
                onOk={() => rejectForm.submit()}
                okText="Xác nhận từ chối"
                okButtonProps={{ danger: true, loading: submitting }}
                cancelText="Hủy"
            >
                <Form form={rejectForm} onFinish={handleReject} layout="vertical">
                    <Form.Item
                        name="lyDoTuChoi"
                        label="Lý do từ chối"
                        rules={[{ required: true, message: "Vui lòng nhập lý do từ chối" }]}
                    >
                        <Input.TextArea rows={4} placeholder="Nhập lý do từ chối..." />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};
export default DetailPhieuChuTruongModal;