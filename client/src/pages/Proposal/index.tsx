import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, Descriptions, Empty, Form, Input, message, Select, Space, Spin, Typography, DatePicker } from "antd";
import { CheckCircleFilled, SaveOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import axiosClient from "../../utils/AxiosClient";
import type { DotBoNhiem } from "../../types/BoNhiem";
import type { ThongTinUngVienDat } from "../../types/PhuongAnNhanSu";
// (Lưu ý: Nếu TaoPhuongAn type báo lỗi thiếu ten_phuong_an, bạn có thể comment tạm hoặc cập nhật lại type nhé)

const { Title } = Typography;

const LOAI_PHUONG_AN = [
    { value: "Bổ nhiệm",        label: "Bổ nhiệm chức vụ" },
    { value: "Bổ nhiệm lại",    label: "Bổ nhiệm lại chức vụ" },
    { value: "Thôi chức vụ",    label: "Thôi giữ chức vụ" },
    { value: "Thôi kiêm nhiệm", label: "Thôi kiêm nhiệm chức vụ" },
];

export const PlanningProposalPage: React.FC = () => {
    const [form] = Form.useForm();

    const [batches,          setBatches]          = useState<DotBoNhiem[]>([]);
    const [selectedBatch,    setSelectedBatch]    = useState<DotBoNhiem | null>(null);
    const [candidate,        setCandidate]        = useState<ThongTinUngVienDat | null>(null);
    const [loaiPhuongAn,     setLoaiPhuongAn]     = useState<string>("Bổ nhiệm");
    
    const [loadingBatches,   setLoadingBatches]   = useState(false);
    const [loadingCandidate, setLoadingCandidate] = useState(false);
    const [saving,           setSaving]           = useState(false);

    const fetchCompletedBatches = useCallback(async () => {
        try {
            setLoadingBatches(true);
            const res = await axiosClient.get("/appointments");
            if (res.data.success) {
                const completed = res.data.data
                    .map((item: DotBoNhiem) => ({ ...item, trang_thai: Number(item.trang_thai) }))
                    .filter((item: DotBoNhiem) => item.trang_thai === 6);
                setBatches(completed);
            }
        } catch {
            message.error("Không thể tải danh sách đợt bổ nhiệm");
        } finally {
            setLoadingBatches(false);
        }
    }, []);

    const fetchPassedCandidate = useCallback(async (batchId: number) => {
        try {
            setLoadingCandidate(true);
            const res = await axiosClient.get(`/appointments/${batchId}`);
            if (res.data.data) {
                const passed = res.data.data.candidates.find(
                    (c: ThongTinUngVienDat) => Number(c.trang_thai) === 3
                );
                setCandidate(passed ?? null);
            }
        } catch {
            message.error("Không thể tải ứng viên bổ nhiệm");
        } finally {
            setLoadingCandidate(false);
        }
    }, []);

    useEffect(() => { fetchCompletedBatches(); }, [fetchCompletedBatches]);

    const handleSelectBatch = (batchId: number) => {
        const batch = batches.find(b => b.id === batchId) ?? null;
        setSelectedBatch(batch);
        setCandidate(null);
        setLoaiPhuongAn("Bổ nhiệm");
        if (batch) {
            form.setFieldsValue({
                ten_phuong_an: `Phương án bổ nhiệm ${batch.ten_chuc_danh} - ${batch.ten_don_vi}`,
                so_to_trinh: undefined,
                ngay_to_trinh: undefined,
                ghi_chu: "",
            });
            fetchPassedCandidate(batchId);
        }
    };

    const handleSave = async () => {
        if (!selectedBatch) return message.warning("Vui lòng chọn đợt bổ nhiệm");
        if (!candidate)     return message.warning("Không có ứng viên đạt");

        try { await form.validateFields(); } catch { return; }

        const values = form.getFieldsValue();

        try {
            setSaving(true);
            
            // Đã đồng bộ payload khớp với form và backend
            const payload = {
                ten_phuong_an: values.ten_phuong_an,
                so_to_trinh:   values.so_to_trinh,
                // Định dạng ngày thành chuỗi YYYY-MM-DD để gửi xuống backend
                ngay_to_trinh: values.ngay_to_trinh ? values.ngay_to_trinh.format('YYYY-MM-DD') : null,
                ghi_chu:       values.ghi_chu || "",
                danh_sach_ung_vien: [{
                    chi_tiet_bn_id: candidate.chi_tiet_bn_id,
                    loai_phuong_an: loaiPhuongAn,
                    ghi_chu:        candidate.ghi_chu || "",
                }],
            };
            console.log("PAYLOAD GỬI ĐI:", payload);

            const response = await axiosClient.post(`/appointments/${selectedBatch.id}/personnel-plans`, payload);
            
            // KẸP LOG SỐ 2: Xem Backend trả về chữ "Thành công" hay không
            console.log("KẾT QUẢ THÀNH CÔNG:", response.data);

            await axiosClient.post(`/appointments/${selectedBatch.id}/personnel-plans`, payload);
            message.success("Lưu phương án nhân sự thành công!");

            form.resetFields();
            setSelectedBatch(null);
            setCandidate(null);

        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || "Lỗi khi lưu phương án");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">

                <div className="text-center">
                    <Title level={2} className="uppercase text-gray-900 m-0">
                        Lập phương án nhân sự
                    </Title>
                </div>

                <Card title="Chọn đợt bổ nhiệm">
                    <div className="max-w-xl">
                        <div className="mb-2">Các đợt bổ nhiệm đã hoàn thành bỏ phiếu</div>
                        <Select
                            className="w-full"
                            placeholder="-- Chọn đợt bổ nhiệm --"
                            loading={loadingBatches}
                            onChange={handleSelectBatch}
                            size="large"
                            showSearch
                            optionFilterProp="label"
                            options={batches.map(b => ({
                                value: b.id,
                                label: `[${b.ma_dot_bo_nhiem}] ${b.ten_dot_bo_nhiem}`,
                            }))}
                            notFoundContent={
                                <Empty description="Không có đợt nào đã hoàn thành" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            }
                        />
                        {selectedBatch && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-100 flex flex-wrap gap-x-8 gap-y-2">
                                <span><strong>Mã đợt:</strong> {selectedBatch.ma_dot_bo_nhiem}</span>
                                <span><strong>Chức danh:</strong> {selectedBatch.ten_chuc_danh}</span>
                                <span><strong>Đơn vị:</strong> {selectedBatch.ten_don_vi}</span>
                            </div>
                        )}
                    </div>
                </Card>

                <Card
                    title={
                        selectedBatch && candidate
                            ? <span className="text-green-600 flex items-center gap-2"><CheckCircleFilled /> Ứng viên đạt</span>
                            : "Thông tin ứng viên được đề xuất"
                    }
                    extra={
                        candidate && (
                            <Space>
                                <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
                                    Lưu PA
                                </Button>
                            </Space>
                        )
                    }
                >
                    {!selectedBatch ? (
                        <div className="py-10">
                            <Empty description="Vui lòng chọn đợt bổ nhiệm để xem thông tin" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        </div>
                    ) : loadingCandidate ? (
                        <div className="flex justify-center py-10"><Spin tip="Đang tải..." /></div>
                    ) : !candidate ? (
                        <Empty description="Không có ứng viên đạt trong đợt này" />
                    ) : (
                        <div className="space-y-6">
                            <Descriptions
                                bordered size="small"
                                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                                styles={{ label: { width: 150, fontWeight: "bold", background: "#f9fafb" } }}
                            >
                                <Descriptions.Item label="Mã VC">{candidate.ma_vien_chuc}</Descriptions.Item>
                                <Descriptions.Item label="Họ tên">{candidate.ho_va_ten}</Descriptions.Item>
                                <Descriptions.Item label="Ngày sinh">{candidate.ngay_sinh}</Descriptions.Item>
                                <Descriptions.Item label="Giới tính">{candidate.gioi_tinh === 1 ? "Nam" : "Nữ"}</Descriptions.Item>
                                <Descriptions.Item label="Đơn vị">{candidate.ten_don_vi}</Descriptions.Item>
                                <Descriptions.Item label="Dân tộc">{candidate.dan_toc}</Descriptions.Item>
                                <Descriptions.Item label="Chức vụ">{candidate.ten_chuc_danh}</Descriptions.Item>
                                <Descriptions.Item label="Ngạch">{candidate.ngach}</Descriptions.Item>
                                <Descriptions.Item label="Ngày CT">{candidate.ngay_chinh_thuc}</Descriptions.Item>
                                <Descriptions.Item label="Trình độ CM">{candidate.trinh_do_chuyen_mon}</Descriptions.Item>
                                <Descriptions.Item label="LLCT">{candidate.trinh_do_ly_luan_CT}</Descriptions.Item>
                                <Descriptions.Item label="Ngoại ngữ">{candidate.trinh_do_ngoai_ngu}</Descriptions.Item>
                                <Descriptions.Item label="Tin học">{candidate.trinh_do_tin_hoc}</Descriptions.Item>
                                <Descriptions.Item label="Loại phương án">
                                    <Select
                                        value={loaiPhuongAn}
                                        options={LOAI_PHUONG_AN}
                                        style={{ width: "100%" }}
                                        onChange={setLoaiPhuongAn}
                                    />
                                </Descriptions.Item>
                            </Descriptions>

                            <Form form={form} layout="vertical" className="pt-4 border-t border-gray-200">
                                <Form.Item
                                    name="ten_phuong_an"
                                    label="Tên phương án"
                                    rules={[{ required: true, message: "Vui lòng nhập tên phương án!" }]}
                                >
                                    <Input size="large" placeholder="Nhập tên phương án bổ nhiệm" />
                                </Form.Item>
                                
                                {/* Thêm 2 trường Số tờ trình và Ngày tờ trình */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Form.Item
                                        name="so_to_trinh"
                                        label="Số tờ trình"
                                        rules={[{ required: true, message: "Vui lòng nhập số tờ trình!" }]}
                                    >
                                        <Input placeholder="Ví dụ: 123/TTr-ĐU" />
                                    </Form.Item>

                                    <Form.Item
                                        name="ngay_to_trinh"
                                        label="Ngày tờ trình"
                                        rules={[{ required: true, message: "Vui lòng chọn ngày tờ trình!" }]}
                                    >
                                        <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày" />
                                    </Form.Item>
                                </div>

                                <Form.Item name="ghi_chu" label="Ghi chú">
                                    <TextArea rows={3} placeholder="Ghi chú thêm (nếu có)..." />
                                </Form.Item>
                            </Form>
                        </div>
                    )}
                </Card>

            </div>
        </div>
    );
};

export default PlanningProposalPage;