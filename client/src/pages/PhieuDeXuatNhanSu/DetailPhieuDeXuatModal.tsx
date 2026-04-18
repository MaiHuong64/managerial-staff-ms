import { Button, Descriptions, Form, Input, message, Modal, Select, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { useAuth } from "../../hook/useAuth";
import { approvePhieuDeXuatNhanSu, getPhieuDeXuatNhanSuById, guiPhieuDeXuatNhanSu, rejectPhieuDeXuatNhanSu} from "../../api/phieuDeXuat.api";
import { DU_DIEU_KIEN, TRANG_THAI_PHIEU_DE_XUAT, type PhieuDeXuatNhanSuChiTiet } from "../../types/PhieuDeXuatNhanSu";
import dayjs from "dayjs";
import { getDotQuyHoachList } from "../../api/dotQuyHoach.api";
import type { DotQuyHoach } from "../../types/QuyHoach";

interface Props {
    id: number | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const DetailPhieuDeXuatModal: React.FC<Props> = ({ id, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [data, setData] = useState<PhieuDeXuatNhanSuChiTiet | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [approveModal, setApproveModal] = useState(false);
    const [dotQHList, setDotQHList] = useState<DotQuyHoach[]>([]);
    const [approveForm] = Form.useForm();

    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectForm] = Form.useForm();

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        getPhieuDeXuatNhanSuById(id)
            .then(res => setData(res.data.data))
            .catch(() => message.error("Không thể tải chi tiết phiếu"))
            .finally(() => setLoading(false));
    }, [id]);

    // Load danh sách đợt quy hoạch khi mở approve modal
    const handleOpenApprove = async () => {
        try {
            const res = await getDotQuyHoachList();
            setDotQHList(res.data?.data ?? []);
        } catch {
            message.error("Không thể tải danh sách đợt quy hoạch");
            return;
        }
        approveForm.resetFields();
        setApproveModal(true);
    };

    const handleApprove = async () => {
        console.log("=== handleApprove bắt đầu ==="); // đặt ngay đầu hàm
        if (!id) return;
        try {
            const values = await approveForm.validateFields();
            console.log("Payload gửi lên:", { id, dotQuyHoachId: values.dotQuyHoachId });
            setSubmitting(true);
            await approvePhieuDeXuatNhanSu(id, values.dotQuyHoachId);
            message.success("Đã duyệt phiếu và thêm nhân sự vào đợt quy hoạch");
            setApproveModal(false);
            onSuccess();
        } catch (error: any) {
            if (error.errorFields) return;
            message.error(error?.response?.data?.message || "Duyệt phiếu thất bại");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!id) return;
        try {
            const values = await rejectForm.validateFields();
            setSubmitting(true);
            await rejectPhieuDeXuatNhanSu(id, values.ghiChu);
            message.success("Đã từ chối phiếu đề xuất");
            setRejectModalVisible(false);
            onSuccess();
        } catch (error: any) {
            if (error.errorFields) return;
            message.error(error?.response?.data?.message || "Từ chối phiếu thất bại");
        } finally {
            setSubmitting(false);
        }
    };

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

    const trangThai = data ? TRANG_THAI_PHIEU_DE_XUAT[data.trangThai] : null;
    const guiPhieu = data?.trangThai === -1 && user?.vaiTro === 'VCQL';
    const duyetPhieu = data?.trangThai === 0 && user?.vaiTro === 'PTCCT';

    const nhanSuColumns = [
        { title: "Họ và tên", dataIndex: "hoVaTen" },
        {
            title: "Điều kiện",
            dataIndex: "duDieuKien",
            render: (val: number) => {
                const dk = DU_DIEU_KIEN[val];
                return <Tag color={dk?.color}>{dk?.label}</Tag>;
            }
        },
        { title: "Ghi chú", dataIndex: "ghiChu", render: (val: string) => val || "—" },
    ];

    return (
        <>
            <Modal
                title="Chi tiết phiếu đề xuất nhân sự"
                open={!!id}
                onCancel={onClose}
                width={800}
                style={{ top: 20 }}
                loading={loading}
                footer={[
                    <Button key="close" onClick={onClose}>Đóng</Button>,
                    guiPhieu && (
                        <Button key="gui" type="primary" loading={submitting} onClick={handleGui}>Gửi cho PTCCT</Button>
                    ),
                    duyetPhieu && (
                        <Button key="reject" danger onClick={() => { rejectForm.resetFields(); setRejectModalVisible(true); }}>Từ chối</Button>
                    ),
                    duyetPhieu && (
                        <Button key="approve" type="primary" onClick={handleOpenApprove}>Duyệt</Button>
                    ),
                ]}
            >
                {data && (
                    <>
                        <Descriptions bordered size="small" column={2} className="mb-4">
                            <Descriptions.Item label="Mã phiếu">{data.maPhieuDeXuat}</Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={trangThai?.color}>{trangThai?.label}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tiêu đề" span={2}>{data.tieuDe}</Descriptions.Item>
                            <Descriptions.Item label="Chức danh">{data.tenChucDanh}</Descriptions.Item>
                            <Descriptions.Item label="Số lượng đề xuất">{data.soLuongDeXuat}</Descriptions.Item>
                            <Descriptions.Item label="Đơn vị">{data.tenDonVi}</Descriptions.Item>
                            <Descriptions.Item label="Người lập">{data.nguoiLap}</Descriptions.Item>
                            <Descriptions.Item label="Ngày lập">
                                {dayjs(data.ngayLap).format("DD/MM/YYYY")}
                            </Descriptions.Item>
                            {data.ngayPheDuyet && (
                                <Descriptions.Item label="Ngày phê duyệt">
                                    {dayjs(data.ngayPheDuyet).format("DD/MM/YYYY")}
                                </Descriptions.Item>
                            )}
                            {data.noiDung && (
                                <Descriptions.Item label="Nội dung" span={2}>{data.noiDung}</Descriptions.Item>
                            )}
                            {data.ghiChu && (
                                <Descriptions.Item label="Ghi chú PTCCT" span={2}>
                                    <span className="text-red-500">{data.ghiChu}</span>
                                </Descriptions.Item>
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

            {/* Modal duyệt — chọn đợt quy hoạch */}
            <Modal
                title="Duyệt phiếu đề xuất"
                open={approveModal}
                onCancel={() => setApproveModal(false)}
                onOk={handleApprove}
                okText="Xác nhận duyệt"
                cancelText="Hủy"
                confirmLoading={submitting}
                width={480}
            >
                <p className="text-slate-600 mb-4">
                    Chọn đợt quy hoạch để thêm <strong>{data?.nhanSu.length ?? 0} viên chức</strong> vào danh sách ứng viên.
                </p>
                <Form form={approveForm} layout="vertical">
                    <Form.Item
                        name="dotQuyHoachId"
                        label="Đợt quy hoạch"
                        rules={[{ required: true, message: "Vui lòng chọn đợt quy hoạch" }]}
                    >
                        <Select
                            placeholder="Chọn đợt quy hoạch..."
                            showSearch
                            optionFilterProp="label"
                            options={dotQHList.map(d => ({
                                value: d.id,
                                label: `${d.tenQuyHoach} — ${d.namThucHien}`,
                            }))}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal từ chối — nhập ghi chú */}
            <Modal
                title="Từ chối phiếu đề xuất"
                open={rejectModalVisible}
                onCancel={() => setRejectModalVisible(false)}
                onOk={handleReject}
                okText="Xác nhận từ chối"
                okButtonProps={{ danger: true }}
                cancelText="Hủy"
                confirmLoading={submitting}
                width={480}
            >
                <Form form={rejectForm} layout="vertical">
                    <Form.Item
                        name="ghiChu"
                        label="Lý do từ chối"
                        rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
                    >
                        <Input.TextArea rows={4} placeholder="Nhập lý do từ chối..." />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default DetailPhieuDeXuatModal;
