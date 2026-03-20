import { DatePicker, Form, Input, InputNumber, message, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import axiosClient from "../../utils/AxiosClient";

interface Props {
    isVisible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

export const CreatePhieuChuTruongModal: React.FC<Props> = ({ isVisible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [chucDanhList, setChucDanhList] = useState<{id: number, ten_chuc_danh: string}[]>([]);
    const [donViList, setDonViList]       = useState<{id: number, ten_don_vi: string}[]>([]);

    // Load danh mục khi mở modal
    useEffect(() => {
        if (!isVisible) return;
        form.resetFields();
        Promise.all([
            axiosClient.get("/chuc-danh"),
            axiosClient.get("/don-vi"),
        ]).then(([cd, dv]) => {
            setChucDanhList(cd.data.data);
            setDonViList(dv.data.data);
        });
    }, [isVisible]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            await axiosClient.post("/phieu-chu-truong", {
                ...values,
                ngay_lap: values.ngay_lap.format("YYYY-MM-DD"),
            });
            message.success("Tạo phiếu chủ trương thành công!");
            onSuccess();
        } catch (error: any) {
            const serverErrors = error?.response?.data?.errors;
            if (serverErrors?.length)
                serverErrors.forEach((e: string) => message.error(e));
            else
                message.error("Lỗi khi tạo phiếu chủ trương");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Lập phiếu xin chủ trương bổ nhiệm"
            open={isVisible}
            onOk={handleSubmit}
            onCancel={onCancel}
            confirmLoading={loading}
            okText="Gửi phiếu"
            cancelText="Hủy"
            width={700}
            style={{ top: 20 }}
        >
            <Form form={form} layout="vertical">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <Form.Item label="Số văn bản" name="so_van_ban"
                        rules={[{ required: true, message: "Nhập số văn bản!" }]}>
                        <Input placeholder="VD: 12/TTr-ĐHCT" />
                    </Form.Item>

                    <Form.Item label="Ngày lập" name="ngay_lap"
                        rules={[{ required: true, message: "Chọn ngày lập!" }]}>
                        <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                    </Form.Item>

                    <Form.Item label="Chức danh cần bổ nhiệm" name="chuc_danh_id"
                        rules={[{ required: true, message: "Chọn chức danh!" }]}>
                        <Select placeholder="Chọn chức danh" showSearch
                            optionFilterProp="children">
                            {chucDanhList.map(cd => (
                                <Select.Option key={cd.id} value={cd.id}>{cd.ten_chuc_danh}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Đơn vị" name="don_vi_id"
                        rules={[{ required: true, message: "Chọn đơn vị!" }]}>
                        <Select placeholder="Chọn đơn vị" showSearch
                            optionFilterProp="children">
                            {donViList.map(dv => (
                                <Select.Option key={dv.id} value={dv.id}>{dv.ten_don_vi}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Số lượng cần bổ nhiệm" name="so_luong_de_xuat"
                        rules={[{ required: true, message: "Nhập số lượng!" }]}>
                        <InputNumber min={1} style={{ width: "100%" }} placeholder="VD: 2" />
                    </Form.Item>

                    <Form.Item label="Nguồn nhân sự" name="nguon_nhan_su"
                        rules={[{ required: true, message: "Chọn nguồn nhân sự!" }]}>
                        <Select placeholder="Chọn nguồn">
                            <Select.Option value="tai_cho">Tại chỗ (trong quy hoạch)</Select.Option>
                            <Select.Option value="noi_khac">Điều động từ nơi khác</Select.Option>
                            <Select.Option value="ca_hai">Cả hai nguồn</Select.Option>
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item label="Sự cần thiết và mục đích bổ nhiệm" name="su_can_thiet"
                    rules={[{ required: true, message: "Nêu rõ sự cần thiết!" },
                            { min: 10, message: "Cần ít nhất 10 ký tự" }]}>
                    <Input.TextArea rows={4}
                        placeholder="Nêu rõ lý do, mục đích và sự cần thiết phải bổ nhiệm vị trí này..." />
                </Form.Item>

                <Form.Item label="Dự kiến phân công công tác" name="du_kien_phan_cong"
                    rules={[{ required: true, message: "Nêu dự kiến phân công!" },
                            { min: 10, message: "Cần ít nhất 10 ký tự" }]}>
                    <Input.TextArea rows={4}
                        placeholder="Mô tả chức trách, nhiệm vụ cụ thể sẽ giao cho nhân sự sau bổ nhiệm..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};